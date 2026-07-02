import { Controller, Post, Body, Inject } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { AiService } from './ai.service.js'
import { GenerateExamDto, GradeExamDto } from './ai.dto.js'

@ApiTags('AI')
@Controller('api/ai')
export class AiController {
  constructor(@Inject(AiService) private readonly aiService: AiService) {}

  @Post('generate-exam')
  @ApiOperation({ summary: 'AI 生成试卷（根据 SOP 内容自动出题）' })
  generateExam(@Body() dto: GenerateExamDto) {
    return this.aiService.generateExam(dto)
  }

  @Post('grade-exam')
  @ApiOperation({ summary: 'AI 批改试卷并生成学习建议' })
  gradeExam(@Body() dto: GradeExamDto) {
    return this.aiService.gradeExam(dto)
  }
}
