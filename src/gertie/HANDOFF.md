# P1800S Build Log — handoff

A single-file restoration tracker for a 1966 Volvo P1800S barn find. Part project dashboard, part searchable service manual.

**Deliverable:** `index.html`. No build step, no dependencies, no server. Open it or drop it on any static host.

---

## What it does

Three views, switched client-side with no router:

| View | Purpose |
|---|---|
| **Dashboard** | The signature element — an SVG blueprint of the car that paints itself in as work completes. Plus a rail of 8 phase gauges. |
| **Manual** | All 49 tasks grouped by phase, each expanding to steps, tool list, external links, warnings, and a personal notes field. Full-text search across every step. |
| **Trophy case** | 8 shield badges, one per phase, unlocked at 100% phase completion. |

### The reveal mechanic

The SVG has one always-visible ghost outline plus eight `<g class="lay" id="lay-N">` layers, one per phase. Each layer's opacity is driven by a CSS custom property:

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

Saves are debounced 260ms. The `Store` adapter tries three tiers in order:

1. `window.storage` — the Claude artifact persistence API, async, throws on missing keys
2. `localStorage` — used when deployed to a normal static host
3. In-memory — silent fallback, nothing crashes

Storage key: `p1800-build-log-v1`. **Bump the version suffix if you ever change the task ID scheme**, or existing users get orphaned checkmarks.

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

If you add a service worker later it'll work fully offline in the barn, which is worth doing — see backlog.

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
  warn: 'Safety callout'          // optional — red left-rule block
}
```

Add a task and the phase percentage, the car reveal, and the badge threshold all recompute automatically. Nothing else to update.

The `YT()` helper builds YouTube **search** URLs rather than hardcoding video IDs, so links don't rot when a video gets deleted.

---

## Known gaps / backlog

Roughly in priority order.

1. **Verify the external links.** They point at real classic-Volvo suppliers and reference sites (iPD, Skandix, VP Autoparts, Burlen, SW-EM, Volvo Owners Club, Turbobricks, Brickboard), but they were written from general knowledge — click through each one and swap anything dead. Deep-link to the actual P1800 category pages where you can.
2. **Photo attachments per task.** The single highest-value addition for a real build. Before/after shots stored as base64 or object URLs against the task ID. Note the 5MB-per-key storage cap — resize on upload.
3. **Offline support.** Service worker + web manifest. The whole point is using this on a phone in a barn with no signal.
4. **Parts and cost ledger.** Part number, supplier, price, ordered/received status, rolling total. The tools arrays are already half of a shopping list.
5. **Compression test widget.** A dedicated 4-cylinder input that stores the psi figures, computes the spread between cylinders, and flags anything outside 10–15%. This is the project's actual decision point and deserves more than a notes field.
6. **Export.** Dump state to JSON or Markdown for backup and for the build thread on Turbobricks.
7. **Gate enforcement.** Phase cards visually dim when the previous phase is incomplete, but nothing is actually blocked. That's intentional for now — real projects don't run strictly in order. Consider a soft warning rather than a hard lock.
8. **Time logging.** Hours per task would make the next project estimable.

---

## Content caveat

The restoration steps are solid general practice for a B18-engined P1800, but they aren't a substitute for the factory green books or a marque specialist. Two things worth flagging in the UI if you extend it:

- Brake and suspension work carries real consequences. The Phase 4 and 5 warnings should stay prominent.
- Torque specs are deliberately absent throughout. Look them up in the manual for the specific fastener — a wrong number here is worse than no number.
