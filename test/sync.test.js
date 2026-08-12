/* =====================================================================
   SYNC DIVERGENCE — what happens when two devices disagree.

   Sync is the bridge between the surfaces and was the least-tested thing
   in CTT. Its failure mode is not a white screen, it is losing work.

   These drive the REAL syncPull/syncPush. The only thing stubbed is
   kvFetch — the single network seam — so everything downstream of it is
   the actual shipping code path, DOM writes included.

   NOTE ON SECRETS: the config below is a placeholder string. Nothing here
   needs, reads, or should ever contain the real SYNC_SECRET — that lives
   in Cloudflare and on Chad's devices, never in this repo. One test
   asserts the placeholder never reaches the wire.

   History worth keeping: written first against the OLD replace-everything
   pull, where three of these pinned genuinely bad behaviour and said so.
   Those three flipped the moment merge landed, which is what a tripwire is
   for. They now assert the new contract.
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

function project(id, name, modifiedAt) {
  return {
    id, name, type: 'ORDO', template: 'simple', clientCode: '', notes: '',
    createdDate: '2026-08-01', modifiedDate: '8/12/2026, 9:00:00 AM',
    modifiedAt: modifiedAt === undefined ? 1000 : modifiedAt,
    sections: [{ id: id + '-s1', name: 'Step', status: 'In Prep', budget: 1, actual: 0, timeSync: {} }]
  };
}
const day = (start) => ({ dayStart: start, codes: [], entries: [], win: [] });

function dbWith(projects, days, lastEdit) {
  return {
    schema: 'ctt-1', version: '8.0', lastEdit: lastEdit || 0, darkMode: false,
    journal: { projects, currentProjectId: (projects[0] || {}).id, collapsedGroups: {}, accordions: {} },
    timecard: { days: days || {}, currentDate: '2026-08-12' }
  };
}

/* Each scenario gets a clean window: syncPull replaces the global db, so
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

function stubKv(win, cloudJson) {
  const calls = { gets: 0, puts: [] };
  win.__ctt.set('kvFetch', async function (method, journal, body) {
    if (method === 'GET') { calls.gets++; return { status: 200, text: cloudJson }; }
    calls.puts.push(body);
    return { status: 200, text: '' };
  });
  return calls;
}

/* Array.from re-homes the value into THIS realm. An array built inside jsdom
   carries jsdom's Array.prototype, and deepStrictEqual compares prototypes —
   so a list with identical contents fails for a reason unrelated to the app. */
const names = (win) => Array.from(win.__ctt.db.journal.projects, p => p.name).sort();
const dates = (win) => Object.keys(win.__ctt.db.timecard.days).sort();

