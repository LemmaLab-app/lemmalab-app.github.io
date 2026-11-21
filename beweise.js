/* LemmaLab – Beweise (Analysis 1)
 * Eigener Bereich neben den Karteikarten: schlägt vor, welchen Beweis du als Nächstes lernst
 * bzw. wiederholst. Reihenfolge strikt nach Wahrscheinlichkeit. Grundlage: «Prozentuale Wichtigkeit der Beweise» (Modell aus acht
 * Prüfungen, Stand 14.11.2026) und die Lernmethode aus dem Heft «Wichtige Beweise»:
 * verstehen → Gerüst einprägen → frei aufschreiben → wiederholen nach 1, 3, 7, 14 Tagen;
 * ein Beweis «sitzt» nach zweimal hintereinander fehlerfrei.
 * Wird nach data.js und vor app.js geladen. Lernstand: eigener Bereich «ana1b» (wie ein Fach,
 * also mit Konto-Abgleich), Einträge in S.cards (B-<Nummer>) und S.log.
 */
'use strict';
window.ANA_CARDS = window.CARDS || [];
window.CARDS = [];          // keine Karteikarten in diesem Bereich
window.BEWEISE = [{"id": "B-3.58", "nr": "Satz 3.58", "name": "Zwischenwertsatz", "kap": 3, "p": 0.13462, "hist": "2× verlangt, ältere Prüfungen 0,5×, in Anwendungen 2×", "card": "Satz-3.58", "heft": "B.2", "hs": 12, "ht": "Der Zwischenwertsatz", "uses": ["B-2.59"]}, {"id": "B-8.29", "nr": "Thm. 8.29", "name": "Mittelwertsatz", "kap": 8, "p": 0.12959, "hist": "1× verlangt, ältere Prüfungen 1×, in Anwendungen 4×", "card": "Theorem-8.29", "heft": "E.3", "hs": 37, "ht": "Der Mittelwertsatz und seine Folgerungen", "uses": ["B-8.28"]}, {"id": "B-6.26", "nr": "Satz 6.26", "name": "Cauchy-Kriterium für Folgen", "kap": 6, "p": 0.12455, "hist": "2× verlangt, ältere Prüfungen 0,5×, in Anwendungen 1×", "card": "Satz-6.26", "heft": "A.5", "hs": 7, "ht": "Cauchy-Kriterium für Folgen", "uses": ["B-6.15"]}, {"id": "B-4.31", "nr": "Satz 4.31", "name": "Monoton ⇒ R-integrierbar", "kap": 4, "p": 0.1059, "hist": "2× verlangt", "card": "Satz-4.31", "heft": "C.2", "hs": 20, "ht": "Monotone Funktionen sind integrierbar", "uses": ["B-4.12"]}, {"id": "B-7.48", "nr": "Satz 7.48", "name": "Glm. Konvergenz ⇒ stetig", "kap": 7, "p": 0.09906, "hist": "1× verlangt, ältere Prüfungen 1×, in Anwendungen 1×", "card": "Satz-7.48", "heft": "D.3", "hs": 29, "ht": "Gleichmässige Konvergenz und Stetigkeit", "uses": []}, {"id": "B-8.40", "nr": "Prop. 8.40", "name": "Konvex ⇔ f' wachsend", "kap": 8, "p": 0.09219, "hist": "1× verlangt, in Anwendungen 2×", "card": "Proposition-8.40", "heft": "E.4", "hs": 38, "ht": "Konvexität und f′", "uses": ["B-8.29", "B-8.39"]}, {"id": "B-7.49", "nr": "Satz 7.49", "name": "Glm. Konvergenz und Integral", "kap": 7, "p": 0.08874, "hist": "1× verlangt, ältere Prüfungen 1×", "card": "Satz-7.49", "heft": "D.4", "hs": 31, "ht": "Gleichmässige Konvergenz und Integral", "uses": ["B-7.48", "B-4.12"]}, {"id": "B-8.28", "nr": "Satz 8.28", "name": "Satz von Rolle", "kap": 8, "p": 0.08874, "hist": "1× verlangt, ältere Prüfungen 1×", "card": "Satz-8.28", "heft": "E.2", "hs": 35, "ht": "Der Satz von Rolle", "uses": ["B-3.69", "B-8.17"]}, {"id": "B-9.2", "nr": "Thm. 9.2", "name": "Ableitung des Integrals (FTC)", "kap": 9, "p": 0.08183, "hist": "1× verlangt, in Anwendungen 1×", "card": "Theorem-9.2", "heft": "F.1", "hs": 42, "ht": "Ableitung des Integrals", "uses": []}, {"id": "B-2.75", "nr": "Satz 2.75", "name": "Existenz von Häufungspunkten", "kap": 2, "p": 0.07139, "hist": "1× verlangt", "card": "Satz-2.75", "heft": "A.3", "hs": 3, "ht": "Existenz von Häufungspunkten", "uses": ["B-2.59"]}, {"id": "B-4.42", "nr": "Satz 4.42", "name": "Stetig ⇒ R-integrierbar", "kap": 4, "p": 0.07139, "hist": "1× verlangt", "card": "Satz-4.42", "heft": "C.3", "hs": 22, "ht": "Stetige Funktionen sind integrierbar", "uses": ["B-3.69", "B-3.75", "B-4.12"]}, {"id": "B-5.49", "nr": "Lemma 5.49", "name": "Folgenstetigkeit ⇔ ε-δ", "kap": 5, "p": 0.07139, "hist": "1× verlangt", "card": "Lemma-5.49", "heft": "B.1", "hs": 10, "ht": "Folgenstetigkeit", "uses": []}, {"id": "B-7.25", "nr": "Prop. 7.25", "name": "Leibniz-Kriterium", "kap": 7, "p": 0.07139, "hist": "1× verlangt", "card": "Proposition-7.25", "heft": "D.1", "hs": 25, "ht": "Leibniz-Kriterium", "uses": ["B-6.5"]}, {"id": "B-7.30", "nr": "Kor. 7.30", "name": "Wurzelkriterium", "kap": 7, "p": 0.07139, "hist": "1× verlangt", "card": "Korollar-7.30", "heft": "D.2", "hs": 27, "ht": "Wurzel- und Quotientenkriterium", "uses": ["B-6.11"]}, {"id": "B-9.35", "nr": "Satz 9.35", "name": "Integraltest für Reihen", "kap": 9, "p": 0.05736, "hist": "in Anwendungen 2×", "card": "Satz-9.35", "heft": "F.3", "hs": 46, "ht": "Integraltest für Reihen", "uses": ["B-4.31", "B-6.5"]}, {"id": "B-2.81", "nr": "Kor. 2.81", "name": "Überabzählbarkeit von R", "kap": 2, "p": 0.05384, "hist": "ältere Prüfungen 1×", "card": "Korollar-2.81", "heft": "A.2", "hs": 3, "ht": "Archimedes und Überabzählbarkeit", "uses": []}, {"id": "B-9.46", "nr": "Thm. 9.46", "name": "Taylor mit Integralrestglied", "kap": 9, "p": 0.05384, "hist": "ältere Prüfungen 1×", "card": "Theorem-9.46", "heft": "F.2", "hs": 44, "ht": "Taylor mit Integralrestglied", "uses": ["B-9.2"]}, {"id": "B-3.67", "nr": "Satz 3.67", "name": "Beschränktheit stetiger Fkt.", "kap": 3, "p": 0.04676, "hist": "in Anwendungen 1×", "card": "Satz-3.67", "heft": "B.3", "hs": 15, "ht": "Beschränktheit und Extremwertsatz", "uses": ["B-2.59"]}, {"id": "B-3.69", "nr": "Kor. 3.69", "name": "Annahme von Max. und Min.", "kap": 3, "p": 0.04676, "hist": "in Anwendungen 1×", "card": "Korollar-3.69", "heft": "B.3", "hs": 15, "ht": "Beschränktheit und Extremwertsatz", "uses": ["B-3.67"]}, {"id": "B-6.5", "nr": "Satz 6.5", "name": "Monotone beschränkte Folgen", "kap": 6, "p": 0.04676, "hist": "in Anwendungen 1×", "card": "Satz-6.5", "heft": "A.4", "hs": 5, "ht": "Monotone Folgen, lim sup und Bolzano-Weierstrass", "uses": ["B-2.59"]}, {"id": "B-2.68", "nr": "Satz 2.68", "name": "Archimedisches Prinzip", "kap": 2, "p": 0.03609, "hist": "", "card": "Satz-2.68", "heft": "A.2", "hs": 3, "ht": "Archimedes und Überabzählbarkeit", "uses": []}, {"id": "B-2.77", "nr": "Satz 2.77", "name": "Intervallschachtelungsprinzip", "kap": 2, "p": 0.03609, "hist": "", "card": "Satz-2.77", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-4.12", "nr": "Prop. 4.12", "name": "Kriterien für R-Integrierbarkeit", "kap": 4, "p": 0.03609, "hist": "", "card": "Proposition-4.12", "heft": "C.1", "hs": 18, "ht": "Werkzeug: Das Integrierbarkeitskriterium", "uses": ["B-2.59"]}, {"id": "B-6.11", "nr": "Satz 6.11", "name": "Eigenschaften des limsup", "kap": 6, "p": 0.03609, "hist": "", "card": "Satz-6.11", "heft": "A.4", "hs": 5, "ht": "Monotone Folgen, lim sup und Bolzano-Weierstrass", "uses": []}, {"id": "B-6.15", "nr": "Satz 6.15", "name": "Bolzano-Weierstrass", "kap": 6, "p": 0.03609, "hist": "", "card": "Satz-6.15", "heft": "A.4", "hs": 5, "ht": "Monotone Folgen, lim sup und Bolzano-Weierstrass", "uses": ["B-6.5"]}, {"id": "B-7.32", "nr": "Kor. 7.32", "name": "Quotientenkriterium", "kap": 7, "p": 0.03609, "hist": "", "card": "Korollar-7.32", "heft": "D.2", "hs": 27, "ht": "Wurzel- und Quotientenkriterium", "uses": ["B-7.30"]}, {"id": "B-2.59", "nr": "Satz 2.59", "name": "Existenz des Supremums", "kap": 2, "p": 0.02983, "hist": "ältere Prüfungen 1×", "card": "Satz-2.59", "heft": "A.1", "hs": 1, "ht": "Werkzeug: Das Supremum", "uses": []}, {"id": "B-9.4", "nr": "Kor. 9.4/9.5", "name": "Integral via Stammfunktion", "kap": 9, "p": 0.02589, "hist": "in Anwendungen 1×", "card": "Korollar-9.4", "heft": "F.1", "hs": 42, "ht": "Ableitung des Integrals", "uses": ["B-9.2"]}, {"id": "B-3.75", "nr": "Satz 3.75", "name": "Heine: gleichmässige Stetigkeit", "kap": 3, "p": 0.0249, "hist": "ältere Prüfungen 0,5×", "card": "Satz-3.75", "heft": "B.4", "hs": 16, "ht": "Satz von Heine", "uses": []}, {"id": "B-7.56", "nr": "Satz 7.56", "name": "Konvergenzradius", "kap": 7, "p": 0.01995, "hist": "", "card": "Satz-7.56", "heft": "D.5", "hs": 32, "ht": "Konvergenzradius", "uses": []}, {"id": "B-8.49", "nr": "Satz 8.49", "name": "Regel von de l'Hôpital", "kap": 8, "p": 0.01995, "hist": "", "card": "Satz-8.49", "heft": "E.5", "hs": 41, "ht": "Cauchy-Mittelwertsatz und de l'Hôpital", "uses": ["B-8.48"]}, {"id": "B-7.16", "nr": "Prop. 7.16", "name": "Verdichtungskriterium", "kap": 7, "p": 0.01887, "hist": "in Anwendungen 1×", "card": "Proposition-7.16", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-8.33", "nr": "Kor. 8.33/8.35", "name": "Konstanz- und Monotoniekriterium", "kap": 8, "p": 0.01887, "hist": "in Anwendungen 1×", "card": "Korollar-8.33", "heft": "E.3", "hs": 37, "ht": "Der Mittelwertsatz und seine Folgerungen", "uses": ["B-8.29"]}, {"id": "B-8.39", "nr": "Lemma 8.39", "name": "Konvexität via Sekanten", "kap": 8, "p": 0.01887, "hist": "in Anwendungen 1×", "card": "Lemma-8.39", "heft": "E.4", "hs": 38, "ht": "Konvexität und f′", "uses": []}, {"id": "B-2.70", "nr": "Kor. 2.70", "name": "Dichtheit von Q in R", "kap": 2, "p": 0.01453, "hist": "", "card": "Korollar-2.70", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-4.44", "nr": "Prop. 4.44", "name": "Sandwich mit stetigen Fkt.", "kap": 4, "p": 0.01453, "hist": "", "card": "Proposition-4.44", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-5.3", "nr": "Prop. 5.3", "name": "Cauchy-Schwarz-Ungleichung", "kap": 5, "p": 0.01453, "hist": "", "card": "Proposition-5.3", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-6.14", "nr": "Kor. 6.14", "name": "Konvergenz ⇔ liminf = limsup", "kap": 6, "p": 0.01453, "hist": "", "card": "Korollar-6.14", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-8.5", "nr": "Prop. 8.5", "name": "Summen-/Produktregel", "kap": 8, "p": 0.01453, "hist": "", "card": "Proposition-8.5", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-8.17", "nr": "Prop. 8.17", "name": "f'=0 im Extremum", "kap": 8, "p": 0.01453, "hist": "", "card": "Proposition-8.17", "heft": "E.1", "hs": 34, "ht": "Extremum ⇒ f′(x₀) = 0", "uses": []}, {"id": "B-8.48", "nr": "Satz 8.48", "name": "Erweiterter Mittelwertsatz", "kap": 8, "p": 0.01453, "hist": "", "card": "Satz-8.48", "heft": "E.5", "hs": 41, "ht": "Cauchy-Mittelwertsatz und de l'Hôpital", "uses": ["B-8.29"]}, {"id": "B-1.40", "nr": "Lemma 1.40", "name": "Verknüpfungen injektiv/surjektiv", "kap": 1, "p": 0.012, "hist": "ältere Prüfungen 1×", "card": "Lemma-1.40", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-2.63", "nr": "Prop. 2.63", "name": "Supremum unter Summen", "kap": 2, "p": 0.012, "hist": "ältere Prüfungen 1×", "card": "Proposition-2.63", "heft": "A.1", "hs": 1, "ht": "Werkzeug: Das Supremum", "uses": []}, {"id": "B-2.30", "nr": "Lemma 2.30", "name": "√2 ist irrational", "kap": 2, "p": 0.00801, "hist": "", "card": "Lemma-2.30", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-3.5", "nr": "Lemma 3.5", "name": "Bernoulli-Ungleichung", "kap": 3, "p": 0.00801, "hist": "", "card": "Lemma-3.5", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-3.8", "nr": "Prop. 3.8", "name": "Geometrische Summenformel", "kap": 3, "p": 0.00801, "hist": "", "card": "Proposition-3.8", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-3.28", "nr": "Satz 3.28", "name": "Binomischer Lehrsatz", "kap": 3, "p": 0.00801, "hist": "", "card": "Satz-3.28", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-3.50", "nr": "Prop. 3.50", "name": "Stetigkeit von Summe/Produkt", "kap": 3, "p": 0.00801, "hist": "", "card": "Proposition-3.50", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-3.52", "nr": "Prop. 3.52", "name": "Stetigkeit unter Verknüpfung", "kap": 3, "p": 0.00801, "hist": "", "card": "Proposition-3.52", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-3.62", "nr": "Satz 3.62", "name": "Umkehrsatz (stetige Inverse)", "kap": 3, "p": 0.00801, "hist": "", "card": "Satz-3.62", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-4.19", "nr": "Satz 4.19", "name": "Linearität des R-Integrals", "kap": 4, "p": 0.00801, "hist": "", "card": "Satz-4.19", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-4.24", "nr": "Satz 4.24", "name": "Monotonie/Dreiecksungl. Integral", "kap": 4, "p": 0.00801, "hist": "", "card": "Satz-4.24", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-4.26", "nr": "Satz 4.26", "name": "Intervalladditivität", "kap": 4, "p": 0.00801, "hist": "", "card": "Satz-4.26", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-5.27", "nr": "Lemma 5.27", "name": "Konvergente Folgen beschränkt", "kap": 5, "p": 0.00801, "hist": "", "card": "Lemma-5.27", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-5.30", "nr": "Prop. 5.30", "name": "Rechenregeln für Grenzwerte", "kap": 5, "p": 0.00801, "hist": "", "card": "Proposition-5.30", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-5.42", "nr": "Prop. 5.42", "name": "Häufungspunkte einer Folge", "kap": 5, "p": 0.00801, "hist": "", "card": "Proposition-5.42", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-5.50", "nr": "Prop. 5.50", "name": "Stetigkeit via offene Mengen", "kap": 5, "p": 0.00801, "hist": "", "card": "Proposition-5.50", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-6.1", "nr": "Prop. 6.1", "name": "Grenzwerte erhalten Ungleichungen", "kap": 6, "p": 0.00801, "hist": "", "card": "Proposition-6.1", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-6.2", "nr": "Lemma 6.2", "name": "Sandwich-Lemma", "kap": 6, "p": 0.00801, "hist": "", "card": "Lemma-6.2", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-6.39", "nr": "Lemma 6.39/6.40", "name": "Grenzwerte von Fkt. via Folgen", "kap": 6, "p": 0.00801, "hist": "", "card": "Lemma-6.39", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.2", "nr": "Prop. 7.2", "name": "Glieder konv. Reihe -> 0", "kap": 7, "p": 0.00801, "hist": "", "card": "Proposition-7.2", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.11", "nr": "Prop. 7.11/Kor. 7.12", "name": "Vergleichssatz", "kap": 7, "p": 0.00801, "hist": "", "card": "Proposition-7.11", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.26", "nr": "Satz 7.26", "name": "Cauchy-Kriterium für Reihen", "kap": 7, "p": 0.00801, "hist": "", "card": "Satz-7.26", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.28", "nr": "Prop. 7.28", "name": "Absolut konv. ⇒ konvergent", "kap": 7, "p": 0.00801, "hist": "", "card": "Proposition-7.28", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.29", "nr": "Kor. 7.29", "name": "Majorantenkriterium", "kap": 7, "p": 0.00801, "hist": "", "card": "Korollar-7.29", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.85", "nr": "Satz 7.85", "name": "Integration von Potenzreihen", "kap": 7, "p": 0.00801, "hist": "", "card": "Satz-7.85", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-8.8", "nr": "Satz 8.8", "name": "Kettenregel", "kap": 8, "p": 0.00801, "hist": "", "card": "Satz-8.8", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-8.14", "nr": "Satz 8.14", "name": "Ableitung der Umkehrfunktion", "kap": 8, "p": 0.00801, "hist": "", "card": "Satz-8.14", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-8.37", "nr": "Kor. 8.37", "name": "Hinreichende Kriterien Extrema", "kap": 8, "p": 0.00801, "hist": "", "card": "Korollar-8.37", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-8.42", "nr": "Kor. 8.42", "name": "Konvexität und f''", "kap": 8, "p": 0.00801, "hist": "", "card": "Korollar-8.42", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-8.44", "nr": "Lemma 8.44", "name": "Jensensche Ungleichung", "kap": 8, "p": 0.00801, "hist": "", "card": "Lemma-8.44", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-8.60", "nr": "Lemma 8.60/8.61", "name": "Lineare DGL 1. Ordnung", "kap": 8, "p": 0.00801, "hist": "", "card": "Lemma-8.60", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-9.11", "nr": "Kor. 9.11", "name": "Ableitung von Potenzreihen", "kap": 9, "p": 0.00801, "hist": "", "card": "Korollar-9.11", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-9.47", "nr": "Kor. 9.47", "name": "Taylor-Abschätzung", "kap": 9, "p": 0.00801, "hist": "", "card": "Korollar-9.47", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-1.3", "nr": "Lemma 1.3", "name": "Summenformel mittels Induktion", "kap": 1, "p": 0.00351, "hist": "", "card": "Lemma-1.3", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-1.67", "nr": "Prop. 1.67", "name": "Äquivalenzrelationen und Partitionen", "kap": 1, "p": 0.00351, "hist": "", "card": "Proposition-1.67", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-1.75", "nr": "Prop. 1.75", "name": "Schubfachprinzip", "kap": 1, "p": 0.00351, "hist": "", "card": "Proposition-1.75", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-1.80", "nr": "Lemma 1.80", "name": "Teilmengen abzählbarer Mengen", "kap": 1, "p": 0.00351, "hist": "", "card": "Lemma-1.80", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-2.19", "nr": "Satz 2.19", "name": "Vollständige Induktion (Varianten)", "kap": 2, "p": 0.00351, "hist": "", "card": "Satz-2.19", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-2.22", "nr": "Satz 2.22", "name": "Wohlordnung von N", "kap": 2, "p": 0.00351, "hist": "", "card": "Satz-2.22", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-2.31", "nr": "Satz 2.31", "name": "Division mit Rest", "kap": 2, "p": 0.00351, "hist": "", "card": "Satz-2.31", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-2.37", "nr": "Lemma 2.37", "name": "Eigenschaften der Konjugation", "kap": 2, "p": 0.00351, "hist": "", "card": "Lemma-2.37", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-2.62", "nr": "Prop. 2.62", "name": "Supremum unter Streckung", "kap": 2, "p": 0.00351, "hist": "", "card": "Proposition-2.62", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-3.15", "nr": "Prop. 3.15", "name": "Wachstum von Polynomen", "kap": 3, "p": 0.00351, "hist": "", "card": "Proposition-3.15", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-3.25", "nr": "Lemma 3.25", "name": "Anzahl Permutationen", "kap": 3, "p": 0.00351, "hist": "", "card": "Lemma-3.25", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-3.26", "nr": "Prop. 3.26", "name": "Additionseigenschaft Binomialkoeff.", "kap": 3, "p": 0.00351, "hist": "", "card": "Proposition-3.26", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-4.5", "nr": "Lemma 4.5", "name": "Treppen: Unabh. von Zerlegung", "kap": 4, "p": 0.00351, "hist": "", "card": "Lemma-4.5", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-4.7", "nr": "Lemma 4.7/4.8", "name": "Treppen: Linearität, Monotonie", "kap": 4, "p": 0.00351, "hist": "", "card": "Lemma-4.7", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-4.34", "nr": "Kor. 4.34", "name": "Stückweise monoton ⇒ integrierbar", "kap": 4, "p": 0.00351, "hist": "", "card": "Korollar-4.34", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-4.37", "nr": "Satz 4.37", "name": "Polynome sind integrierbar", "kap": 4, "p": 0.00351, "hist": "", "card": "Satz-4.37", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-5.11", "nr": "Lemma 5.11", "name": "Norm definiert Metrik", "kap": 5, "p": 0.00351, "hist": "", "card": "Lemma-5.11", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-5.39", "nr": "Lemma 5.39", "name": "Konvergenz von Teilfolgen", "kap": 5, "p": 0.00351, "hist": "", "card": "Lemma-5.39", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-6.29", "nr": "Prop. 6.29", "name": "Reelle Exponentialfunktion", "kap": 6, "p": 0.00146, "hist": "", "card": "Proposition-6.29", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-6.47", "nr": "Satz 6.47", "name": "Integral über Riemann-Summen", "kap": 6, "p": 0.00146, "hist": "", "card": "Satz-6.47", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.68", "nr": "Satz 7.68", "name": "Komplexe Exponentialabbildung", "kap": 7, "p": 0.00146, "hist": "", "card": "Satz-7.68", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-2.33", "nr": "Prop. 2.33", "name": "C ist ein Körper", "kap": 2, "p": 0.00064, "hist": "", "card": "Proposition-2.33", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-2.83", "nr": "Kor. 2.83", "name": "Cantor-Menge", "kap": 2, "p": 0.00064, "hist": "", "card": "Korollar-2.83", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-3.32", "nr": "Prop. 3.32", "name": "Summe von Potenzen", "kap": 3, "p": 0.00064, "hist": "", "card": "Proposition-3.32", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-6.33", "nr": "Kor. 6.33", "name": "Natürlicher Logarithmus", "kap": 6, "p": 0.00064, "hist": "", "card": "Korollar-6.33", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.21", "nr": "Satz 7.21", "name": "Riemannscher Umordnungssatz", "kap": 7, "p": 0.00064, "hist": "", "card": "Satz-7.21", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.35", "nr": "Satz 7.35", "name": "Umordnen absolut konv. Reihen", "kap": 7, "p": 0.00064, "hist": "", "card": "Satz-7.35", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.36", "nr": "Satz 7.36/Kor. 7.37", "name": "Produktsatz, Cauchy-Produkt", "kap": 7, "p": 0.00064, "hist": "", "card": "Satz-7.36", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.65", "nr": "Satz 7.65", "name": "Abelscher Grenzwertsatz", "kap": 7, "p": 0.00064, "hist": "", "card": "Satz-7.65", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.74", "nr": "Satz 7.74", "name": "Die Zahl pi", "kap": 7, "p": 0.00064, "hist": "", "card": "Satz-7.74", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.81", "nr": "Lemma 7.81", "name": "Polarkoordinaten", "kap": 7, "p": 0.00064, "hist": "", "card": "Lemma-7.81", "heft": null, "hs": null, "ht": null, "uses": []}, {"id": "B-7.97", "nr": "Prop. 7.97", "name": "Raumfüllende Kurve", "kap": 7, "p": 0.00064, "hist": "", "card": "Proposition-7.97", "heft": null, "hs": null, "ht": null, "uses": []}];
window.BEWEISE_IDS = new Set(window.BEWEISE.map(b => b.id));

window.Beweise = (() => {
  const BW = window.BEWEISE;
  const BY = Object.fromEntries(BW.map(b => [b.id, b]));
  const CARD = Object.fromEntries(window.ANA_CARDS.map(c => [c.id, c]));
  const TOTAL = BW.reduce((a, b) => a + b.p, 0);                     // ≈ 2.45 erwartete Beweise pro Prüfung
  BW.forEach((b, i) => { b.rank = i + 1; b.stufe = i < 9 ? 'A' : i < 20 ? 'B' : i < 34 ? 'C' : 'D'; });
  const DEP = {}; for (const b of BW) for (const u of b.uses) (DEP[u] = DEP[u] || []).push(b.id);
  const IVL = [1, 3, 7, 14, 30, 60];                                  // Tage
  const ZIELE = [['A', 'Stufe A – 9 Pflicht-Beweise'], ['AB', 'Stufe A + B – 20 Beweise'], ['heft', 'Heft «Wichtige Beweise» – 35'], ['C', 'Stufe A bis C – 34 Beweise'], ['alle', 'Alle 106 Beweise']];
  const STUFE_TXT = { A: 'Sicher können: Satz und Beweis frei aufschreiben', B: 'Beweis können, zumindest das Gerüst sicher', C: 'Satz exakt formulieren, Beweisidee in 2–3 Sätzen', D: 'Aussage kennen und anwenden; Beweis nur bei Zeitüberschuss' };
  const STUFE_COL = { A: 'var(--again)', B: 'var(--hard)', C: 'var(--easy)', D: 'var(--muted)' };
  let filt = 'ziel', skip = new Set(), extra = 0;

  const pct = p => p >= 0.01 ? Math.round(p * 100) + ' %' : '< 1 %';
  const ziel = () => (S.settings.bZiel || 'heft');
  const inZiel = b => { const z = ziel(); return z === 'alle' || (z === 'heft' ? !!b.heft : z === 'A' ? b.stufe === 'A' : z === 'AB' ? 'AB'.includes(b.stufe) : 'ABC'.includes(b.stufe)); };
  const xs = id => S.cards[id];
  const started = id => !!(xs(id) && xs(id).st);
  const sitzt = id => { const x = xs(id); return !!(x && x.st && (x.ok || 0) >= 2); };
  const examT = () => { let d = null; try { const a = window.FachStore && FachStore.read('ana1'); d = a && a.settings && a.settings.examDate; } catch (e) { } return parseDate(d || (window.FAECHER.ana1 || {}).examDate || '2027-01-25'); };
  const goalT = () => dayStart(examT()) - 30 * DAY;
  const today = () => dayStart();
  const fmtD = (t, o = { day: 'numeric', month: 'long' }) => new Date(t).toLocaleDateString('de-CH', o);

  function plan() {
    const tgt = BW.filter(inZiel), open = tgt.filter(b => !started(b.id));
    const daysLeft = Math.max(1, Math.round((goalT() - today()) / DAY));
    const t0 = today();
    const newToday = new Set(S.log.filter(l => l[0] >= t0 && l[3] === 0 && BY[l[1]]).map(l => l[1])).size;
    const perDay = open.length ? clamp(Math.ceil((open.length + newToday) / (daysLeft * 0.8)), 1, 3) : 0;
    const due = BW.filter(b => { const x = xs(b.id); return x && x.st && x.due < t0 + DAY && !(x.last >= t0 && x.due > now()); }).sort((a, b) => b.p - a.p);
    const quota = Math.max(0, perDay - newToday) + extra;
    const cands = open.map(b => ({ b, ...score(b) })).sort((a, c) => c.s - a.s);
    return { tgt, open, daysLeft, perDay, newToday, due, quota, cands };
  }
  /* Reihenfolge: strikt nach Wahrscheinlichkeit – so wächst die Abdeckung am schnellsten.
   * Bausteine (z. B. Supremum) werden nicht vorgezogen, nur beim Beweis erwähnt. */
  function score(b) {
    return { s: b.p, why: b.hist ? 'Bisher ' + b.hist : `Stufe ${b.stufe} – zentraler Satz` };
  }
  function next(P = plan()) {
    const d = P.due.find(b => !skip.has(b.id));
    if (d) return { b: d, kind: 'rep', why: (xs(d.id).ok || 0) ? `Wiederholung (${IVL[Math.min(xs(d.id).step || 0, IVL.length - 1)]}-Tage-Abstand)` : 'Noch nicht fehlerfrei – nochmals aufschreiben' };
    if (P.quota > 0) { const c = P.cands.find(c => !skip.has(c.b.id)); if (c) return { b: c.b, kind: 'new', why: c.why }; }
    return null;
  }

  function rate(id, g) {
    const x = xs(id) || { st: 0 }, first = !x.st;
    let step = x.step || 0, ok = x.ok || 0, due;
    const t0 = today();
    if (g === 'later') { step = 0; ok = 0; due = t0 + DAY; }
    else if (g === 'ok') { step = first ? 0 : Math.min(step + 1, IVL.length - 1); ok++; due = t0 + IVL[step] * DAY; }
    else if (g === 'gap') { ok = 0; due = t0 + DAY; }
    else { ok = 0; step = 0; due = t0 + DAY; }
    const ex = dayStart(examT()) - 2 * DAY;
    if (due > ex && ex > t0 + DAY) due = ex;                              // letzte Wiederholung kurz vor der Prüfung
    S.cards[id] = { st: 1, step, ok, due, last: now(), u: now(), n: (x.n || 0) + 1 };
    S.log.push([now(), id, { ok: 3, gap: 2, no: 1, later: 0 }[g], first ? 0 : 1]);
    if (first && extra > 0) extra--;
    skip.delete(id);
    save(); closeModal();
    toast({ ok: sitzt(id) ? 'Sitzt ✓' : 'Fehlerfrei – nächste Wiederholung in ' + IVL[step] + (IVL[step] === 1 ? ' Tag' : ' Tagen'), gap: 'Morgen nochmals', no: 'Morgen nochmals von vorn', later: 'Morgen aufschreiben' }[g]);
    Motion.set('tab'); render();
  }
  function reset(id) { delete S.cards[id]; S.cards[id] = { st: 0, u: now() }; save(); closeModal(); render(); }

  /* ---------- Bausteine ---------- */
  const chip = (t, c) => `<span class="bchip"${c ? ` style="--c:${c}"` : ''}>${t}</span>`;
  const statusDot = b => { const x = xs(b.id); return sitzt(b.id) ? `<span class="bdot ok" title="sitzt"></span>` : x && x.st ? `<span class="bdot run" title="angefangen"></span>` : `<span class="bdot"></span>`; };
  const statusTxt = b => { const x = xs(b.id); if (!x || !x.st) return 'offen'; if (sitzt(b.id)) return 'sitzt'; return x.due < today() + DAY ? 'heute fällig' : 'nächste Wiederholung ' + fmtD(x.due, { day: 'numeric', month: 'short' }); };
  const refHTML = b => {
    const c = CARD[b.card];
    return [b.heft ? `Heft ${b.heft} «${esc(b.ht)}» · S. ${b.hs}` : 'nicht im Heft', c && c.page ? `Skript S. ${c.page}` : ''].filter(Boolean).join(' · ');
  };
  const stmtHTML = b => { const c = CARD[b.card]; return c && c.img ? `<details class="bstmt"><summary>Satz anzeigen</summary><div class="scanwrap"><img class="scan" src="img/${c.img}" width="${c.w}" height="${c.h}" alt="${esc(b.nr)}" loading="lazy"></div></details>` : ''; };
  const rateBtns = (b, isNew) => `<div class="brate">
      <button type="button" class="bbtn no" data-brate="no" data-id="${b.id}">Nicht geschafft</button>
      <button type="button" class="bbtn gap" data-brate="gap" data-id="${b.id}">Mit Lücken</button>
      <button type="button" class="bbtn ok" data-brate="ok" data-id="${b.id}">Fehlerfrei</button></div>
    ${isNew ? `<button type="button" class="blink" data-brate="later" data-id="${b.id}">Verstanden – morgen aufschreiben</button>` : ''}`;

  function heroHTML(n, P) {
    if (!n) {
      const left = P.cands.length;
      return `<div class="bhero done"><div class="bk">Für heute erledigt</div><h2>Keine Beweise mehr fällig</h2>
        <p class="muted">${P.due.length ? '' : `Heute ${P.newToday} neue${P.newToday === 1 ? 'r' : ''} Beweis${P.newToday === 1 ? '' : 'e'} – Plan: ${P.perDay} pro Tag.`}${left ? '' : ' Alle Beweise deines Ziels sind angefangen.'}</p>
        ${left ? `<button type="button" class="btn primary" data-bact="extra">Nächsten Beweis vorziehen</button>` : ''}</div>`;
    }
    const b = n.b, isNew = n.kind === 'new';
    return `<div class="bhero">
      <div class="bk">${isNew ? 'Als Nächstes' : 'Wiederholen'}</div>
      <h2>${esc(b.name)}</h2>
      <div class="bmeta">${esc(b.nr)} · Kapitel ${b.kap} ${chip('Stufe ' + b.stufe, STUFE_COL[b.stufe])} ${chip(pct(b.p))}</div>
      <p class="bwhy">${esc(n.why)}</p>
      ${isNew && b.uses.length ? `<p class="small muted" style="margin:0 0 6px">Benutzt: ${b.uses.map(u => esc(BY[u].name)).join(', ')}</p>` : ''}
      <div class="bref">${refHTML(b)}</div>
      ${stmtHTML(b)}
      ${isNew ? `<ol class="bsteps"><li><b>Verstehen:</b> Intuition und Beweis lesen, jeden Schritt nachrechnen.</li><li><b>Gerüst einprägen:</b> die violette Box abdecken und aus dem Kopf aufschreiben.</li><li><b>Frei aufschreiben:</b> Satz und Beweis auf ein leeres Blatt, dann vergleichen.</li></ol>`
        : `<p class="bsteps1">Satz und Beweis aus dem Gedächtnis auf ein leeres Blatt schreiben, dann mit dem Heft vergleichen.</p>`}
      ${rateBtns(b, isNew)}
      <button type="button" class="blink" data-bact="skip" data-id="${b.id}">Überspringen</button>
    </div>`;
  }
  function rowHTML(b, sub) {
    return `<button type="button" class="ir ia ii brow" data-bopen="${b.id}">${statusDot(b)}<span class="ir-l"><b>${esc(b.name)}</b><small>${esc(b.nr)} · ${sub || statusTxt(b)}</small></span><span class="ir-r"><span class="v">${pct(b.p)}</span><svg class="chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1.5 1.5L6.5 7l-5 5.5"/></svg></span></button>`;
  }
  function cover() {
    const tgt = BW.filter(inZiel);
    const pS = BW.filter(b => sitzt(b.id)).reduce((a, b) => a + b.p, 0);
    const pT = tgt.reduce((a, b) => a + b.p, 0);
    return { tgt, nS: tgt.filter(b => sitzt(b.id)).length, nA: tgt.filter(b => started(b.id)).length, cov: pS / TOTAL, covT: pT / TOTAL };
  }

  /* ---------- Ansichten ---------- */
  function viewHome() {
    const P = plan(), n = next(P), C = cover();
    const after = []; { const seen = new Set(n ? [n.b.id] : []); for (const b of P.due) if (!seen.has(b.id) && after.length < 3) { after.push([b, 'Wiederholung fällig']); seen.add(b.id); } for (const c of P.cands) if (!seen.has(c.b.id) && after.length < 3) { after.push([c.b, c.why]); seen.add(c.b.id); } }
    const dueLeft = P.due.length;
    return `<div class="bwrap">${heroHTML(n, P)}
    ${UI.group([
      UI.row('Wiederholungen fällig', `<span class="v">${dueLeft}</span>`),
      UI.row('Neue Beweise heute', `<span class="v">${P.newToday} von ${P.perDay}</span>`),
    ], { header: 'Heute', footer: `Plan: ${P.perDay} neue${P.perDay === 1 ? 'r' : ''} Beweis${P.perDay === 1 ? '' : 'e'} pro Tag, damit bis ${fmtD(goalT())} (1 Monat vor der Prüfung) alle ${C.tgt.length} Beweise deines Ziels angefangen sind. Pro neuem Beweis etwa 30–45 Minuten, pro Wiederholung 5–10.` })}
    ${UI.group([
      UI.row('Sitzen', `<span class="v">${C.nS} von ${C.tgt.length}</span>`),
      UI.row('Angefangen', `<span class="v">${C.nA} von ${C.tgt.length}</span>`),
      UI.row('Abgedeckt', `<span class="v">${Math.round(C.cov * 100)} % von 100 %</span>`, { sub: `der Prüfungswahrscheinlichkeit · dein Ziel deckt ${Math.round(C.covT * 100)} % ab` }),
    ], { header: 'Stand' })}
    ${after.length ? UI.group(after.map(([b, w]) => rowHTML(b, esc(w))), { header: 'Danach' }) : ''}
    </div>`;
  }
  function viewAll() {
    const segs = [['ziel', 'Mein Ziel'], ['offen', 'Offen'], ['sitzt', 'Sitzt'], ['alle', 'Alle']];
    let list = BW;
    if (filt === 'ziel') list = BW.filter(inZiel);
    if (filt === 'offen') list = BW.filter(b => inZiel(b) && !sitzt(b.id));
    if (filt === 'sitzt') list = BW.filter(b => sitzt(b.id));
    const groups = ['A', 'B', 'C', 'D'].map(s => { const l = list.filter(b => b.stufe === s); return l.length ? UI.group(l.map(b => rowHTML(b)), { header: `Stufe ${s} · ${l.length}`, footer: STUFE_TXT[s] }) : ''; }).join('');
    return `<div class="bwrap"><div class="seg bseg">${segs.map(([k, l]) => `<button type="button" data-bfilt="${k}" class="${filt === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      ${groups || '<p class="muted" style="text-align:center;margin:40px 0">Keine Beweise in dieser Auswahl.</p>'}
      <p class="small muted bnote">Wahrscheinlichkeit, dass der Beweis im Teil «Beweise aus der Vorlesung» verlangt wird – Schätzung aus acht Prüfungen, ohne Gewähr. Pro Prüfung kommen im Mittel ${TOTAL.toFixed(1).replace('.', ',')} Beweise.</p></div>`;
  }
  function viewStats() {
    const C = cover(), P = plan();
    const bar = (v, col) => `<span class="bbar"><i style="width:${Math.round(v * 100)}%;background:${col}"></i></span>`;
    const st = ['A', 'B', 'C', 'D'].map(s => { const l = BW.filter(b => b.stufe === s), k = l.filter(b => sitzt(b.id)).length; return UI.row(`Stufe ${s}`, `${bar(k / l.length, STUFE_COL[s])}<span class="v">${k} / ${l.length}</span>`); });
    const kaps = [...new Set(BW.map(b => b.kap))].sort((a, b) => a - b).map(k => { const l = BW.filter(b => b.kap === k), e = l.reduce((a, b) => a + b.p, 0), c = l.filter(b => sitzt(b.id)).reduce((a, b) => a + b.p, 0); return UI.row(`Kapitel ${k}`, `${bar(e ? c / e : 0, 'var(--accent)')}<span class="v">${Math.round(c / TOTAL * 100)} / ${Math.round(e / TOTAL * 100)} %</span>`); });
    const days = 14, t0 = today(), cnt = Array(days).fill(0);
    for (const l of S.log) if (BY[l[1]]) { const d = Math.floor((t0 - dayStart(l[0])) / DAY); if (d >= 0 && d < days) cnt[days - 1 - d]++; }
    const mx = Math.max(1, ...cnt);
    const spark = `<div class="bspark">${cnt.map((c, i) => `<i style="height:${Math.round(c / mx * 100)}%" title="${c}"></i>`).join('')}</div>`;
    return `<div class="bwrap">
      <div class="bhero bcov"><div class="bk">Abgedeckt</div><h2>${Math.round(C.cov * 100)} %</h2><p class="muted">der Prüfungswahrscheinlichkeit sitzt sicher (${C.nS} von ${C.tgt.length} Beweisen deines Ziels). Dein Ziel deckt ${Math.round(C.covT * 100)} % ab.</p>${bar(C.cov, 'var(--good)')}</div>
      ${UI.group(st, { header: 'Nach Stufe (sitzt)' })}
      ${UI.group(kaps, { header: 'Nach Kapitel', footer: 'Abgedeckt / möglich, in Prozent der erwarteten Beweise.' })}
      ${UI.group([`<div class="ir"><span class="ir-l">${spark}<small>Bewertungen der letzten 14 Tage</small></span></div>`, UI.row('Ziel-Stichtag', `<span class="v">${fmtD(goalT())} · in ${P.daysLeft} Tagen</span>`)], { header: 'Verlauf' })}
    </div>`;
  }
  function viewSettingsB() {
    const st = S.settings;
    return `<div class="settings">
      ${typeof accountSettingsHTML === 'function' ? accountSettingsHTML() : ''}
      ${UI.group([UI.row('Ziel', UI.select('bZiel', ZIELE, ziel()))], { header: 'Beweise', footer: 'Welche Beweise dir vorgeschlagen werden. Das Heft deckt rund 82 % der Wahrscheinlichkeit ab, Stufe A + B rund 63 %.' })}
      ${UI.group([UI.row('Erscheinungsbild', UI.select('sTheme', [['auto', 'Automatisch'], ['light', 'Hell'], ['dark', 'Dunkel']], st.theme))])}
      ${UI.group([UI.action('Beweis-Fortschritt zurücksetzen', 'breset', { danger: true })], { footer: 'Prüfungsdatum wie bei den Karteikarten Analysis 1.' })}
      ${UI.group([UI.action('Nach Update suchen', 'update'), `<a class="ir ia" href="datenschutz.html"><span class="ir-l">Datenschutz</span><span class="ir-r"><svg class="chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1.5 1.5L6.5 7l-5 5.5"/></svg></span></a>`])}
      <div class="ig-foot">LemmaLab ${APP_VERSION}<br>Inoffiziell, ohne Gewähr.</div></div>`;
  }
  function detail(id) {
    const b = BY[id]; if (!b) return;
    const x = xs(id);
    modal(`<div class="bdet"><div class="row"><b>${esc(b.nr)}</b><div class="spacer"></div><button class="btn ghost" data-act="close">✕</button></div>
      <h2>${esc(b.name)}</h2>
      <div class="bmeta">Kapitel ${b.kap} ${chip('Stufe ' + b.stufe, STUFE_COL[b.stufe])} ${chip(pct(b.p))} · Rang ${b.rank} von ${BW.length}</div>
      <div class="bref">${refHTML(b)}</div>
      ${b.hist ? `<p class="small muted">Bisher: ${esc(b.hist)}</p>` : '<p class="small muted">Bisher noch nie als Beweis verlangt.</p>'}
      ${b.uses.length ? `<p class="small muted">Benutzt: ${b.uses.map(u => esc(BY[u].name)).join(', ')}</p>` : ''}
      <p class="small"><b>${statusTxt(b)}</b>${x && x.n ? ` · ${x.n}× bewertet` : ''}</p>
      ${stmtHTML(b)}
      ${rateBtns(b, !started(id))}
      ${x && x.st ? `<button type="button" class="blink" data-bact="reset" data-id="${id}">Fortschritt dieses Beweises zurücksetzen</button>` : ''}</div>`);
  }

  function render() {
    applyTheme();
    const titles = { heute: 'Beweise', katalog: 'Alle Beweise', statistik: 'Fortschritt', mehr: 'Einstellungen', admin: 'Admin' };
    { const h = $('#hdrTitle'); if (h) h.textContent = titles[tab] || 'Beweise'; }
    { const h = $('#hdrSub'); if (h && !h.dataset.f) { h.dataset.f = 1; h.innerHTML = fachPillHTML(); } }
    { const bb = document.querySelector('nav.tabs .brand span'); if (bb && !bb.dataset.f) { bb.dataset.f = 1; bb.innerHTML = `LemmaLab${fachPillHTML('bf')}`; } }
    document.body.classList.remove('focus');
    renderTabs();
    const v = $('#view');
    v.innerHTML = tab === 'katalog' ? viewAll() : tab === 'statistik' ? viewStats() : tab === 'mehr' ? viewSettingsB() : tab === 'admin' && typeof viewAdmin === 'function' ? viewAdmin() : viewHome();
    { const nt = $('#navTitle'); if (nt) nt.textContent = $('#hdrTitle') ? $('#hdrTitle').textContent : ''; }
    Motion.apply(v);
    const zs = $('#bZiel'); if (zs) zs.addEventListener('change', () => { S.settings.bZiel = zs.value; touchSettings(); render(); });
    const th = $('#sTheme'); if (th) th.addEventListener('change', () => { S.settings.theme = th.value; touchSettings(); applyTheme(); });
  }

  document.addEventListener('click', e => {
    const r = e.target.closest('[data-brate]'); if (r) { rate(r.dataset.id, r.dataset.brate); return; }
    const o = e.target.closest('[data-bopen]'); if (o) { detail(o.dataset.bopen); return; }
    const f = e.target.closest('[data-bfilt]'); if (f) { filt = f.dataset.bfilt; render(); return; }
    const a = e.target.closest('[data-bact],[data-act="breset"]'); if (!a) return;
    const k = a.dataset.bact || 'breset';
    if (k === 'skip') { skip.add(a.dataset.id); Motion.set('tab'); render(); }
    else if (k === 'extra') { extra++; skip.clear(); Motion.set('tab'); render(); }
    else if (k === 'reset') reset(a.dataset.id);
    else if (k === 'breset') confirmBox('Fortschritt aller Beweise zurücksetzen?', () => { for (const id of Object.keys(S.cards)) if (BY[id]) S.cards[id] = { st: 0, u: now() }; save(); render(); toast('Zurückgesetzt'); });
  });

  return { render, plan, next, rate, cover, summary() { const C = cover(); return C.nA ? `${C.nS} von ${C.tgt.length} sitzen · ${Math.round(C.cov * 100)} % abgedeckt` : 'noch nicht begonnen'; } };
})();
