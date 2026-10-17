import { getPhoto, upsertPhoto } from '../lib/store.js';
import { putImage, delImages } from '../lib/blob.js';
import { auth, json, signedOut } from '../lib/auth.js';

// Admin uploads one already-resized photo per request (raw image body).
export async function POST(req) {
  const a = await auth(req, true);
  if (!a) return signedOut();
  const u = new URL(req.url);
  const name = String(u.searchParams.get('name') || '').trim().slice(0, 200);
  if (!name) return json({ error: '파일 이름이 없어요.' }, 400);
  const type = req.headers.get('content-type') || 'image/jpeg';
  if (!type.startsWith('image/')) return json({ error: '사진 파일만 올릴 수 있어요.' }, 400);
  const buf = Buffer.from(await req.arrayBuffer());
  if (!buf.length || buf.length > 4_400_000) return json({ error: '사진 크기가 맞지 않아요.' }, 413);
  const old = await getPhoto(name);
  let url;
  try { url = await putImage(name, buf, type); }
  catch (e) { return json({ error: '사진 저장소에 올리지 못했어요: ' + String(e?.message || e).slice(0, 200) }, 502); }
  const w = Number(u.searchParams.get('w')) || null, h = Number(u.searchParams.get('h')) || null;
  const t = u.searchParams.get('t'), hash = u.searchParams.get('hash');
  const taken_at = t && !isNaN(Date.parse(t)) ? new Date(t).toISOString() : null;
  await upsertPhoto({ name, url, w, h, taken_at, hash: /^[0-9a-f]{16}$/.test(hash || '') ? hash : null });
  if (old && old.url !== url) await delImages([old.url]).catch(() => {});
  return json({ name, url, w, h, taken_at });
}
