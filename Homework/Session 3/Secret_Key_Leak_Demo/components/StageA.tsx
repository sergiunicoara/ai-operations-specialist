"use client";

import { useState } from "react";

// STAGE A - a value deliberately exposed to the browser.
// The two literal `process.env.NEXT_PUBLIC_...` references below are replaced with their string values
// by `next build` and shipped inside the page's JavaScript. (Dynamic lookups like process.env[name] are not inlined.)
const EXPOSED_VALUE = process.env.NEXT_PUBLIC_DEMO_EXPOSED_KEY;
const MOCK_API = process.env.NEXT_PUBLIC_DEMO_MOCK_API_URL;

export default function StageA() {
  const [out, setOut] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function sendFromBrowser() {
    setBusy(true);
    try {
      const res = await fetch(`${MOCK_API}/v1/public-ping`, { headers: { "x-demo-public-key": EXPOSED_VALUE ?? "" } });
      setOut(`HTTP ${res.status}\n${JSON.stringify(await res.json(), null, 2)}`);
    } catch {
      setOut("Could not reach the mock API at " + MOCK_API + ". Is `npm run mock` running?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="stage" id="stage-a" aria-labelledby="ha">
      <h2 id="ha"><span className="num">A</span>A value exposed to the browser</h2>
      <p className="lead">This component references a <code>NEXT_PUBLIC_</code> variable. The value is <b>not printed anywhere on this page</b>. Find it.</p>
      <pre className="code">{`const key = process.env.NEXT_PUBLIC_DEMO_EXPOSED_KEY;
fetch(mockApi + "/v1/public-ping", { headers: { "x-demo-public-key": key } })`}</pre>
      <div className="row">
        <button className="btn" onClick={sendFromBrowser} disabled={busy}>Send request from the browser</button>
        <span className="hint">Then open DevTools → Network → the request → Request Headers.</span>
      </div>
      {out && <pre className="result" data-testid="stage-a-result">{out}</pre>}
      <details open>
        <summary>Where to find it (production build)</summary>
        <ol className="steps">
          <li>Press <kbd>F12</kbd> → <b>Sources</b> → <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd>, search <code>DEMO_ONLY_PUBLIC</code>.</li>
          <li>Open the hit in <code>/_next/static/chunks/…js</code>: the literal string is sitting in the file.</li>
          <li>Or: <b>Network</b> → click the request above → <code>x-demo-public-key</code> header.</li>
        </ol>
      </details>
      <p className="takeaway">The <code>NEXT_PUBLIC_</code> prefix <b>makes a value public</b>. It does not make a secret safe.</p>
    </section>
  );
}
