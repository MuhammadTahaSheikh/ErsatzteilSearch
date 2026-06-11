import { cookies } from "next/headers";

export const SESSION_COOKIE = "eed_session_id";

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionId(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 3,
    path: "/",
  });
}

export function resolveShopUrlFromHost(host: string | null, referer?: string | null): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    const requestOrigin = `${protocol}://${host}`;

    // Ignore localhost env on deployed servers — EED requires the real shop URL.
    if (!configured || configured.includes("localhost")) {
      return requestOrigin;
    }
  }

  if (configured) return configured;

  if (referer) {
    try {
      const url = new URL(referer);
      return `${url.origin}${url.pathname}`;
    } catch {
      // fall through
    }
  }

  return "http://localhost:3000";
}

export function resolveShopUrl(request: Request): string {
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      if (!url.pathname.startsWith("/api/")) {
        return `${url.origin}${url.pathname}`;
      }
    } catch {
      // fall through
    }
  }

  const base = resolveShopUrlFromHost(
    request.headers.get("host"),
    referer,
  );

  return base.endsWith("/") ? base : `${base}/`;
}
