import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react'
import type { AnswerRecord } from '../data/submission-schema'
import { questionTypeLabels } from '../data/question-schema'

interface ExamAnswerReviewProps {
  answers: AnswerRecord[]
}

export function ExamAnswerReview({ answers }: ExamAnswerReviewProps) {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>逐题回顾</h3>
      {answers.map((record, i) => (
        <div
          key={record.questionId}
          className={cn(
            'rounded-lg border p-4 transition-colors',
            record.isCorrect
              ? 'border-teal-500/20 bg-teal-50/50 dark:bg-teal-950/10'
              : 'border-destructive/20 bg-destructive/5',
          )}
        >
          <div className='mb-2 flex items-start justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <Badge variant='outline'>{i + 1}</Badge>
              <Badge variant='secondary' className='text-xs'>
                {questionTypeLabels[record.questionType]}
              </Badge>
              <span className='text-xs text-muted-foreground'>
                {record.maxScore} 分
              </span>
            </div>
            {record.isCorrect ? (
              <CheckCircle2 className='h-5 w-5 shrink-0 text-teal-600' />
            ) : (
              <XCircle className='h-5 w-5 shrink-0 text-destructive' />
            )}
          </div>

          <p className='mb-3 text-sm font-medium'>{record.questionContent}</p>

          <div className='space-y-1 text-sm'>
            <div className='flex gap-2'>
              <span className='shrink-0 text-muted-foreground'>你的答案：</span>
              <span
                className={cn(
                  record.isCorrect ? 'text-teal-700' : 'text-destructive',
                )}
              >
                {String(record.answer) || '未作答'}
              </span>
            </div>
            {!record.isCorrect && (
              <div className='flex gap-2'>
                <span className='shrink-0 text-muted-foreground'>
                  正确答案：
                </span>
                <span className='text-teal-700'>
                  {String(record.correctAnswer)}
                </span>
              </div>
            )}
          </div>

          {record.aiFeedback && (
            <div className='mt-2 flex gap-2 rounded-md bg-muted/50 p-2 text-sm text-muted-foreground'>
              <BookOpen className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{record.aiFeedback}</span>
            </div>
          )}

          {record.sopSource && (
            <p className='mt-2 text-xs text-muted-foreground'>
              来源：{record.sopSource}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
