import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { productsTable } from '@/db/schema'
import { getCurrentUserId, getCurrentOrgId } from '@/lib/auth'

import { eq } from 'drizzle-orm'


export async function GET(request: NextRequest) {
  try {
    // Get current user ID and org ID from Clerk authentication
    const userId = await getCurrentUserId()
    const orgId = await getCurrentOrgId()


    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse search parameters for filtering
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('search')
    const isService = searchParams.get('isService')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build query with filters
    let query = db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        isService: productsTable.isService,
        sellingPrice: productsTable.sellingPrice,
        taxPercentage: productsTable.taxPercentage,
        isPriceTaxInclusive: productsTable.isPriceTaxInclusive,
        primaryUnits: productsTable.primaryUnits,
        hsnSacCode: productsTable.hsnSacCode,
        productImage: productsTable.productImage,
        availableStock: productsTable.availableStock,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
      })
      .from(productsTable)
      .where(eq(productsTable.orgId, orgId))

    // Apply search filter
    if (searchQuery) {
      query = query.where(
        (products, { ilike }) => 
          ilike(products.name, `%${searchQuery}%`)
      )
    }

    // Apply service/product filter
    if (isService !== null && isService !== undefined && isService !== '') {
      const isServiceBool = isService === 'true'
      query = query.where(eq(productsTable.isService, isServiceBool))
    }

    // Apply sorting
    const sortField = sortBy as keyof typeof productsTable
    if (sortField in productsTable) {
      if (sortOrder === 'asc') {
        query = query.orderBy(productsTable[sortField])
      } else {
        query = query.orderBy(productsTable[sortField])
      }
    } else {
      query = query.orderBy(productsTable.createdAt)
    }

    // Execute query
    const products = await query

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)
    

    const {
      name,
      isService,
      sellingPrice,
      taxPercentage,
      isPriceTaxInclusive,
      primaryUnits,
      hsnSacCode,
      productImage,
      availableStock,
    } = body

    // Get current user ID and org ID from Clerk authentication
    const userId = await getCurrentUserId()
    const orgId = await getCurrentOrgId()
    
    console.log('User ID:', userId)
    console.log('Org ID:', orgId)

    // Validate required fields
    if (!name || !sellingPrice || !primaryUnits) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, sellingPrice, and primaryUnits are required'
      }, { status: 400 })
    }

    // Create product using Drizzle ORM
    const [product] = await db
      .insert(productsTable)
      .values({
        userId,
        orgId,

        name,
        isService: isService || false,
        sellingPrice: sellingPrice.toString(),
        taxPercentage: taxPercentage?.toString() || '0',
        isPriceTaxInclusive: isPriceTaxInclusive || false,
        primaryUnits,
        hsnSacCode,
        productImage,
        availableStock: availableStock?.toString() || '0',
      })
      .returning()

    console.log('Product created successfully:', product)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
