# P1800S Build Log — handoff

A single-file restoration tracker for a 1966 Volvo P1800S barn find. Part project dashboard, part searchable service manual.

**Deliverable:** `index.html`. No build step, no dependencies, no server. Open it or drop it on any static host.

---

## What it does

Three views, switched client-side with no router:

| View | Purpose |
|---|---|
| **Dashboard** | The signature element — an SVG blueprint of the car that paints itself in as work completes. Plus a rail of 9 phase gauges. |
| **Manual** | 55 required tasks plus 14 optional upgrades, grouped by phase, each expanding to steps, tool list, external links, warnings, and a personal notes field. Full-text search across every step. Below the work sits the **someday shelf** (`PARKED`) — non-checkable idea cards. |
| **Trophy case** | 9 shield badges, one per phase, unlocked at 100% phase completion. Phase 0 reads `00`. |

### The reveal mechanic

The SVG has one always-visible ghost outline plus eight `<g class="lay" id="lay-N">` layers, one per phase **1–8**.

**Phase 0 (site prep) deliberately has no layer.** There is no car system for clearing a carport, and inventing one would weaken the mapping between the drawing and the real state of the car. `renderCar()`'s `if(el)` guard handles the absence; a test pins `lay-0` as absent so nobody adds one by reflex. Each layer's opacity is driven by a CSS custom property:

```css
.lay { opacity: calc(.10 + var(--p, 0) * .90); }
```

`renderCar()` sets `--p` to that phase's completion fraction (0–1). Layers map to real systems, so the drawing tells you what's actually done:

1. Triage → floor pan and jacking points
2. Make it turn → engine block
3. Make it run → carbs, plug leads, exhaust
4. Make it stop → brake discs
5. Make it roll → wheels and tyres
6. Make it legal → glass and lamps
7. Shakedown → road surface and motion lines
8. Cosmetics → body paint fill and the P1800 cove crease

Phase 8 additionally fades in `#paintfill`, so the car goes from wireframe to solid body colour only when everything else is finished. That's deliberate — cosmetics last.

**Look Cosmetics up by `id`, never by index.** `renderCar()` used to end with `phaseProgress(PHASES[7])`, which was Cosmetics only by accident of ids running 1–8. Adding Phase 0 silently repointed it at Shakedown and painted the body during road testing — wrong, silent, and entirely plausible-looking. `test/gertie.test.js` in the repo root pins this.

---

## Design system

Two materials, and they mean something:

- **Instrument** (dashboard, trophy case) — dark petrol ground, amber-lit, like a 1960s gauge cluster.
- **Manual** (the task list) — paper stock with printed rules, like the workshop manual it replaces.

Tokens live in `:root`. Palette derives from a Volvo gauge cluster: petrol-black bezel `#101C24`, blueprint cyan `#5B8CA8`, amber warning lamp `#F0A73B`, red oil lamp `#C8492F`, oxidised-green OK lamp `#7FAE7E`, manual paper `#E9E5DC`.

Type: **Archivo** (display, 900 weight, tight tracking) + **Barlow Condensed** (uppercase utility labels, tabular numbers). Loaded from Google Fonts.

The `01 / 02 / 03` numbering is used deliberately — these phases are a genuinely gated sequence, and each phase header carries a **Gate** line stating what must be true before starting.

---

## State and storage

```js
state = {
  done:  { taskId: true },   // completed tasks
  notes: { taskId: "..." },  // free-text notes per task
  open:  { taskId: true }    // which accordions are expanded
}
```

Saves are debounced 260ms, then written by `Store` — a thin, **synchronous localStorage** wrapper. (This doc previously described a three-tier adapter with the Claude artifact `window.storage` API first; that branch was dead code and was removed on 2026-08-12. There is one tier.)

A refused write flips `storeOK` false and the UI says so out loud — a read-only browser should announce itself on arrival, not after a day's findings are already gone.

`save()` debounces; **`flush()` is what actually writes**, and it is wired to `visibilitychange` and `pagehide` as well as the timer. That matters on iOS, which discards backgrounded pages without warning — notes failing to survive a refresh on iPhone is exactly what led to it.

Storage key: `p1800-build-log-v1`. **Bump the version suffix if you ever change the task ID scheme**, or existing users get orphaned checkmarks. There is no export yet, so a bump destroys data with no way back — see the backlog.

Task IDs are stable strings (`'3c'`, `'5f'`). Reordering tasks in the array is safe. Renaming an ID is not.

---

## Deploying

```bash
# Any of these work — it's one static file
npx serve .
# or
python3 -m http.server 8000
```

For a real host: Netlify Drop, GitHub Pages, Cloudflare Pages, Vercel. Drag the file in, done.

It is already a PWA: `sw.js`, `manifest.webmanifest` and `icons/` sit alongside
`index.html`, scoped to `/gertie/`. Installed to a home screen it works fully
offline in the barn, which was the whole point.

## Tests

`test/gertie.test.js` **in the repo root** (not here — it shares CTT's jsdom
harness and its single `jsdom` dependency):

```sh
cd ../..        # repo root
npm install
npm test        # runs the CTT suites and Gertie's together
```

Gertie loads with `{boot: true, seam: false}` — it boots for real, and it has
none of CTT's storage seam (no `db`, no `normalize`, no schema), so the
harness's CTT bridge is switched off for it.

