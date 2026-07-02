import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { AxiosError } from 'axios'
import { Trash2, Pencil, KeyRound, Copy, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import type { User } from '@sop/shared'
import { useUsers } from './users-provider'
import { useAuthStore } from '@/stores/auth-store'

const ROLE_HIERARCHY: Record<string, number> = { super_admin: 3, admin: 2, user: 1 }

type DataTableRowActionsProps = {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsers()
  const currentUser = useAuthStore((s) => s.auth.user)
  const [resetOpen, setResetOpen] = useState(false)
  const [newPwd, setNewPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentRole = currentUser?.role?.[0] || ''
  const currentLevel = ROLE_HIERARCHY[currentRole] ?? 0
  const targetRole = row.original.role
  const targetLevel = ROLE_HIERARCHY[targetRole] ?? 0

  // 普通用户 → 不显示操作按钮
  const canManage = currentLevel >= 2
  // 管理员只能操作比自己级别低的用户
  const canOperate = canManage && (currentLevel > targetLevel || currentRole === 'super_admin')

  if (!canOperate) return null

  const handleReset = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/reset-password', { userId: row.original.id })
      const pwd = (data as any).rawPassword || data
      setNewPwd(pwd)
      toast.success('密码已重置')
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.message || '操作失败' : '网络错误'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const copyPassword = async () => {
    await copyToClipboard(newPwd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <div className='flex items-center gap-1'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' onClick={() => { setCurrentRow(row.original); setOpen('edit') }}>
              <Pencil size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>编辑</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' onClick={() => setResetOpen(true)}>
              <KeyRound size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>重置密码</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' className='text-destructive' onClick={() => { setCurrentRow(row.original); setOpen('delete') }}>
              <Trash2 size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className='sm:max-w-sm'>
          {newPwd ? (
            <>
              <DialogHeader>
                <DialogTitle>密码已重置</DialogTitle>
                <DialogDescription>请将新密码告知用户，首次登录后必须修改。</DialogDescription>
              </DialogHeader>
              <div className='rounded-lg border bg-muted/30 p-4 text-center'>
                <p className='mb-2 text-sm text-muted-foreground'>新密码</p>
                <p className='mb-3 text-2xl font-mono font-bold tracking-wider'>{newPwd}</p>
                <Button variant='outline' size='sm' onClick={copyPassword}>
                  {copied ? <><Check className='mr-1 h-4 w-4' />已复制</> : <><Copy className='mr-1 h-4 w-4' />复制密码</>}
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => { setResetOpen(false); setNewPwd('') }}>关闭</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>确认重置密码</DialogTitle>
                <DialogDescription>将重置用户 <strong>{row.original.username}</strong> 的密码，重置后将生成随机密码。</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant='outline' onClick={() => setResetOpen(false)}>取消</Button>
                <Button onClick={handleReset} disabled={loading}>
                  {loading && <Loader2 className='mr-1 h-4 w-4 animate-spin' />}
                  确认重置
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
