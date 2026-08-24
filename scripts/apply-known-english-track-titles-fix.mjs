import { readFile, writeFile } from 'node:fs/promises';

// Reuse the researched mapping from the main helper, correcting the three
// edition ids used by tracks.json (p3/p4/p5 rather than the guessed ids).
const source = await readFile('scripts/apply-known-english-track-titles.mjs', 'utf8');
const patchedSource = source
  .replace('p3_ps2: p3,', 'p3: p3,')
  .replace('p4_ps2: p4,', 'p4: p4,')
  .replace('p5_ps4: p5,', 'p5: p5,');
await import(`data:text/javascript;base64,${Buffer.from(patchedSource).toString('base64')}`);

const path = 'public/tracks.json';
const tracks = JSON.parse(await readFile(path, 'utf8'));
const fixes = new Map([
  ['p1_ps1\u0000街 2', 'City 2'],

  ['p2_is_psp\u0000ギンコ・テーマ(悲しい)', "Ginko's Theme (Sad)"],
  ['p2_is_psp\u0000舞耶・テーマ(悲しい)', "Maya's Theme (Sad)"],
  ['p2_is_psp\u0000ゆきの・テーマ(悲しい)', "Yukino's Theme (Sad)"],
  ['p2_is_psp\u0000MAP珠間瑠市～シバルバー', 'Outer Xibalba'],
  ['p2_is_psp\u0000回想(懐かしい)', 'Recollection (Nostalgia)'],
  ['p2_is_psp\u0000シアター', 'Theater'],
  ['p2_is_psp\u0000クエストメイク', 'Quest Creation'],
  ['p2_is_psp\u0000聖エルミン学園～異界化', 'St. Hermelin High B'],
  ['p2_is_psp\u0000軽子坂高校～異界化', 'Karukosaka High B'],

  ['p2_ep_ps1\u0000Le Cleir de lune(特殊武器店)', 'Le Cleir de lune (Special Weapon Store)'],
  ['p2_ep_psp\u0000TONY\'S SHOP（不思議アイテム店）', "TONY'S SHOP (Wonder Item Store)"],
  ['p2_ep_psp\u0000Le Cleir de lune（特殊武器店）', 'Le Cleir de lune (Special Weapon Store)'],
  ['p2_ep_psp\u0000サトミタダシ～夢崎店', 'Satomi Tadashi: Yumezaki'],

  ['p5r\u0000わたしがあなたに…', 'You and I'],
]);

let changed = 0;
for (const track of tracks) {
  const replacement = fixes.get(`${track.edition}\u0000${track.title}`);
  if (!replacement) continue;
  track.title = replacement;
  changed += 1;
}
await writeFile(path, JSON.stringify(tracks), 'utf8');

const hasJapanese = (value) => /[\u3040-\u30ff\u3400-\u9fff]/u.test(value);
const remaining = tracks.filter((track) => hasJapanese(track.title));
console.log(`Variant fixes changed ${changed} track titles.`);
console.log(`Remaining titles containing Japanese: ${remaining.length}`);
for (const track of remaining) console.log(`${track.id}\t${track.edition}\t${track.title}`);
