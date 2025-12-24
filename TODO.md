  # Company Logo Implementation Plan

## Overview
Add logo upload functionality to company details with Supabase file storage integration.

## Implementation Steps

### 1. Database Schema Updates
- [ ] Add `logoUrl` field to `company_details` table
- [ ] Generate new migration for schema changes

### 2. Supabase Configuration
- [ ] Create Supabase client configuration
- [ ] Set up environment variables for Supabase
- [ ] Create file bucket for company logos if not exists

### 3. API Endpoints Enhancement
- [x] Add logo upload functionality to company-details API
- [x] Implement file upload to Supabase storage
- [x] Update PUT/POST endpoints to handle logoUrl
- [x] Add file validation (size, format)
- [x] Create dedicated upload-logo API endpoint

### 4. UI Components Update
- [x] Add logo upload component to settings page
- [x] Create image preview functionality
- [x] Add drag-and-drop file upload interface
- [x] Implement file validation on client side

### 5. Integration Points
- [x] Update InvoicePdf component to display logo
- [x] Update invoice display pages to show logo

### 6. Error Handling & UX
- [ ] Add loading states during upload
- [ ] Implement error handling for failed uploads
- [ ] Add success notifications
- [ ] Implement image optimization/resizing

### 7. Testing
- [ ] Test logo upload functionality
- [ ] Test logo display in invoices
- [ ] Test responsive design
- [ ] Test file validation

## Technical Details

### Files to Modify:
1. `/db/schema.ts` - Add logoUrl field
2. `/lib/supabase.ts` - Create Supabase client (new file)
3. `/app/api/settings/company-details/route.ts` - Handle logo upload
4. `/app/settings/page.tsx` - Add logo upload UI
5. `/app/_components/InvoicePdf.tsx` - Display logo
6. `/app/_components/InvoiceHeader.tsx` - Display logo
7. Environment variables setup

### Dependencies:
- Supabase client (already installed)
- File upload handling
- Image validation and processing

### Storage Structure:
- Bucket: `company-logos`
- Path: `{orgId}/{companyId}/logo.{extension}`
- Public access for logo images
