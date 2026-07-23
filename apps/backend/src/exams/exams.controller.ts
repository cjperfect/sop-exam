import { Controller, Get, Post, Param, Body, Query, UseGuards, Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { ExamsService } from './exams.service.js'
import { CreateExamDto } from './dto/exams.dto.js'

@ApiTags('考试')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/exams')
export class ExamsController {
  constructor(@Inject(ExamsService) private readonly examsService: ExamsService) {}

  @Get()
  @ApiOperation({ summary: '获取考试列表' })
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.examsService.findAll(Number(page) || 1, Number(pageSize) || 10)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取考试详情（含题目）' })
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(Number(id))
  }

  @Post()
  @ApiOperation({ summary: '创建考试（保存 AI 生成的试卷）' })
  create(@Body() dto: CreateExamDto) {
    return this.examsService.create(dto)
  }

  @Post(':id/submit')
  @ApiOperation({ summary: '提交答卷' })
  submit(@Param('id') id: string, @Body() body: { answers: unknown[] }) {
    return this.examsService.submit(Number(id), body.answers)
  }

}
