/* LemmaLab – Definitionen, Sätze & Korollare lernen
 * Spaced Repetition mit FSRS-6 (persönlich trainiert), Prüfungs-Priorisierung, Quiz, Test, Statistik.
 * Fortschritt: localStorage (immer) + optional Cloud-Sync (claude.ai Artifact-DB).
 */
'use strict';
const APP_VERSION = '2026-11-21.1356';   // bei jeder Änderung neu setzen: sh tools/bump.sh (UTC-Zeit, nie von Hand runterzählen)

/* ============================================================
 * Grundlagen
 * ============================================================ */
const FACH = window.FACH || 'ana1';
const FACH_CFG = (window.FAECHER || {})[FACH] || { name: 'Analysis 1', ls: 'lemmalab-v1', gist: 'lemmalab-fortschritt.json', syncPrefix: '', examDate: '2027-01-25' };
const CARDS = window.CARDS || [];
const BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));
const MIN = 60e3, HOUR = 3600e3, DAY = 86400e3;
const DAY_START_HOUR = 4;                     // neuer Lerntag beginnt um 04:00
const LS_KEY = FACH_CFG.ls;              // pro Fach eigener Lernstand
// Frühere Speicher-Namen einmalig übernehmen (Fortschritt geht nicht verloren)
(() => { try {
  for (const [o, n] of [['ana1-lernen-v1', 'lemmalab-v1'], ['ana1-zoom', 'lemmalab-zoom'], ['ana1-gist-v1', 'lemmalab-gist-v1']]) {
    const v = localStorage.getItem(o);
    if (v != null) { if (localStorage.getItem(n) == null) localStorage.setItem(n, v); localStorage.removeItem(o); }
  }
} catch (e) { } })();

const PRIO = {
  5: { name: 'Kern',      color: 'var(--p5)', ret: 0.97, w: 5 },
  4: { name: 'Wichtig',   color: 'var(--p4)', ret: 0.96, w: 3 },
  3: { name: 'Solide',    color: 'var(--p3)', ret: 0.95, w: 2 },
  2: { name: 'Ergänzung', color: 'var(--p2)', ret: 0.93, w: 1 },
  1: { name: 'Rand',      color: 'var(--p1)', ret: 0.90, w: 0.4 },
};
const KIND_COLOR = { Definition: 'var(--def)', Satz: 'var(--satz)', Theorem: 'var(--satz)', Lemma: 'var(--lem)', Proposition: 'var(--prop)', Korollar: 'var(--kor)',
  Gesetz: 'var(--satz)', Formel: 'var(--prop)', Konzept: 'var(--kor)', Rezept: 'var(--lem)', Regel: 'var(--satz)', Code: 'var(--prop)',
  Behauptung: 'var(--prop)', Bemerkung: 'var(--kor)', Beispiel: 'var(--lem)', Axiom: 'var(--satz)' };
const KIND_SHORT = { Definition: 'Def.', Satz: 'Satz', Theorem: 'Thm.', Lemma: 'Lemma', Proposition: 'Prop.', Korollar: 'Kor.',
  Gesetz: 'Gesetz', Formel: 'Formel', Konzept: 'Konzept', Rezept: 'Rezept', Regel: 'Regel', Code: 'Code',
  Behauptung: 'Beh.', Bemerkung: 'Bem.', Beispiel: 'Bsp.', Axiom: 'Axiom' };
const KIND_PLURAL = { Definition: 'Definitionen', Satz: 'Sätze/Theoreme', Lemma: 'Lemmata', Proposition: 'Propositionen', Korollar: 'Korollare',
  Gesetz: 'Gesetze', Formel: 'Formeln', Konzept: 'Konzeptfragen', Rezept: 'Rezepte', Regel: 'Regeln', Code: 'Code-Tracing',
  Behauptung: 'Behauptungen', Bemerkung: 'Bemerkungen', Beispiel: 'Beispiele', Axiom: 'Axiome' };
const kindKey = c => c.kind === 'Theorem' ? 'Satz' : c.kind === 'Axiom' ? 'Regel' : c.kind;
const KINDS = Object.keys(KIND_PLURAL).filter(k => CARDS.some(c => kindKey(c) === k));
const CHAP_KEYS = Object.keys(window.CHAPTERS || {}).map(Number).sort((a, b) => a - b);

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const now = () => Date.now();

const _ds = new Map();                   // Cache pro Stunde (Simulation ruft das sehr oft auf)
function dayStart(t = now()) {           // Beginn des Lerntags (04:00) von t
  const h = Math.floor(t / HOUR);
  let r = _ds.get(h);
  if (r === undefined) { if (_ds.size > 20000) _ds.clear(); r = dayStart0(h * HOUR); _ds.set(h, r); }
  return r;
}
function dayStart0(t) {
  const d = new Date(t - DAY_START_HOUR * HOUR);
  d.setHours(0, 0, 0, 0);
  return d.getTime() + DAY_START_HOUR * HOUR;
}
function dayKey(t = now()) {
  const d = new Date(dayStart(t));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const _pd = new Map();
function parseDate(s) { let v = _pd.get(s); if (v === undefined) { const [y, m, d] = s.split('-').map(Number); v = new Date(y, m - 1, d, 8).getTime(); _pd.set(s, v); } return v; }
function fmtSec(sec) { sec = Math.round(sec); if (sec < 60) return sec + ' s'; if (sec < 3600) return Math.floor(sec / 60) + ' Min ' + String(sec % 60).padStart(2, '0') + ' s'; return Math.floor(sec / 3600) + ' Std ' + Math.round(sec % 3600 / 60) + ' Min'; }
function fmtDate(t) { return new Date(t).toLocaleDateString('de-CH', { day: 'numeric', month: 'short' }); }
function fmtIvl(ms) {
  if (ms < HOUR) return Math.max(1, Math.round(ms / MIN)) + ' Min';
  if (ms < DAY) return Math.round(ms / HOUR) + ' Std';
  const d = ms / DAY;
  if (d < 30) return Math.round(d) + ' T';
  if (d < 365) return (d / 30).toFixed(d < 60 ? 1 : 0) + ' Mt';
  return (d / 365).toFixed(1) + ' J';
}
function hash(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ============================================================
 * FSRS-6 (21 Parameter, trainierbarer Vergessensverlauf)
 * Formeln wie in ts-fsrs / fsrs-rs. makeFSRS(w) wird auch im
 * Trainings-Worker verwendet – darum ohne Bezüge nach aussen.
 * ============================================================ */
const FSRS6_DEFAULT = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796,
  1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
const FSRS6_BOUNDS = [[0.001, 100], [0.001, 100], [0.001, 100], [0.001, 100], [1, 10], [0.001, 4], [0.001, 4], [0.001, 0.75],
  [0, 4.5], [0, 0.8], [0.001, 3.5], [0.001, 5], [0.001, 0.25], [0.001, 0.9], [0, 4], [0, 1], [1, 6], [0, 2], [0, 2], [0.01, 0.8], [0.1, 0.8]];
function makeFSRS(w) {
  const lim = (v, a, b) => Math.min(b, Math.max(a, v));
  const decay = -w[20], factor = Math.pow(0.9, 1 / decay) - 1;
  const R = (t, S) => Math.pow(1 + factor * t / S, decay);
  const ivl = (S, r) => S / factor * (Math.pow(r, 1 / decay) - 1);
  const S0 = g => Math.max(w[g - 1], 0.1);
  const D0raw = g => w[4] - Math.exp((g - 1) * w[5]) + 1;
  const D0 = g => lim(D0raw(g), 1, 10);
  const nextD = (D, g) => { const d2 = D + (-w[6] * (g - 3)) * (10 - D) / 9; return lim(w[7] * D0raw(4) + (1 - w[7]) * d2, 1, 10); };
  const recallS = (D, S, r, g) => lim(S * (1 + Math.exp(w[8]) * (11 - D) * Math.pow(S, -w[9]) * (Math.exp((1 - r) * w[10]) - 1) * (g === 2 ? w[15] : 1) * (g === 4 ? w[16] : 1)), 0.001, 36500);
  const forgetS = (D, S, r) => Math.min(S / Math.exp(w[17] * w[18]), lim(w[11] * Math.pow(D, -w[12]) * (Math.pow(S + 1, w[13]) - 1) * Math.exp((1 - r) * w[14]), 0.001, 36500));
  const shortS = (S, g) => { let k = Math.pow(S, -w[19]) * Math.exp(w[17] * (g - 3 + w[18])); if (g >= 2) k = Math.max(k, 1); return lim(S * k, 0.001, 36500); };
  /* Startzustand; dl = Schwierigkeits-Verschiebung aus den Daten aller Nutzer */
  const init = (g, dl = 0) => ({ S: Math.max(0.1, S0(g) * Math.exp(-0.25 * dl)), D: lim(D0(g) + dl, 1, 10) });
  /* ein Lernschritt: el = vergangene Tage (< 0,5 = gleicher Tag) */
  const step = (m, g, el) => {
    if (el < 0.5) return { S: shortS(m.S, g), D: nextD(m.D, g) };
    const r = R(el, m.S);
    return { S: g === 1 ? forgetS(m.D, m.S, r) : recallS(m.D, m.S, r, g), D: nextD(m.D, g) };
  };
  return { w, R, ivl, S0, D0, nextD, recallS, forgetS, shortS, init, step };
}
let FSRS = makeFSRS(FSRS6_DEFAULT);

/* ============================================================
 * Zustand & Speicherung
 * ============================================================ */
const DEFAULT_SETTINGS = {
  examDate: FACH_CFG.examDate || '2027-01-25', newMode: 'auto', newPerDay: 15, maxReviews: 250,
  includeRand: false, theme: 'auto', typeAnswer: false, budget: 0, u: 0, fourButtons: false,
};
const swipeMode = () => !S.settings.fourButtons;
let S = load();

function blankState() {
  return { v: 1, cards: {}, log: [], settings: { ...DEFAULT_SETTINGS }, created: now() };
}
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const st = JSON.parse(raw);
      st.settings = { ...DEFAULT_SETTINGS, ...(st.settings || {}) };
      st.cards = st.cards || {}; st.log = st.log || [];
      return st;
    }
  } catch (e) { console.warn(e); }
  return blankState();
}
let saveTimer = null;
function save(syncKeys = ['cards', 'settings', 'log']) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { console.warn('localStorage', e); }
  Sync.schedule(syncKeys);
  Gist.schedule();
  if (typeof Cloud !== 'undefined') Cloud.schedule();
}
function cs(id) {               // Lernzustand einer Karte
  return S.cards[id] || (S.cards[id] = { st: 0, u: 0 });
}
function prioOf(c) { const x = S.cards[c.id]; return (x && x.prio) || c.prio; }

/* ============================================================
 * Prüfungsdatum & Planung
 * ============================================================ */
const MASTER_BEFORE = 30;  // Ziel: alles 1 Monat vor der Prüfung sicher beherrschen
const CONSOLIDATE = 14;    // so lange braucht eine neue Karte mindestens, bis sie sitzt
const TRACK_BUFFER = MASTER_BEFORE + CONSOLIDATE;   // bis dahin muss alles eingeführt sein
function examTime() { return parseDate(S.settings.examDate || DEFAULT_SETTINGS.examDate); }
function daysToExam() { return Math.ceil((dayStart(examTime()) - dayStart()) / DAY); }

function retFor(c) { const p = prioOf(c), t = Tune.get(); return (t && t.ret && t.ret[p]) || PRIO[p].ret; }

function retrievability(x, t = now()) {
  if (!x || !x.st || !x.S) return 0;
  return FSRS.R(Math.max(0, (t - x.last) / DAY), x.S * Calib.k());
}

function eligibleNew(all) {   // all = auch noch gesperrte Skript-Karten (für Planung/Prognose)
  let list = CARDS.filter(c => {
    const x = S.cards[c.id];
    if (x && (x.st || x.susp)) return false;
    if (prioOf(c) === 1 && !S.settings.includeRand) return false;
    return true;
  });
  // Lineare Algebra: Mitschrift dieses Jahres zuerst. Skript-Karten kommen erst dazu, wenn die ganze Mitschrift
  // eingeführt und gut beherrscht ist (neue Mitschrift-Wochen haben automatisch wieder Vorrang).
  const F = FACH_CFG.focusSrc;
  if (F) {
    const fs = focusState();
    if (!fs.open && !all) list = list.filter(c => c.src === F);
  }
  return list.sort((a, b) => (F ? (b.src === F) - (a.src === F) : 0) || (prioOf(b) - prioOf(a)) || (a.ord - b.ord));
}
const FOCUS_SHARE = 0.8, FOCUS_STAB = 7;   // 80 % der Mitschrift-Karten gefestigt (Stabilität ≥ 7 Tage)
function focusState() {
  const F = FACH_CFG.focusSrc;
  const pool = CARDS.filter(c => c.src === F && !(S.cards[c.id] || {}).susp && (prioOf(c) > 1 || S.settings.includeRand));
  let left = 0, ok = 0;
  for (const c of pool) { const x = S.cards[c.id]; if (!x || !x.st) left++; else if (x.st === 2 && x.S >= FOCUS_STAB) ok++; }
  const need = Math.ceil(pool.length * FOCUS_SHARE);
  return { total: pool.length, left, ok, need, open: left === 0 && ok >= need };
}

function newIntroducedToday() {
  const ds = dayStart();
  return CARDS.filter(c => { const x = S.cards[c.id]; return x && x.intro && x.intro >= ds; }).length;
}

/* Persönliche Durchschnittszeiten (Sekunden), aus deinen eigenen Lerndaten.
 * Median der letzten 300 passenden Bewertungen; Standardwerte, solange Daten fehlen. */
