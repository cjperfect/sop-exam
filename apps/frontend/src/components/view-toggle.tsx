import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ViewMode = 'card' | 'list'

interface ViewToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className='flex items-center gap-1 rounded-lg border p-0.5'>
      <Button
        variant={value === 'card' ? 'secondary' : 'ghost'}
        size='icon'
        className='h-7 w-7'
        onClick={() => onChange('card')}
      >
        <LayoutGrid size={14} />
      </Button>
      <Button
        variant={value === 'list' ? 'secondary' : 'ghost'}
        size='icon'
        className='h-7 w-7'
        onClick={() => onChange('list')}
      >
        <List size={14} />
      </Button>
    </div>
  )
}
