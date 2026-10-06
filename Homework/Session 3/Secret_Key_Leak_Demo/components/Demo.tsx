"use client";

import { useCallback, useEffect, useState } from "react";
import StageA from "./StageA";
import type { DemoState, RunResult } from "@/lib/types";

type Kind = "success" | "rejected" | "rotated" | "config" | "restored" | "reset" | "error";
type Entry = { id: number; time: string; kind: Kind; title: string; detail: string; cfg?: string };

const STORE = "skl-demo-log"; // sessionStorage: lets the log survive the page reload after a server restart
const BADGE: Record<Kind, string> = {
  success: "Success", restored: "Success restored", rejected: "Old key rejected",
  rotated: "Provider rotated", config: "Configuration updated", reset: "Reset", error: "Error",
};

function load(): Entry[] {
  try { return JSON.parse(sessionStorage.getItem(STORE) ?? "[]"); } catch { return []; }
}

export default function Demo() {
  const [log, setLog] = useState<Entry[]>([]);
  const [last, setLast] = useState<RunResult | null>(null);
  const [state, setState] = useState<DemoState | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshState = useCallback(async () => {
    try { setState(await (await fetch("/api/demo/state", { cache: "no-store" })).json()); } catch { setState(null); }
  }, []);

  useEffect(() => { setLog(load()); void refreshState(); }, [refreshState]);

  const push = useCallback((entries: Omit<Entry, "id" | "time">[]) => {
    setLog((prev) => {
      const time = new Date().toLocaleTimeString([], { hour12: false });
      const next = [...prev, ...entries.map((e, i) => ({ ...e, id: prev.length + i + 1, time }))];
      try { sessionStorage.setItem(STORE, JSON.stringify(next)); } catch { /* storage unavailable: log stays in memory */ }
      return next;
    });
  }, []);

  // record=false: Stage B just shows the latest result; only Stage C builds the rotation log.
  async function run(record = true) {
    setBusy(true);
    try {
      const res = await fetch("/api/stage-b", { method: "POST" });
      const r = (await res.json()) as RunResult;
      setLast(r);
      if (!record) return;
      const cfg = r.configuredKeyLabel;
      const prevCfg = [...log].reverse().find((e) => e.cfg)?.cfg;
      if (r.ok) {
        const afterFailure = log.some((e) => e.kind === "rejected");
        const kind: Kind = afterFailure ? "restored" : "success";
        const main = { kind, title: BADGE[kind], detail: `${cfg} accepted (HTTP ${r.upstreamStatus})`, cfg };
        const changed = prevCfg !== undefined && prevCfg !== cfg;
        push(changed ? [{ kind: "config", title: BADGE.config, detail: `Server now uses ${cfg} (was ${prevCfg})` }, main] : [main]);
      } else if (r.reason === "revoked_key") {
        push([{ kind: "rejected", title: BADGE.rejected, detail: `${r.providerKeyLabel ?? cfg} is revoked (HTTP ${r.upstreamStatus})`, cfg }]);
      } else {
        push([{ kind: "error", title: BADGE.error, detail: `${r.message} (HTTP ${r.upstreamStatus})`, cfg }]);
      }
    } catch {
      push([{ kind: "error", title: BADGE.error, detail: "Could not reach the Next.js server." }]);
    } finally {
      setBusy(false);
      void refreshState();
    }
  }

  async function provider(action: "rotate" | "reset") {
    setBusy(true);
    try {
      const r = await (await fetch("/api/demo/rotate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) })).json();
      if (!r.ok) push([{ kind: "error", title: BADGE.error, detail: "Provider unreachable. Is `npm run mock` running?" }]);
      else if (action === "rotate") push([{ kind: "rotated", title: BADGE.rotated, detail: `${r.issuedLabel} issued, ${r.revokedLabel} revoked` }]);
      else { setLog([]); setLast(null); try { sessionStorage.removeItem(STORE); } catch { /* ignore */ } }
    } finally {
      setBusy(false);
      void refreshState();
    }
  }

  const has = (k: Kind) => log.some((e) => e.kind === k);
  const progress = !has("success") && !has("restored") ? 0 : !has("rotated") ? 1 : !has("rejected") ? 2 : !has("config") ? 3 : !has("restored") ? 4 : 5;
  const appLabel = state?.app.configuredKeyLabel ?? "…";
  const provLabel = state?.provider?.activeKeyLabel ?? "mock API offline";
  const mismatch = state?.provider && appLabel !== provLabel;

  return (
    <main>
      <header className="top">
        <div className="banner" role="note">EDUCATIONAL DEMONSTRATION · fake credentials · local mock API only · nothing here is a real secret</div>
        <h1>What happens when a secret key leaks?</h1>
        <nav className="strip" aria-label="Live status">
          <div><span>Provider accepts</span><b data-testid="provider-label">{provLabel}</b></div>
          <div className={mismatch ? "warn" : ""}><span>This app is configured with</span><b data-testid="app-label">{appLabel}</b></div>
          <a href="#stage-a">A</a><a href="#stage-b">B</a><a href="#stage-c">C</a>
        </nav>
      </header>

      <StageA />

      <section className="stage" id="stage-b" aria-labelledby="hb">
        <h2 id="hb"><span className="num">B</span>A credential used on the server</h2>
        <div className="flow" aria-label="Request flow">
          <div className="node">Browser<small>no credential</small></div><i>→</i>
          <div className="node">Next.js route<small>/api/stage-b<br />adds secret header</small></div><i>→</i>
          <div className="node">Mock API<small>checks key</small></div>
        </div>
        <div className="row">
          <button className="btn" onClick={() => run(false)} disabled={busy}>Call the server route</button>
          <span className="hint">DevTools → Network → <code>stage-b</code>: no key in the request, none in the response.</span>
        </div>
        {last && (
          <pre className={`result ${last.ok ? "okc" : "badc"}`} data-testid="stage-b-result">
            {`HTTP ${last.upstreamStatus} from the provider\n${last.message}`}
          </pre>
        )}
        <ul className="bullets">
          <li><code>DEMO_MOCK_API_KEY</code> has no <code>NEXT_PUBLIC_</code> prefix and lives in a <code>server-only</code> module.</li>
          <li>Naming alone can’t stop a developer returning it in a response or adding it to <code>next.config</code> <code>env</code>.</li>
          <li><b>Hiding the key ≠ protecting the route.</b> Anyone who can reach this route can spend the key: it needs a fixed read-only operation, rate limits, a least-privilege key and authentication.</li>
        </ul>
      </section>

      <section className="stage" id="stage-c" aria-labelledby="hc">
        <h2 id="hc"><span className="num">C</span>Rotation and revocation</h2>
        <ol className="seq">
          <li className={progress >= 1 ? "done" : "now"}>
            <b>Request works</b> with <em>Demo key A</em>
            <button className="btn" onClick={() => run()} disabled={busy}>Run request</button>
          </li>
          <li className={progress >= 2 ? "done" : progress === 1 ? "now" : ""}>
            <b>Provider rotates:</b> issues <em>Demo key B</em>, invalidates A
            <button className="btn amber" onClick={() => provider("rotate")} disabled={busy}>Rotate key (mock provider)</button>
          </li>
          <li className={progress >= 3 ? "done" : progress === 2 ? "now" : ""}>
            <b>Unchanged app fails</b>: still sends A
            <button className="btn" onClick={() => run()} disabled={busy}>Run request</button>
          </li>
          <li className={progress >= 4 ? "done" : progress === 3 ? "now" : ""}>
            <b>Update server config, restart</b>
            <code className="cmd">npm run use-latest-key</code>
            <code className="cmd">Ctrl+C, then npm start</code>
            <span className="hint">then reload this page</span>
          </li>
          <li className={progress >= 5 ? "done" : progress === 4 ? "now" : ""}>
            <b>Same operation succeeds again</b>
            <button className="btn" onClick={() => run()} disabled={busy}>Run request</button>
          </li>
        </ol>

        <h3>Results</h3>
        <ul className="log" data-testid="log" aria-live="polite">
          {log.length === 0 && <li className="empty">No requests yet.</li>}
          {log.map((e) => (
            <li key={e.id} className={e.kind}>
              <span className="time">{e.time}</span>
              <span className="badge">{BADGE[e.kind]}</span>
              <span>{e.detail}</span>
            </li>
          ))}
        </ul>
        <div className="row">
          <button className="btn ghost" onClick={() => provider("reset")} disabled={busy}>Reset demo (provider + log)</button>
          <span className="hint">Also run <code>npm run reset</code> and restart to restore config to key A.</span>
        </div>
        <p className="takeaway">Local simulation. Real providers differ: planned rotation can overlap old and new keys briefly; an actively compromised key needs urgent revocation, which may interrupt service. Removing a key from code does not invalidate it.</p>
      </section>
    </main>
  );
}
