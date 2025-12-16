
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { clientsTable } from '@/db/schema'
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


    // Fetch all clients for the current organization
    const clients = await db
      .select({
        id: clientsTable.id,
        name: clientsTable.name,
        companyName: clientsTable.companyName,
        mobileNo: clientsTable.mobileNo,
        email: clientsTable.email,
        gst: clientsTable.gst,
        billingCity: clientsTable.billingCity,
        billingState: clientsTable.billingState,
        createdAt: clientsTable.createdAt,
        updatedAt: clientsTable.updatedAt,
      })
      .from(clientsTable)
      .where(eq(clientsTable.orgId, orgId))
      .orderBy(clientsTable.createdAt)

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}



export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)
    
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

    // Get current user ID and org ID from Clerk authentication
    const userId = await getCurrentUserId()
    const orgId = await getCurrentOrgId()
    
    console.log('User ID:', userId)
    console.log('Org ID:', orgId)

    // Create client using Drizzle ORM
    const [client] = await db
      .insert(clientsTable)
      .values({
        userId,
        orgId,
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
      })
      .returning()

    console.log('Client created successfully:', client)
    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ 
      error: 'Failed to create client',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
