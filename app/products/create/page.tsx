
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignIn, useOrganization, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Side from '@/app/_components/Side'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Header from '@/app/_components/Header'
import PriceSummaryCard from '@/app/_components/PriceSummaryCard'
import TaxDropdown from '@/app/_components/tax-dropdown'
import UnitsDropdown from '@/app/_components/units-dropdown'

interface FormData {
  name: string
  isService: boolean
  sellingPrice: string
  taxPercentage: '0' | '5' | '12' | '18' | '28' | '40'
  isPriceTaxInclusive: boolean
  primaryUnits: 'pieces' | 'kilograms' | 'boxes' | 'sets' | 'units' | 'others'
  hsnSacCode: string
  productImage: string
  availableStock: string
}

export default function CreateProductPage() {
  const router = useRouter()
  const { organization } = useOrganization()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    isService: false,
    sellingPrice: '',
    taxPercentage: '0',
    isPriceTaxInclusive: false,
    primaryUnits: 'pieces',
    hsnSacCode: '',
    productImage: '',
    availableStock: '0',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.sellingPrice) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sellingPrice: parseFloat(formData.sellingPrice),
          taxPercentage: parseFloat(formData.taxPercentage),
          availableStock: parseFloat(formData.availableStock),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create product')
      }

      toast.success('Product created successfully!')
      router.push('/products')
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const { isSignedIn } = useUser()
    if (!isSignedIn) {
      return (
        <main className="flex w-full min-h-screen flex-col items-center bg-background px-6">
          <Header />
          <section className='py-10 flex flex-col items-center justify-center gap-8'>
            <span>Please SignIn/SignUp below with your account to access this page.</span>
            <SignIn />
          </section>
        </main>
      )
    }

  return (
    <SidebarProvider>
      <Side />
      <Toaster position='bottom-right' />
      <SidebarInset>
        <Header />
        <div className="container mx-auto py-8 px-15">
          <div className=" mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>

              <div>
                <h1 className="text-2xl font-bold">Create New Product/Service</h1>
                <p className="text-muted-foreground">
                  Add a new product or service to your inventory
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-background border rounded-lg p-6">
              <form onSubmit={handleSubmit} className="">

                {/* Product/Service Toggle */}
                <div className="space-y-2">
                  <Label htmlFor="isService" className="text-lg font-medium">
                    Addition Type
                  </Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Product</span>
                    <Switch
                      id="isService"
                      checked={formData.isService}
                      onCheckedChange={(checked) =>
                        handleInputChange('isService', checked)
                      }
                    />
                    <span className="text-sm">Service</span>
                  </div>
                </div>
                <div className='py-7'>
                  <section className='space-y-3'>
                    <Label className='text-gray-500 text-md'>
                      Product Details
                    </Label>
                    <div className='space-y-6'>
                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Name *
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter product or service name"
                          required
                        />
                      </div>


                      {/* Price and Tax */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sellingPrice" className="text-sm font-medium">
                            Selling Price *
                          </Label>
                          <Input
                            id="sellingPrice"
                            type="number"
                            step="0.01"
                            value={formData.sellingPrice}
                            onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                            placeholder="0.00"
                            required
                          />
                          <div className="flex items-center space-x-2 mt-2">
                            <Label htmlFor="isPriceTaxInclusive" className="text-sm text-muted-foreground">
                              Excl. tax
                            </Label>
                            <Switch
                              id="isPriceTaxInclusive"
                              checked={formData.isPriceTaxInclusive}
                              onCheckedChange={(checked) =>
                                handleInputChange('isPriceTaxInclusive', checked)
                              }
                            />
                            <Label htmlFor="isPriceTaxInclusive" className="text-sm text-muted-foreground">
                              Incl. tax
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <TaxDropdown
                            value={formData.taxPercentage}
                            onChange={(value) => handleInputChange('taxPercentage', value)}
                            label="Tax Percentage"
                          />
                        </div>
                      </div>

                      {/* Units and Stock */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <UnitsDropdown
                            value={formData.primaryUnits}
                            onChange={(value) => handleInputChange('primaryUnits', value)}
                            label="Unit"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="availableStock" className="text-sm font-medium">
                            Available Stock
                          </Label>
                          <Input
                            id="availableStock"
                            type="number"
                            step="0.01"
                            value={formData.availableStock}
                            onChange={(e) => handleInputChange('availableStock', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* HSN/SAC Code */}
                      <div className="space-y-2">
                        <Label htmlFor="hsnSacCode" className="text-sm font-medium">
                          HSN/SAC Code
                        </Label>
                        <Input
                          id="hsnSacCode"
                          type="text"
                          value={formData.hsnSacCode}
                          onChange={(e) => handleInputChange('hsnSacCode', e.target.value)}
                          placeholder="Enter HSN or SAC code"
                        />
                      </div>


                      {/* Product Image URL */}
                      <div className="space-y-2">
                        <Label htmlFor="productImage" className="text-sm font-medium">
                          Product Image URL
                        </Label>
                        <Input
                          id="productImage"
                          type="url"
                          value={formData.productImage}
                          onChange={(e) => handleInputChange('productImage', e.target.value)}
                          placeholder="Enter image URL"
                        />
                      </div>
                    </div>
                  </section>
                </div>


                {/* Price Summary Card */}
                {(formData.sellingPrice || formData.taxPercentage) && (
                  <div className="mt-6">
                    <PriceSummaryCard
                      sellingPrice={formData.sellingPrice}
                      taxPercentage={formData.taxPercentage}
                      isPriceTaxInclusive={formData.isPriceTaxInclusive}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-2 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : `Create ${formData.isService ? 'Service' : 'Product'}`}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
