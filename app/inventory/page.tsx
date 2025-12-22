
"use client"

import { useEffect, useState } from 'react'
import { SignIn, useOrganization, useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import InventoryStockModal from '../_components/InventoryStockModal'
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
import Side from '@/app/_components/Side'
import Header from '@/app/_components/Header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from 'react-hot-toast'
import { CirclePlus, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import { getUnitDisplayName } from '@/lib/units'


interface Product {
  id: string
  name: string
  primaryUnits?: 'pieces' | 'kilograms' | 'boxes' | 'sets' | 'units' | 'others' | null
  availableStock?: string | number | null
  isService?: boolean
  sellingPrice?: string
  hsnSacCode?: string | null
}

export default function InventoryPage() {
  const { organization } = useOrganization()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOrgSwitching, setIsOrgSwitching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
      const q = searchQuery.toLowerCase()
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(q) ||
        (product.hsnSacCode || '').toLowerCase().includes(q) ||
        (product.primaryUnits || '').toLowerCase().includes(q)
      )
      setFilteredProducts(filtered)
    }
  }, [products, searchQuery])

  const handleStockChange = async (id: string, qty: number, isOut: boolean) => {
    try {
      const p = products.find((x) => x.id === id)
      const current = p?.availableStock ? Number(p.availableStock) : 0
      const updated = isOut ? current - qty : current + qty
      if (updated < 0) {
        alert('Cannot reduce stock below 0')
        return
      }

      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableStock: String(updated) }),
      })

      if (!res.ok) throw new Error('Update failed')

      const updatedProduct = await res.json()

      setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, availableStock: updatedProduct.availableStock } : x)))
    } catch (err) {
      console.error(err)
      alert('Failed to update stock')
    }
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

  const totalValue = products.reduce((sum, p) => sum + (p.sellingPrice ? parseFloat(p.sellingPrice) : 0), 0)

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
                <p className="text-muted-foreground">Loading inventory...</p>
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
      <Toaster position="bottom-right" />
      <SidebarInset>
        <Header />
        <div className="container mx-auto py-8 px-15">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Inventory</h1>
                <p className="text-muted-foreground">Manage stock levels for your products</p>
              </div>
              <div className="flex items-center space-x-2">


                <Button onClick={() => fetchProducts(false)}>Refresh</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{products.filter(p => p.isService).length}</div>
                <div className="text-sm text-muted-foreground">Services</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{products.filter(p => !p.isService).length}</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products and services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='px-9'>Name</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div>
                          <p className="text-muted-foreground mb-4">No products or services yet.</p>
                            <Button asChild>
                              <Link href="/products/create">
                                <span className='inline-flex items-center gap-2'>
                                  <CirclePlus />
                                  Add Product/Service
                                </span>
                              </Link>
                            </Button>
                          </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className='px-6'>
                          <div className='inline-flex gap-5 items-center'>

                            <span className={`rounded-full ${getRandomLightColor()} text-black h-6 w-6 items-center justify-center flex text-sm font-medium`}>
                              {getProductInitials(p.name)}
                            </span>
                            <div>
                              <div className="font-medium py-1">{p.name}</div>
                              <div className="text-xs text-muted-foreground py-1">
                                {p.primaryUnits && (
                                  <span className="mr-2">📦 {getUnitDisplayName(p.primaryUnits)}</span>
                                )}
                                {p.hsnSacCode && (
                                  <span>🏷️ {p.hsnSacCode}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{p.primaryUnits ? getUnitDisplayName(p.primaryUnits) : '-'}</TableCell>
                        <TableCell>{Math.round(parseFloat(String(p.availableStock ?? 0)))} {p.primaryUnits ? getUnitDisplayName(p.primaryUnits) : ''}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <InventoryStockModal
                              productName={p.name}
                              mode="in"
                              onConfirm={async (qty) => handleStockChange(p.id, qty, false)}
                            >
                              <Button size="sm">Stock In</Button>
                            </InventoryStockModal>

                            <InventoryStockModal
                              productName={p.name}
                              mode="out"
                              onConfirm={async (qty) => handleStockChange(p.id, qty, true)}
                            >
                              <Button size="sm" variant="destructive">Stock Out</Button>
                            </InventoryStockModal>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

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
