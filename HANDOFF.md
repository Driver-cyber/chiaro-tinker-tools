# HANDOFF — for the next session (written 2026-07-22, evening)

*Read `CLAUDE.md` first (the constitution), then `DECISIONS.md` (current vibe +
settled decisions), then `chiaro-tinker-tools-tracker.html` (priorities). This
file is the short bridge between sessions — delete or rewrite it freely once
its contents are absorbed.*

## Where things stand

- **CTT v0.4.0 is live** at https://chiaro-tinker-tools.pages.dev/ (Cloudflare
  Pages auto-deploys `main`). Everything is merged; no work in flight.
- **The arc is complete:** Opening (threshold room, default landing) →
  Project Journal / Time Card / Blueprint → **Closing (the log-off room,
  shipped this session as v0.4.0, PRs #13–#14)**.
- **Closing tab:** read-only ledger of the held day (intentions met /
  *entrusted*, hours given, "the shelves" — each active project a lamp chip
  with its held-scratchpad-line count, tomorrow's Blueprint glance) over a
  chiaroscuro night field (150 blades, garden-app's calm screen
  re-materialized; reduced-motion honored). Below the ledger: the optional
  **"It was enough."** check — per-date in `db.closing`, no history surfaced,
  streak impossible by construction. Closing prompts draw from
  `db.prompts.close` (growable pool, mirrors `db.prompts.open`).

## Next up (tracker priorities)

1. **PWA** — manifest + service worker + Chiaro icons on the single file; the
   iPhone on-ramp (sync gate already cleared). Mask favicon exists; icon set
   needed.
2. **Dogfood the full arc.** Chad is wearing the Closing room in. Two things
   deliberately parked pending that: **carry-to-tomorrow** on unmet intentions
   (Chad chose to defer), and whether **Opening-as-default** grates on mid-day
   opens (red-team verdict: Scheduled — no conditional-landing logic; if it
   grates, it's a settled-question conversation, not a build).

## Working conventions proven (unchanged)

- One file: `src/index.html`. Targeted edits via grep anchors; extract inline
  script → `node --check` after every JS change.
- Behavioral verification: `python3 -m http.server` + headless Chromium
  (`/opt/pw-browsers/chromium-*/chrome-linux/chrome --headless=new
  --no-sandbox --remote-debugging-port=NNNN`) + CDP WebSocket scripts (`ws`
  npm package); `Page.captureScreenshot` → send shots to Chad. Clear
  `localStorage` at test start. **Verify `normalize()` against legacy-shaped
  db data** when adding db fields (done for `prompts.close`/`closing`).
- Merge cadence authorized: commit → push branch → PR → merge to `main` per
  completed layer. Version-bump subtitle + JS header on release-worthy builds.
- `gh` CLI unavailable; use GitHub MCP tools.
- Secrets: never in repo or exports; Chad's `SYNC_SECRET` lives only in
  Cloudflare + his devices — never ask for it.

## Parked (don't build unbidden)

Carry-to-tomorrow on unmet intentions (Chad's explicit defer — ask before
building) · the *active* five-more-minutes mirror (intentions met
mid-session) · line-draw ritual think-mode · tinker's bell · at-rest
encryption of the KV blob · PWA icon set from the mask glyph · macOS wrap of
CTT (`com.chiarotinkertools.ctt`) · PJT↔CTT backports · audit-flavored
STATUSES vocabulary cleanup · markdown-export grouping for flat projects.

## Voice

Earnest, literate, a little myth-soaked, unpretentious. Chad drives product;
push back honestly when something's wrong. Closing is a success state. Ordo ab
chao — carry a small lamp.
