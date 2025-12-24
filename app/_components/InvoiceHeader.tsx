
'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SignIn } from '@clerk/nextjs'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface InvoiceHeaderProps {
  isSignedIn?: boolean
  loadingData?: boolean
  isLoading?: boolean
  onSubmit?: () => void
  invoiceNumber?: string
  invoicePrefix?: string
  onInvoiceNumberChange?: (value: string) => void
}

interface CompanyDetail {
  companyName: string
  legalName?: string
  logoUrl?: string
}

interface DocumentSetting {
  prefix?: string
  nextNumber: string
}

export default function InvoiceHeader({
  isSignedIn = true,
  loadingData = false,
  isLoading = false,
  onSubmit,
  invoiceNumber = '',
  invoicePrefix = '',
  onInvoiceNumberChange
}: InvoiceHeaderProps) {
  const router = useRouter()
  const [companyName, setCompanyName] = useState<string>('')
  const [companyLogo, setCompanyLogo] = useState<string>('')
  const [prefix, setPrefix] = useState<string>(invoicePrefix)
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState<string>(invoiceNumber)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  // Fetch company details and document settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch company details
        const companyResponse = await fetch('/api/settings/company-details')
        if (companyResponse.ok) {
          const companyData = await companyResponse.json()
          if (companyData && companyData.length > 0) {
            const defaultCompany = companyData.find((c: CompanyDetail) => c.companyName)
            setCompanyName(defaultCompany?.companyName || '')
            setCompanyLogo(defaultCompany?.logoUrl || '')
          }
        }

        // Fetch document settings for invoices
        const settingsResponse = await fetch('/api/settings/document-settings')
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          const invoiceSettings = settingsData.find((s: DocumentSetting) => s.prefix || s.nextNumber)
          if (invoiceSettings) {
            setPrefix(invoiceSettings.prefix || '')
            setNextInvoiceNumber(invoiceSettings.nextNumber || '1')
            if (onInvoiceNumberChange) {
              onInvoiceNumberChange(invoiceSettings.nextNumber || '1')
            }
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoadingSettings(false)
      }
    }

    if (isSignedIn && !loadingData) {
      fetchSettings()
    }
  }, [isSignedIn, loadingData, onInvoiceNumberChange])

  const handleInvoiceNumberChange = (value: string) => {
    setNextInvoiceNumber(value)
    if (onInvoiceNumberChange) {
      onInvoiceNumberChange(value)
    }
  }

  if (!isSignedIn) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
    )
  }

  if (loadingData || isLoadingSettings) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Back Icon and Title */}
          <div className="flex items-center space-x-15">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/invoices')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold">Create Invoice</h1>
                <p className="text-sm text-muted-foreground">{companyName}</p>
              </div>
            </div>
          


          {/* Middle Section - Prefix and Invoice Number Inputs */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="Prefix"
                className="w-50 text-center"
                disabled={true}
              />
              <span className="text-muted-foreground mx-1">-</span>
            </div>
            <Input
              value={nextInvoiceNumber.toString().padStart(2, '0')}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '') // Only allow digits
                handleInvoiceNumberChange(value)
              }}
              placeholder="Number"
              className="w-20 text-center"
              disabled={isLoading}
              maxLength={3}
            />
          </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {onSubmit && (
              <Button
                onClick={onSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
