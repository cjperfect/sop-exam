import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Inject, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { SubmissionsService } from './submissions.service.js'
import { CreateSubmissionDto } from './dto/submissions.dto.js'

@ApiTags('考试记录')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/submissions')
export class SubmissionsController {
  constructor(@Inject(SubmissionsService) private readonly service: SubmissionsService) {}

  @Get()
  @ApiOperation({ summary: '分页获取考试记录列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数', example: 10 })
  @ApiQuery({ name: 'userName', required: false, description: '考试人姓名（模糊搜索）' })
  @ApiQuery({ name: 'sopTitle', required: false, description: '关联 SOP 标题（模糊搜索）' })
  @ApiQuery({ name: 'examId', required: false, description: '考试 ID' })
  @ApiQuery({ name: 'sopId', required: false, description: 'SOP ID' })
  @ApiQuery({ name: 'isPassed', required: false, description: '是否通过（true/false）' })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('userName') userName?: string,
    @Query('sopTitle') sopTitle?: string,
    @Query('examId') examId?: string,
    @Query('sopId') sopId?: string,
    @Query('isPassed') isPassed?: string,
  ) {
    return this.service.findAll(
      Number(page) || 1,
      Number(pageSize) || 10,
      userName,
      sopTitle,
      examId ? Number(examId) : undefined,
      sopId ? Number(sopId) : undefined,
      isPassed !== undefined && isPassed !== '' ? isPassed === 'true' : undefined,
    )
  }

  @Get(':id')
  @ApiOperation({ summary: '获取考试记录详情（含答题明细）' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id))
  }

  @Post()
  @ApiOperation({ summary: '创建考试记录' })
  create(@Body() dto: CreateSubmissionDto, @Req() req: any) {
    return this.service.create(dto, req.user)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除考试记录（软删除）' })
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id))
  }
}
