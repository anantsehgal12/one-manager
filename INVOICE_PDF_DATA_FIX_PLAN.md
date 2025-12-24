# InvoicePdf Data Structure Fix Plan

## Problem Analysis
The InvoicePdf.tsx component expects `RegencyInvoiceData` structure but receives `InvoiceData` from the invoice page, causing data binding issues.

## Current State
- **Current InvoicePdf.tsx**: Expects `data: RegencyInvoiceData` prop
- **Invoice Page**: Passes `invoice: InvoiceData` prop  
- **API Response**: Returns data matching `InvoiceData` structure

## Data Structure Differences

### Seller/Company Mapping
```
Current (RegencyInvoiceData) → Target (InvoiceData from page)
seller.name → company.companyName
seller.gstin → company.gst  
seller.addressLines[] → company.address
seller.cityStatePincode → company.city + company.state + company.pincode
seller.mobile → company.phone
```

### Customer Mapping  
```
Current (RegencyInvoiceData) → Target (InvoiceData from page)
customer.legalName → client.name
customer.tradeName → client.companyName
customer.gstin → client.gst
customer.billingAddressLines[] → client.address
customer.cityStatePincode → client.billingCity + client.billingState + client.billingPincode  
customer.placeOfSupply → client.billingState
```

### Items Mapping
```
Current (RegencyInvoiceData) → Target (InvoiceData from page)
items[].name → items[].itemName
items[].sacCode → items[].hsnSacCode
items[].rate → items[].rate
items[].quantity → items[].quantity  
items[].taxableValue → Calculate: totalAmount - taxAmount
items[].taxAmount → items[].taxAmount
items[].taxPercentage → items[].taxPercentage
items[].totalAmount → items[].totalAmount
```

### Tax Mapping
```
Current (RegencyInvoiceData) → Target (InvoiceData from page)
cgstRate → Calculate from items
sgstRate → Calculate from items  
cgstAmount → Calculate from items
sgstAmount → Calculate from items
```

## Solution Plan

### Step 1: Update InvoicePdf Component Interface
- Change prop from `data: RegencyInvoiceData` to `invoice: InvoiceData`
- Update component usage to work with InvoiceData structure

### Step 2: Add Data Transformation Helpers
- Create mapping functions to transform InvoiceData to display format
- Handle address line formatting
- Calculate tax components (CGST/SGST)
- Handle optional fields gracefully

### Step 3: Update Component Implementation  
- Replace all `data.seller` references with mapped company data
- Replace all `data.customer` references with mapped client data
- Update items rendering to use new field mappings
- Maintain existing layout and styling

### Step 4: Update Invoice Page Call
- Change from `<InvoicePdf invoice={invoice} />` to use correct prop structure
- Ensure data flows correctly from API to component

## Expected Outcome
- InvoicePdf.tsx works with InvoiceData from invoice page
- No layout or style changes
- All invoice data displays correctly in PDF
- Proper tax calculations and formatting maintained

## Files to Modify
1. `/app/_components/InvoicePdf.tsx` - Update component interface and data usage
2. `/app/invoices/[id]/page.tsx` - Ensure correct prop passing (already correct)

## Testing Checklist
- [ ] PDF generates without errors
- [ ] Company details display correctly  
- [ ] Customer details display correctly
- [ ] Items table renders with correct data
- [ ] Tax calculations show properly
- [ ] Totals and amounts are accurate
- [ ] Layout and styling preserved
