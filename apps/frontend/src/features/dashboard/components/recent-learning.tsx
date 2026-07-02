import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RecentActivity } from '../api'

export function RecentLearning({ data }: { data?: RecentActivity[] }) {
  if (!data || data.length === 0) {
    return (
      <div className='flex items-center justify-center py-8 text-sm text-muted-foreground'>
        暂无学习活动
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {data.map((activity) => (
        <div key={activity.id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarFallback>{activity.userName?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between gap-2'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>{activity.userName}</p>
              <p className='text-xs text-muted-foreground'>
                {new Date(activity.submittedAt).toLocaleString('zh-CN', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge
                variant='outline'
                className={cn(
                  'text-xs',
                  activity.isPassed
                    ? 'border-teal-200 text-teal-700 dark:text-teal-300'
                    : 'border-destructive/30 text-destructive',
                )}
              >
                {activity.isPassed ? '通过' : '未通过'}
              </Badge>
              <span className={cn(
                'text-sm font-medium',
                activity.isPassed ? 'text-teal-600' : 'text-destructive',
              )}>
                {activity.score}/{activity.totalMaxScore}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
