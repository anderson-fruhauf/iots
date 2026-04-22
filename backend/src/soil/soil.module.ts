import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSoil } from './device-soil.entity';
import { SoilHttpController } from './soil-http.controller';
import { SoilMqttController } from './soil-mqtt.controller';
import { SoilService } from './soil.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceSoil])],
  controllers: [SoilMqttController, SoilHttpController],
  providers: [SoilService],
  exports: [SoilService],
})
export class SoilModule {}
