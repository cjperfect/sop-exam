import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, XCircle, BookOpen, Clock, Trophy, ListChecks, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchSubmission } from '@/features/exams/api'

interface QuestionData {
  id: string
  type: string
  content: string
  options: string
  answer: string
  explanation: string
  score: number
  sortOrder: number
  sopSource: string
}

interface ExamPreviewData {
  id: string
  title: string
  sopTitle: string
  totalQuestions: number
  totalScore: number
  passingScore: number
  timeLimit: number
  status: string
  createdAt: string
  questions: QuestionData[]
}

const typeLabels: Record<string, string> = {
  single_choice: '单选题',
  multi_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
}

/** 安全解析 options — 兼容已解析的对象和 JSON 字符串 */
function parseOptions(options: unknown): { key: string; value: string }[] {
  if (Array.isArray(options)) return options as { key: string; value: string }[]
  if (typeof options === 'string') {
    try { return JSON.parse(options) } catch { return [] }
  }
  return []
}

/** 判断 options 是否为空 */
function isOptionsEmpty(options: unknown): boolean {
  if (Array.isArray(options)) return options.length === 0
  if (typeof options === 'string') return options === '' || options === '[]'
  return true
}

interface ExamResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 考试批卷结果模式（从 sessionStorage 读取） */
  submissionId?: string | null
  /** 考试预览模式（管理员查看考试详情） */
  preview?: ExamPreviewData | null
}

