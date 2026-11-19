/* Analysis I – Definitionen & Sätze lernen
 * Spaced Repetition mit FSRS-5, Prüfungs-Priorisierung, Quiz, Test, Statistik.
 * Fortschritt: localStorage (immer) + optional Cloud-Sync (claude.ai Artifact-DB).
 */
'use strict';

/* ============================================================
 * Grundlagen
 * ============================================================ */
const CARDS = window.CARDS || [];
const BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));
const MIN = 60e3, HOUR = 3600e3, DAY = 86400e3;
const DAY_START_HOUR = 4;                     // neuer Lerntag beginnt um 04:00
const LS_KEY = 'ana1-lernen-v1';

const PRIO = {
  5: { name: 'Kern',      color: 'var(--p5)', ret: 0.95, w: 5 },
  4: { name: 'Wichtig',   color: 'var(--p4)', ret: 0.93, w: 3 },
  3: { name: 'Solide',    color: 'var(--p3)', ret: 0.90, w: 2 },
  2: { name: 'Ergänzung', color: 'var(--p2)', ret: 0.87, w: 1 },
  1: { name: 'Rand',      color: 'var(--p1)', ret: 0.85, w: 0.4 },
};
const KIND_COLOR = { Definition: 'var(--def)', Satz: 'var(--satz)', Theorem: 'var(--satz)', Lemma: 'var(--lem)', Proposition: 'var(--prop)', Korollar: 'var(--kor)' };
const KIND_SHORT = { Definition: 'Def.', Satz: 'Satz', Theorem: 'Thm.', Lemma: 'Lemma', Proposition: 'Prop.', Korollar: 'Kor.' };

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const now = () => Date.now();

function dayStart(t = now()) {           // Beginn des Lerntags (04:00) von t
  const d = new Date(t - DAY_START_HOUR * HOUR);
  d.setHours(0, 0, 0, 0);
  return d.getTime() + DAY_START_HOUR * HOUR;
}
function dayKey(t = now()) {
  const d = new Date(dayStart(t));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function parseDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 8).getTime(); }
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
 * FSRS-5
 * ============================================================ */
const FSRS = (() => {
  const w = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192,
             1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621];
  const DECAY = -0.5, FACTOR = 19 / 81;
  const R = (t, S) => Math.pow(1 + FACTOR * t / S, DECAY);
  const ivl = (S, r) => S / FACTOR * (Math.pow(r, 1 / DECAY) - 1);
  const S0 = g => Math.max(w[g - 1], 0.1);
  const D0 = g => clamp(w[4] - Math.exp(w[5] * (g - 1)) + 1, 1, 10);
  const nextD = (D, g) => {
    const d2 = D + (-w[6] * (g - 3)) * (10 - D) / 9;
    return clamp(w[7] * D0(4) + (1 - w[7]) * d2, 1, 10);
  };
  const recallS = (D, S, r, g) => S * (1 + Math.exp(w[8]) * (11 - D) * Math.pow(S, -w[9]) *
    (Math.exp((1 - r) * w[10]) - 1) * (g === 2 ? w[15] : 1) * (g === 4 ? w[16] : 1));
  const forgetS = (D, S, r) => Math.min(
    w[11] * Math.pow(D, -w[12]) * (Math.pow(S + 1, w[13]) - 1) * Math.exp((1 - r) * w[14]),
    S / Math.exp(w[17] * w[18]));
  const shortS = (S, g) => S * Math.exp(w[17] * (g - 3 + w[18]));
  return { R, ivl, S0, D0, nextD, recallS, forgetS, shortS };
})();

/* ============================================================
 * Zustand & Speicherung
 * ============================================================ */
const DEFAULT_SETTINGS = {
  examDate: '2027-01-25', newMode: 'auto', newPerDay: 15, maxReviews: 250,
  includeRand: false, theme: 'auto', typeAnswer: false, u: 0,
};
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
}
function cs(id) {               // Lernzustand einer Karte
  return S.cards[id] || (S.cards[id] = { st: 0, u: 0 });
}
function prioOf(c) { const x = S.cards[c.id]; return (x && x.prio) || c.prio; }

/* ============================================================
 * Prüfungsdatum & Planung
 * ============================================================ */
function examTime() { return parseDate(S.settings.examDate || DEFAULT_SETTINGS.examDate); }
function daysToExam() { return Math.ceil((dayStart(examTime()) - dayStart()) / DAY); }

function retFor(c) { return PRIO[prioOf(c)].ret; }

function retrievability(x, t = now()) {
  if (!x || !x.st || !x.S) return 0;
  return FSRS.R(Math.max(0, (t - x.last) / DAY), x.S);
}

function eligibleNew() {
  return CARDS.filter(c => {
    const x = S.cards[c.id];
    if (x && (x.st || x.susp)) return false;
    if (prioOf(c) === 1 && !S.settings.includeRand) return false;
    return true;
  }).sort((a, b) => (prioOf(b) - prioOf(a)) || (a.ord - b.ord));
}

function newIntroducedToday() {
  const ds = dayStart();
  return CARDS.filter(c => { const x = S.cards[c.id]; return x && x.intro && x.intro >= ds; }).length;
}

function plannedNewPerDay() {
  if (S.settings.newMode === 'manual') return S.settings.newPerDay;
  // Ziel: alles spätestens 3 Wochen vor der Prüfung eingeführt, damit genug Zeit zum Festigen bleibt.
  // Mindestens 12 pro Tag, damit der Kernstoff schnell sitzt.
  const remaining = eligibleNew().length;
  if (!remaining) return 0;
  const days = Math.max(1, daysToExam() - 21);
  let n = Math.max(12, Math.ceil(remaining / days));
  if (dueReviews().length > 150) n = Math.ceil(n * 0.6);   // Überlastung vermeiden
  return clamp(n, 1, 40);
}

function dueReviews(until = dayStart() + DAY) {
  return CARDS.filter(c => { const x = S.cards[c.id]; return x && x.st >= 1 && !x.susp && x.due <= until; });
}

/* Prüfungs-Deckel: kein Intervall läuft über die Prüfung hinaus – letzte
 * Wiederholung wird auf die letzten 1–5 Tage vor der Prüfung verteilt. */
function capDue(id, due) {
  const ex = dayStart(examTime());
  if (ex <= now()) return due;
  const last = ex - (1 + hash(id) % 5) * DAY + 6 * HOUR;
  if (due > last && last > now() + DAY) return last;
  return due;
}

/* ============================================================
 * Bewertung einer Karte (Scheduler)
 * rating: 1 Nochmal, 2 Schwer, 3 Gut, 4 Einfach
 * ============================================================ */
