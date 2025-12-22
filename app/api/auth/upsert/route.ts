import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { upsertUser } from '@/lib/auth'

export async function POST() {
  try {
    const a = (await auth()) || {}
    // @ts-ignore
    const userId: string | undefined = a.userId

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await upsertUser(userId)

    return NextResponse.json({ ok: true, user: result }, { status: 200 })
  } catch (err) {
    console.error('auth/upsert error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
