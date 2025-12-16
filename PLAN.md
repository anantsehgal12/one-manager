# Client Filtering Enhancement Plan

## Current Issue
- API currently filters clients by BOTH `userId` AND `orgId`
- This shows only clients created by the current user within their organization
- User wants to see ALL clients in the current organization (regardless of who created them)

## Required Changes

### 1. Update API Route
**File:** `app/api/clients/route.ts`
- **Change:** Remove `userId` filter from the GET request
- **Result:** Only filter by `orgId` to show all clients in current organization
- **Keep:** `eq(clientsTable.orgId, orgId)` only

### 2. Update Client Creation
**File:** `app/api/clients/route.ts`
- **Keep:** Both `userId` and `orgId` when creating new clients
- **Reason:** Need to track which user created each client for potential future use

### 3. Update Schema (Optional Enhancement)
**File:** `db/schema.ts`
- Add `createdBy` field to clientsTable for clarity
- This will explicitly track which user created each client

### 4. Update TODO.md
- Mark the orgId filtering task as complete
- Update current implementation status

## Expected Result
- Users will see ALL clients in their organization
- Organization data will be properly isolated
- Each client will still be trackable by who created them
- Maintains data security between organizations

## Files to Modify
1. `app/api/clients/route.ts` - Update GET request filtering
2. `TODO.md` - Update status
3. `PLAN.md` - This file (for reference)
