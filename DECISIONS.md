# 🗺 Chiaro Tinker Tools — Evolution & Decision Log

> **Note to Claude:** This project is iterative by design. Read this log to
> understand the current vibe before suggesting changes. Settled decisions
> below shouldn't be relitigated without a real reason — but "we found a real
> reason" is always valid. Rules are defaults; judgment is primary.

## 🎯 The North Star (Current Goal)
* **Goal:** Chad's personal digital tool belt — timecard + project journal
  re-pointed at ORDO, growing into tasks and the tinker's bell.
* **Deeper mission:** trustworthy closure. Chiaro's real output is the room
  Chad walks into after he closes it — present with family, mind-space set
  down. Two good endings: **completed** (pride of a job done) and **entrusted**
  (open work made *bounded* instead of infinite — clay on a shelf with a note).
* **Vibe:** chiaroscuro, warm lamp in honored dark, myth-literate and
  unpretentious. Good enough is perfect; ship and discover the form.
* **Current phase:** Phase 0 (the Trophy) → Phase 1 (CTT MVP).

## 🛠 Active Tech Stack
* **App:** single-file HTML (`src/index.html`), vanilla JS, no framework, no build
* **State:** one in-memory `db` JSON object with schema version + `normalize()`
* **Persistence:** localStorage (new CTT key) + one-tap JSON export/import
* **Web deploy:** Cloudflare Pages auto-deploy from `main`; PWA early in Phase 1
* **Desktop:** Tauri 2 (Phase 0 targets macOS `.dmg`; Windows heritage retired)
* **Repo:** `Driver-cyber/chiaro-tinker-tools` (public; zero secrets in source)

## 📝 Change Log (Decisions)

* **[2026-07-18] Project founded.** Fork of PJT (Chad's firm-facing single-file
  timecard/journal, Windows/Tauri). CTT is the personal re-point.
    * *Decision — Phase 0 "Trophy" first:* wrap the repo as-is (PJT branding,
      demo data) as a macOS `.dmg`. Showpiece for family + first live test of
      the macOS Tauri toolchain on a known-good artifact. Tag `pjt-trophy`.
      Gatekeeper right-click-open is acceptable; signing deliberately deferred.
    * *Decision — platform order:* web app on Cloudflare Pages → PWA early →
      macOS wrap of CTT → iPhone (native or PWA-supreme) later. Design for
      MacBook first, phone second.
    * *Decision — MVP scope (Phase 1):* re-point at ORDO. Strip audit-binder
      defaults; free-form custom-step projects. Drop billable/nonbillable/
      unpaid time types entirely; lean codes whose one job is **admin vs.
      client-deliverable** separation. New storage key + schema version.
      Export/import from day one (non-negotiable).
    * *Decision — sync parked, seam preserved:* localStorage + export is the
      MVP posture on the Mac. Keep the single write/read storage seam clean so
      Worker+KV or Gist sync slots in later without a rewrite. Hard gate:
      off-device durability required before iPhone becomes a primary device
      (iOS PWA storage eviction risk).
    * *Decision — encryption deferred:* PJT's Web Crypto machinery exists and
      is proven; a single-user local tool doesn't need it yet. Revisit with sync.
    * *Decision — anti-engagement ethos is architecture:* no streaks, badges,
      guilt, or re-engagement mechanics, ever. Closing is a success state.
    * *Decision — open/close lens adopted:* every feature must answer "what am
      I looking for on open?" and "how should it feel to close?" A feature that
      can't answer the second probably doesn't ship.
    * *Decision — clutter lives at the edges:* personality, trinkets, and
      lived-in warmth belong in empty states, the guide, the bell, the naming.
      Working surfaces (day grid, project steps) stay crisp. That's the line.
    * *Decision — founding docs:* CLAUDE.md + DECISIONS.md + tracker created
      per house standard. Deeper docs (ARCHITECTURE, DATA-MODEL, BRAND) are
      generated and maintained by Claude Code during the build, when code can
      be their source of truth.

