import { NextResponse } from "next/server";
import { providerState } from "@/lib/server/mockClient";
import { configuredKeyLabel } from "@/lib/server/credentials";
import type { DemoState } from "@/lib/types";

export const dynamic = "force-dynamic";

// Labels only ("Demo key A"). No credential values.
export async function GET() {
  const body: DemoState = { provider: await providerState(), app: { configuredKeyLabel: configuredKeyLabel() } };
  return NextResponse.json(body, { headers: { "cache-control": "no-store" } });
}
