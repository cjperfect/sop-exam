import { createFileRoute } from '@tanstack/react-router'
import { ExamTake } from '@/features/exams/take'

export const Route = createFileRoute('/_authenticated/sops/$sopId/exam/')({
  component: ExamTake,
})
