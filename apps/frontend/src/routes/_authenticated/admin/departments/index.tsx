import { createFileRoute } from '@tanstack/react-router'
import { AdminDepartments } from '@/features/admin/departments'

export const Route = createFileRoute('/_authenticated/admin/departments/')({
  component: AdminDepartments,
})
