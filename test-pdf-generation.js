const React = require('react');
const { pdf } = require('@react-pdf/renderer');

// Mock the InvoicePdf component for testing
const mockInvoicePdf = React.createElement;

// Sample invoice data matching the PDF_EX.pdf format
const sampleInvoice = {
  id: "test-invoice-123",
  invoiceNumber: "IN/AS/2025-26/32",
  invoiceDate: "2025-12-23",
  dueDate: "2025-12-23",
  subtotal: "100.00",
  taxAmount: "0.00",
  totalAmount: "100.00",
  paidAmount: "0.00",
  balanceAmount: "100.00",
  status: "pending",
  notes: "Notes are here",
  termsConditions: null,
  referenceNumber: null,
  
  client: {
    id: "client-123",
    name: "Sample",
    companyName: null,
    gst: "29AAABC0926D1A0",
    address: null,
    billingMainAddress: null,
    billingCity: null,
    billingState: "09-UTTAR PRADESH",
    billingPincode: null,
    billingCountry: null,
    mobileNo: null,
    email: null
  },
  
  company: {
    companyName: "ANANT SALES",
    legalName: null,
    address: "CHANDEL MARKET, HARJINDER NAGAR LAL BANGLA",
    city: "Kanpur Nagar",
    state: "UTTAR PRADESH",
    pincode: "208007",
    gst: "09FSUPS0928G1Z0",
    pan: null,
    email: null,
    phone: "+91 8318383377"
  },
  
  bank: {
    accountHolderName: null,
    bankName: "Indian Bank",
    accountNumber: "50283668483",
    ifscCode: "IDIB000K580",
    branchName: "KANPUR CHAKERI",
    upiId: null
  },
  
  items: [{
    id: "item-123",
    itemName: "Sample Product",
    description: "Create your first invoice with ease using our sample product!",
    quantity: "1",
    rate: "100.00",
    taxPercentage: "0",
    taxAmount: "0.00",
    totalAmount: "100.00",
    hsnSacCode: "00000000"
  }]
};

async function testPdfGeneration() {
  try {
    console.log('Testing PDF generation...');
    
    // Import the InvoicePdf component dynamically
    const { InvoicePdf } = require('./app/_components/InvoicePdf.tsx');
    
    const doc = React.createElement(InvoicePdf, { invoice: sampleInvoice });
    const pdfInstance = pdf(doc);
    
    // Generate PDF blob
    const blob = await pdfInstance.toBlob();
    
    console.log('PDF generated successfully!');
    console.log('Blob size:', blob.size, 'bytes');
    console.log('Blob type:', blob.type);
    
    // Save to file for verification
    const fs = require('fs');
    const buffer = await blob.arrayBuffer();
    fs.writeFileSync('./test-generated.pdf', Buffer.from(buffer));
    console.log('PDF saved as test-generated.pdf');
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}

testPdfGeneration();
