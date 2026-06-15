import { cookies } from "next/headers";
import {
  ADMIN_SESSION_MAX_AGE,
  ADMIN_TOKEN_COOKIE,
  createAdminSessionToken,
  getAdminAuthConfig,
} from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const adminConfig = getAdminAuthConfig();

    if (!adminConfig) {
      return NextResponse.json(
        {
          success: false,
          message: "Falta configurar las credenciales y la sesión del administrador.",
        },
        { status: 500 },
      );
    }

    if (
      username === adminConfig.username &&
      password === adminConfig.password
    ) {
      const cookieStore = await cookies();
      const sessionToken = await createAdminSessionToken(adminConfig.username);

      cookieStore.set(ADMIN_TOKEN_COOKIE, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: ADMIN_SESSION_MAX_AGE,
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: "Credenciales inválidas" },
      { status: 401 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Error interno" },
      { status: 500 },
    );
  }
}
