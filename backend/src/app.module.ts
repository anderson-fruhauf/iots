import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { TelemetryEvent } from './telemetry/telemetry-event.entity';
import { TelemetryModule } from './telemetry/telemetry.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
      entities: [TelemetryEvent],
      synchronize: process.env.DATABASE_SYNC === 'true',
    }),
    TelemetryModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
