# HANDOFF — for the next session (written 2026-07-26, late evening — session closed clean)

*Read `CLAUDE.md` first (the constitution), then `DECISIONS.md` (current vibe +
settled decisions), then `chiaro-tinker-tools-tracker.html` (priorities). This
file is the short bridge between sessions — delete or rewrite it freely once
its contents are absorbed.*

## Where things stand

- **Two surfaces, both live, shipped in step on 2026-07-26:**
  desktop **CTT v0.8.3** at https://chiaro.chadstewartcpa.com · mobile
  **CTT Mobile v0.4.3** at https://chiaromobile.chadstewartcpa.com (the
  canonical doors — installs/localStorage/sync config are per-origin). Chad
  dogfoods daily with real ORDO data on cloud sync. Never ask for or commit
  his `SYNC_SECRET`. Cloudflare Pages build output dir stays `src` in both
  projects.
- **The belt has pockets now — the scratch sheet (v0.8.0 → v0.8.3).** Chad's
  ask: an 8×25 grid "so I don't have to close my eyes and squint" holding
  numbers. He also chose the placement from three options, and that choice
  became a pattern worth keeping: **tabs are rooms, pockets are tools.** A
  dim **▦** in the appbar summons the sheet as an overlay from *any* room;
  ✕/Esc/backdrop puts it back and the room underneath never moves. Future
  pocket tools hang here without crowding the header.
  - Engine: hand-rolled recursive-descent evaluator (~80 lines, no library) —
    `+ - * /` with parens, cell refs A1–H25, SUM/AVG/MIN/MAX ranges. Napkin
    rules: blank/text = 0; `#ERR`/`#CYCLE`/`#DIV0`/`#REF` never eat the typed
    text. Two-tap "Really clear?" instead of a modal.
  - Iterated live the same evening on Chad's dogfood asks: **v0.8.1**
    arrow-key navigation (Left/Right only from text edges, so editing never
    fights navigation) + **Excel-style point-to-refer** (mid-formula, click a
    cell to insert its ref; consecutive clicks replace the last one; a
    complete formula commits and moves) · **v0.8.2** accounting format
    (commas + fixed two decimals, display-only — raw text untouched on focus)
    · **v0.8.3** the **composition bar** (a wide mirror of the edited cell
    above the grid, for formulas longer than a cell) + source-cell
    highlighting.
  - Scope deliberately frozen: no formatting, no extra rows/sheets. A paper
    napkin with a calculator in it. Negatives use a minus sign; accountant's
    parentheses offered and not taken (yet).
- **The bell is now a system.** Arc: v0.6.0 tinker's bell (ember-field timer,
  🔔 per time block pre-fills duration, one ring muted by default,
  pulse-until-noticed) + derived code hints in the log dropdown → v0.6.1
  ⧉ Document-PiP pop-out (desktop Chrome/Edge) → v0.6.2 listener-wiring fix →
  **v0.7.0 the visual registry** (2026-07-26; Chad's idea, planned in a
  claude.ai chat, geometry lifted verbatim from its prototype): six swappable
  countdown visuals — Ember grid, Balance, Moon, The Thinker, Lantern,
  Sundial — random per timer start/reset (never repeating the current one),
  Visual dropdown hot-swaps mid-run preserving timer state, a manual pick
  holds for the current timer only. Renderers are pure functions of elapsed
  fraction: `render(p) → {vb, body, post?}`; **adding a visual = appending
  one object to `BELL_VISUALS`** — it joins the pool and dropdown
  automatically. The rung pulse fires after the ring on the `.bell-vis`
  container, under any renderer. All ephemeral — zero schema impact.
