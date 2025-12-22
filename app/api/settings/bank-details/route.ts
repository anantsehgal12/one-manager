import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bankDetailsTable, usersTable } from '@/db/schema';
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


        const bankDetails = await db.select()
            .from(bankDetailsTable)
            .where(and(
                eq(bankDetailsTable.userId, user.id),
                eq(bankDetailsTable.orgId, orgId)
            ))
            .orderBy(bankDetailsTable.createdAt);

        return NextResponse.json(bankDetails);
    } catch (error) {
        console.error('Error fetching bank details:', error);
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
            accountHolderName, 
            bankName, 
            accountNumber, 
            ifscCode, 
            swiftCode, 
            branchName, 
            upiId, 
            isDefault 
        } = body;

        if (!accountHolderName || !bankName || !accountNumber) {
            return NextResponse.json(
                { error: 'Account holder name, bank name, and account number are required' },
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


        // If this bank detail is set as default, unset all other defaults first
        if (isDefault) {
            await db.update(bankDetailsTable)
                .set({ isDefault: false })
                .where(and(
                    eq(bankDetailsTable.userId, user.id),
                    eq(bankDetailsTable.orgId, orgId),
                    eq(bankDetailsTable.isDefault, true)
                ));
        }

        const newBankDetail = await db.insert(bankDetailsTable)
            .values({
                userId: user.id,
                orgId,
                accountHolderName,
                bankName,
                accountNumber,
                ifscCode: ifscCode || null,
                swiftCode: swiftCode || null,
                branchName: branchName || null,
                upiId: upiId || null,
                isDefault: isDefault || false
            })
            .returning();

        return NextResponse.json(newBankDetail[0]);
    } catch (error) {
        console.error('Error creating bank detail:', error);
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
            accountHolderName, 
            bankName, 
            accountNumber, 
            ifscCode, 
            swiftCode, 
            branchName, 
            upiId, 
            isDefault 
        } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Bank detail ID is required' },
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


        // If this bank detail is being set as default, unset all other defaults first
        if (isDefault) {
            await db.update(bankDetailsTable)
                .set({ isDefault: false })
                .where(and(
                    eq(bankDetailsTable.userId, user.id),
                    eq(bankDetailsTable.orgId, orgId),
                    eq(bankDetailsTable.isDefault, true)
                ));
        }


        const updatedBankDetail = await db.update(bankDetailsTable)
            .set({
                ...(accountHolderName && { accountHolderName }),
                ...(bankName && { bankName }),
                ...(accountNumber && { accountNumber }),
                ...(ifscCode !== undefined && { ifscCode }),
                ...(swiftCode !== undefined && { swiftCode }),
                ...(branchName !== undefined && { branchName }),
                ...(upiId !== undefined && { upiId }),
                ...(typeof isDefault === 'boolean' && { isDefault }),
                updatedAt: new Date()
            })
            .where(and(
                eq(bankDetailsTable.id, id),
                eq(bankDetailsTable.userId, user.id),
                eq(bankDetailsTable.orgId, orgId)
            ))
            .returning();

        if (!updatedBankDetail.length) {
            return NextResponse.json(
                { error: 'Bank detail not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedBankDetail[0]);
    } catch (error) {
        console.error('Error updating bank detail:', error);
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
                { error: 'Bank detail ID is required' },
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


        const deletedBankDetail = await db.delete(bankDetailsTable)
            .where(and(
                eq(bankDetailsTable.id, id),
                eq(bankDetailsTable.userId, user.id),
                eq(bankDetailsTable.orgId, orgId)
            ))
            .returning();

        if (!deletedBankDetail.length) {
            return NextResponse.json(
                { error: 'Bank detail not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Bank detail deleted successfully' });
    } catch (error) {
        console.error('Error deleting bank detail:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