function median(a) { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
let _ptCache = null, _ptLen = -1;
function personalTimes() {
  if (_ptLen === S.log.length && _ptCache) return _ptCache;
  const srs = S.log.filter(l => modeOf(l) === 'l' && l[4] > 0);
  const pick = f => srs.filter(f).slice(-300).map(l => l[4] / 10);
  const review = median(pick(l => l[3] === 2)) ?? 25;
  const fresh = median(pick(l => l[3] === 0)) ?? 45;
  const learn = median(pick(l => l[3] === 1 || l[3] === 3)) ?? 20;
  const nNew = srs.filter(l => l[3] === 0).length;
  const nSteps = srs.filter(l => l[3] === 1).length;
  const steps = nNew >= 10 ? nSteps / nNew : 1.5;
  _ptLen = S.log.length;
  return (_ptCache = { review, fresh, learn, steps, newCost: fresh + steps * learn, newFactor: 1, fromData: srs.length >= 20 });
}

// Tempo pro Fach (fach.js: pace). Lineare Algebra ist lockerer, weil die Prüfung erst im Sommer ist.
const PACE = { minNew: 12, low: 20, mid: 16, max: 40, ...(FACH_CFG.pace || {}) };
const MIN_NEW_BASE = PACE.minNew;
function MIN_NEW() { const t = Tune.get(); return t && Number.isFinite(t.minNew) ? t.minNew : MIN_NEW_BASE; }   // so viele neue Karten pro Tag mindestens (Ziel: alles so schnell wie möglich beherrschen)
function plannedNewPerDay() {
  if (S.settings.newMode === 'manual') return S.settings.newPerDay;
  // Gerechnet mit dem Stand zu Tagesbeginn (heute Eingeführtes/Wiederholtes zählt mit), damit die Zahl über den Tag gleich bleibt.
  const remaining = eligibleNew(true).length + newIntroducedToday();
  if (!remaining) return 0;
  // 1) Prognose: alles spätestens TRACK_BUFFER Tage vor der Prüfung eingeführt, mit 15 % Reserve
  // 2) Mindestens MIN_NEW() pro Tag – oder mehr, falls die Simulation zeigt, dass sonst das Ziel verfehlt wird
  const minN = minNewToday();
  let n = minN;
  // 3) Mehr, wenn die Wiederholungen heute wenig Platz brauchen
  const ds = dayStart();
  const load = dueReviews().length + S.log.filter(l => l[0] >= ds && l[3] === 2 && modeOf(l) !== 'q').length;
  if (load < 25) n = Math.max(n, PACE.low);
  else if (load < 50) n = Math.max(n, PACE.mid);
  // Zeitbudget (falls gesetzt) begrenzt nach oben, aber nie unter das Minimum
  const b = +S.settings.budget || 0;
  if (b > 0) {
    const pt = personalTimes();
    const free = b * 60 - load * pt.review;
    n = Math.min(n, Math.max(minN, Math.floor(free / pt.newCost)));
  }
  return Math.min(clamp(n, MIN_NEW(), Math.max(PACE.max, minN)), remaining);
}
/* Was heute mindestens nötig ist, damit die Prognose hält (ohne Zuschlag «mehr, wenn Platz ist») */
function minNewToday() {
  const remaining = eligibleNew(true).length + newIntroducedToday();
  if (!remaining) return 0;
  if (S.settings.newMode === 'manual') return Math.min(S.settings.newPerDay, remaining);
  const days = Math.max(1, daysToExam() - TRACK_BUFFER);
  return Math.min(remaining, Math.max(MIN_NEW(), Math.ceil(remaining / (days * 0.85)), Forecast.needMin()));
}
/* (Forecast ist weiter unten definiert; plannedNewPerDay wird erst nach dem Laden aufgerufen) */

function dueReviews(until = dayStart() + DAY) {
  return CARDS.filter(c => { const x = S.cards[c.id]; return x && x.st >= 1 && !x.susp && x.due <= until; });
}

/* Prüfungs-Deckel: kein Intervall läuft über die Prüfung hinaus – letzte
 * Wiederholung wird auf die letzten 1–5 Tage vor der Prüfung verteilt. */
function capDue(id, due, t = now()) {
  // 1) Kontrolle vor dem Ziel-Stichtag (1 Monat vor der Prüfung): jede Karte kommt in den
  //    letzten 1–5 Tagen davor nochmals dran – so ist am Stichtag alles frisch geprüft.
  const goal = dayStart(examTime() - MASTER_BEFORE * DAY);
  const gLast = goal - (6 + hash(id + 'g') % 5) * DAY + 6 * HOUR;
  if (due > gLast && gLast > t + DAY && due > goal) return gLast;
  // 2) Letzte Wiederholung in den letzten 1–5 Tagen vor der Prüfung
  const ex = dayStart(examTime());
  if (ex <= t) return due;
  const last = ex - (1 + hash(id) % 5) * DAY + 6 * HOUR;
  if (due > last && last > t + DAY) return last;
  return due;
}

/* ============================================================
 * Lastverteilung, Wiederholungs-Simulation & persönliche Kalibrierung
 * ============================================================ */
function dueLoadByDay(exceptId, t) {
  const m = {};
  for (const c of CARDS) {
    if (c.id === exceptId) continue;
    const x = S.cards[c.id];
    if (x && x.st === 2 && !x.susp && x.due > t) { const k = dayKey(x.due); m[k] = (m[k] || 0) + 1; }
  }
  return m;
}

/* Spielt den gesamten Lernverlauf mit FSRS nach. Liefert pro Wiederholung
 * (Karte war im Wiederholungsmodus) die verstrichene Zeit, Stabilität und
 * ob gewusst – Grundlage für Kalibrierung und Statistiken. */
const Replay = {
  _len: -1, _res: null, _ver: '',
  run() {
    if (this._len === S.log.length && this._ver === Model.ver && this._res) return this._res;
    const byCard = {};
    for (const l of S.log) if (modeOf(l) !== 'q' && BY_ID[l[1]]) (byCard[l[1]] = byCard[l[1]] || []).push(l);
    const reviews = [], timeline = {};
    for (const [id, arr] of Object.entries(byCard)) {
      arr.sort((a, b) => a[0] - b[0]);
      let x = { st: 0 };
      const tl = timeline[id] = [];
      for (const l of arr) {
        if (x.st === 2 && x.S) {
          const el = (l[0] - x.last) / DAY;
          if (el >= 0.5) reviews.push({ id, el, S: x.S, ok: l[2] >= 2, t: l[0], prio: BY_ID[id].prio });
        }
        x = schedule(BY_ID[id], x, l[2], l[0], { replay: true });
        tl.push({ t: l[0], S: x.S, D: x.D, last: x.last, st: x.st });
      }
    }
    this._len = S.log.length; this._ver = Model.ver;
    return (this._res = { reviews, timeline });
  },
};

/* Persönlicher Gedächtnisfaktor k: skaliert die Stabilität so, dass die
 * vorhergesagte Abrufwahrscheinlichkeit zu deinen echten Ergebnissen passt.
 * k > 1: du behältst besser als das Standardmodell → längere Intervalle.
 * Wird erst ab 40 Wiederholungen aktiv und zu 1 hin gedämpft. */
const Calib = {
  _len: -1, _ver: '', _k: 1, _raw: 1, _n: 0,
  k() { this.update(); return this._k; },
  update() {
    if (this._len === S.log.length && this._ver === Model.ver) return;
    this._len = S.log.length; this._ver = Model.ver;
    if (S.settings.calib === false || Model.personal()) { this._k = 1; this._n = 0; return; }
    const rv = Replay.run().reviews;
    this._n = rv.length;
    if (rv.length < 40) { this._k = 1; this._raw = 1; return; }
    let best = 1, bestL = Infinity;
    for (let i = 0; i <= 60; i++) {
      const k = Math.exp(Math.log(0.3) + i / 60 * (Math.log(3.5) - Math.log(0.3)));
      let L = 0;
      for (const r of rv) { const p = clamp(FSRS.R(r.el, r.S * k), 1e-4, 1 - 1e-4); L -= r.ok ? Math.log(p) : Math.log(1 - p); }
      if (L < bestL) { bestL = L; best = k; }
    }
    this._raw = best;
    const wgt = rv.length / (rv.length + 150);              // Dämpfung bei wenig Daten
    this._k = Math.exp(wgt * Math.log(best));
  },
};

/* ============================================================
 * Korrektur von aussen (KI-Analyse)
 * Analyse-Datei (alle Fächer) exportieren → auswerten lassen → Korrektur-Datei einspielen.
 * Die Korrektur liegt in settings.tune des jeweiligen Fachs und wird mit dem Konto abgeglichen:
 *   ret     Zielsicherheit pro Priorität {5: .97, …}
 *   w       21 FSRS-6-Parameter (ersetzen Standard/persönliches Training)
 *   minNew  Untergrenze neuer Karten pro Tag
 *   dCard   Schwierigkeits-Korrektur pro Karte {id: −3…3} (+ = schwerer)
 * ============================================================ */
const Tune = {
  get(st = S) { const t = st && st.settings && st.settings.tune; return t && typeof t === 'object' && t.at ? t : null; },
  clean(o) {
    const t = { id: String(o.id || '').slice(0, 60), note: String(o.note || '').slice(0, 600), at: now() };
    if (o.ret && typeof o.ret === 'object') { const r = {}; for (const p of [1, 2, 3, 4, 5]) { const v = +o.ret[p]; if (v >= 0.7 && v <= 0.99) r[p] = v; } if (Object.keys(r).length) t.ret = r; }
    if (Array.isArray(o.w)) {
      if (o.w.length !== 21 || o.w.some((v, i) => !Number.isFinite(+v) || +v < FSRS6_BOUNDS[i][0] || +v > FSRS6_BOUNDS[i][1])) throw new Error('w: 21 Werte innerhalb der FSRS-6-Grenzen nötig');
      t.w = o.w.map(Number);
    }
    if (o.minNew != null) { const v = Math.round(+o.minNew); if (!(v >= 0 && v <= 40)) throw new Error('minNew: 0–40'); t.minNew = v; }
    if (o.dCard && typeof o.dCard === 'object') { const d = {}; for (const [k, v] of Object.entries(o.dCard).slice(0, 3000)) if (Number.isFinite(+v) && +v) d[String(k).slice(0, 80)] = clamp(+v, -3, 3); if (Object.keys(d).length) t.dCard = d; }
    return t;
  },
  exportString() {
    const subjects = {};
    for (const k of Object.keys(window.FAECHER || { [FACH]: 1 })) { const o = k === FACH ? S : (window.FachStore && FachStore.read(k)); if (o && ((o.log || []).length || Object.keys(o.cards || {}).length)) subjects[k] = o; }
    return JSON.stringify({ ANLEITUNG_FUER_CLAUDE: this.prompt(), app: 'lemmalab-analyse', version: APP_VERSION, exported: new Date().toISOString(), active: FACH,
      model: { status: Model.status(), community: Community.data ? { at: Community.data.at, ff0: Community.data.ff0, cards: Community.data.cards } : null }, subjects });
  },
  /* steht zuoberst in der Analyse-Datei: Hochladen + «Analysiere» genügt */
  prompt() {
    const ret = [5, 4, 3, 2, 1].map(p => `${p} ${PRIO[p].name} ${PRIO[p].ret}`).join(', ');
    return [
      'AUFTRAG: Dies ist die Analyse-Datei meiner Lern-App LemmaLab (https://lemmalab-app.github.io, Code öffentlich: github.com/lemmalab-app/lemmalab-app.github.io) für die ETH-Basisprüfung. Analysiere sie gründlich und erstelle mir daraus eine Korrektur-Datei für den Algorithmus. Antworte in Schweizer Rechtschreibung (kein ß).',
      'ZIEL: Bis 1 Monat vor jeder Prüfung alle Karten sicher beherrschen (sicher = Stabilität ≥ 21 Tage), mit möglichst wenig unnötigen Wiederholungen. Prüfungsdatum pro Fach: subjects.<fach>.settings.examDate.',
      'DATEN: subjects = {ana1: Analysis 1, phy1: Physik 1, inf1: Informatik, la: Lineare Algebra 1 & 2} (nur Fächer mit Daten), je {cards, log, settings}. log-Eintrag = [Zeit ms, Karten-ID, Note, Zustand davor, Zeit total ms, Modus, Zeit Vorderseite ms, Zeit Rückseite ms]. Note 1 nicht gewusst, 3 gewusst (2 schwer, 4 einfach bei 4 Stufen). Modus l Lernen, t Test (zählt fürs Lernsystem), q Quiz (zählt nicht). Zustand 0 neu, 1 lernen, 2 wiederholen, 3 neu lernen. cards = {id: {st, S Stabilität in Tagen, D Schwierigkeit 1–10, last, due, intro, lapses, prio?}}. settings.fsrsW = persönlich trainierte Parameter (fsrsMeta.adopted = übernommen), settings.tune = aktive Korrektur. model.community.cards = {id: [_, Personen, Anteil Fehler beim 1. Mal]}, ff0 = Durchschnitt. Karteninhalte und Standard-Prioritäten im Repo: data.js (ana1), physik.js, informatik.js, linalg.js; Algorithmus in app.js (makeFSRS, schedule, Forecast).',
      `ALGORITHMUS: FSRS-6, 21 Parameter. Standard ${JSON.stringify(FSRS6_DEFAULT)}. Grenzen ${JSON.stringify(FSRS6_BOUNDS)}. Zielsicherheit pro Priorität: ${ret}. Mindestens ${MIN_NEW_BASE} neue Karten pro Tag. Jede Karte kommt 6–10 Tage vor dem Ziel-Stichtag und 1–5 Tage vor der Prüfung nochmals dran.`,
      'VORGEHEN: 1) Überblick pro Fach: Wiederholungen, Lerntage, Trefferquote, Tempo neuer Karten, Stand gegenüber dem Ziel. 2) Kalibrierung: vorhergesagtes R vs. tatsächliche Quote in Klassen – werde ich über- oder unterschätzt? Bei genug Daten (≥ 100 Wiederholungen mit Abstand ≥ 0.5 Tage) FSRS-6-Parameter selbst fitten (Log-Loss, chronologisch 80/20 validieren) und nur vorschlagen, wenn sie auf den neuesten 20 % besser sind als Standard UND als fsrsW. 3) Karten, die systematisch schwerer/leichter sind als erwartet (auch gegenüber community) → Schwierigkeits-Korrektur. 4) Lange Denkzeiten bei «gewusst» nur berücksichtigen, wenn es die Vorhersage messbar verbessert. 5) Prognose: Reichen Tempo und Zielsicherheit für alle Karten am Stichtag? Sonst konkrete Anpassung. 6) Nur ändern, was die Daten belegen; bei zu wenig Daten nichts ändern und das sagen.',
      'AUSGABE: A) Kurzer, ehrlicher Bericht mit Zahlen: Befunde, was du änderst und warum, was ich selbst anders machen sollte. B) Korrektur-Datei als Download (lemmalab-tune-JJJJ-MM-TT.json) und zusätzlich als Text im Codeblock, exakt so: {"app":"lemmalab-tune","id":"JJJJ-MM-TT","note":"1–2 Sätze Begründung, max. 600 Zeichen","subjects":{"ana1":{"ret":{"5":0.97},"w":[21 Zahlen],"minNew":12,"dCard":{"<Karten-ID>":0.5}}}}. Alle Felder pro Fach optional – nur angeben, was du ändern willst. ret 0.70–0.99, minNew 0–40, dCard −3…3 (+ = schwerer, wirkt auf die Startschwierigkeit). Fach mit null entfernt dessen Korrektur. Eine neue Korrektur ersetzt die alte des Fachs vollständig – weiterhin sinnvolle Werte aus settings.tune übernehmen. Ich spiele sie in der App unter Einstellungen → KI-Analyse → «Korrektur von Claude einspielen» ein.',
    ].join('\n\n');
  },
  exportFile() {
    const s = this.exportString();
    try {
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'application/json' }));
      a.download = `lemmalab-analyse-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { showText(s); }
  },
  /* {app:'lemmalab-tune', id, note, subjects:{ana1:{…}, phy1:{…}}} – Fach mit null entfernt dessen Korrektur */
  apply(o) {
    if (!o || o.app !== 'lemmalab-tune' || !o.subjects || typeof o.subjects !== 'object') throw new Error('keine gültige Korrektur-Datei');
    const ids = Object.keys(window.FAECHER || { [FACH]: 1 }), done = [];
    const next = {};
    for (const [k, v] of Object.entries(o.subjects)) { if (!ids.includes(k)) throw new Error('unbekanntes Fach: ' + k); next[k] = v === null ? null : this.clean({ id: o.id, note: o.note, ...v }); }
    for (const [k, t] of Object.entries(next)) {
      const st = k === FACH ? S : (FachStore.read(k) || (typeof blankFor === 'function' ? blankFor(k) : null));
      if (!st) continue;
      if (t) st.settings.tune = t; else delete st.settings.tune;
      st.settings.u = now();
      if (k !== FACH) FachStore.write(k, st);
      done.push(((window.FAECHER || {})[k] || {}).name || k);
    }
    this.refresh(); return done;
  },
  reset() {
    for (const k of Object.keys(window.FAECHER || { [FACH]: 1 })) {
      const st = k === FACH ? S : FachStore.read(k);
      if (st && st.settings && st.settings.tune) { delete st.settings.tune; st.settings.u = now(); if (k !== FACH) FachStore.write(k, st); }
    }
    this.refresh();
  },
  refresh() { Forecast._key = ''; Forecast._nk = ''; Model.sync(); save(['settings']); },
  summary(t) {
    if (!t) return 'Keine';
    const parts = [];
    if (t.ret) parts.push('Zielsicherheit ' + [5, 4, 3, 2, 1].filter(p => t.ret[p]).map(p => `${PRIO[p].name} ${Math.round(t.ret[p] * 100)} %`).join(', '));
    if (t.w) parts.push('Modell-Parameter');
    if (t.minNew != null) parts.push(`mind. ${t.minNew} neue/Tag`);
    if (t.dCard) parts.push(`${Object.keys(t.dCard).length} Karten-Schwierigkeiten`);
    return parts.join(' · ') || 'Keine Änderungen';
  },
  html() {
    const rows = Object.entries(window.FAECHER || { [FACH]: { name: FACH } }).filter(([k, f]) => !f.kind).map(([k, f]) => {
      const t = this.get(k === FACH ? S : FachStore.read(k));
      return `<div class="ir"><span class="ir-l"><b>${esc(f.name || k)}</b><small>${esc(this.summary(t))}${t ? ` · ${new Date(t.at).toLocaleDateString('de-CH')}` : ''}</small></span></div>`;
    }).join('');
    const notes = [...new Set(Object.keys(window.FAECHER || { [FACH]: 1 }).map(k => (this.get(k === FACH ? S : FachStore.read(k)) || {}).note).filter(Boolean))];
    const any = Object.keys(window.FAECHER || { [FACH]: 1 }).some(k => this.get(k === FACH ? S : FachStore.read(k)));
    return UI.group([
      UI.action('Daten für Claude exportieren', 'tuneexport'),
      `<label class="ir ia"><span class="ir-l">Korrektur von Claude einspielen</span><input type="file" id="tuneFile" accept=".json,application/json" class="hide"></label>`,
      UI.action('Korrektur als Text einfügen', 'tunepaste'),
    ], { header: 'KI-Analyse', footer: 'Die Datei enthält deinen Lernverlauf aller Fächer und den Auftrag für Claude. Einfach im Chat hochladen und «Analysiere» schreiben, dann die Korrektur-Datei hier einspielen. Gilt auf allen Geräten.' })
      + (any ? UI.group([rows, notes.length ? `<div class="ir"><span class="ir-l"><small>${notes.map(esc).join('<br>')}</small></span></div>` : '', UI.action('Korrektur entfernen', 'tunereset')], { header: 'Aktive Korrekturen' }) : '');
  },
};
document.addEventListener('change', e => { if (e.target && e.target.id === 'tuneFile') { const f = e.target.files[0]; if (f) f.text().then(tuneImportText); e.target.value = ''; } });
function tuneImportText(txt) {
  try { const done = Tune.apply(JSON.parse(txt)); closeModal(); toast(`Korrektur eingespielt: ${done.join(', ')}`); render(); }
  catch (e) { toast('Fehler: ' + e.message); }
}

/* ============================================================
 * Modell: Standard-FSRS-6 oder persönlich trainierte Parameter
 * ============================================================ */
const Model = {
  ver: 'd', _key: '',
  personal() { const st = S.settings; return st.calib !== false && Array.isArray(st.fsrsW) && st.fsrsW.length === 21 && !!(st.fsrsMeta && st.fsrsMeta.adopted); },
  apply() {
    const t = Tune.get();
    const w = t && t.w ? t.w : this.personal() ? S.settings.fsrsW : FSRS6_DEFAULT;
    const key = w.join(',') + '|' + Community.ver + '|' + (S.settings.community === false ? 0 : 1) + '|' + (t ? t.at : 0);
    if (key === this._key) return false;
    this._key = key; FSRS = makeFSRS(w.slice()); this.ver = hash(key).toString(36);
    return true;
  },
  /* Gedächtniszustand (S, D) aller Karten aus dem Verlauf neu berechnen; Fälligkeiten bleiben */
  rebuild() {
    const tl = Replay.run().timeline;
    for (const [id, arr] of Object.entries(tl)) { const x = S.cards[id], e = arr[arr.length - 1]; if (x && x.st && e && e.S) { x.S = e.S; x.D = e.D; } }
    try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { }
  },
  sync() { if (this.apply() && S.log.length) this.rebuild(); },
  status() {
    const m = S.settings.fsrsMeta || {}, n = Trainer.count();
    const t = Tune.get();
    if (t && t.w) return `Von aussen korrigiert (${new Date(t.at).toLocaleDateString('de-CH')})`;
    if (S.settings.calib === false) return 'Aus – Standardwerte';
    if (this.personal()) return `Persönlich trainiert auf ${n.toLocaleString('de-CH')} Wiederholungen${m.gain > 0 ? ` · ${Math.round(m.gain * 100)} % genauer` : ''}`;
    if (m.at) return `Standardwerte passen noch besser (${n} Wiederholungen)`;
    return n < Trainer.MIN ? `Startet ab ${Trainer.MIN} Wiederholungen (bisher ${n})` : 'Training ausstehend';
  },
};

/* ---------- Training im Hintergrund (Web Worker) ----------
 * Minimiert den Log-Loss der Vorhersage «gewusst?» über deine Wiederholungen.
 * Prüfung auf den jüngsten 20 %: Nur wenn das trainierte Modell dort besser
 * vorhersagt als die Standardwerte, wird es übernommen. */
const Trainer = {
  MIN: 100, running: false, progress: 0,
  seqs() {
    const by = {};
    for (const l of S.log) if (modeOf(l) !== 'q' && BY_ID[l[1]]) (by[l[1]] = by[l[1]] || []).push([l[0], l[2]]);
    return Object.entries(by).map(([id, a]) => ({ dl: Community.delta(id), r: a.sort((p, q) => p[0] - q[0]) }));
  },
  _cl: -1, _cn: 0,
  count() {
    if (this._cl === S.log.length) return this._cn;
    let n = 0; for (const q of this.seqs()) for (let i = 1; i < q.r.length; i++) if ((q.r[i][0] - q.r[i - 1][0]) / DAY >= 0.5) n++;
    this._cl = S.log.length; return (this._cn = n);
  },
  due() {
    if (S.settings.calib === false || this.running || typeof Worker === 'undefined') return false;
    const m = S.settings.fsrsMeta || {}, n = this.count();
    if (n < this.MIN) return false;
    if (!m.at) return true;
    return now() - m.at > 20 * HOUR && n >= (m.n || 0) * 1.1 + 20;
  },
  run() {
    if (this.running || typeof Worker === 'undefined') return;
    const seqs = this.seqs();
    const times = []; for (const q of seqs) for (let i = 1; i < q.r.length; i++) if ((q.r[i][0] - q.r[i - 1][0]) / DAY >= 0.5) times.push(q.r[i][0]);
    if (times.length < this.MIN) return;
    times.sort((a, b) => a - b);
    const split = times[Math.floor(times.length * 0.8)];
    const src = `${makeFSRS.toString()}\nconst B=${JSON.stringify(FSRS6_BOUNDS)},W0=${JSON.stringify(FSRS6_DEFAULT)};\n(${trainWorker.toString()})();`;
    let wk;
    try { wk = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' }))); } catch (e) { return; }
    this.running = true; this.progress = 0;
    wk.onmessage = e => {
      const d = e.data;
      if (d.progress != null) { this.progress = d.progress; const el = $('#trainStatus'); if (el) el.textContent = `Training läuft … ${Math.round(d.progress * 100)} %`; return; }
      this.running = false; wk.terminate();
      if (d.error) { console.warn('Training', d.error); return; }
      S.settings.fsrsW = d.w.map(v => Math.round(v * 1e4) / 1e4);
      S.settings.fsrsMeta = { at: now(), n: times.length, adopted: d.adopted, gain: d.gain, testN: d.testN, lossFit: d.lossFit, lossDef: d.lossDef };
      S.settings.u = now();
      save(['settings']);
      Model.sync();
      if ((tab === 'mehr' || tab === 'statistik') && !session && !quiz) render();
    };
    wk.onerror = () => { this.running = false; };
    wk.postMessage({ seqs, split });
  },
};
/* läuft im Worker: makeFSRS, B (Grenzen) und W0 (Standardwerte) sind dort definiert */
function trainWorker() {
  onmessage = e => {
    try {
      const { seqs, split } = e.data, DAYMS = 86400000;
      const loss = (w, mode) => {
        const F = makeFSRS(w); let L = 0, n = 0;
        for (const q of seqs) {
          let m = F.init(q.r[0][1], q.dl);
          for (let i = 1; i < q.r.length; i++) {
            const el = (q.r[i][0] - q.r[i - 1][0]) / DAYMS, g = q.r[i][1], t = q.r[i][0];
            if (el >= 0.5 && (mode === 0 || (mode === 1 && t < split) || (mode === 2 && t >= split))) {
              const p = Math.min(1 - 1e-6, Math.max(1e-6, F.R(el, m.S)));
              L -= g > 1 ? Math.log(p) : Math.log(1 - p); n++;
            }
            m = F.step(m, g, el);
          }
        }
        return { L: n ? L / n : 0, n };
      };
      const toW = u => u.map((v, i) => B[i][0] + v * (B[i][1] - B[i][0]));
      const U0 = W0.map((v, i) => (v - B[i][0]) / (B[i][1] - B[i][0]));
      const fit = (mode, start, steps, p0, p1) => {
        const N = loss(W0, mode).n, lam = 1.5 / Math.max(1, N);
        const obj = u => { let pen = 0; for (let i = 0; i < u.length; i++) { const d = (u[i] - U0[i]) / 0.12; pen += d * d; } return loss(toW(u), mode).L + lam * pen; };
        let u = start.slice(), f = obj(u);
        const m = new Array(21).fill(0), v = new Array(21).fill(0), lr = 0.01, h = 1e-4;
        for (let it = 1; it <= steps; it++) {
          const g = new Array(21);
          for (let i = 0; i < 21; i++) {
            const uu = u.slice(); const up = u[i] + h <= 1; uu[i] = up ? u[i] + h : u[i] - h;
            g[i] = up ? (obj(uu) - f) / h : (f - obj(uu)) / h;
          }
          for (let i = 0; i < 21; i++) {
            m[i] = 0.9 * m[i] + 0.1 * g[i]; v[i] = 0.999 * v[i] + 0.001 * g[i] * g[i];
            const mh = m[i] / (1 - Math.pow(0.9, it)), vh = v[i] / (1 - Math.pow(0.999, it));
            u[i] = Math.min(1, Math.max(0, u[i] - lr * mh / (Math.sqrt(vh) + 1e-8)));
          }
          f = obj(u);
          if (it % 10 === 0) postMessage({ progress: p0 + (p1 - p0) * it / steps });
        }
        return u;
      };
      const uTrain = fit(1, U0, 150, 0, 0.6);
      const tDef = loss(W0, 2), tFit = loss(toW(uTrain), 2);
      const adopted = tDef.n >= 25 && tFit.L < tDef.L;
      const uAll = adopted ? fit(0, uTrain, 80, 0.6, 1) : uTrain;
      const w = toW(uAll);
      postMessage({ w, adopted, gain: tDef.L > 0 ? (tDef.L - tFit.L) / tDef.L : 0, testN: tDef.n, lossFit: loss(w, 0).L, lossDef: loss(W0, 0).L });
    } catch (err) { postMessage({ error: String(err) }); }
  };
}

/* ============================================================
 * Wissen aller Nutzer: wie schwer ist eine Karte beim ersten Mal?
 * (anonyme Summen aus der Datenbank, mind. 5 Personen pro Karte)
 * ============================================================ */
const Community = {
  KEY: 'lemmalab-community' + (FACH === 'ana1' ? '' : '-' + FACH), ver: '0', data: null,
  init() { try { this.data = JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch (e) { } this.ver = this.data ? String(this.data.at) : '0'; },
  delta(id) {
    const t = Tune.get(), own = (t && t.dCard && t.dCard[id]) || 0;   // Korrektur von aussen
    return clamp(this.base(id) + own, -3, 3);
  },
  base(id) {
    if (S.settings.community === false || !this.data || !this.data.cards) return 0;
    const c = this.data.cards[id]; if (!c || c[1] < 5) return 0;
    const lg = p => Math.log(p / (1 - p)), cl = p => Math.min(0.95, Math.max(0.05, p));
    const wgt = c[1] / (c[1] + 20);                     // wenig Personen → schwächer gewichten
    return clamp((lg(cl(c[2])) - lg(cl(this.data.ff0))) * 1.2 * wgt, -2.5, 2.5);
  },
  async refresh(force) {
    if (typeof Cloud === 'undefined' || !Cloud.sb || !navigator.onLine) return;
    if (!force && this.data && Date.now() - this.data.at < 12 * HOUR) return;
    try { await Cloud.sb.rpc('refresh_card_stats'); } catch (e) { }
    const { data, error } = await Cloud.sb.from('card_stats').select('card,users,first_n,first_fail');
    if (error || !data) return;
    const cards = {}; let a = 0, b = 0;
    for (const r of data) { if (!BY_ID[r.card]) continue; cards[r.card] = [r.users, r.first_n, r.first_fail]; a += r.first_n * r.first_fail; b += r.first_n; }
    this.data = { at: Date.now(), cards, ff0: b ? a / b : 0.3, n: Object.keys(cards).length };
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) { }
    this.ver = String(this.data.at);
    Model.sync();
  },
};
Community.init();

/* ============================================================
 * Bewertung einer Karte (Scheduler)
 * rating: 1 Nochmal, 2 Schwer, 3 Gut, 4 Einfach
 * ============================================================ */
function schedule(c, x, g, t = now(), opts = {}) {
  const y = { ...x };
  const target = retFor(c);
  const K = opts.replay ? 1 : Calib.k();
  const toDays = S2 => clamp(Math.round(FSRS.ivl(S2 * K, target)), 1, 365);
  // Lastausgleich: innerhalb ±5 % den Tag mit den wenigsten fälligen Karten wählen
  const fuzz = d => {
    if (d < 3 || opts.replay) return d;
    const delta = Math.max(1, Math.round(d * 0.05));
    const load = dueLoadByDay(c.id, t);
    let best = d, bestN = Infinity;
    for (let k = d - delta; k <= d + delta; k++) {
      const n = (load[dayKey(t + k * DAY)] || 0) + Math.abs(k - d) * 0.01 + (hash(c.id + k) % 7) * 0.001;
      if (n < bestN) { bestN = n; best = k; }
    }
    return Math.max(1, best);
  };
  y.reps = (x.reps || 0) + 1;
  y.last = t;
  if (!x.st || !x.S) {                            // neue Karte
    const m = FSRS.init(g, Community.delta(c.id)); y.S = m.S; y.D = m.D; y.intro = x.intro || t; y.lapses = 0;
    if (g === 1) { y.st = 1; y.step = 0; y.due = t + 3 * MIN; }
    else if (g === 2) { y.st = 1; y.step = 0; y.due = t + 6 * MIN; }
    else if (g === 3) { y.st = 1; y.step = 1; y.due = t + 10 * MIN; }
    else { y.st = 2; y.due = t + toDays(y.S) * DAY; }
  } else {
    const elapsed = Math.max(0, (t - (x.last || t)) / DAY);
    const m = FSRS.step({ S: x.S, D: x.D || 5 }, g, elapsed);
    y.S = m.S; y.D = m.D;
    if (x.st === 2) {                               // Wiederholung
      if (g === 1) { y.lapses = (x.lapses || 0) + 1; y.st = 3; y.step = 0; y.due = t + 10 * MIN; }
      else y.due = t + fuzz(toDays(y.S)) * DAY;
    } else {                                        // Lernen / Neu-Lernen (st 1/3)
      if (g === 1) { y.step = 0; y.due = t + (x.st === 3 ? 10 : 3) * MIN; }
      else if (g === 2) { y.due = t + (x.st === 3 ? 10 : 6) * MIN; }
      else if (g === 3 && x.st === 1 && (x.step || 0) < 1) { y.step = 1; y.due = t + 10 * MIN; }
      else { y.st = 2; y.step = 0; y.due = t + fuzz(toDays(y.S)) * DAY; }
    }
  }
  if (y.st === 2 && !opts.replay) {
    // Termin auf 04:00 des Fälligkeitstags legen, dann Prüfungs-Deckel
    y.due = dayStart(y.due) + 1;
    y.due = capDue(c.id, y.due);
  }
  y.u = t;
  return y;
}

function previewIvls(c) {
  const x = cs(c.id), t = now();
  return [1, 2, 3, 4].map(g => fmtIvl(schedule(c, x, g, t).due - t));
}

/* ============================================================
 * Zeitmessung
 * Gemessen wird nur, solange die Seite sichtbar ist (App im Hintergrund
 * = Pause). Pro Bewertung: Denkzeit (bis Aufdecken) und Prüfzeit
 * (Aufdecken bis Bewertung), je max. 5 Min (danach gilt man als abwesend).
 * Log-Eintrag: [zeit, id, bewertung, vorZustand, gesamt_ds, modus, denk_ds, prüf_ds]
 *   modus: 'l' Lernen, 't' Prüfungstest, 'q' Quiz (Zuordnen); ds = Zehntelsekunden
 * ============================================================ */
const IDLE_CAP = 300e3;
const Timer = {
  acc: 0, since: null, front: null,
  start() { this.acc = 0; this.front = null; this.since = document.visibilityState === 'hidden' ? null : now(); },
  read() { return this.acc + (this.since != null ? now() - this.since : 0); },
  pause() { if (this.since != null) { this.acc += now() - this.since; this.since = null; } },
  resume() { if (this.since == null) this.since = now(); },
  markReveal() { if (this.front == null) this.front = this.read(); },
  result() {
    const total = this.read();
    const f = this.front == null ? total : this.front;
    const front = Math.min(f, IDLE_CAP), back = Math.min(Math.max(0, total - f), IDLE_CAP);
    return { front: Math.round(front / 100), back: Math.round(back / 100), total: Math.round((front + back) / 100) };
  },
};
const modeOf = l => l[5] || 'l';
const isSrs = l => modeOf(l) !== 'q';          // Quiz-Einträge zählen nicht für Behaltensquote

/* ============================================================
 * Lernsitzung
 * ============================================================ */
let session = null;     // {queue:[id], cur, revealed, shownAt, done, newShown, undo:[]}

function buildQueue() {
  const t = now(), end = dayStart() + DAY;
  const learning = CARDS.filter(c => { const x = S.cards[c.id]; return x && !x.susp && (x.st === 1 || x.st === 3); })
    .sort((a, b) => S.cards[a.id].due - S.cards[b.id].due).map(c => c.id);
  const reviews = CARDS.filter(c => { const x = S.cards[c.id]; return x && !x.susp && x.st === 2 && x.due <= end; })
    .sort((a, b) => (prioOf(b) - prioOf(a)) || (retrievability(S.cards[a.id]) - retrievability(S.cards[b.id])))
    .slice(0, S.settings.maxReviews).map(c => c.id);
  const nNew = Math.max(0, plannedNewPerDay() - newIntroducedToday());
  const news = eligibleNew().slice(0, nNew).map(c => c.id);
  const mixed = [];
  let ri = 0, ni = 0;
  while (ri < reviews.length || ni < news.length) {     // alle 3 Karten eine neue
    for (let k = 0; k < 2 && ri < reviews.length; k++) mixed.push(reviews[ri++]);
    if (ni < news.length) mixed.push(news[ni++]);
    if (ri >= reviews.length) while (ni < news.length) mixed.push(news[ni++]);
  }
  // Lernkarten erst, wenn ihre Wartezeit (fast) vorbei ist
  const learnDue = learning.filter(id => S.cards[id].due <= t + 60e3);
  const learnLater = learning.filter(id => S.cards[id].due > t + 60e3);
  return { queue: [...learnDue, ...mixed], later: learnLater, nNew: news.length, nRev: reviews.length };
}

function startSession(customIds) {
  const q = customIds ? { queue: customIds.slice(), later: [], nNew: 0, nRev: customIds.length } : buildQueue();
  session = { ...q, total: q.queue.length, done: 0, cur: null, revealed: false, undo: [], again: 0, custom: !!customIds, start: now(), logFrom: S.log.length, shown: 0, gap: {} };
  nextCard();
}

/* Bilder vorladen: die aktuelle und die nächsten Karten werden schon im
 * Hintergrund geladen und dekodiert, damit das Aufdecken sofort geht. */
const Pre = {
  m: new Map(),
  get(c) {
    if (!c || !c.img) return;
    const src = 'img/' + c.img;
    if (this.m.has(src)) return;
    const im = new Image();
    im.decoding = 'async';
    im.src = src;
    if (im.decode) im.decode().catch(() => { });
    this.m.set(src, im);
    if (this.m.size > 60) this.m.delete(this.m.keys().next().value);
  },
  ids(ids) { for (const id of ids) this.get(BY_ID[id]); },
};
function preloadSession() {
  if (!session) return;
  Pre.ids([session.cur, ...session.queue.slice(0, 5), ...session.later.slice(0, 3)].filter(Boolean));
}
function preloadQuiz() {
  if (!quiz) return;
  Pre.ids(quiz.items.slice(quiz.i, quiz.i + 4));
}
/* Countdown: <span class="cd" data-until="…">4:12</span> zählt jede Sekunde herunter */
const fmtCountdown = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`; };
const cdHTML = until => `<span class="cd" data-until="${until}">${fmtCountdown(until - now())}</span>`;
setInterval(() => {
  let fired = false;
  document.querySelectorAll('.cd[data-until]').forEach(el => {
    const left = +el.dataset.until - now();
    el.textContent = fmtCountdown(left);
    if (left <= 0 && !el.dataset.done) { el.dataset.done = 1; fired = true; }
  });
  if (!fired) return;
  if (session && session.waiting) nextCard();
  else if (!session && !quiz && tab === 'heute') { Motion.set('tab'); render(); }
}, 1000);
const WAIT_SOON = 60e3;   // so kurz vor der Fälligkeit darf eine Lernkarte schon kommen
const LEARN_AHEAD = 20 * 60e3;   // so früh darf eine andere Lernkarte kommen, damit nicht dieselbe zweimal hintereinander kommt
let lastShownId = null;          // zuletzt gezeigte Karte (auch über Sitzungen hinweg, z. B. «Weiter lernen»)
function laterReady(id, t) { return S.cards[id].due <= t + WAIT_SOON && (session.shown || 0) >= ((session.gap || {})[id] || 0); }
function nextCard(force) {
  const t = now();
  clearTimeout(session.waitTimer); session.waiting = false;
  // Lernkarten, die fällig sind UND genug andere Karten dazwischen hatten
  if (session.later.length) {
    const ready = session.later.filter(id => laterReady(id, t));
    session.later = session.later.filter(id => !ready.includes(id));
    session.queue.push(...ready);
  }
  const last = lastShownId;
  if (!session.queue.length && session.later.length) {
    session.later.sort((a, b) => S.cards[a].due - S.cards[b].due);
    // Ist als Nächstes ausgerechnet die gerade gezeigte Karte dran, lieber eine andere
    // Lernkarte etwas früher nehmen (bis LEARN_AHEAD) – sonst käme dieselbe direkt nochmals.
    let i = 0;
    if (session.later[0] === last && session.later.length > 1 && S.cards[session.later[1]].due - t <= LEARN_AHEAD) i = 1;
    const id = session.later[i], wait = S.cards[id].due - t;
    if (force || i === 1 || wait <= WAIT_SOON) session.queue.push(session.later.splice(i, 1)[0]);
    else {
      // sonst kurz warten statt dieselbe Karte gleich nochmals zu zeigen
      session.cur = null; session.revealed = false; session.waiting = true;
      session.waitTimer = setTimeout(() => { if (session && session.waiting) nextCard(); }, Math.max(1000, wait - WAIT_SOON + 500));
      Motion.set('tab'); render(); return;
    }
  }
  // Nie zweimal dieselbe Karte direkt hintereinander, solange es eine andere gibt
  if (last && session.queue[0] === last) {
    if (session.queue.length > 1) [session.queue[0], session.queue[1]] = [session.queue[1], session.queue[0]];
    else {
      const alt = session.later.filter(id => id !== last && S.cards[id].due - t <= LEARN_AHEAD)
        .sort((a, b) => S.cards[a].due - S.cards[b].due)[0];
      if (alt) { session.later = session.later.filter(id => id !== alt); session.queue.unshift(alt); }
    }
  }
  session.cur = session.queue.shift() || null;
  if (session.cur) lastShownId = session.cur;
  if (session.cur) session.shown = (session.shown || 0) + 1;
  session.revealed = false;
  Timer.start();
  Motion.set(session.cur ? 'next' : 'tab');
  render();
  preloadSession();
}

