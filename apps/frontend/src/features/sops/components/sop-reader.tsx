import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Eye, Play } from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { SOP_STATUS_LABELS } from '@sop/shared'
import type { SopDocument } from '@sop/shared'
import { SopNotesPanel } from '@/features/notes/components/notes-panel'

interface SopReaderProps {
  sop: SopDocument
  onStartExam?: () => void
}

export function SopReader({ sop, onStartExam }: SopReaderProps) {
  return (
    <div className='mx-auto max-w-4xl'>
      {/* 文档头部 */}
      <div className='mb-6'>
        <div className='mb-2 flex flex-wrap items-center gap-2'>
          <Badge variant='outline'>{sop.department}</Badge>
          <Badge
            variant='outline'
            className={cn(
              sop.status === 'published' &&
                'bg-teal-100/30 text-teal-900 dark:text-teal-200',
              sop.status === 'draft' && 'bg-neutral-300/40 border-neutral-300',
            )}
          >
            {SOP_STATUS_LABELS[sop.status]}
          </Badge>
        </div>
        <div className='mb-2 flex items-center justify-between gap-4'>
          <h1 className='text-3xl font-bold tracking-tight'>
            {sop.title}
          </h1>
          <SopNotesPanel sopId={sop.id} sopTitle={sop.title} />
        </div>
        <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <Eye size={14} />
            {(sop.viewCount ?? 0).toLocaleString()} 次浏览
          </span>
          <span>
            更新于：{new Date(sop.updatedAt).toLocaleString('zh-CN')}
          </span>
        </div>
      </div>

      <Separator className='mb-6' />

      {/* 操作按钮 */}
      <div className='mb-6 flex gap-3'>
        {sop.status === 'published' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onStartExam}>
                  <Play className='mr-1' size={16} />
                  生成试卷
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                基于此 SOP 生成考试试卷
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {sop.status === 'draft' && <span className='text-sm text-muted-foreground'>草稿</span>}
      </div>

      {/* 正文 */}
      <article className='prose prose-gray dark:prose-invert max-w-none prose-headings:mb-1 prose-headings:mt-4 prose-p:my-0.5 prose-li:my-0 prose-li:py-0 prose-ul:my-0.5 prose-ol:my-0.5 prose-table:border-collapse prose-table:w-full prose-table:my-1.5 prose-td:border prose-td:border-border prose-td:p-1.5 prose-th:border prose-th:border-border prose-th:p-1.5 prose-th:bg-muted prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0 prose-code:text-xs prose-pre:bg-muted prose-pre:text-foreground prose-pre:my-1.5 prose-pre:p-3 prose-blockquote:my-1.5 prose-blockquote:py-0.5 prose-hr:my-3 prose-h2:mt-5 prose-h2:mb-1.5 prose-h3:mt-4 prose-h3:mb-1 prose-img:rounded-lg'>
        {sop.content.startsWith('<') ? (
          <div dangerouslySetInnerHTML={{ __html: sop.content }} />
        ) : (
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{sop.content}</Markdown>
        )}
      </article>
    </div>
  )
}

export function SopReaderSkeleton() {
  return (
    <div className='mx-auto max-w-4xl animate-pulse'>
      <div className='mb-6 space-y-3'>
        <div className='h-4 w-20 rounded bg-muted' />
        <div className='h-8 w-3/4 rounded bg-muted' />
        <div className='h-4 w-1/2 rounded bg-muted' />
      </div>
      <div className='mb-6 h-px bg-border' />
      <div className='space-y-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='h-4 rounded bg-muted' style={{ width: `${60 + Math.random() * 30}%` }} />
        ))}
      </div>
    </div>
  )
}
