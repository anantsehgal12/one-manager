import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { productsTable } from '@/db/schema'
import { getCurrentUserId, getCurrentOrgId } from '@/lib/auth'

import { eq } from 'drizzle-orm'

async function resolveParams(context: any) {
  if (!context) return {};
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const params = await resolveParams(context);
    const { id } = params
    const userId = await getCurrentUserId()
    const orgId = await getCurrentOrgId()

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [product] = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        isService: productsTable.isService,
        sellingPrice: productsTable.sellingPrice,
        taxPercentage: productsTable.taxPercentage,
        primaryUnits: productsTable.primaryUnits,
        hsnSacCode: productsTable.hsnSacCode,
        productImage: productsTable.productImage,
        availableStock: productsTable.availableStock,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
      })
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .where(eq(productsTable.orgId, orgId))
      .limit(1)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const params = await resolveParams(context);
    const { id } = params
    const body = await request.json()
    console.log('Received PATCH request body:', body)
    
    const {
      name,
      isService,
      sellingPrice,
      taxPercentage,
      primaryUnits,
      hsnSacCode,
      productImage,
      availableStock,
    } = body

    const userId = await getCurrentUserId()
    const orgId = await getCurrentOrgId()

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if product exists and belongs to the organization
    const [existingProduct] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .where(eq(productsTable.orgId, orgId))
      .limit(1)

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (isService !== undefined) updateData.isService = isService
    if (sellingPrice !== undefined) updateData.sellingPrice = sellingPrice.toString()
    if (taxPercentage !== undefined) updateData.taxPercentage = taxPercentage.toString()
    if (primaryUnits !== undefined) updateData.primaryUnits = primaryUnits
    if (hsnSacCode !== undefined) updateData.hsnSacCode = hsnSacCode
    if (productImage !== undefined) updateData.productImage = productImage
    if (availableStock !== undefined) updateData.availableStock = availableStock.toString()
    
    updateData.updatedAt = new Date()

    const [updatedProduct] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .where(eq(productsTable.orgId, orgId))
      .returning()

    console.log('Product updated successfully:', updatedProduct)
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const params = await resolveParams(context);
    const { id } = params
    const userId = await getCurrentUserId()
    const orgId = await getCurrentOrgId()

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if product exists and belongs to the organization
    const [existingProduct] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .where(eq(productsTable.orgId, orgId))
      .limit(1)

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete the product
    await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .where(eq(productsTable.orgId, orgId))

    console.log('Product deleted successfully:', id)
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
