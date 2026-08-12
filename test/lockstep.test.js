/* =====================================================================
   SCHEMA LOCKSTEP — the sibling-drift guard.

   Desktop and mobile read and write the SAME synced db. Today the only
   thing keeping their schema seams identical is somebody remembering. This
   is the mechanism that replaces the remembering.

   Every fixture in test/fixtures/ is pushed through BOTH repos' full
   forward-compat path — normalize() then runMigrations() — and the two
   results must be byte-identical as JSON. A field added on one side and
   forgotten on the other fails here, loudly, before it can corrupt a sync.

   Comparison is done on JSON round-trips, not live objects: the db is a
   JSON blob in transit, so JSON equality is the property that actually
   matters (and it sidesteps cross-realm prototype mismatches).
   ===================================================================== */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { loadApp } = require('./harness.js');

const REPOS = {
  desktop: process.env.CTT_DESKTOP || path.resolve(__dirname, '../src/index.html'),
  mobile:  process.env.CTT_MOBILE  || path.resolve(__dirname, '../../chiaro-tinker-tools-mobile/src/index.html')
};

const FIXTURE_DIR = path.join(__dirname, 'fixtures');
const FIXTURES = fs.readdirSync(FIXTURE_DIR).filter(f => f.endsWith('.json')).sort();

const plain = (v) => JSON.parse(JSON.stringify(v));
const readFixture = (f) => JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, f), 'utf8'));

/* The full path a saved blob actually travels on boot. load() does exactly
   this before anything renders: normalize(), then runMigrations(). Testing
   normalize() alone would miss normalizeProject/migrateStatuses entirely. */
function forwardCompat(win, raw) {
  const c = win.__ctt;
  c.db = c.normalize(plain(raw));
  c.runMigrations();
  return plain(c.db);
}

describe('schema lockstep — desktop vs mobile', () => {
  const win = {};

  before(() => {
    for (const [name, file] of Object.entries(REPOS)) {
      assert.ok(fs.existsSync(file), 'missing sibling build: ' + file);
      win[name] = loadApp(file);
    }
  });

  after(() => { for (const w of Object.values(win)) w.close(); });

  test('the schema constants agree', () => {
    assert.equal(win.desktop.__ctt.SCHEMA, win.mobile.__ctt.SCHEMA, 'SCHEMA drifted');
    assert.equal(win.desktop.__ctt.STORE_KEY, win.mobile.__ctt.STORE_KEY, 'STORE_KEY drifted');
  });

  for (const f of FIXTURES) {
    test('fixture ' + f + ' normalizes identically on both surfaces', () => {
      const raw = readFixture(f);
      const d = forwardCompat(win.desktop, raw);
      const m = forwardCompat(win.mobile, raw);
      assert.deepStrictEqual(
        d, m,
        'schema drift on ' + f + ' — a field exists on one surface and not the other.\n' +
        'Land the change on BOTH repos before merging (CLAUDE.md: Schema lockstep).'
      );
    });
  }

  /* normalize() runs on every boot and every sync pull. If it is not
     idempotent it mutates a little more each round-trip, and two devices
     never converge. */
  for (const surface of ['desktop', 'mobile']) {
    test(surface + ': normalize() is idempotent across the corpus', () => {
      for (const f of FIXTURES) {
        const once = forwardCompat(win[surface], readFixture(f));
        const twice = forwardCompat(win[surface], once);
        assert.deepStrictEqual(twice, once, 'normalize() is not idempotent for ' + f);
      }
    });
  }

  /* Non-negotiable #4: credentials never ride along. normalize() must not
     invent one, and must not carry an incoming one into a shape that would
     be exported. */
  test('the sync branch defaults carry no credential', () => {
    for (const surface of ['desktop', 'mobile']) {
      const out = forwardCompat(win[surface], {});
      const keys = Object.keys(out.sync).sort();
      assert.ok(!keys.some(k => /secret|token|key|password/i.test(k)),
        surface + ': a credential-shaped field appeared in db.sync defaults: ' + keys.join(','));
    }
  });
});
