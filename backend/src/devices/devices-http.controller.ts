import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import { DeviceStateService } from './device-state.service';

@Controller('devices')
export class DevicesHttpController {
  constructor(private readonly deviceStateService: DeviceStateService) {}

  @Get(':deviceId/lamp')
  getLamp(@Param('deviceId') deviceId: string) {
    return this.deviceStateService.getLampState(deviceId);
  }

  @Post(':deviceId/lamp')
  async setLamp(
    @Param('deviceId') deviceId: string,
    @Body() body: { on?: boolean },
  ) {
    if (typeof body?.on !== 'boolean') {
      throw new BadRequestException(
        'Envie JSON no formato { "on": true } ou { "on": false }.',
      );
    }
    try {
      await this.deviceStateService.publishLampCommand(deviceId, body.on);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new InternalServerErrorException(
        'Não foi possível enviar o comando ao dispositivo.',
      );
    }
    return await this.deviceStateService.getLampState(deviceId);
  }
}
