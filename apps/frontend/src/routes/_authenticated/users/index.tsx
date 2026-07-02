import z from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Users } from '@/features/users'
import { roles } from '@/features/users/data/data'
import { useAuthStore } from '@/stores/auth-store'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('invited'),
        z.literal('suspended'),
      ])
    )
    .optional()
    .catch([]),
  role: z
    .array(z.enum(roles.map((r) => r.value as (typeof roles)[number]['value'])))
    .optional()
    .catch([]),
  username: z.string().optional().catch(''),
})

function UsersGuard() {
  const user = useAuthStore((state) => state.auth.user)
  const isAdmin = user?.role?.includes('super_admin') || user?.role?.includes('admin')

  if (!isAdmin) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
        <p className='text-lg'>无权限访问</p>
        <p className='text-sm'>仅管理员可查看用户管理页面</p>
      </div>
    )
  }

  return <Users />
}

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  component: UsersGuard,
})
