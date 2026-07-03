import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { FileText } from 'lucide-react'
import { SOP_STATUS_LABELS } from '@sop/shared'
import type { SopDocument } from '@sop/shared'

interface SopListCardsProps {
  sops: SopDocument[]
}

export function SopListCards({ sops }: SopListCardsProps) {
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
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {sops.map((sop) => {
        return (
          <Link key={sop.id} to={`/sops/${sop.id}`} className='block'>
            <Card className='group h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md'>
              <CardHeader className='pb-2'>
                <div className='flex items-start justify-between gap-2'>
                  <Badge variant='outline' className='shrink-0'>
                    {sop.department}
                  </Badge>
                  <Badge
                    variant='outline'
                    className={cn(
                      'shrink-0',
                      sop.status === 'published' &&
                        'bg-teal-100/30 text-teal-900 dark:text-teal-200',
                      sop.status === 'draft' &&
                        'bg-neutral-300/40 border-neutral-300',
                    )}
                  >
                    {SOP_STATUS_LABELS[sop.status]}
                  </Badge>
                </div>
                <CardTitle className='mt-2 line-clamp-2 text-base group-hover:text-primary'>
                  {sop.title}
                </CardTitle>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
