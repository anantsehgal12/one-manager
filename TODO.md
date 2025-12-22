# Product Dropdown Table Implementation Plan

## Information Gathered
- Current product dropdown uses Command-based search interface with card layout for selected products
- Table component is available with Table, TableHeader, TableBody, TableRow, TableHead, TableCell components
- Selected products section displays: Product details, Quantity, Unit Price, Price with Tax, Discount, and Line Total
- Need to maintain all existing functionality while converting the visual layout

## Plan
1. **Convert Selected Products Section to Table Format**
   - Replace the current card-based layout with a responsive table
   - Use Table, TableHeader, TableBody, TableRow, TableHead, TableCell components
   - Create appropriate column headers for: Product, Quantity, Unit Price, Discount %, Price with Tax, Total, Actions

2. **Maintain All Existing Functionality**
   - Keep the search and selection interface unchanged
   - Preserve all quantity, price, and discount update functions
   - Maintain responsive behavior and accessibility

3. **Improve Table Usability**
   - Add proper column alignment and styling
   - Ensure mobile responsiveness with horizontal scroll
   - Include remove action in table
   - Maintain formatted currency display

## Dependent Files to be edited
- app/_components/product-dropdown.tsx (main component to update)

## Implementation Steps
1. Import Table components from ui/table
2. Replace the selected products card layout with Table component
3. Create appropriate table structure with headers and rows
4. Convert each product card to a table row with editable cells
5. Ensure all functionality remains intact
6. Test responsive behavior and accessibility

## Followup Steps
- Test the updated component functionality
- Verify responsive design on different screen sizes
- Ensure all interactive elements work correctly
