import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryEvent } from './telemetry-event.entity';
import { TelemetryHttpController } from './telemetry-http.controller';
import { TelemetryMqttController } from './telemetry-mqtt.controller';
import { TelemetryService } from './telemetry.service';

@Module({
  imports: [TypeOrmModule.forFeature([TelemetryEvent])],
  controllers: [TelemetryMqttController, TelemetryHttpController],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
