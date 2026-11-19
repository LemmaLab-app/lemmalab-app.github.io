# Mitschrift: Abschnitte, Seitenzahlen, Prioritäten (5 Kern … 1 Rand) und Hinweise
SECTIONS = {0: (1, 'Bekannte Beispiele algebraischer Strukturen'), 1: (1, 'Die Sprache der Mathematik'), 2: (1, 'Einfache Beweise'),
            3: (2, 'Definitionen und Beispiele'), 4: (2, 'Basen und Dimension'), 5: (2, 'Unterräume, affine Räume und Quotientenräume'),
            6: (2, 'Der Dualraum'), 7: (3, 'Der Vektorraum Hom(V,W)'), 8: (3, 'Basiswechsel'), 9: (3, 'Der Bidualraum und die duale Abbildung'),
            10: (3, 'Kern, Bild und Rang einer linearen Abbildung')}
SEC_OF = {'W01b': 0, 'W02a': 1, 'W02b': 1, 'W03a': 2, 'W03b': 3, 'W03c': 4, 'W04a': 4, 'W05a': 5, 'W05b': 5, 'W06ai': 5,
          'W06aii': 6, 'W06b': 6, 'W07a': 7, 'W07b': 7, 'W08a': 7, 'W09a': 8, 'W09bi': 8, 'W09bii': 9, 'W10a': 9, 'W10b': 10}
PAGES = {'W01b': [1, 2, 3], 'W02a': [4, 5, 6], 'W02b': [7, 8, 9, 10], 'W03a': [11, 12, 13], 'W03b': [14, 15, 16, 17],
         'W03c': [18, 19, 20, 21], 'W04a': [22, 23, 24], 'W05a': [25, 26, 27, 28], 'W05b': [29, 30], 'W06ai': [31],
         'W06aii': [32, 33], 'W06b': [34, 35, 36], 'W07a': [37, 38, 39], 'W07b': ['39', 40, 41, 42], 'W08a': [43, '43b', 44, 45],
         'W09a': [46, 47], 'W09bi': [48, 49], 'W09bii': [50, 51], 'W10a': [52, 53, 54], 'W10b': [55]}
_P = {5: [4, 6, 25, 31, 32, 33, 34, 36, 37, 41, 43, 44, 45, 48, 55, 56, 57, 61, 62, 64, 67, 70, 73, 74, 80, 85, 88, 93, 94, 96, 98],
      4: [3, 5, 20, 23, 26, 38, 39, 40, 46, 49, 51, 54, 58, 60, 63, 65, 66, 69, 72, 77, 79, 82, 83, 86, 87, 91, 95, 97],
      3: [0, 1, 2, 8, 10, 12, 14, 16, 17, 21, 22, 24, 28, 29, 42, 47, 50, 52, 53, 59, 68, 71, 75, 76, 78, 81, 84, 89, 90, 92],
      2: [7, 9, 11, 13, 15, 18, 27, 30, 35], 1: [19]}
PRIO_M = {i: p for p, l in _P.items() for i in l}
TIPS_M = {
 4: 'Gruppe = Monoid, in dem jedes Element genau ein Inverses hat. Abelsch = kommutativ.',
 6: 'Körper: (K,+) abelsche Gruppe, (K∖{0},·) abelsche Gruppe, Distributivgesetze.',
 20: 'Es genügen Linksneutrales und Linksinverse: G₀ assoziativ, G₁ e∘x = x, G₂ ∀x ∃x̄ (x̄∘x = e).',
 25: 'Die vier Verträglichkeitsbedingungen (a)–(d) gehören zur Definition – nicht nur «abelsche Gruppe mit Skalarmultiplikation».',
 33: 'Kein x ∈ M liegt in der Hülle der übrigen. Äquivalent (Satz 4.0): nur die triviale Linearkombination ergibt 0.',
 34: 'Basis = linear unabhängiges Erzeugendensystem.',
 37: 'Standardkriterium, um lineare Unabhängigkeit nachzurechnen.',
 43: 'Austauschsatz: n ≥ m, und |X| = n − m Vektoren der x_i ergänzen die y_j zu einem Erzeugendensystem.',
 48: 'U₁ ∪ U₂ ist im Allgemeinen kein Unterraum, ⟨U₁ ∪ U₂⟩ schon (Gegenbeispiel: die beiden Achsen in ℝ²).',
 55: 'Wohldefiniertheit von +_Q und ·_Q zeigen: das Ergebnis darf nicht vom Vertreter a abhängen.',
 56: 'dim V/W = dim V − dim W.',
 57: 'Aus (ii) mit λ = 0 folgt f(0_V) = 0_W.',
 64: 'x_i*(x_j) = δ_i^j. Damit ist f = Σ f(x_i)·x_i* für jedes Funktional f.',
 67: 'Spalten der Darstellungsmatrix = Koordinaten der Bilder der Basisvektoren φ(x_j) bezüglich 𝔅_W.',
 80: 'In der Vorlesung: alte Basisvektoren als Linearkombination der neuen schreiben, Koeffizienten in die Spalten.',
 85: 'Ã_φ = B_W · A_φ · B_V⁻¹. Reihenfolge: zuerst B_V⁻¹ (neue → alte Koordinaten), dann A_φ, dann B_W.',
 93: 'Darstellungsmatrix der dualen Abbildung bezüglich der dualen Basen = Transponierte.',
}
