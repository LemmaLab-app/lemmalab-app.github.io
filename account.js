/* LemmaLab – Konto & Cloud-Speicher (Supabase)
 * Login mit Google oder 6-stelligem Code per Mail. Die Sitzung bleibt auf dem
 * Gerät gespeichert (automatisch erneuert). Lernstand liegt zusätzlich lokal,
 * damit alles offline funktioniert; online wird er zusammengeführt.
 * Der Publishable Key ist öffentlich – die Datenbank-Regeln (RLS) sorgen dafür,
 * dass jede Person nur ihren eigenen Lernstand lesen und schreiben kann.
 */
'use strict';
const SUPA_URL = 'https://bcqbxwiniuiousnnrpbf.supabase.co';
const SUPA_KEY = 'sb_publishable_EfxVTJbVzdgbptp3osRacg_GY-tlheD';
const LOCAL_MODE_KEY = 'lemmalab-localmode';
const ADMIN_EMAILS = ['lemmalab.app@gmail.com', 'martin.senn2@gmail.com'];   // nur Anzeige – die echte Prüfung macht die Datenbank (admin_stats)
const isAdmin = () => !!(Cloud.user && ADMIN_EMAILS.includes((Cloud.user.email || '').toLowerCase()));

/* ---------------- Mehrere Fächer in einem Konto ----------------
 * Die Datenbank hat pro Konto eine Zeile (progress.state). Analysis 1 liegt wie bisher
 * direkt in state (kompatibel mit älteren Versionen und tools/*.sql), jedes weitere Fach
 * unter state.subjects[<fach>]. Geladen ist immer nur ein Fach (S); die anderen liegen
 * lokal unter ihrem eigenen Schlüssel und werden beim Abgleich mit zusammengeführt. */
const FACH_IDS = Object.keys(window.FAECHER || { ana1: 1 });
function blankFor(id) { const st = blankState(); const f = (window.FAECHER || {})[id]; if (f && f.examDate) st.settings.examDate = f.examDate; return st; }
function localState(id) { return id === FACH ? S : (window.FachStore && FachStore.read(id)); }
function sigAll() { return JSON.stringify(FACH_IDS.map(id => { const st = localState(id); return st ? [st.cards, (st.log || []).length, st.settings] : null; })); }
function splitRemote(state) {
  const { subjects, ...base } = state || {};
  return { ana1: base, ...(subjects && typeof subjects === 'object' ? subjects : {}) };
}
function buildRemote() {
  const base = { ...(localState('ana1') || blankFor('ana1')) }; delete base.subjects;
  const subjects = {};
  for (const id of FACH_IDS) if (id !== 'ana1') { const st = localState(id); if (st && ((st.log || []).length || Object.keys(st.cards || {}).length || st.settings.u)) subjects[id] = st; }
  return Object.keys(subjects).length ? { ...base, subjects } : base;
}
function mergeOther(id, remote) {      // in den lokalen Stand eines nicht geladenen Fachs
  const keep = S;
  let st = FachStore.read(id) || blankFor(id);
  st.cards = st.cards || {}; st.log = st.log || []; st.settings = { ...blankFor(id).settings, ...(st.settings || {}) };
  try { S = st; mergeInto(remote, true); st = S; } finally { S = keep; }
  FachStore.write(id, st);
}

