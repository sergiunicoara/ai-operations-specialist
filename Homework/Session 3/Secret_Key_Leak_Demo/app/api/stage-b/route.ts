import { NextResponse } from "next/server";
import { checkStatus } from "@/lib/server/mockClient";
import { crossOrigin, rateLimited } from "@/lib/server/guard";

export const dynamic = "force-dynamic"; // evaluated per request, so env changes + restart take effect

// Browser -> this route -> mock API. The browser sends NO credential; the server adds it.
export async function POST(req: Request) {
  if (crossOrigin(req)) return NextResponse.json({ ok: false, message: "Cross-origin request refused." }, { status: 403 });
  if (rateLimited()) return NextResponse.json({ ok: false, message: "Rate limit reached. Try again shortly." }, { status: 429 });

  const result = await checkStatus();
  // 200 on success; 502 when the upstream provider refused or was unreachable.
  return NextResponse.json(result, { status: result.ok ? 200 : 502, headers: { "cache-control": "no-store" } });
}
