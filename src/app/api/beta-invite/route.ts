import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Called by the beta-signup Google Apps Script on every form submission.
// Authenticated with a narrow shared secret (BETA_INVITE_SECRET) — never the
// Supabase service_role key itself, which stays server-side only. The secret
// can only trigger an invite email here; it can't touch the database.
export async function POST(request: Request) {
  const secret = request.headers.get("x-beta-invite-secret");
  if (!secret || secret !== process.env.BETA_INVITE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://calisthenics-skill-tracker.vercel.app";

  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { display_name: typeof name === "string" ? name : null },
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
