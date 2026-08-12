/* =====================================================================
   SYNC DIVERGENCE — what happens when two devices disagree.

   Sync is the bridge between the surfaces and the least-tested thing in
   CTT. Its failure mode is not a white screen, it is losing work, which
   makes it the one place where "we think it's fine" is not good enough.

   These tests drive the REAL syncPull/syncPush. The only thing stubbed is
   kvFetch — the single network seam — so everything downstream of it is
   the actual shipping code path, DOM writes included.

   NOTE ON SECRETS: the fake config below is a placeholder string. Nothing
   here needs, reads, or should ever contain Chad's real SYNC_SECRET — it
   lives in Cloudflare and on his devices, never in this repo.

   Several of these assertions document CURRENT behaviour including its
   sharp edges, and say so. A test that pins a known-bad behaviour is a
   tripwire for changing it deliberately, not an endorsement.
   ===================================================================== */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const { loadApp } = require('./harness.js');

const REPOS = {
  desktop: process.env.CTT_DESKTOP || path.resolve(__dirname, '../src/index.html'),
  mobile:  process.env.CTT_MOBILE  || path.resolve(__dirname, '../../chiaro-tinker-tools-mobile/src/index.html')
};

const FAKE_CFG = { url: 'https://sync.example.invalid', secret: 'not-a-real-secret' };
const JOURNAL = 'test-journal';

function project(id, name, sectionName) {
  return {
    id, name, type: 'ORDO', template: 'simple', clientCode: '', notes: '',
    createdDate: '2026-08-01', modifiedDate: '2026-08-12',
    sections: [{ id: id + '-s1', name: sectionName, status: 'In Prep', budget: 1, actual: 0, timeSync: {} }]
  };
}

function dbWith(projects, days, lastEdit) {
  return {
    schema: 'ctt-1', version: '8.0', lastEdit: lastEdit || 0, darkMode: false,
    journal: { projects, currentProjectId: (projects[0] || {}).id, collapsedGroups: {}, accordions: {} },
    timecard: { days: days || {}, currentDate: '2026-08-12' }
  };
}

/* Put a surface into "connected, with local state" and hand back a handle.
   Each scenario gets a clean window: syncPull replaces the global db, so
   reusing one across tests would leak state between them. */
function connected(file, localDb) {
  const win = loadApp(file);
  const c = win.__ctt;
  win.localStorage.setItem('ctt_kv', JSON.stringify(FAKE_CFG));
  c.db = c.normalize(JSON.parse(JSON.stringify(localDb)));
  c.db.sync = { journalId: JOURNAL, journalName: 'Test', auto: false, lastSync: null, myHash: null };
  c.runMigrations();
  return win;
}

/* Replace the one network call. Records what was PUT so a push can be
   inspected without a server. */
function stubKv(win, cloudJson) {
  const calls = { gets: 0, puts: [] };
  win.__ctt.set('kvFetch', async function (method, journal, body) {
    if (method === 'GET') { calls.gets++; return { status: 200, text: calls.puts.length ? calls.puts[calls.puts.length - 1] : cloudJson }; }
    calls.puts.push(body);
    return { status: 200, text: '' };
  });
  return calls;
}

/* Array.from re-homes the value into THIS realm. An array built inside jsdom
   has jsdom's Array.prototype, and deepStrictEqual compares prototypes — so a
   list with identical contents fails the assertion for a reason that has
   nothing to do with the app. */
const names = (win) => Array.from(win.__ctt.db.journal.projects, p => p.name).sort();

