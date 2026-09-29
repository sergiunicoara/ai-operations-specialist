# Archive — do not present from these files

Kept for history only. Superseded on 28 September 2026 by the audited materials in
`../presentation/` (see `../AUDIT_REPORT.md`).

**early_drafts/** — first-pass slides, notes and source notes. Known errors, all corrected
in the current deck:

- claimed ICCT's goal was "to promote clean diesel" (not in the report; WVU pp. 1–2);
- claimed PEMS and lab agreed "within single digits" on NOx (Table 3.13 p. 55 shows 18.8 %);
- cited Table 3.13 as p. 54 (it is p. 55);
- said the three cars used three different technologies (two technologies: WVU p. 2);
- recorded Vehicle C Route 3 as two runs (Table 3.15 p. 57 lists three);
- said the EPA notice could not be read and that no source names the vehicles (EPA NOV p. 4
  names a 2012 Jetta and a 2013 Passat);
- speculated about a "March 2014 conference" (plea ¶ 52 says VW employees *learned of* the
  results around March 2014; the final report is dated 15 May 2014);
- chart y-axis stopped at 1.75, clipping Vehicle A's Route 4 error bar (1.815).

**legacy_pipeline/** — the previous deck generator. It depended on a private Codex runtime
(`@oai/artifact-tool` and a finalizer under `~/.codex/...`) that teammates cannot install,
its chart validator failed for both decks, and no final deck was ever produced. Replaced by
`presentation/build_decks.mjs` (public `pptxgenjs`).
