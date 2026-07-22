import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Pencil, Eye, Plus, SearchIcon, Trash2, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { SOP_DEPARTMENTS, SOP_STATUS_LABELS } from '@sop/shared'
import type { SopDocument } from '@sop/shared'
import { fetchSops, deleteSop } from '@/features/sops/api'
import { SopFormDialog } from './components/sop-form-dialog'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { Pagination } from '@/components/ui/pagination'

export function AdminSops() {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState('')
  const [deptInput, setDeptInput] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deptQuery, setDeptQuery] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SopDocument | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setDeptQuery(deptInput)
    setPage(1)
  }
  const handleReset = () => {
    setSearchInput('')
    setDeptInput('all')
    setSearchQuery('')
    setDeptQuery('all')
    setPage(1)
  }

  const { data: sopsRes, isLoading } = useQuery({
    queryKey: ['sops', page, searchQuery, deptQuery],
    queryFn: () => fetchSops({
      page,
      pageSize,
      search: searchQuery || undefined,
    }),
  })
  const sops = sopsRes?.items ?? []
  const total = sopsRes?.total ?? 0

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops'] })
      toast.success('SOP 已删除')
    },
  })

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
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>SOP 管理</h2>
            <p className='text-muted-foreground'>管理所有 SOP 文档</p>
          </div>
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className='mr-1 h-4 w-4' />
            添加 SOP
          </Button>
        </div>

        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-end gap-4 flex-wrap'>
              <div className='flex items-center gap-2'>
                <Label htmlFor='sop-search' className='shrink-0'>搜索标题</Label>
                <Input
                  id='sop-search'
                  placeholder='输入关键词...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className='w-56'
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className='flex items-center gap-2'>
                <Label htmlFor='sop-dept' className='shrink-0'>部门筛选</Label>
                <Select value={deptInput} onValueChange={setDeptInput}>
                  <SelectTrigger id='sop-dept' className='w-36'>
                    <SelectValue placeholder='全部部门' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>全部部门</SelectItem>
                    {SOP_DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch}>
                <SearchIcon className='mr-1 h-4 w-4' />
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
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className='w-24'>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sops.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className='h-40 text-center'>
                        <div className='flex flex-col items-center justify-center text-muted-foreground'>
                          <SearchIcon className='mb-2 h-8 w-8 opacity-30' />
                          <p>未找到匹配的 SOP</p>
                          <p className='text-sm'>请尝试调整搜索条件</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : sops.map((sop) => (
                    <TableRow key={sop.id}>
                      <TableCell className='font-medium'>{sop.title}</TableCell>
                      <TableCell>
                        {sop.department}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={cn(
                            sop.status === 'published' && 'border-teal-200 text-teal-700 dark:text-teal-300',
                            sop.status === 'draft' && 'border-neutral-300',
                          )}
                        >
                          {SOP_STATUS_LABELS[sop.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {new Date(sop.updatedAt).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant='ghost' size='icon' asChild>
                                <Link to={`/sops/${sop.id}`}>
                                  <Eye size={16} />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>查看</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant='ghost' size='icon' onClick={() => setEditTarget(sop)}>
                                <Pencil size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>编辑</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='text-destructive'
                                onClick={() => setDeleteTarget(sop.id)}
                              >
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

      <SopFormDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); setDeleteTarget(null) }}
      />
      <SopFormDialog
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) setEditTarget(null) }}
        sop={editTarget}
      />
    </TooltipProvider>
  )
}
