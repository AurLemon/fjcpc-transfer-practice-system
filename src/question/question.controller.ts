// src/question/question.controller

import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuestionService } from './question.service';
import { ApiResponseUtil } from '../common/api.response';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  async getQuestions(
    @Query('course') course: number,
    @Query('subject') subject: number,
  ) {
    return ApiResponseUtil.success(
      200,
      await this.questionService.getQuestionsByCourseAndSubject(
        course,
        subject,
      ),
    );
  }

  @Get('stat')
  async getStat() {
    return ApiResponseUtil.success(200, await this.questionService.getStat());
  }

  @Get(':pid')
  async getQuestion(@Param('pid') pid: string) {
    return ApiResponseUtil.success(
      200,
      await this.questionService.getQuestionByPid(pid),
    );
  }
}
