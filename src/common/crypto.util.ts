import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sm2 } from 'sm-crypto';
import { LoginKey } from '../database/entities/login_key.entity'; // 引入 LoginKey 实体

@Injectable()
export class CryptoUtil {
  constructor(
    @InjectRepository(LoginKey)
    private readonly loginKeyRepository: Repository<LoginKey>, // 注入 LoginKey 仓库
  ) {}

  // 生成密钥对并存储到数据库
  private async generateKeyPair(): Promise<LoginKey> {
    const keyPair = sm2.generateKeyPairHex();

    // 创建新的 LoginKey 实例并保存到数据库
    const newLoginKey = new LoginKey();
    newLoginKey.private_key = keyPair.privateKey;
    newLoginKey.expiry_time = new Date(Date.now() + 60 * 60 * 1000); // 1小时后过期

    await this.loginKeyRepository.save(newLoginKey); // 存入数据库

    return newLoginKey;
  }

  // 从数据库获取有效的私钥
  private async getValidKeyPair(): Promise<LoginKey> {
    // 查询是否有有效的私钥，按时间排序找到最新的
    let validKey = await this.loginKeyRepository
      .createQueryBuilder('loginKey')
      .where('loginKey.expiry_time > :now', { now: new Date() })
      .orderBy('loginKey.expiry_time', 'DESC')
      .getOne();

    // 如果没有有效的私钥，生成新的密钥对并保存到数据库
    if (!validKey) {
      validKey = await this.generateKeyPair();
    }

    return validKey;
  }

  // 获取公钥，如果不存在则生成
  public async getPublicKey(): Promise<string> {
    const validKey = await this.getValidKeyPair();
    const publicKey = sm2.getPublicKeyFromPrivateKey(validKey.private_key);
    return publicKey;
  }

  // 使用公钥进行加密
  public async encryptWithSM2(plaintext: string): Promise<string> {
    const validKey = await this.getValidKeyPair();
    const publicKey = sm2.getPublicKeyFromPrivateKey(validKey.private_key);

    const cipherMode = 1; // C1C3C2 默认加密模式
    const encrypted = sm2.doEncrypt(plaintext, publicKey, cipherMode);

    return encrypted; // 返回加密结果
  }

  // 使用私钥进行解密
  public async decryptWithSM2(encryptedText: string): Promise<string> {
    const validKey = await this.getValidKeyPair();

    const cipherMode = 1; // C1C3C2 默认加密模式
    const decrypted = sm2.doDecrypt(
      encryptedText,
      validKey.private_key,
      cipherMode,
    );

    return decrypted; // 返回解密后的明文
  }
}
