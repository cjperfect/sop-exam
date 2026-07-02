import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useState } from 'react'
import { Pagination } from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SearchIcon, RotateCcw, Loader2 } from 'lucide-react'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { fetchUsers } from './api'
import { roles } from './data/data'

export function Users() {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [usernameInput, setUsernameInput] = useState('')
  const [employeeIdInput, setEmployeeIdInput] = useState('')
  const [roleInput, setRoleInput] = useState('')
  const [queryUsername, setQueryUsername] = useState('')
  const [queryEmployeeId, setQueryEmployeeId] = useState('')
  const [queryRole, setQueryRole] = useState('')

  const handleSearch = () => {
    setQueryUsername(usernameInput)
    setQueryEmployeeId(employeeIdInput)
    setQueryRole(roleInput)
    setPage(1)
  }
  const handleReset = () => {
    setUsernameInput('')
    setEmployeeIdInput('')
    setRoleInput('')
    setQueryUsername('')
    setQueryEmployeeId('')
    setQueryRole('')
    setPage(1)
  }

  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['users', page, queryUsername, queryEmployeeId, queryRole],
    queryFn: () => fetchUsers({
      page,
      pageSize,
      username: queryUsername || undefined,
      employeeId: queryEmployeeId || undefined,
      role: queryRole || undefined,
    }),
  })
  const users = usersRes?.items ?? []
  const total = usersRes?.total ?? 0

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>用户管理</h2>
            <p className='text-muted-foreground'>管理系统中的用户及其角色权限。</p>
          </div>
          <UsersPrimaryButtons />
        </div>

        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-end gap-4 flex-wrap'>
              <div className='flex items-center gap-2'>
                <Label htmlFor='user-username' className='shrink-0'>用户名</Label>
                <Input id='user-username' placeholder='用户名' value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className='w-44' onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              </div>
              <div className='flex items-center gap-2'>
                <Label htmlFor='user-employeeId' className='shrink-0'>工号</Label>
                <Input id='user-employeeId' placeholder='工号' value={employeeIdInput} onChange={(e) => setEmployeeIdInput(e.target.value)} className='w-44' onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              </div>
              <div className='flex items-center gap-2'>
                <Label htmlFor='user-role' className='shrink-0'>角色</Label>
                <Select value={roleInput} onValueChange={setRoleInput}>
                  <SelectTrigger id='user-role' className='w-36'>
                    <SelectValue placeholder='全部' />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <UsersTable data={users} />
            )}
            {!isLoading && (
              <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
            )}
          </CardContent>
        </Card>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
