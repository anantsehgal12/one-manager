'use client'

import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { UNIT_OPTIONS } from '@/lib/units'

interface UnitsDropdownProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  label?: string
  required?: boolean
}

export default function UnitsDropdown({
  value,
  onChange,
  disabled = false,
  className,
  label = 'Unit',
  required = false,
}: UnitsDropdownProps) {
  const selectedOption = UNIT_OPTIONS.find(option => option.value === value) || UNIT_OPTIONS[0]

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor="units-dropdown" className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id="units-dropdown"
            variant="outline"
            className="w-full justify-between h-10"
            disabled={disabled}
          >
            <div className="flex items-center space-x-2">
              <span className="font-medium">{selectedOption.label}</span>
              <span className="text-xs text-muted-foreground">
                [{selectedOption.abbreviation}]
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px]">
          {UNIT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    [{option.abbreviation}]
                  </span>
                </div>
                {value === option.value && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
