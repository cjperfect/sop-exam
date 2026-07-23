import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableRowActions } from './data-table-row-actions'
import { type User, ROLE_LABELS } from '@sop/shared'

export const usersColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'username',
    header: '用户名',
    cell: ({ row }) => <span className='font-medium'>{row.getValue('username')}</span>,
  },
  {
    accessorKey: 'employeeId',
    header: '工号',
    cell: ({ row }) => row.getValue('employeeId') || '-',
  },
  {
    accessorKey: 'department',
    header: '部门',
    cell: ({ row }) => row.getValue('department') || '-',
  },
  {
    accessorKey: 'role',
    header: '角色',
    cell: ({ row }) => (
      <Badge variant='outline'>{ROLE_LABELS[row.getValue('role') as string] || row.getValue('role')}</Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
    cell: ({ row }) => {
      const val = row.getValue('createdAt') as string
      return val ? new Date(val).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'
    },
  },
  {
    id: 'actions',
    header: '操作',
    cell: DataTableRowActions,
  },
]
