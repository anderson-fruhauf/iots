import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MqttContext, Payload } from '@nestjs/microservices';
import { TelemetryService } from './telemetry.service';

@Controller()
export class TelemetryMqttController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @EventPattern('iots/device/+/telemetry')
  async handleTelemetry(
    @Payload() data: unknown,
    @Ctx() context: MqttContext,
  ): Promise<void> {
    await this.telemetryService.ingestFromMqtt(context.getTopic(), data);
  }
}
