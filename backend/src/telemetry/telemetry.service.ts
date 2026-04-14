import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelemetryReading } from './telemetry-reading.entity';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    @InjectRepository(TelemetryReading)
    private readonly repo: Repository<TelemetryReading>,
  ) {}

  async ingestFromMqtt(topic: string, data: unknown): Promise<TelemetryReading> {
    const payload = this.normalizePayload(data);
    const deviceId =
      (typeof payload.deviceId === 'string' && payload.deviceId) ||
      this.extractDeviceIdFromTopic(topic);
    if (!deviceId) {
      this.logger.warn(`Telemetria sem deviceId (topic=${topic})`);
    }
    const temperature = this.toNumber(payload.temperature);
    const humidity = this.toNumber(payload.humidity);

    const row = this.repo.create({
      deviceId: deviceId ?? 'unknown',
      temperature,
      humidity,
      recordedAt: new Date(),
    });
    const saved = await this.repo.save(row);
    this.logger.debug(
      `Telemetria salva: device=${saved.deviceId} em ${saved.recordedAt.toISOString()}`,
    );
    return saved;
  }

  findRecent(limit = 50): Promise<TelemetryReading[]> {
    return this.repo.find({
      order: { recordedAt: 'DESC' },
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
