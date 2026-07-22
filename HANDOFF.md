# HANDOFF — for the next session (written 2026-07-22)

*Read `CLAUDE.md` first (the constitution), then `DECISIONS.md` (current vibe +
settled decisions), then `chiaro-tinker-tools-tracker.html` (priorities). This
file is the short bridge between sessions — delete or rewrite it freely once
its contents are absorbed.*

## Where things stand

- **CTT v0.3.0 is live** at https://chiaro-tinker-tools.pages.dev/ (Cloudflare
  Pages auto-deploys `main`). Everything is merged; no work in flight.
- **Shipped so far:** Phase 0 Trophy `.dmg` (tag `pjt-trophy`, GitHub Release) ·
  storage seam (`ctt_v1` / `ctt-1` / `normalize()`) · templates + types ·
  happy-checkbox primitive (`makeCheck`/`ckBurst`) · five derived time
  categories with Total-card breakdown popup · **Cloudflare Worker+KV cloud
  sync** (live at Chad's `chiaro-sync` worker; secrets never in repo — see
  `sync/`) · chiaroscuro theme (dark walnut + amber `#F2A24A`, Cream alternate) ·
  Scratchpad notes model + autosave everywhere (~0.8s debounce) · **Blueprint**
  (7-day board, 3 slots/day; replaced the hated Daily W.I.N.; reuses legacy
  `day.win` storage) · **recurring carry-forward ritual** (any project can be
  Recurring → "Start next period": carry-by-default / resolved-strikes-✓ dual
  checkboxes) · **Opening tab** (default landing: single-line Thinker draws in
  ~6s, prompt pool in `db.prompts.open`, ≤3 intentions with from→to time boxes
  in `db.intentions` — deliberately separate from Blueprint) · plague-mask line
  glyph as favicon · lamp flicker.

## Next up (tracker priority #1)

**The Closing tab — the log-off room.** Chad's arc for the app: Opening →
Journal / Time / Blueprint → Closing. The Closing surface is a calm screen —
"the important stuff is held; go be with them" — plus whatever helps him log
off feeling good. **First step: study the two sibling repos** (now in session
scope): `Driver-cyber/garden-app` (cannibalize its calm screen) and
`Driver-cyber/project-dashboard` (der Hain project grove). Propose the Closing
design before building — measure twice. Then PWA (priority #2).

## Working conventions proven this session

- One file: `src/index.html` (~210KB). Targeted edits via grep anchors; extract
  inline script → `node --check` after every JS change.
- **Behavioral verification:** `python3 -m http.server` + headless Chromium
  (`/opt/pw-browsers/chromium-*/chrome-linux/chrome --headless=new --no-sandbox
  --remote-debugging-port=NNNN`) + hand-rolled CDP WebSocket test scripts
  (`ws` npm package); `Page.captureScreenshot` for visuals, sent to Chad.
  Clear `localStorage` at test start — state pollutes across runs.
- **Merge cadence authorized:** commit → push branch → PR → merge to `main` so
  Cloudflare production tracks progress. Version-bump the app subtitle + JS
  header comment (v0.x.0) on each release-worthy build.
- `gh` CLI unavailable; use GitHub MCP tools. Direct api.github.com is
  proxy-blocked.
- Secrets: never in repo or exports (`dbWithoutSecrets()` strips `db.sync`);
  Chad's `SYNC_SECRET` lives only in Cloudflare + his devices — never ask for it.

## Parked (don't build unbidden)

Line-draw ritual screens as boot/think modes (engine now partly absorbed into
Opening; assets in `assets/`) · tinker's bell · at-rest encryption of the KV
blob · mask app-icon set (favicon exists; PWA icons when PWA lands) · macOS
wrap of CTT (`com.chiarotinkertools.ctt`) · PJT↔CTT backports · audit-flavored
STATUSES vocabulary cleanup · markdown-export grouping for flat projects.

## Voice

Earnest, literate, a little myth-soaked, unpretentious. Chad drives product;
push back honestly when something's wrong. Closing is a success state. Ordo ab
chao — carry a small lamp.
