import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'telemetry_events' })
export class TelemetryEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'device_id', type: 'varchar', length: 32 })
  deviceId: string;

  @Column({ type: 'double precision', nullable: true })
  temperature: number | null;

  @Column({ type: 'double precision', nullable: true })
  humidity: number | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  unit: string | null;

  @Column({ name: 'mqtt_topic', type: 'varchar', length: 256 })
  mqttTopic: string;

  @Column({ name: 'raw_payload', type: 'jsonb', nullable: true })
  rawPayload: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'received_at', type: 'timestamptz' })
  receivedAt: Date;
}
