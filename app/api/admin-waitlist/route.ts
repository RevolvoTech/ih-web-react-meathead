import { NextResponse } from "next/server";
import { google } from "googleapis";
import { normalizePakistaniPhone } from "@/lib/referral";

export const dynamic = "force-dynamic";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
const API_BASE = (process.env.NEXT_PUBLIC_MEATHEAD_API_URL ?? "https://api.revolvo.tech/meathead").replace(/\/$/, "");
const stages = new Set(["NEW", "CONTACTED", "INTERESTED", "PILOT_OFFERED", "PAID", "NOT_INTERESTED"]);

async function authorizeAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization) return false;
  const response = await fetch(`${API_BASE}/v1/me`, { headers: { authorization }, cache: "no-store" });
  if (!response.ok) return false;
  const payload = await response.json() as { data?: { role?: string } };
  return payload.data?.role === "ADMIN";
}

async function sheetsClient(readonly = false) {
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: CLIENT_EMAIL, private_key: PRIVATE_KEY },
    scopes: [readonly ? "https://www.googleapis.com/auth/spreadsheets.readonly" : "https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function GET(request: Request) {
  try {
    if (!await authorizeAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const sheets = await sheetsClient(true);
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Orders!A:S" });
    const rows = response.data.values ?? [];
    const leads = rows.slice(1).flatMap((row, index) => {
      if (row[2] !== "WAITLIST" || row[5] !== "launch_waitlist") return [];
      return [{
        id: `sheet-${index + 2}`,
        timestamp: row[0] ?? "",
        phone: row[1] ?? "",
        name: row[6] && row[6] !== "Not provided" ? row[6] : "Anonymous",
        area: row[7] ?? "Other",
        referralCount: Number.parseInt(row[13] ?? "0", 10) || 0,
        stage: stages.has(row[15]) ? row[15] : "NEW",
        preferredPlan: row[16] ?? "",
        readyToStart: row[17] === "YES",
        notes: row[18] ?? "",
      }];
    }).reverse();
    return NextResponse.json({ leads }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load waitlist" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!await authorizeAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json() as { phone?: string; stage?: string; preferredPlan?: string; readyToStart?: boolean; notes?: string };
    const phone = normalizePakistaniPhone(body.phone ?? "");
    if (!phone || !body.stage || !stages.has(body.stage)) {
      return NextResponse.json({ error: "A valid lead and stage are required" }, { status: 400 });
    }
    const sheets = await sheetsClient(false);
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "Orders!A:S" });
    const rows = response.data.values ?? [];
    const rowIndex = rows.slice(1).findIndex((row) =>
      row[2] === "WAITLIST" && row[5] === "launch_waitlist" && normalizePakistaniPhone(row[1] ?? "") === phone,
    );
    if (rowIndex < 0) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const sheetRow = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Orders!P${sheetRow}:S${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[body.stage, body.preferredPlan ?? "", body.readyToStart ? "YES" : "NO", body.notes ?? ""]] },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update waitlist" }, { status: 500 });
  }
}
