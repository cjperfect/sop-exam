import { Controller, Get, Param, Query, UseGuards, Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { SopsService } from './sops.service.js'

@ApiTags('SOP 文档库')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/sops')
export class SopsController {
  constructor(@Inject(SopsService) private readonly sopsService: SopsService) {}

  @Get()
  @ApiOperation({ summary: '获取已发布的 SOP 列表' })
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    return this.sopsService.findAllPublished(Number(page) || 1, Number(pageSize) || 10, search)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取 SOP 详情' })
  findOne(@Param('id') id: string) {
    return this.sopsService.findOne(Number(id))
  }
}
