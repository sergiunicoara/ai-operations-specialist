// Builds both decks from deck_content.json + ../data/nox_data.csv.
// Usage (from this folder):  npm ci  &&  npm run build
// Outputs: team_section_3_to_4_minutes.pptx, standalone_15_minutes.pptx,
//          team_section_speaker_notes.md, standalone_speaker_script.md
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PptxGenJS = require('pptxgenjs');
const JSZip = require('jszip');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const content = JSON.parse(await fs.readFile(path.join(HERE, 'deck_content.json'), 'utf8'));
const rows = parseCsv(await fs.readFile(path.join(HERE, '..', 'data', 'nox_data.csv'), 'utf8'));

const C = { bg: 'FFFFFF', card: 'F1F4F6', ink: '132C3B', muted: '52616A', blue: '2864B4', orange: 'C35724', green: '008778', red: 'B6293E', rule: 'A2AAAD', grid: 'D9DEDF' };
const SERIES = [C.blue, C.orange, C.green];
const FONT = 'Arial';
const WPM = 130;

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const split = l => l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, ''));
  const head = split(lines[0]);
  return lines.slice(1).map(l => Object.fromEntries(split(l).map((v, i) => [head[i], v])));
}

// Chart data: one value per (vehicle, condition order 0-5); null = no test (drawn as a gap, never zero).
function seriesFor(letter, field) {
  return Array.from({ length: 6 }, (_, i) => {
    const r = rows.find(x => x.vehicle.startsWith('Vehicle ' + letter) && Number(x.order) === i);
    if (!r) throw new Error(`missing row ${letter}/${i}`);
    return r[field] === '' ? null : Number(r[field]);
  });
}
const MEANS = { A: seriesFor('A', 'nox_gkm'), B: seriesFor('B', 'nox_gkm'), C: seriesFor('C', 'nox_gkm') };
const SDS = { A: seriesFor('A', 'stddev_gkm'), B: seriesFor('B', 'stddev_gkm'), C: seriesFor('C', 'stddev_gkm') };
const STANDARD = 0.043;

function shortRef(src) {
  let s = src
    .replaceAll('WVU/ICCT, In-Use Emissions Testing of Light-Duty Diesel Vehicles in the U.S., 15 May 2014', 'WVU/ICCT (2014)')
    .replaceAll('EPA, Notice of Violation CAA-09-18-15, 18 September 2015', 'EPA NOV (2015)')
    .replaceAll('United States v. Volkswagen AG, Plea Agreement, 11 January 2017, Exhibit 2 (Statement of Facts)', 'VW plea (2017), Exh. 2')
    .replaceAll('United States v. Volkswagen AG, Plea Agreement, 11 January 2017', 'VW plea (2017)')
    .replaceAll('Plea Agreement, Exhibit 2', 'VW plea (2017), Exh. 2')
    .replaceAll('Exhibit 2 (Statement of Facts)', 'Exh. 2')
    .replaceAll('Exh. 2, Exh. 2', 'Exh. 2');
  if (s.length > 290) s = 'Sources: WVU/ICCT (2014); EPA NOV (2015); VW plea agreement (2017). Exact pages in the speaker notes.';
  return s;
}

function text(s, str, x, y, w, h, o = {}) {
  s.addText(str, { x, y, w, h, fontFace: FONT, fontSize: o.size ?? 18, color: o.color ?? C.ink, bold: o.bold ?? false,
    align: o.align ?? 'left', valign: o.valign ?? 'top', margin: o.margin ?? 0, isTextBox: true, fit: 'none', paraSpaceAfter: 0 });
}
function card(s, x, y, w, h, fill = C.card) {
  s.addShape('roundRect', { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.08 });
}
function title(s, d) { text(s, d.title, 0.6, 0.42, 12.1, 0.9, { size: 32, bold: true }); }
function footer(s, d, n) {
  text(s, shortRef(d.source), 0.6, 6.82, 11.5, 0.5, { size: 11, color: C.muted });
  text(s, String(n), 12.2, 6.82, 0.55, 0.3, { size: 11, color: C.muted, align: 'right' });
}

