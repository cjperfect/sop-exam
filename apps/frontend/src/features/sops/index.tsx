import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { SearchIcon, Loader2 } from 'lucide-react'
import { ViewToggle, type ViewMode } from '@/components/view-toggle'
import { SopDepartmentFilter } from './components/sop-department-filter'
import { SopListCards } from './components/sop-list-cards'
import { SopListTable } from './components/sop-list-table'
import { fetchSops } from './api'
import { Pagination } from '@/components/ui/pagination'

export function SopList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState<string | undefined>()
  const [view, setView] = useState<ViewMode>(
    () => (localStorage.getItem('sop_view') as ViewMode) || 'card',
  )
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [search, department])

  const { data: sopsRes, isLoading } = useQuery({
    queryKey: ['sops', page],
    queryFn: () => fetchSops({ page, pageSize: 10, status: 'published' }),
  })
  const sops = sopsRes?.items ?? []
  const total = sopsRes?.total ?? 0

  const handleViewChange = (mode: ViewMode) => {
    setView(mode)
    localStorage.setItem('sop_view', mode)
  }

  const filtered = useMemo(() => {
    return sops.filter((sop) => {
      const matchSearch =
        !search || sop.title.toLowerCase().includes(search.toLowerCase())
      const matchDepartment = !department || sop.department === department
      return matchSearch && matchDepartment
    })
  }, [search, department, sops])

  return (
    <>
      <Header>
        <div className='relative me-auto max-w-sm flex-1'>
          <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='搜索 SOP 文档...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='ps-9'
          />
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>SOP 文档库</h1>
            <p className='text-muted-foreground'>
              浏览和学习企业标准作业程序文档
            </p>
          </div>
          <ViewToggle value={view} onChange={handleViewChange} />
        </div>

        <div className='mb-6'>
          <SopDepartmentFilter selected={department} onSelect={setDepartment} />
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-16 text-muted-foreground'>
            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            加载中...
          </div>
        ) : view === 'card' ? (
          <SopListCards sops={filtered} />
        ) : (
          <SopListTable sops={filtered} />
        )}
        {!isLoading && total > 10 && (
          <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
        )}
      </Main>
    </>
  )
}
