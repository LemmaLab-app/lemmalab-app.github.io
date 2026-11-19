/* LemmaLab – Fächer
 * Jedes Fach hat eigene Karten, eigenen Lernstand (eigener localStorage-Schlüssel),
 * eigenes Prüfungsdatum und eigene Statistik. Gewechselt wird per Neuladen,
 * damit sich die Fächer nie vermischen.
 * Diese Datei muss vor app.js geladen werden: sie lädt die Kartendaten des aktiven Fachs.
 */
'use strict';
window.FAECHER = {
  ana1: {
    name: 'Analysis 1', short: 'Analysis', sub: 'Definitionen & Sätze',
    ls: 'lemmalab-v1',                         // bisheriger Schlüssel (Fortschritt bleibt erhalten)
    scripts: ['data.js', 'logic.js'],
    gist: 'lemmalab-fortschritt.json', syncPrefix: '', examDate: '2027-01-25', accent: null,
  },
  phy1: {
    name: 'Physik 1', short: 'Physik', sub: 'Gesetze, Formeln & Konzeptfragen',
    ls: 'lemmalab-phy1-v1',
    scripts: ['physik.js'],
    gist: 'lemmalab-physik1.json', syncPrefix: 'phy1-', examDate: '2027-02-01', accent: 'phy',
  },
  inf1: {
    name: 'Informatik', short: 'Informatik', sub: 'C++: Konzepte & Code-Tracing',
    ls: 'lemmalab-inf1-v1',
    scripts: ['informatik.js'],
    gist: 'lemmalab-informatik.json', syncPrefix: 'inf1-', examDate: '2027-02-08', accent: 'inf',
  },
};
window.FACH_KEY = 'lemmalab-fach';
window.FACH = (() => {
  let f = null;
  try { f = new URLSearchParams(location.search).get('fach') || localStorage.getItem(window.FACH_KEY); } catch (e) { }
  return window.FAECHER[f] ? f : 'ana1';
})();
try { localStorage.setItem(window.FACH_KEY, window.FACH); } catch (e) { }
if (window.FAECHER[window.FACH].accent) document.documentElement.setAttribute('data-fach', window.FAECHER[window.FACH].accent);

/* Lernstand eines (auch nicht aktiven) Fachs lesen/schreiben – für Konto-Abgleich und Fachwahl */
window.FachStore = {
  read(id) { try { return JSON.parse(localStorage.getItem(window.FAECHER[id].ls) || 'null'); } catch (e) { return null; } },
  write(id, st) { try { localStorage.setItem(window.FAECHER[id].ls, JSON.stringify(st)); } catch (e) { } },
  others() { return Object.keys(window.FAECHER).filter(k => k !== window.FACH); },
};
window.switchFach = id => {
  if (!window.FAECHER[id] || id === window.FACH) return;
  try { localStorage.setItem(window.FACH_KEY, id); } catch (e) { }
  location.replace(location.pathname + '?fach=' + id + '#heute');   // neue Adresse → Seite lädt neu
};

(() => {
  const v = (document.currentScript && (document.currentScript.src.match(/[?&]v=([^&]+)/) || [])[1]) || '';
  for (const s of window.FAECHER[window.FACH].scripts) document.write(`<script src="${s}${v ? '?v=' + v : ''}"><\/script>`);
})();
