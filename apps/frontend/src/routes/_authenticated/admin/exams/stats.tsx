import { createFileRoute } from '@tanstack/react-router'
import { AdminExamStats } from '@/features/admin/exams/stats'

export const Route = createFileRoute('/_authenticated/admin/exams/stats')({
  component: AdminExamStats,
})
