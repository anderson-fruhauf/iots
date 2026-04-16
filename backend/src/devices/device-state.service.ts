import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import mqtt from 'mqtt';
import { Repository } from 'typeorm';
import { DeviceState } from './device-state.entity';

/** Canal MQTT/JSON para a iluminação — outros canais podem ser adicionados no futuro. */
export const LAMP_CHANNEL = 'lamp';

@Injectable()
export class DeviceStateService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DeviceStateService.name);
  private mqttPub: mqtt.MqttClient | null = null;

  constructor(
    @InjectRepository(DeviceState)
    private readonly stateRepo: Repository<DeviceState>,
  ) {}

  onModuleInit(): void {
    const url = process.env.MQTT_URL ?? 'mqtt://127.0.0.1:1883';
    this.mqttPub = mqtt.connect(url);
    this.mqttPub.on('error', (err) => {
      this.logger.warn(`MQTT (publish): ${err.message}`);
    });
  }

  onModuleDestroy(): void {
    this.mqttPub?.end(true);
    this.mqttPub = null;
  }

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
    const rawId = this.extractDeviceIdFromStateTopic(topic);
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
    if (!this.mqttPub) {
      throw new BadRequestException('Cliente MQTT indisponível.');
    }
    const topic = `iots/device/${id}/command`;
    const payload = JSON.stringify({ lamp: on });
    await new Promise<void>((resolve, reject) => {
      this.mqttPub!.publish(topic, payload, { qos: 0 }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    await this.stateRepo.save({
      deviceId: id,
      channel: LAMP_CHANNEL,
      active: on,
      updatedAt: new Date(),
    });
    this.logger.debug(`Comando ${LAMP_CHANNEL} ${id}: ${on}`);
  }

  /** Alinha com o firmware (MAC em hex maiúsculo nos tópicos MQTT). */
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
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
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

  private extractDeviceIdFromStateTopic(topic: string): string | null {
    const parts = topic.split('/');
    if (
      parts.length >= 4 &&
      parts[0] === 'iots' &&
      parts[1] === 'device' &&
      parts[3] === 'state'
    ) {
      return parts[2] ?? null;
    }
    return null;
  }
}