* **[2026-07-21] Phase 1 build underway (Claude Code, in-repo).**
    * *Storage seam (L1):* new localStorage key `ctt_v1` + `schema:'ctt-1'` +
      `normalize()` forward-compat path; CTT starts clean, never adopts PJT
      data. Clarified: the "storage key" is *browser localStorage*, not a gist —
      cloud sync (gist or Worker+KV) stays parked until a second device joins.
    * *Templates + types (L2a):* two orthogonal dimensions. **Template** =
      structure — ORDO Monthly (7 steps → future codes 1–7: reconcile, month
      close, filings, financial analysis & forecasting, meeting agenda prep,
      present/host meeting, follow-up), Simple (Plan · Execute · Review), and
      Audit (kept as an option, no longer default). **Type** = life-domain for
      organizing/filtering: ORDO · Tinker · Family · Personal — a project
      property + filter chips (not separate tab-screens; reversible, tab-split
      parked). Non-audit templates render as a clean flat list; audit keeps its
      grouped A–Z binder. Dropped PJT's audit-section backfill migrations.
    * *Carry-forward (planned L4):* dual checkbox per open note — left "carry"
      (default on), right "resolved" (checking it clears carry); resolving is a
      completion, so it gets the happy animation. One reusable animated-checkbox
      primitive for all of Chiaro; lives at the month-close threshold, not the
      day-grid.
    * *Single-file reaffirmed:* stay single-file HTML through Phase 1–2; revisit
      only when the ritual engine + bell push editing size, or a real PWA build
      pipeline is wanted. Chad is open to splitting if a constraint appears.

