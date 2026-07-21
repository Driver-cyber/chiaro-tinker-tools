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

## 💡 The Parking Lot (Future Ideas — deliberately open)
* **Intention-on-open / enough-on-close ritual** — Chad names what a session is
  for; when met, CTT acts as a *mirror, not a wall*: names the "five more
  minutes" impulse and points at the door ("this is held — go be with them").
  Never blocks. Experimental; design after MVP proves the daily loop.
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
* **Tinker's bell** — focus timer; interaction, sound, tie-in to time entries
  all open. Never called "pomodoro."
* **Project templates** (Phase 2) — bookkeeping cadence, advisory framework.
* **Cross-device sync** — Worker+KV (house pattern) vs. PJT's Gist/Team-code.
  Decide when a second device actually joins; the storage seam is ready.
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
