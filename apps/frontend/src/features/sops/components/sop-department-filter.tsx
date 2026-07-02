import { Button } from '@/components/ui/button'
import { SOP_DEPARTMENTS } from '@sop/shared'

interface SopDepartmentFilterProps {
  selected: string | undefined
  onSelect: (department: string | undefined) => void
}

export function SopDepartmentFilter({
  selected,
  onSelect,
}: SopDepartmentFilterProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      <Button
        variant={!selected ? 'default' : 'outline'}
        size='sm'
        onClick={() => onSelect(undefined)}
      >
        全部部门
      </Button>
      {SOP_DEPARTMENTS.map((d) => (
        <Button
          key={d}
          variant={selected === d ? 'default' : 'outline'}
          size='sm'
          onClick={() => onSelect(d)}
        >
          {d}
        </Button>
      ))}
    </div>
  )
}
