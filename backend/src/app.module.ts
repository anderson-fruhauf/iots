import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { DevicesModule } from './devices/devices.module';
import { SoilModule } from './soil/soil.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { typeOrmOptions } from './typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...typeOrmOptions,
      synchronize: process.env.DATABASE_SYNC === 'true',
    }),
    TelemetryModule,
    DevicesModule,
    SoilModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