const Cloud = {
  sb: null, user: null, lastSent: '', busy: false, dirty: false, timer: null, status: '', lastSync: 0, ready: false,

  init() {
    if (!window.supabase || !window.supabase.createClient) { this.ready = true; maybeShowLogin(); return; }
    this.sb = window.supabase.createClient(SUPA_URL, SUPA_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', storageKey: 'lemmalab-auth' },
    });
    this.sb.auth.onAuthStateChange((event, session) => {
      const u = session ? session.user : null;
      const before = this.user;
      this.user = u;
      if (u && (!before || before.id !== u.id)) this.onLogin(u);
      updateAccountUI();
    });
    this.sb.auth.getSession().then(({ data }) => {
      this.user = data && data.session ? data.session.user : null;
      this.ready = true;
      // OAuth-Rückkehr: ?code=… aus der Adresse entfernen
      if (/[?&](code|error)=/.test(location.search)) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { } }
      if (this.user) this.onLogin(this.user); else maybeShowLogin();
      updateAccountUI();
    }).catch(() => { this.ready = true; maybeShowLogin(); });
  },

  onLogin(u) {
    try { localStorage.removeItem(LOCAL_MODE_KEY); } catch (e) { }
    // Anderes Konto als der lokale Stand? Dann lokalen Stand nicht vermischen.
    if (S.owner && S.owner !== u.id) {
      const st = S.settings; S = blankState(); S.settings = { ...st, resetAt: 0 };
    }
    S.owner = u.id;
    for (const id of FACH_IDS) if (id !== FACH && window.FachStore) {
      const o = FachStore.read(id);
      if (o && o.owner && o.owner !== u.id) { const n = blankFor(id); n.settings = { ...o.settings, resetAt: 0 }; FachStore.write(id, n); }
    }
    try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { }
    hideLogin();
    this.sync();
  },

  /* Lesen – zusammenführen – schreiben (so geht auf keinem Gerät etwas verloren) */
  async sync() {
    if (!this.sb || !this.user || this.busy) { if (this.busy) this.dirty = true; return; }
    if (!navigator.onLine) { this.setStatus('offline – wird später abgeglichen'); return; }
    this.busy = true; this.dirty = false;
    this.setStatus('Abgleich …');
    try {
      // Zuerst nur den Zeitstempel holen (wenige Bytes). Den ganzen Lernstand nur
      // herunterladen, wenn ein anderes Gerät seit dem letzten Abgleich etwas gespeichert hat.
      // Spart Datenvolumen (Supabase-Gratis-Kontingent: 5 GB pro Monat).
      const { data: meta, error } = await this.sb.from('progress').select('updated_at').eq('user_id', this.user.id).maybeSingle();
      if (error) throw error;
      const remoteMs = meta && meta.updated_at ? Date.parse(meta.updated_at) : 0;
      const known = this.knownAt();
      const before = sigAll();
      const beforeHere = JSON.stringify([S.cards, S.log.length, S.settings]);
      if (remoteMs && remoteMs !== known) {
        const { data, error: e1 } = await this.sb.from('progress').select('state').eq('user_id', this.user.id).maybeSingle();
        if (e1) throw e1;
        if (data && data.state) {
          const parts = splitRemote(data.state);
          for (const [id, part] of Object.entries(parts)) {
            if (!part || !FACH_IDS.includes(id)) continue;
            if (id === FACH) mergeInto(part); else mergeOther(id, part);
          }
        }
      }
      S.owner = this.user.id;
      const changedLocal = before !== sigAll();
      try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { }
      const changedHere = changedLocal || before !== this.lastSent || !remoteMs;
      if (changedHere || remoteMs !== known) {
        const at = new Date().toISOString();
        const { error: e2 } = await this.sb.from('progress').upsert({ user_id: this.user.id, state: buildRemote(), updated_at: at });
        if (e2) throw e2;
        this.setKnownAt(Date.parse(at));
      }
      this.lastSent = sigAll();
      this.lastSync = Date.now();
      this.setStatus('✓ gespeichert ' + new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }));
      if (beforeHere !== JSON.stringify([S.cards, S.log.length, S.settings]) && !session && !quiz) render();
    } catch (e) {
      console.warn('Cloud-Sync', e);
      this.setStatus('⚠︎ Abgleich ausstehend');
      this.dirty = true;
      clearTimeout(this.timer); this.timer = setTimeout(() => this.sync(), 30000);
    } finally {
      this.busy = false;
      if (this.dirty) { clearTimeout(this.timer); this.timer = setTimeout(() => this.sync(), 3000); }
    }
  },
  knownAt() { try { const o = JSON.parse(localStorage.getItem('lemmalab-cloudat') || '{}'); return o.u === (this.user && this.user.id) ? o.t : 0; } catch (e) { return 0; } },
  setKnownAt(t) { try { localStorage.setItem('lemmalab-cloudat', JSON.stringify({ u: this.user.id, t })); } catch (e) { } },
  schedule() {
    if (!this.user) return;
    this.dirty = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.sync(), 3000);
  },
  setStatus(t) { this.status = t; const el = $('#cloudStatus'); if (el) el.textContent = t; updatePillCloud(); },

  async signInGoogle() {
    if (!this.sb) return toast('Keine Verbindung');
    const { error } = await this.sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
    if (error) toast('Google-Anmeldung fehlgeschlagen: ' + error.message);
  },
  async sendCode(email) {
    const { error } = await this.sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) throw error;
  },
  async verifyCode(email, token) {
    const { error } = await this.sb.auth.verifyOtp({ email, token, type: 'email' });
    if (error) throw error;
  },
  async signOut() {
    if (this.dirty || Date.now() - this.lastSync > 5000) { try { await this.sync(); } catch (e) { } }
    try { await this.sb.auth.signOut(); } catch (e) { }
    try { localStorage.removeItem('lemmalab-cloudat'); } catch (e) { }
    this.user = null;
    // Lokale Kopie entfernen (liegt ja im Konto) – wichtig auf fremden Geräten
    const st = S.settings; S = blankState(); S.settings = { ...st, resetAt: 0 };
    try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { }
    for (const id of FACH_IDS) if (id !== FACH && window.FachStore) { const o = FachStore.read(id); if (o) { const n = blankFor(id); n.settings = { ...o.settings, resetAt: 0 }; FachStore.write(id, n); } }
    session = null; quiz = null;
    render(); showLogin();
  },
  async deleteCloudData() {
    if (!this.user) return;
    const { error } = await this.sb.from('progress').delete().eq('user_id', this.user.id);
    if (error) return toast('Löschen fehlgeschlagen: ' + error.message);
    toast('Cloud-Daten gelöscht');
    await this.signOut();
  },
};

