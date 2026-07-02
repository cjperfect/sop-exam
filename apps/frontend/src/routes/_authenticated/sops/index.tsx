import { createFileRoute } from '@tanstack/react-router'
import { SopList } from '@/features/sops'

export const Route = createFileRoute('/_authenticated/sops/')({
  component: SopList,
})
