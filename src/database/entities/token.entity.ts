import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 500 })
  access_token: string;

  @Column({ type: 'varchar', length: 500 })
  refresh_token: string;

  @Column({ type: 'bigint' })
  access_token_expiry: number;

  @Column({ type: 'bigint' })
  refresh_token_expiry: number;
}
