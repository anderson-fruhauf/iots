import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceState } from './device-state.entity';
import { DeviceStateService } from './device-state.service';
import { DevicesHttpController } from './devices-http.controller';
import { DevicesMqttController } from './devices-mqtt.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceState])],
  controllers: [DevicesHttpController, DevicesMqttController],
  providers: [DeviceStateService],
  exports: [DeviceStateService],
})
export class DevicesModule {}