function reveal() { if (!session || !session.cur || session.revealed || Motion.busy) return; Timer.markReveal(); session.revealed = true; Motion.set('reveal'); render(); }
function qReveal() { if (!quiz || quiz.revealed) return; Timer.markReveal(); quiz.revealed = true; Motion.set('reveal'); render(); }
/* Karte umdrehen – in beide Richtungen (Leertaste bzw. Antippen der Karte) */
function flip() {
  if (!session || !session.cur || Motion.busy) return;
  if (!session.revealed) return reveal();
  session.revealed = false; Motion.set('reveal'); render();
}
function qFlip() {
  if (!quiz || quiz.type !== 'test' || quiz.i >= quiz.items.length) return;
  if (!quiz.revealed) return qReveal();
  quiz.revealed = false; Motion.set('reveal'); render();
}

function rate(g, o = {}) {
  if (Motion.busy && performance.now() - (Motion.busyAt || 0) > 1000) Motion.busy = false;
  if (!session || !session.cur || !session.revealed || Motion.busy) return;
  if (swipeMode() && !o.flown) return Swipe.fly(g);
  const id = session.cur, c = BY_ID[id], before = { ...cs(id) };
  const tm = Timer.result();
  const after = schedule(c, before, g);
  S.cards[id] = after;
  S.log.push([now(), id, g, before.st || 0, tm.total, 'l', tm.front, tm.back]);
  session.undo.push({ id, before, queue: session.queue.slice(), later: session.later.slice(), done: session.done });
  session.done++;
  if (g === 1) session.again++;
  if (after.st === 1 || after.st === 3) {
    // Nicht sofort wieder zeigen: erst ein paar andere Karten dazwischen (Abstand hilft beim Merken)
    session.later.push(id);
    session.gap = session.gap || {};
    session.gap[id] = (session.shown || 0) + Math.min(5, session.queue.length);
  }
  save();
  if (o.flown) nextCard();
  else Motion.leave(g === 1 ? 'leave-again' : 'leave', nextCard);
}

function undo() {
  if (!session || !session.undo.length) return;
  const u = session.undo.pop();
  S.cards[u.id] = u.before;
  for (let i = S.log.length - 1; i >= 0; i--) { if (S.log[i][1] === u.id) { S.log.splice(i, 1); break; } }
  session.queue = u.queue; session.later = u.later; session.done = u.done;
  if (session.cur) session.queue.unshift(session.cur);
  session.cur = u.id; lastShownId = u.id; session.revealed = true; Timer.start(); Timer.front = 0;
  save();
  Motion.set('back');
  render();
  toast('Rückgängig gemacht');
}

/* ============================================================
 * Navigation / Rendering
 * ============================================================ */
const ICONS = {
  heute: '<path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13l-4-2-4 2-4-2z"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><circle cx="12" cy="17.2" r=".6"/>',
  katalog: '<path d="M4 5h16M4 10h16M4 15h10M4 20h7"/>',
  statistik: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  mehr: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
};
const TABS = window.MODUS === 'beweise' ? [['heute', 'Nächster'], ['katalog', 'Alle'], ['statistik', 'Fortschritt'], ['mehr', 'Einstellungen']]
  : [['heute', 'Lernen'], ['quiz', 'Quiz'], ['katalog', 'Karten'], ['statistik', 'Fortschritt'], ['mehr', 'Einstellungen']];
let tab = (location.hash || '#heute').slice(1);
if (!TABS.some(t => t[0] === tab)) tab = 'heute';

let _lens = null;   // letzte Position der Glas-Linse unter dem aktiven Tab
function renderTabs() {
  const el = $('#tabs');
  el.innerHTML = `<span class="lens" aria-hidden="true"></span>` + TABS.map(([k, l]) =>
    `<button data-tab="${k}" class="${k === tab || (k === 'mehr' && tab === 'admin') ? 'on' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>${l}</button>`).join('');
  placeLens();
}
/* Liquid-Glass-Linse gleitet zum aktiven Tab */
function placeLens(instant) {
  const el = $('#tabs'), lens = el && el.querySelector('.lens'), on = el && el.querySelector('button.on');
  if (!lens) return;
  if (!on) { lens.style.opacity = 0; return; }
  const to = { x: on.offsetLeft, y: on.offsetTop, w: on.offsetWidth, h: on.offsetHeight };
  const set = p => { lens.style.transform = `translate(${p.x}px,${p.y}px)`; lens.style.width = p.w + 'px'; lens.style.height = p.h + 'px'; };
  if (_lens && !instant && (_lens.x !== to.x || _lens.y !== to.y)) {
    lens.style.transition = 'none'; set(_lens); void lens.offsetWidth; lens.style.transition = '';
    lens.classList.add('moving'); setTimeout(() => lens.classList.remove('moving'), 420);
  }
  set(to); _lens = to;
}
window.addEventListener('resize', () => placeLens(true));
$('#tabs').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]'); if (!b) return;
  go(b.dataset.tab);
});
function go(t) {
  const changed = t !== tab;
  tab = t;
  try { history.replaceState(null, '', '#' + t); } catch (e) { location.hash = t; }
  Motion.set('tab');
  render(); window.scrollTo(0, 0);
  if (changed) Motion.bounceTab();
}
window.addEventListener('hashchange', () => { const t = location.hash.slice(1); if (TABS.some(x => x[0] === t) && t !== tab) { tab = t; render(); } });

function render() {
  if (window.MODUS === 'beweise' && window.Beweise) return Beweise.render();
  applyTheme();
  Model.sync();
  { const h = $('#hdrTitle'); if (h) h.textContent = ({ heute: 'Lernen', quiz: 'Quiz', katalog: 'Karten', statistik: 'Fortschritt', mehr: 'Einstellungen', admin: 'Admin' })[tab] || 'LemmaLab'; }
  { const h = $('#hdrSub'); if (h && !h.dataset.f) { h.dataset.f = 1; h.innerHTML = fachPillHTML(); } }
  { const b = document.querySelector('nav.tabs .brand span'); if (b && !b.dataset.f) { b.dataset.f = 1; b.innerHTML = `LemmaLab${fachPillHTML('bf')}`; } }
  const focusMode = (tab === 'heute' && session && session.cur) || (tab === 'quiz' && quiz && quiz.i < quiz.items.length);
  document.body.classList.toggle('focus', !!focusMode);
  renderTabs();
  const v = $('#view');
  if (tab === 'heute') v.innerHTML = session && (session.cur || session.done) ? viewStudy() : viewHome();
  else if (tab === 'quiz') v.innerHTML = viewQuiz();
  else if (tab === 'katalog') v.innerHTML = viewCatalog();
  else if (tab === 'statistik') v.innerHTML = viewStats();
  else if (tab === 'admin' && typeof viewAdmin === 'function') v.innerHTML = viewAdmin();
  else v.innerHTML = viewSettings();
  { const n = $('#navTitle'); if (n) n.textContent = $('#hdrTitle') ? $('#hdrTitle').textContent : ''; }
  Motion.apply(v);
  afterRender();
}

/* ---------- Bewegung (wie in den Apple-Apps) ----------
 * Kurze, physikalisch wirkende Übergänge: Seitenwechsel blendet weich ein,
 * Karten gleiten seitlich weiter, Aufdecken klappt die Aussage auf, Ringe und
 * Balken füllen sich, Zahlen zählen hoch. Bei «Bewegung reduzieren» aus. */
const Motion = {
  next: null,
  reduced: () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches),
  set(k) { this.next = k; },
  apply(v) {
    const k = this.next; this.next = null;
    v.classList.remove('a-tab', 'a-next', 'a-back', 'a-reveal');
    if (!k || this.reduced()) return;
    void v.offsetWidth;
    v.classList.add('a-' + k);
    clearTimeout(v._at); v._at = setTimeout(() => v.classList.remove('a-' + k), 1100);
    if (k === 'tab') this.countUp(v);
  },
  countUp(root) {
    root.querySelectorAll('.kpi .v').forEach(el => {
      const tn = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent));
      if (!tn) return;
      const m = tn.textContent.match(/^(\s*)(\d+(?:[.,]\d+)?)([^\d'’][\s\S]*|)$/);
      if (!m) return;
      const target = parseFloat(m[2].replace(',', '.')); if (!(target > 1)) return;
      const dec = (m[2].split(/[.,]/)[1] || '').length, sep = m[2].includes(',') ? ',' : '.';
      const t0 = performance.now(), D = 750;
      const step = t => {
        const p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 3);
        tn.textContent = m[1] + (target * e).toFixed(dec).replace('.', sep) + m[3];
        if (p < 1) requestAnimationFrame(step);
      };
      tn.textContent = m[1] + (0).toFixed(dec).replace('.', sep) + m[3];
      requestAnimationFrame(step);
    });
  },
  /* aktuelle Karte hinausgleiten lassen, dann fn() */
  leave(cls, fn) {
    const fc = $('.fc');
    if (!fc || this.reduced()) return fn();
    this.busy = true; this.busyAt = performance.now();
    fc.classList.add(cls);
    setTimeout(() => { this.busy = false; fn(); }, 170);
  },
  bounceTab() {
    if (this.reduced()) return;
    const b = document.querySelector('#tabs button.on'); if (!b) return;
    b.classList.remove('bounce'); void b.offsetWidth; b.classList.add('bounce');
  },
};

/* Kompakter Titel oben, sobald der grosse Titel weggescrollt ist (iPhone) */
(() => {
  let on = false;
  const upd = () => {
    const nb = $('#navbar'); if (!nb) return;
    const show = window.scrollY > 46 && !document.body.classList.contains('focus');
    if (show !== on) { on = show; nb.classList.toggle('on', show); }
  };
  window.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
})();

function kindTag(c) { return `<span class="tag" style="--k:${KIND_COLOR[c.kind]}">${KIND_SHORT[c.kind]} ${c.nr}</span>`; }
function prioTag(c) { const p = prioOf(c); return `<span class="pill" style="background:color-mix(in srgb,${PRIO[p].color} 14%,transparent);color:${PRIO[p].color}"><span class="dot" style="background:${PRIO[p].color}"></span>${PRIO[p].name}</span>`; }
function statusOf(c) {
  const x = S.cards[c.id];
  if (!x || !x.st) return { k: 'neu', l: 'Neu', col: 'var(--p1)' };
  if (x.susp) return { k: 'pause', l: 'Pausiert', col: 'var(--p1)' };
  if (x.st === 1 || x.st === 3) return { k: 'lernend', l: 'Lernend', col: 'var(--hard)' };
  const r = retrievability(x);
  if ((x.lapses || 0) >= 3 && x.S < 10) return { k: 'schwach', l: 'Schwach', col: 'var(--again)' };
  if (x.S >= 21) return { k: 'sitzt', l: 'Sitzt', col: 'var(--good)' };
  return { k: 'jung', l: r < 0.85 ? 'Wackelig' : 'Jung', col: r < 0.85 ? 'var(--again)' : 'var(--easy)' };
}

