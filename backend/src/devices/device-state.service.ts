import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  deviceCommandTopic,
  extractDeviceIdFromDeviceTopic,
} from '../mqtt/mqtt.constants';
import { MqttPublisherService } from '../mqtt/mqtt-publisher.service';
import { DeviceState } from './device-state.entity';

export const LAMP_CHANNEL = 'lamp';
export const LAMP_RGB_CHANNEL = 'lamp_rgb';

@Injectable()
export class DeviceStateService {
  private readonly logger = new Logger(DeviceStateService.name);

  constructor(
    @InjectRepository(DeviceState)
    private readonly stateRepo: Repository<DeviceState>,
    private readonly mqttPublisher: MqttPublisherService,
  ) {}

  async getLampState(
    deviceId: string,
  ): Promise<{ deviceId: string; lampOn: boolean | null }> {
    const id = this.normalizeDeviceId(deviceId);
    const row = await this.stateRepo.findOne({
      where: { deviceId: id, channel: LAMP_CHANNEL },
    });
    if (!row) {
      return { deviceId: id, lampOn: null };
    }
    return { deviceId: id, lampOn: row.active };
  }

  async getLampRgbState(
    deviceId: string,
  ): Promise<{
    deviceId: string;
    lampRgbOn: boolean | null;
    r: number | null;
    g: number | null;
    b: number | null;
  }> {
    const id = this.normalizeDeviceId(deviceId);
    const row = await this.stateRepo.findOne({
      where: { deviceId: id, channel: LAMP_RGB_CHANNEL },
    });
    if (!row) {
      return { deviceId: id, lampRgbOn: null, r: null, g: null, b: null };
    }
    return {
      deviceId: id,
      lampRgbOn: row.active,
      r: row.r,
      g: row.g,
      b: row.b,
    };
  }

  /**
   * Estado retransmitido no tópico `.../state` (firmware) — pode conter
   * `lamp`, `lampRgb` ou ambos; chaves ausentes não sobrescrevem o banco.
   */
  async ingestLampState(topic: string, data: unknown): Promise<void> {
    const rawId = extractDeviceIdFromDeviceTopic(topic, 'state');
    const deviceId = rawId ? this.normalizeDeviceId(rawId) : null;
    if (!deviceId) {
      this.logger.warn(`Estado sem deviceId (topic=${topic})`);
      return;
    }
    const payload = this.normalizePayload(data);
    const now = new Date();
    if (typeof payload.lamp === 'boolean') {
      await this.stateRepo.save({
        deviceId,
        channel: LAMP_CHANNEL,
        active: payload.lamp,
        r: null,
        g: null,
        b: null,
        updatedAt: now,
      });
      this.logger.debug(`Canal ${LAMP_CHANNEL} ${deviceId}: ${payload.lamp}`);
    }
    if (this.isLampRgbObject(payload.lampRgb)) {
      const c = this.clampColor(
        payload.lampRgb as unknown as {
          on: boolean;
          r: number;
          g: number;
          b: number;
        },
      );
      await this.stateRepo.save({
        deviceId,
        channel: LAMP_RGB_CHANNEL,
        active: c.on,
        r: c.r,
        g: c.g,
        b: c.b,
        updatedAt: now,
      });
      this.logger.debug(
        `Canal ${LAMP_RGB_CHANNEL} ${deviceId}: on=${c.on} rgb=${c.r},${c.g},${c.b}`,
      );
    }
  }

  async publishLampCommand(deviceId: string, on: boolean): Promise<void> {
    const id = this.normalizeDeviceId(deviceId);
    if (!/^[A-F0-9]{12}$/.test(id)) {
      throw new BadRequestException('deviceId inválido.');
    }
    try {
      await this.mqttPublisher.publishJson(deviceCommandTopic(id), {
        lamp: on,
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes('indisponível')) {
        throw new BadRequestException('Cliente MQTT indisponível.');
      }
      throw e;
    }
    await this.stateRepo.save({
      deviceId: id,
      channel: LAMP_CHANNEL,
      active: on,
      r: null,
      g: null,
      b: null,
      updatedAt: new Date(),
    });
    this.logger.debug(`Comando ${LAMP_CHANNEL} ${id}: ${on}`);
  }

  async publishLampRgbCommand(
    deviceId: string,
    body: { on: boolean; r: number; g: number; b: number },
  ): Promise<void> {
    const id = this.normalizeDeviceId(deviceId);
    if (!/^[A-F0-9]{12}$/.test(id)) {
      throw new BadRequestException('deviceId inválido.');
    }
    for (const key of ['r', 'g', 'b'] as const) {
      const n = body[key];
      if (!Number.isInteger(n) || n < 0 || n > 255) {
        throw new BadRequestException(
          `${key} deve ser inteiro entre 0 e 255.`,
        );
      }
    }
    if (typeof body.on !== 'boolean') {
      throw new BadRequestException('Campo "on" (boolean) é obrigatório.');
    }
    const payload: Record<string, unknown> = {
      lampRgb: {
        on: body.on,
        r: body.r,
        g: body.g,
        b: body.b,
      },
    };
    try {
      await this.mqttPublisher.publishJson(deviceCommandTopic(id), payload);
    } catch (e) {
      if (e instanceof Error && e.message.includes('indisponível')) {
        throw new BadRequestException('Cliente MQTT indisponível.');
      }
      throw e;
    }
    await this.stateRepo.save({
      deviceId: id,
      channel: LAMP_RGB_CHANNEL,
      active: body.on,
      r: body.r,
      g: body.g,
      b: body.b,
      updatedAt: new Date(),
    });
    this.logger.debug(
      `Comando ${LAMP_RGB_CHANNEL} ${id}: on=${body.on} rgb=${body.r},${body.g},${body.b}`,
    );
  }

  private isLampRgbObject(v: unknown): v is Record<string, unknown> {
    if (v === null || v === undefined || typeof v !== 'object') {
      return false;
    }
    const o = v as Record<string, unknown>;
    if (typeof o.on !== 'boolean') {
      return false;
    }
    return this.isColorComponent(o.r) && this.isColorComponent(o.g) && this.isColorComponent(o.b);
  }

  /** Aceita valores numéricos que após arredondar ficam em 0-255. */
  private isColorComponent(v: unknown): v is number {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      return false;
    }
    const t = Math.round(v);
    return t >= 0 && t <= 255;
  }

  private clampColor(
    v: { on: boolean; r: number; g: number; b: number },
  ): { on: boolean; r: number; g: number; b: number } {
    return {
      on: v.on,
      r: Math.max(0, Math.min(255, Math.trunc(v.r))),
      g: Math.max(0, Math.min(255, Math.trunc(v.g))),
      b: Math.max(0, Math.min(255, Math.trunc(v.b))),
    };
  }

  private normalizeDeviceId(deviceId: string): string {
    return deviceId.trim().toUpperCase();
  }

  private normalizePayload(data: unknown): Record<string, unknown> {
    if (data === null || data === undefined) {
      return {};
    }
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data) as unknown;
        return typeof parsed === 'object' &&
          parsed !== null &&
          !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : { raw: parsed };
      } catch {
        return { raw: data };
      }
    }
    if (typeof data === 'object' && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }
    return { value: data };
  }
}
