'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClientDropdown } from '@/app/_components/client-dropdown'
import { ProductDropdown } from '@/app/_components/product-dropdown'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/app/_components/date-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { toast } from 'react-hot-toast'
import { SignIn, useUser } from '@clerk/nextjs'
import { CirclePlus, Plus } from 'lucide-react'
import InvoiceHeader from '@/app/_components/InvoiceHeader'
import Link from 'next/link'

// Invoice item schema
const invoiceItemSchema = z.object({
  productId: z.string().optional(),
  itemName: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate must be 0 or greater'),
  taxPercentage: z.enum(['0', '5', '12', '18', '28', '40']),
  hsnSacCode: z.string().optional(),
})

// Main invoice schema
const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.date(),
  dueDate: z.date().optional(),
  referenceNumber: z.string().optional(),
  items: z.array(invoiceItemSchema).optional(),
  notes: z.string().optional(),
  termsConditions: z.string().optional(),
  bankDetailsId: z.string().optional(),
  signatureId: z.string().optional(),
}).refine((data) => {
  // This will be handled by the component that checks selectedProducts
  return true
}, {
  message: "At least one product is required"
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface Product {
  id: string
  name: string
  sellingPrice: string
  taxPercentage: string
  hsnSacCode?: string
}

interface ProductWithQuantity extends Product {
  quantity: number
  unitPrice?: number
  discount?: number
  priceWithTax?: number
  total?: number
}

interface BankDetail {
  id: string
  accountHolderName: string
  bankName: string
  accountNumber: string
  ifscCode?: string
  swiftCode?: string
  branchName?: string
  upiId?: string
  isDefault: boolean
}

interface Signature {
  id: string
  name: string
  imageUrl: string
  isDefault: boolean
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<ProductWithQuantity[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([])
  const [loadingBankDetails, setLoadingBankDetails] = useState(true)
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [loadingSignatures, setLoadingSignatures] = useState(true)

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: '',
      invoiceNumber: '',
      invoiceDate: new Date(),
      dueDate: new Date(),
      referenceNumber: '',
      items: [],
      notes: '',
      termsConditions: '',
      bankDetailsId: '',
      signatureId: '',
    },
  })



  // Load products
  useEffect(() => {
    const loadData = async () => {
      try {
        const productsResponse = await fetch('/api/products')

        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData)
        }
      } catch (error) {
        console.error('Failed to load products:', error)
        toast.error('Failed to load products')
      } finally {
        setLoadingData(false)
      }
    }

    if (isSignedIn) {
      loadData()
    }
  }, [isSignedIn])

  // Load bank details
  useEffect(() => {
    const loadBankDetails = async () => {
      try {
        const bankDetailsResponse = await fetch('/api/settings/bank-details')

        if (bankDetailsResponse.ok) {
          const bankDetailsData = await bankDetailsResponse.json()
          setBankDetails(bankDetailsData)
        }
      } catch (error) {
        console.error('Failed to load bank details:', error)
        // Don't show error toast for bank details as it's not critical
      } finally {
        setLoadingBankDetails(false)
      }
    }

    if (isSignedIn) {
      loadBankDetails()
    }
  }, [isSignedIn])

  // Load signatures
  useEffect(() => {
    const loadSignatures = async () => {
      try {
        const signaturesResponse = await fetch('/api/settings/signatures')

        if (signaturesResponse.ok) {
          const signaturesData = await signaturesResponse.json()
          setSignatures(signaturesData)
        }
      } catch (error) {
        console.error('Failed to load signatures:', error)
        // Don't show error toast for signatures as it's not critical
      } finally {
        setLoadingSignatures(false)
      }
    }

    if (isSignedIn) {
      loadSignatures()
    }
  }, [isSignedIn])

  // Sync due date with invoice date
  const watchInvoiceDate = form.watch('invoiceDate')

  useEffect(() => {
    if (watchInvoiceDate) {
      // Set due date to be the same as invoice date initially
      form.setValue('dueDate', watchInvoiceDate)
    }
  }, [watchInvoiceDate, form])

  // Calculate totals whenever selected products change
  const { taxableValue, taxAmount, totalDiscount, totalAmount } = useMemo(() => {
    let taxableValue = 0
    let taxAmount = 0
    let totalDiscount = 0

    selectedProducts.forEach((product) => {
      // If user has entered a custom total, use that directly
      if (product.total !== undefined) {
        // For custom total, we need to calculate the base amount by reversing tax calculation
        const taxPercentage = parseFloat(product.taxPercentage)
        const baseAmount = product.total / (1 + taxPercentage / 100)
        taxableValue += baseAmount
        taxAmount += product.total - baseAmount

        // Calculate discount from custom total
        const unitPrice = product.unitPrice || parseFloat(product.sellingPrice)
        const itemSubtotal = product.quantity * unitPrice
        const discount = product.discount || 0
        const discountAmount = (itemSubtotal * discount / 100)
        totalDiscount += discountAmount
      } else {
        // Otherwise use the current unit price or fall back to selling price
        const unitPrice = product.unitPrice || parseFloat(product.sellingPrice)
        const itemSubtotal = product.quantity * unitPrice

        // Apply discount if present
        const discount = product.discount || 0
        const discountAmount = (itemSubtotal * discount / 100)
        const discountedAmount = itemSubtotal - discountAmount

        const itemTax = discountedAmount * (parseFloat(product.taxPercentage) / 100)

        taxableValue += discountedAmount
        taxAmount += itemTax
        totalDiscount += discountAmount
      }
    })

    const totalAmount = taxableValue + taxAmount

    return { taxableValue, taxAmount, totalDiscount, totalAmount }
  }, [selectedProducts])



  const onSubmit = async (data: InvoiceFormData) => {
    // Check if at least one product is selected
    if (selectedProducts.length === 0) {
      toast.error('Please add at least one product to the invoice')
      return
    }

    setIsLoading(true)
    try {
      // Convert selected products to invoice items format
      const invoiceItems = selectedProducts.map(product => ({
        productId: product.id,
        itemName: product.name,
        quantity: product.quantity,
        rate: product.unitPrice || parseFloat(product.sellingPrice),
        taxPercentage: product.taxPercentage as '0' | '5' | '12' | '18' | '28' | '40',
        hsnSacCode: product.hsnSacCode || '',
        description: '', // Empty description for now
      }))

      // Convert dates to ISO strings for API submission
      const invoiceData = {
        ...data,
        items: invoiceItems,
        invoiceDate: data.invoiceDate.toISOString().split('T')[0],
        dueDate: data.dueDate?.toISOString().split('T')[0] || data.invoiceDate.toISOString().split('T')[0],
        subtotal: taxableValue.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        balanceAmount: totalAmount.toFixed(2),
        status: 'draft',
        signatureId: data.signatureId || null,
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || 'Failed to create invoice'
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }

      toast.success('Invoice created successfully')
      router.push('/invoices')
    } catch (error) {
      toast.error('Failed to create invoice')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }




  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background w-full">
        <InvoiceHeader isSignedIn={false} />

        <main className="flex w-full min-h-[calc(100vh-120px)] flex-col items-center justify-center px-6">
          <section className='py-10 flex flex-col items-center justify-center gap-8'>
            <span>Please SignIn/SignUp below with your account to access this page.</span>
            <SignIn />
          </section>
        </main>

        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4">
            <p className="text-sm text-muted-foreground text-center">
              © 2024 One Manager. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    )
  }


  if (loadingData) {
    return (
      <div className="min-h-screen bg-background w-full">
        <InvoiceHeader loadingData={true} />

        <main className="flex w-full min-h-[calc(100vh-120px)] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </main>

        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4">
            <p className="text-sm text-muted-foreground text-center">
              © 2024 One Manager. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    )
  }


  return (
    <div className="min-h-screen w-full bg-background">

      {/* Fixed Header */}
      <InvoiceHeader
        isSignedIn={true}
        loadingData={false}
        isLoading={isLoading}
        onSubmit={form.handleSubmit(onSubmit)}
        invoiceNumber={form.watch('invoiceNumber')}
        onInvoiceNumberChange={(value) => form.setValue('invoiceNumber', value)}
      />

      {/* Main Content */}
      <main className="container mx-auto py-8 px-1 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>Basic information about the invoice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="inline-flex items-center w-full gap-8">
                  <div className="w-90 md:w-full sm:w-full">
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client *</FormLabel>
                          <FormControl>
                            <ClientDropdown
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select a client"
                              disabled={isLoading || loadingData}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='md:inline-flex md:gap-4 sm:gap-4 sm:inline-flex'>
                    <FormField
                      control={form.control}
                      name="invoiceDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Date *</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              onSelect={field.onChange}
                              placeholder="Select invoice date"
                              className='lg:w-60 md:w-70 sm:w-70'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              className='lg:w-60 md:w-70 sm:w-70'
                              onSelect={field.onChange}
                              placeholder="Select due date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="referenceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Reference" className='w-60' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Search and select products to add to this invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductDropdown
                  products={products}
                  selectedProducts={selectedProducts}
                  onProductsChange={setSelectedProducts}
                  disabled={isLoading || loadingData}
                />
              </CardContent>
            </Card>
            <div className='inline-flex gap-5 w-full h-full'>
              <div className='flex flex-col gap-5 w-[50%]  h-[619px]'>
                {/* Additional Information */}
                <Card className='h-full flex flex-col'>
                  <CardHeader className="flex-shrink-0">
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <FormField
                      control={form.control}

                      name="notes"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col">
                          <FormLabel>Notes</FormLabel>
                          <FormControl className="flex-1">
                            <Textarea 
                              placeholder="Additional notes" 
                              className='h-full min-h-[200px] resize-none' 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsConditions"
                      render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col">
                          <FormLabel>Terms & Conditions</FormLabel>
                          <FormControl className="flex-1">
                            <Textarea 
                              placeholder="Terms and conditions" 
                              className='h-full min-h-[200px] resize-none' 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              {/* Totals */}
              <div className='flex flex-col gap-5 w-[50%]'>
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Totals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Taxable Value:</span>
                        <span>₹{taxableValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Tax:</span>
                        <span>₹{taxAmount.toFixed(2)}</span>
                      </div>
                      {totalDiscount > 0 && (
                        <div className="flex justify-between">
                          <span>Total Discount:</span>
                          <span>₹{totalDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total Amount:</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Bank Details Selection */}
                <Card>
                  <CardHeader>
                    <div className='flex justify-between items-center'>
                    <div className='flex flex-col gap-2'>
                      <CardTitle>Bank Details</CardTitle>
                      <CardDescription>Select bank details</CardDescription>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <span>
                          <Link href="/settings" className='flex items-center gap-2'>
                            <CirclePlus className="mr-2 h-4 w-4" />
                            Add Your Bank Account?
                          </Link>
                        </span>
                      </Button>
                    </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bankDetailsId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Account</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value || "none"}
                              onValueChange={(value) => {
                                field.onChange(value === "none" ? "" : value)
                              }}
                              disabled={loadingBankDetails}
                            >
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder={loadingBankDetails ? "Loading bank details..." : "Select bank account"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No bank details</SelectItem>
                                {bankDetails.map((bank) => (
                                  <SelectItem key={bank.id} value={bank.id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{bank.accountHolderName}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {bank.bankName} - {bank.accountNumber}
                                        {bank.isDefault && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">Default</span>}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className='flex justify-between items-center'>
                    <div className='flex flex-col gap-2'>
                      <CardTitle>Signature</CardTitle>
                      <CardDescription>Select signature for the document</CardDescription>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <span>
                          <Link href="/settings" className='flex items-center gap-2'>
                            <CirclePlus className="mr-2 h-4 w-4" />
                            Add Your Signature?
                          </Link>
                        </span>
                      </Button>
                    </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="signatureId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Signature</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value || "none"}
                              onValueChange={(value) => {
                                field.onChange(value === "none" ? "" : value)
                              }}
                              disabled={loadingSignatures}
                            >
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder={loadingSignatures ? "Loading signatures..." : "Select signature"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No signature</SelectItem>
                                {signatures.map((signature) => (
                                  <SelectItem key={signature.id} value={signature.id}>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{signature.name}</span>
                                      {signature.isDefault && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Default</span>}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                  </CardContent>
                </Card>
              </div>
            </div>



            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </form>
        </Form>
      </main>

      {/* Fixed Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 One Manager. All rights reserved.
            </p>
            <div className="text-sm text-muted-foreground">
              Invoice Total: ₹{totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
