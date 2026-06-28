import { NextRequest, NextResponse } from "next/server";
import { generateRandomAddress, buildAddress, validateUsername, getDomain } from "@/lib/email";
import type { GenerateEmailResponse } from "@/lib/types";


export async function GET(
  request: NextRequest
): Promise<NextResponse<GenerateEmailResponse | { error: string }>> {
  try {
    const username = request.nextUrl.searchParams.get("username");
    let address: string;

    if (username) {
      const err = validateUsername(username);
      if (err) {
        return NextResponse.json({ error: err }, { status: 400 });
      }
      address = buildAddress(username.toLowerCase().trim(), getDomain());
    } else {
      address = generateRandomAddress();
    }

    return NextResponse.json({ address });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
