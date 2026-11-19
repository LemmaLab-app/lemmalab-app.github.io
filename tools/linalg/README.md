# Lineare Algebra I/II – Karten erzeugen

Ergebnis: `linalg.js` und `img/la-*.png`. Arbeitsordner `W` (nicht im Repo) mit den Unterordnern
`mpdf/` (Mitschrift-PDFs, umbenannt in `W01b.pdf`, `W02a.pdf`, …), `ann/`, `mit/`, `skr/`, `tools/` (diese Dateien) und `entries.py`.

1. `python3 tools/lines.py mpdf ann` – erkennt die Schriftzeilen der handschriftlichen Mitschrift und
   speichert nummerierte Vorschaubilder (`ann/*.jpg`) und `ann/bands.json`.
2. `entries.py` pflegen: pro Eintrag Art, Nummer, Titel und Zeilenbereiche `(Datei, Seite, von, bis)` gemäss `ann/*.jpg`.
3. `python3 tools/crop_mitschrift.py mpdf mit` – schneidet die Einträge aus (Karopapier wird entfernt).
4. `python3 tools/extract_skript.py <Skript.pdf> skr` – schneidet Definitionen/Sätze aus dem Skript von
   Menny Akka Ginosar aus (nur Stoff, der in der Mitschrift noch fehlt: Rang/LGS, Determinanten, Eigenwerte,
   Skalarprodukte, Spektralsätze, Bilinearformen, JNF, Annulator, Tensorprodukt).
5. `python3 tools/build_la.py <Repo> <Skript.pdf>` – erzeugt `linalg.js` und kopiert die Bilder.
   Prioritäten/Titel: `meta_mitschrift.py`, `meta_skript.py` (Skript-Karten werden eine Stufe tiefer eingeordnet,
   damit die Mitschrift Vorrang hat).
6. `python3 tools/build_sw.py`

Neue Vorlesungswochen: PDFs in `mpdf/` ergänzen, Schritte 1–3 und 5–6 wiederholen. Karten-IDs der Mitschrift
sind `m-<Datei>-<Seite>-<Startzeile>`, bleiben also stabil, wenn neue Einträge dazukommen.
