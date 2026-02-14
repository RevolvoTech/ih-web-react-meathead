import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

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

    // First, get current count to determine next batch number
    const existingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Orders!A:F',
    });

    const existingRows = existingResponse.data.values || [];

    // Filter for Twin City launch waitlist entries (numeric batch_number)
    const existingWaitlistEntries = existingRows.slice(1).filter((row) => {
      const orderType = row[2]; // Column C (order_type)
      const status = row[5]; // Column F (status)
      return orderType === 'WAITLIST' && status === 'launch_waitlist';
    });

    const nextBatchNumber = existingWaitlistEntries.length + 1;

    // Append row to "Orders" sheet using existing columns
    // Using: whatsapp_number, customer_name, delivery_address (for area)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Orders!A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.timestamp,           // Column A: timestamp
          data.whatsapp_number,     // Column B: whatsapp_number
          'WAITLIST',               // Column C: order_type (using as marker)
          1,                        // Column D: quantity
          nextBatchNumber,          // Column E: batch_number (auto-incrementing number)
          'launch_waitlist',        // Column F: status
          data.customer_name || 'Not provided', // Column G: customer_name
          data.area,                // Column H: delivery_address (storing area here)
          '',                       // Column I: latitude (empty for waitlist)
          '',                       // Column J: longitude (empty for waitlist)
          0,                        // Column K: total_amount (0 for waitlist)
          'N/A',                    // Column L: addon (N/A for waitlist)
        ]],
      },
    });

    const waitlistCount = nextBatchNumber;

    return NextResponse.json({
      success: true,
      message: 'Added to launch waitlist',
      waitlistCount,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Launch waitlist submission error:', error);
    return NextResponse.json({
      error: 'Failed to submit to launch waitlist',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
