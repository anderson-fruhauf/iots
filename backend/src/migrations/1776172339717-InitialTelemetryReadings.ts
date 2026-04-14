import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialTelemetryReadings1776172339717 implements MigrationInterface {
  name = 'InitialTelemetryReadings1776172339717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "telemetry_readings" (
        "id" BIGSERIAL NOT NULL,
        "device_id" character varying(32) NOT NULL,
        "recorded_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "temperature" double precision,
        "humidity" double precision,
        CONSTRAINT "PK_telemetry_readings" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_telemetry_readings_recorded_at"
      ON "telemetry_readings" ("recorded_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_telemetry_readings_recorded_at"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "telemetry_readings"`);
  }
}
