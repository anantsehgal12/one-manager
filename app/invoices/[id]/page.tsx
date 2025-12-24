'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useParams } from 'next/navigation'

interface InvoiceData {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string | null
  subtotal: string
  taxAmount: string
  totalAmount: string
  paidAmount: string
  balanceAmount: string
  status: string
  notes: string | null
  termsConditions: string | null
  referenceNumber: string | null
  
  client: {
    id: string
    name: string | null
    companyName: string | null
    gst: string | null
    address: string | null
    billingMainAddress: string | null
    billingCity: string | null
    billingState: string | null
    billingPincode: string | null
    billingCountry: string | null
    mobileNo: string | null
    email: string | null
  }
  
  company: {
    companyName: string | null
    legalName: string | null
    address: string | null
    city: string | null
    state: string | null
    pincode: string | null
    gst: string | null
    pan: string | null
    email: string | null
    phone: string | null
  }
  
  bank: {
    accountHolderName: string | null
    bankName: string | null
    accountNumber: string | null
    ifscCode: string | null
    branchName: string | null
    upiId: string | null
  }
  
  items: Array<{
    id: string
    itemName: string
    description: string | null
    quantity: string
    rate: string
    taxPercentage: string
    taxAmount: string
    totalAmount: string
    hsnSacCode: string | null
  }>
}



function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return `₹${numAmount.toFixed(2)}`
}

function convertToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  
  function convert(n: number): string {
    if (n === 0) return ''
    if (n < 10) return ones[n]
    if (n < 20) return teens[n - 10]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '')
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '')
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '')
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '')
  }
  
  return convert(Math.floor(amount))
}

