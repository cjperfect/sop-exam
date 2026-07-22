import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    // SSE 流式端点已手动处理错误，不覆盖
    if (request.url?.includes('generate-exam-stream')) {
      return
    }

    let code = HttpStatus.INTERNAL_SERVER_ERROR
    let msg = 'Internal server error'

    if (exception instanceof HttpException) {
      code = exception.getStatus()
      const res = exception.getResponse()
      msg = typeof res === 'string' ? res : (res as any).message ?? exception.message
      if (Array.isArray(msg)) msg = msg[0]
    } else if (exception instanceof Error) {
      msg = exception.message
    }

    response.status(code).json({
      code,
      msg,
      data: null,
    })
  }
}
