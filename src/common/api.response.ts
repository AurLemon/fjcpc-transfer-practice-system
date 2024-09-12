// src/common/api.response

import { HttpException } from '@nestjs/common';

export class ApiResponseUtil {
  static success(code: number, data: any) {
    return {
      code,
      status: 'success',
      data,
      timestamp: Date.now(),
    };
  }

  static error(code: number, type: string, message: string) {
    throw new HttpException(
      {
        code,
        status: 'error',
        data: {
          type,
          message,
        },
        timestamp: Date.now(),
      },
      code,
    );
  }
}
