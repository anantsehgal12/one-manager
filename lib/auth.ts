
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";


/**
 * Get the current authenticated user from Clerk
 * Creates a user record in the database if it doesn't exist
 */
export async function getCurrentUser() {
  const { userId, sessionId, orgId } = await import("@clerk/nextjs/server").then(mod => mod.auth());
  
  if (!userId) {
    throw new Error("Unauthorized: No user ID found");
  }

  if (!orgId) {
    throw new Error("Unauthorized: No organization ID found");
  }

  try {
    // Try to find existing user in database
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, userId))
      .limit(1);

    if (existingUser.length > 0) {
      return existingUser[0];
    }

    // If user doesn't exist in database, create them
    // Note: This assumes Clerk provides email in the session
    // In a real implementation, you might want to fetch user details from Clerk API
    const [newUser] = await db
      .insert(usersTable)
      .values({
        id: userId, // Use Clerk user ID as primary key
        clerkUserId: userId,
        orgId: orgId,
        name: "", // Will be updated when user provides profile info
        email: "", // Will be updated when user provides profile info
      })
      .returning();

    return newUser;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw new Error("Failed to get current user");
  }
}



/**
 * Get current user ID only (for use in API routes)
 */
export async function getCurrentUserId(): Promise<string> {
  const { userId: clerkUserId } = await import("@clerk/nextjs/server").then(mod => mod.auth());
  
  if (!clerkUserId) {
    throw new Error("Unauthorized: No user ID found");
  }

  try {
    // Find user in database using Clerk user ID
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0) {
      throw new Error("User not found in database");
    }

    return user[0].id; // Return the database user ID, not Clerk user ID
  } catch (error) {
    console.error("Error getting current user ID:", error);
    throw new Error("Failed to get current user ID");
  }
}

/**
 * Get current organization ID
 */
export async function getCurrentOrgId(): Promise<string> {
  const { orgId } = await import("@clerk/nextjs/server").then(mod => mod.auth());
  
  if (!orgId) {
    throw new Error("Unauthorized: No organization ID found");
  }

  return orgId;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await import("@clerk/nextjs/server").then(mod => mod.auth());
  return !!userId;
}
