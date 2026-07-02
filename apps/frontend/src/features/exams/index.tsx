import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ExamListTable } from './components/exam-list-table'
import { ExamResultDialog } from '@/components/exam-result-dialog'
import { fetchSubmissions } from './api'

export function ExamHistory() {
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: fetchSubmissions,
  })

  const passedCount = submissions.filter((s) => s.isPassed).length
  const avgScore = submissions.length
    ? Math.round(
        submissions.reduce((sum, s) => sum + s.totalScore, 0) /
          submissions.length,
      )
    : 0

  return (
    <>
      <Header>
        <div className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='mb-2 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>我的考试</h1>
            <p className='text-muted-foreground'>查看考试记录和成绩</p>
          </div>
          <Button asChild>
            <Link to='/sops'>
              <GraduationCap className='mr-1 h-4 w-4' />
              去考试
            </Link>
          </Button>
        </div>

        <div className='grid gap-4 sm:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>总考试次数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{submissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>通过次数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-teal-600'>
                {passedCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>平均分</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{avgScore}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>考试记录</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-8 text-muted-foreground'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                加载中...
              </div>
            ) : (
              <ExamListTable submissions={submissions} onView={(id) => setSubmissionId(id)} />
            )}

            <ExamResultDialog
              open={!!submissionId}
              onOpenChange={(o) => { if (!o) setSubmissionId(null) }}
              submissionId={submissionId}
            />
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
