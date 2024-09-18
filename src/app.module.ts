// src/app.module

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';

import { User } from './database/entities/user.entity';
import { Token } from './database/entities/token.entity';
import { LoginKey } from './database/entities/login_key.entity';
import { RequestInfo } from './database/entities/request_info.entity';
import { RequestLog } from './database/entities/request_log.entity';
import { Question } from './database/entities/question.entity';
import { DoneQuestion } from './database/entities/done_question.entity';
import { StarQuestion } from './database/entities/star_question.entity';
import { UpdatedQuestion } from './database/entities/updated_question.entity';

import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { QuestionModule } from './question/question.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbType = configService.get<string>('database.type');
        if (dbType === 'sqlite') {
          return {
            type: 'sqlite',
            database: configService.get<string>('database.sqlitePath'),
            entities: [
              User,
              Token,
              LoginKey,
              RequestInfo,
              RequestLog,
              Question,
              DoneQuestion,
              StarQuestion,
              UpdatedQuestion,
            ],
            synchronize: true,
          };
        } else if (dbType === 'mysql') {
          return {
            type: 'mysql',
            host: configService.get<string>('database.host'),
            port: configService.get<number>('database.port'),
            username: configService.get<string>('database.user'),
            password: configService.get<string>('database.password'),
            database: configService.get<string>('database.name'),
            entities: [
              User,
              Token,
              LoginKey,
              RequestInfo,
              RequestLog,
              Question,
              DoneQuestion,
              StarQuestion,
              UpdatedQuestion,
            ],
            synchronize: true,
          };
        }
      },
    }),
    AuthModule,
    UserModule,
    QuestionModule,
    AdminModule,
  ],
})
export class AppModule {}
