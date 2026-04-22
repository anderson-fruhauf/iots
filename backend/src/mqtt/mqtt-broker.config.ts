import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export function mqttBrokerUrl(): string {
  return process.env.MQTT_URL ?? 'mqtt://127.0.0.1:1883';
}

export function mqttMicroserviceOptions(): MicroserviceOptions {
  return {
    transport: Transport.MQTT,
    options: {
      url: mqttBrokerUrl(),
      subscribeOptions: { qos: 0 },
    },
  };
}
