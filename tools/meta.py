# Namen für Einträge ohne Titel und Prüfungsrelevanz (1 = Rand, 5 = Kern)
NAMES = {
 'Definition 1.79': 'Abzählbarkeit',
 'Definition 2.1': 'Reelle Zahlen (Körper mit Ordnung)',
 'Definition 2.45': 'Absolutbetrag auf ℝ',
 'Definition 2.51': 'Absolutbetrag auf ℂ',
 'Korollar 3.51': 'Polynome sind stetig',
 'Lemma 3.65': 'Rationalität von m-ten Wurzeln',
 'Definition 4.3': 'Verfeinerung von Zerlegungen',
 'Definition 4.4': 'Integral einer Treppenfunktion bzgl. Zerlegung',
 'Definition 4.6': 'Integral einer Treppenfunktion',
 'Definition 4.10': 'Unter- und Obersummen',
 'Definition 4.29': 'Additive Intervallfunktion',
 'Proposition 4.30': 'Integral via additive Intervallfunktion',
 'Lemma 5.22': 'Eindeutigkeit des Grenzwerts',
 'Proposition 5.44': 'Konvergenz in ℂᵈ: Normen und Komponenten',
 'Definition 5.52': 'Gleichmässige und Lipschitz-Stetigkeit',
 'Definition 7.55': 'Konvergenzradius',
 'Korollar 7.86': 'Integrale von exp, sin, cos',
 'Definition 9.1': 'Integral mit variabler oberer Grenze',
 'Lemma 9.33': 'Uneigentliches Integral nicht-negativer Funktionen',
 'Satz 9.56': 'Numerische Integration (Rechteck, Trapez, Simpson)',
}

P5 = '''Definition 1.33|Definition 1.79|Definition 2.58|Satz 2.59|Satz 2.68|Definition 3.45|Satz 3.58|
Satz 3.67|Korollar 3.69|Definition 3.71|Satz 3.75|Definition 4.11|Proposition 4.12|Satz 4.31|Satz 4.42|
Definition 5.21|Lemma 5.49|Definition 5.52|Satz 6.5|Definition 6.8|Definition 6.9|Satz 6.15|Definition 6.22|
Satz 6.26|Definition 7.1|Proposition 7.25|Korollar 7.30|Korollar 7.32|Definition 7.40|Definition 7.45|
Satz 7.48|Satz 7.49|Definition 7.55|Satz 7.56|Definition 8.1|Satz 8.28|Theorem 8.29|Definition 8.38|
Proposition 8.40|Satz 8.49|Theorem 9.2|Korollar 9.4|Satz 9.35|Theorem 9.46'''
P4 = '''Definition 1.48|Definition 1.61|Definition 2.56|Definition 2.57|Definition 2.73|Definition 2.48|Korollar 2.70|
Satz 2.75|Satz 2.77|Korollar 2.81|Satz 2.15|Lemma 3.5|Proposition 3.8|Satz 3.28|Definition 3.39|Satz 3.62|
Definition 4.2|Definition 4.10|Definition 5.1|Definition 5.10|Proposition 5.3|Proposition 5.30|Definition 5.38|
Proposition 5.42|Definition 5.48|Proposition 6.1|Lemma 6.2|Satz 6.11|Korollar 6.14|Definition 6.19|Lemma 6.40|
Proposition 7.2|Proposition 7.11|Korollar 7.12|Proposition 7.16|Satz 7.26|Proposition 7.28|Korollar 7.29|
Definition 7.54|Lemma 7.60|Satz 7.85|Satz 8.8|Satz 8.14|Definition 8.16|Proposition 8.17|Korollar 8.33|
Korollar 8.35|Korollar 8.37|Lemma 8.39|Korollar 8.42|Satz 8.48|Lemma 8.60|Lemma 8.61|Definition 9.1|
Korollar 9.3|Korollar 9.5|Korollar 9.11|Lemma 9.33|Korollar 9.47'''
P2 = '''Lemma 1.3|Definition 1.14|Definition 1.19|Definition 1.22|Definition 1.27|Definition 1.44|Definition 1.51|
Lemma 1.52|Definition 1.54|Definition 1.58|Lemma 2.14|Lemma 2.17|Lemma 2.18|Lemma 2.23|Lemma 2.25|Lemma 2.27|
Satz 2.31|Proposition 2.33|Definition 2.36|Lemma 2.37|Definition 2.41|Definition 2.42|Definition 2.43|
Definition 2.51|Definition 2.52|Definition 2.54|Korollar 2.83|Definition 3.11|Definition 3.13|Proposition 3.15|
Definition 3.24|Lemma 3.25|Proposition 3.26|Korollar 3.51|Lemma 3.65|Definition 4.3|Definition 4.4|Lemma 4.5|
Lemma 4.7|Lemma 4.8|Definition 4.29|Proposition 4.30|Satz 4.37|Korollar 5.5|Lemma 5.17|Lemma 5.25|
Proposition 5.44|Korollar 5.45|Lemma 7.6|Lemma 7.8|Lemma 7.9|Satz 7.35|Satz 7.65|Satz 7.74|Lemma 7.81|
Korollar 8.6|Korollar 8.25|Korollar 8.26|Satz 9.56'''
P1 = '''Proposition 1.1|Definition 2.82|Proposition 3.32|Proposition 3.33|Lemma 7.96|Proposition 7.97|Lemma 9.67'''

