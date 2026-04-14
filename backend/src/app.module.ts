import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { TelemetryModule } from './telemetry/telemetry.module';
import { typeOrmOptions } from './typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...typeOrmOptions,
      synchronize: process.env.DATABASE_SYNC === 'true',
    }),
    TelemetryModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
