import { NextRequest, NextResponse } from "next/server";
import type { EmailMessage } from "@/lib/types";

const WORKER_URL = process.env.WORKER_URL || process.env.NEXT_PUBLIC_WORKER_URL;

export async function GET(
  request: NextRequest
): Promise<NextResponse<{ messages: EmailMessage[] } | { error: string }>> {
  try {
    const recipient = request.nextUrl.searchParams.get("recipient");
    const since = request.nextUrl.searchParams.get("since");

    if (!recipient) {
      return NextResponse.json({ error: "Missing recipient parameter" }, { status: 400 });
    }

    if (!WORKER_URL) {
      return NextResponse.json(
        { messages: [] },
        { headers: { "X-Aurelion-Warning": "WORKER_URL not configured" } }
      );
    }

    const params = new URLSearchParams({ recipient });
    if (since) params.set("since", since);

    const response = await fetch(`${WORKER_URL}/messages?${params}`);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
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

    if (!WORKER_URL) {
      return NextResponse.json(
        { deleted: recipient },
        { headers: { "X-Aurelion-Warning": "WORKER_URL not configured" } }
      );
    }

    const params = new URLSearchParams({ recipient });
    const response = await fetch(`${WORKER_URL}/messages?${params}`, { method: "DELETE" });
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to delete inbox" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
