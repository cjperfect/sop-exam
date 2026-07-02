import { useEffect, useState, useRef } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExamTimerProps {
  timeLimit: number        // 分钟
  onTimeout: () => void
  onWarning?: () => void   // 剩余 1 分钟时触发
  running: boolean
}

export function ExamTimer({ timeLimit, onTimeout, onWarning, running }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(timeLimit * 60)
  const warnedRef = useRef(false)
  const onTimeoutRef = useRef(onTimeout)
  const onWarningRef = useRef(onWarning)

  // 保持回调引用最新，避免 effect 依赖变化导致重复触发
  onTimeoutRef.current = onTimeout
  onWarningRef.current = onWarning

  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeoutRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [running])

  // 剩余 1 分钟警告
  useEffect(() => {
    if (secondsLeft === 60 && !warnedRef.current) {
      warnedRef.current = true
      onWarningRef.current?.()
    }
  }, [secondsLeft])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isUrgent = secondsLeft < 60

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium tabular-nums',
        isUrgent
          ? 'bg-destructive/10 text-destructive animate-pulse'
          : 'bg-muted text-muted-foreground',
      )}
    >
      <Clock size={14} />
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
