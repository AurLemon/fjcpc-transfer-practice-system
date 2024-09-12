// src/user/user.service

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { CryptoUtil } from '../common/crypto.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptoUtil: CryptoUtil,
  ) {}

  // 查找用户
  async findByIdNumber(id_number: string): Promise<User | null> {
    const encryptedIdNumber = this.cryptoUtil.hashEncrypt(id_number);
    return this.userRepository.findOne({
      where: { id_number: encryptedIdNumber },
    });
  }

  // 新增用户
  async createUser(
    id_number: string,
    name: string,
    password: string,
    school: string,
    profession: string,
  ): Promise<User> {
    const regDate = new Date();

    // Hash 加密身份证号、姓名和密码
    const encryptedIdNumber = this.cryptoUtil.hashEncrypt(id_number);
    const encryptedName = this.cryptoUtil.hashEncrypt(name);
    const encryptedPassword = this.cryptoUtil.hashEncrypt(password);

    // 创建新用户实例
    const newUser = this.userRepository.create({
      uuid: crypto.randomUUID(),
      id_number: encryptedIdNumber,
      name: encryptedName,
      password: encryptedPassword,
      school,
      profession,
      permission: 0,
      last_login: new Date(),
      reg_date: regDate,
    });

    // 保存用户到数据库
    return this.userRepository.save(newUser);
  }

  // 通过 UUID 查找用户
  async findUserByUuid(uuid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { uuid } });
  }

  // 更新用户权限级别
  async updateUserPermission(
    uuid: string,
    permissionLevel: number,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { uuid } });
    if (!user) {
      throw new Error('用户不存在');
    }

    user.permission = permissionLevel;
    return this.userRepository.save(user);
  }

  // 检查用户权限是否足够
  async checkUserPermission(
    uuid: string,
    requiredPermission: number,
  ): Promise<boolean> {
    const user = await this.findUserByUuid(uuid);
    if (!user) {
      throw new Error('用户不存在');
    }

    return user.permission >= requiredPermission;
  }
}