* **[2026-07-21] Cloud sync live + five categories + chiaroscuro v0.1.0.**
    * *Sync (SHIPPED, un-parked):* Cloudflare Worker + KV (`sync/`), deployed by
      Chad (`chiaro-sync.cstewch.workers.dev`) and verified across devices.
      Secrets stay out of the repo: URL + secret entered at runtime, stored
      per-device; a one-paste **Sync code** (`CHIARO1-…`) onboards a new device.
      This clears the constitution's off-device-durability gate — the iPhone
      may now graduate to primary whenever Chad wants.
    * *Time categories:* codes now carry a **derived** category — the linked
      project's type (ORDO/Tinker/Family/Personal), else Admin. Summary is one
      clickable **Total**; a resizable popup shows the 5-way breakdown. Standard
      codes trimmed to Admin + Break (baked-in, out of the way). Lunch dropped.
    * *Notes model:* Preparer/Reviewer retired (legacy data preserved, exports
      label it "legacy"); one **Scratchpad** per step — named for creative space,
      not "Open Items" open-endedness. **Auto-save everywhere**: inline and
      expanded editor commit as you type (~0.8s debounce); closing the editor
      any way (button/backdrop/Escape) commits first. Editor button is just
      "Close." Fixes a real data-loss bug Chad hit while dogfooding.
    * *Chiaroscuro shipped (CTT v0.1.0):* dark is the material — near-black
      walnut field, one amber lamp (#F2A24A), lamp-glyph brand, serif titles,
      happy checkbox now glows amber. "Light mode" is now **Cream** — ink on
      parchment, per the brand's export face. One-time migration lands everyone
      on dark; the toggle (🕯 Dark / Cream) remains.

* **[2026-07-22] Daily W.I.N. retired · Blueprint · recurring carry-forward ritual (v0.2.0).**
    * *Daily W.I.N. removed on sight:* firm-specific form Chad explicitly hates —
      the moniker and the daily imposition, not the idea of naming intentions.
      Replaced by **Blueprint**: a 7-day board (Sun–Sat), **three slots per day**,
      happy checkboxes, week nav, Copy Week Plan. Fill it Sunday; return to it
      when the day goes sideways to re-ground instead of spiraling. Data note:
      slots reuse the legacy `day.win` field (existing entries preserved; legacy
      days with >3 filled slots still show them all). "Today's three" mini panel
      stays on the Time Card.
    * *Carry-forward generalized (L4 SHIPPED):* not ORDO-only — any project can
      toggle **Recurring** (project header + create modal; ORDO template defaults
      on, cadence is Chad's business — monthly close, weekly budget, whatever).
      Recurring projects get **🔄 Start next period**: the ritual lists every
      scratchpad line with dual checks — *Carry* (default on, the safeguard) and
      *Resolved* (strikes ✓ into the archive, with the happy animation; checking
      one unchecks the other). Begin → old period archives, steps reset, carried
      lines land in the fresh period, time codes re-seed, name auto-bumps
      (July→August, 2026-07→2026-08).
    * *Next big move — Open/Close tab architecture:* Chad's direction: open and
      close the day on purpose — fear is the torrent. Cannibalize his
      `garden-app` (calm screen) and `project-dashboard` (der Hain grove) for
      the Closing surface. **Revised (Chad, same day):** the original
      "returning or starting?" popup idea is retired — a gate is a wall, not a
      mirror. Opening is a *tab* and the default landing, never a click-through.

* **[2026-07-22] Opening tab shipped (v0.3.0).**
    * *The threshold room:* new first tab, **default on every load**. The
      single-line Thinker (from `assets/`, inlined — no external calls) draws
      himself in over ~6s, tap to pause; an intention prompt fades in, drawn
      at random from a growable pool in the db (`db.prompts.open`).
    * *Today's intentions:* up to three, each with a from→to time box
      (e.g. 1100 → 1230) and the happy checkbox; progress reads "n / m met."
      Stored per-date in `db.intentions` — **deliberately separate from the
      Blueprint** (Chad: the board holds the week's small reminders; Opening
      names today's few big rocks; no merging or overriding). A read-only
      "week at a glance" panel mirrors the Blueprint with a jump link.
    * *Mask + glow:* original plague-mask glyph (line style, amber) is now the
      favicon — first appearance of Plagued-by-Concepts in the app chrome. The
      brand lamp breathes on an 8s flicker. Both honor reduced-motion.
    * *Still open:* Closing tab (calm screen) — waiting on repo access to
      `garden-app` / `project-dashboard` to study what to cannibalize.

* **[2026-07-22] Closing tab shipped (v0.4.0) — the log-off room.**
    * *Phase-gate red team (before building):* **Confirmed** — Closing is a tab,
      not a summonable ritual (inspectable, skippable, never modal; matches the
      Opening-tab architecture). **Confirmed** — cannibalize the *mechanism* of
      garden-app's calm screen (traveling-wave field, one-job-per-element
      restraint, breath-paced check), never its sage/sky palette; re-materialize
      in chiaroscuro. **Scheduled** — "Opening as default on every load" may
      grate on the eighth mid-day open; dogfood first, no conditional-landing
      logic built (the app deciding for Chad would be worse than the friction).
    * *The room:* a read-only **ledger of the held day** — intentions met or
      *entrusted* (never "failed," never red), hours given (a statement, no
      comparisons), **the shelves** (der Hain's gift: each active project a
      small lamp chip with its count of held scratchpad lines), and tomorrow's
      Blueprint glance so tomorrow is bounded before leaving. The room asks for
      no input. Below it, a **night field**: 150 swaying blades tipped in
      lamplight (garden-app's calm screen re-materialized), reduced-motion
      honored.
    * *"It was enough."* — the parking-lot enough-on-close ritual landed in its
      smallest honest form: one optional check (happy-checkbox primitive),
      keyed per-date in `db.closing`, history never surfaced — a streak is
      impossible by construction. Mirror, not wall.
    * *Closing prompts:* `db.prompts.close` pool mirroring the Opening pool,
      drawn at random ("The bench will hold it." / "Take the lamp. The rest
      keeps." …). Growable in the db.
    * *Deliberately left out:* any capture input (scratchpads, Blueprint, and
      intentions are the homes; a new inbox is a new unbounded thing), weekly/
      monthly reflection (a different room), animation gating.
    * *Deferred, on the table:* a per-line **"carry to tomorrow"** on unmet
      intentions. Chad's call: wear the room in for a few days first.

* **[2026-07-23] Dogfood iteration 1 (v0.5.0) — two days in the rooms.**
    * *Blueprint daily notes:* a ✎ notes drawer under each day's three slots —
      default hidden, expands to a brain-dump textarea (autosave, `day.note`).
      A subtle amber dot marks days that hold a note. The point: thoughts get
      a home without crowding the three; the working surface stays crisp.
    * *Closing field raised:* the night grass now grows to roughly the
      "Tomorrow, at a glance" line, rising behind all windows (ledger stays
      z-above). The "It was enough." check gained a quiet radial pool of dark
      so it reads over the tall grass in both themes.

* **[2026-07-24] The surface split — CTT Mobile founded (Chad's call).**
    * *Decision — two repos, one soul:* this repo stays the **desktop** surface
      (desktop browser + Tauri macOS wrap); the new
      `Driver-cyber/chiaro-tinker-tools-mobile` is the **mobile** surface
      (mobile-browser PWA now, iOS native someday), with its own Cloudflare
      Pages deploy. Each surface stays focused instead of one repo carrying
      both sets of compromises. Founding docs inherited whole over there, with
      the split caveat.
    * *Shipped there — CTT Mobile v0.1.0:* `src/index.html` forked verbatim at
      CTT v0.5.0 + PWA layer (manifest, shell-only service worker with silent
      network-first updates, mask-glyph icon set, iOS standalone chrome +
      safe areas, tab-wrap fix — Closing was off-canvas at 390px). Mobile runs
      its own version line (v0.1.x) and decision log from the fork point.
    * *Decision — schema lockstep (load-bearing):* both repos share one synced
      `db` (`SCHEMA='ctt-1'`) through the Worker+KV bridge. Any schema or
      `normalize()` change must land on both sides (or be verified tolerated)
      before merging, verified with legacy-shaped data. Surface divergence:
      yes. Data-model divergence: never.
    * *Answered same day (Chad) — desktop installability: Scheduled, not now.*
      The destination is confirmed: CTT everywhere — installed on the MacBook
      (dock), in the browser, on the phone (eventually native iPhone). "My
      security blanket — accessible everywhere, all the time." But while the
      app is changing fast, the plain browser's iteration speed wins; the
      dock install waits until the churn settles. When it's time, the mobile
      repo's manifest/sw.js pattern ports over nearly verbatim.

* **[2026-07-25] Custom domains — both surfaces get real doors (Chad).**
      **https://chiaro.chadstewartcpa.com** fronts this repo's Pages deploy;
      **https://chiaromobile.chadstewartcpa.com** fronts the mobile sibling.
      The `pages.dev` aliases still serve the same builds. No code changes —
      all paths are relative. Per-origin note (matters when the dock install
      lands, and already matters on the phone): PWA installs, localStorage,
      and sync-code config are per-origin, so the custom domains are the
      canonical doors to install and onboard from.

* **[2026-07-25] v0.6.0 — the tinker's bell rings (un-parked by Chad) + code hints.**
    * *Code hints (Chad's ask):* the log dropdown now reads
      "a — VPS 1 · Reconcile accounts" — hint **derived at render time** from
      the linked step name (prefix stripped, ~18-char truncation). Not stored:
      step renames already propagate into `linkSection`, so hints can't go
      stale and there's **no schema change** (mobile lockstep untouched).
      A hand-typed abbreviation field was considered and deliberately deferred
      — it would be a schema change; revisit only if derived names aren't
      enough after dogfooding.
    * *Tinker's bell (parked since founding, bid in by Chad):* a collapsible
      panel atop the Time Card Day Entry — hidden by default, opened by its
      carrot (default 25 min) or by a **🔔 on any time block** (left of ✕),
      which pre-fills the block's computed duration and names what it's
      keeping time for. The face is an **ember field**: 100 amber cells on
      walnut, extinguishing in sequence as time passes; serif countdown
      beside it. Pause/Resume/Reset; collapsed header shows the remaining
      time small while running.
    * *The ring (mirror, not wall):* one soft synthesized bell strike
      (WebAudio, original instrument, mutable) and — Chad's addition — a
      **slow breathing pulse + amber glow on the field until noticed**: a
      signal that waits for your eyes instead of grabbing them. Deliberately
      excluded: browser notifications, tab-title countdowns, auto-restarts,
      overtime counters. Reduced-motion gets a static glow, no pulse.
    * *Ephemeral by design:* no db fields, no sync traffic, nothing persisted.
      A bell you set while present. The lock-screen Live Activity vision is
      parked with the iOS-native phase (mobile repo M2).

* **[2026-07-25] v0.6.1 — the bell floats (Document Picture-in-Picture).**
      Chad asked for the "weird limited mini window" — it has a name. A ⧉
      Pop out button in the bell header (feature-detected: exists only where
      the Document PiP API does — desktop Chrome/Edge; Safari/Firefox/mobile
      never see it) **moves** the bell's face into a small always-on-top
      floating window: same DOM nodes, same running timer, pulse and rung
      state carry over; the engine stays in the page (bell element refs are
      cached, not looked up, so nodes survive the document move). Closing
      the mini window folds the face back into the panel. Also v0.6.1: bell
      **defaults to muted** (Chad runs it silent; the pulse is the signal —
      sound-on-by-default meant muting it every session). Known bound: the
      floating window is a child of the tab — closing the CTT tab closes it;
      switching tabs/apps doesn't.

* **[2026-07-25] v0.6.2 — the floating bell's buttons work (first dogfood catch).**
      Chad popped the bell out and the controls went dead: inline `onclick`
      attributes resolve in the document the node lives in, and the PiP window
      has no scripts. Bell controls now use real `addEventListener` handlers —
      listeners travel with moved nodes. Bonus fix from the same report: the
      big countdown follows the Minutes field live while idle (typing also
      settles a rung pulse — typing is noticing). *Scar for the wall: CDP
      tests that call functions directly can't catch handler-wiring bugs —
      drive real element clicks in the element's own document.*

* **[2026-07-26] v0.7.0 — the timer visual system (Chad's idea, planned in a
  claude.ai session, built here).**
    * *Decision:* replace the single pixel-grid countdown with a **swappable
      renderer registry**. Ship five visuals (Balance, Moon, The Thinker,
      Lantern, Sundial) plus the original ember grid as a sixth.
    * *Decision:* **random visual per timer start/reset**; a Visual dropdown
      override that **hot-swaps while preserving timer state**. Renderers are
      pure functions of elapsed fraction `p` — `render(p) → {vb, body, post?}`
      — the `bell` object stays the only brain. A manual pick holds for the
      current timer only, then the random pool returns.
    * *Decision:* the timer is an **edge surface**, so it is the sanctioned
      home for growing "clutter." Adding a visual = appending one object to
      `BELL_VISUALS`; it joins the pool and dropdown automatically. Canon set
      deliberately deferred until Chad sees which ones he reaches for.
    * *Guardrail:* the random visual is a pleasure at the **start** of a
      block, never a reward for continuing — no streaks, unlocks, or
      collections. Nothing pulses or accelerates during the countdown; every
      p=1 state is warm and settled (full moon, ember, shadow at rest). The
      **rung pulse survives** unchanged: it fires *after* the ring, on the
      container, as the muted bell's only signal — the two designs compose.
    * *Reconciliations from the handoff review:* no Google Fonts (the app
      stays self-contained; prototype tokens mapped onto app palette vars, so
      cream mode inherits for free) · Thinker's 40 `getTotalLength()` calls
      cached after first mount · fixed square letterbox so hot-swapping the
      tall Thinker against wide dials never reflows the panel · repaints are
      naturally 1 Hz (guarded on integer-second p changes), ambient by
      construction and kind to reduced-motion.
    * *Verified* headless with real clicks: all six render clean at five
      p-values; hot-swap mid-run preserved left/running exactly; pin cleared
      to Random on reset; Thinker halfway = figure fully drawn, mask fully
      undrawn (29+11 cached lengths); grid at half = 50/100 lit; rung pulse
      lands on the container under any renderer; PiP carries the SVG, swaps
      from inside, and folds back home. *Harness scar re-learned:* a stray
      running timer from an earlier test step repaints over staged states —
      stop the bell before staging p, or the 1 Hz tick wins the race.
    * *Prototype credit:* geometry lifted verbatim from
      `chiaro-timer-visuals.html` (planning chat) — terminator ellipse,
      balance tilt, sundial shadow, stroke-dash draw. Don't re-derive it.

* **[2026-07-26] v0.8.0 — the scratch sheet, and the birth of the pocket-tool
  pattern (Chad's idea + placement call).**
    * *Decision (Chad):* an 8×25 spreadsheet grid for un-squinting numbers —
      "so I don't have to close my eyes and visualize it in my mind." Text,
      numbers, and `=` formulas: `+ - * /` with parentheses, cell refs
      (A1..H25), and SUM/AVG/MIN/MAX over ranges. Hand-rolled ~80-line
      recursive-descent evaluator, zero libraries. Napkin rules, not Excel
      rules: blank/text cells count as 0; errors show `#ERR`/`#CYCLE`/
      `#DIV0`/`#REF` but the typed text is never lost. Scope deliberately
      frozen: no formatting, no extra rows/sheets — it's a paper napkin with
      a calculator in it.
    * *Decision (Chad, from three options): the pocket-tool pattern.* Not a
      sixth tab (a scratch sheet is not a room), not a panel inside one room
      (numbers strike anywhere). A dim ▦ glyph in the appbar summons it as
      an overlay from any room; ✕/Esc/backdrop puts it back; the room
      underneath never moves. **Tabs are rooms; pockets are tools** — the
      belt now has a place for future pocket tools to live without
      crowding the header. Clearing is a two-tap arm ("Really clear?"),
      not a modal.
    * *SCHEMA LOCKSTEP — first real bite since the split.* Cells persist as
      raw strings in `db.scratch.cells` through the one save() seam (synced,
      exported, secrets-stripping untouched). `mergeDefaults()` gains the
      `p.scratch` default in BOTH repos the same day. Verified with
      legacy-shaped data: a pre-scratch db staged in localStorage boots
      clean, gains the default, and preserves a canary field — the
      load-bearing migration test, actually run. (Both repos' normalize
      also preserves unknown keys, so a skewed deploy window can't drop
      the field — but same-day is the rule, and it held.)
    * *Verified* headless with focus-emulated real events: SUM/AVG/MIN/MAX,
      parens, division, cross-cell propagation, cycle/#ERR/#DIV0/#REF,
      focus-shows-raw/blur-shows-computed, Enter-moves-down, Esc-vs-modal
      priority, cold-reload persistence, export carrying db.scratch with
      sync stripped.
    * *Harness scar (new, recorded):* an unfocused headless document moves
      `activeElement` on `focus()` but **swallows the focus/blur events** —
      commit handlers silently never run and phantom "nothing persists" bugs
      appear. `Emulation.setFocusEmulationEnabled` before any focus-driven
      test. (The engine was never wrong; the harness was.)

* **[2026-07-26] v0.8.1 — scratch-sheet ergonomics (Chad's dogfood asks,
  same evening).**
    * *Arrow-key navigation:* Up/Down always move cells; Left/Right move
      cells only from the text's edge or with the value fully selected
      (as right after focus) — mid-formula they stay caret moves, so
      editing never fights navigation. No wrap at the grid edges.
    * *Excel-style point-to-refer:* mid-formula (caret right after `=` or
      an operator), clicking a cell INSERTS its ref; consecutive clicks
      replace the last pointed ref while you hunt; typing anything ends
      the span. With a complete formula, a click just commits and moves —
      Excel's own rule, kept.
    * *Bug caught by the harness, fixed for real users:* the point-span
      flag cleared only on keydown — but IME/autocomplete/paste fire
      `input` without one (so does char-only synthetic typing, which is
      how the harness caught it). Cleared on `input` too; the programmatic
      insert itself doesn't fire `input`, so pointing still chains.
    * *Verified* with real key events and real mouse clicks through the
      CDP input pipeline: 6⏎5⏎ list entry, all four arrows incl.
      edge-only Left/Right and mid-text caret behavior, =B2 point →
      + → point → consecutive replace → Enter = 11, complete-formula
      click committing 30 and moving focus. Zero schema impact.

* **[2026-07-26] v0.8.2 — accounting face for the scratch sheet (Chad).**
  Every displayed number — typed or computed — renders with thousands commas
  and a fixed two decimals (`toLocaleString en-US`). Display only: raw cell
  text is untouched, focus still shows exactly what was typed, and
  comma-typed input already parsed. Minus sign kept for negatives;
  accountant's parentheses offered, Chad's call if wanted. Lockstep patch
  with mobile v0.4.2 (no schema impact).

* **[2026-07-26] v0.8.3 — the composition bar + source-cell highlighting
  (Chad's Excel muscle memory, and it's the right spec source).**
    * *Composition bar:* a wide formula bar above the grid mirroring the cell
      being edited, with its ref on the left — so a ten-term formula isn't
      squeezed into a 104px cell. Typing in a cell mirrors up live; typing in
      the bar commits to the cell on Enter (and steps down a row) or on blur.
      Point-to-refer works **from the bar**: click cells while composing and
      their refs land in the bar with focus kept.
    * *Source highlighting:* while a formula is being composed — in a cell or
      the bar — every cell it draws from is outlined amber, ranges expanded
      (`=SUM(B1:B3)` lights B1, B2, B3). Re-opening a stored formula lights
      its sources too, which turns "where did this number come from?" into a
      glance. Pure display; `scHilite()` reads the in-progress text and
      touches nothing else.
    * *Escape, corrected to Excel's rule (bug the harness caught):* Escape
      while editing used to bubble to the document handler and close the whole
      pocket tool. Now an in-progress edit is abandoned and the sheet stays;
      with nothing to abandon, Escape falls through and closes as before. The
      same two-stage rule applies in the bar.
    * *Verified* with real key + mouse events: bar mirrors typing and its ref
      label follows focus; commit-from-bar lands 60.00 and steps down;
      bar-side pointing builds `=B2+B3` → 50.00; refs and ranges light and
      clear on commit; stored formulas re-light on reopen; both Escape stages.
      Zero schema impact; lockstep patch with mobile v0.4.3.

* **[2026-07-26] v0.8.4 — scratch cells truncate honestly.** A number too
  wide for its cell was clipping *silently* from the right, so `4,959,665.82`
  read as a complete `4,959,665.8` — a plausible wrong number, which for an
  accountant is worse than an obvious one. Cells now use
  `text-overflow:ellipsis`, so a cut figure always announces itself
  (`49,568,236…`); the composition bar shows the whole value on focus.
  Landed with the mobile sibling's v0.4.4 (same rule, both surfaces).

* **[2026-07-26] v0.8.5 — the popped-out bell scales with its window (Chad).**
  The PiP face was pinned at 190px no matter how big the floating window got,
  leaving a lake of empty walnut beneath it. Fixed in **pure CSS, no
  listener**: `vw`/`vh` inside the PiP document resolve against *that*
  window's viewport, so `.bell-body.pip .bell-vis` sized at
  `max(110px, min(84vw, 54vh))` tracks the drag automatically; the countdown
  rides along on a `clamp()`. Floored so a tiny window still shows a
  readable lamp, height-capped so the controls never get pushed out of view.
  *Verified* by resizing the PiP target at three sizes: 300×540 → 252px
  visual, 460×760 → 386px, 220×380 → 185px; content fit and the Start button
  stayed in view at every size, and the in-page face is still exactly 190px
  when folded back home.

## 💡 The Parking Lot (Future Ideas — deliberately open)
* ~~**Intention-on-open / enough-on-close ritual**~~ — **SHIPPED in base form:**
  intention-on-open as the Opening tab (v0.3.0), enough-on-close as the
  Closing tab's "It was enough." check (v0.4.0). Still open from the original
  idea: the *active* mirror that names the "five more minutes" impulse out
  loud when the named intentions are met mid-session. Revisit after dogfooding
  the Opening→Closing loop.
* **Brand illustration — "Plagued by Concepts."** *[2026-07-19]* Rodin's
  *Thinker*, seated on his plinth, contemplating a plague-doctor mask instead of
  resting his chin — art-historical, dry-witted, memento-mori; the literate,
  myth-soaked voice made visible. Two original renderings exist: a clean
  single-continuous-line version (the *animatable* asset) and a richer
  cross-hatched engraving (static frontispiece — and effectively the Atelier /
  Alchemist's-Ledger palette incarnate). **The plague mask alone = the app
  icon**; the full figure = the between-states "mental canvas." Original art
  only; renders ink-on-cream or gilt-on-walnut from one file. Working direction:
  *Atelier as the surface, Plagued-by-Concepts as the soul.*
* **Line-draw ritual screens — boot + think mode.** *[2026-07-19]* The single-
  line art animated in code (SVG `stroke-dashoffset`, staggered per path),
  **duration as a parameter**: ~6s draw on boot, slow/looping in "think" mode,
  pause-on-tap as a fidget-lamp for re-centering. One drawing, two rituals.
  Intentionally-slow boot as anti-engagement in its purest form — it *spends*
  the wait asking "what did you come for?" (this is the concrete embodiment of
  the intention-on-open ritual above), never apologizing for it. Intention
  prompts live in the `db` as a growable pool, drawn at random — open-mode sets
  intention ("What is this session for?", "What would be enough, today?"),
  think-mode re-centers ("Held, not solved. That is also progress."). **Not
  video** (Veo caps ~8s; baked timing, heavy files, compression smears fine
  line-work): centerline-trace the clean art → stroked paths → `stroke-
  dashoffset`, duration as a parameter. Image-gen (Gemini) is the renewable
  style engine for more figures (mask solo, the tinker's bell), each traced into
  the same draw-engine. **Working proof-of-concept now lives in the repo:
  `assets/chiaro-ritual-screen.html` (8s Open + 2min Think + tap-to-pause) and
  the traced art `assets/thinker-single-line.svg` (~40 stroked paths).** Open
  art-direction question: should the mask draw *last*, arriving in his open hand
  as the final gesture? (probably yes — decide when it ships.) On graduation
  into the single-file app: do an archival-quality retrace, and inline the fonts
  (the demo links Google Fonts — the app's CSP forbids external calls).
  Deliberately parked until the MVP daily loop is real.
* **Brand line language** — *[2026-07-20]* one continuous line, no fills,
  generous negative space: the style rule is that the man and his plague are
  literally the *same stroke*. Amber (#F2A24A) on near-black in-app; ink on
  cream for exports. The mask-alone glyph is a candidate capture button — "tap
  the plague to set it down." The etched/lithograph rendering is a separate
  *tattoo track*, not the app. Not locked.
* **Personal task surface** — separate tab or other form; mechanism
  deliberately undecided. Don't over-spec.
* ~~**Tinker's bell**~~ — **SHIPPED 2026-07-25 (v0.6.0)** in base form: ember-field
  timer in the Time Card, block-linked durations, one ring + pulse-until-
  noticed. Still open from the original idea: sound design iteration, a
  bell⇄time-entry tie-in beyond duration pre-fill, and the lock-screen Live
  Activity (parked with iOS native, mobile repo M2). Never "pomodoro."
* **Project templates** (Phase 2) — bookkeeping cadence, advisory framework.
* ~~**Cross-device sync**~~ — **SHIPPED 2026-07-21** as Worker+KV (see change
  log). Remaining follow-on: at-rest encryption of the KV blob (below).
* **At-rest encryption** — PJT's AES-GCM + PBKDF2 pattern, if/when warranted.
* **CTT macOS bundle identifier** — pick deliberately at Phase 3 wrap
  (e.g. `com.chiarotinkertools.ctt`); Phase 0 keeps PJT's.
* **Code signing / notarization** — required for any distribution beyond
  family right-click-open; consciously deferred. *[2026-07-18]* Chad has a
  paid Apple Developer account, so this is unlocked whenever we want it:
  Developer ID cert + notarytool via GitHub Actions secrets (runtime
  injection, per the no-secrets rule). Also the gate-opener for native iOS.
* **PJT ↔ CTT backport notes** — lightweight log of improvements general
  enough to flow between the sibling apps.
