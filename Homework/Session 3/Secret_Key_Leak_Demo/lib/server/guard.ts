import "server-only";

// Minimal route protections. Hiding the credential does NOT protect the route itself:
// anyone who can reach /api/stage-b can make this server spend its credential.
// These two checks illustrate the idea; a real app also needs authentication and per-user limits.

const windowMs = 60_000;
let hits: number[] = [];

export function rateLimited(): boolean {
  const limit = Number(process.env.DEMO_ROUTE_RATE_LIMIT_PER_MIN ?? 30);
  const now = Date.now();
  hits = hits.filter((t) => now - t < windowMs);
  if (hits.length >= limit) return true;
  hits.push(now);
  return false;
}

/**
 * Rejects browser requests made from another website. Honest limits: this stops cross-site browser abuse
 * (CSRF-style); it does nothing against a script that forges headers, which is why rate limits,
 * a fixed read-only operation, a least-privilege key and real authentication still matter.
 */
export function crossOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== req.headers.get("host");
  } catch {
    return true;
  }
}
