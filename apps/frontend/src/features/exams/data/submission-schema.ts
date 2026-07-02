import { z } from 'zod'

const answerRecordSchema = z.object({
  questionId: z.number(),
  questionType: z.enum(['single_choice', 'multi_choice', 'true_false', 'fill_blank']),
  questionContent: z.string(),
  answer: z.union([z.string(), z.array(z.string())]),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  isCorrect: z.boolean(),
  score: z.number(),
  maxScore: z.number(),
  aiFeedback: z.string().optional(),
  sopSource: z.string().optional(),
})

const submissionSchema = z.object({
  id: z.number(),
  examId: z.number(),
  examTitle: z.string(),
  sopId: z.number(),
  sopTitle: z.string(),
  userId: z.number(),
  userName: z.string(),
  answers: z.array(answerRecordSchema),
  totalScore: z.number(),
  totalMaxScore: z.number(),
  passingScore: z.number(),
  isPassed: z.boolean(),
  startedAt: z.coerce.date(),
  submittedAt: z.coerce.date(),
  timeSpent: z.number(),           // 秒
  suggestions: z.string(),
})
export type Submission = z.infer<typeof submissionSchema>
export type AnswerRecord = z.infer<typeof answerRecordSchema>
