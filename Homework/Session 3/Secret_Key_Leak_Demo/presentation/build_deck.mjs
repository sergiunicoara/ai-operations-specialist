// Builds secret_key_leak_demo.pptx (3 editable slides, native shapes, speaker notes). Run: npm install && npm run build
import pptxgen from "pptxgenjs";

const C = { ink: "0F172A", muted: "475569", bg: "F8FAFC", card: "FFFFFF", line: "CBD5E1", blue: "1D4ED8", amber: "B45309", amberBg: "FEF3C7", red: "B91C1C", redBg: "FEE2E2", green: "047857", greenBg: "D1FAE5" };
const F = "Segoe UI";
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
p.title = "What happens when a secret key leaks?";

const title = (s, text, sub) => {
  s.background = { color: C.bg };
  s.addText(text, { x: 0.6, y: 0.35, w: 12.1, h: 0.8, fontFace: F, fontSize: 34, bold: true, color: C.ink });
  if (sub) s.addText(sub, { x: 0.6, y: 1.08, w: 12.1, h: 0.4, fontFace: F, fontSize: 16, color: C.muted });
};
const footer = (s) => s.addText("Educational demonstration · fake credentials · local mock API only", { x: 0.6, y: 7.0, w: 12.1, h: 0.3, fontFace: F, fontSize: 12, color: C.muted });

// ---------- Slide 1: the flow
let s = p.addSlide();
title(s, "What happens when a secret key leaks?", "A four-minute live demo in three stages");
const cards = [
  { k: "A", head: "Exposed to the browser", color: C.amber, bg: C.amberBg, lines: ["Component reads a NEXT_PUBLIC_ value", "Next.js inlines it into browser JavaScript at build time", "Find it in DevTools: header and .js file"], punch: "The prefix makes a value public. It does not make a secret safe." },
  { k: "B", head: "Used on the server", color: C.blue, bg: "DBEAFE", lines: ["Browser → Next.js route → mock API", "Server adds the key; the browser never sees it", "Result returned to the browser is harmless"], punch: "Hiding the key does not protect the route: limits, least privilege, authentication." },
  { k: "C", head: "Rotation and revocation", color: C.red, bg: C.redBg, lines: ["Request works with Demo key A", "Provider issues Demo key B, revokes A: 401", "Update config, restart: works again"], punch: "Removing a key from code does not invalidate it." },
];
cards.forEach((c, i) => {
  const x = 0.6 + i * 4.1;
  s.addShape(p.ShapeType.roundRect, { x, y: 1.75, w: 3.9, h: 4.75, fill: { color: c.bg }, line: { color: c.color, width: 2 }, rectRadius: 0.12 });
  s.addShape(p.ShapeType.roundRect, { x: x + 0.25, y: 1.95, w: 0.65, h: 0.65, fill: { color: c.color }, line: { color: c.color }, rectRadius: 0.1 });
  s.addText(c.k, { x: x + 0.25, y: 1.95, w: 0.65, h: 0.65, align: "center", valign: "middle", fontFace: F, fontSize: 26, bold: true, color: "FFFFFF" });
  s.addText(c.head, { x: x + 1.0, y: 1.95, w: 2.8, h: 0.65, valign: "middle", fontFace: F, fontSize: 20, bold: true, color: C.ink });
  s.addText(c.lines.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x: x + 0.25, y: 2.8, w: 3.45, h: 2.2, fontFace: F, fontSize: 16, color: C.ink, valign: "top", paraSpaceAfter: 6 });
  s.addText(c.punch, { x: x + 0.25, y: 5.15, w: 3.45, h: 1.15, fontFace: F, fontSize: 16, bold: true, color: c.color, valign: "middle" });
});
footer(s);
s.addNotes("0:00-0:20. Frame the demo: three stages, all fake and local. Then switch to the browser at http://127.0.0.1:3000 and run Stage A (0:20), Stage B (1:10), Stage C (2:00). Full timed script: SPEAKER_NOTES.md.");

