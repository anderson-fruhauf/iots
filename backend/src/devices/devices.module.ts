import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttModule } from '../mqtt/mqtt.module';
import { DeviceState } from './device-state.entity';
import { DeviceStateService } from './device-state.service';
import { DevicesHttpController } from './devices-http.controller';
import { DevicesMqttController } from './devices-mqtt.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceState]), MqttModule],
  controllers: [DevicesHttpController, DevicesMqttController],
  providers: [DeviceStateService],
  exports: [DeviceStateService],
})
export class DevicesModule {}
