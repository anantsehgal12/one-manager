# Invoice Create Page Development Plan

## Information Gathered
- Next.js app with TypeScript and Clerk authentication
- Drizzle ORM with PostgreSQL database
- Existing schema includes: clients, products, company_details, document_settings
- Uses shadcn/ui components and react-hook-form with zod validation
- Current client create page uses sidebar layout, but invoice page should be full-width without sidebar
- Fixed header and footer design required

## Plan Overview
Create a full-width invoice create page with:
1. Custom fixed header and footer (no sidebar)
2. Invoice creation form with client selection, product items, calculations
3. Integration with existing database schema
4. Responsive design following existing patterns

## Detailed Implementation Steps

### 1. Database Schema Analysis
- **Invoices Table**: Need to check if invoices table exists in schema
- **Invoice Items Table**: Need to check if invoice items table exists
- If missing, create the necessary tables

### 2. Page Structure
- **Path**: `/app/invoices/create/page.tsx`
- **Layout**: Full-width (no SidebarProvider)
- **Authentication**: Clerk integration
- **Header**: Custom fixed header component
- **Footer**: Custom fixed footer component

### 3. Form Structure
- **Client Selection**: Dropdown/select from existing clients
- **Invoice Details**: Invoice number, date, due date, reference
- **Product Items**: Dynamic add/remove rows with:
  - Product selection
  - Quantity
  - Rate
  - Tax percentage
  - Amount calculations
- **Totals**: Subtotal, tax amount, total
- **Terms & Conditions**: Text area
- **Notes**: Text area

### 4. Features
- **Client Auto-complete**: Search and select clients
- **Product Auto-complete**: Search and select products with pricing
- **Real-time Calculations**: Automatic total calculations
- **Form Validation**: Using zod schema
- **Save Draft**: Save incomplete invoices
- **Submit Invoice**: Create final invoice

### 5. API Endpoints
- **GET /api/invoices**: List invoices (if needed)
- **POST /api/invoices**: Create new invoice
- **GET /api/invoices/[id]**: Get specific invoice (if editing)
- **PUT /api/invoices/[id]**: Update invoice (if editing)

### 6. Components Needed
- **InvoiceForm**: Main form component
- **ProductItemRow**: Individual product row component
- **InvoiceTotals**: Totals calculation component
- **ClientSelector**: Client selection component
- **ProductSelector**: Product selection component

## Dependent Files to Create/Edit

### New Files:
1. `/app/invoices/create/page.tsx` - Main invoice create page
2. `/app/invoices/page.tsx` - Invoice list page (optional)
3. `/app/api/invoices/route.ts` - Invoice CRUD API
4. `/app/api/invoices/[id]/route.ts` - Individual invoice API
5. Components for invoice form elements

### Files to Check/Update:
1. `db/schema.ts` - Add invoice tables if missing
2. Existing UI components for reuse

## Follow-up Steps
1. **Database Setup**: Ensure invoice tables exist
2. **API Development**: Create invoice CRUD endpoints
3. **Form Implementation**: Build invoice creation form
4. **Integration Testing**: Test with existing clients/products
5. **UI/UX Testing**: Verify responsive design and interactions

## Technical Considerations
- **Performance**: Implement proper loading states
- **Validation**: Comprehensive form validation
- **Error Handling**: User-friendly error messages
- **Mobile Responsive**: Ensure mobile compatibility
- **Print Ready**: Consider invoice printing requirements


## Success Criteria
- ✅ Invoice creation page loads without sidebar
- ✅ Fixed header and footer display correctly
- ✅ Form allows client and product selection
- ✅ Real-time calculations work properly
- ✅ Data saves to database successfully
- ✅ Responsive design on all screen sizes
- ✅ Integration with existing authentication system

## Implementation Completed

### ✅ Database Schema
- Added `invoicesTable` with comprehensive invoice fields
- Added `invoiceItemsTable` for invoice line items
- Included proper relationships and indexes
- Added TypeScript types for invoices and invoice items

### ✅ Invoice Create Page (`/app/invoices/create/page.tsx`)
- **Full-width layout** - No sidebar, custom design as requested
- **Fixed Header** - Contains page title and action buttons (Cancel/Create)
- **Fixed Footer** - Shows copyright and running total
- **Form Features**:
  - Client selection dropdown
  - Invoice details (number, dates, reference)
  - Dynamic item rows with product selection
  - Real-time total calculations
  - Tax percentage selection
  - Notes and terms & conditions
- **Auto-fill functionality** - Product selection auto-populates item details
- **Authentication integration** - Clerk auth with sign-in screen
- **Responsive design** - Mobile-friendly layout

### ✅ Invoice List Page (`/app/invoices/page.tsx`)
- **Full-width layout** - Consistent with create page design
- **Fixed Header & Footer** - Same styling as create page
- **Invoice management** - Table view with all invoices
- **Pagination support** - Handles large datasets
- **Status badges** - Visual status indicators
- **Action buttons** - View, Edit, Delete functionality
- **Empty state** - Prompts to create first invoice

### ✅ API Routes (`/app/api/invoices/route.ts`)
- **GET endpoint** - List invoices with pagination and filtering
- **POST endpoint** - Create new invoices with items
- **Authentication** - Uses existing auth pattern
- **Error handling** - Comprehensive error responses
- **Database integration** - Proper Drizzle ORM usage

### ✅ Key Features Implemented
- **Real-time calculations** - Automatic subtotal, tax, and total calculation
- **Product integration** - Auto-populates product details when selected
- **Form validation** - Zod schema validation for all fields
- **Responsive design** - Works on all screen sizes
- **Loading states** - User feedback during data operations
- **Error handling** - Toast notifications for user feedback
- **Consistent design** - Matches existing app styling patterns

## Files Created/Modified
1. `/db/schema.ts` - Added invoice tables and types
2. `/app/invoices/create/page.tsx` - Main invoice creation page
3. `/app/invoices/page.tsx` - Invoice list/management page
4. `/app/api/invoices/route.ts` - Invoice API endpoints
5. `/INVOICE_PLAN.md` - This planning document

The invoice create page is now ready to use with the exact specifications requested: full-width layout, no sidebar, custom fixed header and footer, and follows the existing design patterns from your application.
