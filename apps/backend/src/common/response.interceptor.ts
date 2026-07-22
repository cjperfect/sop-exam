import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const req = context.switchToHttp().getRequest()
    const res = context.switchToHttp().getResponse()

    // SSE 流式端点手动写响应，不包装
    if (res.headersSent || req.path?.includes('generate-exam-stream')) {
      return next.handle()
    }

    return next.handle().pipe(
      map((data) => {
        if (res.statusCode === 201) res.status(200)
        return {
          code: 200,
          msg: 'success',
          data,
        }
      }),
    )
  }
}
