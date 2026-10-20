# Chiaro Cloud Sync — Cloudflare KV setup

This is a one-time setup. It stands up a tiny Cloudflare Worker + KV store that
holds your journal so it syncs across your phone, laptops, and browsers. Your
data lives in **your** Cloudflare account; the secret lives only on your devices
and in Cloudflare — never in the app's code or this repo.

**Before anything: in the app, open the gear menu → "Save Journal Backup."**
Keep that `.json` somewhere safe. It's your parachute.

---

## 1. Create the KV namespace
Cloudflare dashboard → **Storage & Databases → KV → Create a namespace**.
- Name: `chiaro-sync`
- Create. (That's it — no keys to add; the app fills it.)

## 2. Create the Worker
Cloudflare dashboard → **Workers & Pages → Create → Workers → Create Worker**.
- Name it `chiaro-sync` (its URL becomes `https://chiaro-sync.<you>.workers.dev`).
- **Edit code**, delete the starter, and paste the entire contents of
  [`chiaro-sync-worker.js`](./chiaro-sync-worker.js).
- **Deploy**.

## 3. Bind the KV namespace + set the secret
Open the Worker → **Settings**.
- **Bindings → Add → KV namespace:**
  - Variable name: `CHIARO_KV`  (exactly this)
  - KV namespace: `chiaro-sync` (the one from step 1)
- **Variables and Secrets → Add → type "Secret":**
  - Name: `SYNC_SECRET`
  - Value: a long random passphrase you choose (e.g. a 30+ char string from a
    password manager). **Save this** — you'll paste the same value in the app.
- **Deploy** again so the binding + secret take effect.

## 4. Get the URL
On the Worker's page, copy its URL: `https://chiaro-sync.<you>.workers.dev`.

## 5. Connect the app (once the in-app sync client ships)
In the app: **Settings (☁) → Cloud Sync**:
- Paste the **Worker URL** and the **SYNC_SECRET** → **Connect**.
- **Create my journal** (uploads your current data). Copy the **Journal ID** shown.
- On another device: **Connect** with the same URL + secret, then **Join an
  existing journal** and paste the Journal ID → **Pull**. Turn on **Auto-sync**.

## 6. Outlook feed (optional — view-only calendar for the Blueprint day map)
The day map can show your real Outlook events as read-only shadows to plan
around. The Worker fetches your published calendar server-side (browsers can't
read Outlook's ICS link directly — no CORS), so it needs **redeploying with the
current `chiaro-sync-worker.js`** first.
1. **Check that it's allowed.** A published calendar link is readable by anyone
   who has it, and it's your employer's data. Many firms turn publishing off,
   and some prohibit it. If the option is missing or policy says no, use the
   file route below instead.
2. Outlook on the web → **Settings → Calendar → Shared calendars → Publish a
   calendar** → choose the calendar, **Can view all details** → **Publish** →
   copy the **ICS** link.
3. Worker → **Settings → Variables → Secrets** → add **`ICS_URL`** = that link
   → **Deploy**. (It's a secret for the same reason SYNC_SECRET is. Never paste
   it into the app or this repo.)
4. In the app: **Blueprint → Day → ↻ Pull feed**.

**File route (no Worker, no publishing):** classic Outlook for Windows/Mac →
**File → Save Calendar** (pick a date range + full details) → `.ics`; then
**Blueprint → Day → Import .ics**. Re-import whenever you want a fresher copy.

Either way, the events are kept **on that device only**, outside the journal.
They never sync to KV, never appear in exports, and nothing is written back
to Outlook. Unpublish any time from the same Outlook settings page.

---

### Notes
- **Auth:** every request carries the secret in an `X-Sync-Secret` header;
  without it the Worker returns 401. CORS is open so the Pages site can call it.
- **Privacy:** the blob is stored as plaintext JSON in your KV. Fine for a
  single-user setup; the app's at-rest encryption can be layered on later.
- **Cost:** comfortably inside Cloudflare's free tier for one person.
- **Conflict handling:** the app uses last-write-wins by edit time and warns you
  on a manual push if the cloud copy changed under you.