/* ---------------- Login-Bildschirm ---------------- */
function maybeShowLogin() {
  let local = false;
  try { local = localStorage.getItem(LOCAL_MODE_KEY) === '1'; } catch (e) { }
  if (!Cloud.user && !local) showLogin();
}
function showLogin() {
  if ($('#login')) return;
  const el = document.createElement('div');
  el.id = 'login';
  el.innerHTML = `
  <div class="lbox">
    <img src="icons/favicon.svg" alt="" class="llogo">
    <h1>LemmaLab</h1>
    <p class="muted">Mit Spaced Repetition für die Prüfungen lernen</p>
    <button class="gbtn" id="lgGoogle"><svg viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.4-.4-3.5z"/></svg>Mit Google anmelden</button>
    <div class="lor"><span>oder mit E-Mail-Code</span></div>
    <div id="lgMail">
      <input type="email" id="lgEmail" placeholder="deine@email.ch" autocomplete="email" inputmode="email">
      <button class="btn" id="lgSend">Code senden</button>
    </div>
    <div id="lgCodeBox" class="hide">
      <p class="small muted" id="lgCodeInfo"></p>
      <input type="text" id="lgCode" placeholder="6-stelliger Code" inputmode="numeric" autocomplete="one-time-code" maxlength="8">
      <button class="btn primary" id="lgVerify">Anmelden</button>
    </div>
    <p class="small muted lnote">Du bleibst auf diesem Gerät angemeldet. Dein Lernstand wird mit deinem Konto auf allen Geräten abgeglichen.</p>
    <button class="linkbtn" id="lgLocal">Ohne Konto weiter (nur auf diesem Gerät)</button>
    <div class="small"><a href="datenschutz.html" class="muted">Datenschutz</a></div>
  </div>`;
  document.body.appendChild(el);
  const email = () => ($('#lgEmail').value || '').trim();
  $('#lgGoogle').onclick = () => Cloud.signInGoogle();
  $('#lgSend').onclick = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email())) return toast('Bitte gültige E-Mail-Adresse eingeben');
    $('#lgSend').disabled = true;
    try {
      await Cloud.sendCode(email());
      $('#lgCodeBox').classList.remove('hide');
      $('#lgCodeInfo').textContent = 'Code an ' + email() + ' geschickt (auch im Spam-Ordner nachsehen).';
      $('#lgCode').focus();
    } catch (e) { toast('Senden fehlgeschlagen: ' + e.message); }
    $('#lgSend').disabled = false;
  };
  $('#lgVerify').onclick = async () => {
    const code = ($('#lgCode').value || '').replace(/\s/g, '');
    if (code.length < 6) return toast('Bitte den Code aus der Mail eingeben');
    $('#lgVerify').disabled = true;
    try { await Cloud.verifyCode(email(), code); } catch (e) { toast('Code ungültig oder abgelaufen'); }
    $('#lgVerify').disabled = false;
  };
  $('#lgCode').addEventListener('keydown', e => { if (e.key === 'Enter') $('#lgVerify').click(); });
  $('#lgEmail').addEventListener('keydown', e => { if (e.key === 'Enter') $('#lgSend').click(); });
  $('#lgLocal').onclick = () => { try { localStorage.setItem(LOCAL_MODE_KEY, '1'); } catch (e) { } hideLogin(); };
}
function hideLogin() { const el = $('#login'); if (el) el.remove(); }

