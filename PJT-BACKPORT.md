# PJT Backport Brief — improvements to carry over from Chiaro Tinker Tools

*Written 2026-07-26 by Claude Code, for Chad to paste into a fresh Claude chat.*
*Target: **PJT** — Chad's firm-facing single-file timecard + project journal,
Tauri-wrapped, team-synced. Not this repo.*

---

## 0. How to use this document

You (the assistant reading this) are helping Chad hand-edit **PJT**, a
different codebase from the one this brief was written in. Chad will paste
files to you; you won't have repo access.

**There is a working reference implementation.** Every feature below is
already built, tested, and running in a **public** repo:

> `https://github.com/Driver-cyber/chiaro-tinker-tools` → `src/index.html`

CTT is a **fork of PJT**, so the two files are close cousins: same
single-file HTML shape, same vanilla JS, same one-in-memory-`db` pattern,
same `save()`/boot storage seam, same `renderX()` function style. Function
names referenced below exist verbatim in that file. When a detail is
ambiguous, read the reference rather than inventing.

**House conventions that PJT already follows** (keep them):
- One file: `src/index.html`, all markup/CSS/JS inline. No build step.
- All persistence flows through the single `save()` / boot seam. Never
  scatter `localStorage` calls.
- Version-bump the app subtitle + the JS comment header on release-worthy
  builds.
- `window.prompt()` is unreliable in Tauri WebViews — use in-app modals.

---

## 1. Rich notes — see the formatting, not the markers

**The complaint:** the note fields display `**bold**` literally. The B / I
buttons only ever *inserted* markers; nothing rendered them.

**The constraint, stated up front:** a `<textarea>` **cannot** display styled
text. Live formatting requires `contenteditable`. That is the whole reason
this is a real change rather than a CSS tweak.

### The shape

- The three note surfaces become `contenteditable` divs styled to look
  exactly like the old boxes (same border, ink, padding, scroll).
- **Markdown stays the stored format.** This is load-bearing: PJT's markdown
  export keeps working untouched, and — critically for PJT — **the synced
  data shape does not change**, so teammates' clients keep reading the same
  strings. Storing HTML would be a breaking schema change.
- So it's a display/edit layer only: `mdSet(el, markdown)` renders in,
  `mdGet(el)` serialises back out. **Zero schema impact.**

### Supported

| Effect | Stored as | Notes |
|---|---|---|
| Bold | `**text**` | standard markdown |
| Italic | `*text*` | standard markdown |
| Strikethrough | `~~text~~` | standard markdown |
| Red | `<span style="color:#c00">text</span>` | markdown has **no** colour syntax; inline HTML is the only form that still renders red when an export is pasted into Word/Outlook |
| Black | *(nothing)* | the absence of colour, not a marker |

### Reference functions in CTT

`mdEsc` · `mdToHtml` · `mdFromNode` · `mdGet` · `mdSet` · `mdCmd` ·
`mdActive` · `mdBold` · `mdItalic` · `mdStrike` · `mdRed` · `mdBlack` ·
`mdBullets`, plus a document-level `paste` listener.

### The two functions worth copying verbatim

Markdown → HTML (render):

```js
function mdToHtml(md){
  let h=mdEsc(md||'');
  // the colour span is the one HTML we deliberately let back through
  h=h.replace(/&lt;span style="color:#c00"&gt;([\s\S]*?)&lt;\/span&gt;/g,'<span style="color:'+MD_RED+'">$1</span>');
  h=h.replace(/\*\*([\s\S]+?)\*\*/g,'<b>$1</b>');
  h=h.replace(/~~([\s\S]+?)~~/g,'<s>$1</s>');
  h=h.replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g,'$1<i>$2</i>');
  return h.replace(/\n/g,'<br>');
}
```

HTML → markdown (serialise back on every edit):

```js
function mdFromNode(node){
  let out='';
  node.childNodes.forEach(n=>{
    if(n.nodeType===3){ out+=n.nodeValue; return; }
    if(n.nodeType!==1) return;
    const tag=n.tagName.toLowerCase();
    if(tag==='br'){ out+='\n'; return; }
    const inner=mdFromNode(n);
    if(tag==='b'||tag==='strong'){ out+= inner.trim()? '**'+inner+'**' : inner; return; }
    if(tag==='i'||tag==='em'){ out+= inner.trim()? '*'+inner+'*' : inner; return; }
    if(tag==='s'||tag==='strike'||tag==='del'){ out+= inner.trim()? '~~'+inner+'~~' : inner; return; }
    const col=(n.getAttribute&&(n.getAttribute('color')||''))+' '+((n.style&&n.style.color)||'');
    const isRed=/#c00\b|#cc0000\b|rgb\(\s*204\s*,\s*0\s*,\s*0\s*\)|\bred\b/i.test(col);
    if(isRed){ out+= inner.trim()? '<span style="color:#c00">'+inner+'</span>' : inner; return; }
    if(tag==='div'||tag==='p'){ out+=(out&&!out.endsWith('\n')?'\n':'')+inner; return; }
    out+=inner;
  });
  return out;
}
```

