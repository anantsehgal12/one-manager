import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer'

// Register NotoSans font (supports rupee symbol)
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: '../invoices/fonts/NotoSans-Regular.ttf', fontWeight: 400 },
    { src: '../invoices/fonts/NotoSans-Regular.ttf', fontWeight: 600 }
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
    fontFamily: 'NotoSans'
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
  // Transform InvoiceData to display format
  const transformedData = {
    seller: {
      name: invoice.company.companyName || '',
      gstin: invoice.company.gst || '',
      addressLines: getAddressLines(invoice.company.address),
      cityStatePincode: getCityStatePincode(invoice.company.city, invoice.company.state, invoice.company.pincode),
      mobile: invoice.company.phone || ''
    },
    customer: {
      legalName: invoice.client.name || '',
      tradeName: invoice.client.companyName || '',
      gstin: invoice.client.gst || '',
      billingAddressLines: getAddressLines(invoice.client.address),
      cityStatePincode: getCityStatePincode(invoice.client.billingCity, invoice.client.billingState, invoice.client.billingPincode),
      placeOfSupply: invoice.client.billingState || ''
    },
    items: invoice.items.map(item => ({
      ...item,
      name: item.itemName,
      sacCode: item.hsnSacCode,
      taxableValue: (parseFloat(item.totalAmount) - parseFloat(item.taxAmount)).toFixed(2)
    })),
    bank: {
      bankName: invoice.bank.bankName || '',
      accountNumber: invoice.bank.accountNumber || '',
      ifsc: invoice.bank.ifscCode || '',
      branch: invoice.bank.branchName || ''
    }
  };

  const totalQty = invoice.items.reduce((s, i) => s + parseFloat(i.quantity), 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <Text style={styles.title}>TAX INVOICE</Text>
        <Text style={styles.subtitle}>Original For Recipient</Text>

        {/* Seller */}
        <View style={styles.sellerBlock}>
          <Text style={styles.bold}>M/S {transformedData.seller.name}</Text>
          <Text>GSTIN {transformedData.seller.gstin}</Text>
          {transformedData.seller.addressLines.map((l: string, i: number) => (
            <Text key={i}>{l}</Text>
          ))}
          <Text>{transformedData.seller.cityStatePincode}</Text>
          <Text>Mobile {transformedData.seller.mobile}</Text>
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
          <Text>{transformedData.customer.tradeName}</Text>
          <Text>{transformedData.customer.legalName}</Text>
          <Text>GSTIN: {transformedData.customer.gstin}</Text>
          {transformedData.customer.billingAddressLines.map((l: string, i: number) => (
            <Text key={i}>{l}</Text>
          ))}
          <Text>{transformedData.customer.cityStatePincode}</Text>
          <Text>Place of Supply: {transformedData.customer.placeOfSupply}</Text>
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

          {transformedData.items.map((it: any, i: number) => (
            <View key={it.id} style={styles.tableRow}>
              <Text style={styles.colS}>{i + 1}</Text>
              <View style={styles.colL}>
                <Text style={styles.bold}>{it.name}</Text>
                <Text>SAC: {it.sacCode}</Text>
              </View>
              <Text style={styles.colM}>{money(it.rate)}</Text>
              <Text style={styles.colM}>{it.quantity}</Text>
              <Text style={styles.colM}>{money(it.taxableValue)}</Text>
              <Text style={styles.colM}>
                {money(it.taxAmount)} ({it.taxPercentage}%)
              </Text>
              <Text style={styles.colM}>{money(it.totalAmount)}</Text>
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
            Total Items / Qty : {invoice.items.length} / {totalQty}
          </Text>
          <Text>
            Total amount (in words): INR {numberToWords(parseFloat(invoice.totalAmount))} Only.
          </Text>
          <Text>Amount Paid</Text>
        </View>

        {/* Bank */}
        <View style={styles.bankBox}>
          <Text style={styles.bold}>Bank Details:</Text>
          <Text>Bank: {transformedData.bank.bankName}</Text>
          <Text>Account #: {transformedData.bank.accountNumber}</Text>
          <Text>IFSC Code: {transformedData.bank.ifsc}</Text>
        </View>
        {/* Footer */}
        <Text style={styles.footer}>
          For M/S {transformedData.seller.name}
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
