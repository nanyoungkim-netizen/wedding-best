import { updateMeta } from '../lib/store.js';
import { auth, json, signedOut } from '../lib/auth.js';

// Admin sends shooting time, look-alike fingerprint and AI check results for photos already uploaded.
export async function POST(req) {
  const a = await auth(req, true);
  if (!a) return signedOut();
  let b = {};
  try { b = await req.json(); } catch {}
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 200).map(i => ({
    name: String(i.name || '').slice(0, 200),
    taken_at: i.taken_at && !isNaN(Date.parse(i.taken_at)) ? new Date(i.taken_at).toISOString() : null,
    hash: /^[0-9a-f]{16}$/.test(i.hash || '') ? i.hash : null,
    q: i.q && typeof i.q === 'object' ? i.q : null,
  })).filter(i => i.name);
  return json({ updated: await updateMeta(items) });
}
