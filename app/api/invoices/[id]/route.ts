import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invoicesTable, invoiceItemsTable, clientsTable, companyDetailsTable, bankDetailsTable, usersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentOrgId, getCurrentUserId } from '@/lib/auth';

// GET /api/invoices/[id] - Get a single invoice with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Check authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch invoice data
    const invoiceData = await db
      .select({
        // Invoice fields
        id: invoicesTable.id,
        userId: invoicesTable.userId,
        invoiceNumber: invoicesTable.invoiceNumber,
        invoiceDate: invoicesTable.invoiceDate,
        dueDate: invoicesTable.dueDate,
        subtotal: invoicesTable.subtotal,
        taxAmount: invoicesTable.taxAmount,
        totalAmount: invoicesTable.totalAmount,
        paidAmount: invoicesTable.paidAmount,
        balanceAmount: invoicesTable.balanceAmount,
        status: invoicesTable.status,
        notes: invoicesTable.notes,
        termsConditions: invoicesTable.termsConditions,
        referenceNumber: invoicesTable.referenceNumber,
        createdAt: invoicesTable.createdAt,
        clientId: invoicesTable.clientId,
        bankDetailsId: invoicesTable.bankDetailsId,
      })
      .from(invoicesTable)
      .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)))
      .limit(1);

    if (!invoiceData || invoiceData.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoice = invoiceData[0];

    // Fetch client data separately
    const clientData = await db
      .select({
        id: clientsTable.id,
        name: clientsTable.name,
        companyName: clientsTable.companyName,
        gst: clientsTable.gst,
        address: clientsTable.address,
        billingMainAddress: clientsTable.billingMainAddress,
        billingCity: clientsTable.billingCity,
        billingState: clientsTable.billingState,
        billingPincode: clientsTable.billingPincode,
        billingCountry: clientsTable.billingCountry,
        mobileNo: clientsTable.mobileNo,
        email: clientsTable.email,
      })
      .from(clientsTable)
      .where(eq(clientsTable.id, invoice.clientId))
      .limit(1);

    const client = clientData[0] || {};

    // Fetch invoice items
    const itemsData = await db
      .select({
        id: invoiceItemsTable.id,
        itemName: invoiceItemsTable.itemName,
        description: invoiceItemsTable.description,
        quantity: invoiceItemsTable.quantity,
        rate: invoiceItemsTable.rate,
        taxPercentage: invoiceItemsTable.taxPercentage,
        taxAmount: invoiceItemsTable.taxAmount,
        totalAmount: invoiceItemsTable.totalAmount,
        hsnSacCode: invoiceItemsTable.hsnSacCode,
      })
      .from(invoiceItemsTable)
      .where(eq(invoiceItemsTable.invoiceId, id))
      .orderBy(invoiceItemsTable.createdAt);

    // Get current authenticated user ID (same as Settings page uses)
    const currentUserId = await getCurrentUserId();
    const currentOrgId = await getCurrentOrgId();

    if (!currentUserId || !currentOrgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user's internal ID from our users table
    const currentUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.clerkUserId, currentUserId)
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch company details using current authenticated user (same as Settings page)
    const companyData = await db
      .select({
        companyName: companyDetailsTable.companyName,
        legalName: companyDetailsTable.legalName,
        address: companyDetailsTable.address,
        city: companyDetailsTable.city,
        state: companyDetailsTable.state,
        pincode: companyDetailsTable.pincode,
        gst: companyDetailsTable.gst,
        pan: companyDetailsTable.pan,
        email: companyDetailsTable.email,
        phone: companyDetailsTable.phone,
        logoUrl: companyDetailsTable.logoUrl,
      })
      .from(companyDetailsTable)
      .where(and(
        eq(companyDetailsTable.userId, currentUser.id),
        eq(companyDetailsTable.orgId, currentOrgId)
      ))
      .limit(1);

    // Fetch bank details using the bankDetailsId from the invoice
    let bank = {};
    if (invoice.bankDetailsId) {
      const bankData = await db
        .select({
          accountHolderName: bankDetailsTable.accountHolderName,
          bankName: bankDetailsTable.bankName,
          accountNumber: bankDetailsTable.accountNumber,
          ifscCode: bankDetailsTable.ifscCode,
          branchName: bankDetailsTable.branchName,
          upiId: bankDetailsTable.upiId,
        })
        .from(bankDetailsTable)
        .where(eq(bankDetailsTable.id, invoice.bankDetailsId))
        .limit(1);
      bank = bankData[0] || {};
    }

    const company = companyData[0] || {};

    // Format the response
    const response = {
      invoice: {
        ...invoice,
        client,
        items: itemsData,
        company,
        bank,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}
