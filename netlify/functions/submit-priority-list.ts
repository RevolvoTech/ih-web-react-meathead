import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { whatsappNumber } = JSON.parse(event.body || '{}');

    if (!whatsappNumber || !/^92\d{10}$/.test(whatsappNumber)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid WhatsApp number format (use 923XXXXXXXXX)' }),
      };
    }

    const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;

    if (!PRIVATE_KEY || !CLIENT_EMAIL || !SHEET_ID) {
      throw new Error('Missing Google Sheets credentials');
    }

    const serviceAccountAuth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[1]; // Priority list on second sheet

    // Check if number already exists
    const rows = await sheet.getRows();
    const exists = rows.some((row: any) => row.get('whatsapp_number') === whatsappNumber);

    if (exists) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'This number is already on the priority list' }),
      };
    }

    // Add to priority list
    await sheet.addRow({
      timestamp: new Date().toISOString(),
      whatsapp_number: whatsappNumber,
      batch_number: '02',
      status: 'priority_list',
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Added to priority list for Batch 02',
      }),
    };
  } catch (error) {
    console.error('Error submitting to priority list:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to submit to priority list' }),
    };
  }
};
