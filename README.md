<p align="center"><img src="icons/icon-512.png" width="140" alt="LemmaLab"></p>

# LemmaLab – Analysis 1, Physik 1, Informatik & Lineare Algebra lernen

Private Lernhilfe, nur für den Eigengebrauch, ohne Gewähr.

Lern-Website (Anki + Quizlet in einem) mit vier getrennten **Fächern** (Umschalter oben über dem Seitentitel
bzw. *Einstellungen → Fach*). Jedes Fach hat eigene Karten, eigenen Lernplan, eigenes Prüfungsdatum und eigene Statistik.

- **Analysis 1:** alle 228 Definitionen, Sätze, Theoreme, Lemmata, Propositionen und Korollare aus Kapitel 1–9
  des Vorlesungsskripts. Die Aussagen sind exakt aus dem Skript ausgeschnitten (keine Abtippfehler).
- **Physik 1** (Skript Ensslin HS25, Formelsammlung HS26): 131 Karten zu Kapitel 2–10 – Gesetze, Formeln, Definitionen,
  **Konzeptfragen** (wie im Single-Choice-Teil) und **Rezepte** (Lösungswege, z. B. Kreisprozess, Trägheitsmoment per Integral).
  Prioritäten aus der Auswertung der Prüfungen HS23–FS26 und des Probeexams HS26 (Thermodynamik, starrer Körper,
  Stösse, Schwingungen und Gravitation = Kern). Karten mit *✎ Nicht auf der Formelsammlung* zeigen, was man selbst
  auf die Formelsammlung schreiben sollte. Quelle: `physik.js` (von Hand gepflegt, Formeln mit KaTeX).
- **Informatik** (C++): 102 Karten in 10 Kapiteln (Ganzzahlen, Kontrollfluss, Fliesskomma, Funktionen, Referenzen,
  Vektoren/Strings, Rekursion/EBNF, Klassen/Operatoren, Zeiger/dynamischer Speicher, Vererbung). Kern sind 62
  **Code-Karten «Was passiert?»**: der Code steht schon vor dem Aufdecken da, man bestimmt die Ausgabe – oder erkennt den
  versteckten Fehler (Kompilierfehler, undefiniertes Verhalten, Endlosschleife, logischer Fehler), wie in der Prüfung.
  Jede Code-Karte ist mit g++ geprüft: `node tools/test_informatik.mjs`. Prioritäten sind (noch) eine Einschätzung,
  keine Auswertung alter Prüfungen. Quelle: `informatik.js` (von Hand gepflegt; ⟦…⟧ = Inline-Code, ⟪…⟫ = Code-Block).
- **Lineare Algebra** (LA I & II als ein Fach, Prüfung nach LA II): 358 Karten, wie bei Analysis exakt ausgeschnitten.
  Vorrang hat die **Mitschrift der Vorlesung** (99 Einträge aus §0–§10: algebraische Strukturen, Vektorräume, Basen,
  Unterräume/Quotienten, Dualraum, Hom(V,W), Basiswechsel, duale Abbildung, Kern/Bild/Rang; Karopapier entfernt).
  Stoff, der in der Mitschrift noch fehlt, kommt aus dem Skript von Menny Akka Ginosar (259 Einträge: Rang und LGS,
  Determinanten, Eigenwerte, Skalarprodukte, Spektralsätze, Bilinearformen, Jordan-Normalform, Annulator, Tensorprodukt);
  diese Karten sind eine Prioritätsstufe tiefer eingeordnet. Prioritäten aus alten Prüfungen LA I/II.
  Quelle: `linalg.js` (erzeugt mit `tools/linalg/`, siehe dortiges README).

## Funktionen
- **Lernen (Spaced Repetition, FSRS-6):** Titel → Aussage selbst formulieren → aufdecken → nach rechts (gewusst) oder links (nicht gewusst) wischen. Persönliches Modell wird im Browser trainiert; die Schwierigkeit neuer Karten kommt aus anonymen Daten aller Nutzer (`tools/community.sql`).
  Der Algorithmus plant jede Karte kurz vor dem Vergessen; Fortschritt wird gespeichert, es geht jeden Tag dort weiter, wo du warst.
- **Prüfungs-Priorisierung:** 5 Stufen (Kern, Wichtig, Solide, Ergänzung, Rand). Neue Karten kommen in dieser Reihenfolge,
  Kernstoff wird auf 95 % Abrufsicherheit gehalten, Randstoff auf 85 %. Beweis-Wahrscheinlichkeiten aus der
  Auswertung alter Prüfungen werden angezeigt.
