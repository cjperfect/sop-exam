import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { DepartmentsService } from './departments.service.js'

@ApiTags('部门')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/departments')
export class DepartmentsController {
  constructor(@Inject(DepartmentsService) private readonly service: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: '获取部门列表' })
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: '获取部门详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id))
  }

  @Post()
  @ApiOperation({ summary: '创建部门' })
  create(@Body() body: { name: string; description?: string }) {
    return this.service.create(body)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新部门' })
  update(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.service.update(Number(id), body)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id))
  }
}
