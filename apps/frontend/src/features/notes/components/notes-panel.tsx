import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { StickyNote, Plus, Trash2, Clock, Bookmark } from 'lucide-react'
import { fetchNotes, createNote, deleteNote } from '../api'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'

interface SopNotesPanelProps {
  sopId: string
  sopTitle: string
}

export function SopNotesPanel({ sopId, sopTitle }: SopNotesPanelProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const currentUser = useAuthStore((s) => s.auth.user)

  const { data: notesRes } = useQuery({
    queryKey: ['notes'],
    queryFn: () => fetchNotes(),
    enabled: open,
  })

  const notes = notesRes?.items ?? []

  const sopNotes = useMemo(
    () =>
      notes
        .filter((n) => n.sopId === sopId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [notes, sopId],
  )

  const addMutation = useMutation({
    mutationFn: (content: string) =>
      createNote({
        sopId,
        sopTitle,
        userId: currentUser?.accountNo || 0,
        userName: currentUser?.username || String(currentUser?.accountNo ?? ''),
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setNoteContent('')
      toast.success('笔记已保存')
    },
    onError: () => toast.error('保存失败'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('笔记已删除')
    },
    onError: () => toast.error('删除失败'),
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='secondary' size='sm' className='border border-primary/30'>
          <StickyNote className='mr-1' size={16} />
          写笔记
        </Button>
      </SheetTrigger>
      <SheetContent className='sm:max-w-lg px-8'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <StickyNote size={18} />
            学习笔记 ({sopNotes.length})
          </SheetTitle>
        </SheetHeader>

        <div className='mt-4 space-y-3'>
          <RichTextEditor
            value={noteContent}
            onChange={setNoteContent}
            placeholder='在此输入笔记内容...'
            minHeight='220px'
          />
          <Button
            onClick={() => addMutation.mutate(noteContent)}
            disabled={!noteContent.trim() || addMutation.isPending}
            className='w-full'
            size='sm'
          >
            <Plus className='mr-1' size={14} />
            添加笔记
          </Button>
        </div>

        <Separator className='my-4' />

        <div className='space-y-3'>
          {sopNotes.length === 0 ? (
            <p className='py-8 text-center text-sm text-muted-foreground'>
              暂无笔记，开始记录吧
            </p>
          ) : (
            sopNotes.map((note) => (
              <div
                key={note.id}
                className='group relative rounded-lg border p-3 transition-colors hover:bg-muted/50'
              >
                <Button
                  variant='ghost'
                  size='icon'
                  className='absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive'
                  onClick={() => setDeletingId(note.id)}
                >
                  <Trash2 size={12} />
                </Button>

                {note.pageRef && (
                  <span className='mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground'>
                    <Bookmark size={10} />
                    {note.pageRef}
                  </span>
                )}
                <div className='text-sm prose prose-sm dark:prose-invert max-w-none wrap-break-word' dangerouslySetInnerHTML={{ __html: note.content.startsWith('<') ? note.content : note.content.replace(/\n/g, '<br/>') }} />
                <div className='mt-2 flex items-center justify-between text-xs text-muted-foreground'>
                  <span className='flex items-center gap-1'>
                    <Clock size={10} />
                    {new Date(note.createdAt).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span className='flex items-center gap-1 font-medium'>
                    {note.userName || '匿名用户'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 删除确认弹窗 */}
        <DeleteConfirmDialog
          open={!!deletingId}
          onOpenChange={(o) => { if (!o) setDeletingId(null) }}
          onConfirm={() => {
            if (deletingId) deleteMutation.mutate(deletingId)
            setDeletingId(null)
          }}
        />
      </SheetContent>
    </Sheet>
  )
}
