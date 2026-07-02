import { z } from 'zod'

const examStatusSchema = z.enum(['draft', 'published', 'closed'])
export type ExamStatus = z.infer<typeof examStatusSchema>

export const examStatusLabels: Record<ExamStatus, string> = {
  draft: '草稿',
  published: '已发布',
  closed: '已结束',
}

const examSchema = z.object({
  id: z.string(),
  sopId: z.string(),
  sopTitle: z.string(),
  title: z.string(),
  description: z.string(),
  totalQuestions: z.number(),
  totalScore: z.number(),
  passingScore: z.number(),
  timeLimit: z.number(),           // 分钟
  status: examStatusSchema,
  generatedBy: z.enum(['ai', 'manual']),
  createdBy: z.string(),
  attempts: z.number(),
  attemptCount: z.number(),        // 当前用户已尝试次数
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Exam = z.infer<typeof examSchema>
