'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export default function AuthSync() {
  const { isSignedIn } = useUser()

  useEffect(() => {
    if (!isSignedIn) return

    // Best-effort call to ensure user exists in our DB immediately after sign-in.
    ;(async () => {
      try {
        await fetch('/api/auth/upsert', { method: 'POST', credentials: 'include' })
      } catch (err) {
        console.error('Auth upsert failed', err)
      }
    })()
  }, [isSignedIn])

  return null
}
