import { auth, signedOut, json } from '../lib/auth.js';

// Passes one stored photo through, for the zip download when the browser can't fetch it directly.
export async function GET(req) {
  const a = await auth(req);
  if (!a) return signedOut();
  let u;
  try { u = new URL(new URL(req.url).searchParams.get('u') || ''); } catch { return json({ error: '잘못된 주소예요.' }, 400); }
  if (u.protocol !== 'https:' || !u.hostname.endsWith('.blob.vercel-storage.com')) return json({ error: '잘못된 주소예요.' }, 400);
  const r = await fetch(u);
  if (!r.ok) return json({ error: '사진을 가져오지 못했어요.' }, 502);
  return new Response(r.body, { headers: { 'content-type': r.headers.get('content-type') || 'image/jpeg', 'cache-control': 'private, max-age=3600' } });
}