def _s(x):
    return {t.strip() for t in x.replace('\n', '').split('|') if t.strip()}

PRIO = {}
for lvl, s in [(5, P5), (4, P4), (2, P2), (1, P1)]:
    for k in _s(s):
        PRIO[k] = lvl

# Kurze Tipps, worauf man beim Auswendiglernen achten muss (nur Kernresultate)
TIPS = {
 'Satz 2.59': 'Voraussetzung: nicht-leer UND nach oben beschränkt. Charakterisierung (1),(2) bzw. (2′) mit ε.',
 'Satz 3.58': 'Stetig auf einem INTERVALL; c zwischen f(a) und f(b).',
 'Satz 3.67': 'Kompaktes Intervall [a,b] und stetig ⇒ beschränkt.',
 'Korollar 3.69': 'Extremwertsatz: kompakt + stetig ⇒ Max und Min werden angenommen.',
 'Definition 3.71': 'δ hängt nur von ε ab, nicht von x!',
 'Satz 3.75': 'Stetig auf kompaktem Intervall ⇒ gleichmässig stetig.',
 'Definition 5.52': 'Zwei Begriffe: gleichmässig stetig und Lipschitz-stetig (mit Konstante L).',
 'Satz 6.5': 'Monoton wachsend + nach oben beschränkt ⇒ konvergiert gegen das Supremum.',
 'Satz 6.15': 'Beschränkte reelle Folge: Grenzwerte konvergenter Teilfolgen liegen in [liminf, limsup], und beide Werte werden von Teilfolgen erreicht.',
 'Satz 6.26': 'In ℝ: konvergent ⇔ Cauchy-Folge.',
 'Proposition 7.25': 'Monoton fallende Nullfolge (aₙ ≥ 0) ⇒ alternierende Reihe konvergiert; Fehler nach ℓ Gliedern ≤ a_{ℓ+1}.',
 'Korollar 7.30': 'α = limsup ⁿ√|aₙ|; α<1 ⇒ absolut konvergent, α>1 ⇒ divergent (keine Nullfolge). α=1: keine Aussage.',
 'Korollar 7.32': 'aₙ ≠ 0 und α = lim |aₙ₊₁|/|aₙ| muss existieren; α<1 abs. konvergent, α>1 divergent.',
 'Satz 7.48': 'Gleichmässiger Limes stetiger Funktionen ist stetig.',
 'Satz 7.49': 'Glm. Konvergenz ⇒ Limes R-integrierbar und Integral & Limes vertauschen.',
 'Satz 7.56': 'R = 1/limsup ⁿ√|aₙ|; |z|<R abs. konvergent, |z|>R divergent; glm. auf kleineren Kreisscheiben.',
 'Theorem 8.29': 'Stetig auf [a,b], differenzierbar auf (a,b) ⇒ ∃ ξ ∈ (a,b) mit f′(ξ) = (f(b)−f(a))/(b−a).',
 'Satz 8.28': 'Zusätzlich f(a) = f(b) ⇒ ∃ ξ mit f′(ξ) = 0.',
 'Satz 8.49': 'g ≠ 0 und g′ ≠ 0 auf (a,b); lim f′/g′ existiert; dazu „0/0“ oder g → ±∞.',
 'Theorem 9.2': 'f R-integrierbar und stetig bei x₀ ⇒ F(x)=∫ₐˣ f(t)dt ist bei x₀ differenzierbar mit F′(x₀)=f(x₀).',
 'Satz 9.35': 'f:[1,∞)→ℝ≥0 monoton fallend: Σ_{n≥2} f(n) ≤ ∫₁^∞ f ≤ Σ_{n≥1} f(n); Reihe konvergiert ⇔ Integral konvergiert.',
 'Theorem 9.46': 'f (n+1)-mal stetig differenzierbar; Integral-Restglied R(x) = ∫_{x₀}^x f⁽ⁿ⁺¹⁾(t)(x−t)ⁿ/n! dt.',
}
