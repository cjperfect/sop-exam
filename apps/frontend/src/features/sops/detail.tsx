import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Link, useParams, useSearch } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { SopReader, SopReaderSkeleton } from './components/sop-reader'
import { fetchSop } from './api'
import { ExamResultDialog } from '@/components/exam-result-dialog'
import { InlineExam } from '@/features/exams/components/inline-exam'

export function SopDetail() {
  const { sopId } = useParams({ from: '/_authenticated/sops/$sopId/' })
  const { examResult } = useSearch({ from: '/_authenticated/sops/$sopId/' })
  const navigate = useNavigate()
  const [examMode, setExamMode] = useState(false)

  const { data: sop, isLoading } = useQuery({
    queryKey: ['sops', sopId],
    queryFn: () => fetchSop(sopId),
  })

  const clearExamResult = () => {
    navigate({ to: `/sops/${sopId}`, search: {}, replace: true })
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-2 me-auto'>
          <Button variant='ghost' asChild>
            <Link to='/sops'>
              <ArrowLeft className='mr-1 h-4 w-4' />
              返回
            </Link>
          </Button>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
            <Loader2 className='mb-2 h-6 w-6 animate-spin' />
            <p>加载中...</p>
          </div>
        ) : !sop ? (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
            <p className='text-lg'>文档不存在</p>
            <Button asChild variant='link'>
              <Link to='/sops'>返回文档库</Link>
            </Button>
          </div>
        ) : examMode ? (
          <InlineExam sop={sop} onBack={() => setExamMode(false)} />
        ) : (
          <SopReader sop={sop} onStartExam={() => setExamMode(true)} />
        )}
      </Main>

      <ExamResultDialog
        open={!!examResult}
        onOpenChange={(o) => { if (!o) clearExamResult() }}
        submissionId={examResult ?? null}
      />
    </>
  )
}
