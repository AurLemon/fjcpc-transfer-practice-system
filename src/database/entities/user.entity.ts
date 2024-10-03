// src/database/entities/user.entity

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string; // 生成的 UUID 主键

  @Column({ type: 'varchar', length: 255 })
  id_number: string; // 身份证号

  @Column({ type: 'varchar', length: 255 })
  name: string; // 真实姓名（AES）

  @Column({ type: 'varchar', length: 255 })
  password: string; // 登录密码（AES）

  @Column({ type: 'varchar', length: 100 })
  school: string; // 学校

  @Column({ type: 'varchar', length: 100 })
  profession: string; // 专业

  @Column({ type: 'int', default: -1 })
  profession_main_subject: number; // 主要专业（专业在 request_info 表中的 subject 编号）

  @Column({ type: 'int', default: 0 })
  permission: number; // 权限

  @Column({ type: 'timestamp' })
  last_login: Date; // 上次登录

  @Column({ type: 'timestamp' })
  reg_date: Date; // 注册时间
}
