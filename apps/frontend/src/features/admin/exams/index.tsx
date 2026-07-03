import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { ExamResultDialog } from '@/components/exam-result-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SearchIcon, RotateCcw, ListChecks, Eye, Loader2, Settings, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { fetchSubmissions, deleteSubmission } from './api'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { ExamConfigDialog } from './components/exam-config-dialog'

export function AdminExams() {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [userInput, setUserInput] = useState('')
  const [sopInput, setSopInput] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [sopQuery, setSopQuery] = useState('')

  const handleSearch = () => { setUserQuery(userInput); setSopQuery(sopInput); setPage(1) }
  const handleReset = () => { setUserInput(''); setSopInput(''); setUserQuery(''); setSopQuery(''); setPage(1) }

  const { data: subsRes, isLoading } = useQuery({
    queryKey: ['admin-submissions', page, userQuery, sopQuery],
    queryFn: () => fetchSubmissions({ page, pageSize, userName: userQuery || undefined, sopTitle: sopQuery || undefined }),
  })
  const submissions = subsRes?.items ?? []
  const total = subsRes?.total ?? 0

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] })
      toast.success('考试记录已删除')
    },
  })

  const handleView = async (id: string) => {
    setSubmissionId(id)
  }

  return (
    <TooltipProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>考试记录</h2>
              <p className='text-muted-foreground'>查看所有考试记录</p>
            </div>
            <Button variant='outline' size='sm' className='border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800' onClick={() => setConfigOpen(true)}>
              <Settings className='mr-1 h-4 w-4' />
              考试配置
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className='pb-3'>
            <div className='mb-3 flex items-center justify-between'>
              <CardTitle className='text-base flex items-center gap-2'>
                <ListChecks size={16} />
                考试列表
              </CardTitle>
            </div>
            <div className='flex items-end gap-4 flex-wrap'>
              <div className='flex items-center gap-2'>
                <Label htmlFor='exam-user' className='shrink-0'>考试人</Label>
                <Input id='exam-user' placeholder='输入姓名...' value={userInput} onChange={(e) => setUserInput(e.target.value)} className='w-44' onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              </div>
              <div className='flex items-center gap-2'>
                <Label htmlFor='exam-sop' className='shrink-0'>关联 SOP</Label>
                <Input id='exam-sop' placeholder='输入标题...' value={sopInput} onChange={(e) => setSopInput(e.target.value)} className='w-44' onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              </div>
              <Button onClick={handleSearch}><SearchIcon className='mr-1 h-4 w-4' />搜索</Button>
              <Button variant='outline' onClick={handleReset}><RotateCcw className='mr-1 h-4 w-4' />重置</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-8 text-muted-foreground'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />加载中...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>关联 SOP</TableHead>
                    <TableHead>考试人</TableHead>
                    <TableHead>得分</TableHead>
                    <TableHead>结果</TableHead>
                    <TableHead>提交时间</TableHead>
                    <TableHead className='w-20'>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='h-40 text-center'>
                        <div className='flex flex-col items-center justify-center text-muted-foreground'>
                          <ListChecks className='mb-2 h-8 w-8 opacity-30' />
                          <p>暂无考试记录</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : submissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className='max-w-48 truncate font-medium'>{sub.sopTitle}</TableCell>
                      <TableCell>{sub.userName || '-'}</TableCell>
                      <TableCell>{sub.totalScore} / {sub.totalMaxScore}</TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={cn(
                            sub.isPassed ? 'border-teal-200 text-teal-700 dark:text-teal-300 bg-teal-50/30' : 'border-destructive/30 text-destructive bg-destructive/5',
                          )}
                        >
                          {sub.isPassed ? '✅ 通过' : '❌ 未通过'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {new Date(sub.submittedAt).toLocaleString('zh-CN', {
                          year: 'numeric', month: '2-digit', day: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant='ghost' size='icon' onClick={() => handleView(sub.id)}>
                                <Eye size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>查看</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant='ghost' size='icon' className='text-destructive' onClick={() => setDeleteTarget(sub.id)}>
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

      <ExamResultDialog
        open={!!submissionId}
        onOpenChange={(o) => { if (!o) setSubmissionId(null) }}
        submissionId={submissionId}
      />
      <ExamConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); setDeleteTarget(null) }}
      />
    </TooltipProvider>
  )
}
