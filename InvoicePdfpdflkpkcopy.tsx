import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Badge } from '@/components/ui/badge';
import '@/app/globals.css'

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

// Styles matching the exact PDF format
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #000',
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain'
  },
  headerText: {
    flex: 1,
    textAlign: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#021429ff'
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 15
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  detailText: {
    fontSize: 9
  },
  companySection: {
    marginBottom: 15
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2
  },
  gstText: {
    fontSize: 9,
    marginBottom: 2
  },
  addressText: {
    fontSize: 9,
    marginBottom: 1
  },
  mobileText: {
    fontSize: 9,
    marginBottom: 10
  },
  customerSection: {
    marginBottom: 15
  },
  customerName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2
  },
  table: {
    marginTop: 15,
    marginBottom: 15
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
    padding: 5
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5px solid #ddd',
    padding: 5
  },
  tableCellSmall: {
    flex: 1,
    fontSize: 8,
    textAlign: 'center'
  },
  tableCellMedium: {
    flex: 2,
    fontSize: 8,
    textAlign: 'center'
  },
  tableCellLarge: {
    flex: 3,
    fontSize: 8,
    textAlign: 'left'
  },
  itemName: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 1
  },
  hsnCode: {
    fontSize: 7,
    color: '#666'
  },
  description: {
    fontSize: 7,
    color: '#666',
    marginTop: 2
  },
  totalsSection: {
    marginLeft: 'auto',
    width: 200,
    marginTop: 10
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2
  },
  totalRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    fontWeight: 'bold',
    borderTop: '1px solid #000',
    marginTop: 5
  },
  summary: {
    marginTop: 10,
    fontSize: 9
  },
  bankDetails: {
    marginTop: 20,
    borderTop: '1px solid #000',
    paddingTop: 10
  },
  bankTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5
  },
  bankText: {
    fontSize: 9,
    marginBottom: 1
  },
  footer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  notesSection: {
    flex: 1
  },
  signatureSection: {
    flex: 1,
    textAlign: 'right'
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3
  },
  notesText: {
    fontSize: 9
  },
  signatureText: {
    fontSize: 9,
    marginBottom: 2
  },
  signatureSpace: {
    marginTop: 30
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTop: '1px solid #ddd',
    paddingTop: 10
  }
});

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${numAmount.toFixed(2)}`;
}

function convertToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  function convert(n: number): string {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  }
  
  return convert(Math.floor(amount));
}

interface InvoicePdfProps {
  invoice: InvoiceData;
}

export const InvoicePdf: React.FC<InvoicePdfProps> = ({ invoice }) => {
  const totalItems = invoice.items.length;
  const totalQuantity = invoice.items.reduce((sum, item) => sum + parseFloat(item.quantity), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          {invoice.company.logoUrl && (
            <Image 
              style={styles.logo} 
              src={invoice.company.logoUrl} 
            />
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>TAX INVOICE</Text>
            <Text style={styles.subtitle}>Original For Recipient</Text>
          </View>
        </View>

        {/* Invoice Details Row */}
        <View style={styles.invoiceDetails}>
          <Text style={styles.detailText}>Invoice #: {invoice.invoiceNumber}</Text>
          <Text style={styles.detailText}>Invoice Date: {formatDate(invoice.invoiceDate)}</Text>
          <Text style={styles.detailText}>Due Date: {formatDate(invoice.dueDate)}</Text>
        </View>

        {/* Company Details */}
        <View style={styles.companySection}>
          <Text style={styles.companyName}>M/S {invoice.company.companyName || 'Company Name'}</Text>
          {invoice.company.gst && <Text style={styles.gstText}>GSTIN {invoice.company.gst}</Text>}
          {invoice.company.address && <Text style={styles.addressText}>{invoice.company.address}</Text>}
          {(invoice.company.city || invoice.company.state || invoice.company.pincode) && (
            <Text style={styles.addressText}>
              {[invoice.company.city, invoice.company.state, invoice.company.pincode]
                .filter(Boolean)
                .join(', ')}
            </Text>
          )}
          {invoice.company.phone && <Text style={styles.mobileText}>Mobile {invoice.company.phone}</Text>}
        </View>

        {/* Customer Details */}
        <View style={styles.customerSection}>
          <Text style={styles.customerName}>Customer Details:</Text>
          <Text style={styles.customerName}>{invoice.client.name || 'Client Name'}</Text>
          {invoice.client.gst && <Text style={styles.gstText}>GSTIN: {invoice.client.gst}</Text>}
          {invoice.client.billingState && (
            <Text style={styles.gstText}>Place of Supply: {invoice.client.billingState}</Text>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellSmall}>#</Text>
            <Text style={styles.tableCellLarge}>Item</Text>
            <Text style={styles.tableCellMedium}>Rate</Text>
            <Text style={styles.tableCellSmall}>Qty</Text>
            <Text style={styles.tableCellMedium}>Taxable Value</Text>
            <Text style={styles.tableCellMedium}>Tax Amount</Text>
            <Text style={styles.tableCellMedium}>Amount</Text>
          </View>
          
          {invoice.items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.tableCellSmall}>{index + 1}</Text>
              <View style={styles.tableCellLarge}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                {item.hsnSacCode && <Text style={styles.hsnCode}>HSN: {item.hsnSacCode}</Text>}
                {item.description && <Text style={styles.description}>{item.description}</Text>}
              </View>
              <Text style={styles.tableCellMedium}>{formatCurrency(item.rate)}</Text>
              <Text style={styles.tableCellSmall}>{item.quantity}</Text>
              <Text style={styles.tableCellMedium}>
                {formatCurrency(parseFloat(item.totalAmount) - parseFloat(item.taxAmount))}
              </Text>
              <Text style={styles.tableCellMedium}>
                {formatCurrency(item.taxAmount)} ({item.taxPercentage}%)
              </Text>
              <Text style={styles.tableCellMedium}>{formatCurrency(item.totalAmount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Taxable Amount</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRowBold}>
            <Text>Total</Text>
            <Text>{formatCurrency(invoice.totalAmount)}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text>Total Items / Qty: {totalItems} / {totalQuantity.toFixed(2)}</Text>
          <Text>Total amount (in words): INR {convertToWords(parseFloat(invoice.totalAmount))} Only</Text>
          <Text>Amount Paid</Text>
        </View>

        {/* Bank Details */}
        {invoice.bank.bankName && (
          <View style={styles.bankDetails}>
            <Text style={styles.bankTitle}>Bank Details:</Text>
            {invoice.bank.bankName && <Text style={styles.bankText}>Bank:{invoice.bank.bankName}</Text>}
            {invoice.bank.accountNumber && <Text style={styles.bankText}>Account #: {invoice.bank.accountNumber}</Text>}
            {invoice.bank.ifscCode && <Text style={styles.bankText}>IFSC Code: {invoice.bank.ifscCode}</Text>}
            {invoice.bank.branchName && <Text style={styles.bankText}>Branch: {invoice.bank.branchName}</Text>}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.notesSection}>
            {invoice.notes && (
              <>
                <Text style={styles.notesTitle}>Notes:</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </>
            )}
          </View>
          <View style={styles.signatureSection}>
            <Text style={styles.signatureText}>For M/S {invoice.company.companyName || 'Company Name'}</Text>
            <Text style={[styles.signatureText, styles.signatureSpace]}>Authorized Signatory</Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          Swipe | Simple Invoicing, Billing and Payments | Visit getswipe.in
        </Text>
        <Text style={styles.footerText}>
          Page 1 / 1   •   This is a digitally signed document.
        </Text>
        <Text style={styles.footerText}>
          Powered By
        </Text>
      </Page>
    </Document>
  );
};

export default InvoicePdf;
