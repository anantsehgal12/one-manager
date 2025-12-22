import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { clientsTable } from '@/db/schema'
import { getCurrentUserId, getCurrentOrgId } from '@/lib/auth'


import { eq, and } from 'drizzle-orm'


// GET - Fetch a specific client
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
    console.log('API: Fetching client with params:', params)
    const userId = await getCurrentUserId()
    const orgId = await getCurrentOrgId()

    console.log('API: Auth check - UserId:', userId, 'OrgId:', orgId)


    if (!userId || !orgId) {
      console.log('API: Unauthorized - missing userId or orgId')
      console.log('API: UserId:', userId, 'OrgId:', orgId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = params.id
    console.log('API: Client ID from params:', clientId)


    const [client] = await db
      .select({
        id: clientsTable.id,
        name: clientsTable.name,
        mobileNo: clientsTable.mobileNo,
        email: clientsTable.email,
        companyName: clientsTable.companyName,
        gst: clientsTable.gst,
        billingMainAddress: clientsTable.billingMainAddress,
        billingPincode: clientsTable.billingPincode,
        billingCity: clientsTable.billingCity,
        billingState: clientsTable.billingState,
        billingCountry: clientsTable.billingCountry,
        shippingAddress: clientsTable.shippingAddress,
        createdAt: clientsTable.createdAt,
        updatedAt: clientsTable.updatedAt,
      })
      .from(clientsTable)
      .where(
        and(
          eq(clientsTable.id, clientId),
          eq(clientsTable.orgId, orgId),
          eq(clientsTable.userId, userId)
        )
      )

    console.log('API: Query result:', client)

    if (!client) {
      console.log('API: Client not found')
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('API: Error fetching client:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch client',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update a specific client
export async function PUT(
  request: NextRequest,
  context: any
) {

  try {
    const body = await request.json()
    const {
      name,
      mobileNo,
      email,
      companyName,
      gst,
      billingMainAddress,
      billingPincode,
      billingCity,
      billingState,
      billingCountry,
      shippingAddress,
    } = body

    const userId = await getCurrentUserId()
    const orgId = await getCurrentOrgId()

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await resolveParams(context);
    const clientId = params.id

    // First verify the client exists and belongs to the current organization
    const [existingClient] = await db
      .select({ id: clientsTable.id })
      .from(clientsTable)
      .where(
        and(
          eq(clientsTable.id, clientId),
          eq(clientsTable.orgId, orgId),
          eq(clientsTable.userId, userId)
        )
      )

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }


    // Update the client
    const [updatedClient] = await db
      .update(clientsTable)
      .set({
        name,
        mobileNo,
        email,
        companyName,
        gst,
        billingMainAddress,
        billingPincode,
        billingCity,
        billingState,
        billingCountry,
        shippingAddress,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(clientsTable.id, clientId),
          eq(clientsTable.orgId, orgId),
          eq(clientsTable.userId, userId)
        )
      )
      .returning()

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ 
      error: 'Failed to update client',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Delete a specific client
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const userId = await getCurrentUserId()
    const orgId = await getCurrentOrgId()

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }


    const params = await resolveParams(context);
    const clientId = params.id

    // First verify the client exists and belongs to the current organization
    const [existingClient] = await db
      .select({ id: clientsTable.id })
      .from(clientsTable)
      .where(
        and(
          eq(clientsTable.id, clientId),
          eq(clientsTable.orgId, orgId),
          eq(clientsTable.userId, userId)
        )
      )

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }


    // Delete the client
    await db
      .delete(clientsTable)
      .where(
        and(
          eq(clientsTable.id, clientId),
          eq(clientsTable.orgId, orgId),
          eq(clientsTable.userId, userId)
        )
      )

    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
