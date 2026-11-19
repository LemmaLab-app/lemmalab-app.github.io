// LemmaLab – Kartenset Informatik (ETH, C++).
// Von Hand gepflegt. Prioritäten sind eine Einschätzung (noch keine Auswertung alter Prüfungen):
//   5 = Kern, 4 = Wichtig, 3 = Solide, 2 = Ergänzung, 1 = Rand.
// Arten: Definition, Regel, Konzept (Frage), Code («Was passiert?» – Tracing, teils mit versteckten Fehlern), Rezept.
// Felder: q = Code, der VOR dem Aufdecken gezeigt wird; out / err = erwartetes Verhalten
//   (wird mit tools/test_informatik.mjs gegen g++ geprüft: err = compile | ub | loop | runtime | logic).
// Text: HTML; ⟦…⟧ = Inline-Code, ⟪…⟫ = Code-Block (beides wird escaped), Mathematik in $…$ (KaTeX).
(function () {
'use strict';
const CH = {
  1: 'Ganzzahlen und Ausdrücke',
  2: 'Wahrheitswerte und Kontrollfluss',
  3: 'Fliesskommazahlen',
  4: 'Funktionen',
  5: 'Referenzen und const',
  6: 'Vektoren, Zeichen und Strings',
  7: 'Rekursion und EBNF',
  8: 'Structs, Klassen und Operatoren',
  9: 'Zeiger, Iteratoren und dynamischer Speicher',
  10: 'Vererbung und Polymorphie',
};
const L = [];
const K = (chap, kind, prio, title, body, o = {}) => L.push({ chap, kind, prio, title, body, ...o });
const R = String.raw;

/* ---------- Code-Darstellung ---------- */
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const KW = 'if|else|for|while|do|return|break|continue|switch|case|default|new|delete|struct|class|public|private|protected|virtual|override|template|typename|using|namespace|operator|this|const|static|nullptr|true|false|sizeof';
const TY = 'int|unsigned|long|short|char|bool|double|float|void|auto|std::string|std::vector|std::cout|std::endl|std::ostream|std';
const TOK = new RegExp(String.raw`(//[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(#\w+[^\n]*)|\b(${TY})\b|\b(${KW})\b|\b(\d+(?:\.\d+)?(?:e[+-]?\d+)?[fuUlL]*)\b`, 'g');
function hl(src) {
  let out = '', i = 0, m;
  TOK.lastIndex = 0;
  while ((m = TOK.exec(src))) {
    out += esc(src.slice(i, m.index));
    const cls = 'h' + (m[1] ? 'c' : m[2] ? 's' : m[3] ? 'p' : m[4] ? 't' : m[5] ? 'k' : 'n');
    out += `<span class="${cls}">${esc(m[0])}</span>`;
    i = TOK.lastIndex;
  }
  return out + esc(src.slice(i));
}
const block = src => `<pre class="cpp"><code>${hl(src.replace(/^\n+|\s+$/g, ''))}</code></pre>`;
const fmt = s => s.replace(/⟪([\s\S]*?)⟫/g, (m, c) => block(c)).replace(/⟦([\s\S]*?)⟧/g, (m, c) => `<code>${esc(c)}</code>`);

/* ================= 1 Ganzzahlen und Ausdrücke ================= */
/* ---------- Prüfungsstrategie ---------- */
K(1, 'Rezept', 5, 'Code-Tracing in der Prüfung: Vorgehen', R`
<ol>
<li><b>Kompiliert es?</b> Deklaration vor Gebrauch, Gültigkeitsbereich, Typen, ⟦const⟧, ⟦private⟧, Referenz an R-Wert, fehlender Default-Konstruktor.</li>
<li><b>Undefiniertes Verhalten?</b> nicht initialisiert, Index ausserhalb, int-Überlauf, Division durch 0, ⟦nullptr⟧/hängende Zeiger und Referenzen, doppeltes ⟦delete⟧.</li>
<li><b>Terminiert es?</b> unsigned ⟦>= 0⟧, ⟦!=⟧ mit Fliesskomma, Strichpunkt nach ⟦while⟧, Zähler wird nie verändert, Rekursion ohne erreichbaren Basisfall.</li>
<li><b>Wertetabelle</b> führen: jede Variable, jede Iteration.</li>
<li><b>Ausgabe exakt</b>: Leerzeichen, Zeilenumbrüche, ⟦bool⟧ als ⟦0/1⟧, ⟦double⟧ ohne ⟦.0⟧, ⟦char⟧ als Zeichen.</li>
</ol>`);
K(1, 'Konzept', 5, 'Fehlerarten: Kompilierfehler, Laufzeitfehler, undefiniertes Verhalten, Endlosschleife, logischer Fehler', R`
<ul>
<li><b>Kompilierfehler:</b> Programm verletzt Sprachregeln, es entsteht gar kein Programm.</li>
<li><b>Laufzeitfehler:</b> Programm bricht ab (z. B. Stapelüberlauf, ⟦assert⟧, ⟦v.at()⟧ ausserhalb).</li>
<li><b>Undefiniertes Verhalten:</b> kompiliert, aber der Standard garantiert <b>nichts</b> – kann «richtig» aussehen, abstürzen oder Unsinn ausgeben.</li>
<li><b>Endlosschleife / unendliche Rekursion:</b> terminiert nicht.</li>
<li><b>Logischer Fehler:</b> wohldefiniert, aber tut nicht, was gemeint war (⟦=⟧ statt ⟦==⟧, Ganzzahldivision).</li>
</ul>`);

K(1, 'Definition', 3, 'L-Wert und R-Wert', R`
<p><b>L-Wert:</b> Ausdruck mit einer <b>Adresse</b> (Speicherstelle), z. B. eine Variable ⟦x⟧ oder ⟦v[i]⟧. Kann links von ⟦=⟧ stehen und verändert werden.</p>
<p><b>R-Wert:</b> Ausdruck, der nur einen <b>Wert</b> liefert, z. B. ⟦3⟧, ⟦x + 1⟧, ⟦x++⟧. Kann nicht zugewiesen werden.</p>
<p>⟦++x⟧ ist ein L-Wert, ⟦x++⟧ ein R-Wert (alter Wert).</p>`);
K(1, 'Regel', 4, 'Präzedenz und Assoziativität', R`
<p>Reihenfolge (stark → schwach): unäres ⟦- ! ++ --⟧ → ⟦* / %⟧ → ⟦+ -⟧ → ⟦<< >>⟧ → ⟦< <= > >=⟧ → ⟦== !=⟧ → ⟦&&⟧ → ⟦||⟧ → ⟦=⟧.</p>
<p>Arithmetische Operatoren sind <b>linksassoziativ</b>: ⟦a - b - c⟧ = ⟦(a - b) - c⟧. Zuweisung ist rechtsassoziativ: ⟦a = b = 3⟧.</p>`, { tip: 'Im Zweifel klammern – in der Prüfung jeden Teilausdruck mit seinem Typ annotieren.' });
K(1, 'Regel', 5, 'Ganzzahldivision und Modulo', R`
<p>⟦a / b⟧ mit zwei ⟦int⟧ rundet <b>gegen 0</b> (Nachkommastellen abschneiden). Für ⟦%⟧ gilt immer:</p>
$$(a/b)\cdot b + a\,\%\,b = a$$
<p>Darum hat ⟦a % b⟧ das <b>Vorzeichen von a</b>: ⟦-7 / 2 == -3⟧, ⟦-7 % 2 == -1⟧. Division durch 0 ist undefiniertes Verhalten.</p>`);
K(1, 'Code', 5, 'Was passiert? – Division mit Vorzeichen', R`
<p><b>Ausgabe:</b> ⟦3 -3 -1 1⟧</p>
<p>Ganzzahldivision schneidet gegen 0 ab; der Rest hat das Vorzeichen des <b>linken</b> Operanden: ⟦-7 % 3 == -1⟧, ⟦7 % -3 == 1⟧.</p>`, {
  q: R`std::cout << 7 / 2 << " " << -7 / 2 << " "
          << -7 % 3 << " " << 7 % -3;`, out: '3 -3 -1 1' });
K(1, 'Code', 5, 'Was passiert? – int und double gemischt', R`
<p><b>Ausgabe:</b> ⟦8 9⟧</p>
<p>Auswertung von links nach rechts: ⟦9 / 2⟧ ist <b>Ganzzahldivision</b> = 4, dann ⟦4 * 2.0⟧ = 8.0 (ausgegeben als ⟦8⟧).<br>
Rechts: ⟦9 / 2.0⟧ = 4.5 (double, weil ein Operand double ist), ⟦4.5 * 2⟧ = 9.</p>`, {
  q: R`std::cout << 9 / 2 * 2.0 << " "
          << 9 / 2.0 * 2;`, out: '8 9' });
K(1, 'Definition', 3, 'Wertebereiche von int und unsigned int', R`
<p>Bei $B$ Bits (typisch $B=32$):</p>
$$\texttt{int}: [-2^{B-1},\ 2^{B-1}-1],\qquad \texttt{unsigned int}: [0,\ 2^B-1]$$
<p>Für $B=32$: ⟦int⟧ bis ca. $2.1\cdot10^9$, ⟦unsigned⟧ bis ca. $4.3\cdot10^9$. Literal ⟦17u⟧ ist unsigned.</p>`);
K(1, 'Konzept', 5, 'Was passiert bei Überlauf von int bzw. unsigned int?', R`
<p><b>unsigned:</b> wohldefiniert, gerechnet wird <b>modulo $2^B$</b> (⟦0u - 1⟧ = $2^{32}-1$).</p>
<p><b>int:</b> Überlauf ist <b>undefiniertes Verhalten</b> – in der Praxis meist Umbruch ins Negative, aber garantiert ist nichts.</p>`);
K(1, 'Code', 4, 'Was passiert? – unsigned minus eins', R`
<p><b>Ausgabe:</b> ⟦4294967295 1⟧</p>
<p>unsigned rechnet modulo $2^{32}$: ⟦0 - 1⟧ ergibt den grössten Wert $2^{32}-1$. Kein Fehler, wohldefiniert.</p>`, {
  q: R`unsigned int u = 0;
u = u - 1;
std::cout << u << " " << (u + 2 == 1);`, out: '4294967295 1' });
K(1, 'Code', 4, 'Was passiert? – Vergleich int mit unsigned', R`
<p><b>Ausgabe:</b> ⟦0⟧ (also «falsch»)</p>
<p>Bei gemischten Operanden wird ⟦int⟧ nach ⟦unsigned int⟧ konvertiert: ⟦-1⟧ wird zu $2^{32}-1$, und das ist nicht kleiner als 1. Der Compiler warnt höchstens.</p>`, {
  q: R`int a = -1;
unsigned int b = 1;
std::cout << (a < b);`, out: '0' });
K(1, 'Code', 4, 'Was passiert? – Prä- und Postinkrement', R`
<p><b>Ausgabe:</b> ⟦7 7 14⟧</p>
<p>⟦i++⟧ liefert den <b>alten</b> Wert (5) → ⟦j = 7⟧, danach ⟦i = 6⟧. ⟦++i⟧ erhöht zuerst → ⟦i = 7⟧, ⟦k = 14⟧.</p>`, {
  q: R`int i = 5;
int j = i++ + 2;
int k = ++i * 2;
std::cout << i << " " << j << " " << k;`, out: '7 7 14' });
K(1, 'Code', 3, 'Was passiert? – char als Zahl', R`
<p><b>Ausgabe:</b> ⟦c 99⟧</p>
<p>⟦'a' + 2⟧ ist ein ⟦int⟧ (99, ASCII). In ⟦c⟧ gespeichert wird es als Zeichen ausgegeben, direkt ausgegeben als Zahl.</p>`, {
  q: R`char c = 'a' + 2;
std::cout << c << " " << 'a' + 2;`, out: 'c 99' });
K(1, 'Code', 4, 'Was passiert? – grosse int-Multiplikation', R`
<p><b>Undefiniertes Verhalten</b> (int-Überlauf).</p>
<p>$100\,000\cdot100\,000=10^{10}$ passt nicht in einen 32-Bit-⟦int⟧ (max. ca. $2.1\cdot10^9$). Dass das Ergebnis in ⟦long⟧ gespeichert wird, hilft nicht: gerechnet wird in ⟦int⟧, weil beide Operanden ⟦int⟧ sind. Abhilfe: ⟦long a = 100000;⟧</p>`, {
  q: R`int a = 100000;
long b = a * a;
std::cout << b;`, err: 'ub' });
K(1, 'Konzept', 2, 'Zweierkomplement: wie wird −x dargestellt?', R`
<p>Alle Bits von $x$ invertieren und 1 addieren: ⟦-x == ~x + 1⟧. Das höchste Bit ist das Vorzeichenbit.</p>
<p>Beispiel 8 Bit: $5 = 00000101$, $-5 = 11111011$. Addition funktioniert ohne Sonderfall wie bei unsigned.</p>`);

/* ================= 2 Wahrheitswerte und Kontrollfluss ================= */
K(2, 'Regel', 5, 'Kurzschlussauswertung von && und ||', R`
<p>⟦a && b⟧: ist ⟦a⟧ falsch, wird ⟦b⟧ <b>nicht ausgewertet</b>. ⟦a || b⟧: ist ⟦a⟧ wahr, wird ⟦b⟧ nicht ausgewertet.</p>
<p>Nützlich als Schutz: ⟦x != 0 && z / x > y⟧ (keine Division durch 0). Nebeneffekte in ⟦b⟧ (⟦++i⟧, Funktionsaufrufe) finden dann nicht statt.</p>`);
K(2, 'Code', 5, 'Was passiert? – Nebeneffekt hinter &&', R`
<p><b>Ausgabe:</b> ⟦0 0⟧</p>
<p>⟦i > 0⟧ ist falsch → wegen Kurzschluss wird ⟦++i⟧ nie ausgeführt. ⟦bool⟧ wird als ⟦0⟧/⟦1⟧ ausgegeben.</p>`, {
  q: R`int i = 0;
bool b = (i > 0) && (++i > 0);
std::cout << b << " " << i;`, out: '0 0' });
K(2, 'Code', 5, 'Was passiert? – if mit Zuweisung', R`
<p><b>Ausgabe:</b> ⟦nicht null 0⟧ – <b>logischer Fehler</b>, kein Kompilierfehler.</p>
<p>⟦a = 0⟧ ist eine <b>Zuweisung</b> (nicht ⟦==⟧): ⟦a⟧ wird 0, der Ausdruck hat den Wert 0 → falsch → else-Zweig, und ⟦a⟧ ist jetzt 0.</p>`, {
  q: R`int a = 3;
if (a = 0)
    std::cout << "null";
else
    std::cout << "nicht null " << a;`, err: 'logic', out: 'nicht null 0' });
K(2, 'Regel', 3, 'De Morgan', R`
$$!(a\ \&\&\ b) \equiv\ !a\ ||\ !b,\qquad !(a\ ||\ b)\equiv\ !a\ \&\&\ !b$$
<p>Beispiel: ⟦!(x >= 0 && x < 10)⟧ ≡ ⟦x < 0 || x >= 10⟧.</p>`);
K(2, 'Code', 4, 'Was passiert? – for-Schleife mit Schritt 3', R`
<p><b>Ausgabe:</b> ⟦22⟧</p>
<p>⟦i⟧ durchläuft 1, 4, 7, 10 (13 ist zu gross): $1+4+7+10=22$.</p>`, {
  q: R`int s = 0;
for (int i = 1; i <= 10; i += 3)
    s += i;
std::cout << s;`, out: '22' });
K(2, 'Code', 5, 'Was passiert? – Countdown mit unsigned', R`
<p><b>Endlosschleife.</b></p>
<p>⟦i >= 0⟧ ist für ⟦unsigned⟧ <b>immer wahr</b>. Nach ⟦i = 0⟧ ergibt ⟦--i⟧ den Wert $2^{32}-1$ (modulo-Arithmetik) und es geht weiter. Abhilfe: ⟦int i⟧ oder ⟦for (unsigned i = 11; i-- > 0; )⟧.</p>`, {
  q: R`for (unsigned int i = 10; i >= 0; --i)
    std::cout << i << " ";`, err: 'loop' });
K(2, 'Code', 5, 'Was passiert? – while mit Strichpunkt', R`
<p><b>Endlosschleife</b> (es wird nichts ausgegeben).</p>
<p>Der Strichpunkt nach ⟦while (i < 5)⟧ ist eine <b>leere Anweisung</b> = der ganze Schleifenrumpf. ⟦i⟧ ändert sich nie; der Block danach wird nie erreicht.</p>`, {
  q: R`int i = 0;
while (i < 5);
{
    ++i;
}
std::cout << i;`, err: 'loop' });
K(2, 'Code', 5, 'Was passiert? – i nach der for-Schleife', R`
<p><b>Kompilierfehler.</b></p>
<p>⟦i⟧ ist im Kopf der for-Schleife deklariert; ihr <b>Gültigkeitsbereich</b> endet mit der Schleife. Danach ist ⟦i⟧ unbekannt.</p>`, {
  q: R`int s = 0;
for (int i = 0; i < 10; ++i)
    s += i;
std::cout << s << " " << i;`, err: 'compile' });
K(2, 'Code', 4, 'Was passiert? – break und continue', R`
<p><b>Ausgabe:</b> ⟦135⟧</p>
<p>Gerade ⟦i⟧ werden mit ⟦continue⟧ übersprungen; bei ⟦i = 7⟧ bricht ⟦break⟧ die Schleife ab, bevor ausgegeben wird.</p>`, {
  q: R`for (int i = 0; i < 10; ++i) {
    if (i % 2 == 0) continue;
    if (i > 6) break;
    std::cout << i;
}`, out: '135' });
K(2, 'Code', 3, 'Was passiert? – do-while mit falscher Bedingung', R`
<p><b>Ausgabe:</b> ⟦10⟧</p>
<p>Der Rumpf einer do-Schleife läuft <b>mindestens einmal</b>; die Bedingung wird erst danach geprüft.</p>`, {
  q: R`int i = 10;
do {
    std::cout << i;
    ++i;
} while (i < 5);`, out: '10' });
K(2, 'Code', 4, 'Was passiert? – verschachteltes if/else', R`
<p><b>Ausgabe:</b> ⟦negativ⟧ – logischer Fehler («dangling else»).</p>
<p>Ein ⟦else⟧ gehört immer zum <b>nächsten</b> ⟦if⟧ ohne else – hier zum inneren. Die Einrückung täuscht. Abhilfe: geschweifte Klammern.</p>`, {
  q: R`int x = 5;
if (x > 0)
    if (x > 10)
        std::cout << "gross";
else
    std::cout << "negativ";`, err: 'logic', out: 'negativ' });
K(2, 'Code', 3, 'Was passiert? – Variable im inneren Block', R`
<p><b>Ausgabe:</b> ⟦21⟧</p>
<p>Das innere ⟦i⟧ <b>verdeckt</b> (shadowing) das äussere nur innerhalb des Blocks. Danach ist wieder das äussere ⟦i = 1⟧ sichtbar.</p>`, {
  q: R`int i = 1;
{
    int i = 2;
    std::cout << i;
}
std::cout << i;`, out: '21' });
K(2, 'Code', 4, 'Was passiert? – Summe ohne Startwert', R`
<p><b>Undefiniertes Verhalten.</b></p>
<p>⟦s⟧ ist <b>nicht initialisiert</b>; ⟦s += i⟧ liest einen unbestimmten Wert. Kompiliert ohne Fehler, Ergebnis ist zufällig. Abhilfe: ⟦int s = 0;⟧</p>`, {
  q: R`int s;
for (int i = 1; i <= 3; ++i)
    s += i;
std::cout << s;`, err: 'ub' });
K(2, 'Konzept', 3, 'Wie schreibt man eine for-Schleife als while-Schleife?', R`
⟪for (init; cond; expr)
    body⟫
<p>ist gleichwertig zu</p>
⟪{
    init;
    while (cond) {
        body
        expr;
    }
}⟫
<p>(Ausnahme: ⟦continue⟧ im Rumpf überspringt bei while auch ⟦expr⟧.) Die äusseren Klammern begrenzen den Gültigkeitsbereich der Laufvariable.</p>`);
K(2, 'Code', 2, 'Was passiert? – Ausgabe mit Vergleich', R`
<p><b>Kompilierfehler.</b></p>
<p>⟦<<⟧ bindet stärker als ⟦<⟧: gelesen wird ⟦(std::cout << 3) < 4⟧, also «Stream kleiner als int» – das gibt es nicht. Richtig: ⟦std::cout << (3 < 4);⟧</p>`, {
  q: R`std::cout << 3 < 4;`, err: 'compile' });

/* ================= 3 Fliesskommazahlen ================= */
K(3, 'Definition', 4, 'Normalisiertes Fliesskommazahlensystem', R`
<p>$F^*(\beta,p,e_\min,e_\max)$ enthält die Zahlen</p>
$$\pm\,d_0.d_1\dots d_{p-1}\cdot\beta^{e},\qquad d_0\neq0,\ \ e_\min\le e\le e_\max$$
<p>$\beta$: Basis, $p$: Anzahl Stellen (Präzision). Die 0 ist nicht normalisiert darstellbar. Anzahl Zahlen:</p>
$$|F^*| = 2\,(\beta-1)\,\beta^{p-1}\,(e_\max-e_\min+1)$$`, { tip: 'IEEE double: β = 2, p = 53, ca. 16 Dezimalstellen; float: p = 24, ca. 7 Stellen.' });
K(3, 'Regel', 5, 'Fliesskomma-Richtlinien', R`
<ol>
<li><b>Nicht auf Gleichheit testen</b>, wenn gerundet wurde (⟦0.1 + 0.2 == 0.3⟧ ist falsch). Stattdessen ⟦std::abs(a - b) < eps⟧.</li>
<li><b>Keine Zahlen sehr unterschiedlicher Grösse addieren</b> – die kleine geht verloren.</li>
<li><b>Keine Zahlen sehr ähnlicher Grösse subtrahieren</b> – Auslöschung, die relativen Fehler explodieren.</li>
</ol>`);
K(3, 'Konzept', 4, 'Warum ist 0.1 nicht exakt als double darstellbar?', R`
<p>Im Binärsystem ist $0.1 = 0.0\overline{0011}_2$ <b>periodisch</b>. Mit endlich vielen Stellen ($p=53$) muss gerundet werden.</p>
<p>Exakt darstellbar sind nur Brüche, deren Nenner eine Zweierpotenz ist (z. B. $0.5$, $0.25$, $0.375$).</p>`);
K(3, 'Rezept', 3, 'Dezimalbruch ins Binärsystem umrechnen', R`
<ol><li>Ganzzahlteil wie gewohnt (fortlaufend durch 2 teilen, Reste von unten lesen).</li>
<li>Nachkommateil $x$ wiederholt <b>mal 2</b>: Ganzzahlteil (0 oder 1) ist die nächste Binärziffer, mit dem Rest weiterrechnen.</li>
<li>Wiederholt sich ein Rest, ist die Darstellung periodisch.</li></ol>
<p>$0.1\to0.2\,(0)\to0.4\,(0)\to0.8\,(0)\to1.6\,(1)\to1.2\,(1)\to0.4\,(0)\dots$ → $0.0\overline{0011}_2$</p>`);
K(3, 'Code', 5, 'Was passiert? – 0.1 + 0.2', R`
<p><b>Ausgabe:</b> ⟦0⟧</p>
<p>Alle drei Zahlen sind gerundet gespeichert; ⟦0.1 + 0.2⟧ ergibt ⟦0.30000000000000004⟧, nicht dieselbe Zahl wie ⟦0.3⟧. Richtlinie 1: nicht auf Gleichheit testen.</p>`, {
  q: R`std::cout << (0.1 + 0.2 == 0.3);`, out: '0' });
K(3, 'Code', 5, 'Was passiert? – float-Schleife bis 1', R`
<p><b>Endlosschleife.</b></p>
<p>⟦0.1f⟧ ist nicht exakt; nach zehn Additionen ist ⟦x⟧ ungefähr ⟦1.0000001⟧ und nie genau ⟦1.0f⟧. Die Bedingung ⟦!=⟧ bleibt immer wahr. Abhilfe: Ganzzahl-Zähler oder ⟦x < 1.0f⟧.</p>`, {
  q: R`for (float x = 0.1f; x != 1.0f; x += 0.1f)
    std::cout << x << " ";`, err: 'loop' });
K(3, 'Code', 5, 'Was passiert? – int durch int in double speichern', R`
<p><b>Ausgabe:</b> ⟦0⟧ – logischer Fehler.</p>
<p>⟦a / b⟧ ist <b>Ganzzahldivision</b> (= 0) und wird erst danach in ⟦double⟧ umgewandelt. Richtig: ⟦double r = double(a) / b;⟧</p>`, {
  q: R`int a = 1, b = 2;
double r = a / b;
std::cout << r;`, err: 'logic', out: '0' });
K(3, 'Code', 4, 'Was passiert? – double nach int', R`
<p><b>Ausgabe:</b> ⟦-2 3⟧</p>
<p>Konversion ⟦double⟧ → ⟦int⟧ <b>schneidet gegen 0 ab</b> (rundet nicht). ⟦-2.7⟧ → ⟦-2⟧, ⟦3.9⟧ → ⟦3⟧.</p>`, {
  q: R`double d = -2.7;
int i = d;
int j = 3.9;
std::cout << i << " " << j;`, out: '-2 3' });
K(3, 'Code', 3, 'Was passiert? – 1 zu einer sehr grossen Zahl addieren', R`
<p><b>Ausgabe:</b> ⟦1⟧ (wahr)</p>
<p>⟦double⟧ hat 53 Bit Präzision; ab $2^{53}\approx9\cdot10^{15}$ ist der Abstand benachbarter Zahlen ≥ 2. $10^{16}+1$ wird auf $10^{16}$ gerundet. Richtlinie 2.</p>`, {
  q: R`double x = 1e16;
std::cout << (x + 1 == x);`, out: '1' });
K(3, 'Code', 2, 'Was passiert? – grosse Ganzzahl in float', R`
<p><b>Ausgabe:</b> ⟦1⟧</p>
<p>⟦float⟧ hat $p=24$: $2^{24}+1=16777217$ ist nicht darstellbar und wird auf $2^{24}=16777216$ gerundet.</p>`, {
  q: R`float f = 16777217;
std::cout << (f == 16777216);`, out: '1' });
K(3, 'Konzept', 3, 'Wie viele Zahlen enthält F*(2, 3, −2, 2)? Welche ist die grösste?', R`
$$|F^*|=2\cdot(2-1)\cdot2^{2}\cdot(2-(-2)+1)=2\cdot1\cdot4\cdot5=40$$
<p>Grösste Zahl: $1.11_2\cdot2^2=111_2=7$. Kleinste positive: $1.00_2\cdot2^{-2}=0.25$.</p>`);

/* ================= 4 Funktionen ================= */
K(4, 'Definition', 4, 'Vor- und Nachbedingung, assert', R`
<p><b>Vorbedingung (PRE):</b> was beim Aufruf gelten muss. <b>Nachbedingung (POST):</b> was nach dem Aufruf gilt (Rückgabewert, Effekte).</p>
⟪// PRE:  e >= 0 || b != 0.0
// POST: return value is b^e
double pow(double b, int e);⟫
<p>⟦assert(bedingung);⟧ (aus ⟦<cassert>⟧) bricht das Programm ab, wenn die Bedingung falsch ist – zum Prüfen von Vorbedingungen.</p>`);
K(4, 'Konzept', 3, 'Deklaration vs. Definition einer Funktion', R`
<p><b>Deklaration:</b> nur Signatur, ⟦int f(int x);⟧ – macht den Namen ab dieser Stelle bekannt.</p>
<p><b>Definition:</b> Signatur + Rumpf. Eine Funktion muss <b>vor ihrer ersten Verwendung</b> deklariert sein, sonst Kompilierfehler. Bei gegenseitiger Rekursion braucht es eine Vorwärtsdeklaration.</p>`);
K(4, 'Code', 4, 'Was passiert? – Aufruf vor der Definition', R`
<p><b>Kompilierfehler.</b></p>
<p>Beim Aufruf in ⟦main⟧ ist ⟦square⟧ noch nicht deklariert (C++ liest von oben nach unten). Abhilfe: Definition nach oben oder ⟦int square(int x);⟧ vor ⟦main⟧.</p>`, {
  q: R`int main() {
    std::cout << square(4);
}

int square(int x) {
    return x * x;
}`, err: 'compile' });
K(4, 'Code', 4, 'Was passiert? – Funktion ohne return im else-Fall', R`
<p><b>Undefiniertes Verhalten</b> (kompiliert, höchstens mit Warnung).</p>
<p>Für ⟦x <= 0⟧ endet die Funktion ohne ⟦return⟧, obwohl sie ⟦int⟧ zurückgeben muss. Der verwendete Wert ist unbestimmt.</p>`, {
  q: R`int sign(int x) {
    if (x > 0) return 1;
}

int main() {
    std::cout << sign(-3);
}`, err: 'ub' });
K(4, 'Code', 5, 'Was passiert? – Parameter in der Funktion ändern', R`
<p><b>Ausgabe:</b> ⟦1⟧</p>
<p>Übergabe <b>per Wert</b>: ⟦x⟧ ist eine Kopie von ⟦a⟧. Die Änderung betrifft nur die Kopie.</p>`, {
  q: R`void f(int x) {
    x = 5;
}

int main() {
    int a = 1;
    f(a);
    std::cout << a;
}`, out: '1' });
K(4, 'Code', 2, 'Was passiert? – überladene Funktionen', R`
<p><b>Ausgabe:</b> ⟦int double int⟧</p>
<p>Gewählt wird die am besten passende Überladung. ⟦'a'⟧ ist ⟦char⟧ – die Promotion zu ⟦int⟧ ist besser als die Konversion zu ⟦double⟧.</p>`, {
  q: R`void p(int)    { std::cout << "int "; }
void p(double) { std::cout << "double "; }

int main() {
    p(1);
    p(1.0);
    p('a');
}`, out: 'int double int ' });

/* ================= 5 Referenzen und const ================= */
K(5, 'Definition', 5, 'Referenztyp T&', R`
<p>Eine Referenz ist ein <b>Alias</b> (anderer Name) für ein bestehendes Objekt: ⟦int& r = a;⟧</p>
<ul><li>muss bei der Deklaration <b>initialisiert</b> werden – mit einem L-Wert,</li>
<li>kann danach <b>nicht umgebunden</b> werden (⟦r = b;⟧ weist den Wert von ⟦b⟧ an ⟦a⟧ zu),</li>
<li>Übergabe per Referenz: die Funktion arbeitet auf dem Original.</li></ul>`);
K(5, 'Code', 5, 'Was passiert? – swap mit Referenzen', R`
<p><b>Ausgabe:</b> ⟦2 1⟧</p>
<p>⟦a⟧ und ⟦b⟧ sind Aliase für ⟦x⟧ und ⟦y⟧; der Tausch wirkt auf die Originale. Ohne ⟦&⟧ wäre die Ausgabe ⟦1 2⟧.</p>`, {
  q: R`void swap(int& a, int& b) {
    int t = a;
    a = b;
    b = t;
}

int main() {
    int x = 1, y = 2;
    swap(x, y);
    std::cout << x << " " << y;
}`, out: '2 1' });
K(5, 'Code', 5, 'Was passiert? – Referenz und Kopie', R`
<p><b>Ausgabe:</b> ⟦717⟧</p>
<p>⟦r⟧ ist Alias für ⟦a⟧ → ⟦a = 7⟧. ⟦b⟧ ist eine <b>Kopie</b> (kein ⟦&⟧), ⟦b = 1⟧ ändert ⟦a⟧ nicht.</p>`, {
  q: R`int a = 3;
int& r = a;
r = 7;
int b = r;
b = 1;
std::cout << a << b << r;`, out: '717' });
K(5, 'Code', 4, 'Was passiert? – Referenz ohne Initialisierung', R`
<p><b>Kompilierfehler.</b></p>
<p>Eine Referenz muss bei der Deklaration an ein Objekt gebunden werden.</p>`, {
  q: R`int a = 3;
int& r;
r = a;
std::cout << r;`, err: 'compile' });
K(5, 'Code', 5, 'Was passiert? – Referenz auf lokale Variable zurückgeben', R`
<p><b>Undefiniertes Verhalten</b> (hängende Referenz, «dangling reference»).</p>
<p>⟦x⟧ lebt nur bis zum Ende von ⟦f⟧. Die zurückgegebene Referenz zeigt auf freigegebenen Speicher. Kompiliert (mit Warnung). Abhilfe: per Wert zurückgeben (⟦int f()⟧).</p>`, {
  q: R`int& f() {
    int x = 3;
    return x;
}

int main() {
    int& r = f();
    std::cout << r;
}`, err: 'ub' });
K(5, 'Code', 4, 'Was passiert? – Literal an int& übergeben', R`
<p><b>Kompilierfehler.</b></p>
<p>Ein ⟦int&⟧-Parameter braucht einen <b>L-Wert</b>; ⟦5⟧ ist ein R-Wert und kann nicht verändert werden. (Ein ⟦const int&⟧ dürfte an ⟦5⟧ binden.)</p>`, {
  q: R`void inc(int& x) {
    ++x;
}

int main() {
    inc(5);
    std::cout << "ok";
}`, err: 'compile' });
K(5, 'Konzept', 4, 'Wozu const-Referenzen als Parameter (const T&)?', R`
<ul><li><b>Keine Kopie</b> – wichtig bei grossen Objekten (⟦std::vector⟧, ⟦std::string⟧).</li>
<li>Die Funktion <b>darf das Objekt nicht ändern</b> (sonst Kompilierfehler).</li>
<li>Kann auch an <b>R-Werte</b> binden (⟦f(3)⟧, ⟦f(a + b)⟧).</li></ul>
<p>Faustregel: kleine Typen (⟦int⟧, ⟦double⟧) per Wert, grosse per ⟦const&⟧, zu ändernde per ⟦&⟧.</p>`);
K(5, 'Code', 4, 'Was passiert? – const-Parameter verändern', R`
<p><b>Kompilierfehler.</b></p>
<p>⟦v⟧ ist ⟦const⟧; ⟦v[0] = 0⟧ versucht es zu ändern.</p>`, {
  q: R`int first(const std::vector<int>& v) {
    int f = v[0];
    v[0] = 0;
    return f;
}

int main() {
    std::vector<int> v = {4, 5};
    std::cout << first(v);
}`, err: 'compile' });
K(5, 'Konzept', 3, 'Was bedeutet const bei einer Variable? Was ist const-Korrektheit?', R`
<p>⟦const int n = 5;⟧: ⟦n⟧ darf nach der Initialisierung nicht mehr verändert werden – vom <b>Compiler</b> geprüft.</p>
<p>Const-Korrektheit: alles, was sich nicht ändern soll, als ⟦const⟧ markieren. Fehler werden so zu Kompilierfehlern statt zu falschen Resultaten.</p>`);

/* ================= 6 Vektoren, Zeichen und Strings ================= */
K(6, 'Definition', 4, 'std::vector: Erzeugen und Zugreifen', R`
⟪std::vector<int> v(n, 0);    // n Elemente, alle 0
std::vector<int> w = {1, 2}; // Initialisierungsliste
v.push_back(7);              // hinten anhängen
v.size();                    // Anzahl (Typ unsigned!)⟫
<p>⟦v[i]⟧: <b>keine</b> Prüfung der Grenzen (Fehler = undefiniertes Verhalten). ⟦v.at(i)⟧: mit Prüfung (wirft eine Ausnahme). Gültige Indizes: $0\dots n-1$.</p>`);
K(6, 'Code', 5, 'Was passiert? – Summe über einen Vektor', R`
<p><b>Undefiniertes Verhalten</b> (Zugriff ausserhalb).</p>
<p>Die Bedingung ⟦i <= v.size()⟧ lässt ⟦i = 3⟧ zu; ⟦v[3]⟧ gibt es nicht. Richtig: ⟦i < v.size()⟧.</p>`, {
  q: R`std::vector<int> v = {1, 2, 3};
int s = 0;
for (unsigned int i = 0; i <= v.size(); ++i)
    s += v[i];
std::cout << s;`, err: 'ub' });
K(6, 'Code', 4, 'Was passiert? – Vektor kopieren', R`
<p><b>Ausgabe:</b> ⟦19⟧</p>
<p>⟦std::vector⟧ hat <b>Wertsemantik</b>: ⟦b = a⟧ kopiert alle Elemente. Änderungen an ⟦b⟧ betreffen ⟦a⟧ nicht.</p>`, {
  q: R`std::vector<int> a = {1, 2, 3};
std::vector<int> b = a;
b[0] = 9;
std::cout << a[0] << b[0];`, out: '19' });
K(6, 'Code', 4, 'Was passiert? – v(3) und push_back', R`
<p><b>Ausgabe:</b> ⟦404⟧</p>
<p>⟦v(3)⟧ erzeugt <b>drei</b> Nullen; ⟦push_back(4)⟧ hängt als viertes Element an. Grösse 4, ⟦v[0] = 0⟧, ⟦v[3] = 4⟧.</p>`, {
  q: R`std::vector<int> v(3);
v.push_back(4);
std::cout << v.size() << v[0] << v[3];`, out: '404' });
K(6, 'Code', 4, 'Was passiert? – Zuweisung an leeren Vektor', R`
<p><b>Undefiniertes Verhalten.</b></p>
<p>⟦v⟧ ist leer; ⟦v[0]⟧ existiert nicht. ⟦[]⟧ hängt nichts an. Richtig: ⟦v.push_back(1);⟧ oder ⟦std::vector<int> v(1);⟧</p>`, {
  q: R`std::vector<int> v;
v[0] = 1;
std::cout << v[0];`, err: 'ub' });
K(6, 'Code', 4, 'Was passiert? – Zeichen ersetzen mit Bereichs-for', R`
<p><b>Ausgabe:</b> ⟦HaLLo5⟧</p>
<p>⟦char& c⟧ ist eine Referenz auf das jeweilige Zeichen → Änderungen wirken im String.</p>`, {
  q: R`std::string s = "Hallo";
for (char& c : s)
    if (c == 'l') c = 'L';
std::cout << s << s.length();`, out: 'HaLLo5' });
K(6, 'Code', 4, 'Was passiert? – Bereichs-for ohne &', R`
<p><b>Ausgabe:</b> ⟦Hallo⟧ – logischer Fehler.</p>
<p>⟦char c⟧ ist eine <b>Kopie</b> jedes Zeichens; die Zuweisung ändert nur die Kopie. Für Änderungen: ⟦char& c⟧.</p>`, {
  q: R`std::string s = "Hallo";
for (char c : s)
    c = 'x';
std::cout << s;`, err: 'logic', out: 'Hallo' });
K(6, 'Code', 3, 'Was passiert? – Caesar-Verschiebung', R`
<p><b>Ausgabe:</b> ⟦b⟧</p>
<p>⟦c - 'a'⟧ = 24 (Position im Alphabet), $(24+3)\bmod26=1$, ⟦'a' + 1⟧ = ⟦'b'⟧. Funktioniert, weil ⟦'a'…'z'⟧ im ASCII aufeinanderfolgen.</p>`, {
  q: R`char c = 'y';
char d = 'a' + (c - 'a' + 3) % 26;
std::cout << d;`, out: 'b' });
K(6, 'Konzept', 2, 'Wie legt man eine n×m-Matrix mit Vektoren an?', R`
⟪std::vector<std::vector<int>> m(n, std::vector<int>(m_, 0));
m[i][j] = 1;   // Zeile i, Spalte j⟫
<p>Ein Vektor von <b>Zeilen</b>; jede Zeile ist ein eigener Vektor. Anzahl Zeilen ⟦m.size()⟧, Spalten ⟦m[0].size()⟧.</p>`);
K(6, 'Code', 3, 'Was passiert? – Schleife rückwärts über v.size()', R`
<p><b>Ausgabe:</b> ⟦0⟧ – die Schleife läuft gar nicht.</p>
<p>⟦v.size()⟧ ist unsigned, also ist auch ⟦v.size() - 3⟧ unsigned: $2-3$ ergibt nicht $-1$, sondern $2^{64}-1$. Damit ist ⟦i < v.size()⟧ sofort falsch. Merke: bei ⟦size()⟧ nie unbedacht subtrahieren.</p>`, {
  q: R`std::vector<int> v = {5, 6};
int s = 0;
for (unsigned long i = v.size() - 3;
     i < v.size(); ++i)
    s += v[i];
std::cout << s;`, out: '0' });

/* ================= 7 Rekursion und EBNF ================= */
K(7, 'Konzept', 5, 'Was braucht eine korrekte rekursive Funktion?', R`
<ul><li><b>Basisfall</b>, der ohne Rekursion endet,</li>
<li><b>Fortschritt</b>: jeder rekursive Aufruf kommt dem Basisfall näher (z. B. ⟦n⟧ wird kleiner und trifft den Basisfall sicher).</li></ul>
<p>Sonst: unendliche Rekursion → Stapelüberlauf (Absturz).</p>`);
K(7, 'Code', 5, 'Was passiert? – f(7) mit Schritt 2', R`
<p><b>Ausgabe:</b> ⟦105⟧</p>
<p>$f(7)=7\cdot f(5)=7\cdot5\cdot f(3)=7\cdot5\cdot3\cdot f(1)=105$.</p>`, {
  q: R`int f(int n) {
    if (n <= 1) return 1;
    return n * f(n - 2);
}

int main() {
    std::cout << f(7);
}`, out: '105' });
K(7, 'Code', 5, 'Was passiert? – Ausgabe vor und nach dem Aufruf', R`
<p><b>Ausgabe:</b> ⟦321123⟧</p>
<p>Vor dem Abstieg wird ⟦3, 2, 1⟧ ausgegeben, beim Zurückkehren in umgekehrter Reihenfolge ⟦1, 2, 3⟧.</p>`, {
  q: R`void p(int n) {
    if (n == 0) return;
    std::cout << n;
    p(n - 1);
    std::cout << n;
}

int main() {
    p(3);
}`, out: '321123' });
K(7, 'Code', 5, 'Was passiert? – Summe in Zweierschritten', R`
<p><b>Unendliche Rekursion → Stapelüberlauf</b> (Laufzeitfehler).</p>
<p>⟦5, 3, 1, -1, -3, …⟧: der Basisfall ⟦n == 0⟧ wird bei ungeradem Start <b>übersprungen</b>. Abhilfe: ⟦if (n <= 0)⟧.</p>`, {
  q: R`int f(int n) {
    if (n == 0) return 0;
    return n + f(n - 2);
}

int main() {
    std::cout << f(5);
}`, err: 'runtime' });
K(7, 'Code', 2, 'Was passiert? – Aufrufe zählen bei fib', R`
<p><b>Ausgabe:</b> ⟦5 15⟧</p>
<p>⟦fib(5) = 5⟧. Die Anzahl Aufrufe $A(n)=1+A(n-1)+A(n-2)$, $A(0)=A(1)=1$: $1,1,3,5,9,15$. Wächst exponentiell.</p>`, {
  q: R`int calls = 0;

int fib(int n) {
    ++calls;
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}

int main() {
    int r = fib(5);
    std::cout << r << " " << calls;
}`, out: '5 15' });
K(7, 'Konzept', 3, 'Fibonacci rekursiv vs. iterativ: Laufzeit?', R`
<p>Naiv rekursiv: jeder Wert wird mehrfach berechnet, Anzahl Aufrufe wächst wie $\varphi^n\approx1.6^n$ → <b>exponentiell</b>.</p>
<p>Iterativ (zwei Variablen, Schleife): <b>linear</b> in $n$. Rekursion ist elegant, aber nicht automatisch effizient.</p>`);
K(7, 'Definition', 4, 'EBNF: Bedeutung von |, { } und [ ]', R`
<ul><li>⟦A | B⟧: Alternative (A <b>oder</b> B)</li>
<li>⟦{ A }⟧: A beliebig oft, auch <b>0-mal</b></li>
<li>⟦[ A ]⟧: A optional (0- oder 1-mal)</li>
<li>⟦"x"⟧ bzw. ⟦'x'⟧: Terminalsymbol (wörtliches Zeichen)</li></ul>
<p>Beispiel: ⟦zahl = ziffer { ziffer }.⟧ = mindestens eine Ziffer.</p>`);
K(7, 'Konzept', 3, 'EBNF: welche Wörter erzeugt A = "a" [ B ] "c". B = "b" { "b" }.?', R`
<p>Erlaubt: ⟦ac⟧, ⟦abc⟧, ⟦abbc⟧, ⟦abbbc⟧, …</p>
<p>Nicht erlaubt: ⟦a⟧ (kein c), ⟦bc⟧ (kein a), ⟦abcb⟧ (nach c nichts mehr), ⟦aac⟧.</p>
<p>Kurz: ein ⟦a⟧, dann beliebig viele ⟦b⟧, dann ⟦c⟧.</p>`);
K(7, 'Konzept', 3, 'Wie wird aus einer EBNF ein Parser (rekursiver Abstieg)?', R`
<ul><li>Pro Regel eine <b>Funktion</b> (⟦expression⟧, ⟦term⟧, ⟦factor⟧), die den Eingabestrom liest.</li>
<li>Alternative → ⟦if⟧ anhand des nächsten Zeichens (Lookahead, ⟦peek⟧),</li>
<li>⟦{ }⟧ → ⟦while⟧, ⟦[ ]⟧ → ⟦if⟧,</li>
<li>Verweis auf eine andere Regel → Funktionsaufruf (darum rekursiv: ⟦factor⟧ ruft bei ⟦(⟧ wieder ⟦expression⟧ auf).</li></ul>
<p>Präzedenz entsteht durch die Schachtelung: expression = term { (+|-) term }, term = factor { (*|/) factor }.</p>`);

/* ================= 8 Structs, Klassen und Operatoren ================= */
K(8, 'Definition', 4, 'struct und class', R`
<p>Eigener Typ aus mehreren <b>Datenelementen</b> (Membern), Zugriff mit ⟦.⟧ (bzw. ⟦->⟧ über Zeiger).</p>
<p>Einziger Unterschied: bei ⟦struct⟧ ist alles standardmässig <b>public</b>, bei ⟦class⟧ <b>private</b>.</p>
<p><b>Datenkapselung:</b> Daten private, Zugriff nur über public Memberfunktionen → die Klasse kann Invarianten garantieren (z. B. Nenner ≠ 0).</p>`);
K(8, 'Code', 4, 'Was passiert? – struct kopieren', R`
<p><b>Ausgabe:</b> ⟦15⟧</p>
<p>Structs werden <b>memberweise kopiert</b>; ⟦b⟧ ist unabhängig von ⟦a⟧.</p>`, {
  q: R`struct P { int x, y; };

int main() {
    P a{1, 2};
    P b = a;
    b.x = 5;
    std::cout << a.x << b.x;
}`, out: '15' });
K(8, 'Code', 5, 'Was passiert? – Zugriff auf Member einer class', R`
<p><b>Kompilierfehler.</b></p>
<p>Bei ⟦class⟧ sind Member standardmässig <b>private</b>; ⟦c.v⟧ ist ausserhalb der Klasse nicht erlaubt. Abhilfe: Getter ⟦int get() const { return v; }⟧.</p>`, {
  q: R`class C {
    int v;
public:
    C(int x) : v(x) {}
};

int main() {
    C c(3);
    std::cout << c.v;
}`, err: 'compile' });
K(8, 'Konzept', 4, 'Konstruktor, Initialisierungsliste, Default-Konstruktor', R`
⟪class Rational {
    int n, d;
public:
    Rational(int num, int den) : n(num), d(den) { assert(den != 0); }
    Rational(int num) : n(num), d(1) {}
    Rational() : n(0), d(1) {}          // Default-Konstruktor
};⟫
<p>Der Compiler erzeugt einen Default-Konstruktor <b>nur, wenn kein eigener Konstruktor</b> existiert.</p>`);
K(8, 'Code', 4, 'Was passiert? – Objekt ohne Argumente anlegen', R`
<p><b>Kompilierfehler.</b></p>
<p>⟦Rational r;⟧ braucht einen Default-Konstruktor. Weil ein eigener Konstruktor definiert ist, erzeugt der Compiler keinen mehr.</p>`, {
  q: R`class Rational {
    int n, d;
public:
    Rational(int num, int den)
        : n(num), d(den) {}
};

int main() {
    Rational r;
    std::cout << "ok";
}`, err: 'compile' });
K(8, 'Konzept', 4, 'Wie überlädt man +, += und << korrekt?', R`
⟪Rational& operator+=(Rational& a, const Rational& b);   // ändert a, gibt a zurück
Rational  operator+ (Rational a, const Rational& b) { return a += b; }
std::ostream& operator<<(std::ostream& o, const Rational& r);⟫
<ul><li>⟦+=⟧ gibt eine <b>Referenz</b> zurück → Verkettung wirkt auf das Original.</li>
<li>⟦+⟧ gibt ein <b>neues Objekt</b> (per Wert) zurück.</li>
<li>⟦<<⟧ gibt den Stream per Referenz zurück → ⟦std::cout << a << b⟧ funktioniert.</li></ul>`);
K(8, 'Code', 3, 'Was passiert? – += verkettet', R`
<p><b>Ausgabe:</b> ⟦5⟧</p>
<p>⟦a += b⟧ gibt eine <b>Referenz auf a</b> zurück, das zweite ⟦+= b⟧ wirkt also wieder auf ⟦a⟧: $1+2+2=5$. Würde ⟦operator+=⟧ per Wert zurückgeben, käme ⟦3⟧ heraus.</p>`, {
  q: R`struct Z { int v; };

Z& operator+=(Z& a, Z b) {
    a.v += b.v;
    return a;
}

int main() {
    Z a{1}, b{2};
    (a += b) += b;
    std::cout << a.v;
}`, out: '5' });
K(8, 'Konzept', 3, 'Was bedeutet const hinter einer Memberfunktion?', R`
<p>⟦int get() const;⟧ verspricht, das Objekt <b>nicht zu verändern</b>. Im Rumpf sind die Member dann ⟦const⟧.</p>
<p>Auf einem ⟦const⟧-Objekt (oder über ⟦const&⟧) dürfen <b>nur const-Memberfunktionen</b> aufgerufen werden – sonst Kompilierfehler.</p>`);
K(8, 'Code', 3, 'Was passiert? – Methode auf const-Referenz', R`
<p><b>Kompilierfehler.</b></p>
<p>⟦c⟧ ist ⟦const Counter&⟧, aber ⟦value()⟧ ist nicht als ⟦const⟧ markiert. Abhilfe: ⟦int value() const { … }⟧.</p>`, {
  q: R`class Counter {
    int n = 0;
public:
    int value() { return n; }
};

void show(const Counter& c) {
    std::cout << c.value();
}

int main() {
    Counter c;
    show(c);
}`, err: 'compile' });

/* ================= 9 Zeiger, Iteratoren, dynamischer Speicher ================= */
K(9, 'Definition', 5, 'Zeiger: &, * und nullptr', R`
⟪int a = 5;
int* p = &a;   // p speichert die Adresse von a
*p = 8;        // Dereferenzieren: a ist jetzt 8
int* q = nullptr; // zeigt auf nichts⟫
<p>⟦&a⟧: Adresse von ⟦a⟧. ⟦*p⟧: das Objekt, auf das ⟦p⟧ zeigt (L-Wert). ⟦p->m⟧ = ⟦(*p).m⟧. ⟦*nullptr⟧ ist undefiniertes Verhalten.</p>`);
K(9, 'Code', 5, 'Was passiert? – zwei Zeiger auf dieselbe Variable', R`
<p><b>Ausgabe:</b> ⟦88⟧</p>
<p>⟦q = p⟧ kopiert die <b>Adresse</b>; beide zeigen auf ⟦a⟧. ⟦*q = 8⟧ ändert also ⟦a⟧.</p>`, {
  q: R`int a = 5;
int* p = &a;
int* q = p;
*q = 8;
std::cout << a << *p;`, out: '88' });
K(9, 'Code', 4, 'Was passiert? – Zeigerarithmetik im Array', R`
<p><b>Ausgabe:</b> ⟦20 40 30⟧</p>
<p>⟦a + 1⟧ zeigt auf ⟦a[1]⟧ = 20. ⟦*(p + 2)⟧ = ⟦a[3]⟧ = 40. ⟦p[1]⟧ = ⟦*(p + 1)⟧ = ⟦a[2]⟧ = 30.</p>`, {
  q: R`int a[] = {10, 20, 30, 40};
int* p = a + 1;
std::cout << *p << " " << *(p + 2)
          << " " << p[1];`, out: '20 40 30' });
K(9, 'Code', 5, 'Was passiert? – Zeiger ohne Ziel', R`
<p><b>Undefiniertes Verhalten.</b></p>
<p>⟦p⟧ ist nicht initialisiert und zeigt irgendwohin. ⟦*p = 3⟧ schreibt an eine zufällige Adresse (oft Absturz). Gleiches gilt für ⟦*nullptr⟧.</p>`, {
  q: R`int* p;
*p = 3;
std::cout << *p;`, err: 'ub' });
K(9, 'Konzept', 4, 'Referenz vs. Zeiger', R`
<table class="pt"><tr><td></td><td><b>Referenz</b></td><td><b>Zeiger</b></td></tr>
<tr><td>muss initialisiert werden</td><td>ja</td><td>nein</td></tr>
<tr><td>umbindbar</td><td>nein</td><td>ja</td></tr>
<tr><td>«leer» möglich</td><td>nein</td><td>⟦nullptr⟧</td></tr>
<tr><td>Zugriff</td><td>direkt</td><td>⟦*p⟧, ⟦p->m⟧</td></tr></table>`);
K(9, 'Code', 4, 'Was passiert? – mit Iterator verdoppeln', R`
<p><b>Ausgabe:</b> ⟦628⟧</p>
<p>⟦v.begin()⟧ zeigt aufs erste Element, ⟦v.end()⟧ <b>hinter</b> das letzte. ⟦*it⟧ ist das Element selbst (veränderbar).</p>`, {
  q: R`std::vector<int> v = {3, 1, 4};
for (auto it = v.begin(); it != v.end(); ++it)
    *it *= 2;
for (int x : v)
    std::cout << x;`, out: '628' });
K(9, 'Code', 2, 'Was passiert? – push_back während der Iteration', R`
<p><b>Undefiniertes Verhalten.</b></p>
<p>⟦push_back⟧ kann den Speicher des Vektors neu anlegen; alle Iteratoren (und ⟦v.end()⟧) werden dabei <b>ungültig</b>.</p>`, {
  q: R`std::vector<int> v = {1, 2, 3};
for (auto it = v.begin(); it != v.end(); ++it)
    if (*it == 2) v.push_back(4);
std::cout << v.size();`, err: 'ub' });
K(9, 'Definition', 4, 'new und delete', R`
⟪int* p = new int(5);       // ein int auf dem Heap
delete p;
int* a = new int[n];       // Array auf dem Heap
delete[] a;⟫
<p>Dynamischer Speicher lebt, <b>bis er freigegeben wird</b> (nicht bis zum Ende des Blocks). Jedes ⟦new⟧ braucht genau ein ⟦delete⟧, ⟦new[]⟧ ein ⟦delete[]⟧.</p>
<ul><li>vergessen → Speicherleck</li><li>doppelt / falsche Form / danach benutzen → undefiniertes Verhalten</li></ul>`);
K(9, 'Code', 4, 'Was passiert? – zweimal delete', R`
<p><b>Undefiniertes Verhalten</b> (doppelte Freigabe, meist Absturz).</p>
<p>⟦q⟧ zeigt auf denselben Speicher wie ⟦p⟧. Nach ⟦delete p⟧ ist er freigegeben; ⟦delete q⟧ gibt ihn ein zweites Mal frei.</p>`, {
  q: R`int* p = new int(3);
int* q = p;
delete p;
delete q;
std::cout << "fertig";`, err: 'ub' });
K(9, 'Regel', 5, 'Dreierregel', R`
<p>Verwaltet eine Klasse eine Ressource (z. B. dynamischen Speicher), braucht sie alle drei:</p>
<ol><li><b>Destruktor</b> ⟦~T()⟧ – gibt frei,</li>
<li><b>Kopierkonstruktor</b> ⟦T(const T&)⟧ – tiefe Kopie,</li>
<li><b>Zuweisungsoperator</b> ⟦T& operator=(const T&)⟧ – alte Daten freigeben, tief kopieren, Selbstzuweisung beachten, ⟦*this⟧ zurückgeben.</li></ol>
<p>Fehlt einer, kopiert der Standard nur den <b>Zeiger</b> (flache Kopie) → doppelte Freigabe.</p>`);
K(9, 'Code', 5, 'Was passiert? – Klasse mit Zeiger kopieren', R`
<p><b>Undefiniertes Verhalten</b> (doppelte Freigabe).</p>
<p>Ohne eigenen Kopierkonstruktor kopiert ⟦Box b = a;⟧ nur den Zeiger. Am Ende von ⟦main⟧ ruft der Destruktor für ⟦b⟧ <b>und</b> ⟦a⟧ ⟦delete⟧ auf denselben Speicher auf. Dreierregel verletzt.</p>`, {
  q: R`class Box {
    int* p;
public:
    Box(int v) : p(new int(v)) {}
    ~Box() { delete p; }
    int get() const { return *p; }
};

int main() {
    Box a(4);
    Box b = a;
    std::cout << b.get();
}`, err: 'ub' });
K(9, 'Code', 4, 'Was passiert? – wann wird was aufgerufen?', R`
<p><b>Ausgabe:</b> ⟦DCCAC⟧</p>
<ul><li>⟦T a;⟧ → Default-Konstruktor ⟦D⟧</li>
<li>⟦T b = a;⟧ → <b>Kopierkonstruktor</b> ⟦C⟧ (Initialisierung, keine Zuweisung!)</li>
<li>⟦T c(a);⟧ → ⟦C⟧</li>
<li>⟦c = b;⟧ → Zuweisung ⟦A⟧ (Objekt existiert schon)</li>
<li>⟦f(a)⟧ → Übergabe per Wert kopiert: ⟦C⟧</li></ul>`, {
  q: R`struct T {
    T() { std::cout << "D"; }
    T(const T&) { std::cout << "C"; }
    T& operator=(const T&) {
        std::cout << "A";
        return *this;
    }
};

void f(T x) {}

int main() {
    T a;
    T b = a;
    T c(a);
    c = b;
    f(a);
}`, out: 'DCCAC' });
K(9, 'Code', 4, 'Was passiert? – verkettete Liste aufbauen', R`
<p><b>Ausgabe:</b> ⟦321⟧</p>
<p>Jeder neue Knoten wird <b>vorne</b> eingefügt (⟦next⟧ = bisheriger Anfang). Die Liste ist ⟦3 → 2 → 1 → nullptr⟧. (Der Speicher wird nicht freigegeben – Speicherleck, aber kein undefiniertes Verhalten.)</p>`, {
  q: R`struct Node {
    int val;
    Node* next;
};

int main() {
    Node* l = nullptr;
    for (int i = 1; i <= 3; ++i)
        l = new Node{i, l};
    for (Node* p = l; p; p = p->next)
        std::cout << p->val;
}`, out: '321' });
K(9, 'Rezept', 3, 'Element am Ende einer verketteten Liste anhängen', R`
⟪void push_back(Node*& head, int v) {
    Node* n = new Node{v, nullptr};
    if (head == nullptr) { head = n; return; }   // leere Liste
    Node* p = head;
    while (p->next != nullptr) p = p->next;      // zum letzten Knoten
    p->next = n;
}⟫
<p>Kopf als ⟦Node*&⟧ übergeben, damit der Fall «leere Liste» den Kopf ändern kann. Laufzeit linear.</p>`);
K(9, 'Rezept', 2, 'Einfügen in einen binären Suchbaum (rekursiv)', R`
⟪void insert(Node*& t, int key) {
    if (t == nullptr)       t = new Node{key, nullptr, nullptr};
    else if (key < t->key)  insert(t->left, key);
    else                    insert(t->right, key);
}⟫
<p>Links stehen kleinere, rechts grössere Schlüssel. In-Order-Durchlauf (links, Knoten, rechts) liefert die Schlüssel sortiert.</p>`);

/* ================= 10 Vererbung und Polymorphie ================= */
K(10, 'Konzept', 3, 'Was bewirkt virtual?', R`
<p>Wird eine ⟦virtual⟧-Funktion über einen <b>Zeiger oder eine Referenz auf die Basisklasse</b> aufgerufen, entscheidet der <b>dynamische Typ</b> (das tatsächliche Objekt) zur Laufzeit, welche Version läuft.</p>
<p>Ohne ⟦virtual⟧ entscheidet der <b>statische Typ</b> (Typ des Zeigers). Bei Übergabe <b>per Wert</b> wird das Objekt abgeschnitten (Slicing) → immer Basisversion.</p>`);
K(10, 'Code', 3, 'Was passiert? – virtual, nicht-virtual und Slicing', R`
<p><b>Ausgabe:</b> ⟦BabA⟧</p>
<ul><li>⟦p->f()⟧: ⟦f⟧ ist virtual, Objekt ist ein ⟦B⟧ → ⟦B⟧</li>
<li>⟦p->g()⟧: nicht virtual, statischer Typ ⟦A*⟧ → ⟦a⟧</li>
<li>⟦b.g()⟧: direkt auf ⟦B⟧ → ⟦b⟧</li>
<li>⟦A x = b;⟧ kopiert nur den A-Teil (Slicing) → ⟦x.f()⟧ = ⟦A⟧</li></ul>`, {
  q: R`struct A {
    virtual void f() { std::cout << "A"; }
    void g()         { std::cout << "a"; }
};
struct B : A {
    void f() override { std::cout << "B"; }
    void g()          { std::cout << "b"; }
};

int main() {
    B b;
    A* p = &b;
    p->f(); p->g(); b.g();
    A x = b;
    x.f();
}`, out: 'BabA' });
K(10, 'Konzept', 2, 'Warum braucht eine Basisklasse einen virtuellen Destruktor?', R`
<p>Bei ⟦delete p;⟧ mit ⟦Base* p = new Derived;⟧ wird ohne ⟦virtual ~Base()⟧ nur der Destruktor von ⟦Base⟧ aufgerufen → undefiniertes Verhalten, Ressourcen von ⟦Derived⟧ werden nicht freigegeben.</p>`);

/* ---------- Abschluss: Nummern, IDs, Suchtext ---------- */
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const plain = s => s.replace(/<[^>]+>/g, ' ').replace(/[⟦⟧⟪⟫$]/g, ' ').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}^_\\]/g, ' ').replace(/\s+/g, ' ').trim();
const order = [...L].sort((a, b) => a.chap - b.chap);
const per = {}, seen = new Set();
window.CARDS = order.map((c, i) => {
  per[c.chap] = (per[c.chap] || 0) + 1;
  let id = 'inf-' + slug(c.title);
  while (seen.has(id)) id += '-2';
  seen.add(id);
  return {
    id, kind: c.kind, nr: c.chap + '.' + per[c.chap], chap: c.chap, chapTitle: CH[c.chap], sec: '',
    star: false, title: c.title, titled: true, prio: c.prio, tip: c.tip || '',
    body: fmt(c.body.trim()), q: c.q ? block(c.q) : '', fs: true, ex: '',
    img: null, page: null, proofP: null, proofH: null,
    text: c.title + ' ' + plain(c.body) + ' ' + (c.q || ''), ord: i,
    _src: c.q || '', _out: c.out, _err: c.err,
  };
});
window.CHAPTERS = CH;
window.LOGIC = {};
})();