function schedule(c, x, g, t = now()) {
  const y = { ...x };
  const target = retFor(c);
  const toDays = S2 => clamp(Math.round(FSRS.ivl(S2, target)), 1, 365);
  const fuzz = d => d < 3 ? d : Math.max(1, Math.round(d * (0.95 + (hash(c.id + t) % 1000) / 1000 * 0.1)));
  y.reps = (x.reps || 0) + 1;
  y.last = t;
  if (!x.st) {                                    // neue Karte
    y.S = FSRS.S0(g); y.D = FSRS.D0(g); y.intro = x.intro || t; y.lapses = 0;
    if (g === 1) { y.st = 1; y.step = 0; y.due = t + 1 * MIN; }
    else if (g === 2) { y.st = 1; y.step = 0; y.due = t + 6 * MIN; }
    else if (g === 3) { y.st = 1; y.step = 1; y.due = t + 10 * MIN; }
    else { y.st = 2; y.due = t + toDays(y.S) * DAY; }
  } else {
    const elapsed = Math.max(0, (t - (x.last || t)) / DAY);
    const r = FSRS.R(elapsed, x.S);
    const sameDay = elapsed < 0.5;
    y.D = FSRS.nextD(x.D, g);
    if (x.st === 2) {                               // Wiederholung
      if (g === 1) {
        y.lapses = (x.lapses || 0) + 1;
        y.S = sameDay ? FSRS.shortS(x.S, g) : FSRS.forgetS(x.D, x.S, r);
        y.st = 3; y.step = 0; y.due = t + 10 * MIN;
      } else {
        y.S = sameDay ? Math.max(x.S, FSRS.shortS(x.S, g)) : FSRS.recallS(x.D, x.S, r, g);
        let d = fuzz(toDays(y.S));
        y.due = t + d * DAY;
      }
    } else {                                        // Lernen / Neu-Lernen (st 1/3)
      y.S = FSRS.shortS(x.S, g);
      if (g === 1) { y.step = 0; y.due = t + (x.st === 3 ? 10 : 1) * MIN; }
      else if (g === 2) { y.due = t + (x.st === 3 ? 10 : 6) * MIN; }
      else if (g === 3 && x.st === 1 && (x.step || 0) < 1) { y.step = 1; y.due = t + 10 * MIN; }
      else { y.st = 2; y.step = 0; y.due = t + fuzz(toDays(y.S)) * DAY; }
    }
  }
  if (y.st === 2) {
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
  const learnDue = learning.filter(id => S.cards[id].due <= t + 20 * MIN);
  const learnLater = learning.filter(id => S.cards[id].due > t + 20 * MIN);
  return { queue: [...learnDue, ...mixed], later: learnLater, nNew: news.length, nRev: reviews.length };
}

function startSession(customIds) {
  const q = customIds ? { queue: customIds.slice(), later: [], nNew: 0, nRev: customIds.length } : buildQueue();
  session = { ...q, total: q.queue.length, done: 0, cur: null, revealed: false, undo: [], again: 0, custom: !!customIds };
  nextCard();
}

function nextCard() {
  const t = now();
  // Lernkarten, die inzwischen fällig sind, nach vorne holen
  if (session.later.length) {
    const ready = session.later.filter(id => S.cards[id].due <= t + 60e3);
    session.later = session.later.filter(id => !ready.includes(id));
    session.queue.unshift(...ready);
  }
  if (!session.queue.length && session.later.length) {
    // nichts anderes mehr da → Lernkarten vorziehen
    session.later.sort((a, b) => S.cards[a].due - S.cards[b].due);
    session.queue.push(session.later.shift());
  }
  session.cur = session.queue.shift() || null;
  session.revealed = false;
  session.shownAt = now();
  render();
}

function rate(g) {
  if (!session || !session.cur || !session.revealed) return;
  const id = session.cur, c = BY_ID[id], before = { ...cs(id) };
  const ms = clamp(now() - session.shownAt, 0, 180e3);
  const after = schedule(c, before, g);
  S.cards[id] = after;
  S.log.push([now(), id, g, before.st || 0, Math.round(ms / 100)]);
  session.undo.push({ id, before, queue: session.queue.slice(), later: session.later.slice(), done: session.done });
  session.done++;
  if (g === 1) session.again++;
  if (after.st === 1 || after.st === 3) session.later.push(id);
  save();
  nextCard();
}

function undo() {
  if (!session || !session.undo.length) return;
  const u = session.undo.pop();
  S.cards[u.id] = u.before;
  for (let i = S.log.length - 1; i >= 0; i--) { if (S.log[i][1] === u.id) { S.log.splice(i, 1); break; } }
  session.queue = u.queue; session.later = u.later; session.done = u.done;
  if (session.cur) session.queue.unshift(session.cur);
  session.cur = u.id; session.revealed = true; session.shownAt = now();
  save();
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
const TABS = [['heute', 'Lernen'], ['quiz', 'Quiz & Test'], ['katalog', 'Katalog'], ['statistik', 'Statistik'], ['mehr', 'Einstellungen']];
let tab = (location.hash || '#heute').slice(1);
if (!TABS.some(t => t[0] === tab)) tab = 'heute';

function renderTabs() {
  $('#tabs').innerHTML = TABS.map(([k, l]) =>
    `<button data-tab="${k}" class="${k === tab ? 'on' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>${l}</button>`).join('');
}
$('#tabs').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]'); if (!b) return;
  go(b.dataset.tab);
});
function go(t) {
  tab = t;
  try { history.replaceState(null, '', '#' + t); } catch (e) { location.hash = t; }
  render(); window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => { const t = location.hash.slice(1); if (TABS.some(x => x[0] === t) && t !== tab) { tab = t; render(); } });

function render() {
  applyTheme();
  renderTabs();
  const v = $('#view');
  if (tab === 'heute') v.innerHTML = session && (session.cur || session.done) ? viewStudy() : viewHome();
  else if (tab === 'quiz') v.innerHTML = viewQuiz();
  else if (tab === 'katalog') v.innerHTML = viewCatalog();
  else if (tab === 'statistik') v.innerHTML = viewStats();
  else v.innerHTML = viewSettings();
  afterRender();
}

