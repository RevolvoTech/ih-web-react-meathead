import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function GET() {
  try {
    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get all rows from Orders sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Orders!A:F',
    });

    const rows = response.data.values || [];

    // Filter for Twin City launch waitlist entries
    // Row structure: timestamp, whatsapp, order_type, quantity, batch_number, status
    const waitlistEntries = rows.slice(1).filter((row) => {
      const batchNumber = row[4]; // Column E (batch_number)
      const status = row[5]; // Column F (status)
      return batchNumber === 'TWIN_CITY_LAUNCH' && status === 'launch_waitlist';
    });

    const waitlistCount = waitlistEntries.length;

    return NextResponse.json({
      waitlistCount,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Error fetching launch waitlist count:', error);
    return NextResponse.json({
      error: 'Failed to fetch launch waitlist count',
      waitlistCount: 0,
    }, { status: 500 });
  }
}
