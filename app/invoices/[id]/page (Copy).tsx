
'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card" // Keep these imports for now, might remove later if not used
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table" // Keep these imports for now, might remove later if not used
import { Button } from "@/components/ui/button"
import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import { Download, FileText } from 'lucide-react'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import Side from "@/app/_components/Side";

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
    logoUrl: string | null
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
  
  const amountInWords = convert(Math.floor(amount));
  const decimalPart = Math.round((amount - Math.floor(amount)) * 100);
  
  if (decimalPart > 0) {
    return `INR ${amountInWords} and ${convert(decimalPart)} Paisa Only.`;
  }
  
  return `INR ${amountInWords} Only.`;
}


export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  // Extract invoice ID from params Promise
  const invoiceId = params.id as string
  


  // PDF Generation function
  const generatePDF = async () => {
    if (!invoice || !invoiceRef.current) {
      toast.error('Invoice data or reference not available');
      return;
    }
    
    try {
      setGeneratingPdf(true);
      
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, // Increase scale for better quality
        useCORS: true, // Enable CORS for images
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps= pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoiceNumber}-${invoice.client.name}.pdf`);
      
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGeneratingPdf(false);
    }
  };
  
  useEffect(() => {
    // Check if PDF generation is requested via query parameter
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('generatePdf') === 'true' && invoice) {
      generatePDF();
      // Clean up URL
      window.history.replaceState({}, '', `/invoices/${invoiceId}`);
    }
  }, [invoice, invoiceId]);
  
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
  
  // Calculate CGST and SGST assuming a 50/50 split of total tax amount
  const totalTaxAmount = parseFloat(invoice.taxAmount);
  const cgstAmount = totalTaxAmount / 2;
  const sgstAmount = totalTaxAmount / 2;

  return (
      <SidebarProvider>
        <Side />
        <SidebarInset className='w-full  bg-background'> {/* Added bg-gray-100 to main for consistency */}
          <header className="h-20 w-full flex items-center justify-between px-18">
              <div className={`inline-flex gap-8 items-center`}>
                  <span>
                      <SidebarTrigger/>
                  </span>
                  <span className="text-foreground">
                      <b>Invoice No. :- </b>{invoice.invoiceNumber}
                  </span>
              </div>

              {/* Download PDF Button */}
              <div className="flex justify-end mb-4" data-html2canvas-ignore>
                  <Button
                      onClick={generatePDF}
                      disabled={generatingPdf}
                      variant="link"
                      size="sm"
                      className="flex items-center gap-2"
                  >
                      <Download className="h-4 w-4 text-foreground" />
                      <span className="text-foreground">
                          {generatingPdf ? 'Generating...' : 'Download PDF'}
                      </span>
                  </Button>
              </div>


          </header>
          <section className="text-black">
              <div className="max-w-4xl mx-auto my-5 h-auto rounded-3xl py-8 px-8 bg-white" ref={invoiceRef}>

          <section className="inline-flex justify-between items-center w-full pb-3">
              <h1 className="font-bold text-lg">TAX INVOICE</h1>
              <h1>ORIGINAL FOR RECIPIENT</h1>
          </section>

          <section className="inline-flex justify-between w-full items-center pb-3">
              <div>
                  <h1 className="text-2xl font-bold">{invoice.company.companyName || invoice.company.legalName || 'Company Name'}</h1>
                  <div className="inline-flex gap-6">
                      {invoice.company.gst && (
                          <h1>
                              <span className="inline-flex gap-3">
                                  <span className="font-bold">GSTIN</span>
                                  <span>{invoice.company.gst}</span>
                              </span>
                          </h1>
                      )}
                      {invoice.company.pan && (
                          <h1>
                              <span className="inline-flex gap-3">
                                  <span className="font-bold">PAN</span>
                                  <span>{invoice.company.pan}</span>
                              </span>
                          </h1>
                      )}
                  </div>
                  <div>
                      <span>
                          {invoice.company.address}
                          <br/>
                          {[invoice.company.city, invoice.company.state, invoice.company.pincode]
                              .filter(Boolean)
                              .join(', ')}
                      </span>
                  </div>
                  <div className="inline-flex gap-6">
                      {invoice.company.phone && (
                          <h1>
                              <span className="inline-flex gap-3">
                                  <span className="font-bold">Phone</span>
                                  <span>{invoice.company.phone}</span>
                              </span>
                          </h1>
                      )}
                      {invoice.company.email && (
                          <h1>
                              <span className="inline-flex gap-3">
                                  <span className="font-bold">Email</span>
                                  <span>{invoice.company.email}</span>
                              </span>
                          </h1>
                      )}
                  </div>
              </div>
              {invoice.company.logoUrl && (
                  <div className="h-40 w-auto">
                      <Image src={invoice.company.logoUrl} alt="Company Logo" className="h-full w-full object-contain" width={150} height={150}/>
                  </div>
              )}
          </section>

          <section className="pb-3">
              <div className="inline-flex gap-6">
                  <h1>
                      <span className="inline-flex gap-3">
                          <span className="font-bold">Invoice No. :-</span>
                          <span>{invoice.invoiceNumber}</span>
                      </span>
                  </h1>
                  <h1>
                      <span className="inline-flex gap-3">
                          <span className="font-bold">Invoice Date :-</span>
                          <span>{formatDate(invoice.invoiceDate)}</span>
                      </span>
                  </h1>
                  <h1>
                      <span className="inline-flex gap-3">
                          <span className="font-bold">Due Date :-</span>
                          <span>{formatDate(invoice.dueDate)}</span>
                      </span>
                  </h1>
              </div>
          </section>

          <section className="inline-flex gap-6 pb-3">
              <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold">
                      Customer Details
                  </span>
                  <div className="font-bold flex flex-col">
                      {invoice.client.name && <span>{invoice.client.name}</span>}
                      {invoice.client.companyName && <span>{invoice.client.companyName}</span>}
                      {invoice.client.gst && <span>GSTIN: {invoice.client.gst}</span>}
                  </div>
              </div>
              <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold">
                      Billing Address
                  </span>
                  <div className="font-bold flex flex-col">
                      <span>
                          {invoice.client.billingMainAddress}
                          <br/>
                          {[invoice.client.billingCity, invoice.client.billingState, invoice.client.billingPincode]
                              .filter(Boolean)
                              .join(', ')}
                      </span>
                  </div>
              </div>
          </section>

          {invoice.client.billingState && (
              <section className="pb-3">
                  <h1 className="text-md font-md">
                      Place of Supply
                  </h1>
                  <h1 className="text-sm font-bold">
                      {invoice.client.billingState}
                  </h1>
              </section>
          )}

          <section className="mx-auto">
              {/* Table */}
              <table className="w-full border-collapse">
                  <thead>
                  <tr className="border-t border-b border-blue-600 text-left text-sm">
                      <th className="p-2 w-10">#</th>
                      <th className="p-2">Item</th>
                      <th className="p-2 text-right">Rate / Item</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Taxable Value</th>
                      <th className="p-2 text-right">Tax Amount</th>
                      <th className="p-2 text-right">Amount</th>
                  </tr>
                  </thead>
                  <tbody>
                  {invoice.items.map((item, index) => (
                      <tr key={item.id} className="border-t border-b border-blue-300">
                          <td className="p-2 align-top">{index + 1}</td>
                          <td className="p-2">
                              <div className="font-medium">{item.itemName}</div>
                              {item.hsnSacCode && <div className="text-xs">HSN: {item.hsnSacCode}</div>}
                          </td>
                          <td className="p-2 text-right align-top">{formatCurrency(item.rate)}</td>
                          <td className="p-2 text-right align-top">{item.quantity}</td>
                          <td className="p-2 text-right align-top">{formatCurrency(parseFloat(item.totalAmount) - parseFloat(item.taxAmount))}</td>
                          <td className="p-2 text-right align-top">{formatCurrency(item.taxAmount)} ({item.taxPercentage}%)</td>
                          <td className="p-2 text-right align-top">{formatCurrency(item.totalAmount)}</td>
                      </tr>
                  ))}
                  </tbody>
              </table>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 text-sm">
                  <div></div> {/* Empty div for alignment */}
                  <div className="space-y-1 text-right">
                      {/* Assuming Delivery/Shipping Charges are not in the current data, omitting for now */}
                      {/* <div className="flex justify-between">
                          <span className="font-medium">Delivery/Shipping Charges</span>
                          <span>₹250.00</span>
                      </div>
                      <div className="text-xs text-gray-700">SAC: 9968</div> */}

                      <div className="flex justify-between pt-2">
                          <span className="font-medium">Taxable Amount</span>
                          <span>{formatCurrency(invoice.subtotal)}</span>
                      </div>

                      {totalTaxAmount > 0 && (
                        <>
                          <div className="flex justify-between">
                              <span>CGST {(parseFloat(invoice.taxAmount) / parseFloat(invoice.subtotal) * 50).toFixed(2)}%</span> {/* Assuming 50/50 split */}
                              <span>{formatCurrency(cgstAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                              <span>SGST {(parseFloat(invoice.taxAmount) / parseFloat(invoice.subtotal) * 50).toFixed(2)}%</span> {/* Assuming 50/50 split */}
                              <span>{formatCurrency(sgstAmount)}</span>
                          </div>
                        </>
                      )}
                  </div>
              </div>

              {/* Total */}
              <div className="border-t border-blue-600 px-4 py-3 flex justify-end">
                  <div className="font-semibold text-base">Total {formatCurrency(invoice.totalAmount)}</div>
              </div>

              {/* Footer */}
              <div className="border-t border-blue-600 px-4 py-2 text-xs flex justify-between">
                  <div>Total Items / Qty : {totalItems} / {totalQuantity.toFixed(0)}</div>
                  <div>
                      Total amount (in words): {convertToWords(parseFloat(invoice.totalAmount))}
                  </div>
              </div>

              <div className="border-t border-blue-600 px-4 py-2 text-right font-semibold text-sm">
                  Amount Payable: {formatCurrency(invoice.totalAmount)}
              </div>

          </section>

          <section className="inline-flex justify-between w-full pb-3 mt-4">
              {invoice.bank.bankName && (
                  <div>
                      <h1 className="text-md font-bold">Bank Details</h1>
                      <div className="flex text-sm flex-col">
                          {invoice.bank.bankName && <span><b>Bank:</b> {invoice.bank.bankName}</span>}
                          {invoice.bank.accountNumber && <span><b>Account #:</b> {invoice.bank.accountNumber}</span>}
                          {invoice.bank.ifscCode && <span><b>IFSC Code:</b> {invoice.bank.ifscCode}</span>}
                          {invoice.bank.branchName && <span><b>Branch:</b> {invoice.bank.branchName}</span>}
                      </div>
                  </div>
              )}
              <div className="text-center">
                  <h1 className="font-bold">For {invoice.company.companyName || 'Company Name'}</h1>
                  <div className="h-30 w-auto my-2"></div> {/* Placeholder for signature image */}
                  <h1 className="font-bold">Authorised Signatory</h1>
                  {/* Signature image is static in HTML, omitting dynamic image for now */}
                  {/* <img src="https://vx-erp-signatures.s3.ap-south-1.amazonaws.com/signature-XzO2kt-20241121183547.png" alt="" className="h-30 w-auto"/> */}
              </div>
          </section>

          <section className="w-[50%] flex flex-col gap-5 pb-10 mt-[-50px]">
              {invoice.notes && (
                  <div className="flex flex-col gap-2">
                      <h1 className="text-md font-bold">Notes For Invoice</h1>
                      <p className="text-xs">
                          {invoice.notes}
                      </p>
                  </div>
              )}
              {invoice.termsConditions && (
                  <div className="flex flex-col gap-2">
                      <h1 className="text-md font-bold">Terms & Conditions For Invoice</h1>
                      <p className="text-xs">
                          {invoice.termsConditions}
                      </p>
                  </div>
              )}
          </section>

          <section className="text-center w-full">
              <span className="text-md font-semibold">This is a computer generated document</span>
          </section>

        </div>
          </section>
        </SidebarInset>
      </SidebarProvider>
  )
}
