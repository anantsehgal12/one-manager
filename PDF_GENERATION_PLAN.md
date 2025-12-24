# PDF Generation Plan using ReactPdf

## Information Gathered
- ReactPdf (@react-pdf/renderer) is already installed in package.json
- Current invoice page exists at `app/invoices/[id]/page.tsx` with complete invoice data structure
- Empty pdf folder exists at `app/invoices/[id]/pdf/`
- Invoice data includes: company info, client info, items, bank details, tax calculations

## Plan
Create a PDF generation system using ReactPdf with the following components:

### 1. Create ReactPdf Invoice Component
- Create a new file `components/InvoicePdf.tsx` that uses @react-pdf/renderer
- Component will render invoice data in PDF format
- Include all invoice details: header, company/client info, items table, totals, bank details

### 2. Create PDF Route Handler
- Create `app/invoices/[id]/pdf/route.ts` 
- Route will fetch invoice data by ID
- Use ReactPdf to generate PDF document
- Return PDF as response with proper headers

### 3. Add PDF Download Button
- Modify existing invoice page to include PDF download button
- Button will link to the PDF route

## Files to Create/Modify
1. `components/InvoicePdf.tsx` - ReactPdf component for invoice
2. `app/invoices/[id]/pdf/route.ts` - PDF generation route
3. `app/invoices/[id]/page.tsx` - Add download button

## Dependencies
- @react-pdf/renderer (already installed)

## Next Steps
1. Create InvoicePdf React component
2. Create PDF route handler
3. Test PDF generation
4. Add download button to invoice page
