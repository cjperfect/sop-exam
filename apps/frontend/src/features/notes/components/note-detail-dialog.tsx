import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNote } from '@/features/notes/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, StickyNote, Clock, Bookmark, User } from 'lucide-react'

interface NoteDetailDialogProps {
  noteId: string | null
  onOpenChange: () => void
}

export function NoteDetailDialog({ noteId, onOpenChange }: NoteDetailDialogProps) {
  const { data: note, isLoading } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => fetchNote(noteId!),
    enabled: !!noteId,
  })

  // 保留上一次加载的笔记数据，避免关闭时内容闪烁
  const lastNote = useRef(note)
  if (note) lastNote.current = note
  const displayNote = note ?? lastNote.current

  return (
    <Dialog open={!!noteId} onOpenChange={(open) => { if (!open) onOpenChange() }}>
      <DialogContent className='sm:max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <StickyNote size={18} />
            笔记详情
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex items-center justify-center py-12 text-muted-foreground'>
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            加载中...
          </div>
        ) : !displayNote ? (
          <p className='py-8 text-center text-muted-foreground'>笔记不存在</p>
        ) : (
          <div className='space-y-4'>
            <div>
              <p className='text-xs text-muted-foreground mb-1'>关联 SOP</p>
              <p className='text-sm font-medium'>{displayNote.sopTitle}</p>
            </div>
            <div>
              <p className='text-xs text-muted-foreground mb-1'>作者</p>
              <p className='text-sm flex items-center gap-1'>
                <User size={14} />
                {displayNote.userName || '匿名用户'}
              </p>
            </div>
            {displayNote.pageRef && (
              <div>
                <p className='text-xs text-muted-foreground mb-1'>章节</p>
                <p className='text-sm flex items-center gap-1'>
                  <Bookmark size={14} />
                  {displayNote.pageRef}
                </p>
              </div>
            )}
            <div>
              <p className='text-xs text-muted-foreground mb-1'>内容</p>
              <div
                className='rounded-lg border bg-muted/30 p-4 text-sm prose prose-sm dark:prose-invert max-w-none'
                dangerouslySetInnerHTML={{ __html: displayNote.content.startsWith('<') ? displayNote.content : displayNote.content.replace(/\n/g, '<br/>') }}
              />
            </div>
            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <Clock size={12} />
                创建：{new Date(displayNote.createdAt).toLocaleString('zh-CN')}
              </span>
              <span className='flex items-center gap-1'>
                <Clock size={12} />
                更新：{new Date(displayNote.updatedAt).toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
