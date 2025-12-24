import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companyDetailsTable, usersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUserId, getCurrentOrgId } from '@/lib/auth';
import { uploadLogo, deleteLogo, validateImageFile } from '@/lib/supabase';

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


        const companyDetails = await db.select()
            .from(companyDetailsTable)
            .where(and(
                eq(companyDetailsTable.userId, user.id),
                eq(companyDetailsTable.orgId, orgId)
            ))
            .orderBy(companyDetailsTable.createdAt);

        return NextResponse.json(companyDetails);
    } catch (error) {
        console.error('Error fetching company details:', error);
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
            companyName, 
            legalName, 
            address, 
            city, 
            state, 
            pincode, 
            gst, 
            pan, 
            email, 
            phone, 
            logoFile,
            isDefault 
        } = body;

        if (!companyName) {
            return NextResponse.json(
                { error: 'Company name is required' },
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


        // If this company detail is set as default, unset all other defaults first
        if (isDefault) {
            await db.update(companyDetailsTable)
                .set({ isDefault: false })
                .where(and(
                    eq(companyDetailsTable.userId, user.id),
                    eq(companyDetailsTable.orgId, orgId),
                    eq(companyDetailsTable.isDefault, true)
                ));
        }

        const newCompanyDetail = await db.insert(companyDetailsTable)
            .values({
                userId: user.id,
                orgId,
                companyName,
                legalName: legalName || null,
                address: address || null,
                city: city || null,
                state: state || null,
                pincode: pincode || null,
                gst: gst || null,
                pan: pan || null,
                email: email || null,
                phone: phone || null,
                isDefault: isDefault || false
            })
            .returning();

        return NextResponse.json(newCompanyDetail[0]);
    } catch (error) {
        console.error('Error creating company detail:', error);
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
            companyName, 
            legalName, 
            address, 
            city, 
            state, 
            pincode, 
            gst, 
            pan, 
            email, 
            phone, 
            logoFile,
            isDefault 
        } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Company detail ID is required' },
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


        // If this company detail is being set as default, unset all other defaults first
        if (isDefault) {
            await db.update(companyDetailsTable)
                .set({ isDefault: false })
                .where(and(
                    eq(companyDetailsTable.userId, user.id),
                    eq(companyDetailsTable.orgId, orgId),
                    eq(companyDetailsTable.isDefault, true)
                ));
        }


        const updatedCompanyDetail = await db.update(companyDetailsTable)
            .set({
                ...(companyName && { companyName }),
                ...(legalName !== undefined && { legalName }),
                ...(address !== undefined && { address }),
                ...(city !== undefined && { city }),
                ...(state !== undefined && { state }),
                ...(pincode !== undefined && { pincode }),
                ...(gst !== undefined && { gst }),
                ...(pan !== undefined && { pan }),
                ...(email !== undefined && { email }),
                ...(phone !== undefined && { phone }),
                ...(logoFile !== undefined && { logoUrl: logoFile }),
                ...(typeof isDefault === 'boolean' && { isDefault }),
                updatedAt: new Date()
            })
            .where(and(
                eq(companyDetailsTable.id, id),
                eq(companyDetailsTable.userId, user.id),
                eq(companyDetailsTable.orgId, orgId)
            ))
            .returning();

        if (!updatedCompanyDetail.length) {
            return NextResponse.json(
                { error: 'Company detail not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedCompanyDetail[0]);
    } catch (error) {
        console.error('Error updating company detail:', error);
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
                { error: 'Company detail ID is required' },
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


        const deletedCompanyDetail = await db.delete(companyDetailsTable)
            .where(and(
                eq(companyDetailsTable.id, id),
                eq(companyDetailsTable.userId, user.id),
                eq(companyDetailsTable.orgId, orgId)
            ))
            .returning();

        if (!deletedCompanyDetail.length) {
            return NextResponse.json(
                { error: 'Company detail not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Company detail deleted successfully' });
    } catch (error) {
        console.error('Error deleting company detail:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
