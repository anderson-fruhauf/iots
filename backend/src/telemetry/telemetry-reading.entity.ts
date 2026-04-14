import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'telemetry_readings' })
@Index('IDX_telemetry_readings_recorded_at', ['recordedAt'])
export class TelemetryReading {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'device_id', type: 'varchar', length: 32 })
  deviceId: string;

  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt: Date;

  @Column({ type: 'double precision', nullable: true })
  temperature: number | null;

  @Column({ type: 'double precision', nullable: true })
  humidity: number | null;
}
