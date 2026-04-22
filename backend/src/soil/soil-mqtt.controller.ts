import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MqttContext, Payload } from '@nestjs/microservices';
import { MQTT_PATTERN_DEVICE_SOIL } from '../mqtt/mqtt.constants';
import { SoilService } from './soil.service';

@Controller()
export class SoilMqttController {
  constructor(private readonly soilService: SoilService) {}

  @EventPattern(MQTT_PATTERN_DEVICE_SOIL)
  async handleSoil(
    @Payload() data: unknown,
    @Ctx() context: MqttContext,
  ): Promise<void> {
    await this.soilService.ingestFromMqtt(context.getTopic(), data);
  }
}
