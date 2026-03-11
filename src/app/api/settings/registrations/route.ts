import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SETTINGS_EMAIL = "__settings__registrations@system.local";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("teachers")
    .select("is_active")
    .eq("email", SETTINGS_EMAIL)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { registrations_open: false },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { registrations_open: data?.is_active ?? true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
