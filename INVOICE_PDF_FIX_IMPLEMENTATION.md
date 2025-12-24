# InvoicePdf Component Fix Implementation Plan

## Problem Analysis
The error "Cannot read properties of undefined (reading 'items')" occurs because:
1. InvoicePdf component expects `data` prop but receives `invoice` prop
2. Data structure mismatch between component expectations and actual InvoiceData structure
3. Component tries to access `data.items` but `data` is undefined/invalid

## Current State
- **Invoice Page**: Passes `<InvoicePdf invoice={invoice} />`
- **InvoicePdf Component**: Expects `data: RegencyInvoiceData` prop
- **API Response**: Returns `InvoiceData` structure matching invoice page

## Data Structure Mapping Required

### Current (Component Expects) → Actual (InvoiceData)
```
data.seller.name → invoice.company.companyName
data.seller.gstin → invoice.company.gst
data.seller.addressLines[] → Split invoice.company.address by \n
data.seller.cityStatePincode → invoice.company.city + ", " + invoice.company.state + " " + invoice.company.pincode
data.seller.mobile → invoice.company.phone

data.customer.legalName → invoice.client.name
data.customer.tradeName → invoice.client.companyName  
data.customer.gstin → invoice.client.gst
data.customer.billingAddressLines[] → Split invoice.client.address by \n
data.customer.cityStatePincode → invoice.client.billingCity + ", " + invoice.client.billingState + " " + invoice.client.billingPincode
data.customer.placeOfSupply → invoice.client.billingState

data.items[].name → invoice.items[].itemName
data.items[].sacCode → invoice.items[].hsnSacCode
data.items[].rate → invoice.items[].rate
data.items[].quantity → invoice.items[].quantity
data.items[].taxableValue → invoice.items[].totalAmount - invoice.items[].taxAmount
data.items[].taxAmount → invoice.items[].taxAmount
data.items[].taxPercentage → invoice.items[].taxPercentage
data.items[].totalAmount → invoice.items[].totalAmount

data.cgstRate → Calculate from items (if needed)
data.sgstRate → Calculate from items (if needed)
data.cgstAmount → Calculate from items (if needed)
data.sgstAmount → Calculate from items (if needed)

data.bank.bankName → invoice.bank.bankName
data.bank.accountNumber → invoice.bank.accountNumber
data.bank.ifsc → invoice.bank.ifscCode
data.bank.branch → invoice.bank.branchName
```

## Implementation Steps

### Step 1: Update Component Interface
- Change prop from `data: RegencyInvoiceData` to `invoice: InvoiceData`
- Update component function signature

### Step 2: Add Data Transformation Layer
- Create mapping functions to transform InvoiceData to display format
- Handle address line formatting from single string to array
- Calculate derived values (taxable value, totals)
- Handle optional fields gracefully

### Step 3: Update Component Implementation
- Replace all `data.seller` references with mapped company data
- Replace all `data.customer` references with mapped client data  
- Update items rendering to use new field mappings
- Update tax calculations and totals
- Update bank details access

### Step 4: Update Invoice Page Call (if needed)
- Ensure prop name matches component expectation

## Files to Modify
1. `/app/_components/InvoicePdf.tsx` - Main component fix
2. `/app/invoices/[id]/page.tsx` - Verify prop passing (should already be correct)

## Expected Outcome
- ✅ PDF generates without "Cannot read properties of undefined" error
- ✅ All invoice data displays correctly in PDF
- ✅ Company details, customer details, items, and totals render properly
- ✅ No layout or styling changes
- ✅ Maintains existing PDF generation functionality

## Testing Checklist
- [ ] PDF generates without errors
- [ ] Company details display correctly from invoice.company
- [ ] Customer details display correctly from invoice.client
- [ ] Items table renders with correct data from invoice.items
- [ ] Tax calculations and totals are accurate
- [ ] Bank details display correctly from invoice.bank
- [ ] Layout and styling preserved
- [ ] All optional fields handled gracefully
