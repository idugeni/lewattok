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
      return NextResponse.json({ error: "Worker URL not configured" }, { status: 500 });
    }

    const params = new URLSearchParams({ recipient });
    if (since) params.set("since", since);

    const response = await fetch(`${WORKER_URL}/messages?${params}`);
    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json({ error: `Worker error: ${body}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
