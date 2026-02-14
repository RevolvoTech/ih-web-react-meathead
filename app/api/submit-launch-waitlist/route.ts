import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import {
  formatPakistaniPhoneForStorage,
  getDeterministicReferralCode,
  normalizePakistaniPhone,
} from '@/lib/referral';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
const REFERRAL_CODE_EXACT_PATTERN = /^MEAT[A-Z0-9]{7}$/i;
const REFERRAL_CODE_TOKEN_PATTERN = /\bMEAT[A-Z0-9]{7}\b/i;

function toValidReferralCode(value: string): string {
  const candidate = (value || '').trim().toUpperCase();
  if (!candidate) return '';
  return REFERRAL_CODE_EXACT_PATTERN.test(candidate) ? candidate : '';
}

function extractReferralCode(input: string): string {
  const raw = (input || '').trim();
  if (!raw) return '';

  try {
    const parsedUrl = new URL(raw);
    const fromUrlParams = toValidReferralCode(
      parsedUrl.searchParams.get('ref') || parsedUrl.searchParams.get('') || ''
    );
    if (fromUrlParams) return fromUrlParams;

    // URL provided but it doesn't contain a valid referral code.
    return '';
  } catch {
    // Not a full URL string, continue with other parsing strategies.
  }

  if (raw.includes('?')) {
    const search = raw.slice(raw.indexOf('?') + 1);
    const searchParams = new URLSearchParams(search);
    const fromSearchParams = toValidReferralCode(
      searchParams.get('ref') || searchParams.get('') || ''
    );
    if (fromSearchParams) return fromSearchParams;
  }

  const rawParams = new URLSearchParams(raw);
  const fromRawParams = toValidReferralCode(
    rawParams.get('ref') || rawParams.get('') || ''
  );
  if (fromRawParams) return fromRawParams;

  const exactCode = toValidReferralCode(raw);
  if (exactCode) return exactCode;

  const tokenMatch = raw.match(REFERRAL_CODE_TOKEN_PATTERN);
  if (tokenMatch?.[0]) return tokenMatch[0].toUpperCase();

  return '';
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const incomingPhone = normalizePakistaniPhone(data.whatsapp_number || '');
    const ownReferralCode = getDeterministicReferralCode(incomingPhone);

    if (!incomingPhone) {
      return NextResponse.json(
        { error: 'Invalid WhatsApp number format' },
        { status: 400 }
      );
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

    // First, get current data to check for duplicates and determine next batch number
    const existingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Orders!A:O', // Includes own_referral_code, referred_count, and referred_by_code
    });

    const existingRows = existingResponse.data.values || [];

    // Filter for Twin City launch waitlist entries
    const existingWaitlistEntries = existingRows.slice(1).filter((row) => {
      const orderType = row[2]; // Column C (order_type)
      const status = row[5]; // Column F (status)
      return orderType === 'WAITLIST' && status === 'launch_waitlist';
    });

    // Check if phone number already exists in waitlist
    const duplicateEntry = existingWaitlistEntries.find((row) => {
      const existingPhone = normalizePakistaniPhone(row[1] || ''); // Column B (whatsapp_number)
      return existingPhone === incomingPhone;
    });

    // If duplicate found, return existing position without creating new entry
    if (duplicateEntry) {
      const existingPosition = duplicateEntry[4]; // Column E (batch_number)
      return NextResponse.json({
        success: true,
        message: "You're already registered. Here's your referral link.",
        waitlistCount: existingPosition,
        isDuplicate: true,
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const nextBatchNumber = existingWaitlistEntries.length + 1;
    const bodyReferralCode = extractReferralCode(data.referral_code || '');
    const refererReferralCode = extractReferralCode(request.headers.get('referer') || '');
    const submittedReferralCode = bodyReferralCode || refererReferralCode;

    // If a valid referral code was used, increment referred_count for that referrer's row.
    if (submittedReferralCode) {
      const referrerIndex = existingRows.slice(1).findIndex((row) => {
        const orderType = row[2]; // Column C
        const status = row[5]; // Column F
        if (orderType !== 'WAITLIST' || status !== 'launch_waitlist') return false;

        const referrerPhone = normalizePakistaniPhone(row[1] || '');
        if (!referrerPhone || referrerPhone === incomingPhone) return false;

        const calculatedOwnReferralCode = getDeterministicReferralCode(referrerPhone);
        return calculatedOwnReferralCode === submittedReferralCode;
      });

      if (referrerIndex >= 0) {
        const sheetRowNumber = referrerIndex + 2; // +1 header row +1 index base
        const existingRefCountRaw = existingRows[sheetRowNumber - 1]?.[13] || '0'; // Column N
        const existingRefCount = Number.parseInt(existingRefCountRaw, 10) || 0;
        const nextRefCount = existingRefCount + 1;

        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Orders!N${sheetRowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[nextRefCount]],
          },
        });
      }
    }

    // Append row to "Orders" sheet using existing columns
    // Using: whatsapp_number, customer_name, delivery_address (for area)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Orders!A:O',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.timestamp,           // Column A: timestamp
          formatPakistaniPhoneForStorage(data.whatsapp_number) || data.whatsapp_number, // Column B: whatsapp_number
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
          ownReferralCode,          // Column M: own_referral_code for this row
          0,                        // Column N: referred_count for this row starts at 0
          submittedReferralCode,    // Column O: referred_by_code used for this signup
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
