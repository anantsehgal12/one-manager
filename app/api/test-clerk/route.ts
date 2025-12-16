import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getCurrentOrgId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const orgId = await getCurrentOrgId()
    return NextResponse.json({
      success: true,
      message: 'Clerk integration working!',
      user: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        name: user.name,
        orgId: orgId
      }
    })
  } catch (error) {
    console.error('Error in test endpoint:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
