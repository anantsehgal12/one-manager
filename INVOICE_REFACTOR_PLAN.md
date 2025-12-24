# Invoice Page Refactor Plan

## Current Analysis
The invoice page at `app/invoices/[id]/page.tsx` uses plain HTML elements with Tailwind CSS classes. The page has a clean, professional invoice layout that needs to be converted to use ShadCN components.

## Available ShadCN Components for Replacement

### 1. Card Components
- **Current**: Main container div with `max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8`
- **Replacement**: `Card` component with same styling
- **Benefits**: Consistent theming, better accessibility, standardized spacing

### 2. Table Components  
- **Current**: Custom table with `className="w-full border border-gray-300 text-sm"`
- **Replacement**: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` components
- **Benefits**: Built-in responsive design, better accessibility, consistent styling

### 3. Section Organization
- **Current**: Plain divs with grid and flex layouts
- **Replacement**: Nested Card components for better semantic structure
- **Benefits**: Clearer component hierarchy, consistent spacing

## Detailed Replacement Strategy

### 1. Main Container
- Replace outer `div` with `Card` component
- Maintain `max-w-4xl mx-auto` classes
- Remove redundant padding classes (Card provides its own)

### 2. Header Section
- Replace header div with `CardHeader` component
- Keep existing flex layout for alignment
- Maintain all text content and styling

### 3. Company Info Sections
- Replace "From" section with `CardContent` inside a `Card`
- Replace "Bill To" section with `CardContent` inside a `Card`
- Maintain grid layout

### 4. Invoice Items Table
- Replace entire table structure with ShadCN Table components
- Maintain exact same column structure and data
- Preserve all styling and formatting

### 5. Summary Section
- Replace summary div with `CardContent`
- Maintain flex justify-end layout

### 6. Bank Details & Footer Sections
- Replace with `CardContent` components
- Maintain existing layout and content

## Layout Preservation
- Keep all existing grid and flex layouts
- Maintain exact same spacing and alignment
- Preserve all text content and formatting
- Keep responsive classes (md:w-1/2, etc.)

## Implementation Steps
1. Import required ShadCN components
2. Replace main container with Card
3. Update header section with CardHeader
4. Wrap company info sections in Card components
5. Replace table with ShadCN Table components
6. Update remaining sections with CardContent
7. Test layout and styling preservation

## Expected Benefits
- Consistent design system
- Better accessibility
- Easier maintenance
- Improved responsive behavior
- Enhanced component reusability
