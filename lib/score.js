// Points a voter gives a photo for getting through each step.
// pick ♥ +1 · chosen in its scene +2 · "must" +3 / "maybe" +1 · final vote +3  (max 9 per person)
export const POINTS = { pick: 1, scene: 2, must: 3, maybe: 1, final: 3 };

export function voterPoints(state, picks) {
  const out = new Map();
  const add = (n, k) => {
    const e = out.get(n) || { pts: 0, steps: [] };
    e.pts += POINTS[k]; e.steps.push(k); out.set(n, e);
  };
  const s = state || {};
  for (const [n, v] of Object.entries(s.s1 || {})) if (v === 1) add(n, 'pick');
  if (s.v === 2) {
    for (const [n, v] of Object.entries(s.scene || {})) if (v === 1) add(n, 'scene');
    for (const [n, v] of Object.entries(s.bucket || {})) if (v === 'must' || v === 'maybe') add(n, v);
  }
  const fin = Array.isArray(s.final) ? s.final : (Array.isArray(picks) ? picks : []);
  for (const n of new Set(fin)) add(n, 'final');
  return out;
}

// How far a voter has got, for the progress chips.
export function voterProgress(state, picks) {
  const s = state || {};
  const vals = Object.values(s.s1 || {});
  return {
    seen: vals.length,
    liked: vals.filter(v => v === 1).length,
    scene: Object.values(s.scene || {}).filter(v => v === 1).length,
    sorted: Object.keys(s.bucket || {}).length,
    final: (Array.isArray(s.final) ? s.final : picks || []).length,
    stage: s.stage || 'pick',
  };
}
