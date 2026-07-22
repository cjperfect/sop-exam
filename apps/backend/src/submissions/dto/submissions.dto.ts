import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** 答题详情 */
export class AnswerDetailDto {
  @ApiProperty({ description: '题目 ID' })
  questionId!: number

  @ApiPropertyOptional({ description: '用户答案' })
  userAnswer?: string

  @ApiPropertyOptional({ description: '正确答案' })
  correctAnswer?: string

  @ApiPropertyOptional({ description: '是否正确' })
  isCorrect?: boolean

  @ApiPropertyOptional({ description: 'AI 评分' })
  aiScore?: number

  @ApiPropertyOptional({ description: 'AI 反馈' })
  aiFeedback?: string
}

/** 创建考试记录 */
export class CreateSubmissionDto {
  @ApiProperty({ description: '考试 ID' })
  examId!: number

  @ApiProperty({ description: 'SOP ID' })
  sopId!: number

  @ApiPropertyOptional({ description: '答题详情列表', type: [AnswerDetailDto] })
  answerDetails?: AnswerDetailDto[]
}
