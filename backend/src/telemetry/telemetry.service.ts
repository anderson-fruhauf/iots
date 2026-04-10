import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelemetryEvent } from './telemetry-event.entity';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    @InjectRepository(TelemetryEvent)
    private readonly repo: Repository<TelemetryEvent>,
  ) {}

  async ingestFromMqtt(topic: string, data: unknown): Promise<TelemetryEvent> {
    const payload = this.normalizePayload(data);
    const deviceId =
      (typeof payload.deviceId === 'string' && payload.deviceId) ||
      this.extractDeviceIdFromTopic(topic);
    if (!deviceId) {
      this.logger.warn(`Telemetria sem deviceId (topic=${topic})`);
    }
    const temperature = this.toNumber(payload.temperature);
    const humidity = this.toNumber(payload.humidity);
    const unit = typeof payload.unit === 'string' ? payload.unit : null;

    const row = this.repo.create({
      deviceId: deviceId ?? 'unknown',
      temperature,
      humidity,
      unit,
      mqttTopic: topic,
      rawPayload: payload,
    });
    const saved = await this.repo.save(row);
    this.logger.debug(`Telemetria salva: ${saved.id} device=${saved.deviceId}`);
    return saved;
  }

  findRecent(limit = 50): Promise<TelemetryEvent[]> {
    return this.repo.find({
      order: { receivedAt: 'DESC' },
      take: Math.min(limit, 200),
    });
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

  private extractDeviceIdFromTopic(topic: string): string | null {
    const parts = topic.split('/');
    if (
      parts.length >= 4 &&
      parts[0] === 'iots' &&
      parts[1] === 'device' &&
      parts[3] === 'telemetry'
    ) {
      return parts[2] ?? null;
    }
    return null;
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const n = parseFloat(value);
      return Number.isNaN(n) ? null : n;
    }
    return null;
  }
}