// ---------- Slide 2: architecture
s = p.addSlide();
title(s, "Where the public value and the private credential live", "Browser → Next.js server route → mock API (all on 127.0.0.1)");
const col = (x, w, head, fill, stroke) => {
  s.addShape(p.ShapeType.roundRect, { x, y: 1.7, w, h: 4.9, fill: { color: fill }, line: { color: stroke, width: 2, dashType: stroke === C.amber ? "dash" : "solid" }, rectRadius: 0.1 });
  s.addText(head, { x: x + 0.15, y: 1.78, w: w - 0.3, h: 0.45, fontFace: F, fontSize: 15, bold: true, color: stroke === C.amber ? "92400E" : C.ink });
};
col(0.5, 3.4, "UNTRUSTED: anything here can be inspected", "FFFBEB", C.amber);
col(4.6, 3.7, "YOUR SERVER · Next.js :3000", "F1F5F9", "334155");
col(9.0, 3.8, "PROVIDER (mock) · :4010", "F1F5F9", "334155");
const box = (x, y, w, h, head, body, fill, stroke, hc) => {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, fill: { color: fill }, line: { color: stroke, width: 2 }, rectRadius: 0.08 });
  s.addText([{ text: head, options: { bold: true, fontSize: 15, color: hc ?? C.ink, breakLine: true } }, { text: body, options: { fontSize: 12, color: hc ?? C.muted } }], { x: x + 0.1, y: y + 0.05, w: w - 0.2, h: h - 0.1, fontFace: F, valign: "top" });
};
box(0.65, 2.35, 3.1, 1.1, "Browser", "Runs the page's JavaScript from /_next/static/chunks", C.card, C.ink);
box(0.65, 3.65, 3.1, 1.55, "PUBLIC VALUE (Stage A)", "NEXT_PUBLIC_DEMO_EXPOSED_KEY inlined into JS at build. Readable in DevTools.", C.amberBg, C.amber, "92400E");
box(0.65, 5.4, 3.1, 1.0, "No private credential", "Requests carry no key; responses are harmless.", C.greenBg, C.green, C.green);
box(4.75, 2.35, 3.4, 1.6, "Route handler /api/stage-b", "server-only module · fixed read-only call · origin check · rate limit · safe result only", C.card, C.ink);
box(4.75, 4.15, 3.4, 2.25, "PRIVATE CREDENTIAL (B, C)", "DEMO_MOCK_API_KEY in .env.local (git-ignored). Read at runtime; never in the bundle. Rotation: change the value, restart the server.", C.redBg, C.red, "991B1B");
box(9.15, 2.35, 3.5, 1.6, "Authenticated tier", "GET /v1/status checks header x-demo-api-key. Missing, wrong or revoked: 401. Demo key is read-only.", C.card, C.ink);
box(9.15, 4.15, 3.5, 1.2, "Provider key state", "Demo key A: active, then revoked. Demo key B: issued at rotation.", C.card, C.ink);
box(9.15, 5.5, 3.5, 0.9, "Public tier", "Accepts the browser-delivered value.", C.amberBg, C.amber, "92400E");
const arrow = (x1, y1, x2, y2, color, dash) => s.addShape(p.ShapeType.line, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH: x2 < x1, flipV: y2 < y1, line: { color, width: 3, endArrowType: "triangle", dashType: dash ? "dash" : "solid" } });
arrow(3.75, 2.9, 4.75, 2.9, C.ink);
s.addText("no key", { x: 3.75, y: 2.5, w: 1.0, h: 0.3, fontFace: F, fontSize: 11, color: C.ink, align: "center" });
arrow(8.15, 3.1, 9.15, 3.1, C.red);
s.addText("adds key", { x: 8.15, y: 2.7, w: 1.0, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: C.red, align: "center" });
s.addText("Stage A: the browser can also call the public tier directly with the exposed value", { x: 0.5, y: 6.65, w: 12.3, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: "92400E" });
footer(s);
s.addNotes("Use while explaining Stage A and B. Amber = public, shipped to browsers. Red = private, server only. The provider's accepted key is independent of the app's configuration, which is why rotation needs two updates.");

// ---------- Slide 3: rotation + conclusions
s = p.addSlide();
title(s, "Rotation needs two updates", "What Stage C showed, and what to take away: a hidden credential still needs protecting");
const steps = [["1", "Works", "Demo key A accepted", C.green, C.greenBg], ["2", "Provider rotates", "Demo key B issued, A revoked", "B45309", C.amberBg], ["3", "Old key rejected", "Unchanged app: HTTP 401", C.red, C.redBg], ["4", "Config updated", ".env.local + restart", "B45309", C.amberBg], ["5", "Works again", "Demo key B accepted", C.green, C.greenBg]];
steps.forEach(([n, h, b, color, bg], i) => {
  const x = 0.55 + i * 2.5;
  s.addShape(p.ShapeType.roundRect, { x, y: 1.7, w: 2.3, h: 1.35, fill: { color: bg }, line: { color, width: 2 }, rectRadius: 0.1 });
  s.addText([{ text: `${n}  ${h}`, options: { bold: true, fontSize: 15, color, breakLine: true } }, { text: b, options: { fontSize: 12, color: C.ink } }], { x: x + 0.1, y: 1.8, w: 2.1, h: 1.2, fontFace: F, valign: "top" });
  if (i < 4) s.addText("→", { x: x + 2.25, y: 2.1, w: 0.3, h: 0.5, fontFace: F, fontSize: 20, color: C.muted, align: "center" });
});
s.addText([
  { text: "Browser-delivered values can be inspected.", options: { bullet: true, breakLine: true } },
  { text: "A server can use a credential without giving it to the browser.", options: { bullet: true, breakLine: true } },
  { text: "Removing a key from code does not invalidate it.", options: { bullet: true, breakLine: true } },
  { text: "Rotation must update both the provider and the application's configuration.", options: { bullet: true, breakLine: true } },
  { text: "A hidden credential still needs permissions, limits and protected endpoints.", options: { bullet: true } },
], { x: 0.6, y: 3.35, w: 7.4, h: 3.0, fontFace: F, fontSize: 19, color: C.ink, valign: "top", paraSpaceAfter: 8 });
s.addShape(p.ShapeType.roundRect, { x: 8.4, y: 3.35, w: 4.4, h: 3.0, fill: { color: "EFF6FF" }, line: { color: C.blue, width: 2 }, rectRadius: 0.1 });
s.addText([
  { text: "Local simulation", options: { bold: true, fontSize: 16, color: C.blue, breakLine: true } },
  { text: "Real providers differ. Planned rotation can overlap old and new keys briefly. An actively compromised key needs urgent revocation, which may interrupt service.", options: { fontSize: 14, color: C.ink, breakLine: true } },
  { text: " ", options: { fontSize: 6, breakLine: true } },
  { text: "Sources: Next.js docs (environment variables, data security); GitHub “Remediating a leaked secret”; AWS Security Blog; OWASP Secrets Management. Links in SOURCES.md.", options: { fontSize: 11, color: C.muted } },
], { x: 8.55, y: 3.45, w: 4.1, h: 2.8, fontFace: F, valign: "top" });
footer(s);
s.addNotes("3:30-4:00 close. Real providers differ. Planned rotation can overlap keys; an actively compromised key needs urgent revocation and may interrupt service. Summarise the five points, in order, then stop.");

await p.writeFile({ fileName: "secret_key_leak_demo.pptx" });
console.log("wrote secret_key_leak_demo.pptx");