- **Mobile sibling** (`chiaro-tinker-tools-mobile`) shipped twice the same
  day: v0.2.0 backported the bell + hints and added mobile-native
  **⛶ full-screen mode** (pure CSS state on the same nodes — the PiP
  cross-document scar can't reopen) with **Screen Wake Lock** while
  full-screen + running (re-armed on visibilitychange; the OS drops it
  silently on backgrounding) → v0.3.0 carried the identical visual-registry
  engine (visuals render inside full-screen untouched; `.bell-vis` grows to
  `min(84vw,50vh)`).
- **Schema lockstep took its first real bite — and held.** The bell rounds
  were ephemeral/derived, so lockstep was only a habit. `db.scratch` is the
  first genuine schema addition since the split: it landed in **both repos
  the same hour**, with the constitution's load-bearing test actually run —
  a pre-scratch db staged in localStorage, cold-booted, gaining the default
  while preserving a planted canary field. Both normalizers also preserve
  unknown keys, so a skewed deploy window can't drop a sibling's data. Every
  scratch patch since (v0.8.1–0.8.3 ↔ v0.4.1–0.4.3) shipped same-day too.

## Next up (tracker priorities)

1. **Dogfood the pocket and the lamps — real ORDO numbers, real blocks.**
   The scratch sheet went from bare grid to formula bar in one evening
   *because* Chad was using it as we built; that loop is the method now.
   Watch for: F2-to-edit muscle memory, Ctrl/Cmd-arrow jumps, whether
   accountant's parentheses for negatives get asked for, and whether the
   8×25 frame ever actually cramps. Which bell visuals get reached for is
   the same question — canon set deliberately deferred. Bell follow-ons
   parked: the balance-zoom variant (a separate `balance-zoom` renderer,
   not a mode), sound iteration, deeper bell⇄entry tie-in, a "keep this
   one" pin if holds-for-one-timer proves annoying.
2. **Desktop installability: still Scheduled, not now** (Chad, 2026-07-24).
   When churn settles and Chad says go: port the mobile
   `manifest.webmanifest`/`sw.js` pattern near-verbatim, new CACHE name.
3. **Unchanged watch list:** carry-to-tomorrow on unmet intentions (deferred
   by choice, ask first) · Opening-as-default on mid-day opens (red-team:
   Scheduled) · custom code abbreviations only if derived hints aren't enough
   (schema change → lockstep both repos).

## Working conventions proven (unchanged, plus one new scar)

- One file per repo: `src/index.html`. Targeted edits via grep anchors;
  extract inline script → `node --check` after every JS change.
- Behavioral verification: `python3 -m http.server` + headless Chromium
  (`/opt/pw-browsers/chromium-*/chrome-linux/chrome --headless=new
  --no-sandbox --remote-debugging-port=NNNN`) + CDP WebSocket scripts (`ws`
  npm package). Clear `localStorage` at test start;
  `Network.setCacheDisabled` always; `Emulation.setDeviceMetricsOverride`
  **before** measuring; drive **real element clicks in the element's own
  document**, never call handlers directly. **Scars (2026-07-26):** (a) stop
  the bell before staging visual states in tests — a stray running timer's
  1 Hz tick repaints over staged p-values and manufactures phantom bugs;
  (b) an unfocused headless document moves `activeElement` on `focus()` but
  **swallows the focus/blur events**, so commit handlers silently never run
  — call `Emulation.setFocusEmulationEnabled` **and re-issue it after every
  navigation**, since it does not survive one. Both scars produced convincing
  phantom bugs where the app was fine and the instrument was lying.
- For input-driven features, prefer **real `Input.dispatchKeyEvent` /
  `Input.dispatchMouseEvent`** over synthetic JS events — that's what caught
  the point-to-refer flag clearing on `keydown` only (IME/autocomplete/paste
  fire `input` without one, which would have misbehaved on Chad's iPhone
  keyboard).
- Merge cadence authorized: commit → push branch → PR → merge to `main` per
  completed layer. Version-bump subtitle + JS header (+ mobile `sw.js` CACHE)
  on release-worthy builds. `gh` CLI unavailable; GitHub MCP tools.
- Cross-session design handoffs work: a claude.ai planning chat produced
  `chiaro-timer-visuals.html` with working renderer math; this session
  verified the math and lifted it verbatim instead of re-deriving. Logged as
  a `first_ever` in the learned-log.

## Open offers (Chad's call, not made)

- Desktop installability (above).
- CTT still isn't in the dashboard's `projects.json` registry — no CTT cards
  on der Hain. The learned-log holds the whole story (entries through
  2026-07-26 incl. the visual system); only the cards are missing. One-line
  adds light them up.
- Inbox sweep skipped again at session-end (derhain gist API is outside this
  sandbox's network policy — three sessions running now). Sweep from a surface
  that can reach it, or accept the pile-up until then.
- **`/session-end-protocol` can't bootstrap in Claude Code on the web** — it's
  a *user-level* skill on Chad's Mac and doesn't travel to remote sessions;
  the documented wiki fallback (chadwiki) is also blocked by this
  environment's network policy. Every session-end here has been run by hand
  off the per-project hooks in the CLAUDE.md files. Two real fixes, offered
  and not yet taken: **(a)** check the protocol into a repo as
  `.claude/skills/session-end-protocol/SKILL.md` (loads in every surface that
  clones the repo — the sturdier fix), or **(b)** widen the environment's
  network policy to allow chadwiki + derhain, which also unblocks the inbox
  sweep. Chad's call; he deferred it mid-build, reasonably.

## Parked (don't build unbidden)

Carry-to-tomorrow on unmet intentions · the *active* five-more-minutes mirror ·
line-draw ritual think-mode · balance-zoom renderer · accountant's parentheses
for negative scratch numbers · at-rest encryption of
the KV blob · macOS wrap of CTT (`com.chiarotinkertools.ctt`) · iOS native
wrap (mobile repo, M2) · PJT↔CTT↔Mobile backports · audit-flavored STATUSES
vocabulary cleanup · markdown-export grouping for flat projects.

## Voice

Earnest, literate, a little myth-soaked, unpretentious. Chad drives product;
push back honestly when something's wrong. Closing is a success state. Ordo ab
chao — one brain, many lamps; tabs are rooms, pockets are tools.
