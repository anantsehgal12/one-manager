import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId, getCurrentOrgId } from '@/lib/auth'
import { db } from '@/db'
import { invoicesTable } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId()
    const orgId = await getCurrentOrgId()

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = params.id

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    // Get all invoices for this client
    const clientInvoices = await db
      .select({
        totalAmount: invoicesTable.totalAmount,
        paidAmount: invoicesTable.paidAmount,
        balanceAmount: invoicesTable.balanceAmount,
        status: invoicesTable.status,
      })
      .from(invoicesTable)
      .where(
        and(
          eq(invoicesTable.clientId, clientId),
          eq(invoicesTable.orgId, orgId),
          eq(invoicesTable.userId, userId)
        )
      )
      .orderBy(desc(invoicesTable.invoiceDate))

    // Calculate total balance
    const totalBalance = clientInvoices.reduce((sum, invoice) => {
      // For invoices with balance (unpaid), add positive balance
      if (invoice.balanceAmount && parseFloat(invoice.balanceAmount.toString()) > 0) {
        return sum + parseFloat(invoice.balanceAmount.toString())
      }
      // For overpaid invoices, treat as credit (negative balance)
      if (invoice.paidAmount && invoice.totalAmount) {
        const paid = parseFloat(invoice.paidAmount.toString())
        const total = parseFloat(invoice.totalAmount.toString())
        if (paid > total) {
          return sum - (paid - total)
        }
      }
      return sum
    }, 0)

    // Calculate other metrics
    const totalInvoiced = clientInvoices.reduce((sum, invoice) => {
      return sum + (invoice.totalAmount ? parseFloat(invoice.totalAmount.toString()) : 0)
    }, 0)

    const totalPaid = clientInvoices.reduce((sum, invoice) => {
      return sum + (invoice.paidAmount ? parseFloat(invoice.paidAmount.toString()) : 0)
    }, 0)

    const activeInvoices = clientInvoices.filter(invoice => 
      invoice.status === 'draft' || invoice.status === 'sent' || invoice.status === 'overdue'
    )

    const overdueInvoices = clientInvoices.filter(invoice => 
      invoice.status === 'overdue'
    )

    return NextResponse.json({
      clientId,
      balanceAmount: totalBalance,
      totalInvoiced,
      totalPaid,
      activeInvoices: activeInvoices.length,
      overdueInvoices: overdueInvoices.length,
      lastInvoiceDate: clientInvoices.length > 0 ? clientInvoices[0].invoiceDate : null
    })

  } catch (error) {
    console.error('Error fetching client balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client balance' },
      { status: 500 }
    )
  }
}
