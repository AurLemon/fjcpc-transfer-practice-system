import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // 注册用户实体
  providers: [UserService],
  exports: [UserService], // 导出服务，供auth模块使用
})
export class UserModule {}
