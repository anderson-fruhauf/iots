import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MqttContext, Payload } from '@nestjs/microservices';
import { DeviceStateService } from './device-state.service';

@Controller()
export class DevicesMqttController {
  constructor(private readonly deviceStateService: DeviceStateService) {}

  @EventPattern('iots/device/+/state')
  async handleState(
    @Payload() data: unknown,
    @Ctx() context: MqttContext,
  ): Promise<void> {
    await this.deviceStateService.ingestLampState(context.getTopic(), data);
  }
}
