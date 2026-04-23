import { Controller, Get, Param } from '@nestjs/common';
import { IrrigationService } from './irrigation.service';
import { SoilService } from './soil.service';

@Controller('soil')
export class SoilHttpController {
  constructor(
    private readonly soilService: SoilService,
    private readonly irrigationService: IrrigationService,
  ) {}

  @Get()
  list() {
    return this.soilService.findAll();
  }

  @Get(':deviceId/irrigation')
  irrigationHistory(@Param('deviceId') deviceId: string) {
    return this.irrigationService.listByDeviceId(deviceId);
  }

  @Get(':deviceId')
  byDevice(@Param('deviceId') deviceId: string) {
    return this.soilService.getByDeviceIdOrThrow(deviceId);
  }
}
