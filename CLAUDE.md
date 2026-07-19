# CLAUDE.md — Chiaro Tinker Tools (CTT)

*Project constitution. Read this first, every session. Then read `DECISIONS.md`
and `chiaro-tinker-tools-tracker.html` for current state and priorities.*

---

## 🌟 North Star

**Chiaro's real output isn't in Chiaro. It's in the room Chad walks into after
he closes it.**

CTT is a personal digital tool belt and studio — today a timecard + project
journal re-pointed at Chad's ORDO consulting work, eventually a task surface, a
focus timer (the "tinker's bell"), and whatever the belt grows. But the deeper
mission is not productivity. It is **trustworthy closure**: a safe place to set
down everything unresolved — finished or not — so Chad can leave the mind-space
completely and be present with his family and the people in front of him.

Every other tool measures itself by engagement. This one measures itself by how
completely it can be *left*. Success looks like Chad half-forgetting CTT exists
for a few hours because he trusts it to hold what he left there.

**Two honest ways to be done for today — CTT must make both feel good:**
- **Completed** — wrapped, finished, the quiet pride of mastery as its own reward.
- **Entrusted** — open and unfinishable right now, but set down with just enough
  of a path that it is *bounded* instead of infinite. A lump of clay on a shelf,
  with a note about what it wants to become. The clay stays clay; it just stops
  sitting on Chad's chest.

The dread CTT exists to dissolve is not "unfinished" — it is "undefined, and
therefore endless." Convert infinite into bounded, and the peace follows.

## 🔦 The Open/Close Lens (design test for every feature)

For every screen, tool, and feature, answer two questions:

1. **On open:** What is Chad looking for? Orientation, the one next thing, a
   lamp on the chaos. First function, fast.
2. **On close:** How should it feel to put down? Held, content, free to go.

**If a feature can't answer the second question, it probably doesn't earn its
place.** When proposing new features, state both answers explicitly.

## 🚫 Anti-Engagement Ethos (non-negotiable)

