import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'


interface PriceSummaryCardProps {
  sellingPrice: string
  taxPercentage: string
  isPriceTaxInclusive?: boolean
}


export default function PriceSummaryCard({ sellingPrice, taxPercentage, isPriceTaxInclusive = false }: PriceSummaryCardProps) {
  // Parse values to numbers
  const price = parseFloat(sellingPrice) || 0
  const taxPercent = parseFloat(taxPercentage) || 0
  
  let basePrice = 0
  let taxAmount = 0
  let finalPrice = 0
  
  if (isPriceTaxInclusive) {
    // Tax-inclusive pricing: Final price = Base price + Tax
    // Base price = Final price / (1 + tax rate)
    finalPrice = price
    basePrice = price / (1 + taxPercent / 100)
    taxAmount = finalPrice - basePrice
  } else {
    // Tax-exclusive pricing: Final price = Base price + Tax
    basePrice = price
    taxAmount = price * (taxPercent / 100)
    finalPrice = price + taxAmount
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getPriceModeLabel = () => {
    return isPriceTaxInclusive ? 'Price includes tax' : 'Price excludes tax'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Price Summary</CardTitle>
        <div className="text-sm text-muted-foreground font-normal">
          {getPriceModeLabel()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Base price */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {isPriceTaxInclusive ? 'Base price (before tax)' : 'Price before tax'}
          </span>
          <span className="font-medium">{formatCurrency(basePrice)}</span>
        </div>

        {/* Tax information */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Tax ({taxPercent}%)</span>
          <span className="font-medium">{formatCurrency(taxAmount)}</span>
        </div>

        <Separator />

        {/* Final price */}
        <div className="flex justify-between items-center">
          <span className="font-medium">
            {isPriceTaxInclusive ? 'Final price (tax included)' : 'Final price (tax added)'}
          </span>
          <span className="font-bold text-lg">{formatCurrency(finalPrice)}</span>
        </div>

        {/* Price breakdown info */}
        <div className="mt-3 p-3 bg-muted/50 rounded-md">
          <p className="text-xs text-muted-foreground">
            {isPriceTaxInclusive ? (
              <>Final: {formatCurrency(finalPrice)} = Base: {formatCurrency(basePrice)} + Tax ({taxPercent}%): {formatCurrency(taxAmount)}</>
            ) : (
              <>Base: {formatCurrency(basePrice)} + Tax ({taxPercent}%): {formatCurrency(taxAmount)} = Final: {formatCurrency(finalPrice)}</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
