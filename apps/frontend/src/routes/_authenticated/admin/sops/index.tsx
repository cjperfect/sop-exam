import { createFileRoute } from '@tanstack/react-router'
import { AdminSops } from '@/features/admin/sops'

export const Route = createFileRoute('/_authenticated/admin/sops/')({
  component: AdminSops,
})