/* ---------- Startseite ---------- */
/* Tagesstand als To-do-Liste */
function todayStatus() {
  const q = buildQueue();
  const ds = dayStart();
  const L = S.log.filter(l => l[0] >= ds && modeOf(l) === 'l');
  const revDone = new Set(L.filter(l => l[3] === 2).map(l => l[1])).size;
  const newDone = newIntroducedToday();
  const learnOpen = CARDS.filter(c => { const x = S.cards[c.id]; return x && !x.susp && (x.st === 1 || x.st === 3); }).length;
  const learning = Math.max(0, q.queue.length - q.nRev - q.nNew);
  const items = [
    { k: 'rev', label: 'Fällige Wiederholungen', done: revDone, total: revDone + q.nRev, color: 'var(--easy)' },
    { k: 'new', label: 'Neue Karten', done: newDone, total: newDone + q.nNew, color: 'var(--good)' },
    { k: 'learn', label: 'Lernschritte abschliessen', done: learnOpen ? 0 : 1, total: 1, open: learnOpen, color: 'var(--hard)' },
  ];
  const learnedToday = L.some(l => l[3] === 0 || l[3] === 1 || l[3] === 3);
  const visible = items.filter(it => it.k === 'rev' ? it.total > 0 : it.k === 'new' ? it.total > 0 : (it.open > 0 || learnedToday));
  const allDone = q.queue.length === 0 && q.later.length === 0;
  return { q, items: visible.length ? visible : items.slice(0, 1), allDone, learning, startedToday: L.length > 0 };
}
function streakDays() {
  const days = new Set(S.log.map(l => dayKey(l[0])));
  let n = 0, d = dayStart();
  if (!days.has(dayKey(d + HOUR))) d -= DAY;
  while (days.has(dayKey(d + HOUR)) && n < 999) { n++; d -= DAY; }
  return n;
}
function todoHTML(ts) {
  return `<ul class="todo">${ts.items.map(it => {
    const done = it.k === 'learn' ? !it.open : it.done >= it.total;
    const sub = it.k === 'learn' ? (it.open ? `${it.open} Karte${it.open === 1 ? '' : 'n'} offen` : 'keine offen') : `${it.done} / ${it.total}`;
    const pct = it.k === 'learn' ? (it.open ? 0 : 100) : (it.total ? it.done / it.total * 100 : 100);
    return `<li class="${done ? 'done' : ''}"><span class="cb">${done ? '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : ''}</span>
      <div class="ti"><div class="tl"><span>${it.label}</span><span class="muted">${sub}</span></div>
      <div class="tb"><i style="width:${pct}%;background:${it.color}"></i></div></div></li>`;
  }).join('')}</ul>`;
}
/* Kurzer Prüfungs-Hinweis für Lernen und Sitzungsende (Details unter Fortschritt) */
function goalNote() {
  try {
    const tr = trackStatus(); if (tr.level === 'done') return null;
    const exam = examTime(), goal = exam - MASTER_BEFORE * DAY;
    const N = CARDS.filter(c => prioOf(c) !== 1 || S.settings.includeRand).length;
    let v = null, ve = null;
    if (goal > now() + DAY) { const r = Forecast.run(); for (const p of r.plan) { if (p.t <= goal) v = Math.round(p.v); if (p.t < dayStart(exam)) ve = Math.round(p.v); } }
    const okF = v != null && v >= (Forecast._best || N) - Math.max(3, N * 0.02);
    const level = tr.level === 'bad' ? 'bad' : (tr.level === 'warn' || (v != null && !okF)) ? 'warn' : tr.level === 'start' ? 'start' : 'ok';
    const title = level === 'ok' ? 'Auf Kurs für die Prüfung' : level === 'warn' ? 'Knapp für die Prüfung' : level === 'bad' ? 'Hinter dem Plan' : 'Lernplan bis zur Prüfung';
    const when = new Date(goal).toLocaleDateString('de-CH', { day: 'numeric', month: 'short' });
    const sub = v != null ? `Am ${when} voraussichtlich ${v} von ${N} sicher${ve != null && ve > v ? `, bis zur Prüfung ${ve}` : ''}` : tr.sub;
    // Empfehlung für heute: was mindestens noch nötig ist, damit der Plan (und damit das Ziel) hält
    // Minimum = Prognose-Bedarf (ohne den Zuschlag «mehr, wenn heute Platz ist»)
    // nie mehr als der Tagesplan selbst vorsieht – sonst stünde «erledigt» neben «noch X Karten»
    const minToday = Math.min(minNewToday(), plannedNewPerDay());
    const bq = buildQueue();
    const newLeft = Math.min(bq.nNew, Math.max(0, minToday - newIntroducedToday()));
    const revLeft = bq.nRev;
    const hint = newLeft || revLeft
      ? `Heute noch mindestens ${newLeft ? `${newLeft} neue Karte${newLeft === 1 ? '' : 'n'}` : ''}${newLeft && revLeft ? ' und ' : ''}${revLeft ? `${revLeft} Wiederholung${revLeft === 1 ? '' : 'en'}` : ''}`
      : 'Heute ist alles Nötige geschafft';
    return { level, title, sub, hint, col: TRACK_COL[level] };
  } catch (e) { return null; }
}
function goalNoteHTML(compact) {
  const g = goalNote(); if (!g) return '';
  const icon = g.level === 'ok' ? 'check' : g.level === 'start' ? 'calendar' : 'alert';
  if (compact) return `<button type="button" class="gnote" data-act="tab:statistik"><span class="gd" style="background:${g.col}"></span><span>${esc(g.title)} · ${esc(g.sub)}${g.hint ? `<br><b>${esc(g.hint)}</b>` : ''}</span></button>`;
  return UI.group([UI.item(icon, g.col, esc(g.title), esc(g.sub) + (g.hint ? `<br><b class="ghint" style="color:${g.level === 'ok' ? 'var(--ink)' : g.col}">${esc(g.hint)}</b>` : ''), '', { act: 'tab:statistik' })]);
}
function doneHeroHTML(ts) {
  const tomorrow = CARDS.filter(c => { const x = S.cards[c.id]; return x && x.st && !x.susp && x.due < dayStart() + 2 * DAY; }).length;
  return `<div class="donehero">
    <svg class="bigcheck" viewBox="0 0 120 120"><circle class="c" cx="60" cy="60" r="52"/><path class="k" d="M36 62l16 16 33-35"/></svg>
    <div class="dt">Für heute erledigt</div>
    <div class="ds">Morgen ${tomorrow} Karte${tomorrow === 1 ? '' : 'n'}</div>
    ${goalNoteHTML(true)}
  </div>`;
}
function pauseHTML(until, n, forceAct, extra = '') {
  return `<div class="solo pause">
    <div class="pause-k">Kurze Pause</div>
    <div class="pause-t">${cdHTML(until)}</div>
    <div class="solo-s">bis ${n === 1 ? 'die nächste Karte' : `die nächsten ${n} Karten`} wieder dran ${n === 1 ? 'ist' : 'sind'}.<br>Etwas Abstand hilft beim Merken.</div>
    ${extra}
    <div class="solo-actions"><button class="linkbtn2" data-act="${forceAct}">Trotzdem jetzt wiederholen</button></div>
  </div>`;
}
function weakIds() {
  return CARDS.filter(c => { const x = S.cards[c.id]; return x && x.st && !x.susp && ((x.lapses || 0) >= 2 || retrievability(x) < 0.85); })
    .sort((a, b) => retrievability(S.cards[a.id]) - retrievability(S.cards[b.id])).map(c => c.id);
}
function viewHome() {
  try { saveTrackSummary(trackStatus()); } catch (e) { }
  const q = buildQueue();
  const todayLog = S.log.filter(l => l[0] >= dayStart());
  const pt = personalTimes();
  const learning = q.queue.length - q.nRev - q.nNew;
  const estMin = Math.max(1, Math.round((q.nRev * pt.review + q.nNew * pt.newCost + Math.max(0, learning) * pt.learn) / 60));
  const ts = todayStatus();
  const dte = daysToExam();
  const introduced = CARDS.filter(c => S.cards[c.id] && S.cards[c.id].st).length;
  const minToday = Math.round(todayLog.reduce((a, l) => a + l[4], 0) / 600);
  const weak = weakIds(), ahead = aheadIds();
  const total = todayLog.length + q.queue.length;
  const waitIds = q.later.filter(id => S.cards[id].due < dayStart() + DAY);
  const hero = !q.queue.length && waitIds.length
    ? pauseHTML(Math.min(...waitIds.map(id => S.cards[id].due)) - WAIT_SOON, waitIds.length, 'startforce')
    : ts.allDone || !q.queue.length
    ? `<div class="solo">${ts.allDone ? doneHeroHTML(ts) : `<div class="donehero"><div class="dt">Gleich geht's weiter</div><div class="ds">${q.later.length} Karte${q.later.length === 1 ? '' : 'n'} kommen in wenigen Minuten wieder.</div></div>`}</div>`
    : `<div class="solo">
    ${ringSVG(todayLog.length, total, 168)}
    <div class="solo-n">${q.queue.length} Karte${q.queue.length === 1 ? '' : 'n'}</div>
    <div class="solo-s">etwa ${estMin} Minute${estMin === 1 ? '' : 'n'}</div>
    <button class="btn primary big solo-btn" data-act="start">${ts.startedToday ? 'Weiterlernen' : 'Lernen'}</button>
  </div>`;
  return `<div class="home"><div class="col">
  ${hero}
  ${ts.allDone ? '' : goalNoteHTML(false)}
  ${UI.group([
    UI.row('Wiederholungen', `<span class="v">${q.nRev}</span>`),
    UI.row('Neue Karten', `<span class="v">${q.nNew}</span>`),
    UI.row('Heute gelernt', `<span class="v">${todayLog.length} Karte${todayLog.length === 1 ? '' : 'n'} · ${minToday} Min</span>`),
  ], { header: 'Heute' })}
  </div><div class="col">
  ${UI.group([
    UI.row('Prüfung', `<span class="v">${dte > 0 ? `in ${dte} Tagen` : dte === 0 ? 'heute' : 'vorbei'}</span>`),
    ...(() => { const ss = standShare(); return [
      UI.row('Sicher beherrscht', `<span class="v">${Math.round(ss.pSafe * 100)} % · ${ss.safe} von ${ss.N}</span>`),
      UI.row('Eingeführt', `<span class="v">${Math.round(ss.pIntro * 100)} % · ${ss.intro} von ${ss.N}</span>`)]; })(),
    ...(FACH_CFG.focusSrc ? (() => { const fs = focusState(); return [UI.row('Mitschrift gefestigt', `<span class="v">${fs.ok} von ${fs.total}</span>`)]; })() : []),
  ], { header: 'Stand', footer: FACH_CFG.focusSrc ? (() => { const fs = focusState(); return fs.open ? 'Mitschrift gut beherrscht – jetzt kommen auch Karten aus dem Skript (Vorjahr) dazu. Neue Mitschrift-Wochen haben wieder Vorrang.' : `Zuerst die Mitschrift: Karten aus dem Skript (Vorjahr) kommen dazu, sobald alle Mitschrift-Karten eingeführt und ${Math.round(FOCUS_SHARE * 100)} % davon gefestigt sind (noch ${Math.max(0, fs.need - fs.ok)}).`; })() : '' })}
  ${UI.group([
    UI.item('cards', '#0a84ff', '10 neue Karten', 'Zusätzlich zum Tagesplan', '', { act: 'extra' }),
    weak.length ? UI.item('wave', '#ff9f0a', 'Schwache Karten üben', `${weak.length} Karte${weak.length === 1 ? '' : 'n'} wackeln`, '', { act: 'weak' }) : '',
    ahead.length ? UI.item('bolt', '#5e5ce6', 'Vorausüben', 'Karten der nächsten Tage', '', { act: 'ahead' }) : '',
    UI.item('test', '#ff375f', 'Prüfungstest', 'Zwölf Kernkarten wie an der Prüfung', '', { act: 'teststart' }),
  ], { header: 'Üben' })}
  </div></div>`;
}
function ringSVG(done, total, size = 38) {
  const f = total ? Math.min(1, done / total) : 1, sw = size > 100 ? 14 : size > 50 ? 7 : 4, r = (size - sw) / 2 - 1, C = 2 * Math.PI * r, c = size / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex:none" aria-label="Tagesfortschritt ${Math.round(f * 100)} Prozent"><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="color-mix(in srgb,var(--accent) 16%,transparent)" stroke-width="${sw}"/><circle cx="${c}" cy="${c}" r="${r}" fill="none" class="ringp" stroke="var(--accent)" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${(f * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${c} ${c})" style="transition:stroke-dasharray .6s ease"/>${size > 100 ? '' : `<text x="${c}" y="${c + (size > 50 ? 5 : 3.5)}" text-anchor="middle" font-size="${size > 50 ? 15 : 10.5}" font-weight="700" fill="var(--ink)" style="font-family:var(--sfd)">${Math.round(f * 100)}%</text>`}</svg>`;
}
/* Konfetti-Animation (abgeschaltet bei „Bewegung reduzieren“) */
function celebrate() {
  return;   // bewusst ruhig: kein Konfetti mehr (nur das Häkchen wird animiert)
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas');
  cv.className = 'confetti';
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
  const cols = ['#2f9e5b', '#2b7bd6', '#d98a1c', '#d64545', '#7c3aed', '#f2c94c'];
  const P = Array.from({ length: 140 }, (_, i) => ({
    x: innerWidth / 2 + (Math.random() - .5) * 60, y: innerHeight * .38,
    vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 5,
    r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3,
    w: 6 + Math.random() * 6, h: 4 + Math.random() * 5, c: cols[i % cols.length],
  }));
  const t0 = performance.now();
  (function frame(t) {
    const el = t - t0;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of P) {
      p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.globalAlpha = Math.max(0, 1 - el / 2600);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    if (el < 2700) requestAnimationFrame(frame); else cv.remove();
  })(t0);
}
/* Karten, die in den nächsten 3 Tagen fällig werden – zum Vorausüben (schwächste zuerst) */
function aheadIds() {
  const end = dayStart() + 4 * DAY, from = dayStart() + DAY;
  return CARDS.filter(c => { const x = S.cards[c.id]; return x && x.st === 2 && !x.susp && x.due >= from && x.due < end; })
    .sort((a, b) => (prioOf(b) - prioOf(a)) || (retrievability(S.cards[a.id]) - retrievability(S.cards[b.id]))).map(c => c.id);
}
function countIntro(p) { const all = CARDS.filter(c => prioOf(c) === p); return `${all.filter(c => S.cards[c.id] && S.cards[c.id].st).length}/${all.length}`; }
function prioBarSegments() {
  return [5, 4, 3, 2, 1].map(p => {
    const n = CARDS.filter(c => prioOf(c) === p && S.cards[c.id] && S.cards[c.id].st).length;
    return `<span style="width:${n / CARDS.length * 100}%;background:${PRIO[p].color}"></span>`;
  }).join('');
}
function nextFocus() {
  const weak = CARDS.filter(c => { const x = S.cards[c.id]; return x && x.st === 2 && prioOf(c) >= 4 && retrievability(x, examTime()) < 0.8; });
  const kernLeft = CARDS.filter(c => prioOf(c) === 5 && !(S.cards[c.id] && S.cards[c.id].st)).length;
  const leeches = CARDS.filter(c => (S.cards[c.id]?.lapses || 0) >= 3);
  const rows = [];
  if (kernLeft) rows.push(UI.item('target', '#ff453a', `${kernLeft} Kernkarten noch neu`, 'Kommen als Nächstes dran.', '', { act: 'cat:neu:5' }));
  if (weak.length) rows.push(UI.item('wave', '#ff9f0a', `${weak.length} wichtige Karte${weak.length === 1 ? '' : 'n'} wackel${weak.length === 1 ? 't' : 'n'}`, 'Werden automatisch öfter wiederholt.', '', { act: 'cat:wackelig:' }));
  if (leeches.length) rows.push(UI.item('alert', '#8e8e93', `${leeches.length} Problemkarte${leeches.length === 1 ? '' : 'n'}`, FACH === 'ana1' ? 'Dreimal oder öfter vergessen. Beweisidee nachlesen hilft.' : FACH === 'inf1' ? 'Dreimal oder öfter vergessen. Code selbst kompilieren und laufen lassen hilft.' : FACH === 'la' ? 'Dreimal oder öfter vergessen. Beweis in der Mitschrift nachlesen hilft.' : 'Dreimal oder öfter vergessen. Herleitung im Skript nachlesen hilft.', '', { act: 'cat:schwach:' }));
  return rows.length ? UI.group(rows) : '';
}

/* ---------- Lernkarte ---------- */
function promptFor(c) {
  if (c.kind === 'Code') return 'Was gibt der Code aus – oder kompiliert er nicht, hat <b>undefiniertes Verhalten</b> oder läuft endlos? Zeile für Zeile tracen.';
  if (c.kind === 'Regel') return 'Formuliere die <b>Regel</b> und nenne ein Beispiel.';
  if (c.kind === 'Konzept') return 'Beantworte die Frage und <b>begründe</b> sie in einem Satz.';
  if (c.kind === 'Rezept') return 'Zähle die <b>Schritte</b> des Lösungswegs der Reihe nach auf.';
  if (c.kind === 'Formel' || c.kind === 'Gesetz') return 'Schreibe die <b>Formel mit allen Grössen</b> und Gültigkeitsbedingungen hin.';
  if (c.kind === 'Definition') return 'Gib die Definition <b>vollständig und präzise</b> wieder (alle Begriffe, Quantoren, Bedingungen).';
  return 'Formuliere die Aussage mit <b>allen Voraussetzungen</b> und der genauen Folgerung.';
}
/* Textkarte (Physik): HTML mit $…$ / $$…$$, gerendert mit KaTeX */
const _richCache = {};
function richHTML(c) {
  if (_richCache[c.id]) return _richCache[c.id];
  const k = (t, d) => { if (!window.katex) return `<code>${esc(t)}</code>`; try { return window.katex.renderToString(t, { displayMode: d, throwOnError: false, strict: false }); } catch (e) { return `<code>${esc(t)}</code>`; } };
  const html = String(c.body || '').replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => `<div class="md">${k(t, true)}</div>`).replace(/\$([^$]+?)\$/g, (m, t) => k(t, false));
  return (_richCache[c.id] = `<div class="rich">${html}</div>`);
}
/* Code, der schon vor dem Aufdecken sichtbar ist (Informatik: «Was passiert?») */
function qHTML(c) { return c.q ? `<div class="qcode">${c.q}</div>` : ''; }
function cardExtras(c) {
  if (c.img) return '';
  return `${c.fs === false ? '<div class="fsnote">✎ Nicht auf der Formelsammlung – selbst ergänzen.</div>' : ''}${c.ex ? `<div class="exnote muted">Prüfungen: ${esc(c.ex)}</div>` : ''}`;
}
function metaLine(c, long) {
  if (!c.img) return `Kap. ${c.chap}${long ? ' ' + esc(c.chapTitle) : ''}${c.sec ? ` · Skript ${esc(c.sec)}` : ''}`;
  const src = `${c.src || 'Skript'} S. ${c.page}`;   // Lineare Algebra: Mitschrift oder Skript
  return long ? `Kap. ${c.chap} ${esc(c.chapTitle)} · ${esc(c.sec)} · ${src}` : `Kapitel ${c.chap} · ${src}`;
}
function openLightbox(sw) {
  // Kopie des Bildes (inkl. Titelmaske) als Vollbild-Ansicht. Zwei Finger (bzw. Trackpad) zoomen, ein Finger verschiebt
  // das vergrösserte Bild, Doppeltippen zoomt rein/raus, einfaches Antippen schliesst.
  const box = document.createElement('div');
  box.className = 'lightbox'; box.setAttribute('role', 'dialog'); box.title = 'Antippen zum Schliessen · zwei Finger zum Zoomen';
  const w = sw.cloneNode(true);
  w.removeAttribute('data-zoom'); w.removeAttribute('title');
  w.querySelectorAll('.zoomchip').forEach(x => x.remove());
  const im = w.querySelector('img'); const r = im ? (+im.getAttribute('width') / +im.getAttribute('height')) || 1 : 1;
  w.style.setProperty('--ar', r);
  box.appendChild(w); document.body.appendChild(box);
  let s = 1, tx = 0, ty = 0, base = null, moved = false, closeT = 0;
  const pts = new Map(); let pinch = null, last = null;
  const apply = (anim) => { w.style.transition = anim ? 'transform .2s ease' : 'none'; w.style.transform = `translate(${tx}px,${ty}px) scale(${s})`; };
  const getBase = () => { if (!base) { const b = w.getBoundingClientRect(); base = { x: b.left - tx, y: b.top - ty, w: b.width / s, h: b.height / s }; } return base; };
  const zoomAt = (px, py, ns) => {
    const b = getBase(); ns = clamp(ns, 1, 6);
    const cx = (px - b.x - tx) / s, cy = (py - b.y - ty) / s;
    s = ns; tx = px - b.x - cx * s; ty = py - b.y - cy * s;
    if (s <= 1.01) { s = 1; tx = 0; ty = 0; }
  };
  const bound = () => {   // Bild nicht ganz aus dem Bildschirm schieben
    const b = getBase(), W = window.innerWidth, H = window.innerHeight;
    const sw2 = b.w * s, sh2 = b.h * s;
    const fit = (t, o, len, view) => len <= view ? clamp(t, -o, view - o - len) : clamp(t, view - o - len, -o);
    tx = fit(tx, b.x, sw2, W); ty = fit(ty, b.y, sh2, H);
  };
  box.addEventListener('pointerdown', e => {
    if (!pts.size) { moved = false; pinch = null; }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
    try { box.setPointerCapture(e.pointerId); } catch (err) { }
    getBase(); last = { x: e.clientX, y: e.clientY };
  });
  box.addEventListener('pointermove', e => {
    const p = pts.get(e.pointerId); if (!p) return;
    p.x = e.clientX; p.y = e.clientY;
    if (Math.hypot(p.x - p.x0, p.y - p.y0) > 8) moved = true;
    if (pts.size >= 2) {
      const [a, b] = [...pts.values()];
      const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      if (pinch) { zoomAt(pinch.m.x, pinch.m.y, s * d / pinch.d); tx += m.x - pinch.m.x; ty += m.y - pinch.m.y; bound(); apply(); }
      pinch = { m, d }; moved = true;
    } else if (s > 1 && last) {
      tx += e.clientX - last.x; ty += e.clientY - last.y; bound(); apply();
    }
    last = { x: e.clientX, y: e.clientY };
  });
  const up = e => {
    pts.delete(e.pointerId); pinch = null;
    const rest = [...pts.values()][0]; last = rest ? { x: rest.x, y: rest.y } : null;
    if (!pts.size && s <= 1.01) { s = 1; tx = 0; ty = 0; apply(true); }
  };
  box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
  box.addEventListener('wheel', e => {   // Mac-Trackpad: Pinch = ctrl+Scroll; sonst verschieben, wenn vergrössert
    e.preventDefault();
    if (e.ctrlKey) zoomAt(e.clientX, e.clientY, s * Math.exp(-e.deltaY * 0.01));
    else if (s > 1) { tx -= e.deltaX; ty -= e.deltaY; }
    bound(); apply();
  }, { passive: false });
  box.addEventListener('click', e => {
    e.stopPropagation();
    if (moved) { moved = false; return; }
    if (closeT) {   // Doppeltippen: zoomen bzw. zurück
      clearTimeout(closeT); closeT = 0;
      zoomAt(e.clientX, e.clientY, s > 1 ? 1 : 2.5); bound(); apply(true); return;
    }
    closeT = setTimeout(() => { closeT = 0; box.remove(); }, 260);
  });
}
function scanHTML(c, masked) {
  if (!c.img) return richHTML(c) + (masked ? '' : cardExtras(c));
  const m = masked && c.mask ? `<div class="mask" style="left:${c.mask[0] / c.w * 100}%;top:${c.mask[1] / c.h * 100}%;width:${(c.mask[2] - c.mask[0]) / c.w * 100}%;height:${(c.mask[3] - c.mask[1]) / c.h * 100}%"></div>` : '';
  return `<div class="scanwrap" data-zoom="${c.id}" title="Antippen zum Vergrössern"><img class="scan" src="img/${c.img}" width="${c.w}" height="${c.h}" alt="${esc(c.kind + ' ' + c.nr)}" decoding="sync">${m}${masked ? '' : '<span class="zoomchip" aria-hidden="true">⤢</span>'}</div>`;
}
/* Prädikatenlogische Formulierung (KaTeX), falls vorhanden */
const _texCache = {};
function tex(t) {
  if (_texCache[t]) return _texCache[t];
  try { return (_texCache[t] = window.katex.renderToString('\\displaystyle ' + t, { displayMode: false, throwOnError: false, strict: false })); }   // Inline-Modus: KaTeX bricht lange Formeln an Relationen (⇒, =, ≤ …) um
  catch (e) { return `<code>${esc(t)}</code>`; }
}
function logicHTML(c) {
  const rows = (window.LOGIC || {})[c.id];
  if (!rows) return '';
  if (S.settings.showLogic === false) return '';
  return `<details class="logic" ${S.settings.logicOpen === false ? '' : 'open'}><summary>Prädikatenlogisch</summary>${rows.map(([lab, t]) =>
    `<div class="lrow">${lab ? `<div class="llab">${esc(lab)}</div>` : ''}<div class="lf">${window.katex ? tex(t) : `<code>${esc(t)}</code>`}</div></div>`).join('')}</details>`;
}
function historyLine(c) {
  const x = S.cards[c.id];
  if (!x || !x.st) return '';
  const L = S.log.filter(l => l[1] === c.id && modeOf(l) !== 'q');
  const dots = L.slice(-12).map(l => `<i title="${new Date(l[0]).toLocaleDateString('de-CH')}" style="background:${['', 'var(--again)', 'var(--hard)', 'var(--good)', 'var(--easy)'][l[2]]}"></i>`).join('');
  return `<div class="hist"><span class="dots">${dots}</span><span>${L.length}× gesehen · ${x.lapses || 0}× vergessen · zuletzt vor ${fmtIvl(now() - x.last)} · jetzt ${Math.round(retrievability(x) * 100)}% erwartet</span></div>`;
}
function viewStudy() {
  const s = session;
  if (!s.cur && s.waiting && s.later.length) {
    const until = Math.min(...s.later.map(id => S.cards[id].due)) - WAIT_SOON;
    return pauseHTML(until, s.later.length, 'forcelater', `<button class="btn primary big solo-btn" data-act="home">Fertig für jetzt</button>`);
  }
  if (!s.cur) {
    const L = S.log.slice(s.logFrom).filter(l => modeOf(l) !== 'q');
    const rev = L.filter(l => l[3] === 2), fresh = L.filter(l => l[3] === 0);
    const acc = rev.length ? Math.round(rev.filter(l => l[2] >= 2).length / rev.length * 100) : null;
    const secs = L.reduce((a, l) => a + l[4], 0) / 10;
    const tomorrow = CARDS.filter(c => { const x = S.cards[c.id]; return x && x.st && !x.susp && x.due < dayStart() + 2 * DAY; }).length;
    const lapsed = [...new Set(rev.filter(l => l[2] === 1).map(l => l[1]))].map(id => BY_ID[id]);
    const ts = todayStatus();
    if (ts.allDone && !s.celebrated) { s.celebrated = true; setTimeout(() => celebrate(), 60); }
    return `<div class="solo">${ts.allDone ? doneHeroHTML(ts) : `<div class="donehero"><div class="dt">Pause</div><div class="ds">${L.length} Karten erledigt.</div></div>`}
      <button class="btn primary big solo-btn" data-act="home">Fertig</button></div>`;
  }
  const c = BY_ID[s.cur], x = cs(c.id);
  const isNew = !x.st;
  const left = s.queue.length + 1 + s.later.length;
  const pct = s.total ? clamp(s.done / (s.done + left) * 100, 0, 100) : 0;
  const ivls = s.revealed ? previewIvls(c) : null;
  return `
  <div class="study-head">
    <button class="btn ghost" data-act="home" title="Beenden">✕</button>
    <div class="progress"><div style="width:${pct}%"></div></div>

    ${s.undo.length ? '<button class="btn ghost small" data-act="undo" title="Rückgängig (U)">↶</button>' : ''}
  </div>
  <div class="card fc${s.revealed && swipeMode() ? ' swipeable' : ''}">
    ${s.revealed && swipeMode() ? '<span class="sbadge no" aria-hidden="true">Nicht gewusst</span><span class="sbadge ok" aria-hidden="true">Gewusst</span>' : ''}
    <div class="row">
      <span class="kind" style="color:${KIND_COLOR[c.kind]}">${esc(c.kind)} ${c.nr}</span>
      ${isNew ? '<span class="muted small">· neu</span>' : ''}
    </div>
    <div class="ttl">${esc(c.title) || esc(c.kind + ' ' + c.nr)}</div>
    ${cueOf(c) ? `<div class="cue">${esc(cueOf(c))}</div>` : ''}
    <div class="meta">${metaLine(c)}</div>
    ${qHTML(c)}
    ${!s.revealed ? `
      ${S.settings.typeAnswer ? `<textarea class="note" id="answer" placeholder="Hier aufschreiben (wird nicht gespeichert) …"></textarea>` : ''}
      <div class="spacer"></div>
      <div class="actionbar revealbar"><button class="btn primary big" data-act="reveal">Aufdecken</button></div>
    ` : `
      ${scanHTML(c, false)}
      ${logicHTML(c)}
      ${c.tip ? `<div class="tip"><b>Worauf achten:</b> ${esc(c.tip)}</div>` : ''}
      ${swipeMode() ? '' : `<div class="actionbar"><div class="rate">
        <button class="r1" data-rate="1">Nochmal<small>${ivls[0]}</small></button>
        <button class="r2" data-rate="2">Schwer<small>${ivls[1]}</small></button>
        <button class="r3" data-rate="3">Gut<small>${ivls[2]}</small></button>
        <button class="r4" data-rate="4">Einfach<small>${ivls[3]}</small></button>
      </div></div>
      <div class="kbd center ratehelp" style="margin-top:8px">Nochmal = wesentlicher Teil fehlte · Schwer = mit Mühe/kleine Lücke · Gut = vollständig · Einfach = sofort und sicher</div>`}
    `}
  </div>
  ${s.revealed && swipeMode() ? `<div class="actionbar swipeact">
    <div class="rbtns">
      <button class="rb no" data-rate="1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg><span>Nicht gewusst</span></button>
      <button class="rb ok" data-rate="3"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4 4L18.5 8"/></svg><span>Gewusst</span></button>
    </div>
  </div>` : ''}`;
}

/* ---------- Wischen: rechts = gewusst, links = nicht gewusst ---------- */
const Swipe = {
  attach() {
    const fc = $('.fc.swipeable'); if (!fc || fc._sw) return; fc._sw = true;
    let st = null;
    const W = () => fc.offsetWidth || innerWidth;
    const setP = dx => { const p = clamp(dx / (W() * .32), -1, 1); fc.style.setProperty('--pos', Math.max(0, p)); fc.style.setProperty('--neg', Math.max(0, -p)); };
    fc.addEventListener('pointerdown', e => {
      if (e.button || (Motion.busy && performance.now() - (Motion.busyAt || 0) < 1000) || e.target.closest('button,a,summary,input,textarea,.lf')) return;
      st = { x: e.clientX, y: e.clientY, t: performance.now(), drag: false, id: e.pointerId };
    });
    fc.addEventListener('pointermove', e => {
      if (!st || e.pointerId !== st.id) return;
      const dx = e.clientX - st.x, dy = e.clientY - st.y;
      if (!st.drag) {
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) { st.drag = true; try { fc.setPointerCapture(e.pointerId); } catch (_) { } fc.classList.add('dragging'); }
        else if (Math.abs(dy) > 12) { st = null; return; }
        else return;
      }
      e.preventDefault();
      st.dx = dx; st.dy = dy;
      fc.style.transform = `translate(${dx}px,${dy * .12}px) rotate(${dx * .035}deg)`;
      setP(dx);
    });
    const end = e => {
      if (!st) return;
      const o = st; st = null;
      if (!o.drag) return;
      fc.classList.remove('dragging');
      fc._noclick = true; setTimeout(() => { fc._noclick = false; }, 60);
      const v = (o.dx || 0) / Math.max(1, performance.now() - o.t);
      if (Math.abs(o.dx || 0) > W() * .3 || (Math.abs(v) > .55 && Math.abs(o.dx) > 40)) this.fly(o.dx > 0 ? 3 : 1, o.dy || 0);
      else { fc.style.transform = ''; setP(0); }
    };
    fc.addEventListener('pointerup', end);
    fc.addEventListener('pointercancel', end);
    fc.addEventListener('click', e => { if (fc._noclick) { e.stopPropagation(); e.preventDefault(); } }, true);
  },
  /* Karte hinausfliegen lassen, dann bewerten */
  fly(g, dy = 0) {
    if (Motion.busy && performance.now() - (Motion.busyAt || 0) > 1000) Motion.busy = false;
    if (Motion.busy) return;
    const fc = $('.fc');
    if (!fc || Motion.reduced()) return rate(g, { flown: true });
    Motion.busy = true; Motion.busyAt = performance.now();
    const dir = g === 1 ? -1 : 1;
    fc.classList.add('fly');
    fc.style.setProperty('--pos', dir > 0 ? 1 : 0); fc.style.setProperty('--neg', dir < 0 ? 1 : 0);
    fc.style.transform = `translate(${dir * (innerWidth + 120)}px,${dy * .12 + 30}px) rotate(${dir * 16}deg)`;
    const rb = document.querySelector(`.rb.${dir > 0 ? 'ok' : 'no'}`); if (rb) rb.classList.add('hit');
        setTimeout(() => { Motion.busy = false; rate(g, { flown: true }); }, 240);
  },
};

/* ============================================================
 * Quiz (Zuordnen) & Prüfungstest
 * ============================================================ */
let quiz = null;   // {type:'match'|'test', items:[id], i, answers:[], opts, picked}

function pickWeighted(pool, n, weightFn) {
  const arr = pool.map(c => ({ c, k: Math.pow(Math.random(), 1 / Math.max(1e-6, weightFn(c))) }));
  return arr.sort((a, b) => b.k - a.k).slice(0, n).map(o => o.c);
}
function quizPool(scope) {
  let pool = CARDS.filter(c => !(S.cards[c.id] || {}).susp);
  if (scope === 'intro') { const p = pool.filter(c => S.cards[c.id] && S.cards[c.id].st); if (p.length >= 8) pool = p; }
  else if (scope.startsWith('k')) pool = pool.filter(c => c.chap === +scope.slice(1));
  else if (scope === 'kern') pool = pool.filter(c => prioOf(c) >= 4);
  return pool;
}
function weakness(c) {
  const x = S.cards[c.id];
  const r = x && x.st ? retrievability(x, examTime()) : 0.3;
  const q = x ? ((x.qBad || 0) + 1) / ((x.qOk || 0) + (x.qBad || 0) + 2) : 0.5;
  return PRIO[prioOf(c)].w * (1.2 - r) * (0.5 + q);
}
function startQuiz(type, scope, n) {
  let pool = quizPool(scope);
  if (type === 'match') pool = pool.filter(c => !c.q);   // Code-Karten passen nicht zum Zuordnen
  if (pool.length < 4) { toast('Zu wenige Karten in dieser Auswahl'); return; }
  const items = pickWeighted(pool, Math.min(n, pool.length), weakness).map(c => c.id);
  quiz = { type, scope, items, i: 0, answers: [], picked: null, revealed: false };
  Timer.start();
  if (type === 'match') quiz.opts = makeOpts(items[0]);
  render();
  preloadQuiz();
}
/* ---------- Verwechslungsgefahr: gleich oder fast gleich betitelte Karten ----------
 * CUES: kurzer Unterscheidungs-Hinweis, der die Antwort nicht verrät. */
const CUES = {
  'Satz-2.15': 'Anfang und Schritt von n zu n + 1',
  'Satz-2.19': 'Starke Form: alle kleineren k',
  'Definition-2.52': 'In ℂ',
  'Definition-5.16': 'In metrischen Räumen, mit offenen Mengen',
  'Definition-2.82': 'Was die Cantor-Menge ist',
  'Korollar-2.83': 'Folgerung über die Mächtigkeit',
  'Definition-3.45': 'Reelle Funktionen, ε-δ',
  'Lemma-7.96': 'Ziffern-Abbildungen auf der Cantor-Menge',
  'Satz-3.67': 'Stetige Funktionen auf [a, b]',
  'Lemma-5.27': 'Konvergente Folgen',
  'Lemma-5.39': 'Teilfolgen einer konvergenten Folge',
  'Satz-6.15': 'Teilfolgen einer beschränkten reellen Folge',
  'Definition-5.48': 'Metrische Räume, ε-δ',
  'Lemma-5.49': 'Zusammenhang zweier Stetigkeitsbegriffe',
  'Definition-8.16': 'Was ein lokales Extremum ist',
  'Korollar-8.18': 'Wo lokale Extrema liegen können',
  'Theorem-9.2': 'f Riemann-integrierbar, Aussage bei einem Punkt',
  'Korollar-9.3': 'f stetig, Stammfunktionen',
  'Satz-6.26': 'Für Folgen',
  'Satz-7.26': 'Für Reihen',
  'Definition-2.43': 'In ℝ',
  'Definition-5.24': 'In metrischen Räumen',
  'Definition-2.45': 'Reelle Zahlen',
  'Definition-2.51': 'Komplexe Zahlen',
  'Lemma-2.17': 'Natürliche Zahlen ℕ',
  'Lemma-2.25': 'Ganze Zahlen ℤ',
  'Definition-2.48': 'In ℝ',
  'Definition-2.54': 'In ℂ',
  'Lemma-8.60': 'Ohne Störterm',
  'Lemma-8.61': 'Mit Störterm',
};
const cueOf = c => CUES[c.id] || '';
const Similar = {
  _m: null,
  norm: t => (t || '').toLowerCase().replace(/[^a-zäöüß0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(),
  build() {
    const STOP = new Set(['eines', 'einer', 'einem', 'sind', 'fuer', 'für', 'von', 'und', 'der', 'die', 'das', 'mit', 'auf', 'des']);
    const words = t => new Set(this.norm(t).split(' ').filter(w => w.length > 3 && !STOP.has(w)));
    const W = CARDS.map(c => words(c.title)); const m = {};
    for (let i = 0; i < CARDS.length; i++) for (let j = i + 1; j < CARDS.length; j++) {
      const a = W[i], b = W[j]; if (!a.size || !b.size) continue;
      let n = 0; for (const w of a) if (b.has(w)) n++;
      const same = this.norm(CARDS[i].title) === this.norm(CARDS[j].title);
      if (same || n / (a.size + b.size - n) >= 0.99) { (m[CARDS[i].id] = m[CARDS[i].id] || []).push(CARDS[j].id); (m[CARDS[j].id] = m[CARDS[j].id] || []).push(CARDS[i].id); }
    }
    return (this._m = m);
  },
  of(id) { return ((this._m || this.build())[id] || []).map(x => BY_ID[x]).filter(Boolean); },
};

function makeOpts(id) {
  const c = BY_ID[id];
  const sameKindGroup = k => c.img ? (k === 'Definition') === (c.kind === 'Definition') : (k === 'Konzept') === (c.kind === 'Konzept');
  let cands = CARDS.filter(o => o.id !== id && o.title && o.title !== c.title);
  const near = cands.filter(o => o.chap === c.chap && sameKindGroup(o.kind));
  const pool = near.length >= 3 ? near : cands.filter(o => Math.abs(o.chap - c.chap) <= 1);
  const d = [], titles = new Set([c.title]);
  for (const o of pickWeighted(pool.length >= 3 ? pool : cands, 40, () => 1)) {
    if (titles.has(o.title)) continue;
    titles.add(o.title); d.push(o);
    if (d.length === 3) break;
  }
  return [c, ...d].map(o => o.id).sort(() => Math.random() - 0.5);
}
function quizAnswer(val) {
  const id = quiz.items[quiz.i], x = cs(id);
  let ok;
  const tm = Timer.result();
  if (quiz.type === 'match') {
    if (quiz.picked) return; quiz.picked = val; ok = val === id;
    S.log.push([now(), id, ok ? 3 : 1, x.st || 0, tm.total, 'q', tm.total, 0]);
  } else {
    ok = val >= 3;
    // Test-Bewertung fliesst ins Lernsystem ein
    S.cards[id] = schedule(BY_ID[id], x, val);
    S.log.push([now(), id, val, x.st || 0, tm.total, 't', tm.front, tm.back]);
  }
  const y = cs(id);
  if (ok) y.qOk = (y.qOk || 0) + 1;
  else {
    y.qBad = (y.qBad || 0) + 1;
    // Falsch im Quiz → Karte heute nochmals im Lernmodus
    if (quiz.type === 'match' && y.st === 2 && y.due > dayStart() + DAY) y.due = now();
  }
  y.u = now();
  quiz.answers.push({ id, ok, val });
  save();
  if (quiz.type === 'test') quizNext(); else render();
}
function quizNext() {
  quiz.i++; quiz.picked = null; quiz.revealed = false; Timer.start();
  if (quiz.i < quiz.items.length && quiz.type === 'match') quiz.opts = makeOpts(quiz.items[quiz.i]);
  Motion.set(quiz.i < quiz.items.length ? 'next' : 'tab');
  render();
  preloadQuiz();
}
function viewQuiz() {
  if (quiz && quiz.i < quiz.items.length) {
    const id = quiz.items[quiz.i], c = BY_ID[id];
    const head = `<div class="study-head"><button class="btn ghost" data-act="quizend">✕</button>
      <div class="progress"><div style="width:${quiz.i / quiz.items.length * 100}%"></div></div>
      <span class="small muted">${quiz.i + 1}/${quiz.items.length}</span></div>`;
    if (quiz.type === 'match') {
      return head + `<div class="card fc">
        <div class="row"><span class="kind" style="color:var(--muted)">${c.kind === 'Konzept' ? 'Zu welcher Frage gehört diese Antwort?' : 'Welcher Name gehört zu dieser Aussage?'}</span><div class="spacer"></div><span class="pill gray">Kap. ${c.chap}</span></div>
        ${scanHTML(c, true)}
        <div class="opts">${quiz.opts.map(o => {
          const oc = BY_ID[o];
          let cl = '';
          if (quiz.picked) { if (o === id) cl = 'ok'; else if (o === quiz.picked) cl = 'bad'; }
          return `<button class="opt ${cl}" data-opt="${o}" ${quiz.picked ? 'disabled' : ''}>${esc(oc.title)}${cueOf(oc) ? ` <span class="muted small">· ${esc(cueOf(oc))}</span>` : ''}${quiz.picked ? ` <span class="muted small">(${KIND_SHORT[oc.kind]} ${oc.nr})</span>` : ''}</button>`;
        }).join('')}</div>
        ${quiz.picked ? `<div class="actionbar"><button class="btn primary big" data-act="quiznext">Weiter</button></div>` : ''}
      </div>`;
    }
    // Prüfungstest
    return head + `<div class="card fc">
      <div class="row"><span class="kind" style="color:${KIND_COLOR[c.kind]}">${esc(c.kind)} ${c.nr}</span><div class="spacer"></div>${prioTag(c)}</div>
      <div class="ttl">${esc(c.title)}</div>${cueOf(c) ? `<div class="cue">${esc(cueOf(c))}</div>` : ''}
      <div class="meta">Kap. ${c.chap}${c.sec ? ' · ' + esc(c.sec) : ''}</div>
      ${qHTML(c)}
      ${!quiz.revealed ? `<div class="prompt">Prüfungssituation: ${c.img ? `Schreibe die ${c.kind === 'Definition' ? 'Definition' : 'Aussage'} so auf, wie du sie in der Prüfung hinschreiben würdest.` : promptFor(c)} Erst dann aufdecken.</div>
        <div class="spacer"></div><div class="actionbar"><button class="btn primary big" data-act="qreveal">Aufdecken</button></div>`
      : `${scanHTML(c, false)}${logicHTML(c)}
        <div class="actionbar"><div class="rate three">
          <button class="r1" data-trate="1">Nicht gewusst</button>
          <button class="r2" data-trate="2">Lückenhaft</button>
          <button class="r3" data-trate="3">Vollständig</button></div></div>`}
    </div>`;
  }
  if (quiz && quiz.i >= quiz.items.length) {
    const ok = quiz.answers.filter(a => a.ok).length, n = quiz.answers.length;
    const wrong = quiz.answers.filter(a => !a.ok).map(a => BY_ID[a.id]);
    return `<div class="card"><div class="center"><div style="font-size:42px;font-weight:800">${Math.round(ok / n * 100)}%</div>
      <div class="muted">${ok} von ${n} ${quiz.type === 'match' ? 'richtig zugeordnet' : 'vollständig gewusst'}</div></div>
      ${wrong.length ? `<h3 style="margin-top:18px">Nochmals anschauen</h3>${UI.group(wrong.map(liHTML))}
        <div class="muted small" style="margin-top:6px">${quiz.type === 'match' ? 'Falsch zugeordnete Karten kommen heute nochmals im Lernmodus.' : 'Die Test-Bewertungen wurden direkt in deinen Lernplan übernommen.'}</div>` : ''}
      <div class="row" style="margin-top:16px"><button class="btn" data-act="quizend">Zurück</button>
      ${wrong.length ? `<button class="btn primary" data-act="learnwrong">Falsche jetzt lernen</button>` : ''}</div></div>`;
  }
  const chOpts = Object.entries(window.CHAPTERS || {}).map(([k, v]) => `<option value="k${k}">Kapitel ${k}: ${esc(v)}</option>`).join('');
  return `<div class="quizgrid">
  ${UI.group([
    UI.item('match', '#0a84ff', 'Zuordnen', 'Aussage sehen, Namen wählen', '', { act: 'quizstart' }),
    UI.item('test', '#ff375f', 'Prüfungstest', 'Wie an der Prüfung', '', { act: 'teststart' }),
  ])}
  </div>
  ${quizHistory()}`;
}
function quizHistory() {
  const t = S.log.filter(l => l[5] === 't');
  if (!t.length) return '';
  const last30 = t.filter(l => l[0] > now() - 30 * DAY);
  const ok = last30.filter(l => l[2] >= 3).length;
  return `<div class="card small muted" style="margin-top:12px">Prüfungstests der letzten 30 Tage: ${last30.length} Karten, davon ${last30.length ? Math.round(ok / last30.length * 100) : 0}% vollständig gewusst.</div>`;
}

/* ============================================================
 * Katalog
 * ============================================================ */
let cat = { q: '', chap: '', kind: '', prio: '', status: '' };
function liHTML(c) {
  const st = statusOf(c), x = S.cards[c.id];
  const right = x && x.st ? (st.k === 'lernend' ? 'lernt' : Math.round(retrievability(x) * 100) + ' %') : '';
  return `<div class="ir li2" data-card="${c.id}"><span class="ir-l"><b>${esc(c.title) || '—'}${(x || {}).flag ? ' ★' : ''}</b><small>${esc(KIND_SHORT[c.kind] + ' ' + c.nr)}${cueOf(c) ? ' · ' + esc(cueOf(c)) : ''}</small></span><span class="ir-r"><svg class="chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1.5 1.5L6.5 7l-5 5.5"/></svg></span></div>`;
}
function filteredCatalog() {
  const q = cat.q.trim().toLowerCase();
  return CARDS.filter(c => {
    if (cat.chap && c.chap !== +cat.chap) return false;
    if (cat.kind && !(cat.kind === 'Satz' ? ['Satz', 'Theorem'].includes(c.kind) : c.kind === cat.kind)) return false;
    if (cat.prio && prioOf(c) !== +cat.prio) return false;
    if (cat.status) {
      const st = statusOf(c).k;
      if (cat.status === 'flag') { if (!(S.cards[c.id] || {}).flag) return false; }
      else if (cat.status === 'wackelig') { const x = S.cards[c.id]; if (!(x && x.st && retrievability(x) < 0.85)) return false; }
      else if (st !== cat.status) return false;
    }
    if (q && !(`${c.kind} ${c.nr} ${c.title} ${c.text} ${c.sec}`.toLowerCase().includes(q))) return false;
    return true;
  });
}
function viewCatalog() {
  const list = filteredCatalog();
  const segs = [['', 'Alle'], ['neu', 'Neu'], ['lernend', 'Lernend'], ['sitzt', 'Sitzt'], ['schwach', 'Schwach']];
  const extra = [];
  if (cat.prio) extra.push(['prio', PRIO[cat.prio].name]);
  if (cat.kind) extra.push(['kind', KIND_PLURAL[cat.kind] || cat.kind]);
  if (cat.chap) extra.push(['chap', 'Kapitel ' + cat.chap]);
  if (cat.status && !segs.some(x => x[0] === cat.status)) extra.push(['status', { wackelig: 'Wackelig', jung: 'Jung', flag: 'Markiert', pause: 'Pausiert' }[cat.status] || cat.status]);
  const by = {}; for (const c of list) (by[c.chap] = by[c.chap] || []).push(c);
  return `
  <div class="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg><input id="cq" type="search" placeholder="Suchen" value="${esc(cat.q)}" autocomplete="off"></div>
  <div class="seg" role="tablist">${segs.map(([v, l]) => `<button role="tab" data-seg="${v}" class="${cat.status === v ? 'on' : ''}">${l}</button>`).join('')}</div>
  ${extra.length ? `<div class="chips">${extra.map(([k, l]) => `<button class="chip" data-unfilter="${k}">${esc(l)} <span aria-hidden="true">×</span></button>`).join('')}</div>` : ''}
  ${list.length ? Object.keys(by).sort((a, b) => a - b).map(k => UI.group(by[k].map(liHTML), { header: `${k}. ${esc((window.CHAPTERS || {})[k] || '')}` })).join('') : '<div class="empty muted">Keine Treffer</div>'}`;
}

function openCard(id) {
  const c = BY_ID[id], x = S.cards[id] || {};
  const st = statusOf(c);
  const rows = [];
  if (x.st) {
    rows.push(['Status', st.l]);
    rows.push(['Abrufwahrscheinlichkeit jetzt', Math.round(retrievability(x) * 100) + '%']);
    rows.push(['… am Prüfungstag (ohne weitere Wiederholung)', Math.round(retrievability(x, examTime()) * 100) + '%']);
    rows.push(['Stabilität', x.S ? x.S.toFixed(1) + ' Tage' : '–']);
    rows.push(['Schwierigkeit (1–10)', x.D ? x.D.toFixed(1) : '–']);
    rows.push(['Nächste Wiederholung', x.due ? (x.due <= now() ? 'fällig' : fmtDate(x.due) + ' (in ' + fmtIvl(x.due - now()) + ')') : '–']);
    rows.push(['Wiederholungen / Fehler', `${x.reps || 0} / ${x.lapses || 0}`]);
  } else rows.push(['Status', 'Noch nicht eingeführt']);
  if (x.qOk || x.qBad) rows.push(['Quiz richtig / falsch', `${x.qOk || 0} / ${x.qBad || 0}`]);
  const tl = S.log.filter(l => l[1] === id && modeOf(l) !== 'q');
  if (tl.length) {
    const fr = tl.filter(l => l[6] != null), sum = tl.reduce((a, l) => a + l[4], 0) / 10;
    rows.push(['Lernzeit gesamt', fmtSec(sum) + ` (${tl.length}×)`]);
    if (fr.length) rows.push(['Ø Denkzeit / Ø Prüfzeit', `${fmtSec(fr.reduce((a, l) => a + l[6], 0) / 10 / fr.length)} / ${fmtSec(fr.reduce((a, l) => a + l[7], 0) / 10 / fr.length)}`]);
  }
  if (c.proofP) rows.push(['Beweis-Prüfungschance (Modell)', `≈ ${Math.max(1, Math.round(c.proofP * 100))}%${c.proofH ? ` · ${c.proofH}× in alten Prüfungen` : ''}`]);
  modal(`
    <div class="row">${kindTag(c)}<div class="spacer"></div>${prioTag(c)}<button class="btn ghost" data-act="close">✕</button></div>
    <h3 style="font-size:19px;margin:10px 0 2px">${esc(c.title)}</h3>
    <div class="muted small">${metaLine(c, true)}${!c.titled ? ` · Titel ergänzt (${c.src === 'Mitschrift' ? 'in der Mitschrift' : 'im Skript'} ohne Namen)` : ''}</div>
    ${qHTML(c)}
    ${scanHTML(c, false)}
    ${logicHTML(c)}
    ${c.tip ? `<div class="tip"><b>Worauf achten:</b> ${esc(c.tip)}</div>` : ''}
    <table class="t" style="margin-top:12px">${rows.map(r => `<tr><td class="muted">${r[0]}</td><td class="num">${r[1]}</td></tr>`).join('')}</table>
    <div class="row" style="margin-top:14px">
      <button class="btn" data-cardact="flag" data-id="${id}">${x.flag ? '★ Markierung entfernen' : '☆ Markieren'}</button>
      <select class="btn" data-cardact="prio" data-id="${id}">${[5, 4, 3, 2, 1].map(p => `<option value="${p}" ${prioOf(c) === p ? 'selected' : ''}>Priorität: ${PRIO[p].name}${p === c.prio ? ' (Standard)' : ''}</option>`).join('')}</select>
      <button class="btn" data-cardact="now" data-id="${id}">Jetzt üben</button>
      <button class="btn" data-cardact="susp" data-id="${id}">${x.susp ? 'Fortsetzen' : 'Pausieren'}</button>
      ${x.st ? `<button class="btn" data-cardact="reset" data-id="${id}" style="color:var(--again)">Zurücksetzen</button>` : ''}
    </div>`);
}

/* ============================================================
 * Statistik & Analyse
 * ============================================================ */
/* ---------- Auf Kurs für die Prüfung? ----------
 * Ziel (wie der Lernplan): alle Karten spätestens 3 Wochen vor der Prüfung
 * eingeführt, damit genug Zeit zum Festigen bleibt. Verglichen wird das nötige
 * Tempo mit deinem Tempo der letzten 7 Tage. */
function trackStatus() {
  const dte = daysToExam(), remaining = eligibleNew(true).length;
  const overdue = CARDS.filter(c => { const x = S.cards[c.id]; return x && x.st === 2 && !x.susp && x.due < dayStart(); }).length;
  const created = S.created || (S.log[0] && S.log[0][0]) || now();
  const span = clamp(Math.ceil((now() - Math.max(created, now() - 7 * DAY)) / DAY), 1, 7);
  const recent = CARDS.filter(c => { const x = S.cards[c.id]; return x && x.intro && x.intro > now() - span * DAY; }).length;
  const pace = recent / span;
  const daysLeft = Math.max(1, dte - TRACK_BUFFER);
  const need = (remaining + newIntroducedToday()) / daysLeft;
  const finish = pace > 0 ? now() + remaining / pace * DAY : null;
  let level, title, sub;
  if (dte < 0) { level = 'done'; title = 'Prüfung vorbei'; sub = ''; }
  else if (!remaining) {
    level = overdue > 30 ? 'warn' : 'ok';
    title = overdue > 30 ? 'Wiederholungen aufholen' : 'Auf Kurs';
    sub = overdue > 30 ? `${overdue} Wiederholungen sind überfällig` : 'Alle Karten eingeführt, jetzt festigen';
  } else if (!S.log.length) { level = 'start'; title = 'Noch nicht begonnen'; sub = `${Math.ceil(need)} neue Karten pro Tag reichen`; }
  else if (pace >= need * 0.98) { level = 'ok'; title = 'Auf Kurs'; sub = `Alle Karten bis ${fmtDate(finish)} eingeführt`; }
  else if (pace >= need * 0.7) { level = 'warn'; title = 'Knapp'; sub = `Etwas mehr Tempo: ${Math.ceil(need)} statt ${pace.toFixed(1)} neue pro Tag`; }
  else { level = 'bad'; title = 'Hinter Plan'; sub = `Nötig sind ${Math.ceil(need)} neue Karten pro Tag`; }
  return { level, title, sub, dte, remaining, need, pace, finish, overdue, exam: examTime() };
}
const TRACK_COL = { ok: '#30a46c', warn: '#ff9f0a', bad: '#ff453a', start: '#8e8e93', done: '#8e8e93' };
/* Zusammenfassung pro Fach speichern, damit die Übersicht alle Fächer zeigen kann */
function saveTrackSummary(tr) {
  try {
    const all = JSON.parse(localStorage.getItem('lemmalab-track') || '{}');
    all[FACH] = { level: tr.level, title: tr.title, exam: tr.exam, ready: Math.round(standShare().pSafe * 100), at: now() };
    localStorage.setItem('lemmalab-track', JSON.stringify(all));
  } catch (e) { }
}
function trackHTML() {
  const tr = trackStatus(); saveTrackSummary(tr);
  const col = TRACK_COL[tr.level];
  const icon = tr.level === 'ok' ? 'check' : tr.level === 'start' ? 'calendar' : tr.level === 'done' ? 'calendar' : 'alert';
  const rows = [
    `<div class="ir ii track">${icon === 'check' ? `<span class="ico" style="background:${col}"><svg viewBox="0 0 24 24">${ICON.check}</svg></span>` : `<span class="ico" style="background:${col}"><svg viewBox="0 0 24 24">${ICON[icon]}</svg></span>`}<span class="ir-l"><b>${tr.title}</b>${tr.sub ? `<small>${esc(tr.sub)}</small>` : ''}</span></div>`,
    UI.row('Prüfung', `<span class="v">${new Date(tr.exam).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })}${tr.dte >= 0 ? ` · in ${tr.dte} Tagen` : ''}</span>`),
    ...(() => { const ss = standShare(); return [UI.row('Sicher beherrscht', `<span class="v">${Math.round(ss.pSafe * 100)} % · ${ss.safe} von ${ss.N}</span>`)]; })(),
  ];
  if (tr.remaining && tr.dte >= 0) {
    rows.push(UI.row('Noch neu', `<span class="v">${tr.remaining} Karten</span>`));
    rows.push(UI.row('Nötiges Tempo', `<span class="v">${Math.ceil(tr.need)} pro Tag</span>`));
    rows.push(UI.row('Tagesplan', `<span class="v">${plannedNewPerDay()} neue pro Tag${S.settings.newMode === 'manual' ? ' (manuell)' : ''}</span>`));
    if (S.log.length) rows.push(UI.row('Dein Tempo', `<span class="v">${tr.pace.toFixed(1)} pro Tag</span>`));
  }
  // alle Fächer
  let others = '';
  try {
    const all = JSON.parse(localStorage.getItem('lemmalab-track') || '{}');
    const F = window.FAECHER || {};
    const list = Object.keys(F).filter(k => k !== FACH && !F[k].kind).map(k => {
      const t = all[k], ex = new Date(parseDate(F[k].examDate) || 0);
      const exam = t && t.exam ? new Date(t.exam) : ex;
      const right = t ? `<span class="v" style="color:${TRACK_COL[t.level]}">${esc(t.title)}</span>` : '<span class="v">noch nicht geöffnet</span>';
      return `<button type="button" class="ir ia ii" data-fachgo="${k}"><span class="ir-l"><b style="color:var(--ink)">${esc(F[k].name)}</b><small>Prüfung ${exam.toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' })}${t ? ` · ${t.ready} % sicher` : ''}</small></span><span class="ir-r">${right}<svg class="chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1.5 1.5L6.5 7l-5 5.5"/></svg></span></button>`;
    });
    if (list.length) others = UI.group(list, { header: 'Andere Fächer', footer: 'Stand vom letzten Öffnen des jeweiligen Fachs.' });
  } catch (e) { }
  const goal = tr.exam - MASTER_BEFORE * DAY, intro = tr.exam - TRACK_BUFFER * DAY;
  return UI.group(rows, { header: 'Prüfung', footer: `Ziel: alles bis ${new Date(goal).toLocaleDateString('de-CH', { day: 'numeric', month: 'long' })} sicher beherrschen (1 Monat vor der Prüfung). Dafür sind alle Karten bis ${new Date(intro).toLocaleDateString('de-CH', { day: 'numeric', month: 'long' })} eingeführt, danach wird nur noch gefestigt.` }) + others;
}
document.addEventListener('click', e => { const b = e.target.closest('[data-fachgo]'); if (b && window.switchFach) window.switchFach(b.dataset.fachgo); });

