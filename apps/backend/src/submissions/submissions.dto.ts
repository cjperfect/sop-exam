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

  @ApiProperty({ description: '用户 ID' })
  userId!: number

  @ApiPropertyOptional({ description: '用户名称' })
  userName?: string

  @ApiProperty({ description: '开始时间 (ISO 字符串)' })
  startedAt!: string

  @ApiPropertyOptional({ description: '提交时间 (ISO 字符串)' })
  submittedAt?: string

  @ApiPropertyOptional({ description: '用时（秒）' })
  timeSpent?: number

  @ApiPropertyOptional({ description: '总分' })
  totalScore?: number

  @ApiPropertyOptional({ description: '满分' })
  totalMaxScore?: number

  @ApiPropertyOptional({ description: '是否通过' })
  isPassed?: boolean

  @ApiPropertyOptional({ description: 'AI 学习建议' })
  suggestions?: string

  @ApiPropertyOptional({ description: '答题详情列表', type: [AnswerDetailDto] })
  answerDetails?: AnswerDetailDto[]
}
