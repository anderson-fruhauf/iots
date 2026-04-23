import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { extractDeviceIdFromDeviceTopic } from '../mqtt/mqtt.constants';
import { DeviceIrrigation } from './device-irrigation.entity';

const MAX_ROWS = 100;

@Injectable()
export class IrrigationService {
  private readonly logger = new Logger(IrrigationService.name);

  constructor(
    @InjectRepository(DeviceIrrigation)
    private readonly repo: Repository<DeviceIrrigation>,
  ) {}

  listByDeviceId(deviceId: string, limit: number = MAX_ROWS): Promise<DeviceIrrigation[]> {
    const id = this.normalizeDeviceId(deviceId);
    const take = Math.min(Math.max(1, limit), MAX_ROWS);
    return this.repo.find({
      where: { deviceId: id },
      order: { createdAt: 'DESC' },
      take,
    });
  }

  async ingestFromMqtt(topic: string, data: unknown): Promise<void> {
    const payload = this.normalizePayload(data);
    const fromTopic = extractDeviceIdFromDeviceTopic(topic, 'irrigation');
    const fromPayload =
      typeof payload.deviceId === 'string' && payload.deviceId.length > 0
        ? this.normalizeDeviceId(payload.deviceId)
        : null;
    const deviceId = fromPayload ?? (fromTopic ? this.normalizeDeviceId(fromTopic) : null);
    if (!deviceId) {
      this.logger.warn(`Irrigação sem deviceId (topic=${topic})`);
      return;
    }
    const durationMs = this.toPositiveInt(payload.durationMs);
    if (durationMs === null || durationMs <= 0) {
      this.logger.warn('Payload de irrigação inválido (durationMs).');
      return;
    }
    await this.repo.insert({
      deviceId,
      durationMs,
    });
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

  private toPositiveInt(value: unknown): number | null {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return Math.round(value);
    }
    if (typeof value === 'string') {
      const n = parseInt(value, 10);
      return Number.isNaN(n) ? null : n;
    }
    return null;
  }
}