/* ---------------- Anzeige ---------------- */
function updatePillCloud() {
  if (!Cloud.user) return;
  setPill(Cloud.status.startsWith('⚠︎') ? '⚠︎ Abgleich' : Cloud.status.startsWith('offline') ? 'offline' : '☁︎ angemeldet');
}
function updateAccountUI() {
  if (Cloud.user) updatePillCloud(); else setPill('lokal');
  if (typeof tab !== 'undefined' && (tab === 'mehr' || tab === 'admin') && !session && !quiz) render();
}
function accountSettingsHTML() {
  if (Cloud.user) {
    const m = Cloud.user.user_metadata || {};
    const av = m.avatar_url ? `<img class="av" src="${esc(m.avatar_url)}" alt="" referrerpolicy="no-referrer">` : `<span class="av accav">${esc((Cloud.user.email || '?')[0].toUpperCase())}</span>`;
    return UI.group([
      `<div class="ir iprof">${av}<span class="ir-l"><b>${esc(m.full_name || m.name || 'Angemeldet')}</b><small>${esc(Cloud.user.email || '')}</small></span></div>`,
      isAdmin() ? UI.action('Admin', 'tab:admin', { chev: true }) : '',
      UI.action('Abmelden', 'logout', { danger: true }),
    ], { footer: `<span id="cloudStatus">${esc(Cloud.status || '')}</span>` });
  }
  return UI.group([
    UI.action('Anmelden', 'login', { chev: true }),
  ], { footer: 'Damit dein Fortschritt auf allen Geräten gleich ist.' });
}

document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const act = a.dataset.act;
  if (act === 'login') { showLogin(); }
  else if (act === 'logout') confirmBox('Abmelden? Der Lernstand bleibt in deinem Konto gespeichert und wird auf diesem Gerät entfernt.', () => Cloud.signOut());
  else if (act === 'cloudsync') Cloud.sync();
  else if (act === 'adminload') Admin.load(true);
  else if (act === 'clouddelete') confirmBox('Deinen gesamten Lernstand in der Cloud und auf diesem Gerät löschen? Das kann nicht rückgängig gemacht werden.', () => Cloud.deleteCloudData());
});
window.addEventListener('online', () => Cloud.sync());
document.addEventListener('visibilitychange', () => {
  if (!Cloud.user) return;
  if (document.visibilityState === 'hidden') { if (Cloud.dirty) Cloud.sync(); }
  else if (!session && Date.now() - Cloud.lastSync > 60000) Cloud.sync();
});

