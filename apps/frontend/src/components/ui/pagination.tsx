import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (total === 0) return null

  const pages: (number | '...')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className='flex items-center justify-between pt-4'>
      <p className='text-sm text-muted-foreground'>
        共 {total} 条，第 {page}/{totalPages} 页
      </p>
      <div className='flex items-center gap-1'>
        <Button variant='outline' size='sm' disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className='h-4 w-4' />
          上一页
        </Button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className='px-2 text-sm text-muted-foreground'>...</span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size='sm'
              className='min-w-9'
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          ),
        )}
        <Button variant='outline' size='sm' disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          下一页
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