describe('sync divergence', () => {
  const files = [];
  after(() => { for (const w of files) { try { w.close(); } catch (e) {} } });
  const open = (file, db) => { const w = connected(file, db); files.push(w); return w; };

  for (const [surface, file] of Object.entries(REPOS)) {
    before(() => assert.ok(fs.existsSync(file), 'missing build: ' + file));

    /* ---------------------------------------------------------------
       The scenario that actually happens: phone in the morning, laptop
       in the afternoon, neither having seen the other.
       --------------------------------------------------------------- */
    test(surface + ': PULL discards divergent local work without warning', async () => {
      const local = dbWith([project('p1', 'Bakery LLC', 'Reconcile'), project('p-local', 'Afternoon on the laptop', 'Draft')],
                           { '2026-08-12': { dayStart: '13:00', codes: [], entries: [], win: [] } }, 2000);
      const cloud = dbWith([project('p1', 'Bakery LLC', 'Reconcile'), project('p-phone', 'Morning on the phone', 'Notes')],
                           { '2026-08-12': { dayStart: '08:00', codes: [], entries: [], win: [] } }, 1000);

      const win = open(file, local);
      stubKv(win, JSON.stringify(cloud));
      assert.deepStrictEqual(names(win), ['Afternoon on the laptop', 'Bakery LLC']);

      await win.__ctt.get('syncPull')(true);

      // Whole-db replace: the local-only project is not merged, it is gone.
      assert.deepStrictEqual(names(win), ['Bakery LLC', 'Morning on the phone'],
        'pull merged something — behaviour changed, revisit this test');
      assert.equal(win.__ctt.db.timecard.days['2026-08-12'].dayStart, '08:00',
        'the local day was replaced wholesale, not merged field-by-field');
    });

    /* PULL is the one destructive action with no confirmation and no undo.
       Import got an undo buffer in v0.9.3 for exactly this hazard; push has
       a hash-based conflict guard. Pull has neither. */
    test(surface + ': PULL leaves no undo snapshot (import does)', async () => {
      const win = open(file, dbWith([project('p-local', 'Only here', 'Draft')], {}, 5000));
      stubKv(win, JSON.stringify(dbWith([project('p-cloud', 'Only there', 'Draft')], {}, 1)));

      await win.__ctt.get('syncPull')(true);

      assert.equal(win.localStorage.getItem('ctt_import_undo_v1'), null,
        'a pull-undo now exists — good; update this test to assert it restores');
      assert.deepStrictEqual(names(win), ['Only there']);
    });

    /* PULL ignores lastEdit entirely — it will happily overwrite newer
       local work with an older cloud copy. The conflict modal that knows
       how to compare timestamps is only ever reached from push. */
    test(surface + ': PULL overwrites NEWER local state with OLDER cloud state', async () => {
      const win = open(file, dbWith([project('p-new', 'Newer local', 'Draft')], {}, 9_000_000));
      stubKv(win, JSON.stringify(dbWith([project('p-old', 'Older cloud', 'Draft')], {}, 1_000)));

      await win.__ctt.get('syncPull')(true);

      assert.deepStrictEqual(names(win), ['Older cloud'],
        'pull now considers lastEdit — behaviour changed, revisit');
    });

    /* The good half, pinned so it cannot regress: auto-push refuses to
       clobber a cloud copy it does not recognise, and does it without
       throwing a modal at someone mid-edit. */
    test(surface + ': AUTO-push refuses to clobber an unrecognised cloud copy', async () => {
      const win = open(file, dbWith([project('p-local', 'Local work', 'Draft')], {}, 5000));
      const c = win.__ctt;
      c.db.sync.myHash = 'stale-hash-from-an-earlier-sync';
      const calls = stubKv(win, JSON.stringify(dbWith([project('p-cloud', 'Someone else pushed', 'Draft')], {}, 6000)));

      await c.get('syncPush')(false);

      assert.equal(calls.puts.length, 0, 'auto-push wrote over a diverged cloud copy — data loss');
      assert.deepStrictEqual(names(win), ['Local work'], 'auto-push must not mutate local state');
    });

    /* A first push after a fresh connect has no myHash yet. That must not
       be treated as "no conflict" by accident — it currently falls through
       and pushes, which is correct only because there is nothing to lose
       on a journal this device just created. Pinned to catch a change. */
    test(surface + ': push with no known hash proceeds (first push after connect)', async () => {
      const win = open(file, dbWith([project('p1', 'Fresh', 'Draft')], {}, 5000));
      const calls = stubKv(win, JSON.stringify(dbWith([project('p-cloud', 'Pre-existing', 'Draft')], {}, 1)));

      await win.__ctt.get('syncPush')(true);

      assert.equal(calls.puts.length, 1, 'expected the push to go through');
    });

    /* Non-negotiable #4, on the wire this time rather than in the defaults:
       whatever gets PUT must never carry the sync credential. */
    test(surface + ': the pushed payload carries no credential', async () => {
      const win = open(file, dbWith([project('p1', 'Fresh', 'Draft')], {}, 5000));
      const calls = stubKv(win, JSON.stringify(dbWith([project('p1', 'Fresh', 'Draft')], {}, 1)));

      await win.__ctt.get('syncPush')(true);

      assert.equal(calls.puts.length, 1);
      const sent = calls.puts[0];
      assert.ok(!/not-a-real-secret/.test(sent), 'the sync secret was serialised into the pushed blob');
      assert.equal(JSON.parse(sent).sync, undefined, 'db.sync must be stripped before it leaves the device');
    });
  }
});
