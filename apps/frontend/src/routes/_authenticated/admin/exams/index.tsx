import { createFileRoute } from '@tanstack/react-router'
import { AdminExams } from '@/features/admin/exams'

export const Route = createFileRoute('/_authenticated/admin/exams/')({
  component: AdminExams,
})
