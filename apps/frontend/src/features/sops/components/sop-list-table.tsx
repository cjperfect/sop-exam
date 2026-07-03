import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { FileText } from 'lucide-react'
import { SOP_STATUS_LABELS } from '@sop/shared'
import type { SopDocument } from '@sop/shared'

interface SopListTableProps {
  sops: SopDocument[]
}

export function SopListTable({ sops }: SopListTableProps) {
  const navigate = useNavigate()

  if (sops.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
        <FileText className='mb-4 h-16 w-16 opacity-20' />
        <p className='text-lg'>暂无 SOP 文档</p>
        <p className='text-sm'>当前分类下没有可用的 SOP 文档。</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>标题</TableHead>
          <TableHead>分类</TableHead>
          <TableHead>状态</TableHead>
          <TableHead className='text-right'>更新时间</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sops.map((sop) => {
          return (
            <TableRow key={sop.id} className='cursor-pointer' onClick={() => navigate({ to: `/sops/${sop.id}` })}>
              <TableCell className='max-w-48 truncate font-medium'>
                {sop.title}
              </TableCell>
              <TableCell>
                <Badge variant='outline'>{sop.department}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant='outline'
                  className={cn(
                    sop.status === 'published' &&
                      'bg-teal-100/30 text-teal-900 dark:text-teal-200',
                    sop.status === 'draft' &&
                      'bg-neutral-300/40 border-neutral-300',
                                      )}
                >
                  {SOP_STATUS_LABELS[sop.status]}
                </Badge>
              </TableCell>
              <TableCell className='text-right text-muted-foreground'>
                {new Date(sop.updatedAt).toLocaleString('zh-CN')}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