function kindTag(c) { return `<span class="tag" style="background:${KIND_COLOR[c.kind]}">${KIND_SHORT[c.kind]} ${c.nr}</span>`; }
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
function viewHome() {
  const q = buildQueue();
  const dte = daysToExam();
  const learning = q.queue.length - q.nRev - q.nNew;
  const rd = readiness();
  const introduced = CARDS.filter(c => S.cards[c.id] && S.cards[c.id].st).length;
  const todayLog = S.log.filter(l => l[0] >= dayStart());
  const minToday = Math.round(todayLog.reduce((a, l) => a + l[4], 0) / 600);
  const estMin = Math.round((q.nRev * 25 + q.nNew * 70 + Math.max(0, learning) * 20) / 60);
  const focus = nextFocus();
  return `
  <div class="card">
    <div class="row"><h3 style="margin:0">Heute</h3><div class="spacer"></div>
      <span class="pill gray">${dte > 0 ? `Prüfung in ${dte} Tagen` : dte === 0 ? 'Prüfung heute' : 'Prüfung vorbei'}</span></div>
    <div class="grid g3" style="margin-top:12px">
      <div class="kpi"><div class="v" style="color:var(--easy)">${q.nRev}</div><div class="l">Wiederholungen fällig</div></div>
      <div class="kpi"><div class="v" style="color:var(--good)">${q.nNew}</div><div class="l">neue Karten</div></div>
      <div class="kpi"><div class="v" style="color:var(--hard)">${Math.max(0, learning)}</div><div class="l">in Lernschritten</div></div>
    </div>
    <div style="margin-top:14px">
      ${q.queue.length
        ? `<button class="btn primary big" data-act="start">Lernen starten · ca. ${Math.max(1, estMin)} Min</button>`
        : `<div class="empty" style="padding:14px"><div class="big">✓</div><b>Für heute alles erledigt.</b><div class="muted small">${q.later.length ? q.later.length + ' Karte(n) in Lernschritten folgen später. ' : ''}Mit Quiz oder Test kannst du freiwillig weiterüben.</div></div>
           <button class="btn big" data-act="extra">Zusätzlich 10 neue Karten lernen</button>`}
    </div>
    <div class="muted small" style="margin-top:10px">Heute erledigt: ${todayLog.length} Bewertungen · ${minToday} Min · Neue Karten pro Tag: ${plannedNewPerDay()} (${S.settings.newMode === 'auto' ? 'automatisch aus Prüfungsdatum' : 'manuell'})</div>
  </div>

  <div class="grid g2" style="margin-top:12px">
    <div class="card kpi"><div class="l">Prüfungsbereitschaft (gewichtet)</div><div class="v">${Math.round(rd.exam * 100)}%</div>
      <div class="bar" style="margin-top:8px"><span style="width:${rd.exam * 100}%;background:var(--good)"></span></div>
      <div class="s">Erwartete Abrufwahrscheinlichkeit am Prüfungstag, Kernstoff zählt stärker.</div></div>
    <div class="card kpi"><div class="l">Eingeführt</div><div class="v">${introduced}<span class="muted" style="font-size:16px"> / ${CARDS.length}</span></div>
      <div class="bar" style="margin-top:8px">${prioBarSegments()}</div>
      <div class="s">Kern ${countIntro(5)} · Wichtig ${countIntro(4)} · Solide ${countIntro(3)}</div></div>
  </div>

  ${focus ? `<h2>Nächster Fokus</h2><div class="card small">${focus}</div>` : ''}

  <h2>So funktioniert's</h2>
  <div class="card small muted">
    Karten kommen nach <b>Prüfungsrelevanz</b>: zuerst alle <span style="color:var(--p5)">Kern</span>-Definitionen und -Sätze, dann <span style="color:var(--p4)">Wichtig</span>, dann der Rest – jeweils in Skript-Reihenfolge.
    Der Algorithmus (FSRS) plant jede Karte so, dass du sie kurz vor dem Vergessen wiederholst; Kernstoff wird auf 95 % Abrufsicherheit gehalten, Randstoff auf 85 %.
    Keine Wiederholung wird über das Prüfungsdatum hinaus geplant – alles kommt in den letzten Tagen vor der Prüfung noch einmal.
    <br><br><b>Ablauf:</b> Titel lesen → Aussage im Kopf oder auf Papier <i>vollständig</i> formulieren (alle Voraussetzungen!) → aufdecken → ehrlich bewerten.
    <span class="kbd">Tastatur: Leertaste = aufdecken, 1–4 = bewerten, U = rückgängig.</span>
  </div>`;
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
  const parts = [];
  if (kernLeft) parts.push(`Noch <b>${kernLeft} Kern-Karten</b> nicht eingeführt – die kommen als Nächstes dran.`);
  if (weak.length) parts.push(`<b>${weak.length} wichtige Karten</b> wären am Prüfungstag noch unsicher (&lt; 80 %): ${weak.slice(0, 5).map(c => esc(KIND_SHORT[c.kind] + ' ' + c.nr)).join(', ')}${weak.length > 5 ? ' …' : ''}. Sie werden automatisch öfter wiederholt.`);
  const leeches = CARDS.filter(c => (S.cards[c.id]?.lapses || 0) >= 3);
  if (leeches.length) parts.push(`${leeches.length} Karte(n) mit ≥ 3 Fehlern – im Katalog unter „Schwach“. Tipp: Beweisidee oder Gegenbeispiel dazu nachlesen.`);
  return parts.join('<br>');
}

