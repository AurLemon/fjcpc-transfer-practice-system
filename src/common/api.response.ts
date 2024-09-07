export class ApiResponseUtil {
  // 成功响应
  static success(status: number, data: any) {
    return {
      status,
      data,
      timestamp: Date.now(),
    };
  }

  // 错误响应
  static error(status: number, type: string, message: string) {
    return {
      status,
      data: {
        type,
        message,
      },
      timestamp: Date.now(),
    };
  }
}
