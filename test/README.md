# CTT test suite

The schema-lockstep guard. Desktop and mobile read and write the **same synced
`db`** — until now the only thing keeping their schema seams identical was
somebody remembering. This is the mechanism that replaces the remembering.

## Running it

```sh
npm install          # once — jsdom is the only dependency
npm test
```

The suite expects the mobile sibling checked out next to this repo:

```
some-dir/
  chiaro-tinker-tools/          <- you are here
  chiaro-tinker-tools-mobile/
```

Override either path if your layout differs:

```sh
CTT_MOBILE=/path/to/mobile/src/index.html npm test
```

If the sibling is missing the suite fails loudly rather than skipping. A
lockstep guard that quietly does nothing is worse than no guard, because it
reads as coverage.

## What's here

| File | Job |
|---|---|
| `harness.js` | Loads a single-file CTT build into jsdom and hands back the app's live scope |
| `fixtures/*.json` | The corpus — awkward, historically-shaped save files |
| `lockstep.test.js` | Pushes every fixture through **both** repos and deep-compares |

No test framework. `node --test` is built into Node 22, which keeps this in
line with the house rule: no bundler, no build loop.

## The harness, and why it isn't trivial

The app is one HTML file with everything inline, so there is nothing to
`require()`. `harness.js` parses the file, pulls the inline `<script>` blocks,
and evaluates them inside a jsdom window. What comes back is the app's **own
live scope** — `normalize` is the real function, not a copy.

Two things it does deliberately, both of which will bite whoever touches them:

- **Boot is suppressed.** `bootApp()` is the last statement in the file;
  running it drags in `crypto.subtle`, canvas, timers and network, none of
  which jsdom has and none of which a schema test cares about. The harness
  snips it out by pattern and **throws if the anchor is missing** — a renamed
  boot should fail the suite, not silently leave it testing a half-loaded app.
- **`let db` is not `window.db`.** Top-level `let`/`const` live in the global
  *declarative* scope and are never properties of `window`. Reaching them from
  Node needs a bridge built inside the same evaluation — that's `window.__ctt`.
  Missing names throw there too, for the same reason.

Pass `{boot: true}` when an integration test genuinely wants the app running.

## The corpus

"Corpus" just means a pile of real sample shapes to test against. One tidy
fixture proves nothing; the value is in the awkward ones.

| Fixture | Represents |
|---|---|
| `01-empty.json` | `{}` — a first-ever boot |
| `02-pjt-legacy.json` | PJT-era: numbered sections, `billable` codes, no schema string |
| `03-ctt-v050-forkpoint.json` | The shape at the repo split — before `scratch`/`intentions`/`prompts` |
| `04-project-without-sections.json` | A project with no `sections` array |
| `05-null-branches.json` | `null` where every branch expects an object |

Add a fixture whenever a real save file surprises you. Fixtures are cheap; the
bug they catch is not.

## The path under test

Not `normalize()` alone — that would miss most of the surface. The suite runs
what `load()` actually runs:

```js
db = normalize(raw);
runMigrations();          // normalizeProject + migrateStatuses + migrateCodeTypes
```

Properties asserted:

1. **Lockstep** — both surfaces produce identical JSON for every fixture.
2. **Idempotence** — `normalize()` twice equals `normalize()` once. It runs on
   every boot and every sync pull; if it mutates a little more each round-trip,
   two devices never converge.
3. **Constants agree** — `SCHEMA` and `STORE_KEY` haven't drifted.
4. **No credential in the defaults** — non-negotiable #4, asserted rather than
   trusted.

## First blood

The suite found a real bug on its first run, in both repos.

`normalizeProject` guarded `(p.sections||[])` — whoever wrote it knew a project
might arrive without sections. But `migrateStatuses`, running immediately after
inside the same `runMigrations()`, did a bare `p.sections.forEach`. A
section-less project threw during boot: white screen, not a degraded one.

The file-picker import was safe (`migrateV7Project` always builds the array),
but `normalize()` → `runMigrations()` is called from four other places with no
such guard — the sync pull, the disk restore, and the undo-import.

Fixed in v0.9.4 / mobile v0.9.3 by making `normalizeProject` *create* the array
rather than merely tolerate its absence. Fixture 04 is the regression test.