/* ---------- Lernkarte ---------- */
function promptFor(c) {
  if (c.kind === 'Definition') return 'Gib die Definition <b>vollständig und präzise</b> wieder (alle Begriffe, Quantoren, Bedingungen).';
  return 'Formuliere die Aussage mit <b>allen Voraussetzungen</b> und der genauen Folgerung.';
}
function scanHTML(c, masked) {
  const m = masked && c.mask ? `<div class="mask" style="left:${c.mask[0] / c.w * 100}%;top:${c.mask[1] / c.h * 100}%;width:${(c.mask[2] - c.mask[0]) / c.w * 100}%;height:${(c.mask[3] - c.mask[1]) / c.h * 100}%"></div>` : '';
  return `<div class="scanwrap" ${masked ? '' : `data-zoom="${c.id}" title="Antippen zum Vergrössern"`}><img class="scan" src="img/${c.img}" width="${c.w}" height="${c.h}" alt="${esc(c.kind + ' ' + c.nr)}" loading="lazy">${m}</div>`;
}
function viewStudy() {
  const s = session;
  if (!s.cur) {
    const acc = s.done ? Math.round((1 - s.again / s.done) * 100) : 0;
    return `<div class="card empty"><div class="big">🎉</div><h3>Sitzung abgeschlossen</h3>
      <div class="muted">${s.done} Bewertungen · ${acc}% beim ersten Versuch gewusst</div>
      <div class="row" style="justify-content:center;margin-top:16px">
        <button class="btn" data-act="home">Zur Übersicht</button>
        <button class="btn primary" data-act="tab:statistik">Statistik ansehen</button></div></div>`;
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
    <span class="small muted">${left} übrig</span>
    ${s.undo.length ? '<button class="btn ghost small" data-act="undo" title="Rückgängig (U)">↶</button>' : ''}
  </div>
  <div class="card fc">
    <div class="row">
      <span class="kind" style="color:${KIND_COLOR[c.kind]}">${esc(c.kind)} ${c.nr}</span>
      ${isNew ? '<span class="pill" style="background:color-mix(in srgb,var(--good) 15%,transparent);color:var(--good)">neu</span>' : ''}
      ${x.st === 1 || x.st === 3 ? '<span class="pill" style="background:color-mix(in srgb,var(--hard) 15%,transparent);color:var(--hard)">Lernschritt</span>' : ''}
      <div class="spacer"></div>${prioTag(c)}
    </div>
    <div class="ttl">${esc(c.title) || esc(c.kind + ' ' + c.nr)}</div>
    <div class="meta">Kap. ${c.chap} · ${esc(c.sec)} · Skript S. ${c.page}${c.proofP ? ` · Beweis-Prüfungschance ≈ ${Math.max(1, Math.round(c.proofP * 100))}%` : ''}</div>
    ${!s.revealed ? `
      <div class="prompt">${promptFor(c)}</div>
      ${S.settings.typeAnswer ? `<textarea class="note" id="answer" placeholder="Hier aufschreiben (wird nicht gespeichert) …"></textarea>` : ''}
      <div class="spacer"></div>
      <button class="btn primary big" style="margin-top:16px" data-act="reveal">Aufdecken <span class="kbd" style="color:#fff;opacity:.8">␣</span></button>
    ` : `
      ${scanHTML(c, false)}
      ${c.tip ? `<div class="tip"><b>Worauf achten:</b> ${esc(c.tip)}</div>` : ''}
      <div class="rate">
        <button class="r1" data-rate="1">Nochmal<small>${ivls[0]}</small></button>
        <button class="r2" data-rate="2">Schwer<small>${ivls[1]}</small></button>
        <button class="r3" data-rate="3">Gut<small>${ivls[2]}</small></button>
        <button class="r4" data-rate="4">Einfach<small>${ivls[3]}</small></button>
      </div>
      <div class="kbd center" style="margin-top:8px">Nochmal = wesentlicher Teil fehlte · Schwer = mit Mühe/kleine Lücke · Gut = vollständig · Einfach = sofort und sicher</div>
    `}
  </div>`;
}

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
  const pool = quizPool(scope);
  if (pool.length < 4) { toast('Zu wenige Karten in dieser Auswahl'); return; }
  const items = pickWeighted(pool, Math.min(n, pool.length), weakness).map(c => c.id);
  quiz = { type, scope, items, i: 0, answers: [], picked: null, revealed: false, shownAt: now() };
  if (type === 'match') quiz.opts = makeOpts(items[0]);
  render();
}
function makeOpts(id) {
  const c = BY_ID[id];
  const sameKindGroup = k => (k === 'Definition') === (c.kind === 'Definition');
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
  if (quiz.type === 'match') { if (quiz.picked) return; quiz.picked = val; ok = val === id; }
  else {
    ok = val >= 3;
    // Test-Bewertung fliesst ins Lernsystem ein
    S.cards[id] = schedule(BY_ID[id], x, val);
    S.log.push([now(), id, val, x.st || 0, Math.round(clamp(now() - quiz.shownAt, 0, 180e3) / 100), 't']);
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
  quiz.i++; quiz.picked = null; quiz.revealed = false; quiz.shownAt = now();
  if (quiz.i < quiz.items.length && quiz.type === 'match') quiz.opts = makeOpts(quiz.items[quiz.i]);
  render();
}
function viewQuiz() {
  if (quiz && quiz.i < quiz.items.length) {
    const id = quiz.items[quiz.i], c = BY_ID[id];
    const head = `<div class="study-head"><button class="btn ghost" data-act="quizend">✕</button>
      <div class="progress"><div style="width:${quiz.i / quiz.items.length * 100}%"></div></div>
      <span class="small muted">${quiz.i + 1}/${quiz.items.length}</span></div>`;
    if (quiz.type === 'match') {
      return head + `<div class="card fc">
        <div class="row"><span class="kind" style="color:var(--muted)">Welcher Name gehört zu dieser Aussage?</span><div class="spacer"></div><span class="pill gray">Kap. ${c.chap}</span></div>
        ${scanHTML(c, true)}
        <div class="opts">${quiz.opts.map(o => {
          const oc = BY_ID[o];
          let cl = '';
          if (quiz.picked) { if (o === id) cl = 'ok'; else if (o === quiz.picked) cl = 'bad'; }
          return `<button class="opt ${cl}" data-opt="${o}" ${quiz.picked ? 'disabled' : ''}>${esc(oc.title)}${quiz.picked ? ` <span class="muted small">(${KIND_SHORT[oc.kind]} ${oc.nr})</span>` : ''}</button>`;
        }).join('')}</div>
        ${quiz.picked ? `<button class="btn primary big" style="margin-top:14px" data-act="quiznext">Weiter</button>` : ''}
      </div>`;
    }
    // Prüfungstest
    return head + `<div class="card fc">
      <div class="row"><span class="kind" style="color:${KIND_COLOR[c.kind]}">${esc(c.kind)} ${c.nr}</span><div class="spacer"></div>${prioTag(c)}</div>
      <div class="ttl">${esc(c.title)}</div>
      <div class="meta">Kap. ${c.chap} · ${esc(c.sec)}</div>
      ${!quiz.revealed ? `<div class="prompt">Prüfungssituation: Schreibe die ${c.kind === 'Definition' ? 'Definition' : 'Aussage'} so auf, wie du sie in der Prüfung hinschreiben würdest. Erst dann aufdecken.</div>
        <div class="spacer"></div><button class="btn primary big" style="margin-top:16px" data-act="qreveal">Aufdecken</button>`
      : `${scanHTML(c, false)}
        <div class="rate three">
          <button class="r1" data-trate="1">Nicht gewusst</button>
          <button class="r2" data-trate="2">Lückenhaft</button>
          <button class="r3" data-trate="3">Vollständig</button></div>`}
    </div>`;
  }
  if (quiz && quiz.i >= quiz.items.length) {
    const ok = quiz.answers.filter(a => a.ok).length, n = quiz.answers.length;
    const wrong = quiz.answers.filter(a => !a.ok).map(a => BY_ID[a.id]);
    return `<div class="card"><div class="center"><div style="font-size:42px;font-weight:800">${Math.round(ok / n * 100)}%</div>
      <div class="muted">${ok} von ${n} ${quiz.type === 'match' ? 'richtig zugeordnet' : 'vollständig gewusst'}</div></div>
      ${wrong.length ? `<h3 style="margin-top:16px">Nochmals anschauen</h3><div class="list">${wrong.map(liHTML).join('')}</div>
        <div class="muted small" style="margin-top:6px">${quiz.type === 'match' ? 'Falsch zugeordnete Karten kommen heute nochmals im Lernmodus.' : 'Die Test-Bewertungen wurden direkt in deinen Lernplan übernommen.'}</div>` : ''}
      <div class="row" style="margin-top:16px"><button class="btn" data-act="quizend">Zurück</button>
      ${wrong.length ? `<button class="btn primary" data-act="learnwrong">Falsche jetzt lernen</button>` : ''}</div></div>`;
  }
  const chOpts = Object.entries(window.CHAPTERS || {}).map(([k, v]) => `<option value="k${k}">Kapitel ${k}: ${esc(v)}</option>`).join('');
  return `
  <div class="card">
    <h3>Zuordnen (Quizlet-Stil)</h3>
    <div class="muted small">Du siehst die Aussage aus dem Skript ohne Titel und wählst den richtigen Namen. Trainiert das Wiedererkennen – ideal zwischendurch auf dem Handy. Bevorzugt werden Karten, die bei dir wackeln.</div>
    <div class="filters" style="margin-top:12px">
      <select id="qScope"><option value="intro">Bereits eingeführte Karten</option><option value="kern">Nur Kern & Wichtig</option><option value="all">Alle Karten</option>${chOpts}</select>
      <select id="qN"><option>10</option><option selected>15</option><option>25</option><option>40</option></select>
    </div>
    <button class="btn primary big" data-act="quizstart">Zuordnen starten</button>
  </div>
  <div class="card" style="margin-top:12px">
    <h3>Prüfungstest</h3>
    <div class="muted small">Zufällige Auswahl nach Prüfungsrelevanz und deinen Schwächen. Aufschreiben, aufdecken, ehrlich bewerten – das Ergebnis fliesst in den Lernplan ein.</div>
    <div class="filters" style="margin-top:12px">
      <select id="tScope"><option value="kern">Kern & Wichtig</option><option value="intro">Bereits eingeführte Karten</option><option value="all">Alle Karten</option>${chOpts}</select>
      <select id="tN"><option>8</option><option selected>12</option><option>20</option></select>
    </div>
    <button class="btn primary big" data-act="teststart">Test starten</button>
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
  const r = x && x.st ? Math.round(retrievability(x) * 100) + '%' : '';
  return `<div class="li" data-card="${c.id}">
    ${kindTag(c)}
    <div class="t"><b>${esc(c.title) || '—'}</b>${(S.cards[c.id] || {}).flag ? ' <span title="markiert">★</span>' : ''}<div class="m">${esc(c.sec)} · S. ${c.page}</div></div>
    <span class="dot" title="${PRIO[prioOf(c)].name}" style="background:${PRIO[prioOf(c)].color}"></span>
    <span class="pill" style="background:color-mix(in srgb,${st.col} 14%,transparent);color:${st.col};min-width:66px;justify-content:center">${st.l}${r ? ' ' + r : ''}</span>
  </div>`;
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
  const ch = Object.entries(window.CHAPTERS || {}).map(([k, v]) => `<option value="${k}" ${cat.chap == k ? 'selected' : ''}>${k}. ${esc(v)}</option>`).join('');
  const sel = (id, opts, val) => `<select id="${id}">${opts.map(([v, l]) => `<option value="${v}" ${String(val) === String(v) ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  return `
  <div class="filters">
    <input id="cq" type="search" placeholder="Suchen (z. B. Supremum, 7.30, stetig) …" value="${esc(cat.q)}">
    <select id="cchap"><option value="">Alle Kapitel</option>${ch}</select>
    ${sel('ckind', [['', 'Alle Typen'], ['Definition', 'Definitionen'], ['Satz', 'Sätze & Theoreme'], ['Lemma', 'Lemmata'], ['Proposition', 'Propositionen'], ['Korollar', 'Korollare']], cat.kind)}
    ${sel('cprio', [['', 'Alle Prioritäten'], [5, 'Kern'], [4, 'Wichtig'], [3, 'Solide'], [2, 'Ergänzung'], [1, 'Rand']], cat.prio)}
    ${sel('cstat', [['', 'Jeder Status'], ['neu', 'Neu'], ['lernend', 'Lernend'], ['jung', 'Jung'], ['sitzt', 'Sitzt'], ['wackelig', 'Wackelig (< 85 %)'], ['schwach', 'Schwach (≥ 3 Fehler)'], ['flag', 'Markiert ★'], ['pause', 'Pausiert']], cat.status)}
  </div>
  <div class="row small muted" style="margin:0 2px 8px"><span>${list.length} Karten</span><div class="spacer"></div>
    ${list.length ? `<button class="btn small" data-act="learnfiltered">Diese ${Math.min(list.length, 50)} jetzt üben</button>` : ''}</div>
  <div class="card" style="padding:4px 12px">${list.length ? `<div class="list">${list.map(liHTML).join('')}</div>` : '<div class="empty muted">Keine Treffer</div>'}</div>`;
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
  if (c.proofP) rows.push(['Beweis-Prüfungschance (Modell)', `≈ ${Math.max(1, Math.round(c.proofP * 100))}%${c.proofH ? ` · ${c.proofH}× in alten Prüfungen` : ''}`]);
  modal(`
    <div class="row">${kindTag(c)}<div class="spacer"></div>${prioTag(c)}<button class="btn ghost" data-act="close">✕</button></div>
    <h3 style="font-size:19px;margin:10px 0 2px">${esc(c.title)}</h3>
    <div class="muted small">Kap. ${c.chap} ${esc(c.chapTitle)} · ${esc(c.sec)} · Skript S. ${c.page}${!c.titled ? ' · Titel ergänzt (im Skript ohne Namen)' : ''}</div>
    ${scanHTML(c, false)}
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
  const rd = readiness();
  const t = now();
  const logs = S.log;
  const days = {};
  for (const l of logs) { const k = dayKey(l[0]); (days[k] = days[k] || { n: 0, ok: 0, ms: 0 }); days[k].n++; if (l[2] >= 2) days[k].ok++; days[k].ms += l[4] * 100; }
  // Streak
  let streak = 0, d0 = dayStart();
  if (!days[dayKey(d0 + HOUR)]) d0 -= DAY;            // heute noch nichts gemacht → ab gestern zählen
  for (let d = d0; days[dayKey(d + HOUR)] && streak < 999; d -= DAY) streak++;
  const totalMin = Math.round(logs.reduce((a, l) => a + l[4], 0) / 600);
  const rev = logs.filter(l => l[3] === 2);
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
  const acc = []; for (let i = 20; i >= 0; i--) { const k = dayKey(dayStart() - i * DAY + HOUR); acc.push(days[k] ? days[k].ok / days[k].n : null); }

  const byChap = groupStats(c => c.chap, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const byPrio = groupStats(c => prioOf(c), [5, 4, 3, 2, 1]);
  const byKind = groupStats(c => c.kind === 'Theorem' ? 'Satz' : c.kind, ['Definition', 'Satz', 'Lemma', 'Proposition', 'Korollar']);
  const problem = CARDS.filter(c => S.cards[c.id] && S.cards[c.id].st)
    .map(c => ({ c, x: S.cards[c.id] }))
    .sort((a, b) => ((b.x.lapses || 0) * 2 + (b.x.qBad || 0) + (b.x.D || 0) / 3) - ((a.x.lapses || 0) * 2 + (a.x.qBad || 0) + (a.x.D || 0) / 3))
    .filter(o => (o.x.lapses || 0) + (o.x.qBad || 0) > 0).slice(0, 10);
  const plan = planText();
  const grp = (title, arr, lbl) => `<div class="card"><h3>${title}</h3>
    <div class="legend"><span><i style="background:var(--good)"></i>sitzt (≥ 21 T)</span><span><i style="background:var(--easy)"></i>jung</span><span><i style="background:var(--hard)"></i>lernend</span><span><i style="background:var(--line)"></i>neu</span></div>
    <table class="t">${arr.map(g => `<tr><td style="width:38%">${lbl(g.k)}</td><td>${stackBar(g)}</td><td class="num" style="width:56px">${g.r == null ? '–' : Math.round(g.r * 100) + '%'}</td></tr>`).join('')}</table>
    <div class="muted small">Rechte Spalte: mittlere Abrufwahrscheinlichkeit heute (eingeführte Karten).</div></div>`;
  return `
  <div class="grid g4">
    <div class="card kpi"><div class="l">Bereitschaft Prüfung</div><div class="v">${Math.round(rd.exam * 100)}%</div><div class="s">heute ${Math.round(rd.now * 100)}%</div></div>
    <div class="card kpi"><div class="l">Sitzt sicher</div><div class="v">${sitzt}</div><div class="s">von ${CARDS.length} Karten</div></div>
    <div class="card kpi"><div class="l">Behaltensquote</div><div class="v">${retention == null ? '–' : Math.round(retention * 100) + '%'}</div><div class="s">bei fälligen Wiederholungen</div></div>
    <div class="card kpi"><div class="l">Serie</div><div class="v">${streak} T</div><div class="s">${totalMin} Min gesamt · ${logs.length} Bewertungen</div></div>
  </div>
  <h2>Plan bis zur Prüfung</h2><div class="card small">${plan}</div>
  <h2>Fortschritt</h2>
  <div class="grid">${grp('Nach Priorität', byPrio, k => `<span class="dot" style="background:${PRIO[k].color}"></span> ${PRIO[k].name}`)}
  ${grp('Nach Kapitel', byChap, k => `${k}. ${esc((window.CHAPTERS || {})[k] || '')}`)}
  ${grp('Nach Typ', byKind, k => k === 'Satz' ? 'Sätze/Theoreme' : k === 'Definition' ? 'Definitionen' : k === 'Lemma' ? 'Lemmata' : k === 'Proposition' ? 'Propositionen' : 'Korollare')}</div>
  <h2>Prognose: fällige Karten nächste 14 Tage</h2>
  <div class="card">${barChart(fc, i => i === 0 ? 'heute' : fmtDate(dayStart() + i * DAY).replace('.', ''))}</div>
  <h2>Aktivität</h2>
  <div class="card"><div class="heat">${heat}</div><div class="muted small" style="margin-top:6px">Letzte 18 Wochen, je dunkler desto mehr Bewertungen.</div>
    <h3 style="margin-top:14px">Anteil gewusst (≠ Nochmal), letzte 21 Tage</h3>${lineChart(acc)}</div>
  <h2>Problemkarten</h2>
  <div class="card" style="padding:4px 12px">${problem.length ? `<div class="list">${problem.map(o => liHTML(o.c)).join('')}</div>` : '<div class="empty muted small">Noch keine – sehr gut.</div>'}</div>`;
}
function planText() {
  const dte = daysToExam();
  const remaining = eligibleNew();
  const rem5 = remaining.filter(c => prioOf(c) === 5).length, rem4 = remaining.filter(c => prioOf(c) === 4).length;
  const npd = plannedNewPerDay();
  // Tempo der letzten 7 Tage
  const intro7 = CARDS.filter(c => { const x = S.cards[c.id]; return x && x.intro && x.intro > now() - 7 * DAY; }).length;
  const pace = intro7 / 7;
  const finish = pace > 0 ? now() + remaining.length / pace * DAY : null;
  const finishKern = pace > 0 ? now() + (rem5 + rem4) / pace * DAY : null;
  let s = `Prüfung am <b>${new Date(examTime()).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</b> (${dte > 0 ? 'in ' + dte + ' Tagen' : 'vorbei'}). `;
  if (!remaining.length) s += 'Alle Karten sind eingeführt – jetzt zählen nur noch die Wiederholungen. ';
  else {
    s += `Noch <b>${remaining.length}</b> Karten neu (davon ${rem5} Kern, ${rem4} Wichtig). Geplant: <b>${npd} neue/Tag</b> (Ziel: alles spätestens 3 Wochen vor der Prüfung eingeführt). `;
    if (pace > 0) s += `Dein Tempo der letzten 7 Tage: ${pace.toFixed(1)}/Tag → Kern & Wichtig eingeführt bis ${fmtDate(finishKern)}, alles bis ${fmtDate(finish)}${finish > examTime() - 14 * DAY ? ' <b style="color:var(--again)">– zu spät, bitte Tempo erhöhen</b>' : ' ✓'}. `;
  }
  const load7 = []; for (let i = 0; i < 7; i++) { const a = dayStart() + i * DAY; load7.push(CARDS.filter(c => { const x = S.cards[c.id]; return x && x.st && x.due < a + DAY && (i === 0 || x.due >= a); }).length); }
  s += `Erwartete Wiederholungen in den nächsten 7 Tagen: ${load7.reduce((a, b) => a + b, 0)} (≈ ${Math.round(load7.reduce((a, b) => a + b, 0) * 25 / 60 / 7)} Min/Tag).`;
  return s;
}
function barChart(vals, lbl) {
  const W = 420, H = 150, pad = 10, bw = (W - pad) / vals.length, max = Math.max(1, ...vals);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" role="img">${vals.map((v, i) => {
    const h = v / max * (H - 40); const x = pad + i * bw + 3, y = H - 20 - h;
    return `<rect x="${x}" y="${y}" width="${bw - 6}" height="${h}" rx="3" fill="${i === 0 ? 'var(--accent)' : 'color-mix(in srgb,var(--accent) 55%,transparent)'}"/>
      <text x="${x + (bw - 6) / 2}" y="${y - 4}" text-anchor="middle">${v || ''}</text>
      ${i % 2 === 0 ? `<text x="${x + (bw - 6) / 2}" y="${H - 6}" text-anchor="middle">${lbl(i)}</text>` : ''}`;
  }).join('')}</svg>`;
}
function lineChart(vals) {
  const W = 420, H = 120, pad = 30, n = vals.length;
  const pts = vals.map((v, i) => v == null ? null : [pad + i * (W - pad - 6) / (n - 1), 10 + (1 - v) * (H - 30)]);
  let path = '', open = false;
  pts.forEach(p => { if (!p) { open = false; return; } path += (open ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); open = true; });
  const grid = [1, 0.75, 0.5].map(g => `<line x1="${pad}" x2="${W}" y1="${10 + (1 - g) * (H - 30)}" y2="${10 + (1 - g) * (H - 30)}" stroke="var(--line)"/><text x="2" y="${13 + (1 - g) * (H - 30)}">${g * 100}%</text>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%">${grid}<path d="${path}" fill="none" stroke="var(--good)" stroke-width="2.5"/>${pts.map(p => p ? `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="var(--good)"/>` : '').join('')}<text x="${pad}" y="${H - 4}">vor 20 T</text><text x="${W - 30}" y="${H - 4}">heute</text></svg>`;
}

/* ============================================================
 * Einstellungen
 * ============================================================ */
function viewSettings() {
  const st = S.settings;
  return `
  <div class="card">
    <div class="field"><label for="sExam">Prüfungsdatum</label><input type="date" id="sExam" value="${esc(st.examDate)}">
      <span class="muted small">Steuert das Tempo der neuen Karten und sorgt dafür, dass alles kurz vor der Prüfung nochmals drankommt.</span></div>
    <div class="field"><label for="sNewMode">Neue Karten pro Tag</label>
      <div class="row"><select id="sNewMode"><option value="auto" ${st.newMode === 'auto' ? 'selected' : ''}>Automatisch (aktuell ${plannedNewPerDay()})</option><option value="manual" ${st.newMode === 'manual' ? 'selected' : ''}>Manuell</option></select>
      <input type="number" id="sNew" min="0" max="80" value="${st.newPerDay}" style="width:90px" ${st.newMode === 'auto' ? 'disabled' : ''}></div></div>
    <div class="field"><label for="sMax">Maximal Wiederholungen pro Tag</label><input type="number" id="sMax" min="20" max="1000" value="${st.maxReviews}"></div>
    <div class="field"><label><input type="checkbox" id="sRand" ${st.includeRand ? 'checked' : ''}> Randstoff (Priorität „Rand“) ebenfalls lernen</label></div>
    <div class="field"><label><input type="checkbox" id="sType" ${st.typeAnswer ? 'checked' : ''}> Notizfeld zum Aufschreiben vor dem Aufdecken anzeigen</label></div>
    <div class="field"><label for="sTheme">Darstellung</label><select id="sTheme"><option value="auto" ${st.theme === 'auto' ? 'selected' : ''}>Wie System</option><option value="light" ${st.theme === 'light' ? 'selected' : ''}>Hell</option><option value="dark" ${st.theme === 'dark' ? 'selected' : ''}>Dunkel</option></select></div>
  </div>
  ${Sync.ok ? '' : `<h2>Geräte abgleichen (GitHub)</h2>
  <div class="card">${gistSettingsHTML()}</div>`}
  <h2>Fortschritt sichern</h2>
  <div class="card">
    <div class="small" id="syncInfo">${Sync.ok ? '✓ Cloud-Sync aktiv: Dein Fortschritt wird in deinem claude.ai-Konto gespeichert und ist auf allen Geräten derselbe.' : 'Fortschritt wird in diesem Browser gespeichert (localStorage). Für ein anderes Gerät: unten exportieren und dort importieren.'}</div>
    <div class="row" style="margin-top:12px">
      <button class="btn" data-act="export">Export (JSON kopieren)</button>
      <button class="btn" data-act="exportfile">Als Datei speichern</button>
      <label class="btn">Datei importieren<input type="file" id="impFile" accept=".json,application/json" class="hide"></label>
      <button class="btn" data-act="importpaste">Text einfügen</button>
    </div>
  </div>
  <h2>Zurücksetzen</h2>
  <div class="card"><button class="btn" style="color:var(--again)" data-act="resetall">Gesamten Fortschritt löschen</button></div>
  <div class="muted small" style="margin:18px 4px">Private Lernhilfe, ohne Gewähr. Inhalte: Ausschnitte aus dem Skript «Analysis I und II» (Kapitel 1–9). Prioritäten & Beweis-Wahrscheinlichkeiten: eigene Schätzung aus alten Prüfungen. Algorithmus: FSRS-5.</div>`;
}

/* ============================================================
 * Modal, Toast, Theme
 * ============================================================ */
function modal(html) {
  closeModal();
  const m = document.createElement('div');
  m.className = 'modal'; m.id = 'modal';
  m.innerHTML = `<div class="sheet">${html}</div>`;
  m.addEventListener('click', e => { if (e.target === m) closeModal(); });
  document.body.appendChild(m);
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); }
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
  const on = (sel, ev, fn) => { const el = $(sel); if (el) el.addEventListener(ev, fn); };
  on('#cq', 'input', e => { cat.q = e.target.value; const pos = e.target.selectionStart; render(); const el = $('#cq'); el.focus(); el.setSelectionRange(pos, pos); });
  for (const [id, key] of [['#cchap', 'chap'], ['#ckind', 'kind'], ['#cprio', 'prio'], ['#cstat', 'status']]) on(id, 'change', e => { cat[key] = e.target.value; render(); });
  on('#sExam', 'change', e => { if (e.target.value) { S.settings.examDate = e.target.value; touchSettings(); rescheduleForExam(); } });
  on('#sNewMode', 'change', e => { S.settings.newMode = e.target.value; touchSettings(); render(); });
  on('#sNew', 'change', e => { S.settings.newPerDay = clamp(+e.target.value || 0, 0, 80); touchSettings(); });
  on('#sMax', 'change', e => { S.settings.maxReviews = clamp(+e.target.value || 200, 20, 1000); touchSettings(); });
  on('#sRand', 'change', e => { S.settings.includeRand = e.target.checked; touchSettings(); });
  on('#sType', 'change', e => { S.settings.typeAnswer = e.target.checked; touchSettings(); });
  on('#sTheme', 'change', e => { S.settings.theme = e.target.value; touchSettings(); render(); });
  on('#impFile', 'change', e => { const f = e.target.files[0]; if (f) f.text().then(importJSON); });
}
function touchSettings() { S.settings.u = now(); save(['settings']); toast('Gespeichert'); }
function rescheduleForExam() {
  for (const c of CARDS) { const x = S.cards[c.id]; if (x && x.st === 2) { x.due = capDue(c.id, x.due); } }
  save(['cards']);
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
  const z = t.closest('[data-zoom]');
  if (z && !t.closest('.zoombox')) { const c = BY_ID[z.dataset.zoom]; return modal(`<div class="row"><b>${esc(c.kind)} ${c.nr}</b><div class="spacer"></div><button class="btn ghost" data-act="close">✕</button></div><div class="zoombox"><img class="scan" src="img/${c.img}" alt=""></div><div class="muted small">Seitlich wischen zum Lesen. Querformat hilft auch.</div>`); }
  const li = t.closest('[data-card]');
  if (li && !act) return openCard(li.dataset.card);
  const ca = t.closest('[data-cardact]');
  if (ca && ca.tagName === 'BUTTON') return cardAction(ca.dataset.cardact, ca.dataset.id);
  if (!act) return;
  if (act.startsWith('tab:')) { session = null; return go(act.slice(4)); }
  switch (act) {
    case 'start': startSession(); break;
    case 'extra': {
      const ids = eligibleNew().slice(0, 10).map(c => c.id);
      if (!ids.length) { toast('Keine neuen Karten mehr'); break; }
      startSession(ids); break;
    }
    case 'home': session = null; render(); break;
    case 'reveal': session.revealed = true; render(); break;
    case 'undo': undo(); break;
    case 'quizstart': startQuiz('match', $('#qScope').value, +$('#qN').value); break;
    case 'teststart': startQuiz('test', $('#tScope').value, +$('#tN').value); break;
    case 'quiznext': quizNext(); break;
    case 'qreveal': quiz.revealed = true; render(); break;
    case 'quizend': quiz = null; render(); break;
    case 'learnwrong': { const ids = quiz.answers.filter(a => !a.ok).map(a => a.id); quiz = null; tab = 'heute'; startSession(ids); break; }
    case 'learnfiltered': { const ids = filteredCatalog().slice(0, 50).map(c => c.id); tab = 'heute'; startSession(ids); break; }
    case 'close': closeModal(); break;
    case 'export': exportJSON(); break;
    case 'gistconnect': { const v = ($('#gistTok') || {}).value || ''; if (v.trim().length < 20) { toast('Bitte gültigen Token einfügen'); break; } Gist.connect(v); break; }
    case 'gistoff': confirmBox('Abgleich auf diesem Gerät trennen? Der Fortschritt bleibt lokal und im Gist erhalten.', () => Gist.disconnect()); break;
    case 'gistsync': Gist.pull().then(() => Gist.push()); break;
    case 'exportfile': exportFile(); break;
    case 'importpaste': importPaste(); break;
    case 'resetall': confirmBox('Wirklich den gesamten Fortschritt löschen? Das kann nicht rückgängig gemacht werden.', () => { const st = S.settings; S = blankState(); S.settings = st; S.settings.u = now(); S.settings.resetAt = now(); Sync.wroteOnce = false; save(); render(); toast('Zurückgesetzt'); }); break;
  }
});
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
    if ((e.key === ' ' || e.key === 'Enter') && !session.revealed) { e.preventDefault(); session.revealed = true; render(); }
    else if (session.revealed && '1234'.includes(e.key)) rate(+e.key);
    else if (e.key === 'u' || e.key === 'U') undo();
  } else if (tab === 'quiz' && quiz && quiz.i < quiz.items.length) {
    if (quiz.type === 'match') {
      if (!quiz.picked && '1234'.includes(e.key)) quizAnswer(quiz.opts[+e.key - 1]);
      else if (quiz.picked && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); quizNext(); }
    } else if (!quiz.revealed && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); quiz.revealed = true; render(); }
    else if (quiz.revealed && '123'.includes(e.key)) quizAnswer(+e.key);
  }
  if (e.key === 'Escape') closeModal();
});

