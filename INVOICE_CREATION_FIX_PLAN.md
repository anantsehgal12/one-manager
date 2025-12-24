# Invoice Creation Fix Plan

## Issue Analysis
The invoice creation is failing due to field mismatches between the frontend and backend API.

## Problems Identified

### 1. Field Name Mismatch
- **Frontend sends**: `taxableValue`, `taxAmount`, `totalDiscount`, `totalAmount`, `balanceAmount`, `signatureId`
- **Backend expects**: `subtotal`, `taxAmount`, `totalAmount`, `balanceAmount`
- **Missing fields**: `subtotal` (frontend sends `taxableValue`), `signatureId` not handled

### 2. Schema vs API Mismatch
The schema defines `subtotal` as required but the frontend doesn't send it, causing database insertion to fail.

### 3. Duplicate Calculations
Frontend calculates totals but backend also recalculates tax amounts, leading to potential inconsistencies.

## Solution Plan

### Step 1: Fix Frontend Data Structure
Update the frontend to send the correct field names that match the backend API expectations:
- Change `taxableValue` to `subtotal`
- Remove redundant `taxAmount` and `totalAmount` from top level (let backend calculate)
- Add `signatureId` handling if needed

### Step 2: Update Backend API
Update the API route to:
- Accept the correct field names from frontend
- Handle optional `signatureId` field
- Improve error handling and validation

### Step 3: Test the Fix
Verify that invoice creation works end-to-end with proper error messages.

## Files to Modify
1. `app/invoices/create/page.tsx` - Frontend form data structure
2. `app/api/invoices/route.ts` - Backend API field handling

## Expected Outcome
- Invoice creation should succeed without field mismatch errors
- Better error messages if validation fails
- Consistent data flow between frontend and backend
