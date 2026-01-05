import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
const TOTAL_SLOTS = 50;

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Check current order count before appending
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Orders!A:F', // Get columns A-F (up to status column)
    });

    const rows = response.data.values || [];
    
    // Filter for BATCH 01 orders that aren't cancelled
    const batch01Orders = rows.slice(1).filter((row) => {
      const batchNumber = row[4]; 
      const status = row[5]; 
      return batchNumber === 'BATCH 01' && status !== 'cancelled';
    });

    if (batch01Orders.length >= TOTAL_SLOTS) {
      return NextResponse.json({ 
        error: 'SOLD_OUT', 
        message: 'Batch 01 is fully booked. Please join the priority list.' 
      }, { status: 409 });
    }

    // 2. Parse location string
    let latitude = '';
    let longitude = '';

    if (data.location) {
      const latMatch = data.location.match(/Lat:\s*([-\d.]+)/);
      const lngMatch = data.location.match(/Lng:\s*([-\d.]+)/);

      if (latMatch) latitude = latMatch[1];
      if (lngMatch) longitude = lngMatch[1];
    }

    // 3. Append row to "Orders" sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Orders!A:L',
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

    return NextResponse.json({ success: true, message: 'Order submitted successfully' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Order submission error:', error);
    return NextResponse.json({ 
      error: 'Failed to submit order', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
