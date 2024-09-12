// src/question/question.service

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isEqual } from 'lodash';

import { Question } from '../database/entities/question.entity';
import { UpdatedQuestion } from '../database/entities/updated_question.entity';
import { RequestInfo } from '../database/entities/request_info.entity';

import { fetchExamQuestions } from '../api/api';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,

    @InjectRepository(RequestInfo)
    private requestInfoRepository: Repository<RequestInfo>,

    @InjectRepository(UpdatedQuestion)
    private updatedQuestionRepository: Repository<UpdatedQuestion>,
  ) {}

  // 获取单个题目
  async getQuestionByPid(pid: string): Promise<Question> {
    return await this.questionsRepository.findOne({ where: { pid } });
  }

  // 根据课程和科目获取题目
  async getQuestionsByCourseAndSubject(
    course: number = 1,
    subject: number = 1,
  ): Promise<Question[]> {
    return await this.questionsRepository.find({
      where: { course, subject },
    });
  }

  async processQuestions(courseType: number, userId: string): Promise<boolean> {
    const rawData = await fetchExamQuestions(courseType, userId);

    if (!rawData || !rawData.list || !Array.isArray(rawData.list)) {
      return false;
    }

    const dtnameList = rawData.list;

    for (const dtname of dtnameList) {
      const dtlx = dtname.dtlx ? parseInt(dtname.dtlx, 10) : 0;

      if (!Array.isArray(dtname.xtlist)) {
        continue;
      }

      let subject = 0;
      if (courseType === 1) {
        if (dtname.dtname.includes('语文')) {
          subject = 1;
        } else if (dtname.dtname.includes('数学')) {
          subject = 2;
        } else if (dtname.dtname.includes('英语')) {
          subject = 3;
        } else if (dtname.dtname.includes('政治')) {
          subject = 4;
        }
      }

      for (const question of dtname.xtlist) {
        const existingQuestion = await this.questionsRepository.findOne({
          where: { pid: question.pid },
        });

        const parsedOptions = this.parseOptions(question.list);

        let parsedAnswer: string[] | string[][] = [];
        if (dtlx === 8 && Array.isArray(question.list)) {
          parsedAnswer = this.parseSubAnswers(question.list);
        } else if (question.zqda) {
          parsedAnswer = this.parseAnswer(question.zqda, question.list, false);
        }

        const hasSubOptions = dtlx === 8;
        const subOptions = hasSubOptions
          ? this.parseSubOptions(question.list)
          : null;

        if (courseType === 2) {
          const requestInfo = await this.requestInfoRepository.findOne({
            where: { course: courseType, subject: question.subject },
          });
          subject = requestInfo ? requestInfo.subject : 0;
        }

        const questionData = {
          unique_code: this.generateUniqueCode(),
          pid: question.pid,
          content: question.tg,
          type: dtlx,
          options: parsedOptions,
          sub_options: subOptions,
          answer: parsedAnswer,
          subject,
          course: courseType,
          created_time: this.parseTimestamp(question.tjsj),
          updated_time: this.parseTimestamp(question.xgsj),
          crawl_time: Date.now(),
          done_count: existingQuestion ? existingQuestion.done_count : 0,
          incorrect_count: existingQuestion
            ? existingQuestion.incorrect_count
            : 0,
          status: true,
          crawl_count: existingQuestion ? existingQuestion.crawl_count + 1 : 1,
        };

        if (existingQuestion) {
          if (this.isQuestionUpdated(existingQuestion, questionData)) {
            await this.questionsRepository.update(
              { pid: question.pid },
              questionData,
            );
          }
          await this.incrementCrawlCount(question.pid);
        } else {
          await this.questionsRepository.save(questionData);
        }
      }
    }

    return true;
  }

  // 解析选项，包含选项号和选项ID
  private parseOptions(optionList: any[]): any {
    if (optionList.some((option) => Array.isArray(option.list))) {
      return null;
    }

    return optionList.map((option) => ({
      id: option.id,
      xx: option.xx,
      txt: option.txt,
    }));
  }

  // 解析答案
  private parseAnswer(
    zqda: string,
    optionList: any[],
    hasSubOptions: boolean,
  ): string[] | string[][] {
    const answerIds = zqda.split(',').map((id) => id);

    if (hasSubOptions) {
      return answerIds.map((id) => [id]);
    }

    return answerIds;
  }

  // 解析子题目的答案
  private parseSubAnswers(subOptionList: any[]): string[][] {
    return subOptionList.map((subOption) => {
      if (subOption.da) {
        const answerId = subOption.da.toString();
        return [answerId];
      }
      return null;
    });
  }

  // 解析子选项
  private parseSubOptions(subOptionList: any[]): any {
    if (!Array.isArray(subOptionList)) {
      return null;
    }

    return subOptionList.map((subOption) => ({
      tg: subOption.tg,
      list: this.parseOptions(subOption.list),
    }));
  }

  // 生成唯一的题目编码
  private generateUniqueCode(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // 解析时间戳
  private parseTimestamp(timeObj: any): number {
    return timeObj.time;
  }

  // 检查题目是否更新
  private async isQuestionUpdated(
    existing: Question,
    newData: Partial<Question>,
  ): Promise<boolean> {
    const isUpdated =
      !isEqual(existing.content, newData.content) ||
      !isEqual(
        JSON.stringify(existing.options),
        JSON.stringify(newData.options),
      ) ||
      !isEqual(existing.answer, newData.answer);

    if (isUpdated) {
      await this.saveUpdatedQuestion(existing);
    }

    return isUpdated;
  }

  // 保存更新的题目信息
  private async saveUpdatedQuestion(existingQuestion: Question): Promise<void> {
    const updatedQuestion = this.updatedQuestionRepository.create({
      pid: existingQuestion.pid,
      unique_code: existingQuestion.unique_code,
      type: existingQuestion.type,
      subject: existingQuestion.subject,
      course: existingQuestion.course,
      updated_time: Date.now(),
    });

    await this.updatedQuestionRepository.save(updatedQuestion);
  }

  // 增加爬取计数
  private async incrementCrawlCount(pid: string): Promise<void> {
    await this.questionsRepository.increment({ pid }, 'crawl_count', 1);
  }

  // 统计信息
  async getStat() {
    const culturalLessonStat = {
      chinese: await this.questionsRepository.count({
        where: { course: 1, subject: 1 },
      }),
      math: await this.questionsRepository.count({
        where: { course: 1, subject: 2 },
      }),
      english: await this.questionsRepository.count({
        where: { course: 1, subject: 3 },
      }),
      politics: await this.questionsRepository.count({
        where: { course: 1, subject: 4 },
      }),
    };

    const professionLessons = await this.requestInfoRepository.find({
      where: { course: 2 },
    });

    const professionLessonStat = {};

    for (const profession of professionLessons) {
      const professionKey = profession.profession_id;
      const subjectId = profession.subject;

      const count = await this.questionsRepository.count({
        where: { course: 2, subject: subjectId },
      });

      professionLessonStat[professionKey] = count;
    }

    return {
      cultural_lesson: culturalLessonStat,
      profession_lesson: professionLessonStat,
    };
  }
}