### Gotchas that cost real debugging time

1. **Chrome rewrites your colour.** `document.execCommand('foreColor','#c00')`
   is normalised to `<font color="#cc0000">`. If the serialiser only looks
   for `#c00`, the red **renders on screen and is then silently dropped on
   save** — the worst kind of bug, invisible to the eye. Match every
   spelling: `#c00`, `#cc0000`, `rgb(204, 0, 0)`, `red`.
2. **Use `execCommand`, not hand-rolled Range surgery.** It's deprecated but
   universally implemented, and it gets selection/caret behaviour right.
   Writing your own is where this feature goes to die.
3. **Force paste to plain text.** Otherwise a copy from Word drags a
   paragraph of foreign markup into a field that must serialise back to
   markdown:
   ```js
   document.addEventListener('paste', e => {
     const t = mdActive(); if(!t || document.activeElement!==t) return;
     e.preventDefault();
     const txt=(e.clipboardData||window.clipboardData).getData('text/plain');
     document.execCommand('insertText', false, txt);
   });
   ```
4. **`contenteditable` fires no `change` event.** Any field that relied on
   `onchange="..."` must be rewired to `input` (debounced) + `blur`.
5. **Test the round trip, don't eyeball it.** Assert
   `mdGet(mdSet(el, md)) === md` across a case list. Include the trap case
   `5 * 3 = 15 and 2*2` — a naive italic regex turns arithmetic into
   `<i>` tags. CTT's italic regex above is written to survive it.

---

## 2. Expanded-notes editor: full keystroke autosave

**The complaint:** mis-clicking outside the expanded editor closes it and
loses the edit unless you hit Save first.

**The fix (CTT shipped this in v0.1.0 after Chad lost real work to it):**

- Debounced autosave on `input`, ~800 ms → commit to the db through the
  normal `save()` seam.
- **Every** exit path commits first: the button, the backdrop click, and
  `Escape`.
- The button is relabelled just **"Close."** There is no "Save" — saving is
  not a thing the user should have to think about.
- Do the same for the inline note fields, not just the expanded one.

Reference: `commitExpanded` and the debounced `input` listener attached to
`#bigEditor`; the same pattern appears on each section scratchpad.

> This pairs naturally with §1 — do them in the same pass, since both touch
> the same fields.

---

## 3. Scratch sheet — an 8×25 grid with basic math

**The purpose, in Chad's words:** *"for when I need a quick calculator or to
type text and label a couple numbers so that I don't have to close my eyes
and squint so hard to visualize and organize it in my mind."*

### ⚠️ PJT-specific decision: keep it ephemeral

In CTT the sheet persists in `db.scratch` — a real schema addition. **Do not
do that in PJT.** PJT is team-synced, so adding a field means touching a
shared data shape with colleagues' data at stake.

**Chad's call: make it session- or user-scoped only.** The sheet does not
need to survive beyond the session. Options, in order of preference:

1. **In-memory only** — a plain module-level object, gone on reload. Zero
   persistence, zero schema, zero risk. Simplest thing that works.
2. **`sessionStorage`** under its own key (e.g. `pjt_scratch`) if surviving
   an accidental refresh is worth it. Still per-tab, still outside the synced
   `db`, still zero schema impact.

Either way: **never put it in the synced `db`, and never route it through
`save()`.** This is the one place in the backport where PJT should
deliberately diverge from CTT. It also removes the entire
migration/legacy-data burden — no `normalize()` change, no teammate testing.

### The shape

- Columns **A–H**, rows **1–25**. Headers on both edges.
- Each cell is an input: focused shows the **raw** text you typed; blurred
  shows the **computed** value.
- A cell starting with `=` is a formula. Supported: `+ - * /` with
  parentheses, cell references (`=A1*B3`), and `SUM` / `AVG` / `MIN` / `MAX`
  over ranges (`=SUM(A1:A10)`).
- **Napkin rules, not Excel rules:** blank and text cells count as `0` in
  math. Errors show `#ERR` / `#CYCLE` / `#DIV0` / `#REF` but **never** eat
  the typed text — focus the cell and your formula is still there to fix.
- Recalculate all 200 cells on any edit (trivial at this size). Use a
  `visiting` Set threaded through a memo for cycle detection.
- Clearing the sheet is a **two-tap arm** ("Really clear?"), not a modal.

### Ergonomics — port these too, they're what made it usable

The bare grid took an hour; these took it from toy to tool. If you skip
them Chad will ask for them within a day:

