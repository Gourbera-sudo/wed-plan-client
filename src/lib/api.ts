/**
 * Browser-side wrapper for the wedplan-server API.
 *
 * Better Auth owns sign-in (session cookie), so before the first call we
 * exchange that cookie for a short-lived API JWT (`POST /api/auth/token`) and
 * attach it as `Authorization: Bearer …`. The token is cached in memory for
 * just under its 1h lifetime and re-exchanged automatically on 401.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Refresh a little before the 1h token expiry. */
const TOKEN_MAX_AGE_MS = 55 * 60 * 1000;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type CachedToken = { token: string; fetchedAt: number };

let cachedToken: CachedToken | null = null;
let inflightExchange: Promise<string | null> | null = null;

async function exchangeSession(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/token`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    return data.token ?? null;
  } catch {
    return null;
  }
}

/** Returns a valid API JWT, or null when there is no active session. */
export async function getApiToken(): Promise<string | null> {
  if (cachedToken && Date.now() - cachedToken.fetchedAt < TOKEN_MAX_AGE_MS) {
    return cachedToken.token;
  }
  if (!inflightExchange) {
    inflightExchange = exchangeSession().then((token) => {
      cachedToken = token ? { token, fetchedAt: Date.now() } : null;
      inflightExchange = null;
      return token;
    });
  }
  return inflightExchange;
}

/** Drops the cached JWT — call after sign-out or an unrecoverable 401. */
export function clearApiToken() {
  cachedToken = null;
  inflightExchange = null;
}

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** JSON-serializable body; omitted for GET. */
  body?: unknown;
  /** Set false for endpoints that must run without a token. */
  auth?: boolean;
  signal?: AbortSignal;
};

/**
 * Calls the API and returns the parsed JSON body.
 * Throws {@link ApiError} with the server's `{ error }` message on failure.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, signal } = options;

  const send = async (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let token = auth ? await getApiToken() : null;
  let res = await send(token);

  // Expired/invalid JWT: exchange the session once more and retry.
  if (res.status === 401 && auth) {
    clearApiToken();
    token = await getApiToken();
    if (token) res = await send(token);
  }

  const payload = (await res.json().catch(() => null)) as {
    error?: string;
  } | null;

  if (!res.ok) {
    if (res.status === 401) clearApiToken();
    throw new ApiError(
      res.status,
      payload?.error ?? "Something went wrong. Please try again.",
    );
  }

  return payload as T;
}
