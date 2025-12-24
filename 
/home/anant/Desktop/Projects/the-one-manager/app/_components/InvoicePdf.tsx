import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer'

// Register Roboto font with reliable CDN
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/roboto@4.5.8/files/roboto-latin-400-normal.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/roboto@4.5.8/files/roboto-latin-600-normal.ttf', fontWeight: 600 }
  ]
})

/* =========================
   Types
========================= */

export interface InvoiceData {
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

/* =========================
   Helpers
========================= */

const formatDate = (date: string | null) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const money = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return `₹${numAmount.toFixed(2)}`
}

const parseAmount = (amount: string | number): number => {
  return typeof amount === 'string' ? parseFloat(amount) : amount
}

const numberToWords = (num: number): string => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
    'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ]
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const inWords = (n: number): string => {
    if (n < 20) return a[n]
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '')
    if (n < 1000)
      return a[Math.floor(n / 100)] + ' Hundred ' + inWords(n % 100)
    if (n < 100000)
      return inWords(Math.floor(n / 1000)) + ' Thousand ' + inWords(n % 1000)
    return inWords(Math.floor(n / 100000)) + ' Lakh ' + inWords(n % 100000)
  }

  return inWords(Math.floor(num)).trim()
}

const getAddressLines = (address: string | null): string[] => {
  if (!address) return []
  return address.split('\n').filter(line => line.trim())
}

const getCityStatePincode = (city: string | null, state: string | null, pincode: string | null): string => {
  const parts = [city, state, pincode].filter(Boolean)
  return parts.join(', ')
}

/* =========================
   Styles
========================= */

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Arial'
  },

  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 12
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },

  sellerBlock: {
    marginBottom: 12
  },

  bold: { fontWeight: 'bold' },

  section: {
    marginBottom: 10
  },

  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
    paddingBottom: 4,
    marginTop: 10
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottom: '0.5px solid #ddd'
  },

  colS: { width: '5%', textAlign: 'center' },
  colL: { width: '35%' },
  colM: { width: '15%', textAlign: 'right' },

  totalsBox: {
    marginLeft: 'auto',
    width: 220,
    marginTop: 10
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2
  },

  bankBox: {
    marginTop: 15,
    borderTop: '1px solid #000',
    paddingTop: 8
  },

  footer: {
    marginTop: 25,
    fontSize: 8,
    textAlign: 'center',
    color: '#666'
  }
})

/* =========================
   Component
========================= */

export const InvoicePdf: React.FC<{ invoice: InvoiceData }> = ({ invoice }) => {
  const totalQty = invoice.items.reduce((sum, item) => sum + parseAmount(item.quantity), 0)

  // Calculate taxable value for each item
  const calculateTaxableValue = (item: typeof invoice.items[0]): number => {
    const total = parseAmount(item.totalAmount)
    const tax = parseAmount(item.taxAmount)
    return total - tax
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <Text style={styles.title}>TAX INVOICE</Text>
        <Text style={styles.subtitle}>Original For Recipient</Text>

        {/* Company/Seller */}
        <View style={styles.sellerBlock}>
          <Text style={styles.bold}>M/S {invoice.company.companyName || 'Company Name'}</Text>
          {invoice.company.gst && <Text>GSTIN {invoice.company.gst}</Text>}
          {getAddressLines(invoice.company.address).map((line, index) => (
            <Text key={index}>{line}</Text>
          ))}
          <Text>{getCityStatePincode(invoice.company.city, invoice.company.state, invoice.company.pincode)}</Text>
          {invoice.company.phone && <Text>Mobile {invoice.company.phone}</Text>}
        </View>

        {/* Invoice Meta */}
        <View style={styles.headerRow}>
          <Text>Invoice #: {invoice.invoiceNumber}</Text>
          <Text>Invoice Date: {formatDate(invoice.invoiceDate)}</Text>
          <Text>Due Date: {formatDate(invoice.dueDate)}</Text>
        </View>

        {/* Customer */}
        <View style={styles.section}>
          <Text style={styles.bold}>Customer Details:</Text>
          <Text>{invoice.client.companyName || invoice.client.name || 'Client Name'}</Text>
          {invoice.client.name && <Text>{invoice.client.name}</Text>}
          {invoice.client.gst && <Text>GSTIN: {invoice.client.gst}</Text>}
          {getAddressLines(invoice.client.address || invoice.client.billingMainAddress).map((line, index) => (
            <Text key={index}>{line}</Text>
          ))}
          <Text>{getCityStatePincode(invoice.client.billingCity, invoice.client.billingState, invoice.client.billingPincode)}</Text>
          {invoice.client.billingState && <Text>Place of Supply: {invoice.client.billingState}</Text>}
        </View>

        {/* Table */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.colS}>#</Text>
            <Text style={styles.colL}>Item</Text>
            <Text style={styles.colM}>Rate</Text>
            <Text style={styles.colM}>Qty</Text>
            <Text style={styles.colM}>Taxable</Text>
            <Text style={styles.colM}>Tax</Text>
            <Text style={styles.colM}>Amount</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colS}>{index + 1}</Text>
              <View style={styles.colL}>
                <Text style={styles.bold}>{item.itemName}</Text>
                {item.hsnSacCode && <Text>SAC: {item.hsnSacCode}</Text>}
              </View>
              <Text style={styles.colM}>{money(item.rate)}</Text>
              <Text style={styles.colM}>{item.quantity}</Text>
              <Text style={styles.colM}>{money(calculateTaxableValue(item))}</Text>
              <Text style={styles.colM}>
                {money(item.taxAmount)} ({item.taxPercentage}%)
              </Text>
              <Text style={styles.colM}>{money(item.totalAmount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text>Taxable Amount</Text>
            <Text>{money(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax Amount</Text>
            <Text>{money(invoice.taxAmount)}</Text>
          </View>
          <View style={[styles.totalRow, styles.bold]}>
            <Text>Total</Text>
            <Text>{money(invoice.totalAmount)}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text>
            Total Items / Qty : {invoice.items.length} / {totalQty.toFixed(2)}
          </Text>
          <Text>
            Total amount (in words): INR {numberToWords(parseAmount(invoice.totalAmount))} Only.
          </Text>
          <Text>Amount Paid</Text>
        </View>

        {/* Bank */}
        {invoice.bank.bankName && (
          <View style={styles.bankBox}>
            <Text style={styles.bold}>Bank Details:</Text>
            {invoice.bank.bankName && <Text>Bank: {invoice.bank.bankName}</Text>}
            {invoice.bank.accountNumber && <Text>Account #: {invoice.bank.accountNumber}</Text>}
            {invoice.bank.ifscCode && <Text>IFSC Code: {invoice.bank.ifscCode}</Text>}
            {invoice.bank.branchName && <Text>Branch: {invoice.bank.branchName}</Text>}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          For M/S {invoice.company.companyName || 'Company Name'}
          {"\n"}Authorized Signatory
          {"\n\n"}
          Swipe | Simple Invoicing, Billing and Payments | Visit getswipe.in
          {"\n"}
          Page 1 / 1 • This is a digitally signed document.
          {"\n"}
          Powered By
        </Text>

      </Page>
    </Document>
  )
}

export default InvoicePdf

