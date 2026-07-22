import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { SopsService } from './sops.service.js'
import { CreateSopDto, UpdateSopDto } from './dto/sops.dto.js'

@ApiTags('SOP 文档')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/sops')
export class SopsController {
  constructor(@Inject(SopsService) private readonly sopsService: SopsService) {}

  @Get()
  @ApiOperation({ summary: '获取 SOP 列表' })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.sopsService.findAll(Number(page) || 1, Number(pageSize) || 10, search, department, status)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取 SOP 详情' })
  findOne(@Param('id') id: string) {
    return this.sopsService.findOne(Number(id))
  }

  @Post()
  @ApiOperation({ summary: '创建 SOP' })
  create(@Body() dto: CreateSopDto) {
    return this.sopsService.create(dto as unknown as Record<string, unknown>)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新 SOP' })
  update(@Param('id') id: string, @Body() dto: UpdateSopDto) {
    return this.sopsService.update(Number(id), dto as unknown as Record<string, unknown>)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除 SOP' })
  remove(@Param('id') id: string) {
    return this.sopsService.remove(Number(id))
  }
}
