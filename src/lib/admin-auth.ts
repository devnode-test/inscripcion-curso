const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const ADMIN_TOKEN_COOKIE = "admin_token";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24;

type AdminAuthConfig = {
  username: string;
  password: string;
  sessionSecret: string;
};

type AdminSessionPayload = {
  sub: string;
  exp: number;
};

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

async function importSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export function getAdminAuthConfig(): AdminAuthConfig | null {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_SESSION_SECRET) {
    return null;
  }

  return {
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    sessionSecret: ADMIN_SESSION_SECRET,
  };
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return bytesToBase64Url(new Uint8Array(signature));
}

/**
 * Documenta y centraliza la sesión admin para evitar cookies triviales o sin validar.
 */
export async function createAdminSessionToken(username: string): Promise<string> {
  const config = getAdminAuthConfig();

  if (!config) {
    throw new Error("Falta configurar ADMIN_USERNAME, ADMIN_PASSWORD y ADMIN_SESSION_SECRET.");
  }

  const payload: AdminSessionPayload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
  };
  const payloadPart = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signaturePart = await signPayload(payloadPart, config.sessionSecret);

  return `${payloadPart}.${signaturePart}`;
}

export async function hasValidAdminToken(token: string | null | undefined): Promise<boolean> {
  const config = getAdminAuthConfig();

  if (!config || !token) {
    return false;
  }

  const [payloadPart, signaturePart] = token.split(".");

  if (!payloadPart || !signaturePart) {
    return false;
  }

  try {
    const key = await importSigningKey(config.sessionSecret);
    const signatureBytes = new Uint8Array(base64UrlToBytes(signaturePart));
    const isSignatureValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(payloadPart),
    );

    if (!isSignatureValid) {
      return false;
    }

    const payload = JSON.parse(
      decoder.decode(base64UrlToBytes(payloadPart)),
    ) as AdminSessionPayload;

    return payload.sub === config.username && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
