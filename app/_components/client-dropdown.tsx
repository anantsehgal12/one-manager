'use client'

import { useState, useEffect } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, User, Mail, Phone, Building, DollarSign, CirclePlus } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

interface Client {
  id: string
  name: string
  companyName?: string
  email?: string
  mobileNo?: string
  gst?: string
  billingCity?: string
  billingState?: string
  balanceAmount?: number
}

interface ClientWithBalance extends Client {
  balanceAmount: number
}

interface ClientDropdownProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function ClientDropdown({ value, onValueChange, placeholder = "Select a client", disabled }: ClientDropdownProps) {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<ClientWithBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')

  // Fetch clients with their balances
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients')
        if (response.ok) {
          const clientsData = await response.json()

          // Calculate balance for each client
          const clientsWithBalance = await Promise.all(
            clientsData.map(async (client: Client) => {
              try {
                const balanceResponse = await fetch(`/api/clients/${client.id}/balance`)
                if (balanceResponse.ok) {
                  const { balanceAmount } = await balanceResponse.json()
                  return { ...client, balanceAmount }
                }
              } catch (error) {
                console.error(`Failed to fetch balance for client ${client.id}:`, error)
              }
              return { ...client, balanceAmount: 0 }
            })
          )

          setClients(clientsWithBalance)
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!disabled) {
      fetchClients()
    }
  }, [disabled])

  // Command component handles filtering automatically based on CommandItem value

  // Find selected client
  const selectedClient = clients.find(client => client.id === value)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatBalance = (amount: number) => {
    const isPositive = amount > 0
    const isNegative = amount < 0

    if (isNegative) {
      return {
        amount: formatCurrency(Math.abs(amount)),
        color: 'text-red-600',
        prefix: '-'
      }
    } else if (isPositive) {
      return {
        amount: formatCurrency(amount),
        color: 'text-green-600',
        prefix: '+'
      }
    } else {
      return {
        amount: '₹0',
        color: 'text-gray-600',
        prefix: ''
      }
    }
  }

  return (
    <main>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", disabled && "opacity-50")}
            disabled={disabled || loading}
          >
            {loading ? (
              <span>Loading clients...</span>
            ) : selectedClient ? (
              <div className="flex items-center gap-2 truncate">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {selectedClient.name}
                  {selectedClient.companyName && ` (${selectedClient.companyName})`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {placeholder}
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0 h-80" align="start">
          <Command>
            <CommandInput
              placeholder="Search clients..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No clients found.</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => {
                  const balance = formatBalance(client.balanceAmount || 0)
                  const isSelected = value === client.id

                  return (
                    <CommandItem
                      key={client.id}
                      value={`${client.name} ${client.companyName || ''} ${client.gst || ''}`.trim()}
                      onSelect={() => {
                        onValueChange(client.id)
                        setOpen(false)
                        setSearchValue('')
                      }}
                      className="flex items-center justify-between p-3 cursor-pointer"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {client.name}
                            {client.companyName && (
                              <span className="text-muted-foreground ml-1">
                                ({client.companyName})
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                            {client.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[120px]">{client.email}</span>
                              </div>
                            )}

                            {client.mobileNo && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{client.mobileNo}</span>
                              </div>
                            )}

                            {client.gst && (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                <span>{client.gst}</span>
                              </div>
                            )}
                          </div>

                          {(client.billingCity || client.billingState) && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {[client.billingCity, client.billingState].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <div className={cn("text-sm font-medium", balance.color)}>
                            {balance.prefix}{balance.amount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Balance
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              <CommandGroup className='sticky bottom-0 z-999 bg-popover'>
                <Separator />
                <div className='flex items-center justify-center py-2'>
                  <Button variant="ghost" className="w-full px-3">
                    <Link href="/clients/create" className="w-full">
                      <span className='inline-flex gap-8 items-center'>
                        <CirclePlus className='h-4 w-4' />
                        <span className='font-bold text-lg'>
                          Add New Client
                        </span>
                      </span>
                    </Link>
                  </Button>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </main>
  )
}
