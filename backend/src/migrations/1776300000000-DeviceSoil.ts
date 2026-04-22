import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeviceSoil1776300000000 implements MigrationInterface {
  name = 'DeviceSoil1776300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "device_soil" (
        "device_id" character varying(32) NOT NULL,
        "soil_raw" integer NOT NULL,
        "wet_percent" integer NOT NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_device_soil" PRIMARY KEY ("device_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "device_soil"`);
  }
}
