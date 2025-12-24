import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invoicesTable, invoiceItemsTable, clientsTable, companyDetailsTable, bankDetailsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';

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

    // Fetch company details
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
      })
      .from(companyDetailsTable)
      .where(eq(companyDetailsTable.userId, invoice.userId))
      .limit(1);

    // Fetch bank details
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
      .where(eq(bankDetailsTable.userId, invoice.userId))
      .limit(1);

    const company = companyData[0] || {};
    const bank = bankData[0] || {};

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
