export const key = s => s.trim().normalize('NFC').toLocaleLowerCase();
export function parseTSV(text) {
  const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const headers = lines.shift().split('\t').map(s => s.trim());
  if (!['category', 'es', 'de'].every(h => headers.includes(h))) throw Error('Die Vokabeldatei braucht category, es und de.');
  const categories = new Map();
  for (const line of lines) {
    const cells = line.split('\t');
    const get = h => (cells[headers.indexOf(h)] || '').trim().normalize('NFC');
    const category = get('category'), es = get('es'), de = get('de');
    if (!category || /^x/i.test(category) || !es || !de) continue;
    if (!categories.has(category)) categories.set(category, new Map());
    const group = categories.get(category);
    if (!group.has(key(de))) group.set(key(de), { de, answers: [] });
    const entry = group.get(key(de));
    if (!entry.answers.some(a => key(a) === key(es))) entry.answers.push(es);
  }
  return new Map([...categories].map(([name, rows]) => [name, [...rows.values()]]));
}
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function choices(entry, pool) {
  const correct = entry.answers[0];
  const excluded = new Set(entry.answers.map(key));
  const alternatives = [...new Map(pool.flatMap(e => e.answers).filter(a => !excluded.has(key(a))).map(a => [key(a), a])).values()];
  return shuffle([correct, ...shuffle(alternatives).slice(0, 2)]);
}
export function playable(pool) { return pool.filter(e => choices(e, pool).length >= 2); }
export function lengths(n) { return [...new Set([5, 10, 15, 20].filter(v => v <= n).concat(n > 0 ? [n] : []))]; }
export class Session {
  constructor(pool, count) { this.pool = pool; this.entries = shuffle(playable(pool)).slice(0, count); this.index = 0; this.lives = 3; this.wrong = 0; this.mistakes = new Set(); this.attempted = new Set(); this.solved = false; }
  get current() { return this.entries[this.index]; }
  answer(label) {
    if (this.solved || this.lives === 0 || this.attempted.has(key(label))) return 'ignored';
    this.attempted.add(key(label));
    if (this.current.answers.some(a => key(a) === key(label))) { this.solved = true; return 'correct'; }
    this.lives--; this.wrong++; this.mistakes.add(this.index); return 'wrong';
  }
  advance() { if (!this.solved) return false; this.index++; this.attempted.clear(); this.solved = false; return true; }
  get accuracy() { const seen = Math.min(this.entries.length, this.index + (this.attempted.size ? 1 : 0)); return seen ? Math.round(100 * (seen - this.mistakes.size) / seen) : 0; }
}
