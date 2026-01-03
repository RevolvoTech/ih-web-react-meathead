import { Handler, HandlerResponse } from '@netlify/functions';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const handler: Handler = async (): Promise<HandlerResponse> => {
  try {
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

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const batch01Orders = rows.filter(
      (row: any) => row.get('batch_number') === '01' && row.get('status') !== 'cancelled'
    );

    const totalOrders = batch01Orders.length;
    const slotsRemaining = Math.max(0, 50 - totalOrders);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        totalOrders,
        slotsRemaining,
        isSoldOut: slotsRemaining === 0,
      }),
    };
  } catch (error) {
    console.error('Error fetching order count:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to fetch order count' }),
    };
  }
};
