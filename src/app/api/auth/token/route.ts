import { createHmac } from "node:crypto";

import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/auth-guards";

/** Mirrors the server's HS256 API token so browser calls work across domains. */
function signApiToken(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      iat: now,
      exp: now + 60 * 60,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

/**
 * Same-origin token exchange. The Better Auth cookie lives on the client
 * domain, so the browser cannot forward it to a separately hosted Express API.
 * This route reads that cookie and returns a JWT the API verifies with the
 * shared JWT_SECRET.
 */
export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No active session." }, { status: 401 });
  }

  try {
    return NextResponse.json({
      token: signApiToken(user),
      role: user.role,
    });
  } catch {
    return NextResponse.json(
      { error: "API token signing is not configured." },
      { status: 503 },
    );
  }
}
