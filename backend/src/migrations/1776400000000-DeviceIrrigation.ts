import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeviceIrrigation1776400000000 implements MigrationInterface {
  name = 'DeviceIrrigation1776400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "device_irrigation" (
        "id" BIGSERIAL NOT NULL,
        "device_id" character varying(32) NOT NULL,
        "duration_ms" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_device_irrigation" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_device_irrigation_device_id" ON "device_irrigation" ("device_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "device_irrigation"`);
  }
}
