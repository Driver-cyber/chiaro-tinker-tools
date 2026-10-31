# HANDOFF — for the next session (written 2026-10-31)

*Read `CLAUDE.md` first (the constitution), then `DECISIONS.md` (newest
entries at the bottom, just above the Parking Lot), then the tracker. Rewrite
or delete this file freely once it's absorbed.*

> **Native iPhone work lives in the mobile repo.** If you're the Mac session
> building the Primes app, read `chiaro-tinker-tools-mobile/HANDOFF.md`
> instead. It has the sync-first steps and the build checklist.

## Where things stand

- **CTT v0.13.0** is live at https://chiaro.chadstewartcpa.com (Pages builds
  `main`, output dir `src`). Its sibling **CTT Mobile v0.13.0** is at
  https://chiaromobile.chadstewartcpa.com. Everything is merged and nothing
  is in flight.
- **If this clone is old** (the Mac was off for weeks): run `git status`
  first. Show Chad any local changes and never discard them unasked. Then
  `git fetch origin && git checkout main && git pull --ff-only`, or use
  GitHub Desktop's Fetch → Pull. `main` should include `8386eab` (PR #54).

## Shipped since the last handoff (July → Oct 31)

v0.9.x rich notes, workshop links, Gertie at `/gertie/`, and import undo
(see DECISIONS, 2026-08-12). Then, 2026-10-20 → 31:
- **v0.10.0 — Blueprint Day view.** An hour grid for sketching blocks
  (`db.blocks`) under view-only Outlook events. Those come from an `.ics`
  import or the Worker's optional `?feed=outlook`, are kept device-local in
  `ctt_cal_v1`, and are never synced or exported.
- **v0.11–0.12 — Primes.** The prime-or-composite drill from Chad's handoff,
  now a full-screen **pocket tool** with a 168-of-168 found-primes meter
  (`db.primes.solved`). The engine is byte-identical with mobile.
- **v0.13.0 — Pocket FAB.** ▦/÷ left the appbar for a bottom-right ✦ that
  fans out Scratch, Primes and **Bell** (Bell = the ⧉ Document-PiP pop-out,
  from any room; without PiP it opens the bell on the Time Card).
- **Schema lockstep:** `db.blocks` and `db.primes` defaults exist in both
  repos.

## Open items (Chad's call)

- **Outlook live feed:** inert until Chad redeploys
  `sync/chiaro-sync-worker.js` and adds the `ICS_URL` Worker secret. **Firm
  policy check first** (`sync/SYNC-SETUP.md` §6). `.ics` import works today.
- **Desktop installability (PWA):** Scheduled, not now.
- **A test harness in the repo:** this month's CDP browser suites lived in a
  cloud scratchpad and are gone. The 2026-08-12 jsdom/corpus-test idea still
  stands, and it's the only thing that would mechanically enforce schema
  lockstep.

## Working conventions (unchanged)

- One file: `src/index.html`. Targeted edits; extract inline scripts →
  `node --check` after every JS change. Verify in headless Chromium + CDP
  with real input events.
- **CDP scar (2026-10-30):** navigating to the same URL with only a new
  `#hash` can reuse the in-memory document, so a "fresh" measurement runs on
  the pre-edit page. Go via `about:blank` first.
- Commit → PR → merge to `main` per completed layer (authorized).
  Version-bump the subtitle + JS header. Never ask for or commit
  `SYNC_SECRET` / `ICS_URL`.

## Voice

Earnest, literate, a little myth-soaked, unpretentious. Chad drives product;
push back honestly. Closing is a success state. Tabs are rooms, pockets are
tools. Ordo ab chao.
