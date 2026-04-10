import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'Defina DATABASE_URL no ambiente (ex.: arquivo .env na raiz do backend).',
    );
  }

  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: process.env.MQTT_URL ?? 'mqtt://127.0.0.1:1883',
      subscribeOptions: { qos: 0 },
    },
  });
  await app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
