/* =====================================================================
   GERTIE — the workshop at src/gertie/.

   A separate app that shares this harness. It has no CTT storage seam —
   no db, no normalize, no schema — so it loads with {seam:false}, and it
   boots for real ({boot:true}) because most of what matters here is what
   the render functions actually put in the DOM.

   These pin the acceptance criteria from the Phase 0 work order. Every
   assertion derives its expectations from PHASES rather than hardcoding a
   count, so they stay honest when Phase 0 lands and the phase count moves
   from 8 to 9.

   The headline test is `#paintfill`. renderCar() used to reach Cosmetics
   by position (PHASES[7]), which was only correct while ids ran 1-8.
   Unshifting a Phase 0 silently repointed it at Shakedown and painted the
   body during road testing — a wrong result that looks entirely plausible.
   ===================================================================== */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const { loadApp } = require('./harness.js');

const GERTIE = process.env.CTT_GERTIE || path.resolve(__dirname, '../src/gertie/index.html');
const STORE_KEY = 'p1800-build-log-v1';

function open() {
  const win = loadApp(GERTIE, {
    boot: true, seam: false,
    url: 'https://chiaro.chadstewartcpa.com/gertie/'
  });
  return win;
}

const g = (win, name) => win.__ctt.get(name);
/* Tick every REQUIRED task in a phase, the way a person would end up doing:
   optional upgrades deliberately left alone. */
function completePhase(win, id) {
  const p = g(win, 'PHASES').find(x => x.id === id);
  const state = g(win, 'state');
  p.tasks.filter(t => !t.opt).forEach(t => { state.done[t.id] = true; });
  g(win, 'render')();
  return p;
}
const fill = (win, elId) =>
  Number((win.document.getElementById(elId).style.getPropertyValue('--p') || '0'));

