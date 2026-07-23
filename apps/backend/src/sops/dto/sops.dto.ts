import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateSopDto {
  @ApiProperty({ description: '标题' })
  title!: string

  @ApiProperty({ description: '内容' })
  content!: string

  @ApiPropertyOptional({ description: '部门 ID' })
  departmentId?: number

  @ApiPropertyOptional({ description: '文件类型', enum: ['markdown', 'pdf'] })
  fileType?: 'markdown' | 'pdf'

  @ApiPropertyOptional({ description: '状态', enum: ['draft', 'published', 'archived'] })
  status?: 'draft' | 'published' | 'archived'
}

export class UpdateSopDto {
  @ApiPropertyOptional({ description: '标题' })
  title?: string

  @ApiPropertyOptional({ description: '内容' })
  content?: string

  @ApiPropertyOptional({ description: '部门 ID' })
  departmentId?: number

  @ApiPropertyOptional({ description: '文件类型', enum: ['markdown', 'pdf'] })
  fileType?: 'markdown' | 'pdf'

  @ApiPropertyOptional({ description: '状态', enum: ['draft', 'published', 'archived'] })
  status?: 'draft' | 'published' | 'archived'
}
