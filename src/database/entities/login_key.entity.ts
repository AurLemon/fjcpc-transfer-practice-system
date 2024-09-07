import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('login_key')
export class LoginKey {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 500 })
  private_key: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  expiry_time: Date;
}
