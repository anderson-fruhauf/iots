import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MqttContext, Payload } from '@nestjs/microservices';
import { MQTT_PATTERN_DEVICE_IRRIGATION } from '../mqtt/mqtt.constants';
import { IrrigationService } from './irrigation.service';

@Controller()
export class IrrigationMqttController {
  constructor(private readonly irrigationService: IrrigationService) {}

  @EventPattern(MQTT_PATTERN_DEVICE_IRRIGATION)
  async handleIrrigation(
    @Payload() data: unknown,
    @Ctx() context: MqttContext,
  ): Promise<void> {
    await this.irrigationService.ingestFromMqtt(context.getTopic(), data);
  }
}