export default function InvoicePage() {
  const params = useParams()
  const { isSignedIn } = useUser()
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Extract invoice ID from params Promise
  const invoiceId = params.id as string
  
  useEffect(() => {
    if (!isSignedIn) {
      setError('Please sign in to view invoices')
      setLoading(false)
      return
    }
    
    if (!invoiceId || invoiceId === 'undefined') {
      setError('Invalid Invoice ID')
      setLoading(false)
      return
    }
    
    const fetchInvoiceData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const url = `${baseUrl}/api/invoices/${invoiceId}`
        
        const response = await fetch(url, {
          cache: 'no-store'
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Unauthorized - Please sign in again')
          } else if (response.status === 404) {
            setError('Invoice not found')
          } else {
            setError(`Failed to load invoice: ${response.statusText}`)
          }
          return
        }
        
        const data = await response.json()
        setInvoice(data.invoice)
      } catch (err) {
        console.error('Error fetching invoice:', err)
        setError('Failed to load invoice. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchInvoiceData()
  }, [isSignedIn, invoiceId])
  
  if (!isSignedIn) {
    return (
      <main className='w-full p-12'>
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h1>
            <p className="text-gray-600">You need to be signed in to view invoices.</p>
          </CardContent>
        </Card>
      </main>
    )
  }
  
  if (loading) {
    return (
      <main className='w-full p-12'>
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading invoice...</p>
          </CardContent>
        </Card>
      </main>
    )
  }
  
  if (error || !invoice) {
    return (
      <main className='w-full p-12'>
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {error || 'Invoice Not Found'}
            </h1>
            <p className="text-gray-600">
              {error || 'The requested invoice could not be found.'}
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }
  
  const totalItems = invoice.items.length
  const totalQuantity = invoice.items.reduce((sum, item) => sum + parseFloat(item.quantity), 0)
  
  return (
    <main className='w-full p-12'>
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex justify-between items-center border-b pb-4">
          <div className="flex gap-4">
            <div>
              <h1 className="text-2xl font-bold">TAX INVOICE</h1>
              <p className="text-sm text-gray-600">Original for Recipient</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-6 mt-2 text-sm">
          <div className='space-y-5 h-full text-md'>
            <div>
              <h2 className="font-semibold mb-1">From:</h2>
              <p className="font-bold">{invoice.company.companyName || 'Company Name'}</p>
              {invoice.company.gst && <p>GSTIN: {invoice.company.gst}</p>}
              {invoice.company.address && <p>{invoice.company.address}</p>}
              {(invoice.company.city || invoice.company.state || invoice.company.pincode) && (
                <p>
                  {[invoice.company.city, invoice.company.state, invoice.company.pincode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {invoice.company.phone && <p>Mobile: {invoice.company.phone}</p>}
            </div>
            <div>
              <h2 className="font-semibold mb-1">Bill To:</h2>
              <p className="font-bold">{invoice.client.name || 'Client Name'}</p>
              {invoice.client.gst && <p>GSTIN: {invoice.client.gst}</p>}
              {invoice.client.billingState && (
                <p>Place of Supply: {invoice.client.billingState}</p>
              )}
            </div>
          </div>

          <div className="text-right text-[16px]">
            <p><span className="font-semibold">Invoice #:</span> {invoice.invoiceNumber}</p>
            <p><span className="font-semibold">Invoice Date:</span> {formatDate(invoice.invoiceDate)}</p>
            <p><span className="font-semibold">Due Date:</span> {formatDate(invoice.dueDate)}</p>
          </div>
        </CardContent>

        <CardContent className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">#</TableHead>
                <TableHead className="text-left">Item</TableHead>
                <TableHead className="text-center">Rate</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-center">Taxable Value</TableHead>
                <TableHead className="text-center">Tax</TableHead>
                <TableHead className="text-center">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>
                    <p className="font-medium">{item.itemName}</p>
                    {item.hsnSacCode && (
                      <p className="text-xs text-gray-500">HSN: {item.hsnSacCode}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{formatCurrency(item.rate)}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-center">{formatCurrency(item.totalAmount)}</TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(item.taxAmount)} ({item.taxPercentage}%)
                  </TableCell>
                  <TableCell className="text-center">{formatCurrency(item.totalAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <CardContent className="flex justify-end mt-6">
          <div className="w-full md:w-1/2 text-sm">
            <div className="flex justify-between py-1">
              <span>Taxable Amount</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tax Amount</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between py-1 font-semibold border-t mt-2">
              <span>Total</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>
        </CardContent>

        <CardContent className="mt-4 text-sm">
          <p><span className="font-semibold">Total Items / Qty:</span> {totalItems} / {totalQuantity.toFixed(2)}</p>
          <p>
            <span className="font-semibold">Amount (in words):</span> INR {convertToWords(parseFloat(invoice.totalAmount))} Only
          </p>
        </CardContent>

        {invoice.bank.bankName && (
          <CardContent className="mt-6 text-sm border-t pt-4">
            <h3 className="font-semibold mb-2">Bank Details</h3>
            {invoice.bank.accountHolderName && <p>Account Holder: {invoice.bank.accountHolderName}</p>}
            {invoice.bank.bankName && <p>Bank: {invoice.bank.bankName}</p>}
            {invoice.bank.accountNumber && <p>Account No: {invoice.bank.accountNumber}</p>}
            {invoice.bank.ifscCode && <p>IFSC: {invoice.bank.ifscCode}</p>}
            {invoice.bank.branchName && <p>Branch: {invoice.bank.branchName}</p>}
            {invoice.bank.upiId && <p>UPI ID: {invoice.bank.upiId}</p>}
          </CardContent>
        )}

        <CardContent className="flex justify-between items-end mt-8 text-sm">
          <div>
            {invoice.notes && (
              <>
                <p className="font-semibold">Notes:</p>
                <p className="text-gray-600">{invoice.notes}</p>
              </>
            )}
          </div>
          <div className="text-right">
            <p className="font-semibold">For {invoice.company.companyName || 'Company Name'}</p>
            <p className="mt-8">Authorized Signatory</p>
          </div>
        </CardContent>

        <CardContent className="mt-6 text-xs text-gray-500 text-center border-t pt-3">
          This is a digitally signed document.
          Powered by Swipe | Simple Invoicing, Billing and Payments
        </CardContent>

      </Card>
    </main>
  )
}
