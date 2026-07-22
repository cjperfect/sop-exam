import { Controller, Post, Body, Inject, Res } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Response } from 'express'
import { AiService } from './ai.service.js'
import { GenerateExamDto, GradeExamDto } from './dto/ai.dto.js'

@ApiTags('AI')
@Controller('api/ai')
export class AiController {
  constructor(@Inject(AiService) private readonly aiService: AiService) {}

  /**
   * SSE 流式生成试卷
   *
   * POST /api/ai/generate-exam-stream
   * 事件流: config → message(原始文本) → question(解析后题目) → done(examId)
   * 错误时: error(message)
   */
  @Post('generate-exam-stream')
  @ApiOperation({ summary: 'SSE 流式生成试卷' })
  async generateExamStream(@Body() dto: GenerateExamDto, @Res() res: Response) {
    console.log('[SSE] generate-exam-stream called, sopId=', dto.sopId)

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.status(200)
    res.flushHeaders()

    const emit = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    }

    try {
      const stream = this.aiService.generateExamStream(dto)
      for await (const { type, data } of stream) {
        emit(type, data)
      }
    } catch (err) {
      console.error('[SSE] error:', (err as Error).message)
      emit('error', { message: (err as Error).message })
    }
    res.end()
    console.log('[SSE] stream ended')
  }

  @Post('grade-exam')
  @ApiOperation({ summary: 'AI 批改试卷并生成学习建议' })
  gradeExam(@Body() dto: GradeExamDto) {
    return this.aiService.gradeExam(dto)
  }
}
