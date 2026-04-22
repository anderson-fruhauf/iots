import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'device_soil' })
export class DeviceSoil {
  @PrimaryColumn({ name: 'device_id', type: 'varchar', length: 32 })
  deviceId: string;

  @Column({ name: 'soil_raw', type: 'int' })
  soilRaw: number;

  @Column({ name: 'wet_percent', type: 'int' })
  wetPercent: number;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
