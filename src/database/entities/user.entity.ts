import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  id_number: string; // 身份证号（加密后存储）

  @Column({ type: 'varchar', length: 255 })
  name: string; // 真实姓名（加密后存储）

  @Column({ type: 'varchar', length: 255 })
  password: string; // 登录密码（加密后存储）

  @Column({ type: 'varchar', length: 100 })
  school: string; // 学校

  @Column({ type: 'varchar', length: 100 })
  profession: string; // 专业

  @Column({ type: 'int', default: 0 })
  permission: number; // 权限
}
