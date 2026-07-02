import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'
import { NotesService } from './notes.service.js'
import { CreateNoteDto, UpdateNoteDto } from './notes.dto.js'

@ApiTags('笔记')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/notes')
export class NotesController {
  constructor(@Inject(NotesService) private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: '获取笔记列表' })
  findAll(
    @Query('search') search?: string,
    @Query('userName') userName?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.notesService.findAll({ search, userName, page: Number(page) || 1, pageSize: Number(pageSize) || 10 })
  }

  @Get(':id')
  @ApiOperation({ summary: '获取笔记详情' })
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(Number(id))
  }

  @Post()
  @ApiOperation({ summary: '创建笔记' })
  create(@Body() dto: CreateNoteDto) {
    return this.notesService.create(dto as unknown as Record<string, unknown>)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新笔记' })
  update(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(Number(id), dto as unknown as Record<string, unknown>)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除笔记' })
  remove(@Param('id') id: string) {
    return this.notesService.remove(Number(id))
  }
}
