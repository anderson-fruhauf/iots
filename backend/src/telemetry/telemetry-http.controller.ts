import { Controller, Get, Query } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';

@Controller('telemetry')
export class TelemetryHttpController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get('readings')
  list(
    @Query('limit') limit?: string,
    @Query('deviceId') deviceId?: string,
  ) {
    const n = limit ? parseInt(limit, 10) : 50;
    const id =
      typeof deviceId === 'string' && deviceId.trim() !== ''
        ? deviceId.trim()
        : undefined;
    return this.telemetryService.findRecent(Number.isNaN(n) ? 50 : n, id);
  }
}