/* ---------------- Admin-Bereich ----------------
 * Zeigt nur zusammengefasste Zahlen über alle Konten (keine E-Mails/Namen).
 * Daten kommen aus der Datenbank-Funktion admin_stats() (tools/admin.sql),
 * die selbst prüft, ob das angemeldete Konto das Admin-Konto ist. */
const Admin = {
  data: null, err: '', loading: false, at: 0,
  async load(force) {
    if (this.loading || !Cloud.sb || !Cloud.user) return;
    if (!force && this.data && Date.now() - this.at < 5 * 60e3) return;
    this.loading = true; this.err = ''; if (tab === 'admin') render();
    try {
      const { data, error } = await Cloud.sb.rpc('admin_stats');
      if (error) throw error;
      this.data = data; this.at = Date.now();
    } catch (e) {
      const m = (e && (e.message || e.code)) || String(e);
      this.err = /not authorized|42501/.test(m) ? 'Kein Zugriff – nur für Admin-Konten. (Falls du Admin bist: tools/admin.sql nochmals im Supabase SQL Editor ausführen.)'
        : /admin_stats|PGRST202|function/i.test(m) ? 'Die Datenbank-Funktion fehlt noch: tools/admin.sql im Supabase SQL Editor ausführen.'
        : navigator.onLine ? 'Laden fehlgeschlagen: ' + m : 'Offline – Admin-Statistik braucht Internet.';
    }
    this.loading = false;
    if (tab === 'admin' && !session && !quiz) render();
  },
};

