import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateNoteDto {
  @ApiProperty({ description: 'SOP ID' })
  sopId!: string

  @ApiPropertyOptional({ description: 'SOP 标题' })
  sopTitle?: string

  @ApiProperty({ description: '用户 ID' })
  userId!: string

  @ApiPropertyOptional({ description: '用户名' })
  userName?: string

  @ApiProperty({ description: '笔记内容 (Markdown)' })
  content!: string

  @ApiPropertyOptional({ description: '关联文档段落标题' })
  pageRef?: string
}

export class UpdateNoteDto {
  @ApiPropertyOptional({ description: '笔记内容 (Markdown)' })
  content?: string

  @ApiPropertyOptional({ description: '关联文档段落标题' })
  pageRef?: string
}
