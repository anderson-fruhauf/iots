import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import mqtt, { type IClientPublishOptions, type MqttClient } from 'mqtt';

import { mqttBrokerUrl } from './mqtt-broker.config';

@Injectable()
export class MqttPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttPublisherService.name);
  private client: MqttClient | null = null;

  onModuleInit(): void {
    this.client = mqtt.connect(mqttBrokerUrl());
    this.client.on('error', (err) => {
      this.logger.warn(`MQTT (publicação): ${err.message}`);
    });
  }

  onModuleDestroy(): void {
    this.client?.end(true);
    this.client = null;
  }

  async publishJson(
    topic: string,
    payload: Record<string, unknown>,
    options?: IClientPublishOptions,
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Cliente MQTT de publicação indisponível.');
    }
    const body = JSON.stringify(payload);
    const opts: IClientPublishOptions = { qos: 0, ...options };
    await new Promise<void>((resolve, reject) => {
      this.client!.publish(topic, body, opts, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
