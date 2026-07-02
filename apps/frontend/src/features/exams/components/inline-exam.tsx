import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react'
import { ExamTimer } from './exam-timer'
import { ExamProgress } from './exam-progress'
import { ExamQuestion } from './exam-question'
import { generateExam } from '../services/exam-generator'
import { gradeExam } from '../services/exam-grader'
import { createExam, createSubmission } from '../api'
import { fetchExamConfig } from '../api/exam-config'
import type { Question } from '../data/question-schema'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ExamResultDialog } from '@/components/exam-result-dialog'
import type { SopDocument } from '@sop/shared'

interface InlineExamProps {
  sop: SopDocument
  onBack: () => void
}

export function InlineExam({ sop, onBack }: InlineExamProps) {
  const currentUser = useAuthStore((s) => s.auth.user)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [examId, setExamId] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const [timeLimit, setTimeLimit] = useState(15)
  const [startedAt] = useState(new Date())
  const [exitOpen, setExitOpen] = useState(false)
  const [resultOpen, setResultOpen] = useState(false)
  const [resultId, setResultId] = useState<string | null>(null)
  const timerRunningRef = useRef(true)

  const { data: examConfig } = useQuery({
    queryKey: ['exam-config'],
    queryFn: fetchExamConfig,
  })

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!examConfig) return
      // 模拟 AI 出题延迟
      await new Promise((r) => setTimeout(r, 2000))
      if (cancelled) return
      const result = await generateExam({
        sopContent: sop.content,
        sopTitle: sop.title,
        sopId: sop.id,
        questionCount: examConfig.questionCount,
      })
      if (cancelled) return
      setQuestions(result.questions)
      setTimeLimit(examConfig.timeLimit)

      try {
        if (cancelled) return
        const saved = await createExam({
          sopId: sop.id,
          sopTitle: sop.title,
          title: result.title,
          description: result.description,
          totalQuestions: result.questions.length,
          totalScore: result.questions.reduce((sum, q) => sum + q.score, 0),
          questions: result.questions.map((q) => ({
            type: q.type,
            content: q.content,
            options: JSON.stringify(q.options ?? []),
            answer: typeof q.answer === 'string' ? q.answer : JSON.stringify(q.answer),
            explanation: q.explanation,
            score: q.score,
            sortOrder: q.sortOrder,
            sopSource: q.sopSource,
          })),
        })
        setExamId(saved.id)
        // 用数据库真实 ID 替换本地 UUID，确保答题记录能正确关联
        if (saved.questions?.length) {
          setQuestions((prev) =>
            prev.map((q, i) => ({
              ...q,
              id: String(saved.questions?.[i]?.id ?? q.id),
              examId: String(saved.id),
            })),
          )
        }
      } catch {
        // 保存失败不影响考试
      }

      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [sop, examConfig])

  const handleAnswerChange = useCallback(
    (value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [currentIndex]: value }))
    },
    [currentIndex],
  )

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    timerRunningRef.current = false

    const userAnswers = questions.map((q, i) => ({
      questionId: q.id,
      answer: answers[i] ?? '',
    }))

    const result = await gradeExam({
      questions,
      answers: userAnswers,
      userId: 'current-user',
      examTitle: `${sop.title} — 知识考核`,
      sopTitle: sop.title,
      sopId: sop.id,
    })

    const now = new Date()
    const timeSpent = Math.round((now.getTime() - startedAt.getTime()) / 1000)

    let savedId = crypto.randomUUID()

    if (examId) {
      try {
        const saved = await createSubmission({
          examId: examId,
          sopId: sop.id,
          userId: currentUser?.accountNo || 0,
          userName: currentUser?.username || '未知用户',
          startedAt: startedAt.toISOString(),
          submittedAt: now.toISOString(),
          timeSpent,
          totalScore: result.totalScore,
          totalMaxScore: result.totalMaxScore,
          isPassed: result.isPassed,
          suggestions: result.suggestions,
          answerDetails: result.answers.map((a) => ({
            questionId: Number(a.questionId),
            userAnswer: typeof a.answer === 'string' ? a.answer : JSON.stringify(a.answer),
            correctAnswer: typeof a.correctAnswer === 'string' ? a.correctAnswer : JSON.stringify(a.correctAnswer),
            isCorrect: a.isCorrect,
            aiScore: a.score,
            aiFeedback: a.aiFeedback,
          })),
        })
        savedId = saved.id
      } catch {
        // 后端保存失败不影响
      }
    }

    await new Promise((r) => setTimeout(r, 1500))

    submittingRef.current = false
    setSubmitting(false)
    setResultId(savedId)
    setResultOpen(true)
  }, [questions, answers, sop, startedAt, examId])

  const handleTimeout = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  const handleWarning = useCallback(() => {
    toast.warning('⏰ 距离考试结束还有 1 分钟，请尽快作答！')
  }, [])

  // 加载动画
  if (loading) {
    return (
      <div className='flex items-center justify-center py-24'>
        <div className='space-y-6 text-center'>
          <div className='relative mx-auto flex h-20 w-20 items-center justify-center'>
            <div className='absolute inset-0 animate-ping rounded-full bg-primary/20' />
            <div className='absolute inset-2 animate-pulse rounded-full bg-primary/30' />
            <div className='relative flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30'>
              <svg className='h-6 w-6 animate-spin text-primary-foreground' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
              </svg>
            </div>
          </div>
          <div className='space-y-2'>
            <p className='text-lg font-semibold tracking-tight'>AI 正在生成试卷</p>
            <p className='text-sm text-muted-foreground animate-pulse'>正在分析 SOP 内容，智能出题中...</p>
          </div>
          <div className='mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-muted'>
            <div className='h-full w-full origin-left animate-[loading-bar_2s_ease-in-out_infinite] rounded-full bg-primary' />
          </div>
          <style>{`@keyframes loading-bar { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }`}</style>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <>
      {/* 顶部栏 */}
      <div className='mb-4 flex items-center justify-between'>
        <Button variant='ghost' size='sm' onClick={() => setExitOpen(true)}>
          <ArrowLeft className='mr-1 h-4 w-4' />
          退出考试
        </Button>
        <div className='flex items-center gap-4'>
          <span className='text-sm font-medium'>{sop.title}</span>
          <ExamTimer
            timeLimit={timeLimit}
            onTimeout={handleTimeout}
            onWarning={handleWarning}
            running={timerRunningRef.current && !submitting}
          />
        </div>
        <div className='w-20' />
      </div>

      <Separator className='mb-6' />

      {/* 试题区域 */}
      <div className='mx-auto max-w-3xl'>
        <div className='mb-6'>
          <ExamProgress
            current={currentIndex + 1}
            total={questions.length}
            answers={answers}
          />
        </div>

        <Separator className='mb-6' />

        {currentQuestion && (
          <ExamQuestion
            question={currentQuestion}
            index={currentIndex}
            value={answers[currentIndex] ?? ''}
            onChange={handleAnswerChange}
          />
        )}

        <div className='mt-8 flex items-center justify-between'>
          <Button
            variant='outline'
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className='mr-1 h-4 w-4' />
            上一题
          </Button>
          <span className='text-sm text-muted-foreground'>
            已答 {Object.keys(answers).length} / {questions.length} 题
          </span>
          {currentIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}>
              下一题
              <ChevronRight className='ml-1 h-4 w-4' />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className='bg-teal-600 hover:bg-teal-700'
            >
              {submitting ? (
                <><Loader2 className='mr-2 h-4 w-4 animate-spin' />批改中...</>
              ) : (
                <><Send className='mr-1 h-4 w-4' />交卷</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 退出确认 */}
      <ConfirmDialog
        open={exitOpen}
        onOpenChange={setExitOpen}
        title='退出考试'
        desc='确定要退出当前考试吗？当前答题进度将不会保存。'
        confirmText='确认退出'
        cancelBtnText='继续答题'
        destructive
        handleConfirm={() => {
          timerRunningRef.current = false
          onBack()
        }}
      />

      {/* 成绩弹窗 */}
      <ExamResultDialog
        open={!!resultId && resultOpen}
        onOpenChange={(o) => { if (!o) { setResultOpen(false); onBack() } }}
        submissionId={resultId}
      />
    </>
  )
}