- **Arrow-key navigation.** Up/Down always move cells. Left/Right move cells
  **only** from the text's edge or when the whole value is selected —
  mid-formula they stay caret moves, so editing never fights navigation.
- **Enter commits and steps down** a row, so `3 ⏎ 45 ⏎ 12 ⏎` enters a column
  of numbers fast.
- **Excel-style point-to-refer.** Mid-formula (caret right after `=` or an
  operator), clicking another cell **inserts its reference**; consecutive
  clicks **replace** the last one while you hunt. With a *complete* formula,
  a click just commits and moves — Excel's own rule. One regex on the text
  before the caret decides which: `/[=+\-*/(,:\s]$/`.
- **Composition bar** — a wide field above the grid mirroring the cell being
  edited, for formulas longer than a cell.
- **Accounting number format** — thousands commas, fixed two decimals, on
  every displayed number. Display only; raw text untouched on focus.
- **Honest truncation.** `text-overflow: ellipsis` on cells. This one is a
  **correctness** issue, not polish: a silently clipped `4,959,665.82`
  renders as a complete-looking `4,959,665.8` — a plausible wrong number an
  accountant could act on. `49,568,236…` cannot be misread.

Reference functions: `SC_COLS` · `SC_ROWS` · `scEvalExpr` (the
recursive-descent evaluator, ~60 lines, no library) · `scCellValue` (memo +
cycle detection) · `scFmt` · `scDisplay` · `scratchBuild` · `scCommit` ·
`scRecalc` · `scratchToggle` · `scratchClear`.

### Where it lives — the pocket-tool pattern

Chad chose this deliberately in CTT after being offered three options, and
it's worth repeating in PJT:

> **Tabs are rooms. Pockets are tools.**

A scratch sheet is not a *room* you navigate to — it's a tool you need
*right now*, possibly while looking at something else. So:

- **Not** a sixth tab (crowds the header with something used twice a day).
- **Not** a panel inside one tab (you need it from wherever you are).
- **A dim glyph in the app bar** (CTT uses `▦`) that opens the sheet as an
  **overlay** over whatever room you're in. ✕ / `Esc` / backdrop-click puts
  it back, and the room underneath never moves.

This also gives future pocket tools a home that doesn't grow the tab row.

---

## 4. Focus timer — "the tinker's bell"

A collapsible timer panel with a visual countdown, sitting above the day's
time entry.

### Core behaviour

- Collapsed by default; a carrot opens it.
- A **🔔 button on each time-log row** pre-fills the timer with that block's
  duration and labels it with the code — the timer knows what you're timing.
- Default 25 minutes, editable.
- **Muted by default.** One soft synthesised chime when unmuted — never two,
  never a repeat.
- On finish, the visual **pulses** (slow breathe, 2.6 s, plus a warm glow)
  until noticed. That pulse is the real signal for a muted timer.
- The countdown is driven off a **wall-clock `endAt` timestamp**, not a
  decrementing counter — so it never drifts if the window is backgrounded.
- **Ephemeral by design.** The timer touches no persisted state at all —
  no db field, no save. It exists for the session. (In PJT this matters
  doubly: nothing to sync, nothing to migrate.)

Reference: the `bell` object · `bellEls` · `bellStartPause` · `bellTick` ·
`bellRing` · `bellChime` · `bellFromEntry` · `bellReset`.

### The visual: a pixel grid, and optionally more

CTT started with a **100-square ember grid** that empties as time passes —
that alone is what Chad asked for, and it's the simplest thing that works
(`bvGrid`).

CTT later grew a **swappable renderer registry** — six visuals (ember grid,
balance scale, moon phase, a figure drawing itself, a lantern burning down,
a sundial), drawn at random per timer, hot-swappable mid-run from a
dropdown. The architecture is worth knowing even if you only ship the grid:

```
render(p) -> { vb, body, post? }      // p = elapsed fraction, 0..1
```

Renderers are **pure functions of elapsed fraction**. They own nothing — no
clocks, no timer state, no sound. The timer object is the only brain.
Adding a visual is appending one object to the registry; hot-swapping is
just re-rendering at the current `p`, so timer state survives for free.

**For PJT, shipping the ember grid alone is the sensible scope.** Mention
the registry to Chad only if he wants the others later.

### ⚠️ The popout: use a native Tauri window, NOT Document Picture-in-Picture

CTT's browser build floats the timer using the **Document
Picture-in-Picture API** (`documentPictureInPicture.requestWindow`). **Do
not port that to PJT.** It is a Chromium API:

- macOS Tauri uses **WKWebView** — the API does not exist.
- Windows Tauri uses **WebView2** — it *may* be present, but it's not a
  contract you want to rely on in a shipped desktop app.

**Chad's call: build it as a real second Tauri window.** This is genuinely
the better answer for a native app — it gets OS-level always-on-top, real
resizing, and a taskbar presence that a PiP shim never will.