/* ---------- Export / Import ---------- */
function exportString() { return JSON.stringify({ app: 'ana1-lernen', exported: new Date().toISOString(), ...S }); }
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
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `analysis1-fortschritt-${dayKey()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    toast('Datei gespeichert');
  } catch (e) { showText(exportString()); }
}
function importPaste() {
  modal(`<h3>Fortschritt importieren</h3><p class="small muted">Export-Text einfügen. Die Daten werden mit dem aktuellen Stand zusammengeführt (pro Karte gilt der neuere Stand).</p><textarea class="note" id="impText" style="min-height:180px"></textarea><div class="row"><div class="spacer"></div><button class="btn" data-act="close">Abbrechen</button><button class="btn primary" id="impBtn">Importieren</button></div>`);
  $('#impBtn').addEventListener('click', () => importJSON($('#impText').value));
}
function importJSON(txt) {
  try {
    const o = JSON.parse(txt);
    if (!o.cards || !o.log) throw new Error('kein gültiger Export');
    mergeInto(o);
    save(); closeModal(); render(); toast('Import erfolgreich');
  } catch (e) { toast('Import fehlgeschlagen: ' + e.message); }
}
function mergeInto(o) {
  const ra = Math.max(S.settings.resetAt || 0, (o.settings && o.settings.resetAt) || 0);
  for (const [id, y] of Object.entries(o.cards || {})) {
    if (!BY_ID[id] || (y.u || 0) < ra) continue;
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
  ref(name) { return this.db.doc(`data/users/${this.uid}/${name}`); },
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
  if (document.visibilityState === 'hidden') { if (Sync.pending.size) Sync.flush(); if (Gist.dirty) Gist.push(); }
  else if (Gist.cfg.token && !session) Gist.pull(true);   // beim Zurückkehren neuesten Stand holen
});

/* ============================================================
 * Geräte-Abgleich über ein privates GitHub-Gist
 * Token + Gist-ID liegen nur lokal (eigener Schlüssel), nie im Export.
 * ============================================================ */
const GIST_KEY = 'ana1-gist-v1', GIST_FILE = 'analysis1-fortschritt.json';
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
        const g = list.find(g => g.files && g.files[GIST_FILE]);
        if (g) id = g.id;
        if (list.length < 100) break;
      }
      if (!id) {
        const g = await this.api('/gists', { method: 'POST', body: JSON.stringify({ description: 'Analysis I – Lernfortschritt (automatisch)', public: false, files: { [GIST_FILE]: { content: exportString() } } }) });
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
      const f = g.files && g.files[GIST_FILE];
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
      await this.api('/gists/' + this.cfg.gistId, { method: 'PATCH', body: JSON.stringify({ files: { [GIST_FILE]: { content: exportString() } } }) });
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
      <li>Token erstellen: <a href="https://github.com/settings/tokens/new?scopes=gist&description=Analysis-1-Lernen" target="_blank" rel="noopener">github.com/settings/tokens/new</a> – nur das Häkchen <b>gist</b>, Ablauf z. B. „No expiration“ oder nach der Prüfung.</li>
      <li>Token (beginnt mit <code>ghp_</code>) kopieren und hier einfügen.</li>
      <li>Auf dem zweiten Gerät denselben Token eintragen – das Gist wird automatisch gefunden.</li>
    </ol>
    <div class="row"><input id="gistTok" type="password" autocomplete="off" placeholder="ghp_…" style="flex:1;min-width:180px;border:1px solid var(--line);background:var(--bg);border-radius:10px;padding:9px 10px">
    <button class="btn primary" data-act="gistconnect">Verbinden</button></div>
    <div class="small muted" id="gistStatus" style="margin-top:6px">${esc(Gist.status)}</div>
    <div class="small muted" style="margin-top:6px">Der Token bleibt nur auf diesem Gerät gespeichert und ist nicht im Export enthalten.</div>`;
}

/* ============================================================
 * Start
 * ============================================================ */
render();
Sync.init();
Gist.init();
// Neuer Tag während die Seite offen ist → Übersicht aktualisieren
setInterval(() => { if (tab === 'heute' && !session) render(); }, 5 * 60e3);
