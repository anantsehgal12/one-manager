# HTML2PDF.js "self is not defined" Fix Plan

## Problem Analysis
The "self is not defined" error occurs because:
- `html2pdf.js` is designed to work in browser environments where `self` (Web Workers global) is available
- Next.js performs server-side rendering (SSR), trying to execute the import on the server where `self` doesn't exist
- Current implementation imports html2pdf at module level, causing SSR failures

## Solution Plan

### 1. Client-Side Dynamic Import
- Replace static import with dynamic import inside the component
- Use `useEffect` to initialize html2pdf only on client side
- Handle async import properly with proper error handling

### 2. Component Updates Required
- Remove top-level import: `import html2pdf from 'html2pdf.js'`
- Add state to track html2pdf availability
- Update handleDownload function to handle async import
- Add proper error handling for PDF generation

### 3. Code Changes
- File: `app/invoices/[id]/page.tsx`
- Remove: Static import of html2pdf
- Add: Dynamic import with client-side initialization
- Update: handleDownload function to be async
- Add: Loading state during PDF generation

### 4. Testing Requirements
- Verify invoice page loads without SSR errors
- Test PDF download functionality works correctly
- Ensure proper error handling for failed PDF generation

## Implementation Steps
1. Read current file to understand complete context
2. Update imports and component structure
3. Implement dynamic import with proper client-side handling
4. Test the changes

## Expected Outcome
- No more "self is not defined" errors
- PDF download functionality works on client side
- Proper loading states during PDF generation
- Graceful error handling
