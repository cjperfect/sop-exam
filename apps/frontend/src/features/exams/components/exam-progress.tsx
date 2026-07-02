import { cn } from '@/lib/utils'

interface ExamProgressProps {
  current: number
  total: number
  answers: Record<string, string | string[]>
}

export function ExamProgress({ current, total, answers }: ExamProgressProps) {
  const answeredCount = Object.keys(answers).length

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between text-sm text-muted-foreground'>
        <span>
          第 {current} / {total} 题
        </span>
        <span>
          已答 {answeredCount} / {total} 题
        </span>
      </div>
      <div className='flex gap-1'>
        {Array.from({ length: total }, (_, i) => {
          const isAnswered = answers[String(i)] !== undefined
          const isCurrent = i === current - 1
          return (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                isAnswered
                  ? 'bg-primary'
                  : isCurrent
                    ? 'bg-primary/50'
                    : 'bg-muted',
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
