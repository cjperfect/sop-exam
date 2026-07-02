import type { Question } from '../data/question-schema'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { questionTypeLabels } from '../data/question-schema'

interface ExamQuestionProps {
  question: Question
  index: number
  value: string | string[]
  onChange: (value: string | string[]) => void
}

export function ExamQuestion({
  question,
  index,
  value,
  onChange,
}: ExamQuestionProps) {
  return (
    <div className='space-y-4'>
      <div className='flex items-start gap-3'>
        <Badge variant='outline' className='mt-0.5 shrink-0'>
          {index + 1}
        </Badge>
        <div className='flex-1'>
          <div className='mb-2 flex items-center gap-2'>
            <Badge variant='secondary' className='text-xs'>
              {questionTypeLabels[question.type]}
            </Badge>
            <span className='text-xs text-muted-foreground'>
              {question.score} 分
            </span>
          </div>
          <p className='text-base font-medium leading-relaxed'>
            {question.content}
          </p>
        </div>
      </div>

      <div className='ps-8'>
        {question.type === 'single_choice' && question.options && (
          <RadioGroup
            value={String(value ?? '')}
            onValueChange={(v) => onChange(v)}
            className='space-y-2'
          >
            {question.options.map((opt) => (
              <div key={opt.key} className='flex items-center gap-3 rounded-lg border p-3 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5'>
                <RadioGroupItem value={opt.key} id={`q-${question.id}-${opt.key}`} />
                <Label
                  htmlFor={`q-${question.id}-${opt.key}`}
                  className='flex-1 cursor-pointer text-sm'
                >
                  <span className='me-1.5 font-medium text-muted-foreground'>{opt.key}.</span>
                  {opt.value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'multi_choice' && question.options && (
          <div className='space-y-2'>
            {question.options.map((opt) => {
              const checked = Array.isArray(value) && value.includes(opt.key)
              return (
                <div
                  key={opt.key}
                  className='flex items-center gap-3 rounded-lg border p-3 transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5'
                >
                  <Checkbox
                    id={`q-${question.id}-${opt.key}`}
                    checked={checked}
                    onCheckedChange={(chk) => {
                      const current = Array.isArray(value) ? [...value] : []
                      if (chk) {
                        current.push(opt.key)
                      } else {
                        const idx = current.indexOf(opt.key)
                        if (idx >= 0) current.splice(idx, 1)
                      }
                      onChange(current)
                    }}
                  />
                  <Label
                    htmlFor={`q-${question.id}-${opt.key}`}
                    className='flex-1 cursor-pointer text-sm'
                  >
                    <span className='me-1.5 font-medium text-muted-foreground'>
                      {opt.key}.
                    </span>
                    {opt.value}
                  </Label>
                </div>
              )
            })}
          </div>
        )}

        {question.type === 'true_false' && question.options && (
          <RadioGroup
            value={String(value ?? '')}
            onValueChange={(v) => onChange(v)}
            className='flex gap-3'
          >
            {question.options.map((opt) => (
              <div
                key={opt.key}
                className='flex flex-1 items-center justify-center gap-2 rounded-lg border p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5'
              >
                <RadioGroupItem
                  value={opt.key}
                  id={`q-${question.id}-${opt.key}`}
                />
                <Label
                  htmlFor={`q-${question.id}-${opt.key}`}
                  className='cursor-pointer text-sm font-medium'
                >
                  {opt.value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'fill_blank' && (
          <Input
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder='请输入答案...'
            className='max-w-md'
          />
        )}
      </div>
    </div>
  )
}
