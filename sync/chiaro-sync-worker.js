/* =====================================================================
   Chiaro Tinker Tools — Cloud Sync Worker (Cloudflare)
   ---------------------------------------------------------------------
   Stores one JSON blob per "journal" key in a KV namespace, guarded by a
   shared secret. This is the whole backend: the app PUTs its data here and
   GETs it back on other devices. No secrets live in the app or this repo —
   the secret is a Worker secret you set in the Cloudflare dashboard.

   SETUP (Cloudflare dashboard):
     1. Workers & Pages → KV → Create a namespace, e.g. "chiaro-sync".
     2. Workers & Pages → Create → Worker. Name it e.g. "chiaro-sync".
        Paste this file as its code and Deploy.
     3. Worker → Settings → Variables:
          - Bindings → KV namespace: variable name  CHIARO_KV  → your namespace.
          - Secrets → add  SYNC_SECRET  = a long random passphrase you choose.
        Deploy again after adding these.
     4. Copy the Worker URL (…workers.dev). In the app: Settings → Cloud Sync →
        paste the URL + the same SYNC_SECRET, Connect, then Create my journal.

   The secret is sent in the X-Sync-Secret header. Anyone without it gets 401.
   CORS is open (*) so the Pages site (a different origin) can call it.
   ===================================================================== */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Sync-Secret',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    // Auth — constant-ish check against the Worker secret.
    const provided = request.headers.get('X-Sync-Secret') || '';
    if (!env.SYNC_SECRET || provided !== env.SYNC_SECRET) {
      return new Response('Unauthorized', { status: 401, headers: CORS });
    }
    if (!env.CHIARO_KV) {
      return new Response('KV namespace CHIARO_KV is not bound', { status: 500, headers: CORS });
    }

    const url = new URL(request.url);
    const journal = (url.searchParams.get('journal') || 'default').slice(0, 128);
    const kvKey = 'journal:' + journal;

    if (request.method === 'GET') {
      const val = await env.CHIARO_KV.get(kvKey);
      if (val == null) return new Response('', { status: 404, headers: CORS });
      return new Response(val, { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    if (request.method === 'PUT') {
      const body = await request.text();
      if (body.length > 24 * 1024 * 1024) {
        return new Response('Payload too large', { status: 413, headers: CORS });
      }
      await env.CHIARO_KV.put(kvKey, body);
      return new Response('OK', { status: 200, headers: CORS });
    }

    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  },
};