/* Prüfungsdatum: alte Standardwerte auf den erstmöglichen Termin umstellen (solange nicht selbst gesetzt) */
(() => {
  const old = (window.FACH_OLD_EXAM || {})[FACH] || [];
  if (S && S.settings && !S.settings.examSet && old.includes(S.settings.examDate) && FACH_CFG.examDate) {
    S.settings.examDate = FACH_CFG.examDate;
    try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { }
  }
})();

/* Stand: sicher beherrscht (= Stabilität ≥ 21 Tage, wie in der Prognose) und eingeführt, je Anteil aller Karten */
function standShare() {
  const cs = CARDS.filter(c => prioOf(c) !== 1 || S.settings.includeRand), N = cs.length || 1;
  let safe = 0, intro = 0;
  for (const c of cs) { const x = S.cards[c.id]; if (!x || !x.st) continue; intro++; if (x.st === 2 && x.S >= MASTER_S) safe++; }
  return { safe, intro, N, pSafe: safe / N, pIntro: intro / N };
}
function readiness() {
  let wsum = 0, rExam = 0, rNow = 0;
  for (const c of CARDS) {
    const p = prioOf(c); if (p === 1 && !S.settings.includeRand) continue;
    const x = S.cards[c.id], w = PRIO[p].w;
    wsum += w;
    if (x && x.st) {
      rNow += w * retrievability(x);
      // am Prüfungstag: falls vorher noch geplant wiederholt wird, gilt Zielretention
      const planned = x.due && x.due < examTime() && x.st === 2;
      rExam += w * (planned ? Math.max(retrievability(x, examTime()), retFor(c) * 0.97) : retrievability(x, examTime()));
    }
  }
  return { now: wsum ? rNow / wsum : 0, exam: wsum ? rExam / wsum : 0 };
}
function groupStats(keyFn, keys) {
  return keys.map(k => {
    const cs2 = CARDS.filter(c => keyFn(c) === k);
    let sitzt = 0, jung = 0, lern = 0, neu = 0, rs = 0, rn = 0;
    for (const c of cs2) {
      const x = S.cards[c.id];
      if (!x || !x.st) { neu++; continue; }
      if (x.st !== 2) lern++; else if (x.S >= 21) sitzt++; else jung++;
      rs += retrievability(x); rn++;
    }
    return { k, n: cs2.length, sitzt, jung, lern, neu, r: rn ? rs / rn : null };
  });
}
function stackBar(g) {
  const seg = (v, col) => v ? `<span style="width:${v / g.n * 100}%;background:${col}"></span>` : '';
  return `<div class="bar">${seg(g.sitzt, 'var(--good)')}${seg(g.jung, 'var(--easy)')}${seg(g.lern, 'var(--hard)')}</div>`;
}
function viewStats() {
  const t = now();
  const logs = S.log;
  const days = {};
  for (const l of logs) { const k = dayKey(l[0]); (days[k] = days[k] || { n: 0, ok: 0, ms: 0 }); days[k].n++; if (isSrs(l)) { days[k].s = (days[k].s || 0) + 1; if (l[2] >= 2) days[k].ok++; } days[k].ms += l[4] * 100; }
  // Streak
  let streak = 0, d0 = dayStart();
  if (!days[dayKey(d0 + HOUR)]) d0 -= DAY;            // heute noch nichts gemacht → ab gestern zählen
  for (let d = d0; days[dayKey(d + HOUR)] && streak < 999; d -= DAY) streak++;
  const totalMin = Math.round(logs.reduce((a, l) => a + l[4], 0) / 600);
  const rev = logs.filter(l => l[3] === 2 && isSrs(l));
  const retention = rev.length ? rev.filter(l => l[2] >= 2).length / rev.length : null;
  const sitzt = CARDS.filter(c => { const x = S.cards[c.id]; return x && x.st === 2 && x.S >= 21; }).length;

  // Prognose 14 Tage
  const fc = []; for (let i = 0; i < 14; i++) { const a = dayStart() + i * DAY, b = a + DAY; fc.push(CARDS.filter(c => { const x = S.cards[c.id]; return x && x.st && !x.susp && x.due < b && (i === 0 || x.due >= a); }).length); }
  // Heatmap 18 Wochen
  const weeks = 18, start = dayStart() - ((new Date(dayStart()).getDay() + 6) % 7) * DAY - (weeks - 1) * 7 * DAY;
  let heat = '';
  const maxN = Math.max(1, ...Object.values(days).map(d => d.n));
  for (let i = 0; i < weeks * 7; i++) {
    const d = start + i * DAY; const k = dayKey(d + HOUR); const n = days[k]?.n || 0;
    const a = n ? 0.25 + 0.75 * n / maxN : 0;
    heat += `<i title="${k}: ${n}" style="${n ? `background:color-mix(in srgb,var(--good) ${Math.round(a * 100)}%,var(--line))` : ''}${d > t ? ';opacity:.3' : ''}"></i>`;
  }
  // Genauigkeit letzte 21 Tage
  const acc = []; for (let i = 20; i >= 0; i--) { const k = dayKey(dayStart() - i * DAY + HOUR); acc.push(days[k] && days[k].s ? days[k].ok / days[k].s : null); }

  const byChap = groupStats(c => c.chap, CHAP_KEYS);
  const byPrio = groupStats(c => prioOf(c), [5, 4, 3, 2, 1]);
  const byKind = groupStats(kindKey, KINDS);
  const problem = CARDS.filter(c => S.cards[c.id] && S.cards[c.id].st)
    .map(c => ({ c, x: S.cards[c.id] }))
    .sort((a, b) => ((b.x.lapses || 0) * 2 + (b.x.qBad || 0) + (b.x.D || 0) / 3) - ((a.x.lapses || 0) * 2 + (a.x.qBad || 0) + (a.x.D || 0) / 3))
    .filter(o => (o.x.lapses || 0) + (o.x.qBad || 0) > 0).slice(0, 10);
  const plan = planText();
  const grp = (title, arr, lbl) => `<div class="card"><h3>${title}</h3>
    <table class="t">${arr.map(g => `<tr><td style="width:40%">${lbl(g.k)}</td><td>${stackBar(g)}</td><td class="num muted" style="width:52px">${g.r == null ? '–' : Math.round(g.r * 100) + '%'}</td></tr>`).join('')}</table></div>`;
  return `
  ${trackHTML()}
  ${masteryChart()}
  <div class="grid g2">
    ${(() => { const ss = standShare(); return `
    <div class="card kpi"><div class="l">Sicher beherrscht</div><div class="v">${Math.round(ss.pSafe * 100)}%<span class="of"> · ${ss.safe} / ${ss.N}</span></div></div>
    <div class="card kpi"><div class="l">Eingeführt</div><div class="v">${Math.round(ss.pIntro * 100)}%<span class="of"> · ${ss.intro} / ${ss.N}</span></div></div>`; })()}
    <div class="card kpi"><div class="l">Gewusst</div><div class="v">${retention == null ? '–' : Math.round(retention * 100) + '%'}</div></div>
    <div class="card kpi"><div class="l">Serie</div><div class="v">${streak}<span class="of"> Tage</span></div></div>
  </div>
  <h2>Nächste 14 Tage</h2>
  <div class="card">${barChart(fc, i => i === 0 ? 'heute' : fmtDate(dayStart() + i * DAY).replace('.', ''))}</div>
  <h2>Kapitel</h2>
  ${UI.group(byChap.map(g => `<div class="ir chr"><span class="ir-l"><b>${esc((window.CHAPTERS || {})[g.k] || '')}</b></span><span class="ir-r chb"><div class="bar"><span style="width:${g.n ? (g.n - g.neu) / g.n * 100 : 0}%;background:var(--accent)"></span></div></span></div>`))}
  <details class="more"><summary>Details</summary>
    <h2>Plan</h2>${plan}
    ${problem.length ? `<h2>Schwierige Karten</h2>${UI.group(problem.map(o => liHTML(o.c)))}` : ''}
    <h2>Nach Priorität</h2>${UI.group(byPrio.map(g => `<div class="ir chr"><span class="ir-l"><b>${PRIO[g.k].name}</b><small>${g.n - g.neu} von ${g.n}</small></span><span class="ir-r chb">${stackBar(g)}</span></div>`))}
    ${memoryStatsHTML()}
    <h2>Aktivität</h2>
    <div class="card"><div class="heat">${heat}</div><h3 style="margin-top:18px">Gewusst, letzte 21 Tage</h3>${lineChart(acc)}</div>
    ${timeStatsHTML()}
  </details>`;
}
function memoryStatsHTML() {
  const { reviews, timeline } = Replay.run();
  const K = Calib.k();
  // Verlauf der gewichteten Abrufwahrscheinlichkeit, letzte 30 Tage
  const hist = [], intro = [];
  const ws = c => PRIO[prioOf(c)].w;
  const wsum = CARDS.filter(c => prioOf(c) > 1 || S.settings.includeRand).reduce((a, c) => a + ws(c), 0);
  for (let i = 29; i >= 0; i--) {
    const te = dayStart() - i * DAY + DAY - 1;
    let acc = 0, n = 0;
    for (const c of CARDS) {
      if (prioOf(c) === 1 && !S.settings.includeRand) continue;
      const tl = timeline[c.id]; if (!tl) continue;
      let st = null; for (const e of tl) { if (e.t <= te) st = e; else break; }
      if (!st || !st.S) continue;
      n++; acc += ws(c) * FSRS.R(Math.max(0, (te - st.last) / DAY), st.S * K);
    }
    hist.push(wsum ? acc / wsum : 0); intro.push(n);
  }
  // Kalibrierung: vorhergesagt vs. tatsächlich
  const bins = [[0, .7], [.7, .8], [.8, .9], [.9, .95], [.95, 1.01]];
  const cal = bins.map(([a, b]) => {
    const r = reviews.filter(v => { const p = FSRS.R(v.el, v.S * K); return p >= a && p < b; });
    return { a, b, n: r.length, pred: r.length ? r.reduce((s2, v) => s2 + FSRS.R(v.el, v.S * K), 0) / r.length : null, act: r.length ? r.filter(v => v.ok).length / r.length : null };
  });
  // Behaltensquote je Priorität vs. Ziel
  const byP = [5, 4, 3, 2, 1].map(p => { const r = reviews.filter(v => v.prio === p); return { p, n: r.length, act: r.length ? r.filter(v => v.ok).length / r.length : null }; });
  // Stabilitätsverteilung
  const sb = [['< 1 T', 0, 1], ['1–7 T', 1, 7], ['1–3 Wo', 7, 21], ['3–8 Wo', 21, 60], ['> 2 Mt', 60, 1e9]];
  const stab = sb.map(([l, a, b]) => CARDS.filter(c => { const x = S.cards[c.id]; const v = x && x.st ? x.S * K : null; return v != null && v >= a && v < b; }).length);
  const pct = v => v == null ? '–' : Math.round(v * 100) + '%';
  return `<h2>Gedächtnis & Algorithmus</h2>
  <div class="card"><h3>Abrufbarer Stoff, letzte 30 Tage</h3>${lineChart(hist.map(v => v || null), { min: 0, label0: 'vor 29 T' })}
    <div class="muted small">Gewichtet nach Priorität, neue Karten zählen als 0.</div></div>
  <div class="grid cols2" style="margin-top:12px">
    <div class="card"><h3>Kalibrierung: stimmt die Vorhersage?</h3>
      <table class="t"><tr><th>vorhergesagt</th><th class="num">Ø vorhergesagt</th><th class="num">tatsächlich</th><th class="num">n</th></tr>
      ${cal.map(b => `<tr><td>${Math.round(b.a * 100)}–${Math.min(100, Math.round(b.b * 100))} %</td><td class="num">${pct(b.pred)}</td><td class="num" style="${b.n >= 10 && Math.abs(b.act - b.pred) > .08 ? 'color:var(--again);font-weight:700' : ''}">${pct(b.act)}</td><td class="num">${b.n}</td></tr>`).join('')}</table>
      <div class="muted small" style="margin-top:10px">Modell: FSRS-6 · ${esc(Model.status())}${!Model.personal() && Calib._n >= 40 ? ` · Faktor ${K.toFixed(2)}` : ''}</div></div>
    <div class="card"><h3>Behaltensquote je Priorität</h3>
      <table class="t"><tr><th></th><th class="num">Ziel</th><th class="num">erreicht</th><th class="num">n</th></tr>
      ${byP.map(b => `<tr><td><span class="dot" style="background:${PRIO[b.p].color}"></span> ${PRIO[b.p].name}</td><td class="num">${Math.round(PRIO[b.p].ret * 100)}%</td><td class="num" style="${b.n >= 15 && b.act < PRIO[b.p].ret - .05 ? 'color:var(--again);font-weight:700' : ''}">${pct(b.act)}</td><td class="num">${b.n}</td></tr>`).join('')}</table>
      <h3 style="margin-top:14px">Stabilität der eingeführten Karten</h3>
      ${barChart(stab, i => sb[i][0])}
      <div class="muted small">Zeit, bis eine Karte auf 90 % fällt.</div></div>
  </div>`;
}
function timeStatsHTML() {
  const L = S.log.filter(l => modeOf(l) !== 'q');
  if (!L.length) return `<h2>Lernzeit</h2><div class="card small muted">Erscheint nach der ersten Bewertung.</div>`;
  const sec = arr => arr.reduce((a, l) => a + l[4], 0) / 10;
  const d0 = dayStart();
  const today = sec(S.log.filter(l => l[0] >= d0)), week = sec(S.log.filter(l => l[0] >= d0 - 6 * DAY)), all = sec(S.log);
  const timed = L.filter(l => l[6] != null);
  const avg = (arr, i) => arr.length ? arr.reduce((a, l) => a + l[i], 0) / 10 / arr.length : null;
  // Minuten pro Tag, letzte 14 Tage
  const mins = []; for (let i = 13; i >= 0; i--) { const a = d0 - i * DAY; mins.push(Math.round(sec(S.log.filter(l => l[0] >= a && l[0] < a + DAY)) / 60)); }
  // Sitzungen (Pause > 10 Min trennt)
  const sess = []; let cur = null;
  for (const l of S.log) { if (!cur || l[0] - cur.end > 10 * MIN) { cur = { start: l[0] - l[4] * 100, end: l[0], n: 0, act: 0 }; sess.push(cur); } cur.end = l[0]; cur.n++; cur.act += l[4] / 10; }
  const sess30 = sess.filter(x => x.end > now() - 30 * DAY);
  // nach Typ / Priorität
  const grp = (keyFn, keys, lbl) => keys.map(k => {
    const a = timed.filter(l => BY_ID[l[1]] && keyFn(BY_ID[l[1]]) === k);
    const srs = a.filter(l => l[3] === 2);
    return a.length ? `<tr><td>${lbl(k)}</td><td class="num">${fmtSec(avg(a, 6))}</td><td class="num">${fmtSec(avg(a, 7))}</td><td class="num">${srs.length ? Math.round(srs.filter(l => l[2] >= 2).length / srs.length * 100) + '%' : '–'}</td><td class="num">${a.length}</td></tr>` : '';
  }).join('');
  const kindL = Object.fromEntries(KINDS.map(k => [k, KIND_PLURAL[k]]));
  // Denkzeit nach Bewertung
  const byRate = [1, 2, 3, 4].map(g => { const a = timed.filter(l => l[2] === g && l[3] === 2); return a.length ? `<tr><td>${['', 'Nochmal', 'Schwer', 'Gut', 'Einfach'][g]}</td><td class="num">${fmtSec(avg(a, 6))}</td><td class="num">${a.length}</td></tr>` : ''; }).join('');
  // Tageszeit
  const slots = [['Morgen (5–11)', 5, 11], ['Mittag (11–14)', 11, 14], ['Nachmittag (14–18)', 14, 18], ['Abend (18–22)', 18, 22], ['Nacht (22–5)', 22, 29]];
  const bySlot = slots.map(([n, a, b]) => { const r = L.filter(l => { let h = new Date(l[0]).getHours(); if (h < 5) h += 24; return h >= a && h < b && l[3] === 2; }); return r.length >= 5 ? `<tr><td>${n}</td><td class="num">${Math.round(r.filter(l => l[2] >= 2).length / r.length * 100)}%</td><td class="num">${fmtSec(avg(r.filter(l => l[6] != null), 6) || 0)}</td><td class="num">${r.length}</td></tr>` : ''; }).join('');
  // Zeitfresser
  const per = {}; for (const l of L) { (per[l[1]] = per[l[1]] || { t: 0, n: 0 }); per[l[1]].t += l[4] / 10; per[l[1]].n++; }
  const hogs = Object.entries(per).filter(([id]) => BY_ID[id]).sort((a, b) => b[1].t - a[1].t).slice(0, 8);
  return `<h2>Lernzeit</h2>
  <div class="grid g4">
    <div class="card kpi"><div class="l">Heute</div><div class="v">${Math.round(today / 60)}<span class="muted" style="font-size:15px"> Min</span></div></div>
    <div class="card kpi"><div class="l">Letzte 7 Tage</div><div class="v">${Math.round(week / 60)}<span class="muted" style="font-size:15px"> Min</span></div><div class="s">Ø ${Math.round(week / 60 / 7)} Min/Tag</div></div>
    <div class="card kpi"><div class="l">Gesamt</div><div class="v">${(all / 3600).toFixed(1)}<span class="muted" style="font-size:15px"> Std</span></div></div>
    <div class="card kpi"><div class="l">Ø pro Karte</div><div class="v" style="font-size:20px">${fmtSec(avg(timed, 6) || 0)} + ${fmtSec(avg(timed, 7) || 0)}</div><div class="s">Denkzeit + Prüfzeit</div></div>
  </div>
  <div class="card" style="margin-top:12px"><h3>Minuten pro Tag (14 Tage)</h3>${barChart(mins, i => i === 13 ? 'heute' : fmtDate(d0 - (13 - i) * DAY).replace('.', ''))}
    <div class="muted small">${sess30.length} Sitzungen in 30 Tagen · Ø ${sess30.length ? Math.round(sess30.reduce((a, x) => a + x.act, 0) / sess30.length / 60) : 0} Min · Ø ${sess30.length ? Math.round(sess30.reduce((a, x) => a + x.n, 0) / sess30.length) : 0} Karten</div></div>
  <div class="card" style="margin-top:12px"><h3>Zeit nach Typ</h3>
    <table class="t"><tr><th></th><th class="num">Ø Denken</th><th class="num">Ø Prüfen</th><th class="num">gewusst</th><th class="num">n</th></tr>${grp(c => c.kind === 'Theorem' ? 'Satz' : c.kind, Object.keys(kindL), k => kindL[k])}</table>
    <h3 style="margin-top:14px">Zeit nach Priorität</h3>
    <table class="t"><tr><th></th><th class="num">Ø Denken</th><th class="num">Ø Prüfen</th><th class="num">gewusst</th><th class="num">n</th></tr>${grp(c => prioOf(c), [5, 4, 3, 2, 1], k => PRIO[k].name)}</table>
</div>
  ${byRate ? `<div class="card" style="margin-top:12px"><h3>Denkzeit nach Bewertung</h3><table class="t"><tr><th></th><th class="num">Ø Denkzeit</th><th class="num">n</th></tr>${byRate}</table>
</div>` : ''}
  ${bySlot ? `<div class="card" style="margin-top:12px"><h3>Tageszeit</h3><table class="t"><tr><th></th><th class="num">gewusst</th><th class="num">Ø Denken</th><th class="num">n</th></tr>${bySlot}</table>
</div>` : ''}
  <div class="card" style="margin-top:12px;padding:4px 12px"><h3 style="margin:14px 4px 4px">Meiste Lernzeit</h3>
    <div class="list">${hogs.map(([id, v]) => { const c = BY_ID[id]; return `<div class="li" data-card="${id}">${kindTag(c)}<div class="t"><b>${esc(c.title)}</b><div class="m">${v.n}× · Ø ${fmtSec(v.t / v.n)}</div></div><span class="pill gray">${fmtSec(v.t)}</span></div>`; }).join('')}</div></div>`;
}
function planText() {
  const dte = daysToExam();
  const remaining = eligibleNew(true);
  const rem5 = remaining.filter(c => prioOf(c) === 5).length, rem4 = remaining.filter(c => prioOf(c) === 4).length;
  const npd = plannedNewPerDay();
  const intro7 = CARDS.filter(c => { const x = S.cards[c.id]; return x && x.intro && x.intro > now() - 7 * DAY; }).length;
  const pace = intro7 / 7;
  const finish = pace > 0 ? now() + remaining.length / pace * DAY : null;
  const late = finish && finish > examTime() - 14 * DAY;
  const load7 = []; for (let i = 0; i < 7; i++) { const a = dayStart() + i * DAY; load7.push(CARDS.filter(c => { const x = S.cards[c.id]; return x && x.st && x.due < a + DAY && (i === 0 || x.due >= a); }).length); }
  const rev7 = load7.reduce((a, b) => a + b, 0);
  return UI.group([
    UI.item('calendar', '#ff375f', new Date(examTime()).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' }), dte > 0 ? `in ${dte} Tagen` : 'vorbei'),
    remaining.length
      ? UI.item('cards', '#0a84ff', `${remaining.length} Karten noch neu`, `${rem5} Kern · ${rem4} Wichtig`, `<span class="v">${npd} pro Tag</span>`)
      : UI.item('check', '#30a46c', 'Alle Karten eingeführt', 'Jetzt zählen nur noch die Wiederholungen.'),
    remaining.length && pace > 0 ? UI.item('bolt', late ? '#ff453a' : '#30a46c', late ? 'Tempo zu langsam' : 'Tempo reicht', `Bisher ${pace.toFixed(1)} pro Tag, fertig am ${fmtDate(finish)}`) : '',
    UI.item('clock', '#5e5ce6', `${rev7} Wiederholungen`, 'in den nächsten 7 Tagen', `<span class="v">≈ ${Math.round(rev7 * 25 / 60 / 7)} Min/Tag</span>`),
  ]);
}
function barChart(vals, lbl, hi = 0) {
  const W = 420, H = 150, pad = 10, bw = (W - pad) / vals.length, max = Math.max(1, ...vals), gap = vals.length > 14 ? 2 : 6;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" role="img">${vals.map((v, i) => {
    const h = v / max * (H - 40); const x = pad + i * bw + gap / 2, y = H - 20 - h;
    return `<rect x="${x}" y="${y}" width="${bw - gap}" height="${h}" rx="${gap > 2 ? 3 : 1.5}" fill="${i === hi ? 'var(--accent)' : 'color-mix(in srgb,var(--accent) 55%,transparent)'}"/>
      <text x="${x + (bw - gap) / 2}" y="${y - 4}" text-anchor="middle">${(vals.length <= 14 || i === hi || v === max) && v ? v : ''}</text>
      ${(vals.length <= 7 || i % 2 === 0) ? `<text x="${x + (bw - gap) / 2}" y="${H - 6}" text-anchor="middle">${lbl(i)}</text>` : ''}`;
  }).join('')}</svg>`;
}
/* ---------- Prognose: Simulation statt Gerade ----------
 * Simuliert jeden kommenden Tag bis zur Prüfung mit dem echten Algorithmus:
 * neue Karten nach Tagesplan (bzw. nach deinem bisherigen Tempo), fällige
 * Wiederholungen mit Erfolgswahrscheinlichkeit R(t, S), Neu-Lernen bei Fehlern.
 * Mittel aus mehreren Durchläufen. «Sicher beherrscht» siehe isSafe. */
const MASTER_S = 21;
// sicher = Stabilität ≥ 21 Tage – oder schon einmal so weit gewesen, nach einem Aussetzer
// neu gelernt und seither wieder bestätigt (Stabilität ≥ 7 Tage)
const isSafe = (x, ever) => x.st === 2 && (x.S >= MASTER_S || (ever && x.S >= 7));
const Forecast = {
  _key: '', _res: null,
  rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; },
  pFail(id) {
    const d = Community.data && Community.data.cards && Community.data.cards[id];
    return d && d[1] >= 5 ? clamp(d[2], 0.05, 0.9) : 0.3;
  },
  pace() {
    const created = S.created || (S.log[0] && S.log[0][0]) || now();
    const span = clamp((now() - Math.max(created, now() - 14 * DAY)) / DAY, 1, 14);
    return CARDS.filter(c => { const x = S.cards[c.id]; return x && x.intro && x.intro > now() - span * DAY; }).length / span;
  },
  history() {
    const tl = Replay.run().timeline, ev = [];
    for (const arr of Object.values(tl)) { let was = false, ever = false; for (const e of arr) { if (e.st === 2 && e.S >= MASTER_S) ever = true; const m = isSafe(e, ever); if (m !== was) { ev.push([e.t, m ? 1 : -1]); was = m; } } }
    ev.sort((a, b) => a[0] - b[0]);
    const first = S.log.length ? dayStart(S.log[0][0]) : dayStart();
    const out = []; let k = 0, n = 0;
    for (let d = first; d <= dayStart(); d += DAY) { const end = Math.min(d + DAY - 1, now()); while (k < ev.length && ev[k][0] <= end) n += ev[k++][1]; out.push({ t: d, v: n }); }
    return out;
  },
  simulate(mode, runs = 6, minNew = MIN_NEW(), start) {
    // mode 'soll': ab dem ersten Lerntag mit leerem Stand, als wäre von Anfang an der Tagesplan befolgt worden
    const soll = mode === 'soll';
    const exam = examTime(), d0 = soll && start ? dayStart(start) : dayStart(), nDays = Math.max(1, Math.ceil((dayStart(exam) - d0) / DAY));
    const pool0 = soll
      ? CARDS.filter(c => !(S.cards[c.id] || {}).susp && (prioOf(c) !== 1 || S.settings.includeRand)).sort((a, b) => (prioOf(b) - prioOf(a)) || (a.ord - b.ord)).map(c => c.id)
      : eligibleNew(true).map(c => c.id);
    const manual = S.settings.newMode === 'manual';
    const pace = this.pace();
    const mastered = new Array(nDays + 1).fill(0), reviews = new Array(nDays + 1).fill(0), intro = new Array(nDays + 1).fill(0);
    // wie capDue: letzte Wiederholung in den letzten 1–5 Tagen vor der Prüfung, aber nur einmal
    const capT = (id, due, t) => capDue(id, due, t);
    for (let run = 0; run < runs; run++) {
      const rand = this.rng(1234 + run * 7919);
      const st = {}, ever = {};
      if (!soll) for (const c of CARDS) { const x = S.cards[c.id]; if (x && x.st && !x.susp) st[c.id] = { ...x }; }
      const pool = pool0.slice(); let carry = 0;
      for (let d = 0; d <= nDays; d++) {
        const t = d0 + d * DAY + 18 * HOUR, end = d0 + (d + 1) * DAY;
        // Wiederholungen
        let nRev = 0;
        for (const id in st) {
          let x = st[id];
          if (x.due >= end) continue;
          const c = BY_ID[id];
          if (x.st === 2) {
            const r = FSRS.R(Math.max(0, (t - x.last) / DAY), x.S);
            x = schedule(c, x, rand() < r ? 3 : 1, t, { replay: true }); nRev++;
          }
          for (let k = 0; k < 4 && x.st !== 2; k++) x = schedule(c, x, 3, t + (k + 1) * 10 * MIN, { replay: true });
          x.due = capT(id, x.due, t); st[id] = x;
        }
        // neue Karten
        let n;
        const rule = (rem, revs) => {
          const days = Math.max(1, Math.ceil((exam - TRACK_BUFFER * DAY - t) / DAY));
          let k = Math.max(minNew, Math.ceil(rem / (days * 0.85)));
          if (revs < 25) k = Math.max(k, 20); else if (revs < 50) k = Math.max(k, 16);
          return Math.min(k, 40);
        };
        if (mode === 'pace') { if (d > 0) { carry += pace; n = Math.floor(carry); carry -= n; } else n = 0; }
        else if (soll) n = manual ? S.settings.newPerDay : rule(pool.length, nRev);
        else if (manual) n = d === 0 ? Math.max(0, S.settings.newPerDay - newIntroducedToday()) : S.settings.newPerDay;
        else n = d === 0 ? Math.max(0, rule(pool.length + newIntroducedToday(), nRev) - newIntroducedToday()) : rule(pool.length, nRev);
        n = Math.min(n, pool.length);
        for (let k = 0; k < n; k++) {
          const id = pool.shift(), c = BY_ID[id];
          let x = schedule(c, { st: 0 }, rand() < this.pFail(id) ? 1 : 3, t, { replay: true });
          for (let j = 0; j < 4 && x.st !== 2; j++) x = schedule(c, x, 3, t + (j + 1) * 10 * MIN, { replay: true });
          x.due = capT(id, x.due, t); st[id] = x;
        }
        let m = 0; for (const id in st) { const x = st[id]; if (x.st === 2 && x.S >= MASTER_S) ever[id] = 1; if (isSafe(x, ever[id])) m++; }
        mastered[d] += m / runs; reviews[d] += nRev / runs; intro[d] += n / runs;
      }
    }
    return mastered.map((v, d) => ({ t: d0 + d * DAY, v, rev: reviews[d], intro: intro[d] }));
  },
  /* kleinste Untergrenze neuer Karten pro Tag, mit der die Simulation das Ziel
   * (≥ 97 % sicher beherrscht 1 Monat vor der Prüfung) erreicht; einmal pro Tag berechnet */
  _nk: '', _need: MIN_NEW_BASE,
  /* Die Simulation braucht je nach Gerät 0.1–0.3 s. Damit nichts ruckelt (Start, Fachwechsel, nach jeder
   * Bewertung), wird das letzte Ergebnis sofort angezeigt (auch über Neuladen hinweg gespeichert) und die
   * Neuberechnung im Leerlauf nachgeholt – nie während einer Lernsitzung. */
  LS: 'lemmalab-fc2-' + FACH, _loaded: false, _pend: {},
  /* Kennung des Kartensatzes: ändert sich die Anzahl oder der Inhalt eines Fachs (z. B. neue Karten),
   * wird das gespeicherte Ergebnis verworfen statt mit der alten Kartenzahl angezeigt. */
  sig() { return this._sig || (this._sig = CARDS.length + '-' + hash(CARDS.map(c => c.id).join('|'))); },
  load() {
    if (this._loaded) return; this._loaded = true;
    try { localStorage.removeItem('lemmalab-fc-' + FACH); } catch (e) { }   // alte Version ohne Soll-Linie
    try { const o = JSON.parse(localStorage.getItem(this.LS) || 'null'); if (o && o.sig === this.sig()) { this._need = o.need; this._best = o.best; this._staleNeed = o.nk; this._res = o.res; this._staleKey = o.key; } } catch (e) { }
  },
  persist() { try { localStorage.setItem(this.LS, JSON.stringify({ sig: this.sig(), need: this._need, best: this._best, nk: this._nk || this._staleNeed, res: this._res, key: this._key || this._staleKey })); } catch (e) { } },
  later(what, fn) {
    if (this._pend[what]) return; this._pend[what] = true;
    const idle0 = window.requestIdleCallback || (f => setTimeout(f, 200));
    const idle = (f, o) => setTimeout(() => idle0(f, o), 1500);   // erst wenn die Seite steht
    const go = () => {
      if (session || quiz || document.querySelector('.modal')) { setTimeout(() => idle(go, { timeout: 2000 }), 3000); return; }
      this._pend[what] = false;
      const before = JSON.stringify([this._need, this._res && this._res.plan && this._res.plan.map(p => Math.round(p.v))]);
      fn(); this.persist();
      if (JSON.stringify([this._need, this._res && this._res.plan && this._res.plan.map(p => Math.round(p.v))]) !== before && (tab === 'heute' || tab === 'statistik') && !session && !quiz) render();
    };
    idle(go, { timeout: 2000 });
  },
  needKey() { return [this.sig(), dayKey(now()), S.settings.examDate, S.settings.includeRand, Model.ver, Math.floor(eligibleNew(true).length / 20)].join('|'); },
  needMin() {
    this.load();
    const key = this.needKey();
    if (key === this._nk) return this._need;
    if (this._staleNeed != null || this._nk) { this.later('need', () => this.computeNeed(this.needKey())); return this._need; }
    const r = this.computeNeed(key); this.persist(); return r;
  },
  computeNeed(key) {
    if (key === this._nk) return this._need;
    this._nk = key; this._need = MIN_NEW();
    const exam = examTime(), goal = exam - MASTER_BEFORE * DAY;
    if (!eligibleNew(true).length || goal <= now()) return this._need;
    const N = CARDS.filter(c => prioOf(c) !== 1 || S.settings.includeRand).length;
    // Ein Teil der Karten ist immer gerade frisch vergessen und wieder im Aufbau – 100 % gibt es nie.
    // Darum: kleinste Untergrenze, die (fast) so viel erreicht wie das Maximum von 40 pro Tag.
    const res = [MIN_NEW(), 16, 20, 28, 40].map(m => { const sim = this.simulate('plan', 4, m); let v = 0; for (const p of sim) if (p.t <= goal) v = p.v; return [m, v]; });
    const best = Math.max(...res.map(r => r[1])), tol = Math.max(3, N * 0.02);
    this._need = (res.find(r => r[1] >= best - tol) || res[0])[0];
    this._best = best;
    return this._need;
  },
  runKey() { return [this.sig(), S.log.length, Model.ver, S.settings.examDate, S.settings.newMode, S.settings.newPerDay, S.settings.includeRand, dayKey(now()), Object.keys(S.cards).length].join('|'); },
  run() {
    this.load();
    const key = this.runKey();
    if (key === this._key && this._res) return this._res;
    if (this._res && this._res.plan) { this.later('run', () => this.compute(this.runKey())); return this._res; }
    const r = this.compute(key); this.persist(); return r;
  },
  compute(key) {
    if (key === this._key && this._res) return this._res;
    this._key = key;
    if (this.needKey() !== this._nk) this.computeNeed(this.needKey());
    const hist = this.history();
    return (this._res = { hist, plan: this.simulate('plan', 6, this._need), pace: this.simulate('pace'),
      soll: this.simulate('soll', 4, this._need, hist.length ? hist[0].t : dayStart()) });
  },
};

function masteryChart() {
  const exam = examTime();
  if (exam <= now() + 3 * DAY) return '';
  const goal = exam - MASTER_BEFORE * DAY;
  const N = CARDS.filter(c => prioOf(c) !== 1 || S.settings.includeRand).length;
  const { hist, plan, pace, soll = plan } = Forecast.run();
  const t0 = hist.length ? hist[0].t : dayStart();
  const narrow = innerWidth < 600, W = narrow ? 360 : 600, H = narrow ? 210 : 250, L = narrow ? 30 : 38, R = narrow ? 10 : 16, T = 18, B = 30;
  const X = t => L + (t - t0) / Math.max(DAY, exam - t0) * (W - L - R);
  const Y = v => T + (1 - Math.min(v, N) / N) * (H - T - B);
  const path = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.t).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' ');
  const histPts = hist.length ? hist : [{ t: dayStart(), v: 0 }];
  const today = histPts[histPts.length - 1];
  // Prognose = Fortsetzung von «Bisher»: im bisherigen Tempo (ab 3 Lerntagen), sonst nach Tagesplan
  const usePace = hist.length >= 3;
  const proj = usePace ? pace : plan;
  const projPts = [today, ...proj.slice(1)];
  const area = `${path(histPts)} L${X(today.t).toFixed(1)} ${Y(0)} L${X(histPts[0].t).toFixed(1)} ${Y(0)} Z`;
  const atGoal = arr => { let best = arr[0]; for (const p of arr) if (p.t <= goal) best = p; return Math.round(best.v); };
  const projGoal = atGoal(proj), sollGoal = atGoal(soll), planGoal = atGoal(plan);
  const atExam = Math.round((proj.filter(p => p.t < dayStart(exam)).pop() || proj[proj.length - 1]).v);
  const months = []; { const d = new Date(t0); d.setDate(1); d.setMonth(d.getMonth() + 1); for (; d.getTime() < exam; d.setMonth(d.getMonth() + 1)) months.push(d.getTime()); }
  const fmt = (t, o = { day: 'numeric', month: 'short' }) => new Date(t).toLocaleDateString('de-CH', o);
  const grid = [0, 0.25, 0.5, 0.75, 1].map(f => `<line x1="${L}" x2="${W - R}" y1="${Y(N * f)}" y2="${Y(N * f)}" class="g${f === 1 ? ' top' : ''}"/>${f % 0.5 === 0 ? `<text x="${L - 8}" y="${Y(N * f) + 4}" text-anchor="end">${Math.round(N * f)}</text>` : ''}`).join('');
  const mLines = months.map(m => `<text x="${X(m)}" y="${H - 9}" text-anchor="middle">${fmt(m, { month: 'short' })}</text><line x1="${X(m)}" x2="${X(m)}" y1="${H - B}" y2="${H - B + 4}" class="g"/>`).join('');
  const data = { t0, exam, N, L, R, W, H, T, B, hist: histPts.map(p => [p.t, Math.round(p.v)]), proj: proj.map(p => [p.t, Math.round(p.v), Math.round(p.rev)]), soll: soll.map(p => [p.t, Math.round(p.v)]) };
  // Wiederholungen pro Tag (Prognose)
  const revMax = Math.max(10, ...proj.map(p => p.rev));
  const bw = (W - L - R) / Math.max(1, (exam - t0) / DAY);
  const bars = proj.map(p => { const h = p.rev / revMax * 54; return `<rect x="${(X(p.t) - bw * 0.35).toFixed(1)}" y="${(60 - h).toFixed(1)}" width="${Math.max(1.2, bw * 0.7).toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(2, bw * 0.3).toFixed(1)}"/>`; }).join('');
  const peak = proj.reduce((a, p) => p.rev > a.rev ? p : a, proj[0]);
  const tol = Math.max(3, N * 0.05);   // Simulation streut etwa so stark
  const ok = projGoal >= sollGoal - tol;
  const status = ok ? `Auf Kurs · Soll ${sollGoal}`
    : `Unter dem Soll (${sollGoal})${usePace && planGoal > projGoal + tol ? ` · mit dem Tagesplan ${planGoal}` : ''}`;
  return `<h2>Prognose</h2>
  <div class="card fcard">
    <div class="fhead">
      <div><div class="fk">Am ${fmt(goal, { day: 'numeric', month: 'long' })} voraussichtlich sicher beherrscht</div>
        <div class="fv">${projGoal}<span> von ${N}</span></div>
        <div class="fs" style="color:${ok ? 'var(--good)' : 'var(--hard)'}">${status}</div></div>
    </div>
    <div class="fwrap" data-fc='${JSON.stringify(data)}'>
      <svg class="fchart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Soll und Prognose der sicher beherrschten Karten">
        <defs><linearGradient id="fgA" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
        <rect x="${X(goal)}" y="${T}" width="${Math.max(0, X(exam) - X(goal))}" height="${H - T - B}" class="gz"/>
        <text x="${(X(goal) + X(exam)) / 2}" y="${H - B - 9}" text-anchor="middle" class="gzl">Festigen</text>
        ${grid}${mLines}
        <path d="${area}" fill="url(#fgA)"/>
        <path d="${path(soll)}" class="lsoll"/>
        <path d="${path(projPts)}" class="lplan"/>
        <path d="${path(histPts)}" class="lhist"/>
        <circle cx="${X(today.t)}" cy="${Y(today.v)}" r="5" class="dot"/>
        <g class="scrub" style="display:none"><line class="sl" y1="${T}" y2="${H - B}"/><circle class="sc" r="4.5"/></g>
      </svg>
      <div class="ftip" style="display:none"></div>
    </div>
    <div class="flegend"><span><i class="lh"></i>Bisher</span><span><i class="lp"></i>Prognose${usePace ? ' (bisheriges Tempo)' : ' (Tagesplan)'}</span><span><i class="ls"></i>Soll</span></div>
    <div class="muted small fnote">Soll: so viele Karten sässen sicher, wenn du ab dem ersten Lerntag den Tagesplan befolgt hättest. Prognose: simuliert mit deinem Algorithmus und Lernverlauf${usePace ? ', neue Karten in deinem bisherigen Tempo' : ''}. Jede Karte kommt kurz vor dem Stichtag nochmals zur Kontrolle; was du dort vergisst, holst du in der Festigungsphase nach – bis zur Prüfung voraussichtlich ${atExam} von ${N}. Ganz 100&nbsp;% kann kein Gedächtnis garantieren.</div>
    <div class="fsub"><div class="fk2">Wiederholungen pro Tag</div><div class="fk3">Spitze ${Math.round(peak.rev)} am ${fmt(peak.t)}</div></div>
    <svg class="frev" viewBox="0 0 ${W} 64" width="100%" aria-hidden="true"><g transform="translate(0,0)">${bars}</g></svg>
  </div>`;
}
/* Antippen/Überfahren zeigt die Werte an diesem Tag (wie in der Health-App) */
document.addEventListener('pointermove', e => fcScrub(e), { passive: true });
document.addEventListener('pointerdown', e => fcScrub(e), { passive: true });
document.addEventListener('pointerleave', () => { document.querySelectorAll('.fwrap .scrub,.fwrap .ftip').forEach(el => el.style.display = 'none'); }, true);
function fcScrub(e) {
  const w = e.target.closest && e.target.closest('.fwrap');
  document.querySelectorAll('.fwrap').forEach(o => { if (o !== w) { o.querySelector('.scrub').style.display = 'none'; o.querySelector('.ftip').style.display = 'none'; } });
  if (!w) return;
  const d = w._d || (w._d = JSON.parse(w.dataset.fc));
  const svg = w.querySelector('svg'), r = svg.getBoundingClientRect();
  const sx = (e.clientX - r.left) / r.width * d.W;
  const t = d.t0 + clamp((sx - d.L) / (d.W - d.L - d.R), 0, 1) * (d.exam - d.t0);
  const near = arr => { let b = null; for (const p of arr) if (!b || Math.abs(p[0] - t) < Math.abs(b[0] - t)) b = p; return b; };
  const h = d.hist.length && t <= d.hist[d.hist.length - 1][0] + DAY / 2 ? near(d.hist) : null;
  const p = near(d.proj), so = d.soll && d.soll.length ? near(d.soll) : null;
  const pt = h || p;
  const X = tt => d.L + (tt - d.t0) / (d.exam - d.t0) * (d.W - d.L - d.R), Y = v => d.T + (1 - Math.min(v, d.N) / d.N) * (d.H - d.T - d.B);
  const g = w.querySelector('.scrub'); g.style.display = '';
  g.querySelector('.sl').setAttribute('x1', X(pt[0])); g.querySelector('.sl').setAttribute('x2', X(pt[0]));
  g.querySelector('.sc').setAttribute('cx', X(pt[0])); g.querySelector('.sc').setAttribute('cy', Y(pt[1]));
  const tip = w.querySelector('.ftip'); tip.style.display = '';
  tip.innerHTML = `<b>${new Date(pt[0]).toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short' })}</b><br>${h ? `Bisher: ${h[1]}` : `Prognose: ${p[1]}`}${so ? ` · Soll: ${so[1]}` : ''}${!h && p[2] != null ? `<br>${p[2]} Wiederholungen` : ''}`;
  const px = X(pt[0]) / d.W * r.width;
  tip.style.left = clamp(px - tip.offsetWidth / 2, 0, r.width - tip.offsetWidth) + 'px';
}

