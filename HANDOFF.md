# HANDOFF — for the next session (written 2026-07-24)

*Read `CLAUDE.md` first (the constitution), then `DECISIONS.md` (current vibe +
settled decisions), then `chiaro-tinker-tools-tracker.html` (priorities). This
file is the short bridge between sessions — delete or rewrite it freely once
its contents are absorbed.*

## Where things stand

- **CTT v0.5.0 is live** at https://chiaro-tinker-tools.pages.dev/ (Cloudflare
  Pages auto-deploys `main`). Everything is merged (PRs #13–#16); no work in
  flight. Chad is dogfooding daily with real ORDO data + cloud sync.
- **The arc is complete:** Opening (threshold room, default landing) →
  Project Journal / Time Card / Blueprint → **Closing** (the log-off room).
- **Closing tab (v0.4.0):** read-only ledger of the held day — intentions met /
  *entrusted* (never "failed"), hours given, "the shelves" (each active project
  a lamp chip with its held-scratchpad-line count), tomorrow's Blueprint
  glance — plus the optional **"It was enough."** check (per-date in
  `db.closing`, no history surfaced, streak impossible by construction) and
  closing prompts from `db.prompts.close` (growable pool).
- **v0.5.0 (first dogfood iteration, from Chad's notes):** Blueprint **✎ daily
  notes drawer** under each day's three slots — default hidden, autosaving
  brain-dump on `day.note`, amber dot when a day holds one. Closing's night
  field raised to the "Tomorrow, at a glance" line (55vh), behind all windows;
  the enough-check sits in a radial pool of dark for legibility.

## Next up (tracker priorities)

1. **PWA** — manifest + service worker + Chiaro icons on the single file; the
   iPhone on-ramp (sync gate already cleared). Mask favicon exists; a real
   icon set from the mask glyph is needed. Mind the single-file constraint —
   manifest/SW likely small companion files in `src/`; keep the app itself one
   file.
2. **Keep dogfooding the arc.** Watching from wear-in: carry-to-tomorrow on
   unmet intentions (Chad's explicit defer — ask before building) · whether
   Opening-as-default grates on mid-day opens (red-team: Scheduled) · notes
   drawer stays-open-per-day persistence (offered 2026-07-23, not requested).

## Working conventions proven (unchanged)

- One file: `src/index.html`. Targeted edits via grep anchors; extract inline
  script → `node --check` after every JS change.
- Behavioral verification: `python3 -m http.server` + headless Chromium
  (`/opt/pw-browsers/chromium-*/chrome-linux/chrome --headless=new
  --no-sandbox --remote-debugging-port=NNNN`) + CDP WebSocket scripts (`ws`
  npm package); `Page.captureScreenshot` → send shots to Chad. Clear
  `localStorage` at test start. Verify `normalize()` against legacy-shaped db
  data when adding db fields. Measure layout claims (getBoundingClientRect in
  the CDP script) instead of eyeballing screenshots.
- Merge cadence authorized: commit → push branch → PR → merge to `main` per
  completed layer. Version-bump subtitle + JS header on release-worthy builds.
- `gh` CLI unavailable; use GitHub MCP tools.
- Secrets: never in repo or exports; Chad's `SYNC_SECRET` lives only in
  Cloudflare + his devices — never ask for it.
- Sibling repos (`garden-app`, `project-dashboard`) were study material for
  Closing — cannibalization done; not needed in-session unless Chad wants
  dashboard integration or learned-log appends.

## Open offer (Chad's call, not made)

CTT is **not** in the dashboard's `projects.json` registry, so der Hain doesn't
show a CTT card. A one-line registry add (`{ "repo": "chiaro-tinker-tools",
"tracker": "chiaro-tinker-tools-tracker" }`) would light it up — proposed
2026-07-24, awaiting Chad's word.

## Parked (don't build unbidden)

Carry-to-tomorrow on unmet intentions · the *active* five-more-minutes mirror ·
line-draw ritual think-mode · tinker's bell · at-rest encryption of the KV
blob · PWA icon set from the mask glyph (unblocks with PWA work) · macOS wrap
of CTT (`com.chiarotinkertools.ctt`) · PJT↔CTT backports · audit-flavored
STATUSES vocabulary cleanup · markdown-export grouping for flat projects.

## Voice

Earnest, literate, a little myth-soaked, unpretentious. Chad drives product;
push back honestly when something's wrong. Closing is a success state. Ordo ab
chao — carry a small lamp.
