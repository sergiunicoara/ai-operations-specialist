import "server-only";
import { configuredKeyLabel, getMockApiKey, getMockApiUrl } from "./credentials";
import type { RunResult } from "../types";

/**
 * The one operation the browser may trigger: a fixed, read-only status check.
 * The browser supplies no parameters, and the credential is added here, on the server.
 * The returned object is a safe DTO: it is built field by field and never echoes headers or the key.
 */
export async function checkStatus(): Promise<RunResult> {
  const base = { configuredKeyLabel: configuredKeyLabel() };
  const key = getMockApiKey();
  try {
    const res = await fetch(`${getMockApiUrl()}/v1/status`, {
      headers: key ? { "x-demo-api-key": key } : {},
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    // Log status only. Never log headers, the key, or the raw upstream body.
    console.info(`[stage-b] mock API answered ${res.status}`);
    if (res.ok) {
      return {
        ...base,
        ok: true,
        upstreamStatus: res.status,
        providerKeyLabel: typeof body.keyLabel === "string" ? body.keyLabel : undefined,
        message: "Success: the mock API accepted this server's credential.",
      };
    }
    const reason = typeof body.error === "string" ? body.error : "rejected";
    return {
      ...base,
      ok: false,
      upstreamStatus: res.status,
      reason,
      providerKeyLabel: typeof body.keyLabel === "string" ? body.keyLabel : undefined,
      message:
        reason === "revoked_key"
          ? "Rejected: the provider has revoked the key this server is still using."
          : "Rejected: the provider did not accept this server's credential.",
    };
  } catch {
    console.info("[stage-b] mock API unreachable");
    return { ...base, ok: false, upstreamStatus: 0, reason: "unreachable", message: "The mock API is unreachable. Is `npm run mock` running?" };
  }
}

/** Demo-only provider controls (stand-in for the provider's dashboard). Drops the new key from the result. */
export async function providerControl(action: "rotate" | "reset"): Promise<{ revokedLabel?: string; issuedLabel?: string; activeKeyLabel?: string } | null> {
  try {
    const res = await fetch(`${getMockApiUrl()}/admin/${action}`, { method: "POST", cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const b = (await res.json()) as Record<string, string>;
    return { revokedLabel: b.revokedLabel, issuedLabel: b.issuedLabel, activeKeyLabel: b.activeKeyLabel }; // b.newKey / b.key intentionally dropped
  } catch {
    return null;
  }
}

export async function providerState() {
  try {
    const res = await fetch(`${getMockApiUrl()}/admin/state`, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const b = (await res.json()) as { activeKeyLabel: string; revokedKeyLabels: string[] };
    return { activeKeyLabel: b.activeKeyLabel, revokedKeyLabels: b.revokedKeyLabels };
  } catch {
    return null;
  }
}
