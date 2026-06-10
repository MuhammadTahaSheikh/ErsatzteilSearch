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
  if (referer) {
    try {
      const url = new URL(referer);
      return `${url.origin}${url.pathname}`;
    } catch {
      // fall through
    }
  }

  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

/** Prefer the actual incoming request URL so shopurl matches the deployed site. */
export function resolveShopUrl(request: Request): string {
  try {
    const url = new URL(request.url);
    return `${url.origin}${url.pathname}`;
  } catch {
    const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    if (configured && !configured.includes("localhost")) {
      return configured;
    }

    return resolveShopUrlFromHost(
      request.headers.get("host"),
      request.headers.get("referer"),
    );
  }
}
