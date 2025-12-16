import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { pincode } = await request.json()

    if (!pincode || pincode.length !== 6) {
      return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 })
    }

    const url = `https://india-pincode-api.p.rapidapi.com/v1/in/places/pincode?pincode=${pincode}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'india-pincode-api.p.rapidapi.com',
        'x-rapidapi-key': '2ac93a96c4msh2f6d8518ecb9a0ap1f6ec4jsnc85fde4a1731'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch pincode details' }, { status: response.status })
    }

    const data = await response.json()

    if (data.status !== 200 || !data.result || data.result.length === 0) {
      return NextResponse.json({ error: data.message || 'Pincode not found' }, { status: 404 })
    }

    const place = data.result[0]
    const details = {
      city: place.districtname,
      state: place.statename,
      district: place.districtname,
      taluk: place.taluk,
      latitude: place.latitude,
      longitude: place.longitude,
      accuracy: place.accuracy
    }

    return NextResponse.json(details)
  } catch (error) {
    console.error('Error fetching pincode details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
