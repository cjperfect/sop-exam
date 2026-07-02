import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SopDetail } from '@/features/sops/detail'

const searchSchema = z.object({
  examResult: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/sops/$sopId/')({
  component: SopDetail,
  validateSearch: searchSchema,
})
