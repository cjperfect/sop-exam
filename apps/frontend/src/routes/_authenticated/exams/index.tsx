import { createFileRoute } from '@tanstack/react-router'
import { ExamHistory } from '@/features/exams'

export const Route = createFileRoute('/_authenticated/exams/')({
  component: ExamHistory,
})
