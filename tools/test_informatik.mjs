// Prüft alle Code-Karten aus informatik.js mit g++: erwartete Ausgabe bzw. erwartetes Fehlverhalten.
// Aufruf: node tools/test_informatik.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'informatik.js'), 'utf8'), ctx);
const cards = ctx.window.CARDS.filter(c => c._src);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'inf-'));
const HEAD = ['iostream', 'vector', 'string', 'cassert', 'cmath', 'list', 'set', 'unordered_set', 'algorithm', 'memory']
  .map(h => `#include <${h}>\n`).join('');
let bad = 0;
for (const c of cards) {
  const src = HEAD + (/\bint main\s*\(/.test(c._src) ? c._src : `int main() {\n${c._src}\n}\n`);
  const f = path.join(dir, 'a.cpp'), exe = path.join(dir, 'a.out');
  fs.writeFileSync(f, src);
  const comp = spawnSync('g++', ['-std=c++17', '-O0', f, '-o', exe], { encoding: 'utf8' });
  const compiled = comp.status === 0;
  let ok, info = '';
  if (c._err === 'compile') { ok = !compiled; info = compiled ? 'kompiliert unerwartet' : ''; }
  else if (!compiled) { ok = false; info = 'Kompilierfehler:\n' + comp.stderr.split('\n').slice(0, 4).join('\n'); }
  else if (c._err === 'ub') ok = true;   // nur kompilieren
  else if (c._err === 'loop') {
    const run = spawnSync(exe, [], { stdio: 'ignore', timeout: 1500 });
    ok = run.signal === 'SIGTERM' || (run.error && run.error.code === 'ETIMEDOUT');
    info = ok ? '' : 'terminiert (Exit ' + run.status + ')';
  } else {
    const run = spawnSync(exe, [], { encoding: 'utf8', timeout: 3000, maxBuffer: 1 << 26 });
    const timedOut = run.error && run.error.code === 'ETIMEDOUT' || run.signal === 'SIGTERM';
    if (['runtime', 'lz', 'so'].includes(c._err)) { ok = !timedOut && (run.status !== 0 || !!run.signal); info = ok ? '' : 'kein Abbruch'; }
    else { ok = run.stdout === c._out; info = ok ? '' : `erwartet «${c._out}», erhalten «${run.stdout}»`; }
  }
  if (!ok) bad++;
  console.log(`${ok ? '✓' : '✗'} ${c.nr.padEnd(5)} ${c._err || 'out'}\t${c.title}${info ? '\n    ' + info : ''}`);
}
console.log(`\n${cards.length - bad}/${cards.length} Code-Karten ok`);
process.exit(bad ? 1 : 0);
