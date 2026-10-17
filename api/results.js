import { listPhotos, listVoters } from '../lib/store.js';
import { auth, json, signedOut } from '../lib/auth.js';
import { voterPoints, voterProgress } from '../lib/score.js';

const cmp = (a, b) => a.localeCompare(b, undefined, { numeric: true });

export async function GET(req) {
  const a = await auth(req);
  if (!a) return signedOut();
  const [photos, voters] = await Promise.all([listPhotos(), listVoters()]);
  const total = new Map();   // photo -> {score, finals, by:[{name, pts, final}]}
  for (const v of voters) {
    for (const [n, e] of voterPoints(v.state, v.picks)) {
      const t = total.get(n) || { score: 0, finals: 0, by: [] };
      const fin = e.steps.includes('final');
      t.score += e.pts; if (fin) t.finals++;
      t.by.push({ name: v.name, pts: e.pts, final: fin });
      total.set(n, t);
    }
  }
  const ranking = photos
    .filter(p => total.has(p.name))
    .map(p => {
      const t = total.get(p.name);
      t.by.sort((x, y) => y.pts - x.pts);
      return { name: p.name, url: p.url, w: p.w, h: p.h, q: p.q, ...t };
    })
    .sort((x, y) => y.score - x.score || y.finals - x.finals || cmp(x.name, y.name));
  return json({
    max: Number(a.settings.max) || 20,
    totalPhotos: photos.length,
    voters: voters.map(v => ({ name: v.name, updated_at: v.updated_at, ...voterProgress(v.state, v.picks) })),
    ranking,
  });
}
