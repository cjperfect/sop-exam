import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUsers } from './users-provider'
import { createUser, updateUser } from '../api'
import { SOP_DEPARTMENTS, ROLE_LABELS } from '@sop/shared'
import type { User } from '@sop/shared'
import { useAuthStore } from '@/stores/auth-store'
import { Copy, Check } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const formSchema = z.object({
  username: z.string().min(1, '请填写用户名。'),
  employeeId: z.string().min(1, '请填工号。'),
  department: z.string().min(1, '请选择部门。'),
  role: z.string().optional(),
})

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: UserActionDialogProps) {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.auth.user)
  const isEdit = !!currentRow
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const currentRole = currentUser?.role?.[0] || ''
  // 超级管理员可选 admin/user，管理员只能选 user
  const roleOptions = currentRole === 'super_admin'
    ? [{ value: 'admin', label: ROLE_LABELS.admin }, { value: 'user', label: ROLE_LABELS.user }]
    : [{ value: 'user', label: ROLE_LABELS.user }]

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? { username: currentRow.username, employeeId: currentRow.employeeId || '', department: currentRow.department || '' }
      : { username: '', employeeId: '', department: '', role: 'user' },
  })

  const createMutation = useMutation({
    mutationFn: (input: Partial<User>) => createUser(input),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      if (data?.rawPassword) {
        setGeneratedPassword(data.rawPassword)
      } else {
        toast.success('新用户已添加')
        form.reset()
        onOpenChange(false)
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<User> }) => updateUser(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('用户信息已更新')
      form.reset()
      onOpenChange(false)
    },
    onError: () => toast.error('更新失败'),
  })

  const onSubmit = (values: UserForm) => {
    if (isEdit && currentRow) {
      updateMutation.mutate({ id: currentRow.id, input: { username: values.username, employeeId: values.employeeId, department: values.department } })
    } else {
      createMutation.mutate({ username: values.username, employeeId: values.employeeId, department: values.department, role: values.role || 'user' })
    }
  }

  const copyPassword = async () => {
    await copyToClipboard(generatedPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const closeAfterShow = () => {
    setGeneratedPassword('')
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(state) => {
      if (!state) { form.reset(); form.clearErrors(); setGeneratedPassword('') }
      onOpenChange(state)
    }}>
      <DialogContent className='sm:max-w-md'>
        {generatedPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>用户已创建</DialogTitle>
              <DialogDescription>首次登录必须修改密码，请将以下初始密码告知用户。</DialogDescription>
            </DialogHeader>
            <div className='rounded-lg border bg-muted/30 p-4 text-center'>
              <p className='mb-2 text-sm text-muted-foreground'>初始密码</p>
              <p className='mb-3 text-2xl font-mono font-bold tracking-wider'>{generatedPassword}</p>
              <Button variant='outline' size='sm' onClick={copyPassword}>
                {copied ? <><Check className='mr-1 h-4 w-4' />已复制</> : <><Copy className='mr-1 h-4 w-4' />复制密码</>}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={closeAfterShow}>关闭</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{isEdit ? '编辑用户' : '添加新用户'}</DialogTitle>
              <DialogDescription>{isEdit ? '修改用户信息。' : '创建新用户，系统将自动生成初始密码。'}</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form id='user-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField control={form.control} name='username' render={({ field }) => (
                  <FormItem>
                    <FormLabel required>用户名</FormLabel>
                    <FormControl><Input placeholder='zhangsan' {...field} disabled={isEdit} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name='employeeId' render={({ field }) => (
                  <FormItem>
                    <FormLabel required>工号</FormLabel>
                    <FormControl><Input placeholder='EMP001' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {!isEdit && (
                  <FormField control={form.control} name='role' render={({ field }) => (
                    <FormItem>
                      <FormLabel required>角色</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-4'>
                          {roleOptions.map((r) => (
                            <div key={r.value} className='flex items-center gap-2'>
                              <RadioGroupItem value={r.value} id={`role-${r.value}`} />
                              <Label htmlFor={`role-${r.value}`}>{r.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <FormField control={form.control} name='department' render={({ field }) => (
                  <FormItem>
                    <FormLabel required>部门</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder='选择部门' /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOP_DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </form>
            </Form>
            <DialogFooter>
              <Button type='submit' form='user-form'>{isEdit ? '保存' : '创建'}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
