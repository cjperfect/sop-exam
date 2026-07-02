import { createFileRoute } from '@tanstack/react-router'
import { ExamResult } from '@/features/exams/result'

export const Route = createFileRoute(
  '/_authenticated/exams/$submissionId/result',
)({
  component: ExamResult,
})
