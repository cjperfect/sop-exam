'use client'

import { useMemo } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { ExamResultCard } from './components/exam-result-card'
import { ExamAnswerReview } from './components/exam-answer-review'
import { ExamSuggestionPanel } from './components/exam-suggestion-panel'

export function ExamResult() {
  const { submissionId } = useParams({
    from: '/_authenticated/exams/$submissionId/result',
  })
  const navigate = useNavigate()

  const submission = useMemo(() => {
    const stored = sessionStorage.getItem('exam-submissions')
    if (!stored) return null
    const list = JSON.parse(stored)
    return list.find((s: any) => s.id === submissionId) ?? null
  }, [submissionId])

  if (!submission) {
    return (
      <>
        <Header />
        <Main>
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
            <p className='text-lg'>未找到考试记录</p>
            <Button asChild variant='link'>
              <Link to='/exams'>查看考试历史</Link>
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const correctCount = submission.answers.filter(
    (a: any) => a.isCorrect,
  ).length

  return (
    <>
      <Header>
        <div className='flex items-center gap-2 me-auto'>
          <Button variant='ghost' onClick={() => navigate({ to: '/exams' })}>
            <ArrowLeft className='mr-1 h-4 w-4' />
            返回列表
          </Button>
        </div>
      </Header>

      <Main>
        <div className='mx-auto max-w-3xl'>
          <div className='mb-6'>
            <h1 className='text-2xl font-bold tracking-tight'>
              {submission.sopTitle}
            </h1>
            <p className='text-muted-foreground'>考试结果</p>
          </div>

          <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5'>
            <div className='lg:col-span-2'>
              <ExamResultCard
                totalScore={submission.totalScore}
                totalMaxScore={submission.totalMaxScore}
                isPassed={submission.isPassed}
                timeSpent={submission.timeSpent}
                totalQuestions={submission.answers.length}
                correctCount={correctCount}
              />
            </div>

            <div className='lg:col-span-3'>
              <div className='space-y-6'>
                <ExamSuggestionPanel suggestions={submission.suggestions} />

                <div className='flex gap-3'>
                  <Button asChild>
                    <Link to={`/sops/${submission.sopId}/exam`}>
                      <RotateCcw className='mr-1 h-4 w-4' />
                      重新考试
                    </Link>
                  </Button>
                  <Button variant='outline' asChild>
                    <Link to={`/sops/${submission.sopId}`}>
                      查看 SOP 原文
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <ExamAnswerReview answers={submission.answers} />
        </div>
      </Main>
    </>
  )
}
