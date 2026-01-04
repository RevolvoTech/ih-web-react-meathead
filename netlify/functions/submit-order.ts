import { Handler } from '@netlify/functions';
import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');

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

    // Append row to "Orders" sheet
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
          longitude,
          latitude,
          data.total_amount || 0,
          data.addon || 'Original',
        ]],
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true, message: 'Order submitted successfully' }),
    };
  } catch (error) {
    console.error('Order submission error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Failed to submit order', details: error instanceof Error ? error.message : 'Unknown error' }),
    };
  }
};