function viewAdmin() {
  const head = `<div class="row" style="margin:4px 0 12px"><button class="btn ghost" data-act="tab:mehr" title="Zurück">←</button>
    <h2 style="margin:0">Admin</h2><div class="spacer"></div>
    <button class="btn" data-act="adminload" ${Admin.loading ? 'disabled' : ''}>${Admin.loading ? 'Lädt …' : '↻ Aktualisieren'}</button></div>`;
  if (!Cloud.ready) return head + `<div class="card muted">Anmeldung wird geprüft …</div>`;
  if (!isAdmin()) return head + `<div class="card">Dieser Bereich ist nur für Admin-Konten.</div>`;
  if (!Admin.data && !Admin.loading && !Admin.err) setTimeout(() => Admin.load(), 0);
  const tune = typeof Tune !== 'undefined' ? Tune.html() : '';
  if (Admin.err) return head + tune + `<div class="card" style="color:var(--again)">${esc(Admin.err)}</div>`;
  const d = Admin.data;
  if (!d) return head + tune + `<div class="card muted">Statistik wird geladen …</div>`;
  const u = d.users || {}, T = d.totals || {}, daily = d.daily || [];
  const num = x => Number(x || 0).toLocaleString('de-CH');
  const pct = x => x == null ? '–' : Math.round(x * 100) + '%';
  const hrs = m => { m = Number(m || 0); return m < 90 ? Math.round(m) + ' Min' : (m / 60).toFixed(m < 600 ? 1 : 0) + ' Std'; };
  const kpi = (v, l) => `<div class="kpi center"><div class="v">${v}</div><div class="l">${l}</div></div>`;
  const dl = i => { const p = (daily[i] || {}).day || ''; return (i % 5 === 4 || i === daily.length - 1) && p ? p.slice(8, 10) + '.' + p.slice(5, 7) + '.' : ''; };
  const prov = Object.entries(u.providers || {}).map(([k, n]) => `${k === 'google' ? 'Google' : k === 'email' ? 'E-Mail-Code' : esc(k)}: <b>${num(n)}</b>`).join(' · ') || '–';

  const cards = (d.cards || []).filter(c => BY_ID[c.id]);
  const hard = cards.filter(c => c.rev >= 3).map(c => ({ ...c, r: c.again / c.rev })).sort((a, b) => b.r - a.r || b.rev - a.rev).slice(0, 15);
  const slow = cards.filter(c => c.n >= 3).sort((a, b) => b.avgS - a.avgS).slice(0, 10);
  const most = cards.slice().sort((a, b) => b.users - a.users || b.n - a.n).slice(0, 10);
  const row = (c, right) => { const k = BY_ID[c.id]; return `<li data-card="${esc(c.id)}" style="cursor:pointer;display:flex;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid var(--line)">${kindTag(k)}<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(k.title || '')}</span><span class="small muted" style="white-space:nowrap">${right}</span></li>`; };
  const list = (arr, f, empty) => arr.length ? `<ul style="list-style:none;margin:0;padding:0">${arr.map(c => row(c, f(c))).join('')}</ul>` : `<div class="small muted">${empty}</div>`;

  return head + tune + `
  <div class="small muted" style="margin:-4px 0 12px">Nur zusammengefasste Zahlen aller Konten · Stand ${new Date(d.generated || Admin.at).toLocaleString('de-CH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
  <h2>Nutzer</h2>
  <div class="grid g4">${kpi(num(u.total), 'Konten')}${kpi(num(u.active1), 'aktiv (24 h)')}${kpi(num(u.active7), 'aktiv (7 T)')}${kpi(num(u.active30), 'aktiv (30 T)')}</div>
  <div class="card small" style="margin-top:10px">
    Neu: <b>${num(u.new7)}</b> in 7 Tagen · <b>${num(u.new30)}</b> in 30 Tagen<br>
    Haben schon gelernt: <b>${num(u.learning)}</b> · an ≥ 2 Tagen: <b>${num(u.days2)}</b> · an ≥ 7 Tagen: <b>${num(u.days7)}</b><br>
    Anmeldung: ${prov}</div>
  <h2>Lernen</h2>
  <div class="grid g4">${kpi(num(T.reviews), 'Bewertungen total')}${kpi(hrs(T.minutes), 'Lernzeit total')}${kpi(num(T.reviews7), 'Bewertungen (7 T)')}${kpi(pct(T.retention), 'Wiederholungen gewusst')}</div>
  <div class="card small" style="margin-top:10px">
    Lernzeit letzte 7 Tage: <b>${hrs(T.minutes7)}</b><br>
    Pro lernender Person (Median): <b>${hrs(T.medianMinutesPerUser)}</b> Lernzeit · <b>${num(Math.round(T.medianDaysPerUser || 0))}</b> Lerntage · <b>${num(Math.round(T.medianIntro || 0))}</b> Karten begonnen</div>
  <h2>Aktive Nutzer pro Tag (30 Tage)</h2>
  <div class="card">${barChart(daily.map(x => x.users), dl, daily.length - 1)}</div>
  <h2>Bewertungen pro Tag (30 Tage)</h2>
  <div class="card">${barChart(daily.map(x => x.reviews), dl, daily.length - 1)}</div>
  <h2>Schwierigste Karten</h2>
  <div class="card"><div class="small muted" style="margin-bottom:6px">Anteil «Nochmal» bei Wiederholungen (mind. 3 Wiederholungen)</div>
    ${list(hard, c => `${Math.round(c.r * 100)}% · ${c.rev}×`, 'Noch zu wenige Wiederholungen.')}</div>
  <h2>Längste Bearbeitungszeit</h2>
  <div class="card">${list(slow, c => `Ø ${fmtSec(c.avgS)} · ${c.n}×`, 'Noch zu wenige Daten.')}</div>
  <h2>Von den meisten gelernt</h2>
  <div class="card">${list(most, c => `${c.users} Pers. · ${c.n}×`, 'Noch keine Daten.')}</div>`;
}

Cloud.init();
