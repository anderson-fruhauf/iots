import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Instalações que já rodaram a versão antiga da migração (`device_lamp_states`)
 * antes da tabela genérica `device_states`.
 */
export class DeviceStatesFromLegacyLampTable1776200000001
  implements MigrationInterface
{
  name = 'DeviceStatesFromLegacyLampTable1776200000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'device_lamp_states'
        )
        AND NOT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'device_states'
        ) THEN
          ALTER TABLE "device_lamp_states" RENAME TO "device_states";
          ALTER TABLE "device_states" ADD COLUMN "channel" character varying(64) NOT NULL DEFAULT 'lamp';
          ALTER TABLE "device_states" RENAME COLUMN "lamp_on" TO "active";
          ALTER TABLE "device_states" DROP CONSTRAINT "PK_device_lamp_states";
          ALTER TABLE "device_states" ADD CONSTRAINT "PK_device_states" PRIMARY KEY ("device_id", "channel");
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'device_states'
        )
        AND NOT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'device_lamp_states'
        )
        AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'device_states' AND column_name = 'channel'
        ) THEN
          ALTER TABLE "device_states" DROP CONSTRAINT "PK_device_states";
          ALTER TABLE "device_states" RENAME COLUMN "active" TO "lamp_on";
          ALTER TABLE "device_states" DROP COLUMN "channel";
          ALTER TABLE "device_states" ADD CONSTRAINT "PK_device_lamp_states" PRIMARY KEY ("device_id");
          ALTER TABLE "device_states" RENAME TO "device_lamp_states";
        END IF;
      END $$;
    `);
  }
}
