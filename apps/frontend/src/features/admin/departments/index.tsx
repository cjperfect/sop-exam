import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Plus, FolderTree, Pencil, Trash2, Loader2 } from 'lucide-react'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from './api'

export function AdminDepartments() {
  const queryClient = useQueryClient()

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [nameError, setNameError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const editingDept = useMemo(
    () => editingId ? departments.find((d) => d.id === editingId) : null,
    [editingId, departments],
  )

  const createMutation = useMutation({
    mutationFn: (input: { name: string; description?: string }) => createDepartment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success('部门已添加')
      setDialogOpen(false)
    },
    onError: () => toast.error('添加失败'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: { name?: string; description?: string } }) =>
      updateDepartment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success('部门已更新')
      setDialogOpen(false)
    },
    onError: () => toast.error('更新失败'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success('部门已删除')
    },
    onError: () => toast.error('删除失败'),
  })

  const handleAdd = () => {
    setEditingId(null)
    setName('')
    setDesc('')
    setNameError('')
    setDialogOpen(true)
  }

  const handleEdit = (id: number) => {
    const dept = departments.find((d) => d.id === id)
    if (!dept) return
    setEditingId(id)
    setName(dept.name)
    setDesc(dept.description)
    setNameError('')
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('请输入部门名称')
      return
    }
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, input: { name: name.trim(), description: desc.trim() } })
    } else {
      createMutation.mutate({ name: name.trim(), description: desc.trim() })
    }
  }

  return (
    <TooltipProvider>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>部门管理</h1>
            <p className='text-muted-foreground'>管理部门信息</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className='mr-1' size={16} />
            添加部门
          </Button>
        </div>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base flex items-center gap-2'>
              <FolderTree size={16} />
              全部部门
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-8 text-muted-foreground'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />加载中...
              </div>
            ) : (
              <div className='space-y-1'>
                {departments.map((dept) => (
                  <div key={dept.id}>
                    <div className='group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50'>
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>{dept.name}</p>
                        <p className='text-xs text-muted-foreground'>{dept.description}</p>
                      </div>
                      <div className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => handleEdit(dept.id)}>
                              <Pencil size={14} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>编辑</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant='ghost' size='icon' className='h-8 w-8 text-destructive' onClick={() => setDeleteTarget(dept.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>删除</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
                {departments.length === 0 && (
                  <p className='py-8 text-center text-sm text-muted-foreground'>暂无部门</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{editingId !== null ? '编辑部门' : '添加部门'}</DialogTitle>
            <DialogDescription>
              {editingId !== null ? '修改部门的名称和描述' : '创建新的部门'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='dept-name'><span className='text-destructive'>*</span> 部门名称</Label>
              <Input
                id='dept-name'
                value={name}
                autoFocus={false}
                onChange={(e) => { setName(e.target.value); if (nameError) setNameError('') }}
                placeholder='例如：技术部'
                aria-invalid={!!nameError}
              />
              {nameError && <p className='text-sm text-destructive'>{nameError}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='dept-desc'>部门描述</Label>
              <Textarea id='dept-desc' value={desc} onChange={(e) => setDesc(e.target.value)} placeholder='部门的简要说明' />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); setDeleteTarget(null) }}
      />
    </TooltipProvider>
  )
}
