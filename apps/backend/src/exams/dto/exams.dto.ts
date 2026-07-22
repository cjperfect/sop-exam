import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class QuestionDto {
  @ApiProperty({ description: '题目类型' })
  type!: string

  @ApiProperty({ description: '题目内容' })
  content!: string

  @ApiProperty({ description: '选项 (JSON 字符串)' })
  options!: string

  @ApiProperty({ description: '正确答案' })
  answer!: string

  @ApiProperty({ description: '解析' })
  explanation!: string

  @ApiProperty({ description: '分值' })
  score!: number

  @ApiProperty({ description: '排序' })
  sortOrder!: number

  @ApiPropertyOptional({ description: '关联 SOP 段落' })
  sopSource?: string
}

export class CreateExamDto {
  @ApiProperty({ description: 'SOP ID' })
  sopId!: number

  @ApiProperty({ description: 'SOP 标题' })
  sopTitle!: string

  @ApiProperty({ description: '考试标题' })
  title!: string

  @ApiProperty({ description: '考试描述' })
  description!: string

  @ApiProperty({ description: '总题数' })
  totalQuestions!: number

  @ApiProperty({ description: '总分' })
  totalScore!: number

  @ApiProperty({ description: '题目列表' })
  questions!: QuestionDto[]
}
