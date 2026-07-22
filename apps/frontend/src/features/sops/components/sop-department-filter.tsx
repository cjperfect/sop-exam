import { Button } from '@/components/ui/button'

interface SopDepartmentFilterProps {
  selected: string | undefined
  onSelect: (department: string | undefined) => void
  departments: string[]
}

export function SopDepartmentFilter({
  selected,
  onSelect,
  departments,
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
      {departments.map((d) => (
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
