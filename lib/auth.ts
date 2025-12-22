import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/db'
import { usersTable } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Upsert a user row in the `users` table from Clerk user data.
 * This is safe to call on every request for authenticated users.
 */
export async function upsertUser(clerkUserId: string) {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(clerkUserId)

    // Try to get orgId from the current session (if available)
    let orgId: string | null = null
    try {
      const session = (await auth()) || {}
      // @ts-ignore
      if (session.orgId) orgId = session.orgId
    } catch (e) {
      // ignore: auth may not be available in some contexts
    }

    // If orgId wasn't on the session, try user metadata

    const email =
      // @ts-ignore - some Clerk SDK shapes differ by version
      (user?.emailAddresses && user.emailAddresses[0]?.emailAddress) ||
      // fallback shape
      // @ts-ignore
      user?.primaryEmailAddress?.emailAddress ||
      null

    const name =
      // @ts-ignore
      user?.fullName || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
      // @ts-ignore
      user?.username || null

    const imageUrl = // @ts-ignore
      user?.profileImageUrl || user?.imageUrl || null

    const metadata = JSON.stringify(user || {})

    // try public/private metadata for orgId if not found from session
    // @ts-ignore
    if (!orgId && user?.publicMetadata?.orgId) orgId = user.publicMetadata.orgId
    // @ts-ignore
    if (!orgId && user?.privateMetadata?.orgId) orgId = user.privateMetadata.orgId

    // Use Drizzle ORM for atomic upsert with existing connection pool
    // This prevents connection pool exhaustion and uses proper connection management
    const result = await db
      .insert(usersTable)
      .values({
        id: clerkUserId,
        clerkUserId: clerkUserId,
        name: name,
        email: email,
        imageUrl: imageUrl,
        metadata: metadata,
        orgId: orgId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: usersTable.clerkUserId,
        set: {
          name: name,
          email: email,
          imageUrl: imageUrl,
          metadata: metadata,
          orgId: orgId,
          updatedAt: new Date(),
        },
      })
      .returning()

    // Return the first result row or null if no rows returned
    if (result && result.length > 0) return result[0]
    return null
  } catch (err) {
    // don't fail the request if DB/upsert fails; log and continue
    console.error('upsertUser error', err)
    return null
  }
}

/**
 * Returns current Clerk user id and ensures there's a DB record for the user.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = (await auth()) || {}
  if (!userId) return null

  // Ensure user exists in DB (best-effort)
  try {
    // fire-and-forget upsert, but await to surface errors in logs
    await upsertUser(userId)
  } catch (err) {
    console.error('Error upserting user on request:', err)
  }

  return userId
}


/**
 * Returns the current organization id for the authenticated user, if any.
 * Attempts to read from the Clerk session, user's public metadata, or falls back to the users table.
 */
export async function getCurrentOrgId(): Promise<string | null> {
  // Clerk's `auth()` may contain orgId depending on session membership
  const a = (await auth()) || {}
  // @ts-ignore
  if (a.orgId) return a.orgId

  const userId = a.userId
  if (!userId) return null

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    // Check common metadata places for an org id
    // @ts-ignore
    if (user?.publicMetadata?.orgId) return user.publicMetadata.orgId
    // @ts-ignore
    if (user?.privateMetadata?.orgId) return user.privateMetadata.orgId

    // Fallback: check the users table for stored orgId
    const dbUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.clerkUserId, userId)
    })
    
    if (dbUser?.orgId) {
      return dbUser.orgId
    }
  } catch (err) {
    console.error('getCurrentOrgId error', err)
  }

  return null
}

export default {
  getCurrentUserId,
  getCurrentOrgId,
  upsertUser,
}