const layouts = {
  cover(s, d) {
    s.background = { color: C.ink };
    text(s, d.title, 0.6, 1.5, 12.1, 1.9, { size: 40, bold: true, color: 'FFFFFF' });
    text(s, d.body[0], 0.6, 3.75, 12.1, 0.55, { size: 20, bold: true, color: '9CC3F5' });
    text(s, d.body[1], 0.6, 4.45, 12.1, 0.9, { size: 22, color: 'FFFFFF' });
  },
  compare(s, d) {
    d.body.forEach((b, i) => {
      const x = 0.6 + i * 6.25; card(s, x, 1.55, 5.85, 3.3);
      text(s, b[0], x + 0.35, 1.8, 5.2, 0.4, { size: 16, bold: true, color: i ? C.orange : C.blue });
      text(s, b[1], x + 0.35, 2.25, 5.2, 1.05, { size: 26, bold: true });
      text(s, b[2], x + 0.35, 3.5, 5.2, 1.2, { size: 18, color: C.muted });
    });
    if (d.bottom) text(s, d.bottom, 0.6, 5.2, 12.1, 1.2, { size: 18, bold: true });
  },
  evidence(s, d) {
    d.body.forEach((b, i) => {
      const x = 0.6 + i * 4.15; card(s, x, 1.55, 3.85, 3.3);
      text(s, b[0], x + 0.3, 1.8, 3.3, 0.55, { size: 28, bold: true, color: SERIES[i] });
      text(s, b[1], x + 0.3, 2.45, 3.3, 0.5, { size: 22, bold: true });
      text(s, b[2].replace(/\n/g, ' '), x + 0.3, 3.05, 3.3, 1.6, { size: 17, color: C.muted });
    });
    if (d.bottom) text(s, d.bottom, 0.6, 5.25, 12.1, 0.9, { size: 20, bold: true });
  },
  study(s, d) {
    d.body.forEach((b, i) => {
      const x = 0.6 + i * 4.15; card(s, x, 1.55, 3.85, 3.0);
      text(s, 'Vehicle ' + b[0], x + 0.3, 1.8, 3.3, 0.45, { size: 20, bold: true, color: SERIES[i] });
      text(s, b[1], x + 0.3, 2.35, 3.3, 0.9, { size: 44, bold: true });
      text(s, b[2], x + 0.3, 3.45, 3.3, 0.8, { size: 20, color: C.muted });
    });
    text(s, d.bottom, 0.6, 4.95, 12.1, 1.2, { size: 18, bold: true });
  },
  ratios(s, d) {
    d.body.forEach((b, i) => {
      const x = 0.6 + i * 6.25; card(s, x, 1.55, 5.85, 3.55);
      text(s, b[0], x + 0.35, 1.75, 5.2, 1.1, { size: 60, bold: true, color: i ? C.orange : C.blue });
      text(s, b[1], x + 0.35, 2.95, 5.2, 0.55, { size: 24 });
      text(s, b[2], x + 0.35, 3.65, 5.2, 1.2, { size: 17, color: C.muted });
    });
    text(s, d.bottom, 0.6, 5.45, 12.1, 0.8, { size: 18, bold: true });
  },
  limits(s, d) {
    d.body.forEach((b, i) => {
      const y = 1.55 + i * 1.6; card(s, 0.6, y, 12.1, 1.35);
      text(s, b[0], 0.95, y + 0.42, 3.6, 0.55, { size: 22, bold: true, color: SERIES[i] });
      text(s, b[1], 4.7, y + 0.42, 7.7, 0.55, { size: 22 });
    });
  },
  software(s, d) {
    text(s, d.lead, 0.6, 1.45, 12.1, 0.8, { size: 20, bold: true });
    d.body.forEach((b, i) => {
      const x = 0.6 + i * 6.25; card(s, x, 2.4, 5.85, 3.0);
      text(s, b[0], x + 0.35, 2.65, 5.2, 0.4, { size: 16, bold: true, color: i ? C.orange : C.blue });
      text(s, b[1], x + 0.35, 3.15, 5.2, 0.7, { size: 28, bold: true });
      text(s, b[2], x + 0.35, 4.0, 5.2, 1.2, { size: 18, color: C.muted });
    });
    text(s, d.bottom, 0.6, 5.7, 12.1, 0.5, { size: 13, color: C.muted });
  },
  timeline(s, d) {
    const step = 2.05, colW = 1.85, x0 = 0.6, lineY = 2.55;
    s.addShape('line', { x: x0 + 0.16, y: lineY, w: 5 * step, h: 0, line: { color: C.rule, width: 2 } });
    text(s, 'LINE CROSSED', x0, 1.55, colW, 0.3, { size: 12, bold: true, color: C.red });
    d.body.forEach((b, i) => {
      const x = x0 + i * step, first = i === 0;
      s.addShape('ellipse', { x: x, y: lineY - 0.16, w: 0.32, h: 0.32, fill: { color: first ? C.red : C.ink }, line: { color: 'FFFFFF', width: 1.5 } });
      text(s, b[0], x, 1.9, colW, 0.4, { size: 18, bold: true, color: first ? C.red : C.ink });
      text(s, b[1], x, 2.9, colW, 0.4, { size: 15, bold: true, color: first ? C.red : C.ink });
      text(s, b[2], x, 3.3, colW, 1.35, { size: 13 });
      text(s, b[3], x, 4.7, colW, 0.3, { size: 11, color: C.muted });
    });
    card(s, 0.6, 5.2, 12.1, 1.05);
    text(s, d.bottom, 0.9, 5.37, 11.5, 0.75, { size: 19, bold: true, valign: 'middle' });
  },
  impact(s, d) {
    d.body.forEach((b, i) => {
      const y = 1.5 + i * 1.62; card(s, 0.6, y, 12.1, 1.42);
      text(s, b[0], 0.95, y + 0.25, 3.0, 0.95, { size: 21, bold: true, color: SERIES[i] });
      text(s, b[1], 4.1, y + 0.22, 8.3, 1.05, { size: 18 });
    });
  },
  ethics(s, d) {
    d.body.forEach((b, i) => {
      const x = 0.6 + i * 6.25; card(s, x, 1.55, 5.85, 3.3);
      text(s, b[0], x + 0.35, 1.85, 5.2, 0.55, { size: 24, bold: true, color: i ? C.orange : C.blue });
      text(s, b[1].replace(/\n/g, ' '), x + 0.35, 2.6, 5.2, 2.0, { size: 22 });
    });
  },
  checklist(s, d) {
    d.body.forEach((b, i) => {
      const y = 1.5 + i * 1.28;
      s.addShape('ellipse', { x: 0.6, y: y + 0.12, w: 0.72, h: 0.72, fill: { color: C.blue }, line: { color: C.blue, width: 0 } });
      text(s, b[0], 0.6, y + 0.12, 0.72, 0.72, { size: 24, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
      text(s, b[1], 1.65, y + 0.25, 3.1, 0.5, { size: 22, bold: true });
      text(s, b[2], 4.85, y + 0.27, 7.85, 0.9, { size: 20, color: C.muted });
    });
  },
  qa(s, d) {
    d.body.forEach((b, i) => {
      const y = 1.45 + i * 1.3; card(s, 0.6, y, 12.1, 1.15);
      text(s, b[0], 0.9, y + 0.14, 11.5, 0.4, { size: 18, bold: true });
      text(s, b[1], 0.9, y + 0.56, 11.5, 0.5, { size: 16, color: C.muted });
    });
  },
  sources(s, d) {
    d.body.forEach((b, i) => {
      const x = 0.6 + i * 4.15; card(s, x, 1.55, 3.85, 3.5);
      text(s, b[0], x + 0.3, 1.8, 3.3, 0.35, { size: 14, bold: true, color: SERIES[i] });
      text(s, b[1], x + 0.3, 2.25, 3.3, 0.85, { size: 22, bold: true });
      text(s, b[2], x + 0.3, 3.2, 3.3, 2.7, { size: 15, color: C.muted });
    });
  },
  chart(s, d, pres) {
    const labels = ['Study lab\nFTP-75', 'R1\nHighway', 'R2\nLos Angeles', 'R3\nRural hills', 'R4\nSan Diego', 'R5\nSan Francisco'];
    s.addChart([
      { type: pres.charts.BAR, data: [
          { name: 'Vehicle A (lean-NOx trap)', labels, values: MEANS.A },
          { name: 'Vehicle B (urea-SCR)', labels, values: MEANS.B },
          { name: 'Vehicle C (urea-SCR)', labels, values: MEANS.C }],
        options: { barDir: 'col', barGrouping: 'clustered', barGapWidthPct: 55, chartColors: SERIES } },
      { type: pres.charts.LINE, data: [{ name: 'Tier 2 Bin 5 standard, 0.043 g/km', labels, values: Array(6).fill(STANDARD) }],
        options: { chartColors: [C.red], lineSize: 2, lineDash: 'dash', lineDataSymbol: 'none' } },
    ], {
      x: 0.45, y: 1.3, w: 12.4, h: 4.8, fontFace: FONT,
      valAxisMinVal: 0, valAxisMaxVal: 2, valAxisMajorUnit: 0.5, valAxisLabelFormatCode: '0.0',
      showValAxisTitle: true, valAxisTitle: 'Mean NOx (g/km)', valAxisTitleFontSize: 14, valAxisTitleColor: C.ink,
      valAxisLabelFontSize: 13, valAxisLabelColor: C.muted, catAxisLabelFontSize: 13, catAxisLabelColor: C.ink,
      catAxisLineShow: true, catAxisLineColor: C.rule, valAxisLineShow: false,
      valGridLine: { color: C.grid, size: 0.5 }, catGridLine: { style: 'none' },
      showLegend: true, legendPos: 't', legendFontSize: 14, legendFontFace: FONT, legendColor: C.ink, showTitle: false,
    });
    text(s, 'Bars: route or test means; thin bars: ±1 SD as published (none for single runs). No bar = no test (C lab, C R4, A R5), not zero.', 0.6, 6.12, 12.1, 0.3, { size: 12, color: C.muted });
    text(s, 'The standard is a certification benchmark, used here as a reference; road routes are not certification tests. Three vehicles: no fleet-wide estimate.', 0.6, 6.4, 12.1, 0.3, { size: 12, color: C.muted });
  },
};

// ---- OOXML post-processing: gaps for missing data, custom SD error bars, lab value labels ----
const numLit = vals => `<c:numLit><c:formatCode>0.000</c:formatCode><c:ptCount val="${vals.length}"/>` +
  vals.map((v, i) => (v == null ? '' : `<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`)).join('') + '</c:numLit>';

function errBars(sds, means) {
  const vals = sds.map((v, i) => (means[i] == null || v == null ? null : v));
  return `<c:errBars><c:errBarType val="both"/><c:errValType val="cust"/><c:noEndCap val="0"/>` +
    `<c:plus>${numLit(vals)}</c:plus><c:minus>${numLit(vals)}</c:minus>` +
    `<c:spPr><a:ln w="12700"><a:solidFill><a:srgbClr val="${C.muted}"/></a:solidFill></a:ln></c:spPr></c:errBars>`;
}
const labLabel = `<c:dLbl><c:idx val="0"/><c:numFmt formatCode="0.000" sourceLinked="0"/><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>` +
  `<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1200" b="1"><a:solidFill><a:srgbClr val="${C.ink}"/></a:solidFill><a:latin typeface="${FONT}"/></a:defRPr></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr>` +
  `<c:dLblPos val="outEnd"/><c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbl>`;

function patchChartXml(xml) {
  xml = xml.replace(/<c:pt idx="\d+">\s*<c:v>\s*<\/c:v>\s*<\/c:pt>/g, '');
  const bar = xml.match(/<c:barChart>[\s\S]*?<\/c:barChart>/);
  if (!bar) throw new Error('bar chart not found');
  let k = 0;
  const patched = bar[0].replace(/<c:ser>[\s\S]*?<\/c:ser>/g, ser => {
    const letter = 'ABC'[k++];
    if (!ser.includes('<c:cat>')) throw new Error('series without categories');
    ser = ser.replace('<c:cat>', errBars(SDS[letter], MEANS[letter]) + '<c:cat>');
    if (letter !== 'C') {
      if (/<c:dLbls>/.test(ser)) ser = ser.replace('<c:dLbls>', '<c:dLbls>' + labLabel);
      else ser = ser.replace(/<c:errBars>/, `<c:dLbls>${labLabel}<c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls><c:errBars>`);
    }
    return ser;
  });
  if (k !== 3) throw new Error(`expected 3 bar series, found ${k}`);
  xml = xml.replace(bar[0], patched);
  if (!/<c:dispBlanksAs /.test(xml)) throw new Error('dispBlanksAs not found');
  return xml.replace(/<c:dispBlanksAs val="[^"]*"\/>/, '<c:dispBlanksAs val="gap"/>');
}

async function patchWorkbook(buf) {
  const wb = await JSZip.loadAsync(buf);
  for (const name of Object.keys(wb.files).filter(n => /xl\/worksheets\/sheet\d+\.xml$/.test(n))) {
    const x = await wb.file(name).async('string');
    wb.file(name, x.replace(/<c r="([A-Z]+\d+)"( [^>]*)?>\s*<v>\s*<\/v>\s*<\/c>/g, '<c r="$1"/>'));
  }
  return wb.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

async function postProcess(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  for (const name of Object.keys(zip.files)) {
    if (/^ppt\/charts\/chart\d+\.xml$/.test(name)) zip.file(name, patchChartXml(await zip.file(name).async('string')));
    if (/^ppt\/embeddings\/.*\.xlsx$/.test(name)) zip.file(name, await patchWorkbook(await zip.file(name).async('nodebuffer')));
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// ---- notes / script export ----
const words = t => t.trim().split(/\s+/).filter(Boolean).length;
const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

function scriptMarkdown(heading, slides, framing = {}) {
  let t = 0, spokenWords = 0, out = [`# ${heading}`, '',
    `Generated by build_decks.mjs from deck_content.json. Do not edit by hand; edit the JSON and rebuild. Timing estimate uses ${WPM} words/minute; planned times add pauses and slide changes. Source lines are not spoken.`, ''];

  let introWords = 0, outroWords = 0;
  if (framing.intro) {
    introWords = words(framing.intro);
    out.push('## Opening — before Slide 1 (not tied to a timed slide; deliver over the cover slide or before advancing to it)', '',
      framing.intro, '', `*${introWords} words ≈ ${mmss(introWords / WPM * 60)} at ${WPM} wpm. Not counted in the planned slide timing below — add it to your total.*`, '');
  }

  slides.forEach((d, i) => {
    const w = words(d.notes);
    const range = d.seconds ? `${mmss(t)}–${mmss(t + d.seconds)}` : 'optional appendix';
    out.push(`## Slide ${i + 1} — ${d.title.replace(/\n/g, ' ')} (${range})`, '', d.notes, '',
      `*${w} words ≈ ${mmss(w / WPM * 60)} at ${WPM} wpm; planned ${d.seconds ? mmss(d.seconds) : 'n/a'}.*`, '', `Source: ${d.source}`, '');
    if (d.seconds) { t += d.seconds; spokenWords += w; }
  });

  if (framing.outro) {
    outroWords = words(framing.outro);
    out.push(`## Closing — after the last slide (not tied to a timed slide; deliver after Slide ${slides.length}, or over it while it stays on screen)`, '',
      framing.outro, '', `*${outroWords} words ≈ ${mmss(outroWords / WPM * 60)} at ${WPM} wpm. Not counted in the planned slide timing below — add it to your total.*`, '');
  }

  out.push(`**Planned spoken time for the timed slides: ${mmss(t)}; ${spokenWords} spoken words ≈ ${mmss(spokenWords / WPM * 60)} at ${WPM} wpm before pauses.**`);
  if (introWords || outroWords) {
    const allWords = spokenWords + introWords + outroWords;
    out.push(`**With the opening and closing remarks: ${allWords} words ≈ ${mmss(allWords / WPM * 60)} at ${WPM} wpm before pauses.**`);
  }
  out.push('');
  return { md: out.join('\n'), planned: t, spokenWords };
}

// ---- build ----
const urls = Object.entries(content.urls).map(([k, v]) => `${k}: ${v}`).join('\n');
for (const [key, file, heading] of [
  ['team', 'team_section_3_to_4_minutes', 'TEAM SECTION — independent testing and analytical evidence (3–4 minutes)'],
  ['standalone', 'standalone_15_minutes', 'STANDALONE — full solo presentation (about 15 minutes + questions)'],
]) {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE';
  pres.author = 'Team 5';
  pres.title = key === 'team' ? 'How independent data exposed the manipulation' : 'Beyond clever presentation: Volkswagen’s emissions test';
  content[key].forEach((d, i) => {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    const layout = layouts[d.kind];
    if (!layout) throw new Error(`no layout for kind "${d.kind}"`);
    if (d.kind !== 'cover') title(s, d);
    layout(s, d, pres);
    if (d.kind !== 'cover') footer(s, d, i + 1);
    s.addNotes(`${d.seconds ? `Planned time: ${d.seconds} seconds.` : 'Optional appendix; outside speaking time.'}\n\n${d.notes}\n\nSOURCE (not spoken): ${d.source}\n${urls}`);
  });
  const out = await postProcess(await pres.write({ outputType: 'nodebuffer' }));
  await fs.writeFile(path.join(HERE, file + '.pptx'), out);
  const framing = key === 'standalone'
    ? { intro: content.standalone_intro, outro: content.standalone_outro }
    : { intro: content.team_intro, outro: content.team_outro };
  const { md, planned, spokenWords } = scriptMarkdown(heading, content[key], framing);
  await fs.writeFile(path.join(HERE, key === 'team' ? 'team_section_speaker_notes.md' : 'standalone_speaker_script.md'), md);
  console.log(`${file}.pptx: ${content[key].length} slides; planned ${mmss(planned)}; ${spokenWords} spoken words (≈${mmss(spokenWords / WPM * 60)} at ${WPM} wpm)`);
}
