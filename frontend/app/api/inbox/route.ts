import { NextRequest, NextResponse } from "next/server";
import { generateRandomAddress, buildAddress, validateUsername, getDomain } from "@/lib/email";
import type { InboxInfo } from "@/lib/types";

const WORKER_URL = process.env.WORKER_URL || process.env.NEXT_PUBLIC_WORKER_URL;
const INBOX_TTL_SECONDS = 15 * 60;

export async function POST(
  request: NextRequest
): Promise<NextResponse<InboxInfo | { error: string }>> {
  try {
    const body = await request.json().catch(() => ({})) as { username?: string };
    const domain = getDomain();
    let address: string;

    if (body.username) {
      const err = validateUsername(body.username);
      if (err) {
        return NextResponse.json({ error: err }, { status: 400 });
      }
      address = buildAddress(body.username.toLowerCase().trim(), domain);
    } else {
      address = generateRandomAddress();
    }

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + INBOX_TTL_SECONDS * 1000).toISOString();

    // If worker is available, create inbox there too
    if (WORKER_URL) {
      try {
        const workerResp = await fetch(`${WORKER_URL}/api/inbox`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: body.username }),
        });
        if (workerResp.ok) {
          const data = await workerResp.json();
          return NextResponse.json(data);
        }
      } catch {
        // Worker not available, return local response
      }
    }

    return NextResponse.json({ address, created_at: now, expires_at: expiresAt });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ deleted: string } | { error: string }>> {
  try {
    const recipient = request.nextUrl.searchParams.get("recipient");

    if (!recipient) {
      return NextResponse.json({ error: "Missing recipient parameter" }, { status: 400 });
    }

    if (WORKER_URL) {
      try {
        const params = new URLSearchParams({ recipient });
        const workerResp = await fetch(`${WORKER_URL}/api/inbox?${params}`, { method: "DELETE" });
        if (workerResp.ok) {
          const data = await workerResp.json();
          return NextResponse.json(data);
        }
      } catch {
        // Worker not available
      }
    }

    return NextResponse.json({ deleted: recipient });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
