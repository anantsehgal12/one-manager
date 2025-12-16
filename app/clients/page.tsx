
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@clerk/nextjs'
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
import Side from '@/app/_components/Side'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Header from '@/app/_components/Header'
import { Plus, Search, Trash2, Edit, Eye } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  companyName: string | null
  mobileNo: string | null
  email: string | null
  gst: string | null
  billingCity: string | null
  billingState: string | null
  createdAt: string
  updatedAt: string
}


export default function ClientsPage() {
  const router = useRouter()
  const { organization } = useOrganization()
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isOrgSwitching, setIsOrgSwitching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')





  // Fetch clients on component mount and when organization changes
  useEffect(() => {
    if (organization?.id) {
      fetchClients(true) // Pass true to indicate this is an organization change
    }
  }, [organization?.id])

  // Filter clients based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients)
    } else {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.gst?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredClients(filtered)
    }
  }, [clients, searchQuery])



  const fetchClients = async (isOrgChange = false) => {
    try {
      if (isOrgChange) {
        setIsOrgSwitching(true)
      } else {
        setIsLoading(true)
      }
      
      const response = await fetch('/api/clients', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        toast.error('Failed to Fetch Clients')
      }
      if (response.ok) {
        if (isOrgChange) {
          toast.success(`Clients loaded for ${organization?.name || 'new organization'}`)
        } else {
          toast.success('Clients Fetched Successfully !')
        }
      }

      const data = await response.json()
      // Ensure data is always an array to prevent filter errors
      setClients(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to fetch clients')
      // Set clients to empty array on error to prevent filter errors
      setClients([])
    } finally {
      setIsLoading(false)
      setIsOrgSwitching(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) {
      return
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete client')
      }

      // Remove client from local state
      setClients(prev => prev.filter(client => client.id !== clientId))
      toast.success('Client deleted successfully')
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Failed to delete client')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
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
                <p className="text-muted-foreground">Loading clients...</p>
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
      <SidebarInset>
        <Header />
        <div className="container mx-auto py-8 px-15">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Clients</h1>
                <p className="text-muted-foreground">
                  Manage your client list and information
                </p>
              </div>
              <Button
                onClick={() => router.push('/clients/create')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{clients.length}</div>
                <div className="text-sm text-muted-foreground">Total Clients</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {clients.filter(c => c.companyName).length}
                </div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {clients.filter(c => c.email).length}
                </div>
                <div className="text-sm text-muted-foreground">With Email</div>
              </div>
            </div>

            {/* Search Section */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 ">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Clients Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        {searchQuery ? (
                          <div>
                            <p className="text-muted-foreground mb-2">No clients found matching your search.</p>
                            <Button
                              variant="outline"
                              onClick={() => setSearchQuery('')}
                            >
                              Clear Search
                            </Button>
                          </div>

                        ) : (
                          <div>
                            <p className="text-muted-foreground mb-4">No clients yet.</p>
                            <Button onClick={() => router.push('/clients/create')}>
                              Create Your First Client
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {client.mobileNo && (
                                <span className="mr-2">📞 {client.mobileNo}</span>
                              )}
                              {client.email && (
                                <span>✉️ {client.email}</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {client.companyName || '-'}
                            </div>
                            {client.gst && (
                              <div className="text-sm text-muted-foreground">
                                GST: {client.gst}
                              </div>
                            )}
                            {client.billingCity && client.billingState && (
                              <div className="text-sm text-muted-foreground">
                                {client.billingCity}, {client.billingState}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            ₹0.00
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/clients/${client.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/clients/${client.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClient(client.id)}
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
            {filteredClients.length > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                Showing {filteredClients.length} of {clients.length} clients
                {searchQuery && ` (filtered from ${clients.length} total)`}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
