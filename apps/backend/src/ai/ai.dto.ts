import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import type { Question } from '@sop/shared'

export class GenerateExamDto {
  @ApiProperty({ description: 'SOP 内容' })
  sopContent!: string

  @ApiProperty({ description: 'SOP 标题' })
  sopTitle!: string

  @ApiProperty({ description: 'SOP ID' })
  sopId!: number

  @ApiPropertyOptional({ description: '题目数量', default: 10 })
  questionCount?: number
}

export class GradeExamDto {
  @ApiProperty({ description: '题目列表' })
  questions!: Question[]

  @ApiProperty({ description: '用户答案', example: [{ questionId: 1, answer: 'A' }] })
  answers!: Array<{ questionId: number; answer: string | string[] }>

  @ApiProperty({ description: '用户 ID' })
  userId!: string

  @ApiProperty({ description: '考试标题' })
  examTitle!: string

  @ApiProperty({ description: 'SOP 标题' })
  sopTitle!: string

  @ApiProperty({ description: 'SOP ID' })
  sopId!: number
}
