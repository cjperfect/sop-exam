import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StickyNote, Search, Trash2, Eye, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { fetchNotes, deleteNote } from '@/features/notes/api'
import { NoteDetailDialog } from '@/features/notes/components/note-detail-dialog'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { Pagination } from '@/components/ui/pagination'

export function AdminNotes() {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState('')
  const [userInput, setUserInput] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [viewTarget, setViewTarget] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => { setPage(1) }, [searchQuery, userQuery])

  const { data: notesRes, isLoading } = useQuery({
    queryKey: ['notes', searchQuery, userQuery, page],
    queryFn: () => fetchNotes({
      search: searchQuery || undefined,
      userName: userQuery !== 'all' ? userQuery : undefined,
      page,
      pageSize,
    }),
  })
  const allNotes = notesRes?.items ?? []
  const total = notesRes?.total ?? 0
  const paginated = allNotes

  const userList = useMemo(() => {
    const names = new Set(allNotes.map((n) => n.userName).filter(Boolean))
    return Array.from(names).sort()
  }, [allNotes])

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setUserQuery(userInput)
  }

  const handleReset = () => {
    setSearchInput('')
    setUserInput('all')
    setSearchQuery('')
    setUserQuery('all')
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('笔记已删除')
    },
  })

  return (
    <TooltipProvider>
      <Header fixed>
        <div className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>笔记管理</h2>
            <p className='text-muted-foreground'>管理所有用户的学习笔记</p>
          </div>
        </div>

        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-end gap-4'>
              <div className='flex items-center gap-2'>
                <Label htmlFor='note-search' className='shrink-0'>内容搜索</Label>
                <Input
                  id='note-search'
                  placeholder='输入关键词...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className='w-56'
                />
              </div>
              <div className='flex items-center gap-2'>
                <Label htmlFor='note-user' className='shrink-0'>用户筛选</Label>
                <Select value={userInput} onValueChange={setUserInput}>
                  <SelectTrigger id='note-user' className='w-40'>
                    <SelectValue placeholder='选择用户' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>全部用户</SelectItem>
                    {userList.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch}>
                <Search className='mr-1 h-4 w-4' />
                搜索
              </Button>
              <Button variant='outline' onClick={handleReset}>
                <RotateCcw className='mr-1 h-4 w-4' />
                重置
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-8 text-muted-foreground'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />加载中...
              </div>
            ) : allNotes.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
                <StickyNote className='mb-3 h-12 w-12 opacity-20' />
                <p>暂无笔记</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>关联 SOP</TableHead>
                    <TableHead>内容摘要</TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className='w-20'>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className='max-w-40 truncate font-medium'>
                        {note.sopTitle}
                      </TableCell>
                      <TableCell className='max-w-60 truncate text-muted-foreground'>
                        {note.content}
                      </TableCell>
                      <TableCell>{note.userName || '-'}</TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {new Date(note.createdAt).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant='ghost' size='icon' onClick={() => setViewTarget(note.id)}>
                                <Eye size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>查看</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant='ghost' size='icon' className='text-destructive' onClick={() => setDeleteTarget(note.id)}>
                                <Trash2 size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>删除</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!isLoading && (
              <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
            )}
          </CardContent>
        </Card>
      </Main>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); setDeleteTarget(null) }}
      />

      <NoteDetailDialog
        noteId={viewTarget}
        onOpenChange={() => setViewTarget(null)}
      />
    </TooltipProvider>
  )
}