export function ExamResultDialog({ open, onOpenChange, submissionId, preview }: ExamResultDialogProps) {
  const isPreview = !!preview

  const { data: submission, isLoading } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () => fetchSubmission(submissionId!),
    enabled: !!submissionId && !isPreview,
  })

  if (!isPreview && isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-2xl flex flex-col max-h-[85vh]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-xl'>
              <Trophy className='h-5 w-5' /> 考试结果
            </DialogTitle>
          </DialogHeader>
          <div className='flex items-center justify-center py-12 text-muted-foreground'>
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            加载中...
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!isPreview && !submission) return null
  if (isPreview && !preview) return null

  // --- 预览模式数据 ---
  const previewTitle = preview?.title ?? ''
  const previewQuestions = preview?.questions ?? []
  const previewInfo = preview ? {
    totalQuestions: preview.totalQuestions,
    totalScore: preview.totalScore,
    passingScore: preview.passingScore,
    timeLimit: preview.timeLimit,
    status: preview.status,
    createdAt: preview.createdAt,
  } : null

  // --- 批卷模式数据 ---
  // 后端现在返回的 answers 是已解析的数组，且 options 也可能是已解析对象
  const s = isPreview
    ? null
    : {
        ...submission!,
        answers: Array.isArray(submission!.answers)
          ? submission!.answers
          : typeof submission!.answers === 'string'
            ? JSON.parse(submission!.answers)
            : [],
      }
  const correctCount = s?.answers?.filter((a: any) => a.isCorrect).length ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl flex flex-col max-h-[85vh]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            {isPreview ? (
              <><ListChecks className='h-5 w-5' /> 考试详情</>
            ) : (
              <><Trophy className={cn('h-5 w-5', s?.isPassed ? 'text-amber-500' : 'text-muted-foreground')} /> 考试结果</>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* 固定顶部：概览信息 */}
        <div className='shrink-0 space-y-3'>
          <div className={cn('rounded-lg border p-5 text-center')}>
            <p className='text-sm text-muted-foreground'>{isPreview ? previewTitle : s?.sopTitle}</p>
            <div className='mt-2 flex items-center justify-center gap-3'>
              <span className='text-4xl font-bold text-teal-600'>{s?.totalScore ?? '-'}</span>
              <span className='text-lg text-muted-foreground'>/ {s?.totalMaxScore ?? previewInfo?.totalScore ?? 0}</span>
            </div>
            <div className='mt-2 flex items-center justify-center gap-4 text-sm text-muted-foreground'>
              {!isPreview && s && (
                <>
                  <span className='flex items-center gap-1'><CheckCircle2 className='h-4 w-4 text-teal-600' />正确 {correctCount}/{s.answers.length}</span>
                  <span className='flex items-center gap-1'><Clock className='h-4 w-4' />{Math.floor(s.timeSpent / 60)} 分 {s.timeSpent % 60} 秒</span>
                </>
              )}
              <span className='text-muted-foreground'>总计 {isPreview ? previewInfo!.totalQuestions : s?.answers.length} 题 / {isPreview ? previewInfo!.totalScore : s?.totalMaxScore} 分</span>
            </div>
          </div>
        </div>

        <Separator className='shrink-0' />

        {/* 可滚动区域：题目列表 / 逐题回顾 */}
        <div className='min-h-0 flex-1 space-y-4 overflow-y-auto pr-1'>
          <h3 className='text-sm font-semibold text-muted-foreground'>{isPreview ? '题目列表' : '逐题回顾'}</h3>
          {(isPreview ? previewQuestions : (s?.answers ?? [])).map((item: any, i: number) => {
            const q = isPreview ? item : item
            const qType = isPreview ? q.type : q.questionType
            const qContent = isPreview ? q.content : q.questionContent
            const qScore = isPreview ? q.score : q.maxScore
            const isCorrect = isPreview ? true : q.isCorrect

            return (
              <div key={q.id ?? i} className={cn('rounded-lg border p-4 transition-colors', isPreview ? '' : isCorrect ? 'border-teal-500/20 bg-teal-50/50 dark:bg-teal-950/10' : 'border-destructive/20 bg-destructive/5')}>
                <div className='mb-2 flex items-start justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline'>{i + 1}</Badge>
                    <Badge variant='secondary' className='text-xs'>{typeLabels[qType] || qType}</Badge>
                    <span className='text-xs text-muted-foreground'>{qScore} 分</span>
                  </div>
                  {!isPreview && (isCorrect ? <CheckCircle2 className='h-5 w-5 shrink-0 text-teal-600' /> : <XCircle className='h-5 w-5 shrink-0 text-destructive' />)}
                </div>

                <p className='mb-3 text-sm font-medium'>{qContent}</p>

                {q.options && !isOptionsEmpty(q.options) && (
                  <div className='mb-2 space-y-1 text-sm text-muted-foreground'>
                    {parseOptions(q.options).map((opt: any) => (
                      <div key={opt.key} className='flex items-center gap-2'>
                        <span className='inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs'>{opt.key.toUpperCase()}</span>
                        {opt.value}
                      </div>
                    ))}
                  </div>
                )}

                {isPreview ? (
                  <div className='flex gap-2 text-sm'>
                    <span className='text-muted-foreground'>正确答案：</span>
                    <span className='text-teal-700 font-medium'>{q.answer}</span>
                  </div>
                ) : (
                  <div className='space-y-1 text-sm'>
                    <div className='flex gap-2'>
                      <span className='shrink-0 text-muted-foreground'>你的答案：</span>
                      <span className={isCorrect ? 'text-teal-700' : 'text-destructive'}>{String(q.answer) || '未作答'}</span>
                    </div>
                    {!isCorrect && (
                      <div className='flex gap-2'>
                        <span className='shrink-0 text-muted-foreground'>正确答案：</span>
                        <span className='text-teal-700'>{String(q.correctAnswer)}</span>
                      </div>
                    )}
                  </div>
                )}

                {!isPreview && q.aiFeedback && (
                  <div className='mt-2 flex gap-2 rounded-md bg-muted/50 p-2 text-sm text-muted-foreground'>
                    <BookOpen className='mt-0.5 h-4 w-4 shrink-0' />
                    <span>{q.aiFeedback}</span>
                  </div>
                )}

                {isPreview && q.explanation && (
                  <div className='mt-2 flex gap-2 rounded-md bg-muted/50 p-2 text-sm text-muted-foreground'>
                    <BookOpen className='mt-0.5 h-4 w-4 shrink-0' />
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className='shrink-0 pt-2'>
          <Button variant='outline' className='w-full' onClick={() => onOpenChange(false)}>关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
