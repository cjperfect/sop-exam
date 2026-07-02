import { Controller, Get, Put, Body, UseGuards, Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { ExamConfigService } from './exam-config.service.js'

@ApiTags('考试配置')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/exam-config')
export class ExamConfigController {
  constructor(@Inject(ExamConfigService) private readonly service: ExamConfigService) {}

  @Get()
  @ApiOperation({ summary: '获取考试全局配置' })
  get() {
    return this.service.get()
  }

  @Put()
  @ApiOperation({ summary: '更新考试全局配置' })
  update(@Body() body: { passingScore?: number; totalScore?: number; timeLimit?: number; questionCount?: number }) {
    return this.service.update(body)
  }
}
