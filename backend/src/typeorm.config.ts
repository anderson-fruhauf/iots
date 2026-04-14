import 'dotenv/config';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { TelemetryReading } from './telemetry/telemetry-reading.entity';

export const typeOrmOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [TelemetryReading],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
};

export default new DataSource(typeOrmOptions);
