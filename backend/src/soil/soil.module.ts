import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceIrrigation } from './device-irrigation.entity';
import { DeviceSoil } from './device-soil.entity';
import { IrrigationMqttController } from './irrigation-mqtt.controller';
import { IrrigationService } from './irrigation.service';
import { SoilHttpController } from './soil-http.controller';
import { SoilMqttController } from './soil-mqtt.controller';
import { SoilService } from './soil.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceSoil, DeviceIrrigation])],
  controllers: [SoilMqttController, IrrigationMqttController, SoilHttpController],
  providers: [SoilService, IrrigationService],
  exports: [SoilService, IrrigationService],
})
export class SoilModule {}
