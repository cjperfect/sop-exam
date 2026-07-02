import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

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
