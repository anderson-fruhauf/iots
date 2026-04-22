import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { extractDeviceIdFromDeviceTopic } from '../mqtt/mqtt.constants';
import { DeviceSoil } from './device-soil.entity';

@Injectable()
export class SoilService {
  private readonly logger = new Logger(SoilService.name);

  constructor(
    @InjectRepository(DeviceSoil)
    private readonly repo: Repository<DeviceSoil>,
  ) {}

  findAll(): Promise<DeviceSoil[]> {
    return this.repo.find({ order: { deviceId: 'ASC' } });
  }

  async getByDeviceIdOrThrow(deviceId: string): Promise<DeviceSoil> {
    const id = this.normalizeDeviceId(deviceId);
    const row = await this.repo.findOne({ where: { deviceId: id } });
    if (!row) {
      throw new NotFoundException('Dados de solo não encontrados.');
    }
    return row;
  }

  async ingestFromMqtt(topic: string, data: unknown): Promise<void> {
    const payload = this.normalizePayload(data);
    const fromTopic = extractDeviceIdFromDeviceTopic(topic, 'soil');
    const fromPayload =
      typeof payload.deviceId === 'string' && payload.deviceId.length > 0
        ? this.normalizeDeviceId(payload.deviceId)
        : null;
    const deviceId = fromPayload ?? (fromTopic ? this.normalizeDeviceId(fromTopic) : null);
    if (!deviceId) {
      this.logger.warn(`Solo sem deviceId (topic=${topic})`);
      return;
    }
    const soilRaw = this.toInt(payload.soilRaw);
    const wetPercent = this.toInt(payload.wetPercent);
    if (soilRaw === null || wetPercent === null) {
      this.logger.warn('Payload de solo inválido (soilRaw/wetPercent).');
      return;
    }
    await this.repo.save({
      deviceId,
      soilRaw,
      wetPercent: Math.max(0, Math.min(100, wetPercent)),
      updatedAt: new Date(),
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

  private toInt(value: unknown): number | null {
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
