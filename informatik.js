// LemmaLab – Kartenset Informatik (ETH, C++).
// Von Hand gepflegt. Prioritäten sind eine Einschätzung (noch keine Auswertung alter Prüfungen):
//   5 = Kern, 4 = Wichtig, 3 = Solide, 2 = Ergänzung, 1 = Rand.
// Arten: Definition, Regel, Konzept (Frage), Code («Was passiert?» – Tracing, teils mit versteckten Fehlern), Rezept.
// Kapitel und viele Code-Karten folgen dem «C++ Fehlerkatalog» (Kategorien CE, UB, SO, LZ, EN, LF, OK).
// Felder: q = Code, der VOR dem Aufdecken gezeigt wird; out / err = erwartetes Verhalten
//   (wird mit tools/test_informatik.mjs gegen g++ geprüft: err = compile | ub | so | lz | loop | runtime | logic).
// Text: HTML; ⟦…⟧ = Inline-Code, ⟪…⟫ = Code-Block (beides wird escaped), Mathematik in $…$ (KaTeX).
(function () {
'use strict';
const CH = {
  1: 'Programmaufbau, Variablen und Ausgabe',
  2: 'Ausdrücke und Operatoren',
  3: 'Fundamentaltypen: int, unsigned, double, bool, char',
  4: 'Kontrollstrukturen: if, Schleifen, switch',
  5: 'Funktionen',
  6: 'Vektoren',
  7: 'Referenzen und const',
  8: 'Zeichen und Strings',
  9: 'Rekursion und EBNF',
  10: 'Structs, Klassen und Operatoren',
  11: 'Container und Iteratoren',
  12: 'Zeiger und Arrays',
  13: 'Dynamischer Speicher, Listen und Dreierregel',
  14: 'Vererbung und Polymorphie',
};
const L = [];
const K = (chap, kind, prio, title, body, o = {}) => L.push({ chap, kind, prio, title, body, ...o });
const R = String.raw;
const VERD = {
  compile: '<b>Kompilierfehler.</b>',
  ub: '<b>Undefiniertes Verhalten.</b>',
  so: '<b>Stack Overflow</b> – unendliche oder zu tiefe Rekursion (undefiniertes Verhalten, praktisch Absturz).',
  lz: '<b>Laufzeitfehler</b> – kontrollierter Abbruch (definiertes Verhalten).',
  loop: '<b>Endlosschleife.</b>',
};
// Kurzform für Code-Karten. r = { out } | { out, lf: true } (logischer Fehler) | { out, ok: true } (korrekt – Falle!)
//                                  | { err: 'compile' | 'ub' | 'so' | 'lz' | 'loop' }; show = abweichende Anzeige der Ausgabe
const C = (chap, prio, title, q, r, why) => {
  const head = r.err ? VERD[r.err]
    : `<b>Ausgabe:</b> ${r.out === '' ? '(nichts)' : `⟦${r.show ?? r.out}⟧`}${r.lf ? ' – <b>logischer Fehler</b>.' : r.ok ? ' – korrekt, keine Falle.' : ''}`;
  K(chap, 'Code', prio, 'Was passiert? – ' + title, `<p>${head}</p>\n<p>${why}</p>`, { q, out: r.out, err: r.lf ? 'logic' : r.err });
};

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

/* ================= 1 Programmaufbau, Variablen und Ausgabe ================= */
K(1, 'Rezept', 5, 'Code-Tracing in der Prüfung: Vorgehen', R`
<ol>
<li><b>Kompiliert es?</b> Syntax (⟦;⟧, Klammern), Deklaration vor Gebrauch, Gültigkeitsbereich, Typen, ⟦const⟧, ⟦private⟧, Referenz an R-Wert, Default-Konstruktor. Nein → <b>CE</b>.</li>
<li><b>Variablen-Tabelle</b> führen und tracen. Wird etwas Ungültiges gelesen oder geschrieben (uninitialisiert, Index ausserhalb, ⟦nullptr⟧, gelöschter Speicher, int-Überlauf, Division durch 0)? → <b>UB</b>.</li>
<li>Wird zur Laufzeit <b>geprüft und abgebrochen</b> (⟦.at()⟧, ⟦assert⟧, ⟦stoi⟧)? → <b>LZ</b>.</li>
<li><b>Terminiert</b> jede Schleife / Rekursion? Fortschritt Richtung Abbruch? Nein → <b>EN</b> bzw. <b>SO</b>.</li>
<li><b>Ausgabe exakt</b> aufschreiben: Leerzeichen, Zeilenumbrüche, Ganzzahldivision, ⟦bool⟧ als ⟦0/1⟧, ⟦double⟧ ohne ⟦.0⟧, ⟦char⟧ als Zeichen.</li>
</ol>`);
K(1, 'Konzept', 5, 'Die sieben Antwort-Kategorien bei «Was gibt das Programm aus?»', R`
<table class="pt">
<tr><td><b>CE</b></td><td>Kompilierfehler: kein Programm, also auch keine Ausgabe (Syntax, Typen, Scope, ⟦const⟧, ⟦private⟧).</td></tr>
<tr><td><b>UB</b></td><td>Undefiniertes Verhalten: kompiliert, verletzt aber eine Regel – nichts ist garantiert.</td></tr>
<tr><td><b>SO</b></td><td>Stack Overflow: Spezialfall von UB durch unendliche oder zu tiefe Rekursion.</td></tr>
<tr><td><b>LZ</b></td><td>Laufzeitfehler mit <b>definiertem</b> Abbruch: ⟦v.at()⟧, ⟦assert⟧, Exception.</td></tr>
<tr><td><b>EN</b></td><td>Endlos / Timeout: terminiert nicht oder praktisch nie.</td></tr>
<tr><td><b>LF</b></td><td>Logikfehler: läuft sauber, Ausgabe eindeutig, aber nicht das Gemeinte.</td></tr>
<tr><td><b>OK</b></td><td>Sieht nach Fehler aus, ist aber korrekt (Falle in die andere Richtung).</td></tr></table>
<p>Wichtigste Unterscheidung: <b>CE</b> findet der Compiler, <b>UB</b> prüft niemand, <b>LZ</b> wird zur Laufzeit geprüft und sicher abgebrochen.</p>`);
K(1, 'Regel', 5, 'Prüfungsregeln beim Code-Tracing', R`
<ul><li><b>CE schlägt alles:</b> ein Programm, das nicht kompiliert, hat weder UB noch eine Endlosschleife.</li>
<li><b>UB macht die ganze Ausgabe undefiniert</b> – auch das, was vorher ausgegeben würde.</li>
<li>Eine <b>Warnung ist kein Kompilierfehler</b> (aber oft ein Hinweis auf UB oder LF).</li>
<li>In Code-Ausschnitten gelten ⟦#include⟧s als vorhanden; Code ohne ⟦main⟧ steht in ⟦main⟧.</li>
<li>Schleifenköpfe Zeichen für Zeichen lesen: ⟦;⟧ am Ende? ⟦<⟧ oder ⟦<=⟧? ⟦++⟧ oder ⟦--⟧? Typ der Laufvariable?</li></ul>`);
K(1, 'Konzept', 3, 'Exit-Codes in Code Expert: was bedeuten −6, −8, −9, −11?', R`
<table class="pt">
<tr><td>⟦0⟧</td><td>normales Ende</td></tr>
<tr><td>⟦-6⟧ SIGABRT</td><td>⟦assert⟧ fehlgeschlagen, nicht gefangene Exception (⟦.at()⟧, ⟦stoi⟧), double free</td></tr>
<tr><td>⟦-8⟧ SIGFPE</td><td>ganzzahlige Division durch 0</td></tr>
<tr><td>⟦-9⟧ SIGKILL</td><td>Zeit- oder Speicherlimit überschritten (Endlosschleife)</td></tr>
<tr><td>⟦-11⟧ SIGSEGV</td><td>Segmentation Fault: ⟦nullptr⟧, ungültiger Speicher, Stack Overflow</td></tr></table>`);
K(1, 'Regel', 5, 'Die 5 häufigsten Prüfungsfallen', R`
<ol><li><b>Semikolon</b> direkt nach ⟦for (…)⟧, ⟦while (…)⟧ oder ⟦if (…)⟧.</li>
<li><b>unsigned</b> (auch ⟦v.size()⟧!) mit ⟦>= 0⟧ oder Subtraktion.</li>
<li><b>Ganzzahldivision</b> in einem Ausdruck, der in ⟦double⟧ gespeichert wird.</li>
<li><b>Grenzen:</b> ⟦<=⟧ statt ⟦<⟧, Index ⟦size()⟧, Basisfall der Rekursion wird nie erreicht.</li>
<li><b>Kopie statt Referenz:</b> Pass by Value, Range-for ohne ⟦&⟧, ⟦int b = r;⟧.</li></ol>`);
C(1, 4, 'Zeilenumbruch ohne Abschluss', R`int x = 3
std::cout << x;`, { err: 'compile' },
  R`Das ⟦;⟧ nach ⟦int x = 3⟧ fehlt. Zeilenumbrüche spielen keine Rolle: der Compiler liest ⟦int x = 3 std::cout << x;⟧ und meldet den Fehler erst in der nächsten Zeile.`);
C(1, 3, 'Gross und klein', R`int my_Number = 4;
std::cout << my_number;`, { err: 'compile' },
  R`C++ unterscheidet Gross- und Kleinschreibung: ⟦my_Number⟧ und ⟦my_number⟧ sind verschiedene Namen; ⟦my_number⟧ ist nicht deklariert.`);
C(1, 2, 'Variablennamen', R`int 2x = 3;
int new = 4;`, { err: 'compile' },
  R`Namen dürfen nicht mit einer Ziffer beginnen und keine Schlüsselwörter sein (⟦new⟧, ⟦int⟧, ⟦for⟧, ⟦class⟧, ⟦delete⟧ …).`);
C(1, 2, 'Kommentar im Kommentar', R`/* aussen /* innen */ immer noch Kommentar? */
int x = 1;`, { err: 'compile' },
  R`⟦/*⟧ endet beim <b>ersten</b> ⟦*/⟧. Danach steht ⟦immer noch Kommentar? */⟧ als Code da. Blockkommentare lassen sich nicht verschachteln.`);
C(1, 3, 'Pfeile in der Ausgabe', R`int x = 5;
std::cout >> x;`, { err: 'compile' },
  R`Ausgabe: ⟦std::cout << x⟧, Eingabe: ⟦std::cin >> x⟧. Die Pfeile zeigen, wohin die Daten fliessen; ⟦>>⟧ ist für ⟦cout⟧ nicht definiert.`);
C(1, 4, 'Zuweisung vor der Deklaration', R`x = 5;
int x;`, { err: 'compile' },
  R`Der Gültigkeitsbereich einer Variable beginnt erst <b>nach</b> ihrer Deklaration.`);
C(1, 4, 'Zweimal int x', R`int x = 1;
int x = 2;
std::cout << x;`, { err: 'compile' },
  R`Im selben Block darf ein Name nur einmal deklariert werden (in einem <b>inneren</b> Block wäre es erlaubt: Shadowing). Gemeint war wohl die Zuweisung ⟦x = 2;⟧.`);
C(1, 4, 'Literal links vom =', R`int x;
2 = x;`, { err: 'compile' },
  R`Links von ⟦=⟧ muss ein <b>L-Wert</b> stehen (etwas mit Adresse). Das Literal ⟦2⟧ hat keine. Ebenso falsch: ⟦x + 1 = 5;⟧`);
C(1, 4, 'Lichtgeschwindigkeit ändern', R`const int speed_of_light = 299792458;
speed_of_light = 300000;`, { err: 'compile' },
  R`⟦const⟧-Variablen können nach der Initialisierung nur noch gelesen werden.`);
C(1, 3, 'Konstante ohne Wert', R`const int n;
std::cout << "ok";`, { err: 'compile' },
  R`Eine Konstante kann später nicht mehr geändert werden – also muss sie bei der Deklaration einen Wert bekommen.`);
C(1, 3, 'Text in int', R`int x = "42";
std::cout << x;`, { err: 'compile' },
  R`Ein String-Literal (⟦const char*⟧) lässt sich nicht in ⟦int⟧ umwandeln. Zwischen «kompatiblen» Typen (⟦double⟧ → ⟦int⟧) konvertiert C++ dagegen still.`);
C(1, 4, 'Initialisierung mit geschweiften Klammern', R`int x{3.9};
std::cout << x;`, { err: 'compile' },
  R`Die Initialisierung mit ⟦{}⟧ verbietet verlustbehaftete Umwandlungen (<b>narrowing</b>). ⟦int x = 3.9;⟧ kompiliert (Wert 3), ⟦int x{3.9};⟧ nicht.`);
C(1, 4, 'Zwei Variablen in einer Zeile', R`int a, b = 5;
std::cout << a + b;`, { err: 'ub' },
  R`Das ⟦= 5⟧ gilt nur für ⟦b⟧. ⟦a⟧ ist uninitialisiert, und es wird gelesen. Richtig: ⟦int a = 5, b = 5;⟧`);
C(1, 3, 'x mit sich selbst initialisieren', R`int x = x + 1;
std::cout << x;`, { err: 'ub' },
  R`Kompiliert! Der Gültigkeitsbereich von ⟦x⟧ beginnt direkt nach dem Namen, rechts ist ⟦x⟧ also schon bekannt – aber noch uninitialisiert.`);
C(1, 4, 'Vergleich als Anweisung', R`int x = 3;
x == 5;   // gemeint war x = 5
std::cout << x;`, { out: '3', lf: true },
  R`⟦x == 5⟧ ist ein gültiger Ausdruck (Wert ⟦false⟧), der einfach weggeworfen wird. Nur eine Warnung «statement has no effect».`);
C(1, 2, 'Zwei Texte hintereinander', R`std::cout << "Hallo " "Welt";`, { out: 'Hallo Welt', ok: true },
  R`Direkt aufeinanderfolgende String-Literale werden vom Compiler zu einem zusammengefügt.`);
C(1, 4, 'Text plus Zahl', R`std::cout << "Summe: " + 5;`, { out: ': ', lf: true },
  R`⟦"Summe: "⟧ ist ein ⟦const char*⟧; ⟦+ 5⟧ ist <b>Zeigerarithmetik</b>: die Ausgabe beginnt 5 Zeichen später, bei ⟦": "⟧. Keine Zahl! Bei ⟦+ 20⟧ wäre man ausserhalb des Literals → UB. Richtig: ⟦"Summe: " << 5⟧.`);
C(1, 3, 'Anführungszeichen im Text', R`std::cout << "Er sagte "Hallo"";`, { err: 'compile' },
  R`Das zweite ⟦"⟧ beendet den String. Richtig mit Escape: ⟦"Er sagte \"Hallo\""⟧.`);
C(1, 3, 'Windows-Pfad', R`std::cout << "C:\neu\test";`, { out: 'C:\neu\test', show: 'C:⏎eu⇥est', lf: true },
  R`⟦\n⟧ ist ein Zeilenumbruch (⏎), ⟦\t⟧ ein Tabulator (⇥). Ausgegeben wird ⟦C:⟧, neue Zeile, ⟦eu⟧, Tabulator, ⟦est⟧. Ein echter Backslash: ⟦\\⟧.`);
C(1, 3, 'main ohne return', R`int main() {
    std::cout << "ok";
}`, { out: 'ok', ok: true },
  R`Sonderregel nur für ⟦main⟧: fehlt ⟦return⟧, gilt ⟦return 0;⟧. Bei jeder anderen Funktion mit Rückgabetyp ist das UB.`);

/* ================= 2 Ausdrücke und Operatoren ================= */
K(2, 'Definition', 3, 'L-Wert und R-Wert', R`
<p><b>L-Wert:</b> Ausdruck mit einer <b>Adresse</b> (Speicherstelle), z. B. eine Variable ⟦x⟧ oder ⟦v[i]⟧. Kann links von ⟦=⟧ stehen und verändert werden.</p>
<p><b>R-Wert:</b> Ausdruck, der nur einen <b>Wert</b> liefert, z. B. ⟦3⟧, ⟦x + 1⟧, ⟦x++⟧. Kann nicht zugewiesen werden.</p>
<p>⟦++x⟧ ist ein L-Wert, ⟦x++⟧ ein R-Wert (alter Wert).</p>`);
K(2, 'Regel', 4, 'Präzedenz und Assoziativität', R`
<p>Reihenfolge (stark → schwach): unäres ⟦- ! ++ --⟧ → ⟦* / %⟧ → ⟦+ -⟧ → ⟦<< >>⟧ → ⟦< <= > >=⟧ → ⟦== !=⟧ → ⟦&&⟧ → ⟦||⟧ → ⟦=⟧.</p>
<p>Arithmetische Operatoren sind <b>linksassoziativ</b>: ⟦a - b - c⟧ = ⟦(a - b) - c⟧. Zuweisung ist rechtsassoziativ: ⟦a = b = 3⟧.</p>`, { tip: 'Im Zweifel klammern – in der Prüfung jeden Teilausdruck mit seinem Typ annotieren.' });
K(2, 'Regel', 5, 'Ganzzahldivision und Modulo', R`
<p>⟦a / b⟧ mit zwei ⟦int⟧ rundet <b>gegen 0</b> (Nachkommastellen abschneiden). Für ⟦%⟧ gilt immer:</p>
$$(a/b)\cdot b + a\,\%\,b = a$$
<p>Darum hat ⟦a % b⟧ das <b>Vorzeichen von a</b>: ⟦-7 / 2 == -3⟧, ⟦-7 % 2 == -1⟧. Division durch 0 ist undefiniertes Verhalten.</p>`);
K(2, 'Regel', 5, 'Kurzschlussauswertung von && und ||', R`
<p>⟦a && b⟧: ist ⟦a⟧ falsch, wird ⟦b⟧ <b>nicht ausgewertet</b>. ⟦a || b⟧: ist ⟦a⟧ wahr, wird ⟦b⟧ nicht ausgewertet.</p>
<p>Nützlich als Schutz: ⟦x != 0 && z / x > y⟧ (keine Division durch 0). Nebeneffekte in ⟦b⟧ (⟦++i⟧, Funktionsaufrufe) finden dann nicht statt.</p>`);
K(2, 'Regel', 4, 'Auswertungsreihenfolge und Nebeneffekte (seit C++17)', R`
<ul><li>Wird <b>dieselbe Variable zweimal unsequenziert verändert</b> (oder verändert und gelesen), ist das UB: ⟦i++ + ++i⟧.</li>
<li>Bei ⟦=⟧ wird die <b>rechte Seite vollständig zuerst</b> ausgewertet: ⟦i = i++;⟧ ist definiert (⟦i⟧ bleibt gleich).</li>
<li>Operanden von ⟦<<⟧ werden <b>von links nach rechts</b> ausgewertet: ⟦std::cout << i++ << i++⟧ ist definiert.</li>
<li>Reihenfolge von <b>Funktionsargumenten</b> ⟦f(i++, i++)⟧ ist <b>nicht</b> festgelegt.</li>
<li>⟦&&⟧, ⟦||⟧, ⟦?:⟧ und der Komma-Operator werten links zuerst aus.</li></ul>`);
K(2, 'Konzept', 3, 'Was macht der Komma-Operator?', R`
<p>⟦a, b⟧ wertet ⟦a⟧ aus, wirft das Resultat weg, wertet dann ⟦b⟧ aus; Wert des Ganzen ist ⟦b⟧. Er hat die <b>tiefste Präzedenz</b> von allen Operatoren.</p>
<ul><li>⟦int x = (1, 2, 3);⟧ → ⟦x = 3⟧</li>
<li>⟦pi = 3,14;⟧ → ⟦(pi = 3), 14;⟧ → ⟦pi = 3⟧</li>
<li>In einer Deklaration trennt das Komma dagegen Variablen: ⟦double pi = 3,14;⟧ ist ein Kompilierfehler.</li></ul>`);
K(2, 'Konzept', 3, 'Was sind ^, & und | in C++?', R`
<p>Bitweise Operatoren auf der Binärdarstellung: ⟦&⟧ UND, ⟦|⟧ ODER, ⟦^⟧ XOR (exklusives Oder), ⟦~⟧ NICHT.</p>
<p>⟦2 ^ 3⟧ ist <b>nicht</b> $2^3$, sondern $010_2 \oplus 011_2 = 001_2 = 1$. Potenzen: ⟦std::pow⟧ oder Schleife.</p>
<p>⟦a & b⟧ statt ⟦a && b⟧: ⟦1 & 2⟧ = 0 → falsch, obwohl beide ≠ 0 sind.</p>`);
K(2, 'Code', 5, 'Was passiert? – Division mit Vorzeichen', R`
<p><b>Ausgabe:</b> ⟦3 -3 -1 1⟧</p>
<p>Ganzzahldivision schneidet gegen 0 ab; der Rest hat das Vorzeichen des <b>linken</b> Operanden: ⟦-7 % 3 == -1⟧, ⟦7 % -3 == 1⟧.</p>`, {
  q: R`std::cout << 7 / 2 << " " << -7 / 2 << " "
          << -7 % 3 << " " << 7 % -3;`, out: '3 -3 -1 1' });
K(2, 'Code', 5, 'Was passiert? – int und double gemischt', R`
<p><b>Ausgabe:</b> ⟦8 9⟧</p>
<p>Auswertung von links nach rechts: ⟦9 / 2⟧ ist <b>Ganzzahldivision</b> = 4, dann ⟦4 * 2.0⟧ = 8.0 (ausgegeben als ⟦8⟧).<br>
Rechts: ⟦9 / 2.0⟧ = 4.5 (double, weil ein Operand double ist), ⟦4.5 * 2⟧ = 9.</p>`, {
  q: R`std::cout << 9 / 2 * 2.0 << " "
          << 9 / 2.0 * 2;`, out: '8 9' });
K(2, 'Code', 4, 'Was passiert? – Prä- und Postinkrement', R`
<p><b>Ausgabe:</b> ⟦7 7 14⟧</p>
<p>⟦i++⟧ liefert den <b>alten</b> Wert (5) → ⟦j = 7⟧, danach ⟦i = 6⟧. ⟦++i⟧ erhöht zuerst → ⟦i = 7⟧, ⟦k = 14⟧.</p>`, {
  q: R`int i = 5;
int j = i++ + 2;
int k = ++i * 2;
std::cout << i << " " << j << " " << k;`, out: '7 7 14' });
K(2, 'Code', 5, 'Was passiert? – Nebeneffekt hinter &&', R`
<p><b>Ausgabe:</b> ⟦0 0⟧</p>
<p>⟦i > 0⟧ ist falsch → wegen Kurzschluss wird ⟦++i⟧ nie ausgeführt. ⟦bool⟧ wird als ⟦0⟧/⟦1⟧ ausgegeben.</p>`, {
  q: R`int i = 0;
bool b = (i > 0) && (++i > 0);
std::cout << b << " " << i;`, out: '0 0' });
K(2, 'Code', 2, 'Was passiert? – Ausgabe mit Vergleich', R`
<p><b>Kompilierfehler.</b></p>
<p>⟦<<⟧ bindet stärker als ⟦<⟧: gelesen wird ⟦(std::cout << 3) < 4⟧, also «Stream kleiner als int» – das gibt es nicht. Richtig: ⟦std::cout << (3 < 4);⟧</p>`, {
  q: R`std::cout << 3 < 4;`, err: 'compile' });
C(2, 4, 'Celsius-Umrechnung', R`int f = 212;
std::cout << 5 / 9 * (f - 32) << " "
          << 5 * (f - 32) / 9;`, { out: '0 100', lf: true },
  R`Links nach rechts: ⟦5 / 9⟧ ist Ganzzahldivision = 0, mal irgendwas bleibt 0. Im zweiten Ausdruck wird zuerst multipliziert ($5\cdot180=900$), dann geteilt: $900/9=100$.`);
C(2, 4, 'Modulo mit double', R`double x = 7.5;
std::cout << x % 2;`, { err: 'compile' },
  R`⟦%⟧ ist nur für ganzzahlige Typen definiert (für ⟦double⟧ gäbe es ⟦std::fmod⟧).`);
C(2, 5, 'Division durch eine Variable', R`int a = 5;
int b = 0;
std::cout << a / b;`, { err: 'ub' },
  R`Ganzzahlige Division durch 0 (ebenso ⟦a % 0⟧). C++ prüft den Divisor nicht. In der Praxis: Absturz mit SIGFPE, Exit-Code ⟦-8⟧.`);
C(2, 3, 'double durch 0.0', R`double a = 1.0;
double b = 0.0;
std::cout << a / b << " " << -a / b
          << " " << b / b;`, { out: 'inf -inf -nan', ok: true },
  R`Mit IEEE-Gleitkommazahlen ergibt $1.0/0.0=\infty$ und $0.0/0.0$ = NaN. <b>Kein Absturz</b> – im Gegensatz zu ⟦int / 0⟧. (Ob ⟦nan⟧ oder ⟦-nan⟧ gedruckt wird, ist systemabhängig.)`);
C(2, 5, 'Drei Zahlen der Grösse nach', R`int a = 3, b = 2, c = 1;
std::cout << (a < b < c);`, { out: '1', lf: true },
  R`Linksassoziativ: ⟦(a < b) < c⟧ = ⟦false < 1⟧ = ⟦0 < 1⟧ = wahr. Mathematisch wäre $3<2<1$ falsch. Richtig: ⟦a < b && b < c⟧.`);
C(2, 5, 'Liegt x im Bereich?', R`int x = 20;
if (0 < x < 10)
    std::cout << "im Bereich";`, { out: 'im Bereich', lf: true },
  R`⟦0 < x⟧ ergibt ⟦true⟧ = 1, und ⟦1 < 10⟧ ist immer wahr. Richtig: ⟦0 < x && x < 10⟧.`);
C(2, 5, 'x ist eins oder zwei', R`int x = 5;
if (x == 1 || 2)
    std::cout << "eins oder zwei";`, { out: 'eins oder zwei', lf: true },
  R`Gelesen wird ⟦(x == 1) || 2⟧. Die Zahl 2 wird zu ⟦true⟧ (jede Zahl ≠ 0). Richtig: ⟦x == 1 || x == 2⟧.`);
C(2, 3, 'Bereich in einem Zug', R`int x = 5;
bool b = x > 0 && < 10;`, { err: 'compile' },
  R`Jeder Vergleich braucht zwei Operanden: ⟦x > 0 && x < 10⟧.`);
C(2, 4, 'Zwei hoch drei', R`std::cout << (2 ^ 3);`, { out: '1', lf: true },
  R`⟦^⟧ ist das bitweise XOR: $010_2\oplus011_2=001_2=1$. Potenz: ⟦std::pow(2, 3)⟧.`);
C(2, 3, 'Zwei hoch drei ohne Klammern', R`std::cout << 2 ^ 3;`, { err: 'compile' },
  R`⟦<<⟧ bindet stärker als ⟦^⟧: gelesen als ⟦(std::cout << 2) ^ 3⟧ – Stream XOR Zahl gibt es nicht.`);
C(2, 4, 'Beide wahr?', R`int a = 1, b = 2;
if (a & b)
    std::cout << "beide wahr";
else
    std::cout << "nicht beide";`, { out: 'nicht beide', lf: true },
  R`⟦&⟧ ist das bitweise UND: $01_2\ \&\ 10_2=00_2=0$ → falsch. Mit ⟦a && b⟧ wären beide wahr. Analog ⟦|⟧ vs. ⟦||⟧.`);
C(2, 4, 'Zusammengesetzte Zuweisung', R`int x = 2;
x *= 3 + 1;
std::cout << x;`, { out: '8' },
  R`⟦x *= 3 + 1⟧ bedeutet ⟦x = x * (3 + 1)⟧: die ganze rechte Seite wird zuerst ausgewertet. (Wer ⟦x * 3 + 1 = 7⟧ erwartet, liegt falsch.)`);
C(2, 3, 'Doppelte Zuweisung', R`int a, b;
a = b = 3;
std::cout << a << b;`, { out: '33', ok: true },
  R`Zuweisung ist rechtsassoziativ: ⟦a = (b = 3)⟧. Eine Zuweisung ist selbst ein Ausdruck mit dem zugewiesenen Wert.`);
C(2, 4, 'Pi mit Komma (Deklaration)', R`double pi = 3,14;
std::cout << pi;`, { err: 'compile' },
  R`In einer Deklaration trennt das Komma mehrere Variablen: ⟦double pi = 3, 14;⟧ – und ⟦14⟧ ist kein gültiger Name.`);
C(2, 4, 'Pi mit Komma (Zuweisung)', R`double pi;
pi = 3,14;
std::cout << pi;`, { out: '3', lf: true },
  R`Hier ist ⟦,⟧ der Komma-Operator mit der tiefsten Präzedenz: ⟦(pi = 3), 14;⟧. Kompiliert (nur Warnung), ⟦pi⟧ ist 3.`);
C(2, 3, 'Drei Zahlen in Klammern', R`int x = (1, 2, 3);
std::cout << x;`, { out: '3' },
  R`Der Komma-Operator wertet alle Teile von links nach rechts aus und liefert den Wert des <b>letzten</b>.`);
C(2, 3, 'Zuweisung an i++', R`int i = 5;
i++ = 3;`, { err: 'compile' },
  R`⟦i++⟧ liefert eine temporäre Kopie (R-Wert). ⟦++i = 3;⟧ würde dagegen kompilieren (⟦++i⟧ ist ein L-Wert).`);
C(2, 3, 'Fünf erhöhen', R`std::cout << ++5;`, { err: 'compile' },
  R`⟦++⟧ braucht einen L-Wert (eine Variable); ein Literal kann man nicht verändern.`);
C(2, 4, 'Zweimal i verändern', R`int i = 1;
int x = i++ + ++i;
std::cout << x;`, { err: 'ub' },
  R`Die beiden Operanden von ⟦+⟧ sind nicht in festgelegter Reihenfolge ausgewertet; ⟦i⟧ wird dabei zweimal verändert → undefiniert (Warnung «operation on 'i' may be undefined»).`);
C(2, 3, 'i = i++', R`int i = 5;
i = i++;
std::cout << i;`, { out: '5', ok: true },
  R`Seit C++17 wird die rechte Seite (inkl. Nebeneffekt) vollständig <b>vor</b> der Zuweisung ausgewertet: ⟦i++⟧ liefert 5 und setzt ⟦i = 6⟧, dann wird ⟦i = 5⟧ zugewiesen. (Vor C++17 war das UB.)`);
C(2, 3, 'Zweimal i++ in der Ausgabe', R`int i = 1;
std::cout << i++ << " " << i++ << " " << i;`, { out: '1 2 3', ok: true },
  R`Seit C++17 werden die Operanden von ⟦<<⟧ von links nach rechts ausgewertet. Bei Funktionsargumenten ⟦f(i++, i++)⟧ wäre die Reihenfolge weiterhin offen.`);
C(2, 5, 'Division geschützt', R`int n = 10, d = 0;
if (d != 0 && n / d > 1)
    std::cout << "gross";
else
    std::cout << "nichts";`, { out: 'nichts', ok: true },
  R`Kurzschluss: der rechte Operand von ⟦&&⟧ wird nur ausgewertet, wenn der linke wahr ist. ⟦n / d⟧ wird nie berechnet.`);
C(2, 5, 'Division geschützt, umgestellt', R`int n = 10, d = 0;
if (n / d > 1 && d != 0)
    std::cout << "gross";`, { err: 'ub' },
  R`Die Division durch 0 passiert, <b>bevor</b> geprüft wird. Die Reihenfolge der Bedingungen bei ⟦&&⟧ und ⟦||⟧ ist entscheidend.`);
C(2, 4, 'Punkt vor Strich mit Modulo', R`std::cout << 7 / 2 * 2 + 7 % 2;`, { out: '7', ok: true },
  R`$(7/2)\cdot2+7\bmod2=3\cdot2+1=7$. Ganzzahldivision und Rest ergänzen sich genau zu ⟦a⟧: ⟦(a/b)*b + a%b == a⟧.`);
C(2, 4, 'Postfix in der Multiplikation', R`int x = 5;
int y = x++ * 2;
std::cout << x << y;`, { out: '610', ok: true },
  R`⟦x++⟧ liefert 5, also ⟦y = 10⟧; danach ⟦x = 6⟧. Ausgabe ohne Leerzeichen: ⟦6⟧ und ⟦10⟧ direkt hintereinander.`);
C(2, 3, 'Ternärer Operator und Komma', R`int a = 3, b = 4;
std::cout << (a > b ? a : b) << (a, b);`, { out: '44' },
  R`⟦c ? x : y⟧ liefert ⟦x⟧, wenn ⟦c⟧ wahr ist, sonst ⟦y⟧ – hier das Maximum 4. Der Komma-Operator liefert den rechten Wert 4.`);

/* ================= 3 Fundamentaltypen: int, unsigned, double, bool, char ================= */
K(3, 'Definition', 3, 'Wertebereiche von int und unsigned int', R`
<p>Bei $B$ Bits (typisch $B=32$):</p>
$$\texttt{int}: [-2^{B-1},\ 2^{B-1}-1],\qquad \texttt{unsigned int}: [0,\ 2^B-1]$$
<p>Für $B=32$: ⟦int⟧ bis ca. $2.1\cdot10^9$, ⟦unsigned⟧ bis ca. $4.3\cdot10^9$. Literal ⟦17u⟧ ist unsigned.</p>`);
K(3, 'Konzept', 5, 'Was passiert bei Überlauf von int bzw. unsigned int?', R`
<p><b>unsigned:</b> wohldefiniert, gerechnet wird <b>modulo $2^B$</b> (⟦0u - 1⟧ = $2^{32}-1$).</p>
<p><b>int:</b> Überlauf ist <b>undefiniertes Verhalten</b> – in der Praxis meist Umbruch ins Negative, aber garantiert ist nichts.</p>`);
K(3, 'Konzept', 2, 'Zweierkomplement: wie wird −x dargestellt?', R`
<p>Alle Bits von $x$ invertieren und 1 addieren: ⟦-x == ~x + 1⟧. Das höchste Bit ist das Vorzeichenbit.</p>
<p>Beispiel 8 Bit: $5 = 00000101$, $-5 = 11111011$. Addition funktioniert ohne Sonderfall wie bei unsigned.</p>`);
K(3, 'Regel', 3, 'De Morgan', R`
$$!(a\ \&\&\ b) \equiv\ !a\ ||\ !b,\qquad !(a\ ||\ b)\equiv\ !a\ \&\&\ !b$$
<p>Beispiel: ⟦!(x >= 0 && x < 10)⟧ ≡ ⟦x < 0 || x >= 10⟧.</p>`);
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
K(3, 'Konzept', 3, 'Wie viele Zahlen enthält F*(2, 3, −2, 2)? Welche ist die grösste?', R`
$$|F^*|=2\cdot(2-1)\cdot2^{2}\cdot(2-(-2)+1)=2\cdot1\cdot4\cdot5=40$$
<p>Grösste Zahl: $1.11_2\cdot2^2=111_2=7$. Kleinste positive: $1.00_2\cdot2^{-2}=0.25$.</p>`);
K(3, 'Konzept', 3, 'Wie gibt std::cout double-Werte aus?', R`
<p>Standardmässig mit <b>höchstens 6 signifikanten Stellen</b>, ohne überflüssige Nullen und ohne Punkt bei ganzen Zahlen:</p>
<p>⟦2.0⟧ → ⟦2⟧, ⟦2.50⟧ → ⟦2.5⟧, ⟦1.0/3⟧ → ⟦0.333333⟧, ⟦1e20⟧ → ⟦1e+20⟧.</p>
<p>⟦bool⟧ wird als ⟦0⟧/⟦1⟧ ausgegeben, ⟦char⟧ als Zeichen. An der Prüfung genau so hinschreiben.</p>`);
K(3, 'Konzept', 3, 'Literale: was bedeuten 010, 1u, 1.0f, 1e3, \'a\'?', R`
<ul><li>⟦010⟧: führende 0 → <b>oktal</b> (= 8). ⟦09⟧ ist ein Kompilierfehler.</li>
<li>⟦0x1F⟧: hexadezimal (= 31).</li>
<li>⟦1u⟧: ⟦unsigned int⟧. ⟦1.0f⟧: ⟦float⟧. ⟦1.0⟧, ⟦1e3⟧: ⟦double⟧.</li>
<li>⟦'a'⟧: ⟦char⟧ (Zahl 97). ⟦"a"⟧: String-Literal.</li></ul>`);
K(3, 'Konzept', 3, 'Wann wandelt C++ still um, wann nicht?', R`
<ul><li><b>Still (implizit):</b> ⟦int⟧ ↔ ⟦double⟧, ⟦bool⟧, ⟦char⟧ … – ⟦double⟧ → ⟦int⟧ schneidet gegen 0 ab. Ebenso bei Funktionsargumenten und Rückgabewerten.</li>
<li><b>Gemischte Ausdrücke:</b> ⟦int⟧ mit ⟦double⟧ → ⟦double⟧; ⟦int⟧ mit ⟦unsigned⟧ → ⟦unsigned⟧; ⟦char⟧/⟦bool⟧ werden zu ⟦int⟧.</li>
<li><b>Nicht erlaubt:</b> Narrowing bei ⟦{}⟧-Initialisierung, Text → Zahl, Zahl → Zeiger (ausser 0).</li></ul>`);
K(3, 'Code', 4, 'Was passiert? – unsigned minus eins', R`
<p><b>Ausgabe:</b> ⟦4294967295 1⟧</p>
<p>unsigned rechnet modulo $2^{32}$: ⟦0 - 1⟧ ergibt den grössten Wert $2^{32}-1$. Kein Fehler, wohldefiniert.</p>`, {
  q: R`unsigned int u = 0;
u = u - 1;
std::cout << u << " " << (u + 2 == 1);`, out: '4294967295 1' });
K(3, 'Code', 4, 'Was passiert? – Vergleich int mit unsigned', R`
<p><b>Ausgabe:</b> ⟦0⟧ (also «falsch»)</p>
<p>Bei gemischten Operanden wird ⟦int⟧ nach ⟦unsigned int⟧ konvertiert: ⟦-1⟧ wird zu $2^{32}-1$, und das ist nicht kleiner als 1. Der Compiler warnt höchstens.</p>`, {
  q: R`int a = -1;
unsigned int b = 1;
std::cout << (a < b);`, out: '0' });
K(3, 'Code', 3, 'Was passiert? – char als Zahl', R`
<p><b>Ausgabe:</b> ⟦c 99⟧</p>
<p>⟦'a' + 2⟧ ist ein ⟦int⟧ (99, ASCII). In ⟦c⟧ gespeichert wird es als Zeichen ausgegeben, direkt ausgegeben als Zahl.</p>`, {
  q: R`char c = 'a' + 2;
std::cout << c << " " << 'a' + 2;`, out: 'c 99' });
K(3, 'Code', 4, 'Was passiert? – grosse int-Multiplikation', R`
<p><b>Undefiniertes Verhalten</b> (int-Überlauf).</p>
<p>$100\,000\cdot100\,000=10^{10}$ passt nicht in einen 32-Bit-⟦int⟧ (max. ca. $2.1\cdot10^9$). Dass das Ergebnis in ⟦long⟧ gespeichert wird, hilft nicht: gerechnet wird in ⟦int⟧, weil beide Operanden ⟦int⟧ sind. Abhilfe: ⟦long a = 100000;⟧</p>`, {
  q: R`int a = 100000;
long b = a * a;
std::cout << b;`, err: 'ub' });
K(3, 'Code', 5, 'Was passiert? – if mit Zuweisung', R`
<p><b>Ausgabe:</b> ⟦nicht null 0⟧ – <b>logischer Fehler</b>, kein Kompilierfehler.</p>
<p>⟦a = 0⟧ ist eine <b>Zuweisung</b> (nicht ⟦==⟧): ⟦a⟧ wird 0, der Ausdruck hat den Wert 0 → falsch → else-Zweig, und ⟦a⟧ ist jetzt 0.</p>`, {
  q: R`int a = 3;
if (a = 0)
    std::cout << "null";
else
    std::cout << "nicht null " << a;`, err: 'logic', out: 'nicht null 0' });
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
C(3, 4, 'Grösster int plus eins', R`int x = 2147483647;   // grösster int
x = x + 1;
std::cout << x;`, { err: 'ub' },
  R`int-Überlauf. In der Praxis meist ⟦-2147483648⟧, aber der Compiler darf annehmen, dass das nie passiert, und z. B. Schleifen entsprechend «optimieren».`);
C(3, 3, '15 hoch 8', R`int a = 15;
a = a * a;   // 15^2
a = a * a;   // 15^4
a = a * a;   // 15^8
std::cout << a;`, { err: 'ub' },
  R`$15^8=2\,562\,890\,625>2^{31}-1$ → Überlauf. Typische Ausgabe: eine <b>negative</b> Zahl, obwohl nur positive multipliziert wurden.`);
C(3, 4, 'Drei minus fünf unsigned', R`unsigned int a = 3, b = 5;
std::cout << a - b;`, { out: '4294967294', lf: true },
  R`$3-5=-2$ ist in ⟦unsigned⟧ nicht darstellbar: modulo $2^{32}$ ergibt $2^{32}-2$. Kein UB.`);
C(3, 3, 'Wurzel aus −1', R`double n = std::sqrt(-1.0);
std::cout << (n == n) << " " << (n != n);`, { out: '0 1' },
  R`NaN («Not a Number») ist mit nichts gleich, nicht einmal mit sich selbst. Jeder Vergleich mit NaN ausser ⟦!=⟧ ist falsch. Kein Absturz!`);
C(3, 4, 'double ausgeben', R`double a = 2.0;
double b = 2.50;
double c = 1.0 / 3;
std::cout << a << " " << b << " " << c;`, { out: '2 2.5 0.333333', ok: true },
  R`⟦std::cout⟧ gibt höchstens 6 signifikante Stellen aus und lässt überflüssige Nullen (und den Punkt) weg.`);
C(3, 4, 'bool aus Zahlen', R`bool a = 5;
bool b = 0.1;
std::cout << a << b << (3 > 2) << (2 > 3) << true;`, { out: '11101', ok: true },
  R`Jede Zahl ≠ 0 wird zu ⟦true⟧ (auch ⟦0.1⟧). ⟦std::cout⟧ gibt ⟦true⟧ als ⟦1⟧ und ⟦false⟧ als ⟦0⟧ aus, nicht als Wort.`);
C(3, 3, 'Verneinung umformen', R`bool a = true, b = false;
std::cout << !(a && b) << (!a && !b);`, { out: '10', lf: true },
  R`De Morgan: $\lnot(a\land b)=\lnot a\lor\lnot b$, <b>nicht</b> $\lnot a\land\lnot b$.`);
C(3, 3, 'Nicht x gleich fünf', R`int x = 5;
std::cout << (!x == 5) << (!(x == 5));`, { out: '00' },
  R`⟦!⟧ bindet am stärksten: ⟦!x == 5⟧ ist ⟦(!x) == 5⟧ = ⟦0 == 5⟧ = falsch. Und ⟦!(5 == 5)⟧ ist ebenfalls falsch.`);
C(3, 4, 'Buchstabe plus eins', R`char c = 'a';
std::cout << c + 1 << " " << char(c + 1);`, { out: '98 b' },
  R`In arithmetischen Ausdrücken wird ⟦char⟧ zu ⟦int⟧ (⟦'a'⟧ = 97). Erst die Umwandlung ⟦char(…)⟧ macht wieder ein Zeichen daraus.`);
C(3, 3, 'Zahl mit führender Null', R`int x = 010;
std::cout << x;`, { out: '8', lf: true },
  R`Ein Literal mit führender 0 ist <b>oktal</b> (Basis 8): $10_8=8$.`);
C(3, 2, 'Neun mit führender Null', R`int x = 09;
std::cout << x;`, { err: 'compile' },
  R`Oktal kennt nur die Ziffern 0–7: «invalid digit 9 in octal constant».`);
C(3, 4, 'Umwandlung nach int', R`std::cout << int(2.99) << " " << int(-2.99)
          << " " << int(2.5 + 0.5);`, { out: '2 -2 3', ok: true },
  R`Umwandlung nach ⟦int⟧ schneidet gegen 0 ab, rundet nicht. Runden (für positive Zahlen): ⟦int(x + 0.5)⟧.`);
C(3, 4, 'Viertelschritte bis 1', R`for (double d = 0; d != 1; d += 0.25)
    std::cout << d << " ";`, { out: '0 0.25 0.5 0.75 ', show: '0 0.25 0.5 0.75', ok: true },
  R`Falle in die andere Richtung: $0.25=2^{-2}$ ist binär <b>exakt</b> darstellbar, die Summen auch. Die Schleife terminiert. (Mit 0.1 wäre sie endlos.)`);
C(3, 5, 'Zehntelschritte zählen', R`int n = 0;
for (double d = 0; d < 1; d += 0.1)
    ++n;
std::cout << n;`, { out: '11', lf: true },
  R`0.1 ist nicht exakt darstellbar. Nach 10 Additionen ist ⟦d = 0.9999999999999999 < 1⟧, also gibt es einen 11. Durchlauf.`);
C(3, 3, 'Grösster int in unsigned', R`int x = 2147483647;
unsigned int u = x;
u = u + 1;
std::cout << u;`, { out: '2147483648', ok: true },
  R`unsigned-Arithmetik ist definiert, und $2^{31}$ passt in ⟦unsigned int⟧ (bis $2^{32}-1$).`);
C(3, 3, 'Grösster int plus 1u', R`int x = 2147483647;
std::cout << x + 1u;`, { out: '2147483648', ok: true },
  R`⟦1u⟧ ist unsigned, also wird ⟦x⟧ in unsigned umgewandelt und unsigned gerechnet: kein Überlauf. (Mit ⟦x + 1⟧ wäre es UB!)`);
C(3, 3, 'float gegen double', R`bool b = (0.1f == 0.1);
std::cout << b;`, { out: '0', lf: true },
  R`⟦0.1f⟧ wird auf 24 Bit gerundet, ⟦0.1⟧ auf 53 Bit. Nach der Umwandlung in ⟦double⟧ sind die beiden verschieden.`);
C(3, 4, 'Sieben halbe mal zwei', R`double x = 7 / 2;
std::cout << x * 2;`, { out: '6', lf: true },
  R`⟦7 / 2⟧ ist Ganzzahldivision = 3; erst dann wird nach ⟦double⟧ umgewandelt. $3\cdot2=6$.`);

/* ================= 4 Kontrollstrukturen: if, Schleifen, switch ================= */
K(4, 'Konzept', 3, 'Wie schreibt man eine for-Schleife als while-Schleife?', R`
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
K(4, 'Rezept', 5, 'Terminiert die Schleife? Fünf Fragen', R`
<ol><li>Wird die Laufvariable <b>überhaupt verändert</b>? (⟦i + 1⟧ statt ⟦++i⟧? ⟦continue⟧ davor?)</li>
<li>In die <b>richtige Richtung</b>? (⟦++⟧ vs. ⟦--⟧)</li>
<li>Kann die Bedingung <b>übersprungen</b> werden? (⟦!=⟧ mit Schrittweite ≠ 1, ⟦double⟧)</li>
<li>Kann die Bedingung <b>überhaupt falsch</b> werden? (⟦unsigned >= 0⟧)</li>
<li>Gehört der Körper wirklich zur Schleife? (⟦;⟧ nach dem Kopf, fehlende ⟦{}⟧)</li></ol>`);
K(4, 'Regel', 4, 'Regeln für switch', R`
<ul><li>Nur <b>ganzzahlige</b> Typen (⟦int⟧, ⟦char⟧, ⟦bool⟧, Enums) – kein ⟦std::string⟧, kein ⟦double⟧.</li>
<li>⟦case⟧-Werte müssen <b>Konstanten</b> zur Kompilierzeit sein und dürfen sich nicht wiederholen.</li>
<li>Ein ⟦case⟧ ist nur eine Sprungmarke: ohne ⟦break⟧ läuft es in die folgenden Fälle weiter (<b>fall-through</b>).</li>
<li>Variablen mit Initialisierung in einem ⟦case⟧ brauchen einen eigenen Block ⟦{ … }⟧.</li></ul>`);
K(4, 'Konzept', 4, 'continue in for vs. in while', R`
<p><b>for:</b> ⟦continue⟧ springt zum Inkrement-Ausdruck (⟦++i⟧) und dann zur Bedingung – harmlos.</p>
<p><b>while:</b> ⟦continue⟧ springt direkt zur Bedingung. Steht das ⟦++i⟧ erst danach im Rumpf, wird es übersprungen → oft <b>Endlosschleife</b>.</p>`);
K(4, 'Code', 4, 'Was passiert? – for-Schleife mit Schritt 3', R`
<p><b>Ausgabe:</b> ⟦22⟧</p>
<p>⟦i⟧ durchläuft 1, 4, 7, 10 (13 ist zu gross): $1+4+7+10=22$.</p>`, {
  q: R`int s = 0;
for (int i = 1; i <= 10; i += 3)
    s += i;
std::cout << s;`, out: '22' });
K(4, 'Code', 5, 'Was passiert? – Countdown mit unsigned', R`
<p><b>Endlosschleife.</b></p>
<p>⟦i >= 0⟧ ist für ⟦unsigned⟧ <b>immer wahr</b>. Nach ⟦i = 0⟧ ergibt ⟦--i⟧ den Wert $2^{32}-1$ (modulo-Arithmetik) und es geht weiter. Abhilfe: ⟦int i⟧ oder ⟦for (unsigned i = 11; i-- > 0; )⟧.</p>`, {
  q: R`for (unsigned int i = 10; i >= 0; --i)
    std::cout << i << " ";`, err: 'loop' });
K(4, 'Code', 5, 'Was passiert? – while mit Strichpunkt', R`
<p><b>Endlosschleife</b> (es wird nichts ausgegeben).</p>
<p>Der Strichpunkt nach ⟦while (i < 5)⟧ ist eine <b>leere Anweisung</b> = der ganze Schleifenrumpf. ⟦i⟧ ändert sich nie; der Block danach wird nie erreicht.</p>`, {
  q: R`int i = 0;
while (i < 5);
{
    ++i;
}
std::cout << i;`, err: 'loop' });
K(4, 'Code', 5, 'Was passiert? – i nach der for-Schleife', R`
<p><b>Kompilierfehler.</b></p>
<p>⟦i⟧ ist im Kopf der for-Schleife deklariert; ihr <b>Gültigkeitsbereich</b> endet mit der Schleife. Danach ist ⟦i⟧ unbekannt.</p>`, {
  q: R`int s = 0;
for (int i = 0; i < 10; ++i)
    s += i;
std::cout << s << " " << i;`, err: 'compile' });
K(4, 'Code', 4, 'Was passiert? – break und continue', R`
<p><b>Ausgabe:</b> ⟦135⟧</p>
<p>Gerade ⟦i⟧ werden mit ⟦continue⟧ übersprungen; bei ⟦i = 7⟧ bricht ⟦break⟧ die Schleife ab, bevor ausgegeben wird.</p>`, {
  q: R`for (int i = 0; i < 10; ++i) {
    if (i % 2 == 0) continue;
    if (i > 6) break;
    std::cout << i;
}`, out: '135' });
K(4, 'Code', 3, 'Was passiert? – do-while mit falscher Bedingung', R`
<p><b>Ausgabe:</b> ⟦10⟧</p>
<p>Der Rumpf einer do-Schleife läuft <b>mindestens einmal</b>; die Bedingung wird erst danach geprüft.</p>`, {
  q: R`int i = 10;
do {
    std::cout << i;
    ++i;
} while (i < 5);`, out: '10' });
K(4, 'Code', 4, 'Was passiert? – verschachteltes if/else', R`
<p><b>Ausgabe:</b> ⟦negativ⟧ – logischer Fehler («dangling else»).</p>
<p>Ein ⟦else⟧ gehört immer zum <b>nächsten</b> ⟦if⟧ ohne else – hier zum inneren. Die Einrückung täuscht. Abhilfe: geschweifte Klammern.</p>`, {
  q: R`int x = 5;
if (x > 0)
    if (x > 10)
        std::cout << "gross";
else
    std::cout << "negativ";`, err: 'logic', out: 'negativ' });
K(4, 'Code', 3, 'Was passiert? – Variable im inneren Block', R`
<p><b>Ausgabe:</b> ⟦21⟧</p>
<p>Das innere ⟦i⟧ <b>verdeckt</b> (shadowing) das äussere nur innerhalb des Blocks. Danach ist wieder das äussere ⟦i = 1⟧ sichtbar.</p>`, {
  q: R`int i = 1;
{
    int i = 2;
    std::cout << i;
}
std::cout << i;`, out: '21' });
K(4, 'Code', 4, 'Was passiert? – Summe ohne Startwert', R`
<p><b>Undefiniertes Verhalten.</b></p>
<p>⟦s⟧ ist <b>nicht initialisiert</b>; ⟦s += i⟧ liest einen unbestimmten Wert. Kompiliert ohne Fehler, Ergebnis ist zufällig. Abhilfe: ⟦int s = 0;⟧</p>`, {
  q: R`int s;
for (int i = 1; i <= 3; ++i)
    s += i;
std::cout << s;`, err: 'ub' });
C(4, 5, 'Strichpunkt nach for, dann i ausgeben', R`for (int i = 0; i < 5; ++i);
    std::cout << i;`, { err: 'compile' },
  R`Der Schleifenkörper ist die leere Anweisung ⟦;⟧. Die (eingerückte!) Ausgabe gehört nicht mehr zur Schleife, und dort existiert ⟦i⟧ nicht mehr.`);
C(4, 5, 'Strichpunkt nach for, i aussen', R`int i;
for (i = 0; i < 5; ++i);
    std::cout << i;`, { out: '5', lf: true },
  R`Die Schleife läuft 5-mal leer, danach wird <b>einmal</b> ⟦i⟧ ausgegeben – und das ist 5. Sehr beliebte Prüfungsfalle!`);
C(4, 5, 'Strichpunkt nach if', R`int x = 3;
if (x > 10);
    std::cout << "gross";`, { out: 'gross', lf: true },
  R`Der if-Körper ist die leere Anweisung. Die Ausgabe wird <b>immer</b> ausgeführt.`);
C(4, 4, 'Strichpunkt nach if mit else', R`int x = 3;
if (x > 10);
    std::cout << "gross";
else
    std::cout << "klein";`, { err: 'compile' },
  R`Nach dem leeren if-Körper und der Ausgabe steht ein ⟦else⟧ ohne zugehöriges ⟦if⟧: «'else' without a previous 'if'».`);
C(4, 5, 'while ohne Klammern', R`int i = 0;
while (i < 3)
    std::cout << i;
    ++i;`, { err: 'loop' },
  R`Ohne ⟦{}⟧ gehört nur die <b>erste</b> Anweisung zur Schleife. ⟦++i⟧ wird nie erreicht: Ausgabe ⟦000000…⟧ ohne Ende.`);
C(4, 4, 'Ausgabe in der Schleife', R`int i = 0;
while (i < 3) {
    std::cout << i;
}`, { err: 'loop' },
  R`Das Inkrement fehlt: ⟦i⟧ bleibt 0, Ausgabe ⟦000…⟧ ohne Ende.`);
C(4, 5, 'Schritt i + 1', R`for (int i = 0; i < 3; i + 1)
    std::cout << i;`, { err: 'loop' },
  R`⟦i + 1⟧ berechnet einen Wert und wirft ihn weg; ⟦i⟧ ändert sich nie (Warnung «statement has no effect»).`);
C(4, 4, 'Bis 10 mit --i', R`for (int i = 0; i < 10; --i)
    std::cout << i << " ";`, { err: 'loop' },
  R`⟦0 -1 -2 -3 …⟧ – falsche Richtung, praktisch endlos. (Streng genommen erreicht ⟦i⟧ irgendwann $-2^{31}$ und ⟦--i⟧ ist dann ein Überlauf, also UB; erwartete Antwort: Endlosschleife.)`);
C(4, 5, 'Ungerade Zahlen bis 10', R`for (int i = 1; i != 10; i += 2)
    std::cout << i << " ";`, { err: 'loop' },
  R`⟦1 3 5 7 9 11 13 …⟧ – ⟦i⟧ ist immer ungerade und trifft 10 nie. Mit ⟦i < 10⟧ wäre alles gut.`);
C(4, 5, 'continue in while', R`int i = 0;
while (i < 5) {
    if (i == 2) continue;
    std::cout << i;
    ++i;
}`, { err: 'loop' },
  R`Ausgabe ⟦01⟧, dann endlos (ohne weitere Ausgabe): bei ⟦i == 2⟧ springt ⟦continue⟧ direkt zur Bedingung, ⟦++i⟧ wird nie mehr erreicht.`);
C(4, 4, 'continue in for', R`for (int i = 0; i < 5; ++i) {
    if (i == 2) continue;
    std::cout << i;
}`, { out: '0134', ok: true },
  R`Bei ⟦for⟧ springt ⟦continue⟧ zum Inkrement ⟦++i⟧ und dann zur Bedingung. Unterschied zu ⟦while⟧!`);
C(4, 3, 'Primzahltest mit n = 1', R`int n = 1;
int d;
for (d = 2; n % d != 0; ++d);
std::cout << (d == n);`, { err: 'loop' },
  R`Für $n=1$ gilt $1\bmod d=1$ für alle $d\ge2$ → die Bedingung bleibt wahr. Die Schleife ist nur für $n\ge2$ korrekt – Vorbedingung beachten!`);
C(4, 5, 'Durchläufe zählen', R`int count = 0;
for (int i = 0; i <= 5; ++i)
    ++count;
std::cout << count;`, { out: '6' },
  R`$\{0,\dots,5\}$ hat 6 Elemente. Faustregel: ⟦for (i = a; i < b; ++i)⟧ läuft $b-a$-mal, mit ⟦<=⟧ $b-a+1$-mal.`);
C(4, 3, 'Zwei Laufvariablen', R`int n = 0;
for (int i = 0, j = 10; i < 3, j > 0; ++i, --j)
    ++n;
std::cout << n;`, { out: '10', lf: true },
  R`In der Bedingung ist ⟦,⟧ der Komma-Operator: nur ⟦j > 0⟧ zählt! Gemeint war ⟦i < 3 && j > 0⟧ (dann 3).`);
C(4, 3, 'do-while ohne Strichpunkt', R`int i = 0;
do {
    ++i;
} while (i < 5)
std::cout << i;`, { err: 'compile' },
  R`Bei ⟦do … while (…);⟧ ist das Semikolon am Ende Pflicht.`);
C(4, 5, 'Verschachteltes if, äussere Bedingung falsch', R`int x = 5;
if (x > 10)
    if (x > 20)
        std::cout << "A";
else
    std::cout << "B";
std::cout << "|";`, { out: '|', lf: true },
  R`Das ⟦else⟧ gehört zum <b>inneren</b> ⟦if⟧ (Einrückung täuscht). Da ⟦x > 10⟧ falsch ist, passiert im ganzen if gar nichts; nur ⟦|⟧ wird ausgegeben.`);
C(4, 4, 'if ohne Klammern, zwei Zeilen', R`int x = 3;
if (x > 10)
    std::cout << "gross ";
    std::cout << "!";`, { out: '!', lf: true },
  R`Nur die erste Anweisung gehört zum ⟦if⟧. Das ⟦!⟧ wird immer ausgegeben.`);
C(4, 4, 'Variable aus dem Block', R`{
    int i = 2;
}
std::cout << i;`, { err: 'compile' },
  R`Sichtbarkeit nur von innen nach aussen: innen sieht man äussere Variablen, aber nicht umgekehrt.`);
C(4, 4, 'y im if und im else', R`int x = 3;
if (x > 0) {
    int y = 1;
} else {
    int y = -1;
}
std::cout << y;`, { err: 'compile' },
  R`Beide ⟦y⟧ existieren nur in ihrem Block. Richtig: ⟦int y;⟧ vor dem ⟦if⟧ deklarieren und in den Zweigen zuweisen.`);
C(4, 4, 'Gleicher Name aussen und in der Schleife', R`int i = 2;
for (int i = 0; i < 5; ++i)
    std::cout << i;
std::cout << i;`, { out: '012342', ok: true },
  R`Das innere ⟦i⟧ verdeckt das äussere, solange sein Gültigkeitsbereich dauert. Danach ist das äussere ⟦i⟧ (Wert 2) wieder sichtbar und unverändert.`);
C(4, 3, 'Zwei Schleifen mit i', R`for (int i = 0; i < 3; ++i)
    for (int i = 0; i < 2; ++i)
        std::cout << i;`, { out: '010101', ok: true },
  R`Kompiliert: die innere Schleife hat ihr eigenes ⟦i⟧. Die äussere läuft trotzdem genau 3-mal.`);
C(4, 3, 'i im Schleifenkörper neu', R`for (int i = 0; i < 3; ++i) {
    int i = 5;
    std::cout << i;
}`, { err: 'compile' },
  R`Spezialregel: die Variable aus dem for-Kopf und der äusserste Block des Körpers gelten als <b>derselbe</b> Gültigkeitsbereich → «redeclaration». In einem weiteren inneren Block wäre es erlaubt.`);
C(4, 4, 'break in der inneren Schleife', R`for (int i = 0; i < 3; ++i) {
    for (int j = 0; j < 3; ++j) {
        if (j == 1) break;
        std::cout << i << j << " ";
    }
}`, { out: '00 10 20 ', show: '00 10 20' },
  R`⟦break⟧ beendet nur die <b>innerste</b> Schleife (die j-Schleife); die i-Schleife läuft weiter.`);
C(4, 5, 'switch mit x = 2', R`int x = 2;
switch (x) {
    case 1: std::cout << "eins ";
    case 2: std::cout << "zwei ";
    case 3: std::cout << "drei ";
    default: std::cout << "sonst";
}`, { out: 'zwei drei sonst', lf: true },
  R`Ein ⟦case⟧ ist nur eine Sprungmarke. Ohne ⟦break⟧ läuft die Ausführung durch alle folgenden Fälle weiter (fall-through).`);
C(4, 3, 'switch über einen String', R`std::string s = "ja";
switch (s) {
    case "ja": std::cout << 1; break;
}`, { err: 'compile' },
  R`⟦switch⟧ funktioniert nur mit ganzzahligen Typen (⟦int⟧, ⟦char⟧, ⟦bool⟧, Enums).`);
C(4, 3, 'case mit Variable', R`int x = 1, y = 1;
switch (x) {
    case y: std::cout << "y"; break;
}`, { err: 'compile' },
  R`⟦case⟧-Werte müssen Konstanten zur Kompilierzeit sein.`);
C(4, 2, 'Zweimal case 1', R`int x = 1;
switch (x) {
    case 1: std::cout << "a"; break;
    case 1: std::cout << "b"; break;
}`, { err: 'compile' },
  R`Jeder ⟦case⟧-Wert darf nur einmal vorkommen: «duplicate case value».`);
C(4, 2, 'Variable in einem case', R`int x = 2;
switch (x) {
    case 1:
        int y = 5;
        std::cout << y;
        break;
    case 2:
        std::cout << "zwei";
        break;
}`, { err: 'compile' },
  R`Der Sprung zu ⟦case 2⟧ würde die Initialisierung von ⟦y⟧ überspringen, obwohl ⟦y⟧ dort noch im Gültigkeitsbereich wäre («jump to case label»). Lösung: ⟦case 1: { int y = 5; … }⟧.`);
C(4, 5, 'switch mit x += 1', R`int x = 1;
switch (x) {
    case 1: x += 1;
    case 2: x *= 3; break;
    case 3: x = 0;
}
std::cout << x;`, { out: '6', ok: true },
  R`Fall-through: ⟦case 1⟧ erhöht auf 2 und läuft ohne ⟦break⟧ in ⟦case 2⟧ weiter: $2\cdot3=6$, dann ⟦break⟧.`);
C(4, 4, 'Countdown mit unsigned n', R`unsigned int n = 3;
for (int i = n; i >= 0; --i)
    std::cout << i;`, { out: '3210', ok: true },
  R`Sieht aus wie die unsigned-Falle, aber die Laufvariable ⟦i⟧ ist ein ⟦int⟧. ⟦n⟧ wird nur zur Initialisierung verwendet.`);
C(4, 5, 'if mit x = 5', R`int x = 10;
if (x = 5)
    std::cout << x;
else
    std::cout << 0;`, { out: '5', lf: true },
  R`Zuweisung statt Vergleich: ⟦x⟧ wird 5, der Wert 5 ist ≠ 0, also wahr. Ausgegeben wird der <b>neue</b> Wert.`);
C(4, 4, 'do-while mit i++ in der Bedingung', R`int i = 0;
do
    std::cout << i;
while (i++ < 3);`, { out: '0123' },
  R`Ausgabe 0, Test ⟦0 < 3⟧ (danach ⟦i = 1⟧), Ausgabe 1, … , Ausgabe 3, Test ⟦3 < 3⟧ falsch (⟦i = 4⟧).`);
C(4, 4, 'Dreieck zählen', R`int n = 0;
for (int i = 0; i < 10; ++i)
    for (int j = i; j < 10; ++j)
        ++n;
std::cout << n;`, { out: '55' },
  R`Für ⟦i = 0⟧ zählt die innere Schleife 10, für ⟦i = 1⟧ 9, … : $10+9+\dots+1=55$.`);
C(4, 3, 'while (i --> 0)', R`int i = 5;
while (i --> 0)
    std::cout << i;`, { out: '43210', ok: true },
  R`Es gibt keinen «Geht-gegen»-Operator: ⟦i --> 0⟧ ist ⟦(i--) > 0⟧. Verglichen wird mit dem alten Wert, ausgegeben der neue.`);
C(4, 4, 'Dreierschritte bis 10', R`int i = 0;
while (i != 10)
    i += 3;
std::cout << i;`, { err: 'ub' },
  R`$0,3,6,9,12,\dots$ – ⟦i⟧ wird nie 10, also «endlos». Aber ⟦i⟧ wächst bis $2^{31}-1$ und läuft dann über → UB. Mit ⟦-O0⟧ trifft ⟦i⟧ nach dem Umbruch irgendwann 10, mit ⟦-O2⟧ wird sofort 10 ausgegeben. An der Prüfung: «Endlosschleife bzw. UB durch int-Überlauf» mit Begründung.`);

/* ================= 5 Funktionen ================= */
K(5, 'Definition', 4, 'Vor- und Nachbedingung, assert', R`
<p><b>Vorbedingung (PRE):</b> was beim Aufruf gelten muss. <b>Nachbedingung (POST):</b> was nach dem Aufruf gilt (Rückgabewert, Effekte).</p>
⟪// PRE:  e >= 0 || b != 0.0
// POST: return value is b^e
double pow(double b, int e);⟫
<p>⟦assert(bedingung);⟧ (aus ⟦<cassert>⟧) bricht das Programm ab, wenn die Bedingung falsch ist – zum Prüfen von Vorbedingungen.</p>`);
K(5, 'Konzept', 3, 'Deklaration vs. Definition einer Funktion', R`
<p><b>Deklaration:</b> nur Signatur, ⟦int f(int x);⟧ – macht den Namen ab dieser Stelle bekannt.</p>
<p><b>Definition:</b> Signatur + Rumpf. Eine Funktion muss <b>vor ihrer ersten Verwendung</b> deklariert sein, sonst Kompilierfehler. Bei gegenseitiger Rekursion braucht es eine Vorwärtsdeklaration.</p>`);
K(5, 'Regel', 4, 'Überladungsauflösung', R`
<ol><li><b>Exakte Übereinstimmung</b> gewinnt.</li>
<li>Sonst <b>Promotion</b>: ⟦char⟧/⟦bool⟧ → ⟦int⟧, ⟦float⟧ → ⟦double⟧.</li>
<li>Sonst andere <b>Konversion</b> (⟦int⟧ → ⟦double⟧, ⟦int⟧ → ⟦long⟧ …). Sind zwei gleich gut → <b>mehrdeutig</b> = Kompilierfehler.</li></ol>
<p>Überladungen müssen sich in den <b>Parametern</b> unterscheiden; der Rückgabetyp allein genügt nicht.</p>`);
K(5, 'Konzept', 4, 'Was tut assert, und welche Kategorie ist ein fehlgeschlagenes assert?', R`
<p>⟦assert(b)⟧ prüft ⟦b⟧ zur <b>Laufzeit</b>. Ist ⟦b⟧ wahr, passiert nichts. Ist ⟦b⟧ falsch, bricht das Programm kontrolliert ab («Assertion … failed», SIGABRT, Exit-Code ⟦-6⟧).</p>
<p>Kategorie: <b>Laufzeitfehler (LZ)</b> – definiertes Verhalten, im Gegensatz zu UB. Typisch zum Prüfen von Vorbedingungen.</p>`);
K(5, 'Code', 4, 'Was passiert? – Aufruf vor der Definition', R`
<p><b>Kompilierfehler.</b></p>
<p>Beim Aufruf in ⟦main⟧ ist ⟦square⟧ noch nicht deklariert (C++ liest von oben nach unten). Abhilfe: Definition nach oben oder ⟦int square(int x);⟧ vor ⟦main⟧.</p>`, {
  q: R`int main() {
    std::cout << square(4);
}

int square(int x) {
    return x * x;
}`, err: 'compile' });
K(5, 'Code', 4, 'Was passiert? – Funktion ohne return im else-Fall', R`
<p><b>Undefiniertes Verhalten</b> (kompiliert, höchstens mit Warnung).</p>
<p>Für ⟦x <= 0⟧ endet die Funktion ohne ⟦return⟧, obwohl sie ⟦int⟧ zurückgeben muss. Der verwendete Wert ist unbestimmt.</p>`, {
  q: R`int sign(int x) {
    if (x > 0) return 1;
}

int main() {
    std::cout << sign(-3);
}`, err: 'ub' });
K(5, 'Code', 5, 'Was passiert? – Parameter in der Funktion ändern', R`
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
K(5, 'Code', 2, 'Was passiert? – überladene Funktionen', R`
<p><b>Ausgabe:</b> ⟦int double int⟧</p>
<p>Gewählt wird die am besten passende Überladung. ⟦'a'⟧ ist ⟦char⟧ – die Promotion zu ⟦int⟧ ist besser als die Konversion zu ⟦double⟧.</p>`, {
  q: R`void p(int)    { std::cout << "int "; }
void p(double) { std::cout << "double "; }

int main() {
    p(1);
    p(1.0);
    p('a');
}`, out: 'int double int ' });
C(5, 3, 'Nur deklariert', R`int square(int x);

int main() {
    std::cout << square(3);
}`, { err: 'compile' },
  R`Der Compiler ist zufrieden (die Deklaration genügt ihm), aber der <b>Linker</b> findet keine Definition: «undefined reference to square(int)». Zählt an der Prüfung als «kompiliert nicht».`);
C(5, 3, 'Ein Argument zu wenig', R`int add(int a, int b) { return a + b; }

int main() {
    std::cout << add(1);
}`, { err: 'compile' },
  R`Anzahl (und Typen) der Argumente müssen zur Signatur passen: «too few arguments to function».`);
C(5, 3, 'Funktion in main', R`int main() {
    int square(int x) {
        return x * x;
    }
    std::cout << square(3);
}`, { err: 'compile' },
  R`In C++ dürfen Funktionen nicht verschachtelt definiert werden.`);
C(5, 2, 'Funktion ohne Rückgabetyp', R`square(int x) {
    return x * x;
}
int main() { std::cout << square(2); }`, { err: 'compile' },
  R`Jede Funktion braucht einen Rückgabetyp (⟦int⟧, ⟦void⟧ …): «ISO C++ forbids declaration of square with no type».`);
C(5, 3, 'Parameter x und lokales x', R`int f(int x) {
    int x = 3;
    return x;
}
int main() { std::cout << f(1); }`, { err: 'compile' },
  R`Die Parameter gehören zum äussersten Block des Funktionskörpers – dort ist eine zweite Deklaration von ⟦x⟧ verboten.`);
C(5, 4, 'Funktion ohne Klammern', R`int answer() { return 42; }

int main() {
    std::cout << answer;
}`, { out: '1', lf: true },
  R`Ohne ⟦()⟧ wird die Funktion nicht aufgerufen. Ihre Adresse wird in ⟦bool⟧ umgewandelt (⟦true⟧) und als ⟦1⟧ ausgegeben. Nur eine Warnung!`);
C(5, 3, 'Wert einer void-Funktion', R`void hello() { std::cout << "hi"; }

int main() {
    int x = hello();
}`, { err: 'compile' },
  R`Eine ⟦void⟧-Funktion liefert keinen Wert: «void value not ignored as it ought to be».`);
C(5, 3, 'return 5 in void', R`void f() {
    return 5;
}
int main() { f(); }`, { err: 'compile' },
  R`«return-statement with a value, in function returning void». In ⟦void⟧-Funktionen nur ⟦return;⟧.`);
C(5, 4, 'Hälfte als int', R`int half(int x) {
    return x / 2.0;
}

int main() {
    std::cout << half(5);
}`, { out: '2', lf: true },
  R`⟦5 / 2.0 = 2.5⟧ ist ein ⟦double⟧, wird aber in den Rückgabetyp ⟦int⟧ umgewandelt (abgeschnitten).`);
C(5, 4, 'Argument 3.99', R`void print(int x) { std::cout << x; }

int main() {
    print(3.99);
}`, { out: '3', lf: true },
  R`Das Argument wird still in den Parametertyp ⟦int⟧ umgewandelt (abgeschnitten).`);
C(5, 3, 'Ausgabe nach return', R`int f(int x) {
    return x;
    std::cout << "nie";
}

int main() {
    std::cout << f(7);
}`, { out: '7' },
  R`⟦return⟧ verlässt die Funktion sofort; die Zeile danach wird nie ausgeführt.`);
C(5, 5, 'swap ohne &', R`void swap(int a, int b) {
    int t = a;
    a = b;
    b = t;
}

int main() {
    int x = 1, y = 2;
    swap(x, y);
    std::cout << x << y;
}`, { out: '12', lf: true },
  R`Pass by Value: die Funktion vertauscht Kopien. Lösung: ⟦void swap(int& a, int& b)⟧.`);
C(5, 4, 'const-Parameter erhöhen', R`int f(const int x) {
    x = x + 1;
    return x;
}
int main() { std::cout << f(1); }`, { err: 'compile' },
  R`«assignment of read-only parameter x».`);
C(5, 3, 'f(1) mit long und double', R`void f(long x)   { std::cout << "long"; }
void f(double x) { std::cout << "double"; }

int main() {
    f(1);
}`, { err: 'compile' },
  R`Für das ⟦int⟧-Argument sind ⟦int → long⟧ und ⟦int → double⟧ <b>gleich gute</b> Konversionen; der Compiler kann nicht wählen: «ambiguous».`);
C(5, 3, 'Zwei get mit anderem Rückgabetyp', R`int get()    { return 1; }
double get() { return 1.0; }
int main() {}`, { err: 'compile' },
  R`Überladungen müssen sich in den Parametern unterscheiden; der Rückgabetyp allein genügt nicht.`);
C(5, 5, 'power mit negativem Exponenten', R`// PRE: e >= 0
double power(double b, int e) {
    assert(e >= 0);
    double r = 1;
    for (int i = 0; i < e; ++i) r *= b;
    return r;
}

int main() {
    std::cout << power(2, -1);
}`, { err: 'lz' },
  R`«Assertion e >= 0 failed», Exit-Code ⟦-6⟧. ⟦assert⟧ prüft zur Laufzeit und bricht kontrolliert ab. Ohne ⟦assert⟧ käme hier einfach ⟦1⟧ heraus.`);
C(5, 3, 'assert mit x = 5', R`int x = 5;
assert(x > 0);
std::cout << x;`, { out: '5', ok: true },
  R`Ist die Bedingung wahr, tut ⟦assert⟧ gar nichts.`);
C(5, 4, 'teilen mit assert', R`int teile(int a, int b) {
    assert(b != 0);
    return a / b;
}

int main() {
    std::cout << teile(6, 3) << teile(1, 0);
}`, { err: 'lz' },
  R`⟦teile(1, 0)⟧ verletzt die Assertion → kontrollierter Abbruch (SIGABRT, ⟦-6⟧). Die Division durch 0 wird nie ausgeführt, darum <b>kein</b> UB.`);

/* ================= 6 Vektoren ================= */
K(6, 'Definition', 4, 'std::vector: Erzeugen und Zugreifen', R`
⟪std::vector<int> v(n, 0);    // n Elemente, alle 0
std::vector<int> w = {1, 2}; // Initialisierungsliste
v.push_back(7);              // hinten anhängen
v.size();                    // Anzahl (Typ unsigned!)⟫
<p>⟦v[i]⟧: <b>keine</b> Prüfung der Grenzen (Fehler = undefiniertes Verhalten). ⟦v.at(i)⟧: mit Prüfung (wirft eine Ausnahme). Gültige Indizes: $0\dots n-1$.</p>`);
K(6, 'Konzept', 2, 'Wie legt man eine n×m-Matrix mit Vektoren an?', R`
⟪std::vector<std::vector<int>> m(n, std::vector<int>(m_, 0));
m[i][j] = 1;   // Zeile i, Spalte j⟫
<p>Ein Vektor von <b>Zeilen</b>; jede Zeile ist ein eigener Vektor. Anzahl Zeilen ⟦m.size()⟧, Spalten ⟦m[0].size()⟧.</p>`);
K(6, 'Regel', 5, 'v[i] vs. v.at(i) – und warum size() gefährlich ist', R`
<ul><li>⟦v[i]⟧ prüft <b>nichts</b>: ⟦i⟧ ausserhalb von $[0,\ \texttt{v.size()})$ → <b>UB</b>.</li>
<li>⟦v.at(i)⟧ prüft und wirft ⟦std::out_of_range⟧ → <b>LZ</b> (Abbruch, ⟦-6⟧).</li>
<li>⟦v.size()⟧ ist ⟦size_t⟧, also <b>unsigned</b>: ⟦v.size() - 1⟧ bei leerem Vektor ist riesig, ⟦… >= 0⟧ ist immer wahr.</li>
<li>Sicher rückwärts: ⟦for (int i = int(v.size()) - 1; i >= 0; --i)⟧</li></ul>`);
K(6, 'Konzept', 4, 'std::vector: runde vs. geschweifte Klammern', R`
⟪std::vector<int> a(10);    // 10 Elemente, alle 0
std::vector<int> b{10};    // 1 Element: 10
std::vector<int> c(3, 5);  // 3 Elemente: 5 5 5
std::vector<int> d{3, 5};  // 2 Elemente: 3 5⟫
<p>⟦()⟧ ruft den Konstruktor (Grösse, Wert) auf, ⟦{}⟧ ist die <b>Liste der Elemente</b>.</p>`);
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
K(6, 'Code', 3, 'Was passiert? – Schleife rückwärts über v.size()', R`
<p><b>Ausgabe:</b> ⟦0⟧ – die Schleife läuft gar nicht.</p>
<p>⟦v.size()⟧ ist unsigned, also ist auch ⟦v.size() - 3⟧ unsigned: $2-3$ ergibt nicht $-1$, sondern $2^{64}-1$. Damit ist ⟦i < v.size()⟧ sofort falsch. Merke: bei ⟦size()⟧ nie unbedacht subtrahieren.</p>`, {
  q: R`std::vector<int> v = {5, 6};
int s = 0;
for (unsigned long i = v.size() - 3;
     i < v.size(); ++i)
    s += v[i];
std::cout << s;`, out: '0' });
C(6, 4, 'at(10) bei Grösse 10', R`std::vector<int> v = std::vector<int>(10);
std::cout << v.at(10);`, { err: 'lz' },
  R`⟦.at()⟧ prüft die Grenze und wirft ⟦std::out_of_range⟧ → Abbruch, Exit-Code ⟦-6⟧. Definiertes Verhalten, im Gegensatz zu ⟦v[10]⟧.`);
C(6, 3, 'Index i − 1', R`std::vector<int> v = {1, 2, 3};
int i = 0;
std::cout << v[i - 1];`, { err: 'ub' },
  R`Index ⟦-1⟧ wird in ⟦size_t⟧ umgewandelt (riesige Zahl) – weit ausserhalb des Vektors.`);
C(6, 4, 'Matrix 2×3 füllen', R`// 2 Zeilen, 3 Spalten
std::vector<std::vector<int>> m(
    2, std::vector<int>(3, 0));
for (int i = 0; i < 3; ++i)
    for (int j = 0; j < 2; ++j)
        m[i][j] = 1;`, { err: 'ub' },
  R`Zeilen und Spalten vertauscht: ⟦m[2]⟧ gibt es nicht (nur Zeilen 0 und 1). ⟦m.size()⟧ = Anzahl Zeilen, ⟦m[0].size()⟧ = Anzahl Spalten – am besten immer diese Ausdrücke statt Zahlen verwenden.`);
C(6, 5, 'a.size() − x − 1 >= 0', R`std::vector<int> a = {1, 2, 3};
for (int x = 0; a.size() - x - 1 >= 0; ++x)
    std::cout << x;`, { err: 'loop' },
  R`⟦a.size() - x - 1⟧ ist unsigned und damit immer ≥ 0. Ausgabe ⟦0123456…⟧ ohne Ende.`);
C(6, 5, 'Rückwärts mit size_t', R`std::vector<int> v = {1, 2, 3};
for (std::size_t i = v.size() - 1; i >= 0; --i)
    std::cout << v[i];`, { err: 'ub' },
  R`Ausgabe ⟦321⟧, dann wird ⟦i⟧ von 0 auf $2^{64}-1$ dekrementiert und ⟦v[18446744073709551615]⟧ gelesen → UB (nicht «nur» endlos, weil auf den Vektor zugegriffen wird). Praktisch Müll und dann Segmentation Fault.`);
C(6, 5, 'Nachbarn im leeren Vektor', R`std::vector<int> v;   // leer!
for (int i = 0; i < v.size() - 1; ++i)
    std::cout << v[i] << v[i + 1];`, { err: 'ub' },
  R`⟦v.size() - 1⟧ = $0-1$ = $2^{64}-1$ (unsigned!). ⟦0 < riesig⟧ ist wahr → ⟦v[0]⟧ auf leerem Vektor. Richtig: ⟦i + 1 < int(v.size())⟧.`);
C(6, 3, 'int mit size() vergleichen', R`std::vector<int> v = {4, 5, 6};
for (int i = 0; i < v.size(); ++i)
    std::cout << v[i];`, { out: '456', ok: true },
  R`Nur eine Warnung («comparison of integer expressions of different signedness»). Solange ⟦i⟧ nicht negativ ist, ist alles korrekt.`);
C(6, 5, 'Vier Vektoren, vier Grössen', R`std::vector<int> a(10);
std::vector<int> b{10};
std::vector<int> c(3, 5);
std::vector<int> d{3, 5};
std::cout << a.size() << " " << b.size() << " "
          << c.size() << " " << d.size();`, { out: '10 1 3 2' },
  R`⟦()⟧ = (Grösse, Wert), ⟦{}⟧ = Liste der Elemente: ⟦b⟧ enthält nur die 10, ⟦d⟧ die beiden Zahlen 3 und 5.`);
C(6, 3, 'vector<double> in vector<int>', R`std::vector<double> d = {1.5, 2.5};
std::vector<int> v = d;`, { err: 'compile' },
  R`⟦vector<int>⟧ und ⟦vector<double>⟧ sind völlig verschiedene Typen – anders als ⟦int⟧ und ⟦double⟧ gibt es keine Umwandlung.`);
C(6, 4, 'Vektor ausgeben', R`std::vector<int> v = {1, 2, 3};
std::cout << v;`, { err: 'compile' },
  R`Für ⟦std::vector⟧ ist kein ⟦<<⟧ definiert. Elemente in einer Schleife ausgeben (oder ⟦operator<<⟧ selbst überladen).`);
C(6, 3, 'Matrix m(3, 4)', R`std::vector<std::vector<int>> m(3, 4);`, { err: 'compile' },
  R`Der zweite Parameter muss ein ⟦std::vector<int>⟧ sein (der Wert jeder Zeile), keine Zahl: ⟦m(3, std::vector<int>(4))⟧.`);
C(6, 5, 'Vektor in Funktion füllen', R`void fill(std::vector<int> v) {
    for (int i = 0; i < int(v.size()); ++i)
        v[i] = 7;
}

int main() {
    std::vector<int> v(3, 0);
    fill(v);
    std::cout << v[0] << v[1] << v[2];
}`, { out: '000', lf: true },
  R`Auch Vektoren werden by Value <b>komplett kopiert</b>. Lösung: ⟦void fill(std::vector<int>& v)⟧.`);
C(6, 4, 'const-Vektor an average', R`double average(std::vector<double>& v) {
    double s = 0;
    for (double x : v) s += x;
    return s / v.size();
}

int main() {
    const std::vector<double> t = {0.9, 1.3, 5.1};
    std::cout << average(t);
}`, { err: 'compile' },
  R`Der Compiler muss annehmen, dass ⟦average⟧ den Vektor ändert («discards qualifiers»). Lösung: Parameter ⟦const std::vector<double>& v⟧.`);
C(6, 4, 'push_back in Range-for', R`std::vector<int> v = {1, 2, 3};
for (int x : v)
    v.push_back(x);`, { err: 'ub' },
  R`⟦push_back⟧ kann den Speicher neu anlegen; die Range-for-Schleife benutzt intern Iteratoren auf den <b>alten</b> Speicher.`);
C(6, 3, 'push_back mit fester Grenze', R`std::vector<int> v = {1, 2, 3};
int n = v.size();
for (int i = 0; i < n; ++i)
    v.push_back(v[i]);
std::cout << v.size();`, { out: '6', ok: true },
  R`Mit Indizes ist das unproblematisch: ⟦v[i]⟧ wird nach jeder Reallokation neu berechnet. (Mit ⟦i < v.size()⟧ wäre es eine Endlosschleife!)`);
C(6, 4, 'Rückwärts summieren mit int', R`std::vector<int> v = {1, 2, 3};
int s = 0;
for (int i = v.size() - 1; i >= 0; --i)
    s += v[i];
std::cout << s;`, { out: '6', ok: true },
  R`⟦v.size() - 1⟧ ist ⟦size_t⟧ mit Wert 2 und wird in ⟦int⟧ umgewandelt. Danach ist alles ⟦int⟧, ⟦i >= 0⟧ wird irgendwann falsch.`);
C(6, 4, 'Vektor in Funktion erweitern', R`void add(std::vector<int> v) { v.push_back(1); }

int main() {
    std::vector<int> a;
    add(a);
    std::cout << a.size();
}`, { out: '0', lf: true },
  R`Pass by Value: ⟦add⟧ verändert eine Kopie.`);
C(6, 4, 'v{3} und v[2]', R`std::vector<int> v{3};
std::cout << v[2];`, { err: 'ub' },
  R`⟦v{3}⟧ ist ein Vektor mit <b>einem</b> Element (der 3). ⟦v[2]⟧ liegt ausserhalb.`);

/* ================= 7 Referenzen und const ================= */
K(7, 'Definition', 5, 'Referenztyp T&', R`
<p>Eine Referenz ist ein <b>Alias</b> (anderer Name) für ein bestehendes Objekt: ⟦int& r = a;⟧</p>
<ul><li>muss bei der Deklaration <b>initialisiert</b> werden – mit einem L-Wert,</li>
<li>kann danach <b>nicht umgebunden</b> werden (⟦r = b;⟧ weist den Wert von ⟦b⟧ an ⟦a⟧ zu),</li>
<li>Übergabe per Referenz: die Funktion arbeitet auf dem Original.</li></ul>`);
K(7, 'Konzept', 4, 'Wozu const-Referenzen als Parameter (const T&)?', R`
<ul><li><b>Keine Kopie</b> – wichtig bei grossen Objekten (⟦std::vector⟧, ⟦std::string⟧).</li>
<li>Die Funktion <b>darf das Objekt nicht ändern</b> (sonst Kompilierfehler).</li>
<li>Kann auch an <b>R-Werte</b> binden (⟦f(3)⟧, ⟦f(a + b)⟧).</li></ul>
<p>Faustregel: kleine Typen (⟦int⟧, ⟦double⟧) per Wert, grosse per ⟦const&⟧, zu ändernde per ⟦&⟧.</p>`);
K(7, 'Konzept', 3, 'Was bedeutet const bei einer Variable? Was ist const-Korrektheit?', R`
<p>⟦const int n = 5;⟧: ⟦n⟧ darf nach der Initialisierung nicht mehr verändert werden – vom <b>Compiler</b> geprüft.</p>
<p>Const-Korrektheit: alles, was sich nicht ändern soll, als ⟦const⟧ markieren. Fehler werden so zu Kompilierfehlern statt zu falschen Resultaten.</p>`);
K(7, 'Code', 5, 'Was passiert? – swap mit Referenzen', R`
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
K(7, 'Code', 5, 'Was passiert? – Referenz und Kopie', R`
<p><b>Ausgabe:</b> ⟦717⟧</p>
<p>⟦r⟧ ist Alias für ⟦a⟧ → ⟦a = 7⟧. ⟦b⟧ ist eine <b>Kopie</b> (kein ⟦&⟧), ⟦b = 1⟧ ändert ⟦a⟧ nicht.</p>`, {
  q: R`int a = 3;
int& r = a;
r = 7;
int b = r;
b = 1;
std::cout << a << b << r;`, out: '717' });
K(7, 'Code', 4, 'Was passiert? – Referenz ohne Initialisierung', R`
<p><b>Kompilierfehler.</b></p>
<p>Eine Referenz muss bei der Deklaration an ein Objekt gebunden werden.</p>`, {
  q: R`int a = 3;
int& r;
r = a;
std::cout << r;`, err: 'compile' });
K(7, 'Code', 5, 'Was passiert? – Referenz auf lokale Variable zurückgeben', R`
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
K(7, 'Code', 4, 'Was passiert? – Literal an int& übergeben', R`
<p><b>Kompilierfehler.</b></p>
<p>Ein ⟦int&⟧-Parameter braucht einen <b>L-Wert</b>; ⟦5⟧ ist ein R-Wert und kann nicht verändert werden. (Ein ⟦const int&⟧ dürfte an ⟦5⟧ binden.)</p>`, {
  q: R`void inc(int& x) {
    ++x;
}

int main() {
    inc(5);
    std::cout << "ok";
}`, err: 'compile' });
K(7, 'Code', 4, 'Was passiert? – const-Parameter verändern', R`
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
C(7, 4, 'int& an eine 5', R`int& r = 5;`, { err: 'compile' },
  R`Ein ⟦int&⟧ bindet nur an L-Werte. Würde man danach ⟦r = 6;⟧ schreiben, müsste das Literal 5 geändert werden – unmöglich.`);
C(7, 4, 'const int& an eine 5', R`const int& r = 5;
std::cout << r;`, { out: '5', ok: true },
  R`Eine ⟦const⟧-Referenz darf an ein temporäres Objekt gebunden werden; dessen Lebensdauer wird verlängert.`);
C(7, 3, 'int& auf double', R`double d = 1.5;
int& r = d;`, { err: 'compile' },
  R`Eine ⟦int&⟧ muss auf ein ⟦int⟧ verweisen: «cannot bind non-const lvalue reference of type int& to a value of type double».`);
C(7, 5, 'Referenz umbiegen?', R`int a = 1, b = 2;
int& r = a;
r = b;
r = 3;
std::cout << a << b;`, { out: '32', ok: true },
  R`⟦r = b;⟧ macht ⟦r⟧ <b>nicht</b> zum Alias von ⟦b⟧, sondern setzt ⟦a⟧ auf 2. Danach setzt ⟦r = 3;⟧ wieder ⟦a⟧. ⟦b⟧ bleibt 2.`);
C(7, 4, 'const-Referenz und Änderung', R`int x = 1;
const int& r = x;
x = 5;
std::cout << r;`, { out: '5', ok: true },
  R`⟦const⟧ heisst nur: <b>über r</b> darf nicht geschrieben werden. Das Objekt selbst kann sich ändern, und ⟦r⟧ sieht das.`);
C(7, 5, 'Referenz auf Parameter zurückgeben', R`int& foo(int i) {
    return i;
}

int main() {
    int k = 3;
    int& j = foo(k);
    std::cout << j;
}`, { err: 'ub' },
  R`⟦i⟧ ist eine <b>Kopie</b> von ⟦k⟧ und wird beim Verlassen von ⟦foo⟧ zerstört. ⟦j⟧ ist ein Alias auf einen «Zombie» (dangling reference).`);
C(7, 4, 'Referenz auf erstes Element, dann push_back', R`std::vector<int> v = {1, 2, 3};
int& first = v[0];
v.push_back(4);
std::cout << first;`, { err: 'ub' },
  R`Muss der Vektor wachsen, wird sein Inhalt in neuen Speicher kopiert und der alte freigegeben. ⟦first⟧ verweist in freigegebenen Speicher.`);
C(7, 3, 'Funktionsaufruf links vom =', R`int& at(std::vector<int>& v, int i) {
    return v[i];
}

int main() {
    std::vector<int> v = {1, 2, 3};
    at(v, 1) = 20;
    std::cout << v[1];
}`, { out: '20', ok: true },
  R`Der Vektor lebt in ⟦main⟧ weiter, die Referenz bleibt gültig. Eine Referenz als Rückgabe ist ein L-Wert und erlaubt sogar die Zuweisung.`);
C(7, 3, 'wrap_at(v, 6) = 6', R`int wrap_at(const std::vector<int>& vec,
            int index) {
    return vec[index % vec.size()];
}

int main() {
    std::vector<int> v = {0, 1, 2, 3};
    wrap_at(v, 6) = 6;
}`, { err: 'compile' },
  R`Rückgabe by Value ist ein R-Wert (eine Kopie): «lvalue required as left operand of assignment».`);
C(7, 5, 'Quadrieren mit Range-for', R`std::vector<int> v = {1, 2, 3};
for (int x : v)
    x = x * x;
int s = 0;
for (int x : v)
    s += x;
std::cout << s;`, { out: '6', lf: true },
  R`Die erste Schleife verändert nur Kopien. Mit ⟦int& x⟧ wäre die Ausgabe ⟦14⟧.`);

/* ================= 8 Zeichen und Strings ================= */
K(8, 'Konzept', 5, 'Unterschied zwischen \'a\', "a" und std::string("a")', R`
<ul><li>⟦'a'⟧ – ein ⟦char⟧, also eine Zahl (ASCII 97).</li>
<li>⟦"a"⟧ – ein String-Literal vom Typ ⟦const char[2]⟧ (⟦a⟧ plus ⟦\0⟧); verhält sich in Ausdrücken wie ein Zeiger ⟦const char*⟧. ⟦+ n⟧ ist darum Zeigerarithmetik!</li>
<li>⟦std::string("a")⟧ – ein Objekt mit ⟦+⟧ (Verkettung), ⟦==⟧, ⟦<⟧, ⟦.size()⟧, ⟦.at()⟧.</li></ul>
<p>⟦"x" + "y"⟧ ist ein Kompilierfehler; sobald ein Operand ein ⟦std::string⟧ ist, funktioniert ⟦+⟧.</p>`);
K(8, 'Code', 4, 'Was passiert? – Zeichen ersetzen mit Bereichs-for', R`
<p><b>Ausgabe:</b> ⟦HaLLo5⟧</p>
<p>⟦char& c⟧ ist eine Referenz auf das jeweilige Zeichen → Änderungen wirken im String.</p>`, {
  q: R`std::string s = "Hallo";
for (char& c : s)
    if (c == 'l') c = 'L';
std::cout << s << s.length();`, out: 'HaLLo5' });
K(8, 'Code', 4, 'Was passiert? – Bereichs-for ohne &', R`
<p><b>Ausgabe:</b> ⟦Hallo⟧ – logischer Fehler.</p>
<p>⟦char c⟧ ist eine <b>Kopie</b> jedes Zeichens; die Zuweisung ändert nur die Kopie. Für Änderungen: ⟦char& c⟧.</p>`, {
  q: R`std::string s = "Hallo";
for (char c : s)
    c = 'x';
std::cout << s;`, err: 'logic', out: 'Hallo' });
K(8, 'Code', 3, 'Was passiert? – Caesar-Verschiebung', R`
<p><b>Ausgabe:</b> ⟦b⟧</p>
<p>⟦c - 'a'⟧ = 24 (Position im Alphabet), $(24+3)\bmod26=1$, ⟦'a' + 1⟧ = ⟦'b'⟧. Funktioniert, weil ⟦'a'…'z'⟧ im ASCII aufeinanderfolgen.</p>`, {
  q: R`char c = 'y';
char d = 'a' + (c - 'a' + 3) % 26;
std::cout << d;`, out: 'b' });
C(8, 3, 'char aus "a"', R`char c = "a";`, { err: 'compile' },
  R`⟦"a"⟧ ist ein String-Literal (⟦const char*⟧), kein Zeichen. Richtig: ⟦char c = 'a';⟧`);
C(8, 5, 'Zwei Literale addieren', R`std::string s = "Hallo " + "Welt";`, { err: 'compile' },
  R`Beide Operanden sind Literale (Zeiger) – ⟦+⟧ für zwei Zeiger existiert nicht. Richtig: ⟦std::string("Hallo ") + "Welt"⟧.`);
C(8, 4, 'Literal + string + Literal', R`std::string w = "Welt";
std::string s = "Hallo " + w + "!";
std::cout << s;`, { out: 'Hallo Welt!', ok: true },
  R`⟦("Hallo " + w)⟧ ist bereits ein ⟦std::string⟧, also klappt auch ⟦+ "!"⟧. Aber ⟦"Hallo " + "!" + w⟧ wäre ein Kompilierfehler, weil zuerst zwei Literale addiert würden.`);
C(8, 4, 'Literal plus Zeichen', R`std::string s = "a" + 'b';
std::cout << s;`, { err: 'ub' },
  R`Kompiliert! ⟦'b'⟧ ist die Zahl 98, also ⟦"a" + 98⟧: ein Zeiger 98 Zeichen hinter den Anfang eines 2-Zeichen-Literals. Richtig: ⟦std::string("a") + 'b'⟧.`);
C(8, 4, 'Hallo plus eins', R`std::cout << "Hallo" + 1;`, { out: 'allo', lf: true },
  R`Zeigerarithmetik: die Ausgabe beginnt beim zweiten Zeichen (noch innerhalb des Literals, darum kein UB).`);
C(8, 4, 'Zwei Zeichen addieren', R`std::cout << 'a' + 'b';`, { out: '195', lf: true },
  R`$97+98=195$ – ⟦char + char⟧ ergibt ⟦int⟧.`);
C(8, 5, 'Ziffer als Zeichen', R`char c = '7';
std::cout << (c == 7) << " " << c - '0'
          << " " << int(c);`, { out: '0 7 55' },
  R`Das Zeichen ⟦'7'⟧ hat den ASCII-Code 55 (≠ 7). Den Ziffernwert bekommt man mit ⟦c - '0'⟧.`);
C(8, 3, 'string aus einem Zeichen', R`std::string s = 'a';`, { err: 'compile' },
  R`Es gibt keine implizite Umwandlung ⟦char⟧ → ⟦std::string⟧. Möglich: ⟦std::string s = "a";⟧ oder ⟦std::string s(1, 'a');⟧`);
C(8, 4, 'z um drei verschieben', R`char c = 'z';
char e = c + 3;
std::cout << e;`, { out: '}', lf: true },
  R`Nach ⟦z⟧ (122) kommen ⟦{⟧ (123), ⟦|⟧ (124), ⟦}⟧ (125). Für einen Umlauf braucht es Modulo: ⟦'a' + (c - 'a' + 3) % 26⟧.`);
C(8, 4, 's[10] bei "abc"', R`std::string s = "abc";
std::cout << s[10];`, { err: 'ub' },
  R`Wie bei Vektoren: ⟦[]⟧ prüft nicht. Mit ⟦s.at(10)⟧ wäre es ein Laufzeitfehler.`);
C(8, 2, 's[s.size()] lesen', R`std::string s = "abc";
std::cout << int(s[s.size()]);`, { out: '0', ok: true },
  R`Sonderregel bei ⟦std::string⟧: ⟦s[s.size()]⟧ liefert das Nullzeichen ⟦'\0'⟧. Nur lesen ist erlaubt. (⟦s.at(s.size())⟧ wirft dagegen eine Exception.)`);
C(8, 3, 's.at(s.size())', R`std::string s = "abc";
std::cout << s.at(s.size());`, { err: 'lz' },
  R`⟦.at()⟧ erlaubt nur Indizes ⟦0 … size()-1⟧ und wirft sonst ⟦std::out_of_range⟧ (Exit-Code ⟦-6⟧).`);
C(8, 3, 'stoi mit Buchstaben', R`int x = std::stoi("abc");
std::cout << x;`, { err: 'lz' },
  R`⟦std::stoi⟧ wirft ⟦std::invalid_argument⟧, wenn der Text nicht mit einer Zahl beginnt → Abbruch (⟦-6⟧).`);
C(8, 3, 'Strings vergleichen', R`std::string a = "Apfel", b = "Birne";
std::cout << (a == "Apfel") << (a < b)
          << (std::string("Z") < "a");`, { out: '111' },
  R`⟦std::string⟧ vergleicht lexikographisch nach ASCII-Code. Grossbuchstaben (65–90) kommen vor Kleinbuchstaben (97–122).`);
C(8, 4, 's[0] und s.at(3)', R`std::string s = "abc";
std::cout << s[0] << s.at(3);`, { err: 'lz' },
  R`⟦s.at(3)⟧ wirft ⟦std::out_of_range⟧ → Abbruch. Ob ⟦a⟧ vorher noch erscheint, hängt vom Puffern ab – das Programm bricht in jedem Fall ab.`);

/* ================= 9 Rekursion und EBNF ================= */
K(9, 'Konzept', 5, 'Was braucht eine korrekte rekursive Funktion?', R`
<ul><li><b>Basisfall</b>, der ohne Rekursion endet,</li>
<li><b>Fortschritt</b>: jeder rekursive Aufruf kommt dem Basisfall näher (z. B. ⟦n⟧ wird kleiner und trifft den Basisfall sicher).</li></ul>
<p>Sonst: unendliche Rekursion → Stapelüberlauf (Absturz).</p>`);
K(9, 'Konzept', 3, 'Fibonacci rekursiv vs. iterativ: Laufzeit?', R`
<p>Naiv rekursiv: jeder Wert wird mehrfach berechnet, Anzahl Aufrufe wächst wie $\varphi^n\approx1.6^n$ → <b>exponentiell</b>.</p>
<p>Iterativ (zwei Variablen, Schleife): <b>linear</b> in $n$. Rekursion ist elegant, aber nicht automatisch effizient.</p>`);
K(9, 'Definition', 4, 'EBNF: Bedeutung von |, { } und [ ]', R`
<ul><li>⟦A | B⟧: Alternative (A <b>oder</b> B)</li>
<li>⟦{ A }⟧: A beliebig oft, auch <b>0-mal</b></li>
<li>⟦[ A ]⟧: A optional (0- oder 1-mal)</li>
<li>⟦"x"⟧ bzw. ⟦'x'⟧: Terminalsymbol (wörtliches Zeichen)</li></ul>
<p>Beispiel: ⟦zahl = ziffer { ziffer }.⟧ = mindestens eine Ziffer.</p>`);
K(9, 'Konzept', 3, 'EBNF: welche Wörter erzeugt A = "a" [ B ] "c". B = "b" { "b" }.?', R`
<p>Erlaubt: ⟦ac⟧, ⟦abc⟧, ⟦abbc⟧, ⟦abbbc⟧, …</p>
<p>Nicht erlaubt: ⟦a⟧ (kein c), ⟦bc⟧ (kein a), ⟦abcb⟧ (nach c nichts mehr), ⟦aac⟧.</p>
<p>Kurz: ein ⟦a⟧, dann beliebig viele ⟦b⟧, dann ⟦c⟧.</p>`);
K(9, 'Konzept', 3, 'Wie wird aus einer EBNF ein Parser (rekursiver Abstieg)?', R`
<ul><li>Pro Regel eine <b>Funktion</b> (⟦expression⟧, ⟦term⟧, ⟦factor⟧), die den Eingabestrom liest.</li>
<li>Alternative → ⟦if⟧ anhand des nächsten Zeichens (Lookahead, ⟦peek⟧),</li>
<li>⟦{ }⟧ → ⟦while⟧, ⟦[ ]⟧ → ⟦if⟧,</li>
<li>Verweis auf eine andere Regel → Funktionsaufruf (darum rekursiv: ⟦factor⟧ ruft bei ⟦(⟧ wieder ⟦expression⟧ auf).</li></ul>
<p>Präzedenz entsteht durch die Schachtelung: expression = term { (+|-) term }, term = factor { (*|/) factor }.</p>`);
K(9, 'Konzept', 4, 'Call-Stack: warum gibt es Stack Overflow?', R`
<p>Jeder Funktionsaufruf legt einen <b>Stack-Frame</b> (Parameter, lokale Variablen, Rücksprungadresse) auf den Call-Stack; er wird erst beim Zurückkehren abgebaut. Der Stack ist begrenzt (typisch 8 MB).</p>
<p>Zu viele <b>gleichzeitig aktive</b> Aufrufe → Stack Overflow: formal UB, praktisch Segmentation Fault (⟦-11⟧). Das passiert bei unendlicher Rekursion, aber auch bei endlicher, sehr tiefer (z. B. $10^7$ Aufrufe).</p>
<p>Exponentiell viele, aber flache Aufrufe (naives ⟦fib(60)⟧) sind dagegen <b>kein</b> Stack Overflow, sondern ein Timeout.</p>`);
K(9, 'Code', 5, 'Was passiert? – f(7) mit Schritt 2', R`
<p><b>Ausgabe:</b> ⟦105⟧</p>
<p>$f(7)=7\cdot f(5)=7\cdot5\cdot f(3)=7\cdot5\cdot3\cdot f(1)=105$.</p>`, {
  q: R`int f(int n) {
    if (n <= 1) return 1;
    return n * f(n - 2);
}

int main() {
    std::cout << f(7);
}`, out: '105' });
K(9, 'Code', 5, 'Was passiert? – Ausgabe vor und nach dem Aufruf', R`
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
K(9, 'Code', 5, 'Was passiert? – Summe in Zweierschritten', R`
<p><b>Unendliche Rekursion → Stapelüberlauf</b> (Laufzeitfehler).</p>
<p>⟦5, 3, 1, -1, -3, …⟧: der Basisfall ⟦n == 0⟧ wird bei ungeradem Start <b>übersprungen</b>. Abhilfe: ⟦if (n <= 0)⟧.</p>`, {
  q: R`int f(int n) {
    if (n == 0) return 0;
    return n + f(n - 2);
}

int main() {
    std::cout << f(5);
}`, err: 'runtime' });
K(9, 'Code', 2, 'Was passiert? – Aufrufe zählen bei fib', R`
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
C(9, 5, 'Fakultät ohne if', R`int fac(int n) {
    return n * fac(n - 1);
}

int main() {
    std::cout << fac(3);
}`, { err: 'so' },
  R`Kein Basisfall → unendliche Rekursion. Es wird nichts ausgegeben (die Ausgabe käme erst nach dem Zurückkehren).`);
C(9, 5, 'fac(-1)', R`int fac(int n) {
    if (n == 0) return 1;
    return n * fac(n - 1);
}

int main() {
    std::cout << fac(-1);
}`, { err: 'so' },
  R`$-1,-2,-3,\dots$ – der Basisfall ⟦n == 0⟧ wird nie erreicht. Mit ⟦n <= 0⟧ wäre es sicher.`);
C(9, 4, 'fac mit n + 1', R`int fac(int n) {
    if (n <= 1) return 1;
    return n * fac(n + 1);
}

int main() {
    std::cout << fac(3);
}`, { err: 'so' },
  R`Kein Fortschritt Richtung Basisfall: ⟦n⟧ wird grösser statt kleiner.`);
C(9, 4, 'sum(n) ruft sum(n) auf', R`int sum(int n) {
    if (n == 0) return 0;
    return n + sum(n);   // gemeint: sum(n - 1)
}

int main() {
    std::cout << sum(5);
}`, { err: 'so' },
  R`Gleiches Argument = kein Fortschritt.`);
C(9, 3, 'Summe bis zehn Millionen', R`long long sum(long long n) {
    if (n == 0) return 0;
    return n + sum(n - 1);
}

int main() {
    std::cout << sum(10000000);
}`, { err: 'so' },
  R`Mathematisch terminiert die Rekursion, aber $10^7$ gleichzeitig aktive Stack-Frames passen nicht in den Stack. (⟦sum(1000)⟧ wäre problemlos; eine Schleife hätte das Problem nie.)`);
C(9, 4, 'Fakultät ohne return im Rekursionsfall', R`int fac(int n) {
    if (n <= 1) return 1;
    n * fac(n - 1);   // Resultat wird weggeworfen
}

int main() {
    std::cout << fac(4);
}`, { err: 'ub' },
  R`Für ⟦n > 1⟧ erreicht die Funktion ihr Ende ohne ⟦return⟧ → UB.`);
C(9, 4, 'fac(13)', R`int fac(int n) {
    if (n <= 1) return 1;
    return n * fac(n - 1);
}

int main() {
    std::cout << fac(13);
}`, { err: 'ub' },
  R`Die Rekursion ist korrekt, aber $13!=6\,227\,020\,800>2^{31}-1$ → int-Überlauf. Typische (falsche) Ausgabe: ⟦1932053504⟧.`);
C(9, 4, 'fib(60) naiv', R`long long fib(int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}

int main() {
    std::cout << fib(60);
}`, { err: 'loop' },
  R`Terminiert theoretisch, braucht aber ca. $\varphi^{60}\approx10^{12}$ Aufrufe – Stunden. Timeout (⟦-9⟧). Die Rekursionstiefe ist nur 60, also <b>kein</b> Stack Overflow. Lösung: iterativ.`);
C(9, 3, 'is_even und is_odd', R`bool is_even(int n) {
    if (n == 0) return true;
    return is_odd(n - 1);
}

bool is_odd(int n) {
    if (n == 0) return false;
    return is_even(n - 1);
}

int main() { std::cout << is_even(4); }`, { err: 'compile' },
  R`Beim Aufruf in ⟦is_even⟧ ist ⟦is_odd⟧ noch nicht deklariert. Lösung: Vorwärtsdeklaration ⟦bool is_odd(int n);⟧ ganz oben.`);
C(9, 4, 'Fibonacci-artig f(5)', R`int f(int n) {
    if (n <= 1) return 1;
    return f(n - 1) + f(n - 2);
}

int main() {
    std::cout << f(5);
}`, { out: '8', ok: true },
  R`$f(0)=f(1)=1$, $f(2)=2$, $f(3)=3$, $f(4)=5$, $f(5)=8$. Am besten von unten her tabellieren.`);
C(9, 5, 'Ausgabe nach dem Aufruf', R`void p(int n) {
    if (n == 0) return;
    p(n - 1);
    std::cout << n;
}

int main() {
    p(3);
}`, { out: '123' },
  R`Die Ausgabe passiert <b>nach</b> dem rekursiven Aufruf, also auf dem Rückweg: zuerst kehrt ⟦p(1)⟧ zurück und gibt 1 aus, dann ⟦p(2)⟧, dann ⟦p(3)⟧.`);
C(9, 4, 'Halbieren rekursiv', R`int g(int n) {
    if (n == 0) return 0;
    return g(n / 2 - 1) + 1;
}

int main() {
    std::cout << g(5);
}`, { err: 'so' },
  R`⟦g(5)⟧ → ⟦g(1)⟧ → ⟦g(-1)⟧ → ⟦g(-1)⟧ → … Da ⟦-1 / 2 = 0⟧ (Rundung gegen 0), bleibt ⟦n = -1⟧ hängen. (Mit ⟦g(2)⟧ wäre die Ausgabe ⟦1⟧.)`);

/* ================= 10 Structs, Klassen und Operatoren ================= */
K(10, 'Definition', 4, 'struct und class', R`
<p>Eigener Typ aus mehreren <b>Datenelementen</b> (Membern), Zugriff mit ⟦.⟧ (bzw. ⟦->⟧ über Zeiger).</p>
<p>Einziger Unterschied: bei ⟦struct⟧ ist alles standardmässig <b>public</b>, bei ⟦class⟧ <b>private</b>.</p>
<p><b>Datenkapselung:</b> Daten private, Zugriff nur über public Memberfunktionen → die Klasse kann Invarianten garantieren (z. B. Nenner ≠ 0).</p>`);
K(10, 'Konzept', 4, 'Konstruktor, Initialisierungsliste, Default-Konstruktor', R`
⟪class Rational {
    int n, d;
public:
    Rational(int num, int den) : n(num), d(den) { assert(den != 0); }
    Rational(int num) : n(num), d(1) {}
    Rational() : n(0), d(1) {}          // Default-Konstruktor
};⟫
<p>Der Compiler erzeugt einen Default-Konstruktor <b>nur, wenn kein eigener Konstruktor</b> existiert.</p>`);
K(10, 'Konzept', 4, 'Wie überlädt man +, += und << korrekt?', R`
⟪Rational& operator+=(Rational& a, const Rational& b);   // ändert a, gibt a zurück
Rational  operator+ (Rational a, const Rational& b) { return a += b; }
std::ostream& operator<<(std::ostream& o, const Rational& r);⟫
<ul><li>⟦+=⟧ gibt eine <b>Referenz</b> zurück → Verkettung wirkt auf das Original.</li>
<li>⟦+⟧ gibt ein <b>neues Objekt</b> (per Wert) zurück.</li>
<li>⟦<<⟧ gibt den Stream per Referenz zurück → ⟦std::cout << a << b⟧ funktioniert.</li></ul>`);
K(10, 'Konzept', 3, 'Was bedeutet const hinter einer Memberfunktion?', R`
<p>⟦int get() const;⟧ verspricht, das Objekt <b>nicht zu verändern</b>. Im Rumpf sind die Member dann ⟦const⟧.</p>
<p>Auf einem ⟦const⟧-Objekt (oder über ⟦const&⟧) dürfen <b>nur const-Memberfunktionen</b> aufgerufen werden – sonst Kompilierfehler.</p>`);
K(10, 'Regel', 3, 'In welcher Reihenfolge werden Member initialisiert?', R`
<p>In der Reihenfolge ihrer <b>Deklaration in der Klasse</b> – <b>nicht</b> in der Reihenfolge der Initialisierungsliste.</p>
⟪class range {
    int size;            // wird ZUERST initialisiert
    int lo, hi;
public:
    range(int a, int b) : lo(a), hi(b), size(hi - lo) {}   // UB!
};⟫
<p>⟦size⟧ wird aus noch uninitialisierten ⟦hi⟧ und ⟦lo⟧ berechnet (Warnung ⟦-Wreorder⟧).</p>`);
K(10, 'Regel', 3, 'Operator als Member oder als freie Funktion: wie viele Parameter?', R`
<p><b>Freie Funktion:</b> alle Operanden als Parameter – binär: ⟦rational operator+(rational a, rational b);⟧</p>
<p><b>Memberfunktion:</b> der linke Operand ist das Objekt selbst (⟦*this⟧) – binär: ⟦rational operator+(const rational& b) const;⟧ (ein Parameter).</p>
<p>⟦operator<<⟧ für die Ausgabe muss frei sein (links steht der Stream), gibt ⟦std::ostream&⟧ zurück und nimmt den Stream per Referenz.</p>`);
K(10, 'Code', 4, 'Was passiert? – struct kopieren', R`
<p><b>Ausgabe:</b> ⟦15⟧</p>
<p>Structs werden <b>memberweise kopiert</b>; ⟦b⟧ ist unabhängig von ⟦a⟧.</p>`, {
  q: R`struct P { int x, y; };

int main() {
    P a{1, 2};
    P b = a;
    b.x = 5;
    std::cout << a.x << b.x;
}`, out: '15' });
K(10, 'Code', 5, 'Was passiert? – Zugriff auf Member einer class', R`
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
K(10, 'Code', 4, 'Was passiert? – Objekt ohne Argumente anlegen', R`
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
K(10, 'Code', 3, 'Was passiert? – += verkettet', R`
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
K(10, 'Code', 3, 'Was passiert? – Methode auf const-Referenz', R`
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
C(10, 3, 'struct ohne Strichpunkt', R`struct rational {
    int n;
    int d;
}

int main() {
    rational r;
}`, { err: 'compile' },
  R`Nach der schliessenden Klammer einer struct- oder class-Definition ist ⟦;⟧ Pflicht: «expected ';' after struct definition».`);
C(10, 3, 'Knoten enthält Knoten', R`struct node {
    int value;
    node next;
};
int main() {}`, { err: 'compile' },
  R`Das wäre eine unendlich grosse Struktur («incomplete type»). Erlaubt ist ein Zeiger: ⟦node* next;⟧`);
C(10, 4, 'struct ohne Initialisierung ausgeben', R`struct rational {
    int n;
    int d;
};

int main() {
    rational r;
    std::cout << r.n << "/" << r.d;
}`, { err: 'ub' },
  R`Wie jede uninitialisierte ⟦int⟧-Variable. Mit ⟦rational r = {1, 2};⟧ oder Default-Werten im struct (⟦int n = 0;⟧) wäre es korrekt.`);
C(10, 2, 'Drei Werte für zwei Member', R`struct rational { int n; int d; };

int main() {
    rational r = {1, 2, 3};
}`, { err: 'compile' },
  R`«too many initializers for rational».`);
C(10, 4, 'struct ausgeben', R`struct rational { int n; int d; };

int main() {
    rational r = {1, 2};
    std::cout << r;
}`, { err: 'compile' },
  R`Für ein eigenes struct gibt es kein ⟦<<⟧, bis man ⟦operator<<⟧ selbst überlädt.`);
C(10, 4, 'Zwei structs vergleichen', R`struct rational { int n; int d; };

int main() {
    rational a = {1, 2}, b = {1, 2};
    std::cout << (a == b);
}`, { err: 'compile' },
  R`Zuweisung und Kopieren gibt es automatisch (memberweise), <b>Vergleiche und Arithmetik nicht</b>.`);
C(10, 5, 'operator+= mit Kopie', R`struct rational { int n; int d; };

rational operator+=(rational a, const rational& b) {
    a.n = a.n * b.d + b.n * a.d;
    a.d = a.d * b.d;
    return a;
}

int main() {
    rational x = {1, 2}, y = {1, 3};
    x += y;
    std::cout << x.n << "/" << x.d;
}`, { out: '1/2', lf: true },
  R`⟦a⟧ ist eine <b>Kopie</b> von ⟦x⟧ – ⟦x⟧ bleibt unverändert. Richtig: ⟦rational& operator+=(rational& a, const rational& b)⟧ mit ⟦return a;⟧.`);
C(10, 4, 'operator<< ohne Rückgabe', R`struct rational { int n; int d; };

void operator<<(std::ostream& out,
                const rational& r) {
    out << r.n << "/" << r.d;
}

int main() {
    rational r = {1, 2};
    std::cout << r << "\n";
}`, { err: 'compile' },
  R`⟦std::cout << r⟧ liefert ⟦void⟧, und ⟦void << "\n"⟧ gibt es nicht. Richtig: ⟦std::ostream& operator<<(…)⟧ mit ⟦return out;⟧.`);
C(10, 3, 'operator<< mit Stream-Kopie', R`struct rational { int n; int d; };

std::ostream& operator<<(std::ostream out,
                         const rational& r) {
    return out << r.n << "/" << r.d;
}

int main() {
    rational r = {1, 2};
    std::cout << r;
}`, { err: 'compile' },
  R`Streams können nicht kopiert werden («use of deleted function»). Immer ⟦std::ostream&⟧ verwenden.`);
C(10, 4, 'Wert eines Bruchs', R`struct rational { int n; int d; };

double value(const rational& r) {
    return r.n / r.d;
}

int main() {
    rational r = {1, 2};
    std::cout << value(r);
}`, { out: '0', lf: true },
  R`⟦1 / 2⟧ ist Ganzzahldivision = 0, erst dann Umwandlung in ⟦double⟧. Richtig: ⟦double(r.n) / r.d⟧.`);
C(10, 4, 'Punkt als class', R`class point {
    int x;
    int y;
};

int main() {
    point p;
    p.x = 1;
}`, { err: 'compile' },
  R`Bei ⟦class⟧ ist alles standardmässig ⟦private⟧ (bei ⟦struct⟧ ⟦public⟧) – der einzige Unterschied.`);
C(10, 4, 'inc() const', R`class counter {
    int c = 0;
public:
    void inc() const { ++c; }
};
int main() { counter k; k.inc(); }`, { err: 'compile' },
  R`⟦const⟧ hinter der Parameterliste verspricht «diese Funktion ändert das Objekt nicht» – ⟦++c⟧ bricht das Versprechen.`);
C(10, 3, 'Objekt mit leeren Klammern', R`class rational {
    int n = 0, d = 1;
public:
    int num() const { return n; }
};

int main() {
    rational r();
    std::cout << r.num();
}`, { err: 'compile' },
  R`«Most vexing parse»: ⟦rational r();⟧ deklariert eine <b>Funktion</b> ⟦r⟧ ohne Parameter, die ein ⟦rational⟧ zurückgibt. Richtig: ⟦rational r;⟧ oder ⟦rational r{};⟧`);
C(10, 5, 'Konstruktor mit n = n', R`class rational {
    int n, d;
public:
    rational(int n, int d) {
        n = n;
        d = d;
    }
    int num() const { return n; }
};

int main() {
    rational r(1, 2);
    std::cout << r.num();
}`, { err: 'ub' },
  R`Im Konstruktor verdeckt der Parameter ⟦n⟧ den Member ⟦n⟧: ⟦n = n⟧ weist dem Parameter sich selbst zu. Die Member bleiben uninitialisiert. Lösung: ⟦: n(n), d(d)⟧ oder ⟦this->n = n;⟧`);
C(10, 3, 'range mit Initialisierungsliste', R`class range {
    int size;
    int lo, hi;
public:
    range(int a, int b)
        : lo(a), hi(b), size(hi - lo) {}
    int get() const { return size; }
};

int main() {
    range r(3, 8);
    std::cout << r.get();
}`, { err: 'ub' },
  R`Member werden in der Reihenfolge ihrer <b>Deklaration</b> initialisiert: zuerst ⟦size⟧ – aus den noch uninitialisierten ⟦hi⟧ und ⟦lo⟧.`);
C(10, 3, 'Methode ausserhalb definiert', R`class rational {
    int n = 1, d = 2;
public:
    int num() const;
};

int num() const {
    return n;
}
int main() {}`, { err: 'compile' },
  R`Ohne ⟦rational::⟧ ist ⟦num⟧ eine freie Funktion (und darf nicht ⟦const⟧ sein, kennt kein ⟦n⟧). Richtig: ⟦int rational::num() const { return n; }⟧`);
C(10, 3, 'Member-operator+ mit zwei Parametern', R`class rational {
    int n, d;
public:
    rational operator+(rational a, rational b);
};
int main() {}`, { err: 'compile' },
  R`Als Memberfunktion ist der linke Operand das Objekt selbst (⟦*this⟧). Ein binärer Member-Operator hat nur <b>einen</b> Parameter.`);

/* ================= 11 Container und Iteratoren ================= */
K(11, 'Konzept', 4, 'Iteratoren: begin, end, und wann werden sie ungültig?', R`
<ul><li>⟦c.begin()⟧ zeigt auf das erste Element, ⟦c.end()⟧ <b>hinter</b> das letzte. ⟦*c.end()⟧ ist immer UB; letztes Element: ⟦c.back()⟧ bzw. ⟦*(c.end() - 1)⟧.</li>
<li>Schleife immer mit ⟦it != c.end()⟧ (nicht ⟦<=⟧).</li>
<li>Verändert man den Container (⟦push_back⟧, ⟦erase⟧), können Iteratoren, Referenzen und Zeiger auf seine Elemente <b>ungültig</b> werden → Benutzen ist UB.</li>
<li>⟦erase(it)⟧ liefert den nächsten gültigen Iterator: ⟦it = v.erase(it);⟧</li></ul>`);
K(11, 'Konzept', 3, 'vector, list, set, unordered_set: was kann welcher Container?', R`
<table class="pt">
<tr><td>⟦vector⟧</td><td>Index ⟦[]⟧, ⟦it + 2⟧, ⟦std::sort⟧ (Random Access)</td></tr>
<tr><td>⟦list⟧</td><td>kein ⟦[]⟧, Iteratoren nur ⟦++⟧/⟦--⟧, schnelles Einfügen</td></tr>
<tr><td>⟦set⟧</td><td>keine Duplikate, <b>sortiert</b>, Elemente konstant</td></tr>
<tr><td>⟦unordered_set⟧</td><td>keine Duplikate, Reihenfolge <b>unbestimmt</b>, nicht sortierbar</td></tr></table>`);
K(11, 'Code', 4, 'Was passiert? – mit Iterator verdoppeln', R`
<p><b>Ausgabe:</b> ⟦628⟧</p>
<p>⟦v.begin()⟧ zeigt aufs erste Element, ⟦v.end()⟧ <b>hinter</b> das letzte. ⟦*it⟧ ist das Element selbst (veränderbar).</p>`, {
  q: R`std::vector<int> v = {3, 1, 4};
for (auto it = v.begin(); it != v.end(); ++it)
    *it *= 2;
for (int x : v)
    std::cout << x;`, out: '628' });
K(11, 'Code', 2, 'Was passiert? – push_back während der Iteration', R`
<p><b>Undefiniertes Verhalten.</b></p>
<p>⟦push_back⟧ kann den Speicher des Vektors neu anlegen; alle Iteratoren (und ⟦v.end()⟧) werden dabei <b>ungültig</b>.</p>`, {
  q: R`std::vector<int> v = {1, 2, 3};
for (auto it = v.begin(); it != v.end(); ++it)
    if (*it == 2) v.push_back(4);
std::cout << v.size();`, err: 'ub' });
C(11, 4, 'Ausgabe von *v.end()', R`std::vector<int> v = {1, 2, 3};
std::cout << *v.end();`, { err: 'ub' },
  R`⟦end()⟧ zeigt <b>hinter</b> das letzte Element. Das letzte Element ist ⟦*(v.end() - 1)⟧ bzw. ⟦v.back()⟧.`);
C(11, 4, 'Iterator bis <= end()', R`std::vector<int> v = {1, 2, 3};
for (auto it = v.begin(); it <= v.end(); ++it)
    std::cout << *it;`, { err: 'ub' },
  R`Ausgabe ⟦123⟧, dann ⟦*v.end()⟧ → UB. Iterator-Schleifen immer mit ⟦it != c.end()⟧.`);
C(11, 4, 'find ohne Prüfung', R`std::vector<int> v = {1, 2, 3};
auto it = std::find(v.begin(), v.end(), 7);
std::cout << *it;`, { err: 'ub' },
  R`⟦std::find⟧ liefert ⟦v.end()⟧, wenn das Element nicht gefunden wird → Dereferenzieren ist UB. Immer ⟦if (it != v.end())⟧ prüfen.`);
C(11, 4, 'Iterator merken, dann push_back', R`std::vector<int> v = {1, 2, 3};
auto it = v.begin();
v.push_back(4);
std::cout << *it;`, { err: 'ub' },
  R`Durch die Reallokation zeigt ⟦it⟧ in freigegebenen Speicher.`);
C(11, 3, 'erase in der Schleife', R`std::vector<int> v = {1, 2, 2, 3};
for (auto it = v.begin(); it != v.end(); ++it)
    if (*it == 3)
        v.erase(it);`, { err: 'ub' },
  R`Nach ⟦erase(it)⟧ ist ⟦it⟧ ungültig; ⟦++it⟧ springt hier sogar über ⟦end()⟧ hinaus. Richtig: ⟦it = v.erase(it);⟧ und nur sonst ⟦++it⟧.`);
C(11, 3, 'iterator von const-Vektor', R`const auto x = std::vector<int>{1, 2, 3};
for (std::vector<int>::iterator it = x.begin();
     it != x.end(); ++it)
    std::cout << *it;`, { err: 'compile' },
  R`Von einem const-Container bekommt man nur einen ⟦const_iterator⟧. Lösung: ⟦std::vector<int>::const_iterator⟧ oder ⟦auto⟧.`);
C(11, 3, 'Über cbegin schreiben', R`std::vector<int> v = {1, 2, 3};
for (auto it = v.cbegin(); it != v.cend(); ++it)
    *it = 0;`, { err: 'compile' },
  R`⟦cbegin()⟧ liefert einen ⟦const_iterator⟧: über ihn darf nur gelesen werden («assignment of read-only location»).`);
C(11, 3, 'int& über const-Vektor', R`const std::vector<int> v = {1, 2, 3};
for (int& x : v)
    x = 0;`, { err: 'compile' },
  R`Die Elemente sind ⟦const int⟧; eine ⟦int&⟧ darf nicht daran binden («discards qualifiers»). Lesen ginge mit ⟦const int&⟧ oder ⟦int⟧.`);
C(11, 3, 'list mit Index', R`std::list<int> l = {1, 2, 3};
std::cout << l[0];`, { err: 'compile' },
  R`Eine Liste bietet keinen wahlfreien Zugriff: kein ⟦operator[]⟧, Zugriff nur über Iteratoren.`);
C(11, 2, 'list-Iterator + 2', R`std::list<int> l = {1, 2, 3};
auto it = l.begin() + 2;`, { err: 'compile' },
  R`Listen-Iteratoren kennen nur ⟦++⟧ und ⟦--⟧, keine Sprünge. (Bei ⟦std::vector⟧ funktioniert ⟦v.begin() + 2⟧.)`);
C(11, 4, 'set mit Duplikaten', R`std::set<int> s = {3, 1, 3, 2, 1};
std::cout << s.size() << ": ";
for (int x : s)
    std::cout << x;`, { out: '3: 123', ok: true },
  R`Eine Menge enthält jedes Element nur einmal, und ⟦std::set⟧ ist <b>sortiert</b>. (Bei ⟦std::unordered_set⟧ wäre die Reihenfolge unbestimmt.)`);
C(11, 2, 'set-Element ändern', R`std::set<int> s = {1, 2, 3};
*s.begin() = 10;`, { err: 'compile' },
  R`Die Elemente einer Menge sind konstant (sonst wäre die Sortierung zerstört).`);
C(11, 2, 'unordered_set sortieren', R`std::unordered_set<int> s = {3, 1, 2};
std::sort(s.begin(), s.end());`, { err: 'compile' },
  R`⟦std::sort⟧ braucht Random-Access-Iteratoren (wie bei ⟦vector⟧), die man voneinander subtrahieren kann. Die Fehlermeldung kommt tief aus der Bibliothek.`);

/* ================= 12 Zeiger und Arrays ================= */
K(12, 'Definition', 5, 'Zeiger: &, * und nullptr', R`
⟪int a = 5;
int* p = &a;   // p speichert die Adresse von a
*p = 8;        // Dereferenzieren: a ist jetzt 8
int* q = nullptr; // zeigt auf nichts⟫
<p>⟦&a⟧: Adresse von ⟦a⟧. ⟦*p⟧: das Objekt, auf das ⟦p⟧ zeigt (L-Wert). ⟦p->m⟧ = ⟦(*p).m⟧. ⟦*nullptr⟧ ist undefiniertes Verhalten.</p>`);
K(12, 'Konzept', 4, 'Referenz vs. Zeiger', R`
<table class="pt"><tr><td></td><td><b>Referenz</b></td><td><b>Zeiger</b></td></tr>
<tr><td>muss initialisiert werden</td><td>ja</td><td>nein</td></tr>
<tr><td>umbindbar</td><td>nein</td><td>ja</td></tr>
<tr><td>«leer» möglich</td><td>nein</td><td>⟦nullptr⟧</td></tr>
<tr><td>Zugriff</td><td>direkt</td><td>⟦*p⟧, ⟦p->m⟧</td></tr></table>`);
K(12, 'Regel', 4, 'const int* vs. int* const', R`
<p>Von rechts nach links lesen:</p>
<ul><li>⟦const int* p⟧: Zeiger auf <b>konstanten int</b> – ⟦*p = 2;⟧ verboten, ⟦p = &y;⟧ erlaubt.</li>
<li>⟦int* const p⟧: <b>konstanter Zeiger</b> auf int – ⟦p = &y;⟧ verboten, ⟦*p = 2;⟧ erlaubt.</li>
<li>Adresse einer ⟦const⟧-Variable passt nur in ⟦const int*⟧.</li>
<li>⟦int* p, q;⟧: nur ⟦p⟧ ist ein Zeiger, ⟦q⟧ ein ⟦int⟧ (das ⟦*⟧ gehört zum Namen).</li></ul>`);
K(12, 'Konzept', 3, 'Arrays: was unterscheidet sie von std::vector?', R`
<ul><li>Grösse muss zur <b>Kompilierzeit</b> feststehen (⟦int a[5];⟧); für variable Grösse ⟦std::vector⟧ oder ⟦new int[n]⟧.</li>
<li><b>Keine Bereichsprüfung</b> (kein ⟦.at()⟧), ⟦a[5]⟧ bei Grösse 5 ist UB.</li>
<li>Kein Kopieren und Zuweisen als Ganzes (⟦b = a;⟧ ist ein Kompilierfehler).</li>
<li>⟦int a[4] = {7};⟧ füllt den Rest mit 0; ohne ⟦= {…}⟧ sind alle Elemente uninitialisiert.</li>
<li>Als Funktionsparameter <b>zerfällt</b> ein Array in einen Zeiger (⟦sizeof⟧ liefert dann die Zeigergrösse).</li></ul>`);
K(12, 'Code', 5, 'Was passiert? – zwei Zeiger auf dieselbe Variable', R`
<p><b>Ausgabe:</b> ⟦88⟧</p>
<p>⟦q = p⟧ kopiert die <b>Adresse</b>; beide zeigen auf ⟦a⟧. ⟦*q = 8⟧ ändert also ⟦a⟧.</p>`, {
  q: R`int a = 5;
int* p = &a;
int* q = p;
*q = 8;
std::cout << a << *p;`, out: '88' });
K(12, 'Code', 4, 'Was passiert? – Zeigerarithmetik im Array', R`
<p><b>Ausgabe:</b> ⟦20 40 30⟧</p>
<p>⟦a + 1⟧ zeigt auf ⟦a[1]⟧ = 20. ⟦*(p + 2)⟧ = ⟦a[3]⟧ = 40. ⟦p[1]⟧ = ⟦*(p + 1)⟧ = ⟦a[2]⟧ = 30.</p>`, {
  q: R`int a[] = {10, 20, 30, 40};
int* p = a + 1;
std::cout << *p << " " << *(p + 2)
          << " " << p[1];`, out: '20 40 30' });
K(12, 'Code', 5, 'Was passiert? – Zeiger ohne Ziel', R`
<p><b>Undefiniertes Verhalten.</b></p>
<p>⟦p⟧ ist nicht initialisiert und zeigt irgendwohin. ⟦*p = 3⟧ schreibt an eine zufällige Adresse (oft Absturz). Gleiches gilt für ⟦*nullptr⟧.</p>`, {
  q: R`int* p;
*p = 3;
std::cout << *p;`, err: 'ub' });
C(12, 4, 'nullptr ausgeben', R`int* p = nullptr;
std::cout << *p;`, { err: 'ub' },
  R`Dereferenzieren von ⟦nullptr⟧ – praktisch Segmentation Fault (⟦-11⟧). Vorher ⟦if (p != nullptr)⟧ prüfen.`);
C(12, 3, 'int* in string*', R`int x = 1;
int* p = &x;
std::string* q = p;`, { err: 'compile' },
  R`Ein ⟦T*⟧ muss auf ein ⟦T⟧ zeigen: «cannot convert int* to std::string*».`);
C(12, 4, 'int* p, q', R`int x = 1;
int* p, q;
q = &x;`, { err: 'compile' },
  R`Das ⟦*⟧ gehört zum Variablennamen, nicht zum Typ: ⟦q⟧ ist ein gewöhnlicher ⟦int⟧. Richtig: ⟦int *p, *q;⟧`);
C(12, 3, 'Zeiger auf 5', R`int* p = 5;`, { err: 'compile' },
  R`Eine Zahl ist keine Adresse: «invalid conversion from int to int*».`);
C(12, 2, 'Zeiger auf 0', R`int* p = 0;
std::cout << (p == nullptr);`, { out: '1', ok: true },
  R`Das Literal ⟦0⟧ ist eine Nullzeiger-Konstante (Relikt aus C). Besser: ⟦nullptr⟧.`);
C(12, 4, 'int y = p', R`int x = 1;
int* p = &x;
int y = p;`, { err: 'compile' },
  R`⟦p⟧ ist eine Adresse; gemeint war ⟦int y = *p;⟧.`);
C(12, 4, 'Über const int* schreiben', R`int x = 1;
const int* p = &x;
*p = 2;`, { err: 'compile' },
  R`⟦const int*⟧: der Wert <b>hinter</b> ⟦p⟧ darf über ⟦p⟧ nicht geändert werden («assignment of read-only location»).`);
C(12, 4, 'int* const umbiegen', R`int x = 1, y = 2;
int* const p = &x;
p = &y;`, { err: 'compile' },
  R`⟦p⟧ ist ein <b>konstanter Zeiger</b> auf ⟦int⟧. ⟦*p = 5;⟧ wäre erlaubt, ⟦p = &y;⟧ nicht.`);
C(12, 3, 'Adresse einer Konstante', R`const int x = 1;
int* p = &x;`, { err: 'compile' },
  R`⟦&x⟧ ist ⟦const int*⟧; sonst könnte man über ⟦p⟧ die Konstante ändern. Richtig: ⟦const int* p = &x;⟧`);
C(12, 4, 'Zwei Zeiger vergleichen', R`int a = 5, b = 5;
int* p = &a;
int* q = &b;
std::cout << (p == q) << (*p == *q);`, { out: '01' },
  R`⟦p == q⟧ vergleicht <b>Adressen</b> (verschiedene Variablen), ⟦*p == *q⟧ die <b>Werte</b>.`);
C(12, 4, '*p++ und (*p)++', R`int a[] = {10, 20, 30};
int* p = a;
int x = *p++;
(*p)++;
std::cout << x << " " << a[0] << " "
          << a[1] << " " << *p;`, { out: '10 10 21 21' },
  R`Postfix-⟦++⟧ bindet stärker als ⟦*⟧: ⟦*p++⟧ = ⟦*(p++)⟧ – liefert ⟦a[0]⟧ = 10 und rückt den <b>Zeiger</b> vor. ⟦(*p)++⟧ erhöht dann den Wert ⟦a[1]⟧ auf 21.`);
C(12, 5, 'Adresse einer lokalen Variable zurückgeben', R`int* make() {
    int x = 42;
    return &x;
}

int main() {
    int* p = make();
    std::cout << *p;
}`, { err: 'ub' },
  R`⟦x⟧ existiert nach dem ⟦return⟧ nicht mehr (dangling pointer). Lösung: ⟦return new int(42);⟧ (und später ⟦delete⟧) oder by Value zurückgeben.`);
C(12, 4, 'a[5] bei Grösse 5', R`int a[5] = {1, 2, 3, 4, 5};
a[5] = 6;`, { err: 'ub' },
  R`Gültige Indizes 0–4. Arrays haben nie eine Bereichsprüfung.`);
C(12, 3, 'Array mit einem Startwert', R`int a[4] = {7};
std::cout << a[0] << a[1] << a[2] << a[3];`, { out: '7000', ok: true },
  R`Fehlende Werte in der Initialisierungsliste werden mit 0 aufgefüllt. Ganz ohne ⟦= {…}⟧ wären alle Elemente uninitialisiert.`);
C(12, 3, 'Array zuweisen', R`int a[3] = {1, 2, 3};
int b[3];
b = a;`, { err: 'compile' },
  R`Arrays können nicht als Ganzes zugewiesen werden («invalid array assignment») – anders als ⟦std::vector⟧.`);
C(12, 2, 'Drei Werte für zwei Plätze', R`int a[2] = {1, 2, 3};`, { err: 'compile' },
  R`«too many initializers for int[2]».`);
C(12, 3, 'Zeiger hinter das Array', R`int a[3] = {1, 2, 3};
int* p = a + 3;   // zeigt HINTER das letzte Element
std::cout << *p;`, { err: 'ub' },
  R`Einen Zeiger direkt hinter das Array zu bilden ist erlaubt (wie ⟦end()⟧), ihn zu <b>dereferenzieren</b> nicht. Schon ⟦a + 4⟧ zu bilden wäre UB.`);
C(12, 3, 'sizeof im Array-Parameter', R`int count(int a[]) {
    return sizeof(a) / sizeof(a[0]);
}

int main() {
    int a[10] = {};
    std::cout << sizeof(a) / sizeof(a[0]) << " "
              << count(a);
}`, { out: '10 2', lf: true },
  R`Als Parameter zerfällt das Array in einen Zeiger (8 Byte). ⟦sizeof(a)⟧ in der Funktion ist die Zeigergrösse: $8/4=2$. Darum übergibt man Arrays mit Länge oder als Zeigerpaar.`);
C(12, 2, 'Zeiger aus zwei Arrays subtrahieren', R`int a[3] = {1, 2, 3};
int b[3] = {4, 5, 6};
std::cout << &b[0] - &a[0];`, { err: 'ub' },
  R`Kompiliert und gibt eine Zahl aus – aber Zeigerdifferenzen sind nur <b>innerhalb desselben Arrays</b> definiert.`);
C(12, 4, 'int* q = *p', R`int x = 3;
int* p = &x;
int* q = *p;
std::cout << *q;`, { err: 'compile' },
  R`⟦*p⟧ ist ein ⟦int⟧ (3), kein Zeiger: «invalid conversion from int to int*». Gemeint war ⟦int* q = p;⟧`);

/* ================= 13 Dynamischer Speicher, Listen und Dreierregel ================= */
K(13, 'Definition', 4, 'new und delete', R`
⟪int* p = new int(5);       // ein int auf dem Heap
delete p;
int* a = new int[n];       // Array auf dem Heap
delete[] a;⟫
<p>Dynamischer Speicher lebt, <b>bis er freigegeben wird</b> (nicht bis zum Ende des Blocks). Jedes ⟦new⟧ braucht genau ein ⟦delete⟧, ⟦new[]⟧ ein ⟦delete[]⟧.</p>
<ul><li>vergessen → Speicherleck</li><li>doppelt / falsche Form / danach benutzen → undefiniertes Verhalten</li></ul>`);
K(13, 'Regel', 5, 'Dreierregel', R`
<p>Verwaltet eine Klasse eine Ressource (z. B. dynamischen Speicher), braucht sie alle drei:</p>
<ol><li><b>Destruktor</b> ⟦~T()⟧ – gibt frei,</li>
<li><b>Kopierkonstruktor</b> ⟦T(const T&)⟧ – tiefe Kopie,</li>
<li><b>Zuweisungsoperator</b> ⟦T& operator=(const T&)⟧ – alte Daten freigeben, tief kopieren, Selbstzuweisung beachten, ⟦*this⟧ zurückgeben.</li></ol>
<p>Fehlt einer, kopiert der Standard nur den <b>Zeiger</b> (flache Kopie) → doppelte Freigabe.</p>`);
K(13, 'Rezept', 3, 'Element am Ende einer verketteten Liste anhängen', R`
⟪void push_back(Node*& head, int v) {
    Node* n = new Node{v, nullptr};
    if (head == nullptr) { head = n; return; }   // leere Liste
    Node* p = head;
    while (p->next != nullptr) p = p->next;      // zum letzten Knoten
    p->next = n;
}⟫
<p>Kopf als ⟦Node*&⟧ übergeben, damit der Fall «leere Liste» den Kopf ändern kann. Laufzeit linear.</p>`);
K(13, 'Rezept', 2, 'Einfügen in einen binären Suchbaum (rekursiv)', R`
⟪void insert(Node*& t, int key) {
    if (t == nullptr)       t = new Node{key, nullptr, nullptr};
    else if (key < t->key)  insert(t->left, key);
    else                    insert(t->right, key);
}⟫
<p>Links stehen kleinere, rechts grössere Schlüssel. In-Order-Durchlauf (links, Knoten, rechts) liefert die Schlüssel sortiert.</p>`);
K(13, 'Konzept', 3, 'shared_ptr: wann wird das Objekt gelöscht?', R`
<p>Ein ⟦std::shared_ptr⟧ zählt, wie viele Zeiger sich ein Objekt teilen (⟦use_count()⟧). Das Objekt wird gelöscht, wenn der <b>letzte</b> ⟦shared_ptr⟧ verschwindet – kein ⟦delete⟧ nötig (und nicht erlaubt).</p>
<p>Fallen: <b>Zyklen</b> (A hält B, B hält A) werden nie freigegeben (Speicherleck); ⟦shared_ptr⟧ aus einer Stack-Adresse ruft am Ende ⟦delete⟧ darauf auf → UB. Erzeugen mit ⟦std::make_shared<T>(…)⟧.</p>`);
K(13, 'Rezept', 4, 'Zuweisungsoperator mit dynamischem Speicher schreiben', R`
⟪box& operator=(const box& o) {
    if (this != &o) {            // Selbstzuweisung a = a abfangen
        delete p;                // alte Daten freigeben
        p = new int(*o.p);       // tief kopieren
    }
    return *this;                // für a = b = c
}⟫
<p>Ohne die Prüfung würde ⟦a = a⟧ zuerst ⟦o.p⟧ (= ⟦p⟧) löschen und danach den gelöschten Speicher lesen → UB. Alternative: Copy-and-Swap.</p>`);
K(13, 'Code', 4, 'Was passiert? – zweimal delete', R`
<p><b>Undefiniertes Verhalten</b> (doppelte Freigabe, meist Absturz).</p>
<p>⟦q⟧ zeigt auf denselben Speicher wie ⟦p⟧. Nach ⟦delete p⟧ ist er freigegeben; ⟦delete q⟧ gibt ihn ein zweites Mal frei.</p>`, {
  q: R`int* p = new int(3);
int* q = p;
delete p;
delete q;
std::cout << "fertig";`, err: 'ub' });
K(13, 'Code', 5, 'Was passiert? – Klasse mit Zeiger kopieren', R`
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
K(13, 'Code', 4, 'Was passiert? – wann wird was aufgerufen?', R`
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
K(13, 'Code', 4, 'Was passiert? – verkettete Liste aufbauen', R`
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
C(13, 5, 'Zwei Zeiger, ein delete', R`struct rational { int n; int d; };

int main() {
    rational* t = new rational{1, 2};
    rational* s = t;
    delete s;
    std::cout << t->d;
}`, { err: 'ub' },
  R`Use after free: ⟦t⟧ und ⟦s⟧ zeigten auf dasselbe Objekt, das nun gelöscht ist. Nach ⟦delete⟧ zeigt ⟦t⟧ immer noch auf die alte Adresse.`);
C(13, 3, 'delete nullptr', R`int* p = nullptr;
delete p;
std::cout << "ok";`, { out: 'ok', ok: true },
  R`⟦delete⟧ auf einen Nullzeiger tut nichts. Darum setzt man nach ⟦delete⟧ gern ⟦p = nullptr;⟧.`);
C(13, 4, 'new[] und delete', R`int* a = new int[10];
delete a;`, { err: 'ub' },
  R`Was mit ⟦new[]⟧ angelegt wurde, muss mit ⟦delete[]⟧ freigegeben werden.`);
C(13, 3, 'delete auf lokale Variable', R`int x = 5;
int* p = &x;
delete p;`, { err: 'ub' },
  R`⟦delete⟧ nur für Speicher, der mit ⟦new⟧ angelegt wurde.`);
C(13, 4, 'new int(5) und p[3]', R`int* p = new int(5);
p[3] = 1;
delete p;`, { err: 'ub' },
  R`⟦new int(5)⟧ legt <b>ein</b> ⟦int⟧ mit Wert 5 an. Für ein Array mit 5 Elementen: ⟦new int[5]⟧ (und ⟦delete[]⟧).`);
C(13, 4, 'Dynamisches Array füllen', R`int n = 5;
int* a = new int[n];
for (int i = 0; i <= n; ++i)
    a[i] = i;
delete[] a;`, { err: 'ub' },
  R`⟦<=⟧ statt ⟦<⟧: ⟦a[5]⟧ liegt ausserhalb (heap-buffer-overflow).`);
C(13, 3, 'new in der Schleife', R`for (int i = 0; i < 3; ++i) {
    int* p = new int(i);
    std::cout << *p;
}`, { out: '012', lf: true },
  R`Die Ausgabe ist korrekt – aber die drei ⟦int⟧ werden nie freigegeben: <b>Speicherleck</b>. Kein Absturz, kein UB, keine Fehlermeldung.`);
C(13, 3, 'Zeiger neu setzen', R`int* p = new int(1);
p = new int(2);
std::cout << *p;
delete p;`, { out: '2', lf: true },
  R`Das erste ⟦int⟧ ist nicht mehr erreichbar und kann nie freigegeben werden (Speicherleck).`);
C(13, 4, 'Liste summieren', R`struct node {
    int value;
    node* next;
};

int main() {
    node c = {3, nullptr};
    node b = {2, &c};
    node a = {1, &b};
    int sum = 0;
    for (node* n = &a; n != nullptr; )
        sum += n->value;
    std::cout << sum;
}`, { err: 'loop' },
  R`Das Weiterschalten ⟦n = n->next⟧ fehlt: ⟦n⟧ bleibt beim ersten Knoten, keine Ausgabe. (Streng genommen läuft ⟦sum⟧ über – UB – aber «endlos» ist die erwartete Antwort.)`);
C(13, 5, 'Liste löschen', R`struct node {
    int value;
    node* next;
};

int main() {
    node* head = new node{1, new node{2, nullptr}};
    for (node* n = head; n != nullptr; n = n->next)
        delete n;
}`, { err: 'ub' },
  R`Das Inkrement ⟦n = n->next⟧ liest aus dem <b>gerade gelöschten</b> Knoten. Richtig: zuerst ⟦node* next = n->next;⟧ merken, dann ⟦delete n; n = next;⟧`);
C(13, 4, 'top() auf leerem Stack', R`struct node {
    int value;
    node* next;
};

int main() {
    node* topn = nullptr;   // leerer Stack
    std::cout << topn->value;
}`, { err: 'ub' },
  R`⟦topn->value⟧ ist ⟦(*topn).value⟧ – Dereferenzieren von ⟦nullptr⟧. Darum im Skript: ⟦// PRE: stack must be non-empty⟧ und ⟦assert(!empty())⟧.`);
C(13, 5, 'Stack kopieren', R`struct node {
    int value;
    node* next;
};

class stack {
    node* topn = nullptr;
public:
    void push(int v) { topn = new node{v, topn}; }
    void pop() {
        node* old = topn;
        topn = topn->next;
        delete old;
    }
    ~stack() { while (topn != nullptr) pop(); }
};

int main() {
    stack s1;
    s1.push(1);
    s1.push(2);
    stack s2 = s1;
    s1.pop();
    s2.pop();
}`, { err: 'ub' },
  R`Der automatische Kopierkonstruktor kopiert nur die Adresse ⟦topn⟧ (flache Kopie). Nach ⟦s1.pop()⟧ zeigt ⟦s2.topn⟧ auf einen gelöschten Knoten; spätestens die Destruktoren löschen dieselben Knoten doppelt. Dreierregel!`);
C(13, 4, 'Kopie mit = delete', R`class stack {
    int* data = nullptr;
public:
    stack() {}
    stack(const stack& s) = delete;
    stack& operator=(const stack& s) = delete;
};

int main() {
    stack s1;
    stack s2 = s1;
}`, { err: 'compile' },
  R`Kopieren ist verboten («use of deleted function»). So wird die flache Kopie in einen Kompilierfehler verwandelt – viel besser als UB.`);
C(13, 3, 'Stack an Funktion übergeben', R`class stack {
public:
    stack() {}
    stack(const stack& s) = delete;
};

void print(stack s) {}

int main() {
    stack s;
    print(s);
}`, { err: 'compile' },
  R`Pass by Value ruft den Kopierkonstruktor auf – und der ist gelöscht. Lösung: ⟦const stack&⟧.`);
C(13, 4, 'a = a', R`class box {
    int* p;
public:
    box(int v) : p(new int(v)) {}
    ~box() { delete p; }
    box& operator=(const box& o) {
        delete p;
        p = new int(*o.p);
        return *this;
    }
    int get() const { return *p; }
};

int main() {
    box a(5);
    a = a;
    std::cout << a.get();
}`, { err: 'ub' },
  R`Bei ⟦a = a⟧ sind ⟦*this⟧ und ⟦o⟧ dasselbe Objekt: ⟦delete p⟧ löscht auch ⟦o.p⟧, danach wird gelöschter Speicher gelesen. Lösung: ⟦if (this != &o)⟧.`);
C(13, 3, 'Zwei shared_ptr', R`std::shared_ptr<int> p = std::make_shared<int>(5);
std::shared_ptr<int> q = p;
*q = 7;
std::cout << *p << " " << p.use_count();`, { out: '7 2', ok: true },
  R`⟦p⟧ und ⟦q⟧ teilen sich <b>ein</b> Objekt; ⟦use_count()⟧ zählt 2. Gelöscht wird es automatisch, wenn der letzte ⟦shared_ptr⟧ verschwindet.`);
C(13, 2, 'shared_ptr im Kreis', R`struct node {
    std::shared_ptr<node> next;
};

int main() {
    auto a = std::make_shared<node>();
    auto b = std::make_shared<node>();
    a->next = b;
    b->next = a;
    std::cout << "fertig";
}`, { out: 'fertig', lf: true },
  R`Jeder Knoten hält den anderen am Leben (Referenzzähler nie 0) → nie freigegeben. Referenzzählung erkennt keine Zyklen: Speicherleck.`);
C(13, 2, 'shared_ptr auf lokale Variable', R`int x = 5;
std::shared_ptr<int> p(&x);`, { err: 'ub' },
  R`Am Ende ruft ⟦p⟧ ⟦delete &x⟧ auf – ⟦x⟧ wurde aber nicht mit ⟦new⟧ angelegt.`);

/* ================= 14 Vererbung und Polymorphie ================= */
K(14, 'Konzept', 3, 'Was bewirkt virtual?', R`
<p>Wird eine ⟦virtual⟧-Funktion über einen <b>Zeiger oder eine Referenz auf die Basisklasse</b> aufgerufen, entscheidet der <b>dynamische Typ</b> (das tatsächliche Objekt) zur Laufzeit, welche Version läuft.</p>
<p>Ohne ⟦virtual⟧ entscheidet der <b>statische Typ</b> (Typ des Zeigers). Bei Übergabe <b>per Wert</b> wird das Objekt abgeschnitten (Slicing) → immer Basisversion.</p>`);
K(14, 'Konzept', 2, 'Warum braucht eine Basisklasse einen virtuellen Destruktor?', R`
<p>Bei ⟦delete p;⟧ mit ⟦Base* p = new Derived;⟧ wird ohne ⟦virtual ~Base()⟧ nur der Destruktor von ⟦Base⟧ aufgerufen → undefiniertes Verhalten, Ressourcen von ⟦Derived⟧ werden nicht freigegeben.</p>`);
K(14, 'Konzept', 3, 'Rein virtuelle Funktion und abstrakte Klasse', R`
<p>⟦virtual void greet() = 0;⟧ ist <b>rein virtuell</b>: keine Implementierung in der Basisklasse. Eine Klasse mit mindestens einer solchen Funktion ist <b>abstrakt</b> und kann nicht instanziiert werden.</p>
<p>Eine abgeleitete Klasse bleibt abstrakt, bis sie <b>alle</b> rein virtuellen Funktionen überschreibt. Zeiger und Referenzen auf abstrakte Klassen sind erlaubt.</p>`);
K(14, 'Regel', 3, 'Konstruktor der Basisklasse aufrufen', R`
⟪class Cat : public Animal {
    int mice;
public:
    Cat(std::string n, int m) : Animal(n), mice(m) {}
};⟫
<p>Private Member der Basisklasse sind auch für die abgeleitete Klasse unzugänglich – initialisiert werden sie über den <b>Basiskonstruktor</b> in der Initialisierungsliste. Fehlt der Aufruf, wird der Default-Konstruktor der Basis verwendet (gibt es keinen → Kompilierfehler).</p>`);
K(14, 'Code', 3, 'Was passiert? – virtual, nicht-virtual und Slicing', R`
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
C(14, 3, 'name in Cat setzen', R`class Animal {
    std::string name;
public:
    Animal() {}
};

class Cat : public Animal {
    int mice;
public:
    Cat(std::string n, int m) : mice(m) {
        name = n;
    }
};
int main() { Cat c("Cheby", 3); }`, { err: 'compile' },
  R`Auch abgeleitete Klassen haben keinen Zugriff auf ⟦private⟧-Member der Basis. Lösung: ⟦Cat(…) : Animal(n), mice(m) {}⟧ (mit passendem Basiskonstruktor).`);
C(14, 3, 'Cat ohne Animal-Konstruktor', R`class Animal {
    std::string name;
public:
    Animal(std::string name) : name(name) {}
};

class Cat : public Animal {
    int mice;
public:
    Cat(std::string n, int m) : mice(m) {}
};
int main() { Cat c("Cheby", 3); }`, { err: 'compile' },
  R`Wird der Basiskonstruktor nicht explizit aufgerufen, versucht C++ ⟦Animal()⟧ – den es hier nicht gibt.`);
C(14, 4, 'greet ohne virtual', R`class Animal {
public:
    void greet() { std::cout << "Animal "; }
};

class Cat : public Animal {
public:
    void greet() { std::cout << "Miau "; }
};

int main() {
    Cat c;
    Animal* p = &c;
    c.greet();
    p->greet();
}`, { out: 'Miau Animal ', show: 'Miau Animal', lf: true },
  R`Ohne ⟦virtual⟧ entscheidet der <b>statische</b> Typ des Zeigers (⟦Animal*⟧). Mit ⟦virtual void greet()⟧ in ⟦Animal⟧ wäre die Ausgabe ⟦Miau Miau⟧.`);
C(14, 4, 'greet mit virtual', R`class Animal {
public:
    virtual void greet() { std::cout << "Animal "; }
    virtual ~Animal() {}
};

class Cat : public Animal {
public:
    void greet() override { std::cout << "Miau "; }
};

int main() {
    Cat c;
    Animal* p = &c;
    Animal& r = c;
    p->greet();
    r.greet();
}`, { out: 'Miau Miau ', show: 'Miau Miau', ok: true },
  R`Mit ⟦virtual⟧ entscheidet der <b>dynamische</b> Typ (das echte Objekt) – über Zeiger <b>und</b> Referenz.`);
C(14, 3, 'override ohne const', R`class Animal {
public:
    virtual void greet() const {
        std::cout << "Animal";
    }
};

class Cat : public Animal {
public:
    void greet() override { std::cout << "Miau"; }
};
int main() {}`, { err: 'compile' },
  R`Die Signatur muss exakt passen, inkl. ⟦const⟧: «marked override, but does not override». Ohne ⟦override⟧ wäre es still eine neue Funktion – und Aufrufe über ⟦Animal*⟧ würden die Basisversion nehmen (LF).`);
C(14, 3, 'Animal mit = 0 anlegen', R`class Animal {
public:
    virtual void greet() = 0;
};

int main() {
    Animal a;
}`, { err: 'compile' },
  R`⟦Animal⟧ ist abstrakt (rein virtuelle Funktion) und kann nicht instanziiert werden.`);
C(14, 3, 'Cat ohne greet', R`class Animal {
public:
    virtual void greet() = 0;
};

class Cat : public Animal {
public:
    void sleep() {}
};

int main() {
    Cat c;
}`, { err: 'compile' },
  R`Solange nicht alle rein virtuellen Funktionen überschrieben sind, bleibt auch ⟦Cat⟧ abstrakt.`);
C(14, 3, 'delete über Animal*', R`class Animal {
public:
    virtual void greet() {}
    ~Animal() {}
};

class Cat : public Animal {
    int* toys = new int[10];
public:
    ~Cat() { delete[] toys; }
};

int main() {
    Animal* p = new Cat();
    delete p;
}`, { err: 'ub' },
  R`Der Destruktor von ⟦Animal⟧ ist nicht ⟦virtual⟧: es wird nur ⟦~Animal()⟧ aufgerufen, ⟦~Cat()⟧ nie. Basisklassen mit virtuellen Funktionen brauchen einen ⟦virtual⟧-Destruktor.`);
C(14, 3, 'meow über Animal*', R`class Animal {
public:
    virtual ~Animal() {}
};

class Cat : public Animal {
public:
    void meow() { std::cout << "Miau"; }
};

int main() {
    Animal* p = new Cat();
    p->meow();
    delete p;
}`, { err: 'compile' },
  R`Der Compiler kennt nur den statischen Typ ⟦Animal*⟧, und ⟦Animal⟧ hat kein ⟦meow⟧. Welche Member es gibt, wird zur Kompilierzeit entschieden.`);

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
