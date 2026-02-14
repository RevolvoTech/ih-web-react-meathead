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
      range: 'Orders!A:G',
    });

    const rows = response.data.values || [];

    // Filter for Twin City launch waitlist entries
    // Row structure: timestamp, whatsapp, order_type, quantity, batch_number, status, customer_name
    const waitlistEntries = rows.slice(1).filter((row) => {
      const orderType = row[2]; // Column C (order_type)
      const status = row[5]; // Column F (status)
      return orderType === 'WAITLIST' && status === 'launch_waitlist';
    });

    // Get last 10 entries and reverse to show most recent first
    const recentEntries = waitlistEntries
      .slice(-10)
      .reverse()
      .map((row) => ({
        name: row[6] && row[6] !== 'Not provided' ? row[6] : 'Anonymous',
        timestamp: row[0],
      }));

    return NextResponse.json({
      recentEntries,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Error fetching recent waitlist entries:', error);
    return NextResponse.json({
      error: 'Failed to fetch recent waitlist entries',
      recentEntries: [],
    }, { status: 500 });
  }
}
