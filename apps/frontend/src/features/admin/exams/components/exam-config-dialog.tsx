import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { fetchExamConfig, updateExamConfig } from '@/features/exams/api/exam-config'
import type { ExamConfigData } from '@/features/exams/api/exam-config'

interface ExamConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExamConfigDialog({ open, onOpenChange }: ExamConfigDialogProps) {
  const [config, setConfig] = useState<ExamConfigData | null>(null)
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetchExamConfig().then((d) => { setConfig(d); setLoading(false) }).catch(() => setLoading(false))
    }
  }, [open])

  const updateMutation = useMutation({
    mutationFn: (input: { passingScore?: number; timeLimit?: number; questionCount?: number }) =>
      updateExamConfig(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-config'] })
      toast.success('考试配置已更新')
      onOpenChange(false)
    },
    onError: () => toast.error('更新失败'),
  })

  const handleSave = () => {
    if (!config) return
    updateMutation.mutate({
      passingScore: config.passingScore,
      totalScore: config.totalScore,
      timeLimit: config.timeLimit,
      questionCount: config.questionCount,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md' onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>考试配置</DialogTitle>
        </DialogHeader>
        <p className='text-sm text-muted-foreground'>
          以下配置将作为 AI 生成试卷时的参考标准。
        </p>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='cfg-total'>满分</Label>
            <Input
              id='cfg-total' type='number' min={1} max={1000}
              value={config?.totalScore ?? ''}
              onChange={(e) => setConfig((c) => c ? { ...c, totalScore: Number(e.target.value) } : c)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='cfg-passing'>及格分数</Label>
            <Input
              id='cfg-passing' type='number' min={0} max={1000}
              value={config?.passingScore ?? ''}
              onChange={(e) => setConfig((c) => c ? { ...c, passingScore: Number(e.target.value) } : c)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='cfg-time'>考试时间（分钟）</Label>
            <Input
              id='cfg-time' type='number' min={1} max={180}
              value={config?.timeLimit ?? ''}
              onChange={(e) => setConfig((c) => c ? { ...c, timeLimit: Number(e.target.value) } : c)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='cfg-count'>题目数量</Label>
            <Input
              id='cfg-count' type='number' min={1} max={50}
              value={config?.questionCount ?? ''}
              onChange={(e) => setConfig((c) => c ? { ...c, questionCount: Number(e.target.value) } : c)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
