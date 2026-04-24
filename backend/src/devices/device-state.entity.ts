import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'device_states' })
export class DeviceState {
  @PrimaryColumn({ name: 'device_id', type: 'varchar', length: 32 })
  deviceId: string;

  @PrimaryColumn({ name: 'channel', type: 'varchar', length: 64 })
  channel: string;

  @Column({ name: 'active', type: 'boolean' })
  active: boolean;

  @Column({ name: 'r', type: 'smallint', nullable: true })
  r: number | null;

  @Column({ name: 'g', type: 'smallint', nullable: true })
  g: number | null;

  @Column({ name: 'b', type: 'smallint', nullable: true })
  b: number | null;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
