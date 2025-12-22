import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { documentSettingsTable, usersTable } from '@/db/schema';
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


        const documentSettings = await db.select()
            .from(documentSettingsTable)
            .where(and(
                eq(documentSettingsTable.userId, user.id),
                eq(documentSettingsTable.orgId, orgId)
            ))
            .orderBy(documentSettingsTable.documentType);

        return NextResponse.json(documentSettings);
    } catch (error) {
        console.error('Error fetching document settings:', error);
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
        const { 
            documentType, 
            prefix, 
            nextNumber, 
            showQrCode, 
            pageSize, 
            termsConditions, 
            notes, 
            isDefault 
        } = body;

        if (!documentType) {
            return NextResponse.json(
                { error: 'Document type is required' },
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


        // Check if settings for this document type already exist for this user and org
        const existingSettings = await db.query.documentSettingsTable.findFirst({
            where: and(
                eq(documentSettingsTable.userId, user.id),
                eq(documentSettingsTable.orgId, orgId),
                eq(documentSettingsTable.documentType, documentType)
            )
        });

        if (existingSettings) {
            return NextResponse.json(
                { error: 'Settings for this document type already exist' },
                { status: 409 }
            );
        }

        const newDocumentSetting = await db.insert(documentSettingsTable)
            .values({
                userId: user.id,
                orgId,
                documentType,
                prefix: prefix || null,
                nextNumber: nextNumber ? nextNumber.toString() : "1",
                showQrCode: showQrCode || false,
                pageSize: pageSize || "A4",
                termsConditions: termsConditions || null,
                notes: notes || null,
                isDefault: isDefault || false
            })
            .returning();

        return NextResponse.json(newDocumentSetting[0]);
    } catch (error) {
        console.error('Error creating document setting:', error);
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
        const { 
            id, 
            documentType, 
            prefix, 
            nextNumber, 
            showQrCode, 
            pageSize, 
            termsConditions, 
            notes, 
            isDefault 
        } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Document setting ID is required' },
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


        const updatedDocumentSetting = await db.update(documentSettingsTable)
            .set({
                ...(documentType && { documentType }),
                ...(prefix !== undefined && { prefix }),
                ...(nextNumber !== undefined && { nextNumber: nextNumber.toString() }),
                ...(typeof showQrCode === 'boolean' && { showQrCode }),
                ...(pageSize && { pageSize }),
                ...(termsConditions !== undefined && { termsConditions }),
                ...(notes !== undefined && { notes }),
                ...(typeof isDefault === 'boolean' && { isDefault }),
                updatedAt: new Date()
            })
            .where(and(
                eq(documentSettingsTable.id, id),
                eq(documentSettingsTable.userId, user.id),
                eq(documentSettingsTable.orgId, orgId)
            ))
            .returning();

        if (!updatedDocumentSetting.length) {
            return NextResponse.json(
                { error: 'Document setting not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedDocumentSetting[0]);
    } catch (error) {
        console.error('Error updating document setting:', error);
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
                { error: 'Document setting ID is required' },
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


        const deletedDocumentSetting = await db.delete(documentSettingsTable)
            .where(and(
                eq(documentSettingsTable.id, id),
                eq(documentSettingsTable.userId, user.id),
                eq(documentSettingsTable.orgId, orgId)
            ))
            .returning();

        if (!deletedDocumentSetting.length) {
            return NextResponse.json(
                { error: 'Document setting not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Document setting deleted successfully' });
    } catch (error) {
        console.error('Error deleting document setting:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