- **Prüfungsdatum:** Tempo der neuen Karten wird automatisch berechnet (alles spätestens 3 Wochen vor der Prüfung eingeführt);
  keine Wiederholung wird über die Prüfung hinaus geplant – alles kommt in den letzten Tagen noch einmal.
- **Quiz (Zuordnen):** Aussage ohne Titel, richtigen Namen wählen. Fehler kommen am selben Tag im Lernmodus zurück.
- **Prüfungstest:** gewichtete Zufallsauswahl, Selbstbewertung fliesst in den Lernplan ein.
- **Katalog:** Suche, Filter (Kapitel, Typ, Priorität, Status), Detailansicht mit Statistik, Priorität ändern, markieren, pausieren.
- **Lernzeit-Messung:** pro Bewertung Denkzeit (bis Aufdecken) und Prüfzeit (bis Bewertung), nur bei sichtbarer Seite.
  Auswertung nach Typ, Priorität, Ergebnis und Tageszeit, Zeitfresser, Sitzungen; optionales Tages-Zeitbudget;
  Export aller Lerndaten als CSV (`zeitpunkt;karte;…;denkzeit_s;pruefzeit_s;gesamt_s`).
- **Prädikatenlogik:** zu 198 Einträgen eine Formulierung mit Quantoren (∀, ∃, ⇒ …), nach dem Aufdecken unter dem Skript-Ausschnitt
  (Quelle: `tools/logic.py`, gerendert mit KaTeX aus `vendor/katex`). Bei den übrigen steht die formale Version schon im Skript.
- **Statistik:** Prüfungsbereitschaft, Fortschritt nach Priorität/Kapitel/Typ, Prognose, Aktivität, Problemkarten, Plan bis zur Prüfung.

## Benutzen
- **GitHub Pages:** https://lemmalab-app.github.io/ – unter *Einstellungen → Geräte abgleichen*
  einmal pro Gerät einen GitHub-Token (nur Recht `gist`) eintragen; der Fortschritt wird dann in einem privaten Gist gespeichert
  und ist auf iPhone und Mac derselbe.
- **Offline:** Ein Service Worker (`sw.js`) speichert beim ersten Öffnen alle Dateien (inkl. Bilder) auf dem Gerät.
  Nach Änderungen an Dateien `python3 tools/build_sw.py` ausführen, damit Geräte die neue Version holen.
- **Lokal:** `index.html` im Browser öffnen (funktioniert offline). Fortschritt liegt im `localStorage` des Browsers;
  Export/Import unter *Einstellungen*.
- **Als claude.ai-Artifact:** Fortschritt wird zusätzlich im claude.ai-Konto gespeichert und ist auf iPhone und Mac derselbe.

Karte umdrehen (in beide Richtungen): Leertaste oder Karte antippen. Tastatur: 1–4 bzw. ←/→ = bewerten, U = rückgängig.

## Fächer & Speicher
- `fach.js` legt die Fächer fest und lädt die Karten des aktiven Fachs (`data.js` + `logic.js`, `physik.js`, `informatik.js` bzw. `linalg.js`).
- Lernstand pro Fach im `localStorage` (`lemmalab-v1` = Analysis wie bisher, `lemmalab-phy1-v1` = Physik, `lemmalab-inf1-v1` = Informatik, `lemmalab-la-v1` = Lineare Algebra).
- Konto (Supabase): eine Zeile pro Konto; Analysis liegt wie bisher in `state`, weitere Fächer unter `state.subjects.<fach>`.
  Damit auch Physik-Karten im «Wissen aller Nutzer» landen, `tools/community.sql` nochmals im Supabase SQL Editor ausführen.
- Gist-Abgleich: pro Fach eine eigene Datei im selben privaten Gist.

## Dateien
- `index.html`, `app.js` – App (keine Abhängigkeiten); `fach.js` – Fächer; `physik.js` – Karten Physik 1; `informatik.js` – Karten Informatik
- `icons/`, `manifest.webmanifest` – App-Symbol (iPhone/iPad: Teilen → Zum Home-Bildschirm; Mac: Safari → Ablage → Zum Dock hinzufügen)
- `data.js`, `img/` – Karten (automatisch erzeugt)
- `tools/extract.py` – schneidet die Einträge aus dem Skript-PDF aus; `tools/build_data.py` – erzeugt `data.js`;
  `tools/meta.py` – Prioritäten, ergänzte Titel und Merkhinweise (hier anpassen)
