// src/auth/token.service

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../database/entities/token.entity';
import { User } from '../database/entities/user.entity';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async generateTokens(userUuid: string): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const access_token_expiry = Date.now() + 60 * 60 * 1000; // 1小时
    const refresh_token_expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7天

    const user = await this.userRepository.findOne({
      where: { uuid: userUuid },
    });

    if (!user) {
      throw new Error('用户不存在，无法生成 Token');
    }

    // 生成 access_token 时附加用户权限信息
    const access_token = jwt.sign(
      {
        exp: access_token_expiry,
        permission: user.permission, // 添加用户权限
        uuid: userUuid, // 可用于后续用户身份验证
      },
      'secret',
      { algorithm: 'HS256' },
    );

    const refresh_token = uuidv4();

    const token = new Token();
    token.uuid = userUuid;
    token.access_token = access_token;
    token.refresh_token = refresh_token;
    token.access_token_expiry = access_token_expiry;
    token.refresh_token_expiry = refresh_token_expiry;

    await this.tokenRepository.save(token);

    return { access_token, refresh_token };
  }

  // 根据 refresh_token 生成新的 access_token 和 refresh_token
  async refreshTokens(
    refresh_token: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const token = await this.tokenRepository.findOne({
      where: { refresh_token },
    });

    if (!token || Date.now() > token.refresh_token_expiry) {
      throw new Error('Refresh Token 不合法或已过期');
    }

    const newTokens = await this.generateTokens(token.uuid);

    token.access_token = newTokens.access_token;
    token.refresh_token = newTokens.refresh_token;
    token.access_token_expiry = Date.now() + 60 * 60 * 1000;
    token.refresh_token_expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;

    await this.tokenRepository.save(token);

    return newTokens;
  }

  // 验证 Token 有效性
  async validateAccessToken(
    access_token: string,
  ): Promise<{ valid: boolean; message: string; permission?: number }> {
    const token = await this.tokenRepository.findOne({
      where: { access_token },
    });

    if (!token) {
      return { valid: false, message: 'Token 不存在' };
    }

    if (Date.now() > token.access_token_expiry) {
      return { valid: false, message: 'Token 已过期' };
    }

    try {
      const decoded = jwt.verify(access_token, 'secret', {
        algorithms: ['HS256'],
      });
      const { permission } = decoded as { permission: number };

      return { valid: true, message: 'Token 有效', permission };
    } catch (err) {
      return { valid: false, message: err.message };
    }
  }

  // 根据 token 返回用户权限
  async getPermissionFromToken(access_token: string): Promise<number> {
    const token = await this.tokenRepository.findOne({
      where: { access_token },
    });

    if (!token) {
      throw new Error('Token 不存在');
    }

    if (Date.now() > token.access_token_expiry) {
      throw new Error('Token 已过期');
    }

    try {
      const decoded = jwt.verify(access_token, 'secret', {
        algorithms: ['HS256'],
      });
      const { permission } = decoded as { permission: number }; // 提取权限

      return permission; // 返回用户权限
    } catch {
      throw new Error('Token 无效');
    }
  }

  // 清除已过期的 token
  async cleanupExpiredTokens(): Promise<void> {
    const expiredTokens = await this.tokenRepository
      .createQueryBuilder()
      .where('access_token_expiry < :now OR refresh_token_expiry < :now', {
        now: Date.now(),
      })
      .getMany();

    for (const token of expiredTokens) {
      await this.tokenRepository.remove(token);
    }
  }
}
