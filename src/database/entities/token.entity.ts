// src/database/entities/token.entity

import { Entity, Column, PrimaryColumn } from 'typeorm';
@Entity('tokens')
export class Token {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  uuid: string; // 生成的 UUID 主键

  @Column({ type: 'varchar', length: 500 })
  access_token: string; // 访问 Token

  @Column({ type: 'varchar', length: 500 })
  refresh_token: string; // 刷新新 Token 的刷新 Token

  @Column({ type: 'bigint' })
  access_token_expiry: number; // Access Token 过期时间（timestamp）

  @Column({ type: 'bigint' })
  refresh_token_expiry: number; // Refresh Token 过期时间（timestamp）
}
