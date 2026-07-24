# HANDOFF — for the next session (written 2026-07-24, evening)

*Read `CLAUDE.md` first (the constitution), then `DECISIONS.md` (current vibe +
settled decisions), then `chiaro-tinker-tools-tracker.html` (priorities). This
file is the short bridge between sessions — delete or rewrite it freely once
its contents are absorbed.*

## Where things stand

- **The surface split happened (Chad's call, 2026-07-24).** This repo is now
  the **desktop** surface (desktop browser + Tauri macOS, eventually). The new
  sibling `Driver-cyber/chiaro-tinker-tools-mobile` is the **mobile** surface,
  with its own Cloudflare Pages deploy.
- **CTT Mobile v0.1.0 SHIPPED** in the sibling (its PR #1, merged): the app
  forked verbatim at CTT v0.5.0 + full PWA layer — manifest, shell-only
  service worker (network-first navigations, silent updates, never touches
  data or the sync origin), mask-glyph icon set, iOS standalone chrome + safe
  areas, and a tab-wrap fix (Closing was off-canvas at 390px). Verified
  headless at 390×844 including a true offline-reload boot. The sibling has
  its own CLAUDE.md / DECISIONS.md / tracker — read those when working there.
- **Schema lockstep is now a standing rule** (in both constitutions): the two
  repos share one synced db (`SCHEMA='ctt-1'`) over Worker+KV. Schema or
  `normalize()` changes land on both sides together, verified with
  legacy-shaped data. Never let the data model drift between siblings.
- **This repo's app is untouched** — still CTT v0.5.0, live at
  **https://chiaro.chadstewartcpa.com** (custom domain added 2026-07-25; the
  old https://chiaro-tinker-tools.pages.dev/ alias still serves). The mobile
  sibling's canonical door is **https://chiaromobile.chadstewartcpa.com**.
  PWA installs, localStorage, and sync config are per-origin — the custom
  domains are the doors to install/onboard from. Chad dogfoods daily with
  real ORDO data on cloud sync. Never ask for or commit his `SYNC_SECRET`.

## Next up (tracker priorities)

1. **Desktop installability: answered — Scheduled, not now** (Chad,
   2026-07-24). The MacBook dock install is still the destination (his words:
   CTT everywhere — dock, browser, phone; "my security blanket"), but
   plain-browser iteration speed wins while changes are heavy. Don't build it
   unbidden; when the churn settles and Chad says go, port the mobile repo's
   `manifest.webmanifest`/`sw.js` pattern near-verbatim (new CACHE name,
   desktop-flavored manifest).
2. **Keep dogfooding the arc** — unchanged watch list: carry-to-tomorrow on
   unmet intentions (deferred by choice, ask first) · Opening-as-default on
   mid-day opens (red-team: Scheduled) · notes-drawer persistence (offered,
   not requested).
3. **Mobile dogfood feedback will arrive** — Chad installing v0.1.0 on the
   actual iPhone (home screen → sync code → airplane-mode check). M1 mobile
   ergonomics work happens *in the sibling repo*, written by real friction.

## Working conventions proven (unchanged)

- One file: `src/index.html`. Targeted edits via grep anchors; extract inline
  script → `node --check` after every JS change.
- Behavioral verification: `python3 -m http.server` + headless Chromium
  (`/opt/pw-browsers/chromium-*/chrome-linux/chrome --headless=new
  --no-sandbox --remote-debugging-port=NNNN`) + CDP WebSocket scripts (`ws`
  npm package); `Page.captureScreenshot` → send shots to Chad. Clear
  `localStorage` at test start. Measure layout claims (getBoundingClientRect
  in the CDP script) instead of eyeballing screenshots. **Set
  `Emulation.setDeviceMetricsOverride` before measuring** — an un-emulated
  probe at the default window size invalidates every number (learned live).
- Merge cadence authorized: commit → push branch → PR → merge to `main` per
  completed layer. Version-bump subtitle + JS header on release-worthy builds
  (in the mobile repo: + the `sw.js` CACHE name).
- `gh` CLI unavailable; use GitHub MCP tools.
- Icons pipeline (mobile): mask glyph → HTML wrapper → headless-Chromium
  screenshot at 512 → pixel-measure centering → Pillow downscale for 192/180.
  Re-run rather than hand-edit PNGs if the glyph evolves.

## Open offers (Chad's call, not made)

- Desktop installability (above).
- CTT still isn't in the dashboard's `projects.json` registry (der Hain shows
  no CTT card). One-line adds would light up either or both repos — the mobile
  repo now has a tracker file too (`chiaro-tinker-tools-mobile-tracker.html`).
- ~~Cloudflare Pages check for the mobile project~~ — resolved: Chad wired
  custom domains for both surfaces 2026-07-25 (this session's sandbox can't
  reach the public web to verify the live pages; Chad confirms from his
  devices).

## Parked (don't build unbidden)

Carry-to-tomorrow on unmet intentions · the *active* five-more-minutes mirror ·
line-draw ritual think-mode · tinker's bell · at-rest encryption of the KV
blob · macOS wrap of CTT (`com.chiarotinkertools.ctt`) · iOS native wrap
(mobile repo, M2) · PJT↔CTT↔Mobile backports · audit-flavored STATUSES
vocabulary cleanup · markdown-export grouping for flat projects.

## Voice

Earnest, literate, a little myth-soaked, unpretentious. Chad drives product;
push back honestly when something's wrong. Closing is a success state. Ordo ab
chao — carry a small lamp.
