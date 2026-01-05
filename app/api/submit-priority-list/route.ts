import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Parse location string to extract latitude and longitude
    // Format: "Lat: 33.5431205, Lng: 73.0989075"
    let latitude = '';
    let longitude = '';

    if (data.location) {
      const latMatch = data.location.match(/Lat:\s*([-\d.]+)/);
      const lngMatch = data.location.match(/Lng:\s*([-\d.]+)/);

      if (latMatch) latitude = latMatch[1];
      if (lngMatch) longitude = lngMatch[1];
    }

    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Append row to "Priority List" sheet (second sheet, index 1)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Priority List!A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.timestamp,
          data.whatsapp_number,
          data.order_type,
          data.quantity,
          data.batch_number,
          data.status,
          data.customer_name || '',
          data.delivery_address || '',
          latitude,
          longitude,
          data.total_amount || 0,
          data.addon || 'Original',
        ]],
      },
    });

    return NextResponse.json({ success: true, message: 'Added to priority list for Batch 02' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Priority list submission error:', error);
    return NextResponse.json({ 
      error: 'Failed to submit to priority list', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
