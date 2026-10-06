import { NextResponse } from "next/server";
import { providerControl } from "@/lib/server/mockClient";
import { crossOrigin } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

// DEMO-ONLY stand-in for clicking "Rotate" in a provider's dashboard. A real app has no such route.
// It returns labels only: the replacement key is never sent to the browser.
export async function POST(req: Request) {
  if (crossOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });
  const { action } = (await req.json().catch(() => ({}))) as { action?: string };
  if (action !== "rotate" && action !== "reset") return NextResponse.json({ ok: false, message: "Unknown action." }, { status: 400 });
  const result = await providerControl(action);
  return result
    ? NextResponse.json({ ok: true, ...result })
    : NextResponse.json({ ok: false, message: "Mock API unreachable." }, { status: 502 });
}
