import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { ExamTimer } from './components/exam-timer'
import { ExamProgress } from './components/exam-progress'
import { ExamQuestion } from './components/exam-question'
import { generateExam } from './services/exam-generator'
import { gradeExam } from './services/exam-grader'
import { fetchSop } from '@/features/sops/api'
import { createExam, createSubmission } from './api'
import { fetchExamConfig } from './api/exam-config'
import type { Question } from './data/question-schema'
import type { Submission } from './data/submission-schema'

export function ExamTake() {
  const { sopId } = useParams({ from: '/_authenticated/sops/$sopId/exam/' })
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.auth.user)

  const { data: sop } = useQuery({
    queryKey: ['sops', sopId],
    queryFn: () => fetchSop(sopId),
  })

  const { data: examConfig } = useQuery({
    queryKey: ['exam-config'],
    queryFn: fetchExamConfig,
  })

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [examId, setExamId] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [timeLimit, setTimeLimit] = useState(15)
  const [startedAt] = useState(new Date())
  const [exitOpen, setExitOpen] = useState(false)
  const timerRunningRef = useRef(true)

  useEffect(() => {
    async function load() {
      if (!sop || !examConfig) {
        setLoading(false)
        return
      }
      // 模拟 AI 出题延迟（后续对接真实 AI）
      await new Promise((r) => setTimeout(r, 2000))
      const result = await generateExam({
        sopContent: sop.content,
        sopTitle: sop.title,
        sopId: sop.id,
        questionCount: examConfig.questionCount,
      })
      setQuestions(result.questions)
      setTimeLimit(result.timeLimit)

      // 保存试卷到数据库
      try {
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
      } catch {
        // 保存失败不影响考试
      }

      setLoading(false)
    }
    load()
  }, [sop, examConfig])

  const handleAnswerChange = useCallback(
    (value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [currentIndex]: value }))
    },
    [currentIndex],
  )

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)
    timerRunningRef.current = false

    if (!sop) return

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
    const submission: Submission = {
      id: crypto.randomUUID(),
      examId: examId ?? sop.id,
      sopId: sop.id,
      sopTitle: sop.title,
      userId: currentUser?.accountNo || 0,
      userName: String(currentUser?.accountNo ?? '') || '未知用户',
      answers: result.answers,
      totalScore: result.totalScore,
      totalMaxScore: result.totalMaxScore,
      passingScore: 60,
      isPassed: result.isPassed,
      startedAt,
      submittedAt: now,
      timeSpent: Math.round((now.getTime() - startedAt.getTime()) / 1000),
      attemptNumber: 1,
      suggestions: result.suggestions,
    }

    // 持久化到后端数据库
    let savedId = submission.id
    try {
      const saved = await createSubmission({
        ...submission,
        answers: JSON.stringify(submission.answers),
      })
      savedId = saved.id
    } catch {
      // 后端保存失败不影响前端展示
    }

    // 延迟模拟 AI 批卷
    await new Promise((r) => setTimeout(r, 1500))

    // 回到 SOP 详情页并弹出成绩
    navigate({ to: `/sops/${sop.id}`, search: { examResult: savedId } })
  }, [questions, answers, sop, startedAt, submitting, navigate, examId])

  const handleTimeout = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  if (!sop) {
    return (
      <div className='flex items-center justify-center py-16 text-muted-foreground'>
        <p>文档不存在</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-linear-to-b from-background to-muted/30'>
        <div className='space-y-6 text-center'>
          {/* 动画图标 */}
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
          {/* 文字 */}
          <div className='space-y-2'>
            <p className='text-lg font-semibold tracking-tight'>AI 正在生成试卷</p>
            <p className='text-sm text-muted-foreground animate-pulse'>
              正在分析 SOP 内容，智能出题中...
            </p>
          </div>
          {/* 进度条 */}
          <div className='mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-muted'>
            <div className='h-full w-full origin-left animate-[loading-bar_2s_ease-in-out_infinite] rounded-full bg-primary' />
          </div>
        </div>
        <style>{`@keyframes loading-bar { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }`}</style>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className='flex min-h-screen flex-col'>
      <Header fixed>
        <div className='flex w-full items-center justify-between'>
          <Button variant='ghost' size='sm' onClick={() => setExitOpen(true)}>
            <ArrowLeft className='mr-1 h-4 w-4' />
            退出考试
          </Button>
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
              navigate({ to: `/sops/${sop.id}` })
            }}
          />
          <div className='flex items-center gap-4'>
            <span className='text-sm font-medium'>{sop.title}</span>
            <ExamTimer
              timeLimit={timeLimit}
              onTimeout={handleTimeout}
              running={timerRunningRef.current && !submitting}
            />
          </div>
          <div className='w-20' />
        </div>
      </Header>

      <Main className='flex-1'>
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
              <Button
                onClick={() =>
                  setCurrentIndex((i) =>
                    Math.min(questions.length - 1, i + 1),
                  )
                }
              >
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
                  <>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    批改中...
                  </>
                ) : (
                  <>
                    <Send className='mr-1 h-4 w-4' />
                    交卷
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Main>
    </div>
  )
}
