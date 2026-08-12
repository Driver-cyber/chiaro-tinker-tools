/* =====================================================================
   CTT test harness — load a single-file build into a fake DOM.

   The app is one HTML file with everything inline, so there is nothing to
   import. This does the smallest honest thing: parse the file, pull out the
   inline <script> blocks, and evaluate them inside a jsdom window. What comes
   back is the app's own live scope — `win.normalize`, `win.db`, `win.save`
   are the real functions, not copies.

   Boot is SUPPRESSED by default. `bootApp()` is the last statement in the
   file; running it drags in crypto.subtle, canvas, timers and network, none
   of which jsdom has and none of which a schema test cares about. Pass
   {boot:true} when an integration test genuinely wants the app running.

   If the boot anchor ever gets renamed, this throws loudly rather than
   quietly testing a half-loaded app.
   ===================================================================== */
const fs = require('fs');
const { JSDOM } = require('jsdom');

const SCRIPT_RE = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
const BOOT_ANCHOR = '\nbootApp();';

function extractScripts(html) {
  const out = [];
  let m;
  SCRIPT_RE.lastIndex = 0;
  while ((m = SCRIPT_RE.exec(html)) !== null) out.push(m[1]);
  if (!out.length) throw new Error('no inline <script> blocks found — is this a CTT build?');
  return out;
}

function loadApp(htmlPath, opts) {
  opts = opts || {};
  const html = fs.readFileSync(htmlPath, 'utf8');
  let js = extractScripts(html).join('\n;\n');

  if (!opts.boot) {
    if (js.indexOf(BOOT_ANCHOR) < 0) {
      throw new Error(
        'boot anchor "bootApp();" not found in ' + htmlPath + '.\n' +
        'The harness suppresses boot by pattern. If boot was renamed, update ' +
        'BOOT_ANCHOR in test/harness.js — do not ignore this.'
      );
    }
    js = js.split(BOOT_ANCHOR).join('\n/* bootApp() suppressed by test harness */;');
  }

  const dom = new JSDOM(html, {
    // a real origin, or localStorage throws on the opaque about:blank origin
    url: opts.url || 'https://chiaro.chadstewartcpa.com/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole: opts.quiet === false ? undefined : quietConsole()
  });

  // `let db` / `const SCHEMA` live in the global DECLARATIVE scope — they are
  // never properties of window. Reaching them from Node needs a bridge built
  // inside the same evaluation. Missing names throw here, which is the point:
  // a renamed seam should fail the suite, not skip it.
  js += '\n;window.__ctt = {' +
        '  get db(){ return db; }, set db(v){ db = v; },' +
        '  normalize: normalize, mergeDefaults: mergeDefaults,' +
        '  normalizeProject: normalizeProject, runMigrations: runMigrations,' +
        '  SCHEMA: SCHEMA, STORE_KEY: STORE_KEY' +
        '};';

  const win = dom.window;

  // Globals the app takes for granted that jsdom does not guarantee. Which
  // ones ship on `window` varies BY JSDOM VERSION — 30 provides TextEncoder,
  // 26 does not — so relying on the library to supply them makes a routine
  // dependency bump look like an app bug. The rigging provides them instead.
  if (typeof win.TextEncoder === 'undefined') win.TextEncoder = TextEncoder;
  if (typeof win.TextDecoder === 'undefined') win.TextDecoder = TextDecoder;

  win.eval(js);
  if (!win.__ctt || typeof win.__ctt.normalize !== 'function') {
    throw new Error('harness bridge failed for ' + htmlPath + ' — normalize() not reachable');
  }
  win.__dom = dom;
  return win;
}

/* jsdom shouts about unimplemented canvas/CSS it can't parse. That noise is
   not a test signal — real failures come from assertions, not stderr. */
function quietConsole() {
  const { VirtualConsole } = require('jsdom');
  const vc = new VirtualConsole();
  vc.on('jsdomError', () => {});
  return vc;
}

module.exports = { loadApp, extractScripts };
