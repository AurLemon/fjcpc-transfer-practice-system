// src/user/user.controller.ts

import { Controller, Get, Post, Req, UseGuards, Body } from '@nestjs/common';
import { ApiResponseUtil } from '../common/api.response';
import { TokenService } from '../auth/token.service';
import { TokenGuard } from '../auth/token.guard';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoneQuestion } from '../database/entities/done_question.entity';
import { StarQuestion } from '../database/entities/star_question.entity';
import { Question } from '../database/entities/question.entity';

@Controller('user')
export class UserController {
  constructor(
    private readonly tokenService: TokenService,
    @InjectRepository(DoneQuestion)
    private readonly doneQuestionRepository: Repository<DoneQuestion>,
    @InjectRepository(StarQuestion)
    private readonly starQuestionRepository: Repository<StarQuestion>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  @UseGuards(TokenGuard)
  @Get('profile')
  async userProfile(@Req() req: Request) {
    const userInfo: any = req.user;

    const modifiedName =
      userInfo.name.length > 1
        ? userInfo.name[0] + '*'.repeat(userInfo.name.length - 1)
        : userInfo.name;

    const modifiedIdNumber =
      userInfo.id_number.substring(0, 6) +
      '***********' +
      userInfo.id_number.substring(17);

    const modifiedLastLogin = new Date(userInfo.last_login).getTime();
    const modifiedRegDate = new Date(userInfo.reg_date).getTime();

    const modifiedUserInfo = {
      ...userInfo,
      name: modifiedName,
      id_number: modifiedIdNumber,
      last_login: modifiedLastLogin,
      reg_date: modifiedRegDate,
    };

    return ApiResponseUtil.success(200, modifiedUserInfo);
  }

  @UseGuards(TokenGuard)
  @Get('progress')
  async getProgress(@Req() req: Request) {
    const userInfo: any = req.user;
    const userUuid = userInfo.uuid;

    const doneQuestions = await this.doneQuestionRepository.find({
      where: { user: userUuid },
    });

    if (!doneQuestions.length) {
      return ApiResponseUtil.success(200, []);
    }

    const progressData = doneQuestions.map((question) => ({
      pid: question.pid,
      course: question.course,
      subject: question.subject,
      time: question.done_time,
    }));

    return ApiResponseUtil.success(200, progressData);
  }

  @UseGuards(TokenGuard)
  @Post('progress')
  async saveProgress(@Req() req: Request, @Body() body: { pid: string[] }) {
    const userInfo: any = req.user;
    const userUuid = userInfo.uuid;
    const { pid } = body;

    if (!pid.length) {
      return ApiResponseUtil.success(200, []);
    }

    await Promise.all(
      pid.map(async (pidNumber) => {
        const question = await this.questionRepository.findOne({
          where: { pid: pidNumber },
        });

        if (question) {
          await this.doneQuestionRepository.save({
            user: userUuid,
            pid: question.pid,
            course: question.course,
            subject: question.subject,
            done_time: Date.now(),
          });
        }
      }),
    );

    return ApiResponseUtil.success(200, 'Progress saved successfully');
  }

  @UseGuards(TokenGuard)
  @Get('star')
  async getStar(@Req() req: Request) {
    const userInfo: any = req.user;
    const userUuid = userInfo.uuid;

    const starQuestions = await this.starQuestionRepository.find({
      where: { user: userUuid },
    });

    if (!starQuestions.length) {
      return ApiResponseUtil.success(200, []);
    }

    const starData = starQuestions.map((question) => ({
      pid: question.pid,
      course: question.course,
      subject: question.subject,
      time: question.stared_time,
    }));

    return ApiResponseUtil.success(200, starData);
  }

  @UseGuards(TokenGuard)
  @Post('star')
  async saveStar(@Req() req: Request, @Body() body: { pid: string[] }) {
    const userInfo: any = req.user;
    const userUuid = userInfo.uuid;
    const { pid } = body;

    if (!pid.length) {
      return ApiResponseUtil.success(200, []);
    }

    const questions = await this.questionRepository.find({
      where: pid.map((pidNumber) => ({ pid: pidNumber })),
    });

    await Promise.all(
      questions.map(async (question) => {
        await this.starQuestionRepository.save({
          user: userUuid,
          pid: question.pid,
          course: question.course,
          subject: question.subject,
          stared_time: Date.now(),
          folder: 'wrong',
        });
      }),
    );

    return ApiResponseUtil.success(200, 'Starred questions saved successfully');
  }
}
