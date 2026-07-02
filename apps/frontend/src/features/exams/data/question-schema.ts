import { z } from 'zod'

const questionTypeSchema = z.enum([
  'single_choice',
  'multi_choice',
  'true_false',
  'fill_blank',
])
export type QuestionType = z.infer<typeof questionTypeSchema>

export const questionTypeLabels: Record<QuestionType, string> = {
  single_choice: '单选题',
  multi_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
}

const questionSchema = z.object({
  id: z.string(),
  examId: z.string(),
  type: questionTypeSchema,
  content: z.string(),
  options: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
  answer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string(),
  score: z.number(),
  sortOrder: z.number(),
  sopSource: z.string(),
})
export type Question = z.infer<typeof questionSchema>
