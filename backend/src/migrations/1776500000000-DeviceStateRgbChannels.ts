import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cores do LED RGB: componentes 0-255 (NULL quando o canal ainda não enviou dado, ex. firmware antigo).
 */
export class DeviceStateRgbChannels1776500000000
  implements MigrationInterface
{
  name = 'DeviceStateRgbChannels1776500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "device_states"
      ADD COLUMN "r" smallint NULL,
      ADD COLUMN "g" smallint NULL,
      ADD COLUMN "b" smallint NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "device_states" DROP COLUMN "b", DROP COLUMN "g", DROP COLUMN "r"
    `);
  }
}
