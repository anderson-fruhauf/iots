import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryReading } from './telemetry-reading.entity';
import { TelemetryHttpController } from './telemetry-http.controller';
import { TelemetryMqttController } from './telemetry-mqtt.controller';
import { TelemetryService } from './telemetry.service';

@Module({
  imports: [TypeOrmModule.forFeature([TelemetryReading])],
  controllers: [TelemetryMqttController, TelemetryHttpController],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
