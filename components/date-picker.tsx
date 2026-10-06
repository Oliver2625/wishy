'use client'

import { CalendarIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const big = 'h-11 text-base'

// "YYYY-MM-DD" <-> local Date, so the picked day never shifts with the time zone.
const toDate = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

// past: for birthdays. Allows past dates only, with month/year dropdowns. Default: upcoming dates only.
export function DatePicker({ id, value, onChange, past }: { id: string; value: string; onChange: (iso: string) => void; past?: boolean }) {
  const [open, setOpen] = useState(false)
  const selected = value ? toDate(value) : undefined
  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger id={id} type="button"
          className={buttonVariants({ variant: 'outline', className: `${big} w-full max-w-xs justify-start rounded-lg px-3 font-normal` })}>
          <CalendarIcon className="text-muted-foreground" />
          {selected ? longDate.format(selected) : <span className="text-muted-foreground">Pick a date</span>}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(d) => { onChange(d ? toIso(d) : ''); setOpen(false) }}
            disabled={past ? { after: new Date() } : { before: new Date() }}
            {...(past && { captionLayout: 'dropdown' as const, startMonth: new Date(1920, 0), endMonth: new Date() })}
            weekStartsOn={1}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {value && (
        <Button type="button" variant="ghost" size="icon-lg" aria-label="Clear date" onClick={() => onChange('')}>
          <XIcon />
        </Button>
      )}
    </div>
  )
}