Every assertion derives its expectations from `PHASES` rather than hardcoding
a count, so adding a phase or a task does not break the suite. What it pins:
the `#paintfill` regression, the derived denominator, optional tasks staying
out of both denominators, the Phase 0 shield reading `00` with no `lay-0`,
`warn` accepting an array, search reaching every phase, the flush-to-storage
path, the storage key not moving, task-id uniqueness, and the someday shelf
rendering zero checkboxes.

---

## Editing the content

Everything lives in the `PHASES` array. Task shape:

```js
{
  id: '4c',                       // stable, never reuse
  n: 'Front discs and calipers',  // title
  b: 'One-line why-it-matters',   // blurb under the title
  steps: ['...', '...'],          // rendered as an ordered list
  tools: ['...'],                 // optional — renders as chips
  links: [{l:'Label', u:'https://…'}],  // optional
  warn: 'Safety callout',         // optional — red left-rule block. May also be
                                  //   an ARRAY: some tasks carry two genuinely
                                  //   separate cautions and merging them buries one
  opt: true,                      // optional — an elective upgrade. Checkable and
                                  //   celebrated, but EXCLUDED from the phase
                                  //   denominator and from overall(). May be a
                                  //   STRING to set the chip label ('If time')
                                  //   where "Upgrade" would be untrue
  bg: 'Started on tow day'        // optional — renders a RUNNING chip: begun,
                                  //   working in the background, don't wait on it
}
```

**Why `opt` exists.** Without it, skipping air conditioning would mean the car never finishes revealing itself and the badge never fires — the reveal would stop being an honest mirror of the car's state, which is the only reason it earns its place. `phaseProgress()` and `overall()` both exclude optional tasks.

### The someday shelf

`PARKED` is a separate array of `{ n, b, when }` rendered as cards below the work in the Manual view. Not checkable, no progress effect, never in a denominator, hidden while searching. It exists so ideas stop rattling around loose.

Add a task and the phase percentage, the car reveal, and the badge threshold all recompute automatically. Nothing else to update.

The `YT()` helper builds YouTube **search** URLs rather than hardcoding video IDs, so links don't rot when a video gets deleted.

---

## Known gaps / backlog

Roughly in priority order.

1. **Export.** *Now the top item.* There is none at all, which sits against CTT
   non-negotiable #1 ("one-tap export from day one, never regresses"), and this
   is the surface most likely to lose data — a phone, in a carport, in a browser
   that can evict storage. It also blocks any storage-key bump, since there is
   currently no way to get the notes back out first. JSON for backup, Markdown
   for the build thread on Turbobricks.
2. **Verify the external links.** Still open, and now larger. The supplier and
   reference links (iPD, Skandix, VP Autoparts, Burlen, SW-EM, Volvo Owners
   Club, Turbobricks, Brickboard) were written from general knowledge and have
   never been clicked. **Newly added and unverified: `https://dol.wa.gov/` and
   `https://wsp.wa.gov/`** in tasks `1a` and `6e` — root domains were chosen
   deliberately because the session that wrote them had no outbound network
   access and could not check a deep path. Technique links use the `YT()` search
   helper, which builds a YouTube *search* URL and therefore cannot rot.
3. **Parts and cost ledger.** Part number, supplier, price, ordered/received,
   rolling total. The `tools` arrays are already half a shopping list.
4. **Compression test widget.** A four-cylinder input that stores the psi
   figures, computes the spread, and flags anything outside 10–15%. Task `2f`
   calls this the project's actual go/no-go; it deserves more than a notes field.
5. **Gate enforcement.** Phase cards dim when the previous phase is incomplete,
   but nothing is blocked. Intentional — real projects don't run strictly in
   order. A soft warning would be better than a hard lock.
6. **Time logging.** Hours per task would make the next project estimable.

### Closed

- ~~**Offline support.**~~ Shipped 2026-07-26. `sw.js` + `manifest.webmanifest`
  + `icons/`, scoped to `/gertie/`. Navigations are network-first with a cached
  shell fallback. **Bump `CACHE` in `sw.js` whenever a shell asset changes** —
  unlike CTT's worker, this one does not re-cache the navigation response, so
  the *offline* copy only refreshes when the cache name does.

### Decided against

- **Photo attachments per task.** Previously listed as "the single highest-value
  addition." Dropped on 2026-08-13, on the merits rather than for effort. The
  camera roll already stores photos better — backed up, searchable, nicer to
  look at — and the only thing Gertie would have added is *association* with a
  task id, which is cheaper as a caption in the existing notes field than as a
  storage layer. Two further arguments settled it: Gertie shares an origin (and
  a ~5MB budget) with CTT, so photos here could evict real ORDO data; and with
  no export, this would have become a second, *worse* copy of irreplaceable
  evidence in a store iOS can evict. Tasks `0g`, `0h` and `0i` still ask for
  photographs — they just live in the phone's camera roll where they belong.

## Content caveat

The restoration steps are solid general practice for a B18-engined P1800, but they aren't a substitute for the factory green books or a marque specialist. Two things worth flagging in the UI if you extend it:

- Brake and suspension work carries real consequences. The Phase 4 and 5 warnings should stay prominent.
- Torque specs are deliberately absent throughout. Look them up in the manual for the specific fastener — a wrong number here is worse than no number.
