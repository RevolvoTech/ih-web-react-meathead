import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.clone();
  targetUrl.pathname = "/";
  targetUrl.search = "";

  const emptyKeyCode = request.nextUrl.searchParams.get("")?.trim();
  const refParamCode = request.nextUrl.searchParams.get("ref")?.trim();

  let referralCode = emptyKeyCode || refParamCode || "";

  // Support /ref?CODE as a fallback input format
  if (!referralCode) {
    const rawSearch = request.nextUrl.search.replace(/^\?/, "").trim();
    if (rawSearch && !rawSearch.includes("=")) {
      referralCode = rawSearch;
    }
  }

  if (referralCode) {
    targetUrl.searchParams.set("ref", referralCode);
  }

  return NextResponse.redirect(targetUrl, 307);
}
