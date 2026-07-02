import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Frown, Clock, CheckCircle2, XCircle } from 'lucide-react'

interface ExamResultCardProps {
  totalScore: number
  totalMaxScore: number
  isPassed: boolean
  timeSpent: number
  totalQuestions: number
  correctCount: number
}

export function ExamResultCard({
  totalScore,
  totalMaxScore,
  isPassed,
  timeSpent,
  totalQuestions,
  correctCount,
}: ExamResultCardProps) {
  const percentage = Math.round((totalScore / totalMaxScore) * 100)
  const minutes = Math.floor(timeSpent / 60)
  const seconds = timeSpent % 60

  return (
    <Card
      className={cn(
        'overflow-hidden border-2',
        isPassed ? 'border-teal-500/30' : 'border-destructive/30',
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center justify-center px-6 py-10',
          isPassed
            ? 'bg-gradient-to-b from-teal-500/10 to-transparent'
            : 'bg-gradient-to-b from-destructive/10 to-transparent',
        )}
      >
        {isPassed ? (
          <Trophy className='mb-3 h-12 w-12 text-teal-600' />
        ) : (
          <Frown className='mb-3 h-12 w-12 text-destructive' />
        )}
        <h2
          className={cn(
            'text-4xl font-bold tracking-tight',
            isPassed ? 'text-teal-600' : 'text-destructive',
          )}
        >
          {totalScore} / {totalMaxScore}
        </h2>
        <p className='mt-1 text-lg text-muted-foreground'>
          {isPassed ? '🎉 恭喜通过！' : '😅 未通过，再接再厉！'}
        </p>
        <p className='text-sm text-muted-foreground'>
          正确率 {percentage}% | 正确 {correctCount}/{totalQuestions} 题
        </p>
      </div>

      <CardContent className='grid grid-cols-2 gap-4 p-6'>
        <div className='flex items-center gap-3 rounded-lg border p-3'>
          <CheckCircle2 className='h-8 w-8 text-teal-600' />
          <div>
            <p className='text-xs text-muted-foreground'>正确</p>
            <p className='text-xl font-bold'>{correctCount}</p>
          </div>
        </div>
        <div className='flex items-center gap-3 rounded-lg border p-3'>
          <XCircle className='h-8 w-8 text-destructive' />
          <div>
            <p className='text-xs text-muted-foreground'>错误</p>
            <p className='text-xl font-bold'>{totalQuestions - correctCount}</p>
          </div>
        </div>
        <div className='col-span-2 flex items-center gap-3 rounded-lg border p-3'>
          <Clock className='h-8 w-8 text-muted-foreground' />
          <div>
            <p className='text-xs text-muted-foreground'>用时</p>
            <p className='text-xl font-bold'>
              {minutes} 分 {seconds} 秒
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