function lineChart(vals, o = {}) {
  const W = 420, H = 120, pad = 30, n = vals.length;
  const pts = vals.map((v, i) => v == null ? null : [pad + i * (W - pad - 6) / (n - 1), 10 + (1 - v) * (H - 30)]);
  let path = '', open = false;
  pts.forEach(p => { if (!p) { open = false; return; } path += (open ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); open = true; });
  const grid = (o.min === 0 ? [1, 0.75, 0.5, 0.25, 0] : [1, 0.75, 0.5]).map(g => `<line x1="${pad}" x2="${W}" y1="${10 + (1 - g) * (H - 30)}" y2="${10 + (1 - g) * (H - 30)}" stroke="var(--line)"/><text x="2" y="${13 + (1 - g) * (H - 30)}">${g * 100}%</text>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%">${grid}<path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2"/>${pts.map(p => p ? `<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="var(--accent)"/>` : '').join('')}<text x="${pad}" y="${H - 4}">${o.label0 || 'vor 20 T'}</text><text x="${W - 30}" y="${H - 4}">heute</text></svg>`;
}

/* ============================================================
 * Einstellungen
 * ============================================================ */
/* ---------- Bausteine im Stil der iOS-Einstellungen ---------- */
const ICON = {
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6" fill="#fff"/>',
  wave: '<path d="M3 13c2.5 0 2.5-6 5-6s2.5 10 5 10 2.5-8 5-8 1.5 4 3 4"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.2"/>',
  stack: '<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4M4 16l8 4 8-4"/>',
  brain: '<path d="M9 5a3 3 0 00-3 3 3 3 0 00-1 5.5A3 3 0 009 19h1V5z"/><path d="M15 5a3 3 0 013 3 3 3 0 011 5.5A3 3 0 0115 19h-1V5z"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  pencil: '<path d="M5 19l1-4L16 5l3 3L9 18z"/><path d="M14 7l3 3"/>',
  keyboard: '<rect x="3" y="7" width="18" height="11" rx="2.5"/><path d="M7 11h.01M11 11h.01M15 11h.01M8 15h8"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  cards: '<rect x="4" y="7" width="12" height="13" rx="2"/><path d="M8 4h10a2 2 0 012 2v11"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  match: '<path d="M4 7h7M4 12h7M4 17h7"/><path d="M15 7l5 5-5 5"/>',
  test: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 9h6M9 13h6M9 17h3"/>',
};
const icon = (name, color) => `<span class="ico" style="background:${color}"><svg viewBox="0 0 24 24">${ICON[name] || ''}</svg></span>`;
const UI = {
  item: (ic, color, title, sub = '', right = '', o = {}) => `<${o.act ? `button type="button" data-act="${o.act}"` : 'div'} class="ir ii${o.act ? ' ia' : ''}">${icon(ic, color)}<span class="ir-l"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>${right || o.act ? `<span class="ir-r">${right}${o.act ? '<svg class="chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1.5 1.5L6.5 7l-5 5.5"/></svg>' : ''}</span>` : ''}</${o.act ? 'button' : 'div'}>`,
  group: (rows, o = {}) => `<section class="ig">${o.header ? `<div class="ig-h">${o.header}</div>` : ''}<div class="ig-b">${rows.filter(Boolean).join('')}</div>${o.footer ? `<div class="ig-f">${o.footer}</div>` : ''}</section>`,
  row: (label, right = '', o = {}) => `<div class="ir${o.cls ? ' ' + o.cls : ''}"><span class="ir-l">${label}${o.sub ? `<small>${o.sub}</small>` : ''}</span><span class="ir-r">${right}</span></div>`,
  toggle: (id, on, label, sub) => `<label class="ir" for="${id}"><span class="ir-l">${label}${sub ? `<small>${sub}</small>` : ''}</span><span class="ir-r"><span class="sw"><input type="checkbox" role="switch" id="${id}" ${on ? 'checked' : ''}><i></i></span></span></label>`,
  select: (id, opts, cur) => `<span class="isel"><select id="${id}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><svg viewBox="0 0 10 16" aria-hidden="true"><path d="M2 6l3-3 3 3M2 10l3 3 3-3"/></svg></span>`,
  stepper: (id, val, min, max, step = 1, unit = '') => `<span class="stp" data-stp="${id}" data-min="${min}" data-max="${max}" data-step="${step}" data-unit="${unit}"><output>${val}${unit}</output><span class="stp-b"><button type="button" data-d="-1" aria-label="weniger">−</button><i></i><button type="button" data-d="1" aria-label="mehr">+</button></span><input type="hidden" id="${id}" value="${val}"></span>`,
  action: (label, act, o = {}) => `<button type="button" class="ir ia${o.danger ? ' danger' : ''}" data-act="${act}"><span class="ir-l">${label}</span>${o.chev ? '<span class="ir-r"><svg class="chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1.5 1.5L6.5 7l-5 5.5"/></svg></span>' : ''}</button>`,
};
document.addEventListener('click', e => {
  const b = e.target.closest('.stp button[data-d]'); if (!b) return;
  const w = b.closest('.stp'), inp = w.querySelector('input'), out = w.querySelector('output');
  const v = clamp((+inp.value || 0) + (+b.dataset.d) * (+w.dataset.step), +w.dataset.min, +w.dataset.max);
  inp.value = v; out.textContent = v + (w.dataset.unit || '');
  inp.dispatchEvent(new Event('change', { bubbles: true }));
});

function viewSettings() {
  const st = S.settings, pt = personalTimes();
  const fmtDateLong = d => { try { return new Date(d + 'T12:00').toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return d; } };
  return `<div class="settings">
  ${typeof accountSettingsHTML === 'function' ? accountSettingsHTML() : ''}

  ${typeof isAdmin === 'function' && isAdmin() ? Tune.html() : ''}

  ${UI.group([UI.item('cards', 'var(--accent)', esc(FACH_CFG.name), `${CARDS.length} Karten · ${esc(FACH_CFG.sub || '')}`, 'Wechseln', { act: 'fachpick' })],
    { header: 'Fach', footer: 'Jedes Fach hat eigene Karten, einen eigenen Lernplan und ein eigenes Prüfungsdatum. Der Fortschritt bleibt beim Wechseln erhalten.' })}

  ${UI.group(Object.keys(window.FAECHER || { [FACH]: FACH_CFG }).filter(k => !((window.FAECHER || {})[k] || {}).kind).map(k => {
    const F = (window.FAECHER || {})[k] || FACH_CFG;
    const o = k === FACH ? S : (window.FachStore && FachStore.read(k));
    const d = (o && o.settings && o.settings.examDate) || F.examDate;
    const set = !!(o && o.settings && o.settings.examSet);
    return UI.row(esc(F.name), `<span class="idate${set ? '' : ' prov'}"><span>${esc(fmtDateLong(d))}</span><input type="date" ${k === FACH ? 'id="sExam"' : `data-examfach="${k}"`} value="${esc(d)}" aria-label="Prüfungsdatum ${esc(F.name)}"></span>`);
  }), { header: 'Prüfungsdaten', footer: 'Grau = vorläufig der erste Tag der Prüfungssession. Trag das echte Datum ein, sobald du es kennst; der Lernplan des Fachs passt sich an.' })}

  ${UI.group([
    UI.row('Erscheinungsbild', UI.select('sTheme', [['auto', 'Automatisch'], ['light', 'Hell'], ['dark', 'Dunkel']], st.theme)),
  ])}

  <details class="more adv2"><summary>Erweitert</summary>
  ${UI.group([
    UI.row('Neue Karten', UI.select('sNewMode', [['auto', `Automatisch (${plannedNewPerDay()})`], ['manual', 'Manuell']], st.newMode)),
    st.newMode === 'manual' ? UI.row('Pro Tag', UI.stepper('sNew', st.newPerDay, 0, 80, 1)) : '',
  ], { header: 'Lernplan' })}

  ${UI.group([
    UI.row('Zeitbudget pro Tag', UI.stepper('sBudget', st.budget || 0, 0, 300, 5, ' Min')),
    UI.row('Max. Wiederholungen', UI.stepper('sMax', st.maxReviews, 20, 1000, 10)),
  ], { footer: `Mit Zeitbudget werden die neuen Karten so begrenzt, dass der Tag hineinpasst (0 = aus). ${pt.fromData ? `Gerechnet mit deinen Zeiten: Wiederholung ≈ ${Math.round(pt.review)} s, neue Karte ≈ ${Math.round(pt.newCost)} s.` : 'Bis genug Daten da sind, mit Standardwerten.'}` })}

  ${UI.group([
    UI.toggle('sCalib', st.calib !== false, 'Persönliches Modell', `<span id="trainStatus">${Trainer.running ? 'Training läuft …' : Model.status()}</span>`),
    UI.toggle('sCommunity', st.community !== false, 'Wissen aller Nutzer', Community.data && Community.data.n ? `Schwierigkeit von ${Community.data.n} Karten bekannt` : 'Schwierigkeit neuer Karten aus anonymen Daten'),
    UI.toggle('sRand', !!st.includeRand, 'Randstoff ebenfalls lernen'),
    UI.toggle('sFour', !!st.fourButtons, 'Vier Bewertungsstufen', 'Nochmal · Schwer · Gut · Einfach statt Wischen'),
    st.calib !== false && Trainer.count() >= Trainer.MIN ? UI.action(Trainer.running ? 'Training läuft …' : 'Modell jetzt neu trainieren', 'train') : '',
  ], { header: 'Algorithmus', footer: 'FSRS-6. Das persönliche Modell lernt aus deinen Wiederholungen und wird nur übernommen, wenn es deine neuesten Ergebnisse besser vorhersagt. Das Wissen aller Nutzer zeigt, welche Karten allgemein schwer sind.' })}

  ${UI.group([
    Object.keys(window.LOGIC || {}).length ? UI.toggle('sLogic', st.showLogic !== false, 'Prädikatenlogik anzeigen') : '',
    UI.toggle('sType', !!st.typeAnswer, 'Notizfeld vor dem Aufdecken'),
  ], { header: 'Karten & Darstellung' })}

  ${UI.group([
    UI.action('Export kopieren', 'export'),
    UI.action('Als Datei sichern', 'exportfile'),
    `<label class="ir ia"><span class="ir-l">Datei importieren</span><input type="file" id="impFile" accept=".json,application/json" class="hide"></label>`,
    UI.action('Export-Text einfügen', 'importpaste'),
    UI.action('Lerndaten als CSV', 'csv'),
  ], { header: 'Daten', footer: Sync.ok ? 'Dein Fortschritt wird automatisch gespeichert.' : 'Der Fortschritt liegt in deinem Konto bzw. in diesem Browser. Hier kannst du ihn zusätzlich sichern oder übertragen.' })}

  ${Sync.ok ? '' : `<details class="adv ig"><summary class="ig-h">Erweitert: Abgleich über GitHub-Gist</summary><div class="ig-b ig-pad">${gistSettingsHTML()}</div></details>`}

  ${UI.group([
    UI.item('stack', '#ff9f0a', 'Wichtiges zuerst', 'Erst Kern, dann Wichtig, dann der Rest.'),
    UI.item('brain', '#5e5ce6', 'Kurz vor dem Vergessen', 'Jede Karte kommt wieder, wenn es nötig ist.'),
    UI.item('calendar', '#ff375f', 'Bis zur Prüfung', 'Vorher kommt alles nochmals dran.'),
    UI.item('pencil', '#30a46c', 'Ehrlich bewerten', 'Nur nach rechts wischen, wenn alles stimmte.'),
  ], { header: 'So funktioniert LemmaLab' })}

  ${UI.group([
    typeof Cloud !== 'undefined' && Cloud.user ? UI.action('Jetzt abgleichen', 'cloudsync') : '',
    UI.action('Gesamten Fortschritt löschen', 'resetall', { danger: true }),
    typeof Cloud !== 'undefined' && Cloud.user ? UI.action('Konto-Daten löschen', 'clouddelete', { danger: true }) : '',
  ])}

  </details>

  ${UI.group([UI.action('Nach Update suchen', 'update'), `<a class="ir ia" href="datenschutz.html"><span class="ir-l">Datenschutz</span><span class="ir-r"><svg class="chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1.5 1.5L6.5 7l-5 5.5"/></svg></span></a>`])}
  <div class="ig-foot">LemmaLab ${APP_VERSION}<br>Inoffiziell, ohne Gewähr.</div>
  </div>`;
}

/* ============================================================
 * Modal, Toast, Theme
 * ============================================================ */
/* ---------- Fachwahl ---------- */
function fachSummary(id) {
  if (((window.FAECHER || {})[id] || {}).kind === 'beweise') {
    if (id === FACH && window.Beweise) return Beweise.summary();
    const st = window.FachStore ? FachStore.read(id) : null; const n = st && st.cards ? Object.values(st.cards).filter(x => x && x.st).length : 0;
    return n ? `${n} Beweis${n === 1 ? '' : 'e'} angefangen` : 'noch nicht begonnen';
  }
  const st = id === FACH ? S : (window.FachStore ? FachStore.read(id) : null);
  if (!st || !st.cards) return 'noch nicht begonnen';
  const n = Object.values(st.cards).filter(x => x && x.st).length;
  const ds = dayStart();
  const due = Object.values(st.cards).filter(x => x && x.st && !x.susp && x.due < ds + DAY).length;
  return n ? `${n} Karte${n === 1 ? "" : "n"} begonnen${due ? ` · ${due} heute fällig` : ''}` : 'noch nicht begonnen';
}
const FACH_COL = { ana1b: '#3a2bb5', ana1: '#3a2bb5', phy1: '#b4531f', inf1: '#1f7a5a', la: '#9b2c6e' };
// Eigene Symbole (einheitlicher Strich statt Schriftzeichen): Integral, Atom, Code, Matrix
const FACH_ICON = {"ana1b": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6 3.5h9l3.5 3.5v13.5H6z\"/><path d=\"M9 10h6M9 13.5h4\"/><rect x=\"13.2\" y=\"16\" width=\"3\" height=\"3\" fill=\"currentColor\" stroke=\"none\"/></svg>", "ana1": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path stroke-width=\"2.4\" d=\"M15.5 4.2c-.6-.8-1.5-1.2-2.4-1-1.3.3-1.8 1.6-2 3l-1.8 11.6c-.2 1.4-.8 2.7-2 3-.9.2-1.8-.2-2.4-1\"/></svg>", "phy1": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"1.6\" fill=\"currentColor\" stroke=\"none\"/><ellipse cx=\"12\" cy=\"12\" rx=\"9.5\" ry=\"3.8\"/><ellipse cx=\"12\" cy=\"12\" rx=\"9.5\" ry=\"3.8\" transform=\"rotate(60 12 12)\"/><ellipse cx=\"12\" cy=\"12\" rx=\"9.5\" ry=\"3.8\" transform=\"rotate(-60 12 12)\"/></svg>", "inf1": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15\"/></svg>", "la": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M7 3.5H4.5v17H7M17 3.5h2.5v17H17\"/><circle cx=\"9.5\" cy=\"8.5\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.5\" cy=\"8.5\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"9.5\" cy=\"15.5\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.5\" cy=\"15.5\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/></svg>"};
function fachPillHTML(extra) {
  // Fach-Umschalter im Stil von iOS (Liquid Glass): Kapsel mit Fach-Symbol, Name und Auf/Ab-Pfeil
  return `<button class="fachpill glass${extra ? ' ' + extra : ''}" data-act="fachpick" title="Fach wechseln" aria-haspopup="menu">
    <span class="fic" style="--c:${FACH_COL[FACH] || 'var(--accent)'}">${FACH_ICON[FACH] || '•'}</span><span class="fnm">${esc(FACH_CFG.kind === 'beweise' ? FACH_CFG.name + ' · Beweise' : FACH_CFG.name)}</span><svg class="chev" viewBox="0 0 12 16" aria-hidden="true"><path d="M3 6l3-3 3 3M3 10l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
}
function closeFachMenu() {
  const m = document.querySelector('.fachmenu-wrap'); if (!m) return;
  m.classList.add('out'); setTimeout(() => m.remove(), 160);
}
function fachPicker(anchor) {
  if (session || quiz) { toast('Zuerst die laufende Sitzung beenden'); return; }
  if (document.querySelector('.fachmenu-wrap')) { closeFachMenu(); return; }
  const F = window.FAECHER || {};
  const wrap = document.createElement('div'); wrap.className = 'fachmenu-wrap';
  const opt = ([id, f]) => `<button class="fachopt fmi${id === FACH ? ' on' : ''}" data-fach="${id}" role="menuitemradio" aria-checked="${id === FACH}">
      <span class="fic" style="--c:${FACH_COL[id] || 'var(--accent)'}">${FACH_ICON[id] || '•'}</span>
      <span class="ftx"><b>${esc(f.name)}</b><small>${esc(f.sub || '')}</small><small class="fst">${esc(fachSummary(id))}</small></span>
      <svg class="fck" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
  const E = Object.entries(F), kk = E.filter(([, f]) => !f.kind), bb = E.filter(([, f]) => f.kind === 'beweise');
  wrap.innerHTML = `<div class="fachmenu glass" role="menu"><div class="fmh">Karteikarten</div>${kk.map(opt).join('')}${bb.length ? `<div class="fmh">Beweise</div>${bb.map(opt).join('')}` : ''}</div>`;
  document.body.appendChild(wrap);
  const menu = wrap.firstChild;
  const r = (anchor || document.querySelector('.fachpill')).getBoundingClientRect();
  const W = Math.min(340, window.innerWidth - 24);
  const left = clamp(r.left, 12, window.innerWidth - W - 12);
  menu.style.width = W + 'px'; menu.style.left = left + 'px'; menu.style.top = (r.bottom + 8) + 'px';
  menu.style.transformOrigin = `${r.left + r.width / 2 - left}px -8px`;
  const mh = menu.offsetHeight;
  if (r.bottom + 8 + mh > window.innerHeight - 12) menu.style.top = Math.max(12, window.innerHeight - 12 - mh) + 'px';
  wrap.addEventListener('click', e => { if (!e.target.closest('.fachmenu')) closeFachMenu(); });
}
document.addEventListener('click', e => {
  const fp = e.target.closest('[data-act="fachpick"]');
  if (fp) { e.stopPropagation(); fachPicker(fp); return; }
  const b = e.target.closest('.fachopt[data-fach]'); if (!b) return;
  const id = b.dataset.fach;
  if (id === FACH) { closeFachMenu(); closeModal(); return; }
  try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (err) { }
  if (Sync.pending && Sync.pending.size) Sync.flush();
  if (Gist.dirty) Gist.push();
  const go2 = () => window.switchFach(id);
  if (typeof Cloud !== 'undefined' && Cloud.user && Cloud.dirty) { Cloud.sync().finally(go2); setTimeout(go2, 2500); } else go2();
}, true);

function modal(html) {
  closeModal();
  const m = document.createElement('div');
  m.className = 'modal'; m.id = 'modal';
  m.innerHTML = `<div class="sheet">${html}</div>`;
  m.addEventListener('click', e => { if (e.target === m) closeModal(); });
  document.body.appendChild(m);
}
function closeModal() {
  const m = $('#modal'); if (!m) return;
  if (Motion.reduced()) return m.remove();
  m.id = ''; m.classList.add('closing');
  setTimeout(() => m.remove(), 280);
}
let zoomW = (() => { try { return +localStorage.getItem('lemmalab-zoom') || Math.max(780, Math.round(window.innerWidth * 1.9)); } catch (e) { return 780; } })();
let toastT;
function toast(s) { const t = $('#toast'); t.textContent = s; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }
function applyTheme() {
  const r = document.documentElement;
  r.classList.toggle('dark', S.settings.theme === 'dark');
  r.classList.toggle('light', S.settings.theme === 'light');
}

/* ============================================================
 * Events
 * ============================================================ */
function afterRender() {
  if (tab === 'heute' && session && session.revealed && swipeMode()) Swipe.attach();
  if (tab === 'heute' && !session) {
    const idle = window.requestIdleCallback || (f => setTimeout(f, 300));
    idle(() => { try { Pre.ids(buildQueue().queue.slice(0, 6)); } catch (e) { } });
  }
  const on = (sel, ev, fn) => { const el = $(sel); if (el) el.addEventListener(ev, fn); };
  on('#cq', 'input', e => { cat.q = e.target.value; const pos = e.target.selectionStart; render(); const el = $('#cq'); el.focus(); el.setSelectionRange(pos, pos); });
  document.querySelectorAll('.seg [data-seg]').forEach(b => b.addEventListener('click', () => { cat.status = b.dataset.seg; render(); }));
  document.querySelectorAll('[data-unfilter]').forEach(b => b.addEventListener('click', () => { cat[b.dataset.unfilter] = ''; render(); }));
  const examCommit = (inp, apply) => {
    const lbl = inp.parentElement && inp.parentElement.querySelector('span');
    let tm = null;
    const run = () => { clearTimeout(tm); tm = null; if (inp.value && inp.value !== inp._done) { inp._done = inp.value; apply(inp.value); } };
    const upd = () => { if (lbl && inp.value) { lbl.textContent = fmtDateLong(inp.value); lbl.parentElement.classList.remove('prov'); } clearTimeout(tm); tm = setTimeout(run, 900); };
    inp._done = inp.value;
    inp.addEventListener('input', upd); inp.addEventListener('change', upd); inp.addEventListener('blur', run);
  };
  const fmtDateLong = d => { try { return new Date(d + 'T12:00').toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return d; } };
  document.querySelectorAll('input[data-examfach]').forEach(inp => examCommit(inp, v => {
    const k = inp.dataset.examfach; if (!v || !window.FachStore) return;
    let o = FachStore.read(k) || (typeof blankFor === 'function' ? blankFor(k) : { v: 1, cards: {}, log: [], settings: {} });
    o.settings = { ...(o.settings || {}), examDate: v, examSet: true, u: now() };
    FachStore.write(k, o);
    try { const all = JSON.parse(localStorage.getItem('lemmalab-track') || '{}'); if (all[k]) { all[k].exam = parseDate(v); localStorage.setItem('lemmalab-track', JSON.stringify(all)); } } catch (_) { }
    if (typeof Cloud !== 'undefined' && Cloud.user) { Cloud.lastSent = ''; Cloud.schedule(); }
  }));
  { const i = $('#sExam'); if (i) examCommit(i, v => { S.settings.examDate = v; S.settings.examSet = true; rescheduleForExam(); touchSettings(); }); }
  on('#sNewMode', 'change', e => { S.settings.newMode = e.target.value; touchSettings(); render(); });
  on('#sNew', 'change', e => { S.settings.newPerDay = clamp(+e.target.value || 0, 0, 80); touchSettings(); });
  on('#sBudget', 'change', e => { S.settings.budget = clamp(+e.target.value || 0, 0, 300); touchSettings(); });
  on('#sMax', 'change', e => { S.settings.maxReviews = clamp(+e.target.value || 200, 20, 1000); touchSettings(); });
  on('#sRand', 'change', e => { S.settings.includeRand = e.target.checked; touchSettings(); });
  on('#sCalib', 'change', e => { S.settings.calib = e.target.checked; Calib._len = -1; touchSettings(); Model.sync(); if (e.target.checked && Trainer.due()) Trainer.run(); render(); });
  on('#sCommunity', 'change', e => { S.settings.community = e.target.checked; touchSettings(); Model.sync(); if (e.target.checked) Community.refresh(true); render(); });
  on('#sLogic', 'change', e => { S.settings.showLogic = e.target.checked; touchSettings(); });
  on('#sFour', 'change', e => { S.settings.fourButtons = e.target.checked; touchSettings(); });
  on('#sType', 'change', e => { S.settings.typeAnswer = e.target.checked; touchSettings(); });
  on('#sTheme', 'change', e => { S.settings.theme = e.target.value; touchSettings(); render(); });
  on('#impFile', 'change', e => { const f = e.target.files[0]; if (f) f.text().then(importJSON); });
}
function touchSettings() { S.settings.u = now(); save(['settings']); }   // wie in iOS: Änderungen gelten sofort, ohne Meldung
function rescheduleForExam() {
  for (const c of CARDS) { const x = S.cards[c.id]; if (x && x.st === 2) { x.due = capDue(c.id, x.due); } }
}

document.addEventListener('click', e => {
  const t = e.target;
  const act = t.closest('[data-act]')?.dataset.act;
  const rateB = t.closest('[data-rate]');
  if (rateB) return rate(+rateB.dataset.rate);
  const trate = t.closest('[data-trate]');
  if (trate) return quizAnswer(+trate.dataset.trate);
  const opt = t.closest('[data-opt]');
  if (opt && !opt.disabled) return quizAnswer(opt.dataset.opt);
  // Antippen des Bildes vergrössert es (ganzes Bild, so gross wie der Bildschirm erlaubt); Antippen der Karte daneben dreht sie um
  if (t.closest('.lightbox')) return;
  const sw = t.closest('.scanwrap[data-zoom]');
  if (sw) { openLightbox(sw); return; }
  const fcard = t.closest('.fc');
  if (fcard && !act && !t.closest('button,a,summary,details,input,textarea,select,label,.zoomchip,.lf') && !(window.getSelection && String(window.getSelection()).length)) {
    if (tab === 'heute' && session && session.cur) return flip();
    if (tab === 'quiz' && quiz && quiz.type === 'test') return qFlip();
  }
  const z = null;
  if (z) { const c = BY_ID[z.dataset.zoom]; modal(`<div class="row"><b>${esc(c.kind)} ${c.nr}</b><div class="spacer"></div><button class="btn" data-act="zin">＋</button><button class="btn" data-act="zout">－</button><button class="btn ghost" data-act="close">✕</button></div><div class="zoombox"><img class="scan" id="zimg" src="img/${c.img}" alt="" style="width:${zoomW}px"></div><div class="muted small">Seitlich wischen zum Lesen · Tipp: Handy quer halten.</div>`); $('#modal').classList.add('full'); return; }
  const li = t.closest('[data-card]');
  if (li && !act) return openCard(li.dataset.card);
  const ca = t.closest('[data-cardact]');
  if (ca && ca.tagName === 'BUTTON') return cardAction(ca.dataset.cardact, ca.dataset.id);
  if (!act) return;
  if (act.startsWith('tab:')) { session = null; return go(act.slice(4)); }
  if (act.startsWith('cat:')) { const [, st, pr] = act.split(':'); cat = { q: '', chap: '', kind: '', prio: pr || '', status: st || '' }; return go('katalog'); }
  switch (act) {
    case 'start': startSession(); break;
    case 'train': if (!Trainer.running) { Trainer.run(); render(); } break;
    case 'extra': {
      const ids = eligibleNew().slice(0, 10).map(c => c.id);
      if (!ids.length) { toast('Keine neuen Karten mehr'); break; }
      startSession(ids); break;
    }
    case 'home': session = null; render(); break;
    case 'update': e.preventDefault(); checkUpdate(true); break;
    case 'ahead': startSession(aheadIds().slice(0, 20)); break;
    case 'forcelater': if (session) nextCard(true); break;
    case 'startforce': startSession(); if (session && !session.cur) nextCard(true); break;
    case 'weak': { const ids = weakIds().slice(0, 20); if (ids.length) startSession(ids); break; }
    case 'reveal': reveal(); break;
    case 'undo': undo(); break;
    case 'quizstart': startQuiz('match', 'intro', 15); break;
    case 'teststart': startQuiz('test', 'kern', 12); break;
    case 'quiznext': quizNext(); break;
    case 'qreveal': qReveal(); break;
    case 'quizend': quiz = null; render(); break;
    case 'learnwrong': { const ids = quiz.answers.filter(a => !a.ok).map(a => a.id); quiz = null; tab = 'heute'; startSession(ids); break; }
    case 'learnfiltered': { const ids = filteredCatalog().slice(0, 50).map(c => c.id); tab = 'heute'; startSession(ids); break; }
    case 'close': closeModal(); break;
    case 'zin': case 'zout': { zoomW = clamp(Math.round(zoomW * (act === 'zin' ? 1.25 : 0.8)), 300, 2400); const im = $('#zimg'); if (im) im.style.width = zoomW + 'px'; try { localStorage.setItem('lemmalab-zoom', zoomW); } catch (e) { } break; }
    case 'export': exportJSON(); break;
    case 'csv': exportCSV(); break;
    case 'gistconnect': { const v = ($('#gistTok') || {}).value || ''; if (v.trim().length < 20) { toast('Bitte gültigen Token einfügen'); break; } Gist.connect(v); break; }
    case 'gistoff': confirmBox('Abgleich auf diesem Gerät trennen? Der Fortschritt bleibt lokal und im Gist erhalten.', () => Gist.disconnect()); break;
    case 'gistsync': Gist.pull().then(() => Gist.push()); break;
    case 'exportfile': exportFile(); break;
    case 'tuneexport': Tune.exportFile(); break;
    case 'tunepaste': modal(`<h3>Korrektur einspielen</h3><p class="small muted">Korrektur-Text von Claude einfügen.</p><textarea class="note" id="tuneText" style="min-height:180px"></textarea><div class="row"><div class="spacer"></div><button class="btn" data-act="close">Abbrechen</button><button class="btn primary" id="tuneBtn">Einspielen</button></div>`); $('#tuneBtn').onclick = () => tuneImportText($('#tuneText').value); break;
    case 'tunereset': confirmBox('Alle Korrekturen entfernen? Danach gelten wieder Standard- bzw. persönlich trainierte Werte.', () => { Tune.reset(); toast('Korrekturen entfernt'); render(); }); break;
    case 'importpaste': importPaste(); break;
    case 'resetall': confirmBox('Wirklich den gesamten Fortschritt löschen? Das kann nicht rückgängig gemacht werden.', () => { const st = S.settings; S = blankState(); S.settings = st; S.settings.u = now(); S.settings.resetAt = now(); Sync.wroteOnce = false; save(); render(); toast('Zurückgesetzt'); }); break;
  }
});
document.addEventListener('toggle', e => {
  if (e.target.matches && e.target.matches('details.logic')) { const o = e.target.open; if ((S.settings.logicOpen !== false) !== o) { S.settings.logicOpen = o; S.settings.u = now(); save(['settings']); } }
}, true);
document.addEventListener('change', e => {
  const ca = e.target.closest('[data-cardact="prio"]');
  if (ca) { const x = cs(ca.dataset.id); const p = +ca.value; x.prio = p === BY_ID[ca.dataset.id].prio ? undefined : p; x.u = now(); save(['cards']); openCard(ca.dataset.id); render(); }
});
function cardAction(a, id) {
  const x = cs(id);
  if (a === 'flag') x.flag = !x.flag;
  else if (a === 'susp') x.susp = !x.susp;
  else if (a === 'now') { closeModal(); tab = 'heute'; startSession([id]); return; }
  else if (a === 'reset') { return confirmBox('Lernstand dieser Karte zurücksetzen?', () => { S.cards[id] = { st: 0, u: now(), flag: x.flag, prio: x.prio }; save(['cards']); openCard(id); render(); }); }
  x.u = now(); save(['cards']); openCard(id); render();
}
function confirmBox(msg, fn) {
  modal(`<p>${esc(msg)}</p><div class="row"><div class="spacer"></div><button class="btn" data-act="close">Abbrechen</button><button class="btn primary" id="okBtn" style="background:var(--again)">Ja</button></div>`);
  $('#okBtn').addEventListener('click', () => { closeModal(); fn(); });
}
document.addEventListener('keydown', e => {
  if (e.target.matches('input,textarea,select')) return;
  if (tab === 'heute' && session && session.cur) {
    if (e.key === ' ') { e.preventDefault(); flip(); }
    else if (e.key === 'Enter' && !session.revealed) { e.preventDefault(); reveal(); }
    else if (session.revealed && swipeMode() && (e.key === 'ArrowRight' || '234'.includes(e.key))) { e.preventDefault(); rate(3); }
    else if (session.revealed && swipeMode() && (e.key === 'ArrowLeft' || e.key === '1')) { e.preventDefault(); rate(1); }
    else if (session.revealed && '1234'.includes(e.key)) rate(+e.key);
    else if (e.key === 'u' || e.key === 'U') undo();
  } else if (tab === 'quiz' && quiz && quiz.i < quiz.items.length) {
    if (quiz.type === 'match') {
      if (!quiz.picked && '1234'.includes(e.key)) quizAnswer(quiz.opts[+e.key - 1]);
      else if (quiz.picked && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); quizNext(); }
    } else if (e.key === ' ') { e.preventDefault(); qFlip(); }
    else if (!quiz.revealed && e.key === 'Enter') { e.preventDefault(); qReveal(); }
    else if (quiz.revealed && '123'.includes(e.key)) quizAnswer(+e.key);
  }
  if (e.key === 'Escape' && document.querySelector('.fachmenu-wrap')) { closeFachMenu(); return; }
  if (e.key === 'Escape') { const lb = document.querySelector('.lightbox'); if (lb) { lb.remove(); return; } closeModal(); }
});

