'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { toast } from 'react-hot-toast'
import { SignIn, useUser } from '@clerk/nextjs'
import { Plus, Eye, Edit, Trash2 } from 'lucide-react'
import Header from '../_components/Header'
import Side from '../_components/Side'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

interface Invoice {
    id: string
    invoiceNumber: string
    clientId: string
    invoiceDate: string
    dueDate?: string
    totalAmount: string
    balanceAmount: string
    status: string
    createdAt: string
    clientName?: string
}

interface InvoiceListResponse {
    invoices: Invoice[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export default function InvoicesPage() {
    const router = useRouter()
    const { isSignedIn } = useUser()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    })

    // Load invoices
    const loadInvoices = async (page = 1) => {
        try {
            const response = await fetch(`/api/invoices?page=${page}&limit=${pagination.limit}`)

            if (!response.ok) {
                throw new Error('Failed to fetch invoices')
            }

            const data: InvoiceListResponse = await response.json()
            setInvoices(data.invoices)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error loading invoices:', error)
            toast.error('Failed to load invoices')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isSignedIn) {
            loadInvoices()
        }
    }, [isSignedIn])

    const handlePageChange = (newPage: number) => {
        loadInvoices(newPage)
    }

    const getStatusBadge = (status: string) => {
        const statusMap = {
            draft: { label: 'Draft', variant: 'secondary' as const },
            sent: { label: 'Sent', variant: 'default' as const },
            paid: { label: 'Paid', variant: 'default' as const },
            overdue: { label: 'Overdue', variant: 'destructive' as const },
            cancelled: { label: 'Cancelled', variant: 'destructive' as const },
        }

        const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const }

        return (
            <Badge variant={statusInfo.variant}>
                {statusInfo.label}
            </Badge>
        )
    }

    const formatCurrency = (amount: string) => {
        return `₹${parseFloat(amount).toFixed(2)}`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-background">
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                    <div className="container mx-auto px-6 py-4">
                        <h1 className="text-2xl font-bold">Invoices</h1>
                    </div>
                </header>

                <main className="flex w-full min-h-[calc(100vh-120px)] flex-col items-center justify-center px-6">
                    <section className='py-10 flex flex-col items-center justify-center gap-8'>
                        <span>Please SignIn/SignUp below with your account to access this page.</span>

                    </section>
                </main>

                <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-6 py-4">
                        <p className="text-sm text-muted-foreground text-center">
                            © 2024 One Manager. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        )
    }

    if (loading) {
        return (
            <SidebarProvider>
                <Side />
                <SidebarInset>
                    <Header />
                    <div className="container mx-auto py-8 px-6">
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-muted-foreground">Loading invoices...</p>
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
                <main className="min-h-screen w-full bg-background">
                    {/* Main Content */}
                    <main className="container mx-auto py-8 px-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Invoices</CardTitle>
                                <CardDescription>
                                    Manage your invoices and track payments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {invoices.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground mb-4">No invoices found</p>
                                        <Button onClick={() => router.push('/invoices/create')}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Your First Invoice
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Invoice Number</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Due Date</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Balance</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {invoices.map((invoice) => (
                                                    <TableRow key={invoice.id}>
                                                        <TableCell className="font-medium">
                                                            {invoice.invoiceNumber}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatDate(invoice.invoiceDate)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatCurrency(invoice.totalAmount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatCurrency(invoice.balanceAmount)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(invoice.status)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="outline" size="sm">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="outline" size="sm">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        {/* Pagination */}
                                        {pagination.pages > 1 && (
                                            <div className="flex items-center justify-between mt-6">
                                                <div className="text-sm text-muted-foreground">
                                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                                    {pagination.total} results
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePageChange(pagination.page - 1)}
                                                        disabled={pagination.page === 1}
                                                    >
                                                        Previous
                                                    </Button>
                                                    <span className="text-sm">
                                                        Page {pagination.page} of {pagination.pages}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePageChange(pagination.page + 1)}
                                                        disabled={pagination.page === pagination.pages}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </main>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
