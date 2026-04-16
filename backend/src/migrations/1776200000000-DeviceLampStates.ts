import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeviceLampStates1776200000000 implements MigrationInterface {
  name = 'DeviceLampStates1776200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "device_states" (
        "device_id" character varying(32) NOT NULL,
        "channel" character varying(64) NOT NULL,
        "active" boolean NOT NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_device_states" PRIMARY KEY ("device_id", "channel")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "device_states"`);
  }
}