Sketch (Tauri 2, JS side):

```js
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

const bell = new WebviewWindow('tinkers-bell', {
  url: 'bell.html',          // or index.html#bell — see note below
  title: "Tinker's bell",
  width: 320, height: 560,
  alwaysOnTop: true,
  resizable: true,
  decorations: true,
});
```

Two design notes that follow from using a real window:

1. **The two windows are separate JS contexts.** Unlike PiP (where the DOM
   node simply moves and keeps its handlers), a Tauri window runs its own
   page. So the timer needs to *communicate*, not share objects. Simplest
   robust approach: the popout window owns its own countdown seeded by the
   `endAt` timestamp passed at launch, and the two sync via Tauri's event
   system (`emit`/`listen`) on start/pause/reset. Because the countdown is
   wall-clock based, both windows stay correct independently — this is
   exactly why `endAt` was chosen over a tick counter.
2. **Make the visual scale with the window.** CTT sizes the popped-out
   visual in viewport units so dragging the window bigger or smaller resizes
   the countdown with it — no resize listener needed:
   ```css
   .bell-vis { width: max(110px, min(84vw, 54vh)); height: max(110px, min(84vw, 54vh)); }
   .bell-time { font-size: clamp(30px, 13vw, 76px); }
   ```
   Floor it so a tiny window still shows a readable lamp; cap the height so
   the countdown and controls never get pushed out of view.

**Scar to avoid (cost a real bug in CTT):** inline `onclick="..."` attributes
resolve against the document the node *currently* lives in. Any control that
crosses a document boundary must be wired with `addEventListener`. In the
Tauri-window design this is moot for the popout (separate page), but keep it
in mind for any modal/overlay that moves nodes.

---

## 5. Also worth carrying: code hints in the time-log dropdown

**Smallest change on this list, highest daily value.** Chad's exact
complaint at the firm: *"VPS 2 … is that reconciling or is that filing?"*

The time-log row's code `<select>` shows only the letter and client. Append
a hint derived from the **linked journal section name**, at render time:

```
a — VPS 1 · Reconcile accounts
```

- **Derived, never stored.** Read the linked section name when building the
  option, strip its numeric prefix, truncate to ~18 chars.
- Because it's derived, section renames propagate automatically and it
  **cannot go stale** — and there is no schema change.

Reference: `codeOptionLabel` in CTT (about 5 lines).

---

## 6. Deliberately NOT carrying over

| Left behind | Why |
|---|---|
| Mobile card layouts (time log / journal / report as vertical cards) | PJT is a desktop Tauri app; tables are correct there |
| PWA layer (manifest, service worker, icons) | Irrelevant to a Tauri wrap |
| Collapsible mobile panels | Desktop has the room |
| Opening / Closing ritual screens | That's CTT's *soul* — a personal tool for trustworthy closure. PJT is a firm tool with a different job. Chad's call if he ever wants it. |
| Cloud sync (Worker + KV) | PJT already has its own team sync |

---

## 7. Suggested build order

1. **Rich notes (§1) + expanded-editor autosave (§2)** — same fields, one
   pass, immediate daily payoff.
2. **Code hints (§5)** — an afternoon at most, and it removes a friction
   Chad hits every day.
3. **Scratch sheet (§3)** — biggest surface, but ephemeral scope makes it
   self-contained and risk-free.
4. **Timer (§4)** — do the in-app panel first; add the second Tauri window
   once the timer itself is proven.

Ship and verify one at a time. PJT is team-synced and Tauri-wrapped, so the
old scar applies harder than ever:

> **A green build proves nothing about the running app.** Install it, edit
> something, and confirm the data file actually changed on disk.

---

## 8. Verification habits worth stealing

These caught several bugs that visual inspection did not:

- **Assert round trips, not appearances.** The markdown feature is only
  correct if `mdGet(mdSet(el, md)) === md` for a list of cases. That test
  found the dropped-colour bug.
- **Drive real events, not function calls.** Clicking a handler directly
  proves the function works, not that the *button* does. CTT shipped a bug
  where every control in a floating window was dead because the tests called
  functions instead of clicking elements.
- **Measure layout, don't eyeball screenshots.** `getBoundingClientRect`
  answers "does this fit" honestly; a screenshot at the wrong window size
  lies.
- **Watch for DOM-scraping exports.** CTT had a "copy report" that read
  values out of `<tr>` cells; a later layout change would have silently
  produced an *empty* report with no error. Exports should read data, not
  markup. **Worth auditing PJT for the same pattern before changing any
  renderer.**

---

*Reference implementation: `github.com/Driver-cyber/chiaro-tinker-tools`
(public) — `src/index.html`, CTT v0.9.0. Read it when this brief is
ambiguous; every function named above is in that one file.*
