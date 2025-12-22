import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { signaturesTable, usersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUserId, getCurrentOrgId } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Get current user ID and org ID from Clerk authentication
        const userId = await getCurrentUserId();
        const orgId = await getCurrentOrgId();

        if (!userId || !orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the user's ID from our users table
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.clerkUserId, userId)
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }


        const signatures = await db.select()
            .from(signaturesTable)
            .where(and(
                eq(signaturesTable.userId, user.id),
                eq(signaturesTable.orgId, orgId)
            ))
            .orderBy(signaturesTable.createdAt);

        return NextResponse.json(signatures);
    } catch (error) {
        console.error('Error fetching signatures:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get current user ID and org ID from Clerk authentication
        const userId = await getCurrentUserId();
        const orgId = await getCurrentOrgId();

        if (!userId || !orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, imageUrl, isDefault } = body;

        if (!name || !imageUrl) {
            return NextResponse.json(
                { error: 'Name and image URL are required' },
                { status: 400 }
            );
        }

        // Get the user's ID from our users table
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.clerkUserId, userId)
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }


        // If this signature is set as default, unset all other defaults first
        if (isDefault) {
            await db.update(signaturesTable)
                .set({ isDefault: false })
                .where(and(
                    eq(signaturesTable.userId, user.id),
                    eq(signaturesTable.orgId, orgId),
                    eq(signaturesTable.isDefault, true)
                ));
        }

        const newSignature = await db.insert(signaturesTable)
            .values({
                userId: user.id,
                orgId,
                name,
                imageUrl,
                isDefault: isDefault || false
            })
            .returning();

        return NextResponse.json(newSignature[0]);
    } catch (error) {
        console.error('Error creating signature:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Get current user ID and org ID from Clerk authentication
        const userId = await getCurrentUserId();
        const orgId = await getCurrentOrgId();

        if (!userId || !orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, imageUrl, isDefault } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Signature ID is required' },
                { status: 400 }
            );
        }

        // Get the user's ID from our users table
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.clerkUserId, userId)
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }


        // If this signature is being set as default, unset all other defaults first
        if (isDefault) {
            await db.update(signaturesTable)
                .set({ isDefault: false })
                .where(and(
                    eq(signaturesTable.userId, user.id),
                    eq(signaturesTable.orgId, orgId),
                    eq(signaturesTable.isDefault, true)
                ));
        }


        const updatedSignature = await db.update(signaturesTable)
            .set({
                ...(name && { name }),
                ...(imageUrl && { imageUrl }),
                ...(typeof isDefault === 'boolean' && { isDefault }),
                updatedAt: new Date()
            })
            .where(and(
                eq(signaturesTable.id, id),
                eq(signaturesTable.userId, user.id),
                eq(signaturesTable.orgId, orgId)
            ))
            .returning();

        if (!updatedSignature.length) {
            return NextResponse.json(
                { error: 'Signature not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedSignature[0]);
    } catch (error) {
        console.error('Error updating signature:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Get current user ID and org ID from Clerk authentication
        const userId = await getCurrentUserId();
        const orgId = await getCurrentOrgId();

        if (!userId || !orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Signature ID is required' },
                { status: 400 }
            );
        }

        // Get the user's ID from our users table
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.clerkUserId, userId)
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }


        const deletedSignature = await db.delete(signaturesTable)
            .where(and(
                eq(signaturesTable.id, id),
                eq(signaturesTable.userId, user.id),
                eq(signaturesTable.orgId, orgId)
            ))
            .returning();

        if (!deletedSignature.length) {
            return NextResponse.json(
                { error: 'Signature not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Signature deleted successfully' });
    } catch (error) {
        console.error('Error deleting signature:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
