import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SETTINGS_EMAIL = "__settings__registrations@system.local";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("teachers")
    .select("is_active")
    .eq("email", SETTINGS_EMAIL)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: "Error fetching settings" }, { status: 500 });
  }

  return NextResponse.json({ registrations_open: data?.is_active ?? true });
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { registrations_open } = body as { registrations_open: boolean };

  if (typeof registrations_open !== "boolean") {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  // Persist settings using a sentinel row in teachers table (no migration required)
  const { error: upsertError } = await supabaseAdmin
    .from("teachers")
    .upsert(
      {
        email: SETTINGS_EMAIL,
        name: "SYSTEM_REGISTRATION_SETTING",
        is_active: registrations_open,
      },
      { onConflict: "email" },
    );

  if (upsertError) {
    console.error("Settings update error:", upsertError);
    return NextResponse.json({ message: "Error updating settings" }, { status: 500 });
  }

  return NextResponse.json({ registrations_open });
}
