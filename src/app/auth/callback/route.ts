import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? "/";

  const supabase = await createClient();

  // Handle PKCE code exchange (standard OAuth flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (type === "invite" || type === "recovery") {
        return NextResponse.redirect(new URL("/set-password", request.url));
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Handle email OTP tokens (invite, recovery, email change)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (!error) {
      if (type === "invite" || type === "recovery") {
        return NextResponse.redirect(new URL("/set-password", request.url));
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Something went wrong — redirect to login with error
  return NextResponse.redirect(
    new URL("/login?error=link_expired", request.url)
  );
}
