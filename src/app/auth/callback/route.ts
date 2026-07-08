import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function safeRedirectPath(raw: string | null): string {
  // Only allow same-site, relative paths — reject absolute/protocol-relative
  // URLs (e.g. "https://evil.com" or "//evil.com") to prevent this becoming
  // an open redirect that phishing links could piggyback on.
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
