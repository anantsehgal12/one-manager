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

export interface TaxOption {
  value: string
  label: string
  description?: string
}

export const TAX_OPTIONS: TaxOption[] = [
  { value: '0', label: '0%', description: 'No Tax' },
  { value: '5', label: '5%', description: 'GST 5%' },
  { value: '12', label: '12%', description: 'GST 12%' },
  { value: '18', label: '18%', description: 'GST 18%' },
  { value: '28', label: '28%', description: 'GST 28%' },
  { value: '40', label: '40%', description: 'Custom' },
]

interface TaxDropdownProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  label?: string
  required?: boolean
}

export default function TaxDropdown({
  value,
  onChange,
  disabled = false,
  className,
  label = 'Tax Percentage',
  required = false,
}: TaxDropdownProps) {
  const selectedOption = TAX_OPTIONS.find(option => option.value === value) || TAX_OPTIONS[0]

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor="tax-dropdown" className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id="tax-dropdown"
            variant="outline"
            className="w-full justify-between h-10"
            disabled={disabled}
          >
            <div className="flex items-center space-x-2">
              <span className="font-medium">{selectedOption.label}</span>
              {selectedOption.description && (
                <span className="text-xs text-muted-foreground">
                  {selectedOption.description}
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px]">
          {TAX_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
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
