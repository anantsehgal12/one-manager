'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignIn, SignUp, useOrganization, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { getUnitAbbreviation } from '@/lib/units'
import Side from '@/app/_components/Side'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Header from '@/app/_components/Header'
import { Plus, Search, Trash2, Edit } from 'lucide-react'
import { Toaster } from 'react-hot-toast'

interface Product {
  id: string
  name: string
  isService: boolean
  sellingPrice: string
  taxPercentage: string
  isTaxInclusive?: boolean
  primaryUnits: 'pieces' | 'kilograms' | 'boxes' | 'sets' | 'units' | 'others'
  hsnSacCode?: string
  productImage?: string
  availableStock: string
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const router = useRouter()
  const { organization } = useOrganization()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOrgSwitching, setIsOrgSwitching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch products on component mount and when organization changes
  useEffect(() => {
    if (organization?.id) {
      fetchProducts(true)
    }
  }, [organization?.id])

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.hsnSacCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.primaryUnits.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
  }, [products, searchQuery])

  const fetchProducts = async (isOrgChange = false) => {
    try {
      if (isOrgChange) {
        setIsOrgSwitching(true)
      } else {
        setIsLoading(true)
      }

      const response = await fetch('/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        toast.error('Failed to Fetch Products')
      }
      if (response.ok) {
        if (isOrgChange) {
          toast.success(`Products loaded for ${organization?.name || 'new organization'}`)
        } else {
          toast.success('Products Fetched Successfully !')
        }
      }

      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
      setProducts([])
    } finally {
      setIsLoading(false)
      setIsOrgSwitching(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      // Remove product from local state
      setProducts(prev => prev.filter(product => product.id !== productId))
      toast.success('Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }


  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(parseFloat(amount))
  }

  const getRandomLightColor = () => {
    const lightColors = [
      'bg-blue-200',
      'bg-green-200', 
      'bg-yellow-200',
      'bg-pink-200',
      'bg-purple-200',
      'bg-indigo-200',
      'bg-red-200',
      'bg-orange-200',
      'bg-teal-200',
      'bg-cyan-200'
    ]
    return lightColors[Math.floor(Math.random() * lightColors.length)]
  }

  const getProductInitials = (name: string) => {
    const words = name.trim().split(' ')
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase()
    } else {
      // For two or more words, get first letter of first two words
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    }
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

  if (isLoading && isSignedIn) {
    return (
      <SidebarProvider>
        <Side />
        <Toaster />
        <SidebarInset>
          <Header />
          <div className="container mx-auto py-8 px-15">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <Side />
      <Toaster position='bottom-right' />
      <SidebarInset>
        <Header />
        <div className="container mx-auto py-8 px-15">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Products</h1>
                <p className="text-muted-foreground">
                  Manage your products and services
                </p>
              </div>
              <Button
                onClick={() => router.push('/products/create')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product/Service
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {products.filter(p => p.isService).length}
                </div>
                <div className="text-sm text-muted-foreground">Services</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {products.filter(p => !p.isService).length}
                </div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  ₹{products.reduce((sum, p) => sum + parseFloat(p.sellingPrice), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
            </div>

            {/* Search Section */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products and services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Products Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='px-9'>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Tax %</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {searchQuery ? (
                          <div>
                            <p className="text-muted-foreground mb-2">No products found matching your search.</p>
                            <Button
                              variant="outline"
                              onClick={() => setSearchQuery('')}
                            >
                              Clear Search
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-muted-foreground mb-4">No products or services yet.</p>
                            <Button onClick={() => router.push('/products/create')}>
                              Create Your First Product/Service
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>

                        <TableCell className='px-6'>
                          <div className='inline-flex gap-5 items-center'>
                            <span className={`rounded-full ${getRandomLightColor()} text-black h-6 w-6 items-center justify-center flex text-sm font-medium`}>
                              {getProductInitials(product.name)}
                            </span>
                            <div>
                              <div className="font-medium py-1">{product.name}</div>
                              <div className="text-xs text-muted-foreground py-1">
                                {product.primaryUnits && (
                                  <span className="mr-2">📦 {getUnitAbbreviation(product.primaryUnits)}</span>
                                )}
                                {product.hsnSacCode && (
                                  <span>🏷️ {product.hsnSacCode}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isService ? "default" : "secondary"}>
                            {product.isService ? "Service" : "Product"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono flex-col flex">
                            <span className='font-bold py-1'>
                              {formatCurrency(product.sellingPrice)}
                            </span>
                            <div className='inline-flex space-x-2 py-1'>
                              <span className='text-xs font-bold'>
                                {parseFloat(product.taxPercentage)}%
                              </span>
                              <span className='text-xs'>
                                {product.isTaxInclusive ? 'incl. tax' : 'excl. tax'}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono">
                            {parseFloat(product.taxPercentage)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono">
                            {Math.round(parseFloat(product.availableStock))} {product.primaryUnits ? getUnitAbbreviation(product.primaryUnits) : ''}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/products/${product.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive cursor-pointer hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Footer Info */}
            {filteredProducts.length > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                Showing {filteredProducts.length} of {products.length} items
                {searchQuery && ` (filtered from ${products.length} total)`}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
