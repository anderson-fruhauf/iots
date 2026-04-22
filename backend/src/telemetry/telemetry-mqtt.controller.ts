import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MqttContext, Payload } from '@nestjs/microservices';
import { MQTT_PATTERN_DEVICE_TELEMETRY } from '../mqtt/mqtt.constants';
import { TelemetryService } from './telemetry.service';

@Controller()
export class TelemetryMqttController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @EventPattern(MQTT_PATTERN_DEVICE_TELEMETRY)
  async handleTelemetry(
    @Payload() data: unknown,
    @Ctx() context: MqttContext,
  ): Promise<void> {
    await this.telemetryService.ingestFromMqtt(context.getTopic(), data);
  }
}
