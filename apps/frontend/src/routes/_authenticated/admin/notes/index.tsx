import { createFileRoute } from '@tanstack/react-router'
import { AdminNotes } from '@/features/admin/notes'

export const Route = createFileRoute('/_authenticated/admin/notes/')({
  component: AdminNotes,
})
