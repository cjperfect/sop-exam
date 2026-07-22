import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SopDocument } from '@sop/shared'
import { createSop, updateSop, fetchSops } from '@/features/sops/api'
import { FileText, Send, X } from 'lucide-react'


const STORAGE_KEY = "sop-form-draft";

function loadDraft(): SopFormValues | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(values: SopFormValues) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch { /* quota exceeded, ignore */ }
}

function clearDraft() {
  sessionStorage.removeItem(STORAGE_KEY);
}

const formSchema = z.object({
  title: z.string().min(1, '请输入 SOP 标题。'),
  department: z.string().min(1, '请选择部门。'),
  content: z.string().min(10, '请输入 SOP 正文内容。'),
})

type SopFormValues = z.infer<typeof formSchema>

interface SopFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 传入 SOP 则为编辑模式，否则为新建模式 */
  sop?: SopDocument | null
}

export function SopFormDialog({ open, onOpenChange, sop }: SopFormDialogProps) {
  const isEdit = !!sop
  const queryClient = useQueryClient()

  const { data: departments = [] } = useQuery({
    queryKey: ["sops-departments"],
    queryFn: async () => {
      const res = await fetchSops({ page: 1, pageSize: 100 });
      return [...new Set(res.items.map((s) => s.department))].sort();
    },
    staleTime: 5 * 60 * 1000,
  })

  const form = useForm<SopFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', department: '', content: '' },
  })

  // 编辑模式：预填数据 / 新建模式：恢复草稿
  useEffect(() => {
    if (sop) {
      form.reset({
        title: sop.title,
        department: sop.department,
        content: sop.content,
      })
    } else if (open) {
      const draft = loadDraft()
      form.reset(draft ?? { title: '', department: '', content: '' })
    } else {
      form.reset({ title: '', department: '', content: '' })
    }
  }, [sop, open, form])

  // 表单数据变化时自动保存草稿
  useEffect(() => {
    if (isEdit || !open) return
    const sub = form.watch((values) => {
      if (values.title || values.department || values.content) {
        saveDraft(values as SopFormValues)
      }
    })
    return () => sub.unsubscribe()
  }, [isEdit, open, form])

  // 创建
  const createMutation = useMutation({
    mutationFn: (input: { title: string; department: string; content: string; status: string }) =>
      createSop(input as Partial<SopDocument>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops'] })
      toast.success('SOP 已添加')
      clearDraft()
      form.reset()
      onOpenChange(false)
    },
  })

  // 更新
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SopDocument> }) =>
      updateSop(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops'] })
      toast.success('SOP 已更新')
      clearDraft()
      onOpenChange(false)
    },
  })

  function handleCreate(status: string) {
    form.handleSubmit((values: SopFormValues) => {
      createMutation.mutate({ ...values, status })
    })()
  }

  function handleUpdate(values: SopFormValues) {
    if (!sop) return
    updateMutation.mutate({
      id: String(sop.id),
      input: { title: values.title, department: values.department, content: values.content },
    })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='flex flex-col sm:max-w-[96vw] h-[96vh]'
      >
        {/* Header */}
        <DialogHeader>
          <div className='flex items-start justify-between gap-2'>
            <div>
              <DialogTitle>{isEdit ? '编辑 SOP' : '添加 SOP'}</DialogTitle>
              <DialogDescription>
                {isEdit ? '修改 SOP 文档内容。' : '添加新的 SOP 文档。'}
              </DialogDescription>
            </div>
            <div className='flex shrink-0 items-center gap-1'>
              <Button variant='ghost' size='icon' className='size-8' onClick={() => onOpenChange(false)}>
                <X className='size-4' />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <Form {...form}>
          <form
            id='sop-form'
            onSubmit={isEdit ? form.handleSubmit(handleUpdate) : undefined}
            className='flex flex-1 min-h-0 flex-col space-y-4'
          >
            <div className='shrink-0 space-y-4'>
              <FormField control={form.control} name='title' render={({ field }) => (
                <FormItem>
                  <FormLabel required>标题</FormLabel>
                  <FormControl><Input placeholder='SOP 标题' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name='department' render={({ field }) => (
                <FormItem>
                  <FormLabel required>部门</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder='选择部门' /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name='content' render={({ field }) => (
              <FormItem className='flex flex-1 min-h-0 flex-col'>
                <FormLabel required className='shrink-0'>正文</FormLabel>
                <FormControl>
                  <div className='flex-1 min-h-0'>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='在此编辑 SOP 正文内容...'
                      className='h-full'
                      minHeight='400px'
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </form>
        </Form>

        {/* Footer */}
        <DialogFooter className='gap-2 shrink-0'>
          {isEdit ? (
            <Button type='submit' form='sop-form' disabled={isPending}>保存</Button>
          ) : (
            <>
              <Button variant='outline' onClick={() => handleCreate('draft')} disabled={isPending}>
                <FileText className='mr-1 h-4 w-4' />存草稿
              </Button>
              <Button onClick={() => handleCreate('published')} disabled={isPending}>
                <Send className='mr-1 h-4 w-4' />发布
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
