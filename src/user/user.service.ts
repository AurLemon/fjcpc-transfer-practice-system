import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 根据身份证号查询用户
  async findByIdNumber(idNumber: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { id_number: idNumber },
    });
  }
}