- No streaks, badges, gamification, or re-engagement mechanics. Ever.
- No guilt: no "you haven't logged today," no red dots, no nagging.
- Closing is a success state, not a churn event. It should feel like an exhale.
- **Future direction (parked, post-MVP):** intention-on-open / enough-on-close
  ritual. Chad names what a session is for; when it's met, CTT is a *mirror,
  not a wall* — it names the "five more minutes" impulse out loud ("you did
  what you came to do") and points at the door, never blocks. Experimental;
  see DECISIONS.md parking lot.

## 🎨 Aesthetic & Voice

- **Chiaroscuro, taken literally:** dark is the *material*, not a mode. Near-black
  field, honored and present. **One warm accent** — a lamp in real dark. The
  warmth comes from the quality of the light and the voice.
- **Clutter has a home — the edges.** A lived-in bench is human: trinkets,
  motifs, texture, personality live in empty states, the guide, the bell,
  naming choices. The *working surfaces* (day grid, project steps) stay crisp
  and legible. Clutter on the shelf is warmth; clutter on the day-grid is
  friction. That is the only line.
- **Voice:** earnest, literate, a little myth-soaked, unpretentious.
  Apocalyptic optimism — "so it goes," keep walking, carry a small lamp.
  Ordo ab chao. Light and dark in concert, not several.
- The focus timer, when it arrives, is a **tinker's bell** — never "pomodoro."
- Internal shorthand: **CTT**. The app may wink at itself as CTT.

## 🛠 Tech Stack (with rationale)

| Layer | Choice | Why |
|---|---|---|
| App | **Single-file HTML** (`src/index.html`) — all markup, CSS, JS inline | Inherited from PJT and proven: portable, rollback-safe (versioned disposable files), debuggable in a plain browser with devtools, no build loop |
| Framework | **None.** Vanilla JS, one in-memory `db` object | Small surface, no bundler, matches house default |
| State | Single JSON `db` with a **schema version string** for migrations | PJT pattern; fine at this scale. Revisit (SQLite) only if it outgrows a blob |
| Persistence (MVP) | `localStorage` under a **new CTT-specific key** + one-tap JSON export/import | New key so CTT can never collide with PJT data |
| Native bits | **Feature detection** (`window.__TAURI__`) — browser mode is byte-identical with fs as no-ops | The PJT superpower: debug 95% in Chrome, build only for last-mile checks |
| Web deploy | **Cloudflare Pages**, auto-deploy from GitHub `main` | House default; zero secrets in this path |
| PWA | Manifest + service worker, early in Phase 1 | Cheap for a single-file app; the iPhone on-ramp |
| Desktop (later) | **Tauri 2** → macOS `.app`/`.dmg` | PJT's shell, re-pointed. See Phase 0 |
| Repo | `Driver-cyber/chiaro-tinker-tools` | Public repo; no secrets in source, ever |

## ⚖️ Non-Negotiables

1. **One-tap export from day one.** Chad has lived a near-data-loss
   (localStorage partitioned per Chrome profile). Export/import ships in the
   first CTT build and never regresses.
2. **Keep the storage seam clean.** All persistence flows through one
   write/read boundary (PJT's `save()`/boot pattern). Sync (Worker+KV or Gist)
   and encryption must be able to slot in later at that seam without a rewrite.
   Do not scatter direct `localStorage` calls.
3. **Schema version on the `db` from the first commit**, with a `normalize()`
   path for forward compatibility. When migrating, **verify with legacy-shaped
   data** — the single most load-bearing migration step.
4. **No secrets in the repo or any distributable.** Runtime injection only.
   Credentials stripped from every backup and export (PJT pattern).
5. **Off-device durability before iPhone becomes a primary device.** iOS can
   evict PWA storage. Sync is parked, but this gate is real: the phone doesn't
   graduate from companion to primary until a durable off-device copy exists.
6. **Anti-engagement ethos** (above) is architecture, not polish.
7. **Original assets only.** No third-party IP.

## 🗺 Phases

- **Phase 0 — The Trophy.** Wrap the repo *as-is* (still PJT, demo data,
  original branding) as a macOS `.dmg` via Tauri 2 + GitHub Actions. No sync,
  no persistence changes, no rebrand. Purpose: a showpiece for Chad's wife and
  sister, *and* the first live test of the macOS toolchain (Tauri bundler,
  `macos-latest` runner, Gatekeeper) on a known-good artifact. Tag the commit
  `pjt-trophy` so it stays reproducible forever. Note: unsigned/un-notarized
  builds hit Gatekeeper friction — right-click-open is acceptable for a family
  demo; document the workaround, don't solve signing yet.
- **Phase 1 — CTT MVP: re-point at ORDO.** The fork becomes CTT. Strip audit
  binder defaults; projects become free-form custom-step projects. Drop
  billable/nonbillable/unpaid; lean time codes whose one MVP job is separating
  **admin time vs. client-deliverable time**. New storage key + schema version.
  Export carried over. Chiaroscuro rebrand. Deploy to Cloudflare Pages; make it
  an installable PWA early. Let the form be discovered through iteration — the
  brief defines the room, not every pixel.
- **Phase 2 — Templates.** Reusable project scaffolds: bookkeeping cadence,
  advisory framework, other repeated ORDO workflows.
- **Phase 3+ — Parked.** macOS wrap of CTT → iPhone native / PWA mobile
  supremacy → task surface → tinker's bell → sync + encryption when a second
  device actually joins. See DECISIONS.md parking lot.

## 🧗 Inherited Scars (from PJT's BUILD-NOTES — honor these)

- `withGlobalTauri` is an **app-level** setting in `tauri.conf.json` — wrong
  placement fails silently (app runs in "browser mode," no file ever written).
- `build.frontendDist` points at `../src`; the file to overwrite is always
  `src/index.html`.
- **Green build ≠ working app.** CI compiling proves nothing about runtime fs.
  Real test: install → edit → confirm the data file appears.
- Pick the **bundle identifier** deliberately on day one (Phase 0 keeps PJT's;
  Phase 3 CTT wrap gets its own, e.g. `com.chiarotinkertools.ctt`). Data nests
  under it — surface the *resolved* path in-app, never a guess.
- `window.prompt()` is unreliable in Tauri WebViews — use in-app modals.
- Rolling daily backups beat a single overwriting file.
- CSP: if native builds need outbound API calls later, allowlist explicitly —
  don't ship `"csp": null`.

## 🧠 Memory & Strategy

- **Read first:** `DECISIONS.md` for current vibe and settled decisions;
  the tracker (`chiaro-tinker-tools-tracker.html`) for current priorities.
- **Measure twice:** propose a plan before any multi-file or structural change
  and wait for explicit approval ('y' / 'go'). Rules are defaults, judgment is
  primary — if we've agreed the cost of measuring exceeds the cost of
  re-cutting, say so and move.
- **Pivots:** if a request contradicts prior decisions, ask "are we pivoting?"
  before refactoring.
- **Token thrift:** targeted reads over recursive scans. The app is one big
  file — use anchors/greps for sections, ask for locations if unsure. Deliver
  changes as targeted edits unless a full-file rewrite is genuinely simpler.
- **"idk" is a valid stance.** Low confidence is an invitation to connect,
  not a license to improvise alone. Name assumptions; prefer reversible moves.
- **Push back.** Chad drives product decisions and wants technical pushback
  when something's wrong — suggestions over pronouncements, but honest ones.

## 📝 Maintenance Protocol

- After a major pivot or completed phase, ask: "Should I update DECISIONS.md?"
- **Tracker:** update `chiaro-tinker-tools-tracker.html` at the end of any
  session that completes or changes priorities. Bump the `updated` date in both
  the visual header and the JSON data block.
- **Red team at phase gates and after time gaps.** Chad works in bursts; a
  session restart after days/weeks away is a valid red-team trigger. Argue
  *against* recent decisions; land each in Confirmed / Revised / Scheduled.
- Version-bump the app subtitle + JS comment header on each release-worthy
  build (PJT convention).
