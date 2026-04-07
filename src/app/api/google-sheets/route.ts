import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchRosterFromSheets } from "@/lib/google-sheets";

export async function GET() {
  // Require authenticated session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.GOOGLE_SHEETS_ID) {
    return NextResponse.json(
      { error: "Google Sheets is not configured. Set GOOGLE_SHEETS_ID in your environment." },
      { status: 503 }
    );
  }

  try {
    const data = await fetchRosterFromSheets();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Google Sheets fetch error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