describe('sync divergence', () => {
  const files = [];
  after(() => { for (const w of files) { try { w.close(); } catch (e) {} } });
  const open = (file, db) => { const w = connected(file, db); files.push(w); return w; };

  for (const [surface, file] of Object.entries(REPOS)) {
    before(() => assert.ok(fs.existsSync(file), 'missing build: ' + file));

    /* ---------------------------------------------------------------
       The scenario this was all built for: phone in the morning,
       laptop in the afternoon, neither having seen the other.
       Before merge, one of them lost its day outright.
       --------------------------------------------------------------- */
    test(surface + ': PULL merges — work from both devices survives', async () => {
      const local = dbWith([project('p1', 'Bakery LLC'), project('p-laptop', 'Afternoon on the laptop')],
                           { '2026-08-12': day('13:00') }, 2000);
      const cloud = dbWith([project('p1', 'Bakery LLC'), project('p-phone', 'Morning on the phone')],
                           { '2026-08-11': day('08:00') }, 1000);

      const win = open(file, local);
      stubKv(win, JSON.stringify(cloud));
      await win.__ctt.get('syncPull')(true);

      assert.deepStrictEqual(names(win), ['Afternoon on the laptop', 'Bakery LLC', 'Morning on the phone'],
        'a project that existed on only one device was dropped by the merge');
      assert.deepStrictEqual(dates(win), ['2026-08-11', '2026-08-12'],
        'a day that existed on only one device was dropped by the merge');
    });

    /* Pull is still capable of overwriting a record, so it still needs the
       escape hatch import got in v0.9.3. */
    test(surface + ': PULL leaves an undo snapshot, and undo restores', async () => {
      const win = open(file, dbWith([project('p-local', 'Only here')], {}, 5000));
      stubKv(win, JSON.stringify(dbWith([project('p-cloud', 'Only there')], {}, 1)));

      await win.__ctt.get('syncPull')(true);
      assert.ok(win.localStorage.getItem('ctt_import_undo_v1'), 'pull took no undo snapshot');

      win.__ctt.get('undoImport')();
      assert.deepStrictEqual(names(win), ['Only here'], 'undo did not restore the pre-pull state');
    });

    /* The undo copy is a full db. It must be as credential-free as an export. */
    test(surface + ': the pull undo snapshot carries no credential', async () => {
      const win = open(file, dbWith([project('p1', 'Fresh')], {}, 5000));
      stubKv(win, JSON.stringify(dbWith([project('p2', 'Cloud')], {}, 1)));
      await win.__ctt.get('syncPull')(true);

      const snap = win.localStorage.getItem('ctt_import_undo_v1');
      assert.ok(snap);
      assert.equal(JSON.parse(snap).db.sync, undefined, 'db.sync rode along into the undo copy');
      assert.ok(!/not-a-real-secret/.test(snap), 'the sync secret was serialised into the undo copy');
    });

    /* Collision on the SAME project: modifiedAt decides, in both directions.
       modifiedDate could not do this job — it is a locale display string, and
       "12/1/2026" sorts before "8/12/2026". */
    test(surface + ': same project edited on both — newer modifiedAt wins', async () => {
      const win = open(file, dbWith([project('p1', 'Newer here', 9_000_000)], {}, 5000));
      stubKv(win, JSON.stringify(dbWith([project('p1', 'Older in cloud', 1_000)], {}, 8000)));
      await win.__ctt.get('syncPull')(true);
      assert.deepStrictEqual(names(win), ['Newer here'], 'the older cloud copy won a collision it should have lost');
    });

    test(surface + ': same project edited on both — older local loses', async () => {
      const win = open(file, dbWith([project('p1', 'Older here', 1_000)], {}, 5000));
      stubKv(win, JSON.stringify(dbWith([project('p1', 'Newer in cloud', 9_000_000)], {}, 1)));
      await win.__ctt.get('syncPull')(true);
      assert.deepStrictEqual(names(win), ['Newer in cloud'], 'a stale local copy overwrote newer cloud work');
    });

    /* Collision on the SAME DAY falls back to the top-level lastEdit. Day-level
       is the honest ceiling: an entry's start is the previous entry's stop, so
       two chains for one date cannot be interleaved without inventing times. */
    test(surface + ': same day edited on both — newer lastEdit wins the day', async () => {
      const win = open(file, dbWith([project('p1', 'P')], { '2026-08-12': day('13:00') }, 9000));
      stubKv(win, JSON.stringify(dbWith([project('p1', 'P')], { '2026-08-12': day('08:00') }, 1000)));
      await win.__ctt.get('syncPull')(true);
      assert.equal(win.__ctt.db.timecard.days['2026-08-12'].dayStart, '13:00',
        'the older cloud day overwrote the newer local one');
    });

    /* Union means a delete on one device does not propagate — the record comes
       back on the next merge. Deliberate: losing a delete costs a re-delete,
       losing a record costs the work. Pinned so the trade stays a choice. */
    test(surface + ': deletions do NOT propagate (documented trade-off)', async () => {
      const win = open(file, dbWith([project('p1', 'Kept')], {}, 5000));
      stubKv(win, JSON.stringify(dbWith([project('p1', 'Kept'), project('p2', 'Deleted here earlier')], {}, 1)));
      await win.__ctt.get('syncPull')(true);
      assert.deepStrictEqual(names(win), ['Deleted here earlier', 'Kept'],
        'deletes now propagate — if that was deliberate, tombstones landed; update this test');
    });

    /* Pulling twice must not keep mutating. A merge that is not idempotent
       means two devices ping-pong forever and never converge. */
    test(surface + ': merging the same cloud copy twice changes nothing', async () => {
      const win = open(file, dbWith([project('p-local', 'Local')], { '2026-08-12': day('13:00') }, 5000));
      stubKv(win, JSON.stringify(dbWith([project('p-cloud', 'Cloud')], { '2026-08-11': day('08:00') }, 1)));

      await win.__ctt.get('syncPull')(true);
      const once = JSON.stringify(win.__ctt.get('dbWithoutSecrets')());
      await win.__ctt.get('syncPull')(true);
      const twice = JSON.stringify(win.__ctt.get('dbWithoutSecrets')());
      assert.equal(twice, once, 'merge is not idempotent — devices would never converge');
    });

    /* The good half of the old behaviour, still pinned. */
    test(surface + ': AUTO-push refuses to clobber an unrecognised cloud copy', async () => {
      const win = open(file, dbWith([project('p-local', 'Local work')], {}, 5000));
      win.__ctt.db.sync.myHash = 'stale-hash-from-an-earlier-sync';
      const calls = stubKv(win, JSON.stringify(dbWith([project('p-cloud', 'Someone else pushed')], {}, 6000)));

      await win.__ctt.get('syncPush')(false);

      assert.equal(calls.puts.length, 0, 'auto-push wrote over a diverged cloud copy — data loss');
      assert.deepStrictEqual(names(win), ['Local work'], 'auto-push must not mutate local state');
    });

    test(surface + ': push with no known hash proceeds (first push after connect)', async () => {
      const win = open(file, dbWith([project('p1', 'Fresh')], {}, 5000));
      const calls = stubKv(win, JSON.stringify(dbWith([project('p-cloud', 'Pre-existing')], {}, 1)));
      await win.__ctt.get('syncPush')(true);
      assert.equal(calls.puts.length, 1, 'expected the push to go through');
    });

    /* Non-negotiable #4, on the wire rather than in the defaults. */
    test(surface + ': the pushed payload carries no credential', async () => {
      const win = open(file, dbWith([project('p1', 'Fresh')], {}, 5000));
      const calls = stubKv(win, JSON.stringify(dbWith([project('p1', 'Fresh')], {}, 1)));
      await win.__ctt.get('syncPush')(true);

      assert.equal(calls.puts.length, 1);
      const sent = calls.puts[0];
      assert.ok(!/not-a-real-secret/.test(sent), 'the sync secret was serialised into the pushed blob');
      assert.equal(JSON.parse(sent).sync, undefined, 'db.sync must be stripped before it leaves the device');
    });

    /* The schema half of this change: legacy projects have no modifiedAt and
       must acquire one, or every collision they are in resolves by accident. */
    test(surface + ': legacy projects get modifiedAt backfilled from modifiedDate', () => {
      const win = open(file, dbWith([project('p1', 'P')], {}, 0));
      const c = win.__ctt;
      const legacy = { id: 'old', name: 'Legacy', modifiedDate: '8/12/2026, 9:00:00 AM' };
      const bad = { id: 'bad', name: 'Unparseable', modifiedDate: 'sometime last spring' };
      c.normalizeProject(legacy); c.normalizeProject(bad);

      assert.equal(typeof legacy.modifiedAt, 'number');
      assert.ok(legacy.modifiedAt > 0, 'a parseable modifiedDate should yield a real timestamp');
      assert.equal(bad.modifiedAt, 0, 'an unparseable date must fall back to 0 — oldest, never a surprise winner');
    });
  }
});
