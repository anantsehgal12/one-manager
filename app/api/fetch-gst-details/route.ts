import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { gst } = await request.json()

    if (!gst) {
      return NextResponse.json({ error: 'GST number is required' }, { status: 400 })
    }

    // Validate GST number format (15 digits: 2 state code + 10 PAN + 1 entity code + 2 checksum)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gst)) {
      return NextResponse.json({ error: 'Invalid GST number format' }, { status: 400 })
    }

    const url = `https://gst-insights-api.p.rapidapi.com/getGSTDetailsUsingGST/${gst}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'gst-insights-api.p.rapidapi.com',
        'x-rapidapi-key': '2ac93a96c4msh2f6d8518ecb9a0ap1f6ec4jsnc85fde4a1731'
      }
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      return NextResponse.json({ error: 'GST details not found' }, { status: 404 })
    }

    const gstData = data.data[0];
    const addressParts = [
      gstData.principalAddress.address.buildingNumber,
      gstData.principalAddress.address.floorNumber,
      gstData.principalAddress.address.buildingName,
      gstData.principalAddress.address.street,
      gstData.principalAddress.address.location,
      gstData.principalAddress.address.locality,
      gstData.principalAddress.address.landMark,
    ].filter(part => part && typeof part === 'string' && part.trim() !== '');

    const result = {
      companyName: gstData.tradeName || gstData.legalName,
      billingMainAddress: addressParts.join(', '),
      city: gstData.principalAddress.address.district || '',
      state: gstData.principalAddress.address.stateCode || '',
      pincode: gstData.principalAddress.address.pincode || '',
      gst: gstData.gstNumber,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching GST details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
