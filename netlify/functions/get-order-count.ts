import { Handler } from '@netlify/functions';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
const TOTAL_SLOTS = 50;

export const handler: Handler = async (event) => {
  // Allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=10',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

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
      range: 'Orders!A:F', // Get columns A-F (up to status column)
    });

    const rows = response.data.values || [];

    // Filter for BATCH 01 orders that aren't cancelled
    // Row structure: timestamp, whatsapp, order_type, quantity, batch_number, status
    const batch01Orders = rows.slice(1).filter((row) => {
      const batchNumber = row[4]; // Column E (batch_number)
      const status = row[5]; // Column F (status)
      return batchNumber === 'BATCH 01' && status !== 'cancelled';
    });

    const totalOrders = batch01Orders.length;
    const slotsRemaining = Math.max(0, TOTAL_SLOTS - totalOrders);
    const isSoldOut = slotsRemaining === 0;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=10', // Cache for 10 seconds
      },
      body: JSON.stringify({
        totalOrders,
        slotsRemaining,
        isSoldOut,
        totalSlots: TOTAL_SLOTS,
      }),
    };
  } catch (error) {
    console.error('Error fetching order count:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=10',
      },
      body: JSON.stringify({
        error: 'Failed to fetch order count',
        // Return fallback data
        totalOrders: 0,
        slotsRemaining: TOTAL_SLOTS,
        isSoldOut: false,
        totalSlots: TOTAL_SLOTS,
      }),
    };
  }
};
