import { NextResponse } from "next/server";
import { generateRandomAddress } from "@/lib/email";
import type { GenerateEmailResponse } from "@/lib/types";

export async function GET(): Promise<NextResponse<GenerateEmailResponse | { error: string }>> {
  try {
    const address = generateRandomAddress();
    return NextResponse.json({ address });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