/* ---------- Export / Import ---------- */
function exportString() { return JSON.stringify({ app: 'lemmalab', fach: FACH, exported: new Date().toISOString(), ...S }); }
function exportJSON() {
  const s = exportString();
  const done = () => toast('Fortschritt in die Zwischenablage kopiert');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(done, () => showText(s));
  else showText(s);
}
function showText(s) { modal(`<h3>Export</h3><p class="small muted">Diesen Text kopieren und auf dem anderen Gerät unter „Text einfügen“ importieren.</p><textarea class="note" style="min-height:200px" readonly>${esc(s)}</textarea><div class="row"><div class="spacer"></div><button class="btn" data-act="close">Schliessen</button></div>`); }
function exportFile() {
  try {
    const blob = new Blob([exportString()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `lemmalab-${FACH === 'ana1' ? 'fortschritt' : FACH}-${dayKey()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    toast('Datei gespeichert');
  } catch (e) { showText(exportString()); }
}
function logCSV() {
  const head = 'zeitpunkt;karte;typ;nummer;titel;kapitel;prioritaet;modus;bewertung;zustand_vorher;denkzeit_s;pruefzeit_s;gesamt_s';
  const st = ['neu', 'lernend', 'wiederholung', 'neu-lernend'], md = { l: 'lernen', t: 'test', q: 'quiz' }, rt = ['', 'nochmal', 'schwer', 'gut', 'einfach'];
  const q = v => '"' + String(v).replace(/"/g, '""') + '"';
  return [head, ...S.log.map(l => { const c = BY_ID[l[1]] || {}; return [new Date(l[0]).toISOString(), l[1], c.kind, c.nr, q(c.title || ''), c.chap, c.prio, md[modeOf(l)], rt[l[2]] || l[2], st[l[3]] ?? l[3], l[6] != null ? (l[6] / 10).toFixed(1) : '', l[7] != null ? (l[7] / 10).toFixed(1) : '', (l[4] / 10).toFixed(1)].join(';'); })].join('\n');
}
function exportCSV() {
  const csv = logCSV();
  try {
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `lemmalab-lerndaten-${dayKey()}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); toast('CSV gespeichert');
  } catch (e) { showText(csv); }
}
function importPaste() {
  modal(`<h3>Fortschritt importieren</h3><p class="small muted">Export-Text einfügen. Die Daten werden mit dem aktuellen Stand zusammengeführt (pro Karte gilt der neuere Stand).</p><textarea class="note" id="impText" style="min-height:180px"></textarea><div class="row"><div class="spacer"></div><button class="btn" data-act="close">Abbrechen</button><button class="btn primary" id="impBtn">Importieren</button></div>`);
  $('#impBtn').addEventListener('click', () => importJSON($('#impText').value));
}
function importJSON(txt) {
  try {
    const o = JSON.parse(txt);
    if (!o.cards || !o.log) throw new Error('kein gültiger Export');
    if ((o.fach || 'ana1') !== FACH) throw new Error(`Export gehört zum Fach ${((window.FAECHER || {})[o.fach || 'ana1'] || {}).name || o.fach} – zuerst dorthin wechseln`);
    mergeInto(o);
    save(); closeModal(); render(); toast('Import erfolgreich');
  } catch (e) { toast('Import fehlgeschlagen: ' + e.message); }
}
function mergeInto(o, anyId) {     // anyId: Lernstand eines anderen (nicht geladenen) Fachs zusammenführen
  const ra = Math.max(S.settings.resetAt || 0, (o.settings && o.settings.resetAt) || 0);
  for (const [id, y] of Object.entries(o.cards || {})) {
    if ((!anyId && !BY_ID[id] && !(window.BEWEISE_IDS && BEWEISE_IDS.has(id))) || !y || (y.u || 0) < ra) continue;
    const x = S.cards[id];
    if (!x || (y.u || 0) > (x.u || 0)) S.cards[id] = y;
  }
  const seen = new Set(S.log.map(l => l[0] + '|' + l[1]));
  for (const l of o.log || []) if (Array.isArray(l) && l[0] >= ra && !seen.has(l[0] + '|' + l[1])) { S.log.push(l); seen.add(l[0] + '|' + l[1]); }
  if (o.settings && (o.settings.u || 0) > (S.settings.u || 0)) S.settings = { ...DEFAULT_SETTINGS, ...o.settings };
  if (ra) {   // nach einem Zurücksetzen auf einem anderen Gerät
    S.settings.resetAt = ra;
    for (const [id, x] of Object.entries(S.cards)) if ((x.u || 0) < ra) delete S.cards[id];
    S.log = S.log.filter(l => l[0] >= ra);
  }
  S.log.sort((a, b) => a[0] - b[0]);
}

/* ============================================================
 * Cloud-Sync (nur wenn die Seite als claude.ai-Artifact läuft)
 * Dokumente: data/users/<uid>/cards, …/settings, …/log-YYYY-MM
 * ============================================================ */
const Sync = {
  db: null, uid: null, ok: false, pending: new Set(), timer: null, busy: false,
  async init() {
    for (let i = 0; i < 30 && !(window.claude && window.claude.use); i++) await new Promise(r => setTimeout(r, 100));
    if (!(window.claude && window.claude.use)) return;
    try {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return;
      const uid = await user.id();
      if (!uid) return;
      this.db = db; this.uid = uid;
      setPill('Sync …');
      await this.pull();
      this.ok = true;
      setPill('☁︎ synchronisiert');
      // lokalen Stand hochladen, falls er Neues enthält
      this.schedule(['cards', 'settings', 'log']);
      render();
    } catch (e) { console.warn('Sync nicht verfügbar', e); setPill('lokal'); }
  },
  ref(name) { return this.db.doc(`data/users/${this.uid}/${FACH_CFG.syncPrefix || ''}${name}`); },
  timeout(p, ms = 12000) { return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]); },
  async pull() {
    const [cSnap, sSnap] = await this.timeout(Promise.all([this.ref('cards').get(), this.ref('settings').get()]));
    const remote = { cards: {}, log: [], settings: null };
    if (cSnap.exists) remote.cards = JSON.parse(cSnap.data().json || '{}');
    let months = [];
    if (sSnap.exists) { const d = sSnap.data(); remote.settings = d.settings || null; months = d.months || []; }
    const logs = await this.timeout(Promise.all(months.map(m => this.ref('log-' + m).get())));
    for (const l of logs) if (l.exists) remote.log.push(...JSON.parse(l.data().json || '[]'));
    mergeInto(remote);
    try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { }
  },
  schedule(keys) {
    if (!this.db) return;
    keys.forEach(k => this.pending.add(k));
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 1500);
  },
  async flush() {
    if (this.busy) { this.timer = setTimeout(() => this.flush(), 800); return; }
    this.busy = true;
    const keys = [...this.pending]; this.pending.clear();
    try {
      const months = [...new Set(S.log.map(l => dayKey(l[0]).slice(0, 7)))].sort();
      if (keys.includes('cards')) await this.ref('cards').set({ json: JSON.stringify(S.cards), u: now() });
      if (keys.includes('settings') || keys.includes('log')) await this.ref('settings').set({ settings: S.settings, months, u: now() });
      if (keys.includes('log')) {
        const cur = dayKey().slice(0, 7);
        const toWrite = this.wroteOnce ? [cur] : months;   // beim ersten Mal alle Monate
        for (const m of toWrite) await this.ref('log-' + m).set({ json: JSON.stringify(S.log.filter(l => dayKey(l[0]).slice(0, 7) === m)) });
        this.wroteOnce = true;
      }
      setPill('☁︎ synchronisiert');
    } catch (e) {
      console.warn('Sync-Fehler', e);
      keys.forEach(k => this.pending.add(k));
      setPill('⚠︎ Sync ausstehend');
      this.timer = setTimeout(() => this.flush(), 15000);
    } finally { this.busy = false; }
  },
};
function setPill(s) { const p = $('#syncPill'); if (p) p.textContent = s; }
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') Timer.pause(); else Timer.resume();
  if (document.visibilityState === 'hidden') { if (Sync.pending.size) Sync.flush(); if (Gist.dirty) Gist.push(); }
  else if (Gist.cfg.token && !session) Gist.pull(true);   // beim Zurückkehren neuesten Stand holen
});

