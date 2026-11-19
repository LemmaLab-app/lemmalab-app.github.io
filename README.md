# Analysis I – Definitionen & Sätze lernen

Private Lernhilfe, nur für den Eigengebrauch, ohne Gewähr.

Lern-Website (Anki + Quizlet in einem) für **alle 228 Definitionen, Sätze, Theoreme, Lemmata,
Propositionen und Korollare aus Kapitel 1–9** des Skripts «Analysis I und II».
Die Aussagen sind exakt aus dem Skript ausgeschnitten (keine Abtippfehler).

## Funktionen
- **Lernen (Spaced Repetition, FSRS-5):** Titel → Aussage selbst formulieren → aufdecken → Nochmal/Schwer/Gut/Einfach.
  Der Algorithmus plant jede Karte kurz vor dem Vergessen; Fortschritt wird gespeichert, es geht jeden Tag dort weiter, wo du warst.
- **Prüfungs-Priorisierung:** 5 Stufen (Kern, Wichtig, Solide, Ergänzung, Rand). Neue Karten kommen in dieser Reihenfolge,
  Kernstoff wird auf 95 % Abrufsicherheit gehalten, Randstoff auf 85 %. Beweis-Wahrscheinlichkeiten aus dem Repo
  *Prozentuale-Wichtigkeit-der-Beweise-Analysis-1* werden angezeigt.
- **Prüfungsdatum:** Tempo der neuen Karten wird automatisch berechnet (alles spätestens 3 Wochen vor der Prüfung eingeführt);
  keine Wiederholung wird über die Prüfung hinaus geplant – alles kommt in den letzten Tagen noch einmal.
- **Quiz (Zuordnen):** Aussage ohne Titel, richtigen Namen wählen. Fehler kommen am selben Tag im Lernmodus zurück.
- **Prüfungstest:** gewichtete Zufallsauswahl, Selbstbewertung fliesst in den Lernplan ein.
- **Katalog:** Suche, Filter (Kapitel, Typ, Priorität, Status), Detailansicht mit Statistik, Priorität ändern, markieren, pausieren.
- **Statistik:** Prüfungsbereitschaft, Fortschritt nach Priorität/Kapitel/Typ, Prognose, Aktivität, Problemkarten, Plan bis zur Prüfung.

## Benutzen
- **GitHub Pages:** https://teddy8002.github.io/Analysis-1-Definitionen-und-S-tze-lernen/ – unter *Einstellungen → Geräte abgleichen*
  einmal pro Gerät einen GitHub-Token (nur Recht `gist`) eintragen; der Fortschritt wird dann in einem privaten Gist gespeichert
  und ist auf iPhone und Mac derselbe.
- **Lokal:** `index.html` im Browser öffnen (funktioniert offline). Fortschritt liegt im `localStorage` des Browsers;
  Export/Import unter *Einstellungen*.
- **Als claude.ai-Artifact:** Fortschritt wird zusätzlich im claude.ai-Konto gespeichert und ist auf iPhone und Mac derselbe.

Tastatur: Leertaste = aufdecken, 1–4 = bewerten, U = rückgängig.

## Dateien
- `index.html`, `app.js` – App (keine Abhängigkeiten)
- `data.js`, `img/` – Karten (automatisch erzeugt)
- `tools/extract.py` – schneidet die Einträge aus dem Skript-PDF aus; `tools/build_data.py` – erzeugt `data.js`;
  `tools/meta.py` – Prioritäten, ergänzte Titel und Merkhinweise (hier anpassen)
