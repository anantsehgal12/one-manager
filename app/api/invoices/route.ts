
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId, getCurrentOrgId } from '@/lib/auth'
import { db } from '@/db'
import { invoicesTable, invoiceItemsTable } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'


// GET /api/invoices - List all invoices for the user
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getCurrentOrgId()

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID not found' }, { status: 400 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const status = url.searchParams.get('status')
    
    const offset = (page - 1) * limit

    // Build query conditions
    let whereConditions = [eq(invoicesTable.orgId, orgId)]
    
    if (status) {
      whereConditions.push(eq(invoicesTable.status, status))
    }

    // Fetch invoices with pagination
    const invoices = await db
      .select({
        id: invoicesTable.id,
        invoiceNumber: invoicesTable.invoiceNumber,
        clientId: invoicesTable.clientId,
        invoiceDate: invoicesTable.invoiceDate,
        dueDate: invoicesTable.dueDate,
        totalAmount: invoicesTable.totalAmount,
        balanceAmount: invoicesTable.balanceAmount,
        status: invoicesTable.status,
        createdAt: invoicesTable.createdAt,
        // Client details (join not available in drizzle without additional setup)
        clientName: invoicesTable.clientId, // This would need a join in real implementation
      })
      .from(invoicesTable)
      .where(and(...whereConditions))
      .orderBy(desc(invoicesTable.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const totalResult = await db
      .select({ count: invoicesTable.id })
      .from(invoicesTable)
      .where(and(...whereConditions))

    const total = totalResult.length

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}


// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const {
      clientId,
      invoiceNumber,
      invoiceDate,
      dueDate,
      referenceNumber,
      items,
      notes,
      termsConditions,
      subtotal,
      taxAmount,
      totalAmount,
      balanceAmount,
      status,
      signatureId,
    } = body

    // Validate required fields
    if (!clientId || !invoiceNumber || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get orgId for the user
    const orgId = await getCurrentOrgId()

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID not found' },
        { status: 400 }
      )
    }

    // Create the invoice with proper typing
    const invoiceData = {
      userId,
      orgId,
      clientId,
      invoiceNumber,
      invoiceDate: new Date(invoiceDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      referenceNumber: referenceNumber ? referenceNumber : null,
      subtotal,
      taxAmount: taxAmount || '0.00',
      totalAmount,
      balanceAmount,
      status: status || 'draft',
      notes: notes ? notes : null,
      termsConditions: termsConditions ? termsConditions : null,
    }

    const [newInvoice] = await db
      .insert(invoicesTable)
      .values(invoiceData)
      .returning()

    // Create invoice items
    const invoiceItemsData = items.map((item: any) => ({
      invoiceId: newInvoice.id,
      productId: item.productId || null,
      itemName: item.itemName,
      description: item.description || null,
      quantity: item.quantity,
      rate: item.rate,
      taxPercentage: item.taxPercentage,
      taxAmount: (item.quantity * item.rate * parseFloat(item.taxPercentage) / 100).toFixed(2),
      totalAmount: (item.quantity * item.rate * (1 + parseFloat(item.taxPercentage) / 100)).toFixed(2),
      hsnSacCode: item.hsnSacCode || null,
    }))

    const invoiceItems = await Promise.all(
      invoiceItemsData.map(async (itemData: any) => {
        const [newItem] = await db
          .insert(invoiceItemsTable)
          .values(itemData)
          .returning()
        return newItem
      })
    )

    return NextResponse.json({
      invoice: newInvoice,
      items: invoiceItems
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
