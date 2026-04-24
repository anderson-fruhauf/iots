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

  @Get(':deviceId/lamp-rgb')
  getLampRgb(@Param('deviceId') deviceId: string) {
    return this.deviceStateService.getLampRgbState(deviceId);
  }

  @Post(':deviceId/lamp-rgb')
  async setLampRgb(
    @Param('deviceId') deviceId: string,
    @Body() body: { on?: boolean; r?: number; g?: number; b?: number },
  ) {
    if (
      typeof body?.on !== 'boolean' ||
      typeof body?.r !== 'number' ||
      typeof body?.g !== 'number' ||
      typeof body?.b !== 'number'
    ) {
      throw new BadRequestException(
        'Envie JSON com "on" (boolean) e "r", "g", "b" (0 a 255).',
      );
    }
    try {
      await this.deviceStateService.publishLampRgbCommand(deviceId, {
        on: body.on,
        r: body.r,
        g: body.g,
        b: body.b,
      });
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      throw new InternalServerErrorException(
        'Não foi possível enviar o comando ao dispositivo.',
      );
    }
    return await this.deviceStateService.getLampRgbState(deviceId);
  }
}
