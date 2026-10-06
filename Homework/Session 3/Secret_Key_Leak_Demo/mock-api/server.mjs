// Local MOCK provider API for the secret-key-leak demo. Educational only.
// Zero dependencies. Binds to 127.0.0.1. Credentials are fake and mean nothing anywhere else.
// State is in memory: restarting this process (or POST /admin/reset) restores "Demo key A".
import http from "node:http";
import { fileURLToPath } from "node:url";

export const PUBLIC_VALUE = "DEMO_ONLY_PUBLIC_VALUE_NOT_A_REAL_CREDENTIAL";
export const keyFor = (generation) =>
  `DEMO_KEY_${String.fromCharCode(65 + generation)}_FAKE_MOCK_ONLY_NOT_A_REAL_CREDENTIAL`;
export const labelFor = (generation) => `Demo key ${String.fromCharCode(65 + generation)}`;

const ALLOWED_ORIGINS = new Set(["http://127.0.0.1:3000", "http://localhost:3000"]);

export function createMockApi() {
  let generation = 0; // active key = keyFor(generation); every lower generation is revoked
  const log = (m) => console.log(`[mock-api] ${m}`); // never logs credential values

  const classify = (presented) => {
    if (!presented) return { ok: false, code: "missing_key" };
    for (let g = 0; g <= generation; g++) {
      if (presented === keyFor(g)) {
        return g === generation
          ? { ok: true, label: labelFor(g), scope: "status:read" }
          : { ok: false, code: "revoked_key", label: labelFor(g) };
      }
    }
    return { ok: false, code: "invalid_key" };
  };

  return http.createServer((req, res) => {
    const origin = req.headers.origin;
    const url = new URL(req.url, "http://127.0.0.1");
    const send = (status, body, extra = {}) => {
      const headers = { "content-type": "application/json", "cache-control": "no-store", ...extra };
      // CORS only for the public tier: browsers may call it, nothing else is readable cross-origin.
      if (origin && ALLOWED_ORIGINS.has(origin) && url.pathname === "/v1/public-ping") {
        headers["access-control-allow-origin"] = origin;
        headers["vary"] = "Origin";
      }
      res.writeHead(status, headers);
      res.end(status === 204 ? undefined : JSON.stringify(body));
    };

    if (req.method === "OPTIONS" && url.pathname === "/v1/public-ping") {
      return send(204, {}, { "access-control-allow-headers": "x-demo-public-key", "access-control-allow-methods": "GET" });
    }
    if (req.method === "GET" && url.pathname === "/health") return send(200, { ok: true, service: "mock-api" });

    // --- Public tier: the value shipped to browsers. Only unlocks harmless data. ---
    if (req.method === "GET" && url.pathname === "/v1/public-ping") {
      const ok = req.headers["x-demo-public-key"] === PUBLIC_VALUE;
      log(`public-ping -> ${ok ? 200 : 401}`);
      return ok
        ? send(200, { ok: true, message: "Public tier accepted the browser-delivered value.", tier: "public" })
        : send(401, { ok: false, error: "invalid_public_value" });
    }

    // --- Authenticated tier ---
    if (url.pathname === "/v1/status" || url.pathname === "/v1/records/purge") {
      const r = classify(req.headers["x-demo-api-key"]);
      if (!r.ok) {
        log(`${req.method} ${url.pathname} -> 401 ${r.code}`);
        return send(401, { ok: false, error: r.code, ...(r.label && { keyLabel: r.label }) });
      }
      if (url.pathname === "/v1/status" && req.method === "GET") {
        log(`GET /v1/status -> 200 (${r.label})`);
        return send(200, { ok: true, message: "Mock API is healthy. Request authenticated.", keyLabel: r.label, scope: r.scope });
      }
      // Least privilege: demo keys are read-only, so a destructive call is forbidden.
      log(`${req.method} /v1/records/purge -> 403 insufficient_scope (${r.label})`);
      return send(403, { ok: false, error: "insufficient_scope", required: "records:write", keyLabel: r.label });
    }

    // --- Provider console / admin (simulates the provider's dashboard) ---
    if (req.method === "GET" && url.pathname === "/admin/state") {
      return send(200, {
        activeKeyLabel: labelFor(generation),
        revokedKeyLabels: Array.from({ length: generation }, (_, g) => labelFor(g)),
        generation,
      });
    }
    if (req.method === "POST" && url.pathname === "/admin/rotate") {
      const revokedLabel = labelFor(generation);
      generation += 1; // issue replacement AND invalidate the old key immediately (emergency revocation)
      log(`rotated: ${revokedLabel} revoked, ${labelFor(generation)} issued`);
      return send(200, { revokedLabel, issuedLabel: labelFor(generation), newKey: keyFor(generation) });
    }
    if (req.method === "GET" && url.pathname === "/admin/latest-key") {
      return send(200, { label: labelFor(generation), key: keyFor(generation) });
    }
    if (req.method === "POST" && url.pathname === "/admin/reset") {
      generation = 0;
      log("reset: Demo key A active, others discarded");
      return send(200, { activeKeyLabel: labelFor(0), key: keyFor(0) });
    }
    if (req.method === "GET" && url.pathname === "/console") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      return res.end(CONSOLE_HTML);
    }
    send(404, { ok: false, error: "not_found" });
  });
}

const CONSOLE_HTML = `<!doctype html><meta charset="utf-8"><title>Mock provider console</title>
<style>body{font:20px system-ui;max-width:760px;margin:40px auto;padding:0 20px;background:#0f172a;color:#e2e8f0}
button{font:inherit;padding:10px 18px;border-radius:8px;border:0;background:#f59e0b;cursor:pointer;margin-right:8px}
code{background:#1e293b;padding:3px 8px;border-radius:6px;word-break:break-all}.banner{background:#7c2d12;padding:10px 14px;border-radius:8px}</style>
<h1>Mock provider console</h1><p class="banner">Educational demonstration: fake provider, fake keys, localhost only.</p>
<p>Active key: <b id="a"></b></p><p>Revoked: <span id="r"></span></p>
<p><button id="rot">Rotate key (issue new, revoke old)</button><button id="rst">Reset demo</button></p>
<p id="out"></p>
<script>
const $=id=>document.getElementById(id);
async function load(){const s=await (await fetch('/admin/state')).json();$('a').textContent=s.activeKeyLabel;$('r').textContent=s.revokedKeyLabels.join(', ')||'none';}
$('rot').onclick=async()=>{const r=await (await fetch('/admin/rotate',{method:'POST'})).json();
 $('out').innerHTML='Issued <b>'+r.issuedLabel+'</b> (shown once, like a real dashboard): <code>'+r.newKey+'</code><br>'+r.revokedLabel+' is now revoked.';load();};
$('rst').onclick=async()=>{await fetch('/admin/reset',{method:'POST'});$('out').textContent='Reset: Demo key A active.';load();};
load();
</script>`;

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const port = Number(process.env.MOCK_API_PORT ?? 4010);
  createMockApi().listen(port, "127.0.0.1", () =>
    console.log(`[mock-api] EDUCATIONAL MOCK listening on http://127.0.0.1:${port}  (active: ${labelFor(0)})`),
  );
}
