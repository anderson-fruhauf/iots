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

  async ingestLampState(topic: string, data: unknown): Promise<void> {
    const rawId = extractDeviceIdFromDeviceTopic(topic, 'state');
    const deviceId = rawId ? this.normalizeDeviceId(rawId) : null;
    if (!deviceId) {
      this.logger.warn(`Estado sem deviceId (topic=${topic})`);
      return;
    }
    const payload = this.normalizePayload(data);
    const lamp = payload.lamp;
    if (typeof lamp !== 'boolean') {
      return;
    }
    const now = new Date();
    await this.stateRepo.save({
      deviceId,
      channel: LAMP_CHANNEL,
      active: lamp,
      updatedAt: now,
    });
    this.logger.debug(`Canal ${LAMP_CHANNEL} ${deviceId}: ${lamp}`);
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
      updatedAt: new Date(),
    });
    this.logger.debug(`Comando ${LAMP_CHANNEL} ${id}: ${on}`);
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