/* ============================================================
 * Geräte-Abgleich über ein privates GitHub-Gist
 * Token + Gist-ID liegen nur lokal (eigener Schlüssel), nie im Export.
 * ============================================================ */
const GIST_KEY = 'lemmalab-gist-v1', GIST_FILE = FACH_CFG.gist || 'lemmalab-fortschritt.json', OLD_GIST_FILE = FACH === 'ana1' ? 'analysis1-fortschritt.json' : '__keine__';
const ANY_GIST_FILES = ['analysis1-fortschritt.json', ...Object.values(window.FAECHER || {}).map(f => f.gist)];
const Gist = {
  cfg: (() => { try { return JSON.parse(localStorage.getItem(GIST_KEY) || '{}'); } catch (e) { return {}; } })(),
  dirty: false, timer: null, busy: false, status: '', lastSync: 0,
  saveCfg() { try { localStorage.setItem(GIST_KEY, JSON.stringify(this.cfg)); } catch (e) { } },
  async api(path, opts = {}) {
    const r = await fetch('https://api.github.com' + path, {
      ...opts,
      headers: { Authorization: 'Bearer ' + this.cfg.token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', ...(opts.headers || {}) },
      cache: 'no-store',
    });
    if (r.status === 401) throw new Error('Token ungültig oder abgelaufen');
    if (r.status === 404) throw new Error('nicht gefunden (Token braucht das Recht „gist“)');
    if (!r.ok) throw new Error('GitHub-Fehler ' + r.status);
    return r.json();
  },
  setStatus(t) { this.status = t; const el = $('#gistStatus'); if (el) el.textContent = t; if (this.cfg.token && !Sync.ok) setPill(t.startsWith('✓') ? '☁︎ GitHub' : t.startsWith('⚠︎') ? '⚠︎ Sync' : 'Sync …'); },
  async connect(token) {
    this.cfg = { token: token.trim() }; this.saveCfg();
    this.setStatus('Verbinde …');
    try {
      // vorhandenes Gist suchen (z. B. vom anderen Gerät angelegt)
      let id = null;
      for (let page = 1; page <= 5 && !id; page++) {
        const list = await this.api(`/gists?per_page=100&page=${page}`);
        const g = list.find(g => g.files && ANY_GIST_FILES.some(n => g.files[n]));
        if (g) id = g.id;
        if (list.length < 100) break;
      }
      if (!id) {
        const g = await this.api('/gists', { method: 'POST', body: JSON.stringify({ description: 'LemmaLab – Lernfortschritt (automatisch)', public: false, files: { [GIST_FILE]: { content: exportString() } } }) });
        id = g.id;
      }
      this.cfg.gistId = id; this.saveCfg();
      await this.pull();
      await this.push();
      toast('Abgleich eingerichtet');
    } catch (e) { this.setStatus('⚠︎ ' + e.message); toast('Verbindung fehlgeschlagen: ' + e.message); }
    render();
  },
  disconnect() { this.cfg = {}; this.saveCfg(); this.setStatus(''); setPill(Sync.ok ? '☁︎ synchronisiert' : 'lokal'); render(); },
  init() { if (this.cfg.token && this.cfg.gistId) this.pull(); },
  async pull(quiet) {
    if (!this.cfg.token || !this.cfg.gistId || this.busy) return;
    this.busy = true;
    if (!quiet) this.setStatus('Lade …');
    try {
      const g = await this.api('/gists/' + this.cfg.gistId);
      this.oldFile = !!(g.files && g.files[OLD_GIST_FILE]);
      const f = g.files && (g.files[GIST_FILE] || g.files[OLD_GIST_FILE]);
      if (f) {
        let txt = f.content;
        if (f.truncated && f.raw_url) txt = await (await fetch(f.raw_url, { cache: 'no-store' })).text();
        const before = JSON.stringify([S.cards, S.log.length, S.settings]);
        mergeInto(JSON.parse(txt));
        try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { }
        const changed = before !== JSON.stringify([S.cards, S.log.length, S.settings]);
        if (changed && !session && !quiz) render();
        // lokal Neueres hochladen
        if (txt.length !== exportString().length) this.dirty = true;
      }
      this.lastSync = now();
      this.setStatus('✓ abgeglichen ' + new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) { this.setStatus('⚠︎ ' + e.message); }
    finally { this.busy = false; }
    if (this.dirty) this.schedule();
  },
  schedule() {
    if (!this.cfg.token || !this.cfg.gistId) return;
    this.dirty = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.push(), 4000);
  },
  async push() {
    if (!this.cfg.token || !this.cfg.gistId) return;
    if (this.busy) { this.timer = setTimeout(() => this.push(), 1500); return; }
    this.busy = true; this.dirty = false;
    try {
      await this.api('/gists/' + this.cfg.gistId, { method: 'PATCH', body: JSON.stringify({ description: 'LemmaLab – Lernfortschritt (automatisch)', files: { [GIST_FILE]: { content: exportString() }, ...(this.oldFile ? { [OLD_GIST_FILE]: null } : {}) } }) });
      this.oldFile = false;
      this.lastSync = now();
      this.setStatus('✓ abgeglichen ' + new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) { this.dirty = true; this.setStatus('⚠︎ ' + e.message); this.timer = setTimeout(() => this.push(), 30000); }
    finally { this.busy = false; }
  },
};
function gistSettingsHTML() {
  if (Gist.cfg.token && Gist.cfg.gistId) return `
    <div class="small">✓ Verbunden. Dein Fortschritt wird nach jeder Bewertung in einem <b>privaten Gist</b> auf deinem GitHub-Konto gespeichert und beim Öffnen von dort geladen.</div>
    <div class="small muted" id="gistStatus" style="margin-top:6px">${esc(Gist.status)}</div>
    <div class="row" style="margin-top:12px"><button class="btn" data-act="gistsync">Jetzt abgleichen</button><button class="btn" data-act="gistoff">Trennen</button></div>`;
  return `
    <div class="small">Damit iPhone und Mac denselben Stand haben: einmal pro Gerät einen GitHub-Token eintragen. Der Fortschritt landet dann in einem privaten Gist (nur für dich sichtbar).</div>
    <ol class="small" style="margin:10px 0 10px 18px;padding:0">
      <li>Token erstellen: <a href="https://github.com/settings/tokens/new?scopes=gist&description=LemmaLab" target="_blank" rel="noopener">github.com/settings/tokens/new</a> – nur das Häkchen <b>gist</b>, Ablauf z. B. „No expiration“ oder nach der Prüfung.</li>
      <li>Token (beginnt mit <code>ghp_</code>) kopieren und hier einfügen.</li>
      <li>Auf dem zweiten Gerät denselben Token eintragen – das Gist wird automatisch gefunden.</li>
    </ol>
    <div class="row"><input id="gistTok" type="password" autocomplete="off" placeholder="ghp_…" style="flex:1;min-width:180px;border:1px solid var(--line);background:var(--bg);border-radius:10px;padding:9px 10px">
    <button class="btn primary" data-act="gistconnect">Verbinden</button></div>
    <div class="small muted" id="gistStatus" style="margin-top:6px">${esc(Gist.status)}</div>
    <div class="small muted" style="margin-top:6px">Der Token bleibt nur auf diesem Gerät gespeichert und ist nicht im Export enthalten.</div>`;
}

/* ============================================================
 * Update-Erkennung: Als App auf dem Home-Bildschirm hält iOS alte Versionen
 * im Cache. Wir prüfen die Version auf dem Server und laden bei Bedarf neu.
 * ============================================================ */
async function checkUpdate(manual) {
  if (location.protocol === 'file:') return;
  try {
    const r = await fetch('app.js?check=' + Date.now(), { cache: 'no-store' });
    const m = (await r.text()).match(/APP_VERSION = '([^']+)'/);
    if (m && m[1] !== APP_VERSION) {
      if (session || quiz) { toast('Neue Version verfügbar – wird nach der Sitzung geladen'); return; }
      location.replace(location.pathname + '?v=' + encodeURIComponent(m[1]) + location.hash);
    } else if (manual) toast('Du hast die neueste Version (' + APP_VERSION + ')');
  } catch (e) { if (manual) toast('Keine Verbindung'); }
}
window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdate(); });

/* ============================================================
 * Start
 * ============================================================ */
Motion.set('tab'); render();
requestAnimationFrame(() => document.documentElement.classList.add('ready'));
/* Hintergrund: Wissen aller Nutzer holen, persönliches Modell trainieren */
const bgTasks = () => { if (window.MODUS === 'beweise') return; Community.refresh().catch(() => { }); if (Trainer.due()) Trainer.run(); };
setTimeout(bgTasks, 5000);
setInterval(bgTasks, HOUR);
window.addEventListener('online', () => setTimeout(bgTasks, 2000));
Sync.init();
Gist.init();
checkUpdate();
// Offline-Modus: Service Worker speichert alle Dateien (inkl. Bilder) auf dem Gerät
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service Worker', e));
}
// Neuer Tag während die Seite offen ist → Übersicht aktualisieren
setInterval(() => { if (tab === 'heute' && !session) render(); }, 5 * 60e3);
