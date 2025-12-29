import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image
} from '@react-pdf/renderer'

// Register NotoSans font (supports rupee symbol)
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: '/fonts/NotoSans-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/NotoSans-Regular.ttf', fontWeight: 600 } // Assuming NotoSans-Regular.ttf is used for both regular and bold, or you can specify NotoSans-Bold.ttf if available
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
    padding: 0, // Main container will handle padding
    fontSize: 10,
    fontFamily: 'NotoSans',
    backgroundColor: '#f3f4f6', // bg-gray-200 for body
  },
  mainContainer: { // Mimics the main tag
    maxWidth: 768, // max-w-4xl (approx 768px)
    marginHorizontal: 'auto', // mx-auto
    marginTop: 20, // my-20
    marginBottom: 20, // my-20
    height: 'auto',
    borderRadius: 24, // rounded-3xl (approx 24px)
    paddingVertical: 32, // py-8 (8 * 4 = 32)
    paddingHorizontal: 32, // px-8
    backgroundColor: '#fff', // bg-white
  },
  section: { // General section padding-bottom
    paddingBottom: 12, // pb-3 (3 * 4 = 12)
  },
  inlineFlex: { // inline-flex
    flexDirection: 'row',
    alignItems: 'center', // default for inline-flex
  },
  flex: { // flex
    flexDirection: 'row',
  },
  justifyBetween: { // justify-between
    justifyContent: 'space-between',
  },
  wFull: { // w-full
    width: '100%',
  },
  fontBold: { // font-bold
    fontWeight: 'bold',
  },
  text2xl: { // text-2xl
    fontSize: 24,
  },
  textLg: { // text-lg
    fontSize: 18,
  },
  textMd: { // text-md
    fontSize: 16,
  },
  textSm: { // text-sm
    fontSize: 12,
  },
  textXs: { // text-xs
    fontSize: 10,
  },
  gap6: { // gap-6
    gap: 24, // 6 * 4 = 24
  },
  gap3: { // gap-3
    gap: 12, // 3 * 4 = 12
  },
  gap2: { // gap-2
    gap: 8, // 2 * 4 = 8
  },
  gap1: { // gap-1
    gap: 4, // 1 * 4 = 4
  },
  flexCol: { // flex-col
    flexDirection: 'column',
  },
  textRight: { // text-right
    textAlign: 'right',
  },
  textCenter: { // text-center
    textAlign: 'center',
  },
  borderT: { // border-t
    borderTopWidth: 1,
  },
  borderB: { // border-b
    borderBottomWidth: 1,
  },
  borderBlue600: { // border-blue-600
    borderColor: '#2563eb', // A common blue-600 color
  },
  borderBlue300: { // border-blue-300
    borderColor: '#93c5fd', // A common blue-300 color
  },
  p2: { // p-2
    padding: 8, // 2 * 4 = 8
  },
  w10: { // w-10
    width: 40, // 10 * 4 = 40
  },
  alignTop: { // align-top (for table cells)
    verticalAlign: 'top',
  },
  spaceY1: { // space-y-1
    gap: 4, // 1 * 4 = 4
  },
  mtNegative50: { // mt-[-50px]
    marginTop: -50,
  },
  h40: { // h-40
    height: 160, // 40 * 4 = 160
  },
  h30: { // h-30 (approx)
    height: 120,
  },
  hFull: { // h-full
    height: '100%',
  },
  wAuto: { // w-auto
    width: 'auto',
  },
  // Table specific styles
  table: {
    width: '100%',
    borderCollapse: 'collapse', // Not directly supported, mimic with borders on rows/cells
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2563eb', // border-blue-600
    paddingVertical: 8, // p-2
    fontSize: 12, // text-sm
  },
  tableBodyRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#93c5fd', // border-blue-300
    paddingVertical: 8, // p-2
  },
  tableColHash: { width: '5%', textAlign: 'center' }, // w-10 is too small, use percentage
  tableColItem: { width: '25%' }, // Adjusted for better fit
  tableColRate: { width: '15%', textAlign: 'right' },
  tableColQty: { width: '10%', textAlign: 'right' },
  tableColTaxable: { width: '15%', textAlign: 'right' },
  tableColTax: { width: '15%', textAlign: 'right' },
  tableColAmount: { width: '15%', textAlign: 'right' },

  // Summary grid
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Mimic grid-cols-2 with two main columns
    padding: 16, // p-4
    fontSize: 12, // text-sm
  },
  summaryLeftCol: {
    width: '50%', // Placeholder for the empty div
  },
  summaryRightCol: {
    width: '50%',
    flexDirection: 'column',
    gap: 4, // space-y-1
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pt2: { // pt-2
    paddingTop: 8,
  },
  textGray700: { // text-gray-700
    color: '#374151',
  },
  textBase: { // text-base
    fontSize: 16,
  },
  // Total
  totalContainer: {
    borderTopWidth: 1,
    borderColor: '#2563eb',
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  // Footer
  footerSection: {
    borderTopWidth: 1,
    borderColor: '#2563eb',
    paddingVertical: 8, // py-2
    paddingHorizontal: 16, // px-4
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10, // text-xs
  },
  footerAmountPayable: {
    borderTopWidth: 1,
    borderColor: '#2563eb',
    paddingVertical: 8, // py-2
    paddingHorizontal: 16, // px-4
    textAlign: 'right',
    fontWeight: 'semibold',
    fontSize: 12, // text-sm
  },
  // Notes and Terms
  notesTermsContainer: {
    width: '50%', // w-[50%]
    flexDirection: 'column',
    gap: 20, // gap-5 (5 * 4 = 20)
    paddingBottom: 40, // pb-10
    marginTop: -50, // mt-[-50px]
  },
  notesTermsBlock: {
    flexDirection: 'column',
    gap: 8, // gap-2
  },
  computerGenerated: {
    textAlign: 'center',
    width: '100%',
    fontSize: 16, // text-md
    fontWeight: 'semibold',
  },
  // Specific styles for company/client blocks
  companyDetails: {
    flexDirection: 'column',
    gap: 4, // for internal spacing
  },
  clientDetails: {
    flexDirection: 'column',
    gap: 4, // for internal spacing
  },
  signatureBlock: {
    textAlign: 'center',
    flexDirection: 'column',
    alignItems: 'center',
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
      legalName: invoice.company.legalName || '',
      gstin: invoice.company.gst || '',
      pan: invoice.company.pan || '',
      addressLines: getAddressLines(invoice.company.address),
      cityStatePincode: getCityStatePincode(invoice.company.city, invoice.company.state, invoice.company.pincode),
      mobile: invoice.company.phone || '',
      email: invoice.company.email || '',
      logoUrl: invoice.company.logoUrl || ''
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
      taxableValue: (parseAmount(item.totalAmount) - parseAmount(item.taxAmount)).toFixed(2)
    })),
    bank: {
      bankName: invoice.bank.bankName || '',
      accountNumber: invoice.bank.accountNumber || '',
      ifsc: invoice.bank.ifscCode || '',
      branch: invoice.bank.branchName || ''
    }
  };

  const totalQty = invoice.items.reduce((s, i) => s + parseFloat(i.quantity), 0)
  const totalTaxableAmount = invoice.items.reduce((sum, item) => sum + parseAmount(item.taxableValue), 0);
  const totalTaxAmount = invoice.items.reduce((sum, item) => sum + parseAmount(item.taxAmount), 0);

  // Assuming CGST/SGST are half of the total tax amount for simplicity if not provided separately
  const cgstAmount = (totalTaxAmount / 2).toFixed(2);
  const sgstAmount = (totalTaxAmount / 2).toFixed(2);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.mainContainer}>

          {/* Header: TAX INVOICE & ORIGINAL FOR RECIPIENT */}
          <View style={[styles.inlineFlex, styles.justifyBetween, styles.wFull, styles.section]}>
            <Text style={styles.fontBold}>TAX INVOICE</Text>
            <Text>ORIGINAL FOR RECIPIENT</Text>
          </View>

          {/* Company Details & Logo */}
          <View style={[styles.inlineFlex, styles.justifyBetween, styles.wFull, styles.section]}>
            <View style={styles.companyDetails}>
              <Text style={[styles.text2xl, styles.fontBold]}>{transformedData.seller.name}</Text>

              <View style={styles.inlineFlex}>
                <View style={styles.inlineFlex}>
                  <Text style={styles.fontBold}>GSTIN</Text>
                  <Text>{transformedData.seller.gstin}</Text>
                </View>
                <View style={[styles.inlineFlex, { marginLeft: 24 }]}> {/* gap-6 */}
                  <Text style={styles.fontBold}>PAN</Text>
                  <Text>{transformedData.seller.pan}</Text>
                </View>
              </View>

              <View>
                {transformedData.seller.addressLines.map((l: string, i: number) => (
                  <Text key={i}>{l}</Text>
                ))}
                <Text>{transformedData.seller.cityStatePincode}</Text>
              </View>

              <View style={styles.inlineFlex}>
                <View style={styles.inlineFlex}>
                  <Text style={styles.fontBold}>Phone</Text>
                  <Text>{transformedData.seller.mobile}</Text>
                </View>
                <View style={[styles.inlineFlex, { marginLeft: 24 }]}> {/* gap-6 */}
                  <Text style={styles.fontBold}>Email</Text>
                  <Text>{transformedData.seller.email}</Text>
                </View>
              </View>
            </View>

            {transformedData.seller.logoUrl && (
              <View style={[styles.h40, styles.wAuto]}>
                <Image src={transformedData.seller.logoUrl} style={[styles.hFull, styles.wFull]} />
              </View>
            )}
          </View>

          {/* Invoice Meta */}
          <View style={[styles.section, styles.inlineFlex, styles.gap6]}>
            <View style={styles.inlineFlex}>
              <Text style={styles.fontBold}>Invoice No.</Text>
              <Text>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.inlineFlex}>
              <Text style={styles.fontBold}>Invoice Date</Text>
              <Text>{formatDate(invoice.invoiceDate)}</Text>
            </View>
            <View style={styles.inlineFlex}>
              <Text style={styles.fontBold}>Due Date</Text>
              <Text>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>

          {/* Customer Details & Billing Address */}
          <View style={[styles.inlineFlex, styles.gap6, styles.section]}>
            <View style={[styles.flexCol, styles.gap1]}>
              <Text style={[styles.textLg, styles.fontBold]}>Customer Details</Text>
              <View style={[styles.fontBold, styles.flexCol]}>
                <Text>{transformedData.customer.legalName}</Text>
                <Text>{transformedData.customer.tradeName}</Text>
                <Text>GSTIN: {transformedData.customer.gstin}</Text>
              </View>
            </View>
            <View style={[styles.flexCol, styles.gap1]}>
              <Text style={[styles.textLg, styles.fontBold]}>Billing Address</Text>
              <View style={[styles.fontBold, styles.flexCol]}>
                {transformedData.customer.billingAddressLines.map((l: string, i: number) => (
                  <Text key={i}>{l}</Text>
                ))}
                <Text>{transformedData.customer.cityStatePincode}</Text>
              </View>
            </View>
          </View>

          {/* Place of Supply */}
          <View style={styles.section}>
            <Text style={[styles.textMd, styles.fontBold]}>Place of Supply</Text>
            <Text style={[styles.textSm, styles.fontBold]}>{transformedData.customer.placeOfSupply}</Text>
          </View>

          {/* Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableColHash}>#</Text>
              <Text style={styles.tableColItem}>Item</Text>
              <Text style={styles.tableColRate}>Rate / Item</Text>
              <Text style={styles.tableColQty}>Qty</Text>
              <Text style={styles.tableColTaxable}>Taxable Value</Text>
              <Text style={styles.tableColTax}>Tax Amount</Text>
              <Text style={styles.tableColAmount}>Amount</Text>
            </View>

            {/* Table Body */}
            {transformedData.items.map((it: any, i: number) => (
              <View key={it.id} style={styles.tableBodyRow}>
                <Text style={[styles.tableColHash, styles.alignTop]}>{i + 1}</Text>
                <View style={[styles.tableColItem, styles.alignTop]}>
                  <Text style={styles.fontBold}>{it.name}</Text>
                  <Text style={styles.textXs}>HSN: {it.sacCode}</Text>
                </View>
                <Text style={[styles.tableColRate, styles.alignTop]}>{money(it.rate)}</Text>
                <Text style={[styles.tableColQty, styles.alignTop]}>{it.quantity} PCS</Text>
                <Text style={[styles.tableColTaxable, styles.alignTop]}>{money(it.taxableValue)}</Text>
                <Text style={[styles.tableColTax, styles.alignTop]}>
                  {money(it.taxAmount)} ({it.taxPercentage}%)
                </Text>
                <Text style={[styles.tableColAmount, styles.alignTop]}>{money(it.totalAmount)}</Text>
              </View>
            ))}
          </View>

          {/* Summary */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryLeftCol}></View> {/* Empty div */}
            <View style={styles.summaryRightCol}>
              {/* Delivery/Shipping Charges - Not in current data, adding placeholder */}
              {/* <View style={styles.summaryRow}>
                <Text style={styles.fontBold}>Delivery/Shipping Charges</Text>
                <Text>₹0.00</Text>
              </View>
              <Text style={[styles.textXs, styles.textGray700]}>SAC: 9968</Text> */}

              <View style={[styles.summaryRow, styles.pt2]}>
                <Text style={styles.fontBold}>Taxable Amount</Text>
                <Text>{money(totalTaxableAmount)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text>CGST {(parseFloat(invoice.taxAmount) / 2 / parseFloat(invoice.subtotal) * 100).toFixed(1)}%</Text>
                <Text>{money(cgstAmount)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text>SGST {(parseFloat(invoice.taxAmount) / 2 / parseFloat(invoice.subtotal) * 100).toFixed(1)}%</Text>
                <Text>{money(sgstAmount)}</Text>
              </View>
            </View>
          </View>

          {/* Total */}
          <View style={styles.totalContainer}>
            <Text style={[styles.fontBold, styles.textBase]}>Total {money(invoice.totalAmount)}</Text>
          </View>

          {/* Footer - Total Items / Qty & Amount in words */}
          <View style={styles.footerSection}>
            <Text>Total Items / Qty : {invoice.items.length} / {totalQty}</Text>
            <Text>
              Total amount (in words): INR {numberToWords(parseFloat(invoice.totalAmount))} Only.
            </Text>
          </View>

          {/* Amount Payable */}
          <View style={styles.footerAmountPayable}>
            <Text>Amount Payable: {money(invoice.totalAmount)}</Text>
          </View>

          {/* Bank Details & Signature */}
          <View style={[styles.inlineFlex, styles.justifyBetween, styles.wFull, styles.section]}>
            <View>
              <Text style={[styles.textMd, styles.fontBold]}>Bank Details</Text>
              <View style={[styles.flexCol, styles.textSm]}>
                <Text><Text style={styles.fontBold}>Bank:</Text> {transformedData.bank.bankName}</Text>
                <Text><Text style={styles.fontBold}>Account #:</Text> {transformedData.bank.accountNumber}</Text>
                <Text><Text style={styles.fontBold}>IFSC Code:</Text> {transformedData.bank.ifsc}</Text>
                <Text><Text style={styles.fontBold}>Branch:</Text> {transformedData.bank.branch}</Text>
              </View>
            </View>
            <View style={styles.signatureBlock}>
              <Text style={styles.fontBold}>For Authorised Signatory</Text>
              {/* Placeholder for signature image */}
              <Image src="https://vx-erp-signatures.s3.ap-south-1.amazonaws.com/signature-XzO2kt-20241121183547.png" style={[styles.h30, styles.wAuto]} />
              <Text style={styles.fontBold}>For {transformedData.seller.name}</Text>
            </View>
          </View>

          {/* Notes and Terms */}
          <View style={[styles.notesTermsContainer, styles.mtNegative50]}>
            {invoice.notes && (
              <View style={styles.notesTermsBlock}>
                <Text style={[styles.textMd, styles.fontBold]}>Notes For Invoice</Text>
                <Text style={styles.textXs}>{invoice.notes}</Text>
              </View>
            )}

            {invoice.termsConditions && (
              <View style={styles.notesTermsBlock}>
                <Text style={[styles.textMd, styles.fontBold]}>Terms & Conditions For Invoice</Text>
                <Text style={styles.textXs}>{invoice.termsConditions}</Text>
              </View>
            )}
          </View>

          {/* Computer Generated Document */}
          <View style={styles.wFull}>
            <Text style={styles.computerGenerated}>This is a computer generated document</Text>
          </View>

        </View>
      </Page>
    </Document>
  )
}

export default InvoicePdf
