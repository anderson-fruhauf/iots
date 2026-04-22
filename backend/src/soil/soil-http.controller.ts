import { Controller, Get, Param } from '@nestjs/common';
import { SoilService } from './soil.service';

@Controller('soil')
export class SoilHttpController {
  constructor(private readonly soilService: SoilService) {}

  @Get()
  list() {
    return this.soilService.findAll();
  }

  @Get(':deviceId')
  byDevice(@Param('deviceId') deviceId: string) {
    return this.soilService.getByDeviceIdOrThrow(deviceId);
  }
}
