





import { NextRequest } from 'next/server';

// Simple redirect approach - the client-side PDF generation will handle the actual PDF creation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Redirect to the invoice page with a special query parameter to trigger PDF generation
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': `${baseUrl}/invoices/${id}?generatePdf=true`,
    },
  });
}
