'use client'

import { useState, useEffect } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Package, Hash, DollarSign, Percent, Plus, Minus, ShoppingCart, CirclePlus, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  sellingPrice: string
  primaryUnits: 'pieces' | 'kilograms' | 'boxes' | 'sets' | 'units' | 'others'
  taxPercentage: string
  hsnSacCode?: string
}

interface ProductWithQuantity extends Product {
  quantity: number
  unitPrice?: number
  discount?: number
  priceWithTax?: number
  total?: number
}

interface ProductDropdownProps {
  products: Product[]
  selectedProducts: ProductWithQuantity[]
  onProductsChange: (products: ProductWithQuantity[]) => void
  disabled?: boolean
}

export function ProductDropdown({ products, selectedProducts, onProductsChange, disabled }: ProductDropdownProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [editingFields, setEditingFields] = useState<{[key: string]: string}>({})

  // Handle field editing state
  const handleFieldFocus = (fieldKey: string, currentValue: number) => {
    setEditingFields(prev => ({
      ...prev,
      [fieldKey]: currentValue.toString()
    }))
  }

  const handleFieldBlur = (fieldKey: string) => {
    setEditingFields(prev => {
      const newState = { ...prev }
      delete newState[fieldKey]
      return newState
    })
  }

  const getFieldValue = (fieldKey: string, fallbackValue: number) => {
    const editingValue = editingFields[fieldKey]
    if (editingValue !== undefined) {
      return editingValue
    }
    return fallbackValue.toString()
  }

  // Filter products based on search
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        (product.hsnSacCode && product.hsnSacCode.toLowerCase().includes(searchValue.toLowerCase()))
      )
      setFilteredProducts(filtered)
    }
  }, [searchValue, products])

  // Calculate price with tax
  const calculatePriceWithTax = (unitPrice: number, taxPercentage: number) => {
    return unitPrice + (unitPrice * parseFloat(taxPercentage.toString()) / 100)
  }

  // Add product to selected list
  const handleProductSelect = (product: Product) => {
    const existingIndex = selectedProducts.findIndex(p => p.id === product.id)
    
    if (existingIndex >= 0) {
      // Product already selected, increment quantity
      const updatedProducts = [...selectedProducts]
      updatedProducts[existingIndex].quantity += 1
      onProductsChange(updatedProducts)
    } else {
      // New product, add with quantity 1
      const newProduct: ProductWithQuantity = { 
        ...product, 
        quantity: 1,
        unitPrice: parseFloat(product.sellingPrice),
        discount: 0,
        priceWithTax: calculatePriceWithTax(parseFloat(product.sellingPrice), parseFloat(product.taxPercentage))
      }
      onProductsChange([...selectedProducts, newProduct])
    }
    
    // Close the popup after selecting a product
    setOpen(false)
  }

  // Update quantity for selected product (during typing, don't remove)
  const updateQuantity = (productId: string, quantity: number) => {
    const updatedProducts = selectedProducts.map(p =>
      p.id === productId ? { ...p, quantity } : p
    )
    onProductsChange(updatedProducts)
  }

  // Handle quantity field blur - remove product if quantity is 0 or empty
  const handleQuantityBlur = (productId: string, quantity: number) => {
    if (quantity <= 0 || isNaN(quantity)) {
      // Remove product if quantity is 0, negative, or invalid
      onProductsChange(selectedProducts.filter(p => p.id !== productId))
    }
  }

  // Update discount for selected product
  const updateDiscount = (productId: string, discount: number) => {
    if (discount < 0) discount = 0
    if (discount > 100) discount = 100
    const updatedProducts = selectedProducts.map(p =>
      p.id === productId ? { ...p, discount } : p
    )
    onProductsChange(updatedProducts)
  }

  // Update price with tax for selected product (and automatically update unit price)
  const updatePriceWithTax = (productId: string, priceWithTax: number) => {
    if (priceWithTax < 0) priceWithTax = 0
    
    const updatedProducts = selectedProducts.map(p => {
      if (p.id === productId) {
        // Calculate unit price from price with tax
        const product = products.find(prod => prod.id === productId)
        const taxPercentage = product ? parseFloat(product.taxPercentage) : 0
        const unitPrice = taxPercentage > 0 ? priceWithTax / (1 + taxPercentage / 100) : priceWithTax
        
        return { 
          ...p, 
          priceWithTax,
          unitPrice: Math.round(unitPrice * 100) / 100 // Round to 2 decimal places
        }
      }
      return p
    })
    onProductsChange(updatedProducts)
  }

  // Update unit price for selected product (and automatically update price with tax)
  const updateUnitPrice = (productId: string, unitPrice: number) => {
    if (unitPrice < 0) unitPrice = 0
    
    const updatedProducts = selectedProducts.map(p => {
      if (p.id === productId) {
        // Calculate price with tax from unit price
        const product = products.find(prod => prod.id === productId)
        const taxPercentage = product ? parseFloat(product.taxPercentage) : 0
        const priceWithTax = unitPrice + (unitPrice * taxPercentage / 100)
        
        return { 
          ...p, 
          unitPrice,
          priceWithTax: Math.round(priceWithTax * 100) / 100 // Round to 2 decimal places
        }
      }
      return p
    })
    onProductsChange(updatedProducts)
  }

  // Update total for selected product
  const updateTotal = (productId: string, total: number) => {
    if (total < 0) total = 0
    const updatedProducts = selectedProducts.map(p =>
      p.id === productId ? { ...p, total } : p
    )
    onProductsChange(updatedProducts)
  }

  // Calculate line total
  const calculateLineTotal = (unitPrice: number, quantity: number, discount: number, taxPercentage: string) => {
    const subtotal = unitPrice * quantity
    const discountAmount = subtotal * (discount / 100)
    const afterDiscount = subtotal - discountAmount
    const taxAmount = afterDiscount * (parseFloat(taxPercentage.toString()) / 100)
    return afterDiscount + taxAmount
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const removeProduct = (productId: string) => {
    onProductsChange(selectedProducts.filter(p => p.id !== productId))
  }

  // Convert full unit names to short form
  const getShortUnit = (unit: string) => {
    const unitMap: Record<string, string> = {
      'pieces': 'PCS',
      'kilograms': 'KGS',
      'boxes': 'BOX',
      'sets': 'SETS',
      'units': 'UNIT',
      'others': 'OTH'
    }
    return unitMap[unit] || unit
  }

  return (
    <div className="space-y-4">
      {/* Product Search and Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search & Add Products</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("w-full justify-between", disabled && "opacity-50")}
              disabled={disabled}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {selectedProducts.length > 0 ? (
                  <span>{selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected</span>
                ) : (
                  "Search and add products..."
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[700px] p-0 h-96" align="start">
            <Command>
              <CommandInput
                placeholder="Search products by name or HSN/SAC code..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>No products found.</CommandEmpty>
                <CommandGroup>
                  {filteredProducts.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={`${product.name} ${product.hsnSacCode || ''}`.trim()}
                      onSelect={() => handleProductSelect(product)}
                      className="flex items-center justify-between p-4 cursor-pointer"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base">
                            {product.name}
                          </div>

                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            {product.hsnSacCode && (
                              <div className="flex items-center gap-1">
                                <Hash className="h-4 w-4" />
                                <span className="font-medium">HSN/SAC: {product.hsnSacCode}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">{formatCurrency(product.sellingPrice)}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Percent className="h-4 w-4" />
                              <span className="font-medium">{product.taxPercentage}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-medium text-muted-foreground">
                            Click to add
                          </div>
                        </div>
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup className='sticky bottom-0 z-999 bg-popover'>
                  <Separator />
                  <div className='flex items-center justify-center py-2'>
                    <Button variant="ghost" className="w-full px-3">
                      <Link href="/products/create" className="w-full">
                        <span className='inline-flex gap-8 items-center'>
                          <CirclePlus className='h-4 w-4' />
                          <span className='font-bold text-lg'>
                            Add New Product
                          </span>
                        </span>
                      </Link>
                    </Button>
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {/* Selected Products Table */}
      {selectedProducts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Selected Products ({selectedProducts.length})</h4>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Product</TableHead>
                  <TableHead className="w-[70px] text-center">Quantity</TableHead>
                  <TableHead className="w-[120px]">Unit Price</TableHead>
                  <TableHead className="w-[100px]">Discount %</TableHead>
                  <TableHead className="w-[140px]">Price with Tax</TableHead>
                  <TableHead className="w-[120px]">Total</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProducts.map((selectedProduct) => {
                  const product = products.find(p => p.id === selectedProduct.id)
                  if (!product) return null

                  const unitPrice = selectedProduct.unitPrice || parseFloat(product.sellingPrice)
                  const discount = selectedProduct.discount || 0
                  const quantity = selectedProduct.quantity
                  const priceWithTax = calculatePriceWithTax(unitPrice, parseFloat(product.taxPercentage))
                  const lineTotal = calculateLineTotal(unitPrice, quantity, discount, product.taxPercentage)

                  return (
                    <TableRow key={product.id}>
                      {/* Product Info */}
                      <TableCell className="font-medium">
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-sm">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {product.hsnSacCode && `HSN/SAC: ${product.hsnSacCode} • `}
                              {product.taxPercentage}% Tax
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Quantity with Unit */}
                      <TableCell>
                        <div className="relative flex items-center justify-center">
                          <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => updateQuantity(product.id, parseFloat(e.target.value) || 0)}
                            onBlur={(e) => handleQuantityBlur(product.id, parseFloat(e.target.value) || 0)}
                            className="h-8 pr-8 text-right"
                            min="1"
                            step="1"
                            disabled={disabled}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground bg-transparent px-1 pointer-events-none">
                            {getShortUnit(product.primaryUnits)}
                          </span>
                        </div>
                      </TableCell>


                      {/* Unit Price */}
                      <TableCell>
                        <Input
                          type="number"
                          value={getFieldValue(`${product.id}_unitPrice`, unitPrice)}
                          onFocus={() => handleFieldFocus(`${product.id}_unitPrice`, unitPrice)}
                          onBlur={() => handleFieldBlur(`${product.id}_unitPrice`)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            setEditingFields(prev => ({
                              ...prev,
                              [`${product.id}_unitPrice`]: e.target.value
                            }))
                            updateUnitPrice(product.id, value)
                          }}
                          className="h-8 w-full"
                          min="0"
                          step="0.01"
                          disabled={disabled}
                        />
                      </TableCell>

                      {/* Discount */}
                      <TableCell>
                        <Input
                          type="number"
                          value={discount}
                          onChange={(e) => updateDiscount(product.id, parseFloat(e.target.value) || 0)}
                          className="h-8 w-full"
                          min="0"
                          max="100"
                          step="0.01"
                          disabled={disabled}
                        />
                      </TableCell>

                      {/* Price with Tax */}
                      <TableCell>
                        <Input
                          type="number"
                          value={getFieldValue(`${product.id}_priceWithTax`, selectedProduct.priceWithTax || priceWithTax)}
                          onFocus={() => handleFieldFocus(`${product.id}_priceWithTax`, selectedProduct.priceWithTax || priceWithTax)}
                          onBlur={() => handleFieldBlur(`${product.id}_priceWithTax`)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            setEditingFields(prev => ({
                              ...prev,
                              [`${product.id}_priceWithTax`]: e.target.value
                            }))
                            updatePriceWithTax(product.id, value)
                          }}
                          className="h-8 w-full"
                          min="0"
                          step="0.01"
                          disabled={disabled}
                        />
                      </TableCell>

                      {/* Total */}
                      <TableCell>
                        <Input
                          type="number"
                          value={getFieldValue(`${product.id}_total`, selectedProduct.total || lineTotal)}
                          onFocus={() => handleFieldFocus(`${product.id}_total`, selectedProduct.total || lineTotal)}
                          onBlur={() => handleFieldBlur(`${product.id}_total`)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            setEditingFields(prev => ({
                              ...prev,
                              [`${product.id}_total`]: e.target.value
                            }))
                            updateTotal(product.id, value)
                          }}
                          className="h-8 w-full"
                          min="0"
                          step="0.01"
                          disabled={disabled}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(product.id)}
                          disabled={disabled}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      
    </div>
  )
}
