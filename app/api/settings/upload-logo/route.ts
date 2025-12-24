import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companyDetailsTable, usersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUserId, getCurrentOrgId } from '@/lib/auth';
import { uploadLogo, validateImageFile } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        console.log('Logo upload request started');
        
        // Get current user ID and org ID from Clerk authentication
        const userId = await getCurrentUserId();
        const orgId = await getCurrentOrgId();

        console.log('Auth check:', { userId: !!userId, orgId: !!orgId });

        if (!userId || !orgId) {
            console.error('Authentication failed:', { userId, orgId });
            return NextResponse.json({ error: 'Unauthorized - Missing user or organization ID' }, { status: 401 });
        }

        // Get the user's ID from our users table
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.clerkUserId, userId)
        });

        console.log('User lookup:', { found: !!user, userId: user?.id });

        if (!user) {
            console.error('User not found in database:', userId);
            return NextResponse.json(
                { error: 'User not found in database' },
                { status: 404 }
            );
        }

        const formData = await request.formData();
        const logoFile = formData.get('logo') as File;
        const companyId = formData.get('companyId') as string;

        console.log('Form data received:', { 
            hasLogoFile: !!logoFile, 
            logoFileName: logoFile?.name, 
            logoFileSize: logoFile?.size,
            logoFileType: logoFile?.type,
            companyId 
        });

        if (!logoFile) {
            console.error('No logo file provided');
            return NextResponse.json(
                { error: 'Logo file is required' },
                { status: 400 }
            );
        }

        // Validate the file
        const validation = validateImageFile(logoFile);
        if (!validation.valid) {
            console.error('File validation failed:', validation.error);
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Check if company details exist
        let existingCompanyDetail;
        if (companyId && companyId !== 'default') {
            existingCompanyDetail = await db.query.companyDetailsTable.findFirst({
                where: and(
                    eq(companyDetailsTable.id, companyId),
                    eq(companyDetailsTable.userId, user.id),
                    eq(companyDetailsTable.orgId, orgId)
                )
            });
        } else {
            // Find default company details or create if none exist
            existingCompanyDetail = await db.query.companyDetailsTable.findFirst({
                where: and(
                    eq(companyDetailsTable.userId, user.id),
                    eq(companyDetailsTable.orgId, orgId),
                    eq(companyDetailsTable.isDefault, true)
                )
            });

            // If no default exists, find any company detail
            if (!existingCompanyDetail) {
                existingCompanyDetail = await db.query.companyDetailsTable.findFirst({
                    where: and(
                        eq(companyDetailsTable.userId, user.id),
                        eq(companyDetailsTable.orgId, orgId)
                    )
                });
            }
        }

        console.log('Company details lookup:', { 
            found: !!existingCompanyDetail, 
            companyId: existingCompanyDetail?.id,
            isDefault: existingCompanyDetail?.isDefault 
        });

        // If no company details exist, create a basic one
        if (!existingCompanyDetail) {
            console.log('No company details found, creating new company detail');
            
            try {
                const newCompanyDetail = await db.insert(companyDetailsTable)
                    .values({
                        userId: user.id,
                        orgId: orgId,
                        companyName: 'Default Company',
                        isDefault: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    })
                    .returning();

                existingCompanyDetail = newCompanyDetail[0];
                console.log('Created new company detail:', existingCompanyDetail.id);
            } catch (createError) {
                console.error('Failed to create company detail:', createError);
                return NextResponse.json(
                    { error: 'Failed to create company details record' },
                    { status: 500 }
                );
            }
        }

        // Upload to Supabase
        console.log('Starting Supabase upload...');
        let logoUrl;
        try {
            logoUrl = await uploadLogo(logoFile, orgId, existingCompanyDetail.id);
            console.log('Upload successful, logo URL:', logoUrl);
        } catch (uploadError) {
            console.error('Supabase upload failed:', uploadError);
            return NextResponse.json(
                { error: `Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
                { status: 500 }
            );
        }

        // Update the company details with the logo URL
        try {
            console.log('Updating company details with logo URL...');
            const updatedCompanyDetail = await db.update(companyDetailsTable)
                .set({ logoUrl, updatedAt: new Date() })
                .where(and(
                    eq(companyDetailsTable.id, existingCompanyDetail.id),
                    eq(companyDetailsTable.userId, user.id),
                    eq(companyDetailsTable.orgId, orgId)
                ))
                .returning();

            console.log('Company details updated successfully');
            return NextResponse.json({ 
                logoUrl,
                companyDetail: updatedCompanyDetail[0]
            });
        } catch (updateError) {
            console.error('Database update failed:', updateError);
            // Don't fail the whole request if upload succeeded but update failed
            return NextResponse.json({ 
                logoUrl,
                warning: 'Logo uploaded but failed to update database record',
                error: 'Database update failed'
            }, { status: 207 }); // Multi-Status
        }

    } catch (error) {
        console.error('Unexpected error in logo upload:', error);
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