describe('Gertie — the workshop', () => {
  const wins = [];
  before(() => assert.ok(fs.existsSync(GERTIE), 'missing build: ' + GERTIE));
  after(() => { for (const w of wins) { try { w.close(); } catch (e) {} } });
  const fresh = () => { const w = open(); wins.push(w); return w; };

  test('boots, and the rail/case/manual agree on the phase count', () => {
    const win = fresh();
    const n = g(win, 'PHASES').length;
    assert.equal(win.document.querySelectorAll('#rail .gauge').length, n, 'rail gauge count');
    assert.equal(win.document.querySelectorAll('#case-grid .badge').length, n, 'trophy shield count');
    assert.ok(win.document.querySelectorAll('#manual-body .task').length > 0, 'manual rendered no tasks');
  });

  /* Acceptance criterion 2 — the regression this whole change exists for. */
  test('completing Cosmetics fills #paintfill; completing Shakedown does NOT', () => {
    const win = fresh();
    const ids = g(win, 'PHASES').map(p => p.id);
    assert.ok(ids.includes(7) && ids.includes(8), 'expected phases 7 and 8 to exist');

    assert.equal(fill(win, 'paintfill'), 0, 'paint should start empty');

    completePhase(win, 7);
    assert.equal(fill(win, 'paintfill'), 0,
      'finishing Shakedown painted the body — renderCar is reaching Cosmetics by POSITION again');

    completePhase(win, 8);
    assert.equal(fill(win, 'paintfill'), 1, 'finishing Cosmetics did not fill the body colour');
  });

  test('every phase drives its own reveal layer, and only its own', () => {
    const win = fresh();
    const p = g(win, 'PHASES').find(x => x.id === 5);
    completePhase(win, 5);
    assert.equal(fill(win, 'lay-5'), 1, 'phase 5 layer did not reveal');
    assert.equal(fill(win, 'lay-4'), 0, 'completing phase 5 revealed phase 4');
    assert.ok(p);
  });

  /* Acceptance criterion 4 — no hardcoded 8. */
  test('the manual header denominator comes from the data', () => {
    const win = fresh();
    const max = Math.max(...g(win, 'PHASES').map(p => p.id));
    const head = win.document.querySelector('.phase-no').textContent;
    assert.ok(head.includes('/ ' + max), 'header "' + head + '" does not derive its denominator');
  });

  /* Acceptance criterion 3 — optional work must not hold the car hostage. */
  test('optional tasks are excluded from the denominator and the badge', () => {
    const win = fresh();
    const PHASES = g(win, 'PHASES');
    const p = PHASES.find(x => x.id === 5);
    const before = g(win, 'phaseProgress')(p).total;

    // mark a real task optional in-memory — tests the mechanism, not content
    p.tasks[0].opt = true;
    const after = g(win, 'phaseProgress')(p);
    assert.equal(after.total, before - 1, 'an opt task stayed in the denominator');
    assert.equal(after.opt, 1, 'opt task not counted as an upgrade');

    completePhase(win, 5);   // required only; the opt task stays unticked
    const pr = g(win, 'phaseProgress')(p);
    assert.equal(pr.pct, 1, 'phase did not reach 100% with an upgrade left undone');
    assert.equal(pr.optDone, 0, 'sanity: the upgrade should still be unticked');

    const shield = win.document.querySelectorAll('#case-grid .badge')[PHASES.indexOf(p)];
    assert.ok(shield.className.includes('earned'), 'badge did not fire with an upgrade outstanding');
  });

  test('the odometer ignores optional work too', () => {
    const win = fresh();
    const PHASES = g(win, 'PHASES');
    // there must actually BE an upgrade outstanding, or this passes vacuously
    PHASES[0].tasks[0].opt = true;
    PHASES.forEach(p => { completePhase(win, p.id); });
    assert.ok(!g(win, 'state').done[PHASES[0].tasks[0].id], 'sanity: the upgrade should be unticked');
    assert.equal(win.document.getElementById('odo').textContent, '100% ROADWORTHY',
      'a fully-worked car did not read 100% — elective tasks are diluting the odometer');
  });

  test('UPGRADE and RUNNING chips render', () => {
    const win = fresh();
    // don't assume a particular phase's size — Phase 0 may be a stub mid-edit
    const p = g(win, 'PHASES').find(x => x.tasks.length >= 2);
    assert.ok(p, 'expected at least one phase with two tasks');
    p.tasks[0].opt = true;
    p.tasks[1].bg = 'Started on tow day';
    g(win, 'render')();
    const html = win.document.getElementById('manual-body').innerHTML;
    assert.ok(/t-flag up/.test(html), 'no UPGRADE chip rendered');
    assert.ok(/t-flag bg/.test(html) && /Started on tow day/.test(html), 'no RUNNING chip rendered');
  });

  /* Two genuinely separate cautions must not be merged into one block —
     0d (fumes AND electrocution) and 0h (seized plugs AND do-not-crank). */
  test('warn accepts a string or an array', () => {
    const win = fresh();
    const p = g(win, 'PHASES')[0];
    p.tasks[0].warn = ['First caution here', 'Second, unrelated caution'];
    g(win, 'render')();
    const blocks = win.document.querySelectorAll('#manual-body .warn');
    const text = Array.from(blocks, b => b.textContent).join(' | ');
    assert.ok(/First caution here/.test(text), 'first warn missing');
    assert.ok(/Second, unrelated caution/.test(text), 'second warn missing — array collapsed');
  });

  /* Acceptance criterion 5 — search reaches every phase's task text. */
  test('full-text search finds a term from any phase', () => {
    const win = fresh();
    const PHASES = g(win, 'PHASES');
    const last = PHASES[PHASES.length - 1];
    const term = last.tasks[0].n.split(' ')[0].toLowerCase();
    win.document.getElementById('q').value = term;
    g(win, 'renderManual')();
    const html = win.document.getElementById('manual-body').innerHTML;
    assert.ok(!/class="empty"/.test(html), 'search for "' + term + '" returned nothing');
  });

  /* Acceptance criterion 7 — the write path, including the flush that was
     hardened in v0.9.3 after notes failed to survive a refresh on iPhone. */
  test('a note reaches storage once flushed', () => {
    const win = fresh();
    const id = g(win, 'PHASES')[0].tasks[0].id;
    g(win, 'state').notes[id] = 'compression 145/150/60/148';
    g(win, 'save')();                 // debounced — nothing written yet
    g(win, 'flush')();                // what visibilitychange/pagehide call
    const raw = win.localStorage.getItem(STORE_KEY);
    assert.ok(raw, 'nothing was written under ' + STORE_KEY);
    assert.equal(JSON.parse(raw).notes[id], 'compression 145/150/60/148');
  });

  test('a stored state is adopted on boot', () => {
    const win = fresh();
    const id = g(win, 'PHASES')[0].tasks[0].id;
    win.localStorage.setItem(STORE_KEY, JSON.stringify({
      done: { [id]: true }, notes: { [id]: 'from a previous session' }, open: {}
    }));
    // re-run the app's own adoption path rather than a copy of it
    const loaded = g(win, 'Store').get();
    win.__ctt.set('state', Object.assign({ done: {}, notes: {}, open: {} }, loaded));
    g(win, 'render')();
    assert.equal(g(win, 'state').notes[id], 'from a previous session');
    assert.ok(g(win, 'state').done[id], 'checkmark did not survive');
  });

  /* The storage key is load-bearing: bumping it silently discards every note
     Chad has written. There is no ID-scheme change here, so it must not move. */
  test('the storage key has not moved', () => {
    const win = fresh();
    assert.equal(g(win, 'KEY'), STORE_KEY,
      'the storage key changed — that discards existing notes unless a migration ships with it');
  });

  /* Task ids are stable strings and must never collide. */
  test('every task id is unique', () => {
    const win = fresh();
    const ids = g(win, 'PHASES').flatMap(p => p.tasks.map(t => t.id));
    const dupes = ids.filter((x, i) => ids.indexOf(x) !== i);
    assert.deepStrictEqual(Array.from(dupes), [], 'duplicate task ids: ' + dupes.join(', '));
  });
});
