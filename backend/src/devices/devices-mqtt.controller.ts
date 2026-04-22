import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MqttContext, Payload } from '@nestjs/microservices';
import { MQTT_PATTERN_DEVICE_STATE } from '../mqtt/mqtt.constants';
import { DeviceStateService } from './device-state.service';

@Controller()
export class DevicesMqttController {
  constructor(private readonly deviceStateService: DeviceStateService) {}

  @EventPattern(MQTT_PATTERN_DEVICE_STATE)
  async handleState(
    @Payload() data: unknown,
    @Ctx() context: MqttContext,
  ): Promise<void> {
    await this.deviceStateService.ingestLampState(context.getTopic(), data);
  }
}
