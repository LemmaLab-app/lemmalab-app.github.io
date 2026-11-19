// LemmaLab – Kartenset Physik 1 (ETH, Skript Ensslin HS25 / Formelsammlung HS26).
// Von Hand gepflegt. Prioritäten aus der Analyse der alten Prüfungen (HS23–FS26 + Probeexam HS26):
//   5 = Kern (Stufe S), 4 = Wichtig (A), 3 = Solide (B), 2 = Ergänzung, 1 = Rand (C).
// Arten: Gesetz, Formel, Definition, Konzept (Konzeptfrage wie im Single-Choice-Teil), Rezept (Lösungsweg).
// Felder: fs:false = steht NICHT auf der Formelsammlung → selbst ergänzen; ex = Beispiele aus alten Prüfungen.
// Text: HTML, Mathematik in $…$ (im Text) bzw. $$…$$ (abgesetzt), gerendert mit KaTeX.
(function () {
'use strict';
const CH = {
  2: 'Kinematik des Massenpunktes',
  3: 'Dynamik des Massenpunktes',
  4: 'Arbeit und Energie',
  5: 'Drehbewegungen',
  6: 'Vielteilchensysteme und Stösse',
  7: 'Gravitation und Himmelsmechanik',
  8: 'Dynamik des starren Körpers',
  9: 'Schwingungen',
  10: 'Wärmelehre und Thermodynamik',
};
const L = [];
const K = (chap, kind, prio, title, sec, body, o = {}) => L.push({ chap, kind, prio, title, sec, body, ...o });
const R = String.raw;

/* ================= 2 Kinematik ================= */
K(2, 'Definition', 3, 'Geschwindigkeit und Beschleunigung', '2.4–2.5', R`
$$\vec v(t)=\dot{\vec r}(t)=\frac{d\vec r}{dt},\qquad \vec a(t)=\dot{\vec v}(t)=\ddot{\vec r}(t)$$
<p>Umgekehrt: $\vec v(t)=\vec v_0+\int_0^t\vec a\,dt'$, $\vec r(t)=\vec r_0+\int_0^t\vec v\,dt'$.</p>
<p>Im Diagramm: $v$ = Fläche unter $a(t)$, $a$ = Steigung von $v(t)$.</p>`);
K(2, 'Formel', 4, 'Gleichmässig beschleunigte Bewegung', '2.5', R`
$$x(t)=x_0+v_0t+\tfrac12at^2,\qquad v(t)=v_0+at$$
$$v^2=v_0^2+2a\,(x-x_0)\quad(\text{zeitfrei})$$`, { tip: 'Die zeitfreie Form spart oft das Auflösen nach t.' });
K(2, 'Formel', 4, 'Schiefer Wurf: Bahn', '2.5', R`
<p>Abwurf mit $v_0$ unter dem Winkel $\alpha$ (ohne Luftwiderstand):</p>
$$x(t)=v_0\cos\alpha\;t,\qquad y(t)=v_0\sin\alpha\;t-\tfrac12gt^2$$
$$v_x=v_0\cos\alpha=\text{konst.},\qquad v_y(t)=v_0\sin\alpha-gt$$
$$y(x)=x\tan\alpha-\frac{g\,x^2}{2v_0^2\cos^2\alpha}\quad\text{(Wurfparabel)}$$`, { fs: false, ex: 'HS23 A2, HS25 A2, FS25 A2' });
K(2, 'Formel', 4, 'Schiefer Wurf: Steigzeit, Gipfelhöhe, Wurfweite', '2.5', R`
$$t_\text{Steig}=\frac{v_0\sin\alpha}{g},\qquad h_\text{max}=\frac{v_0^2\sin^2\alpha}{2g}$$
$$x_W=\frac{v_0^2\sin 2\alpha}{g}\quad(\text{gleiche Höhe; max. bei }\alpha=45^\circ)$$`, { fs: false, tip: 'Gilt nur bei gleicher Abwurf- und Landehöhe.' });
K(2, 'Formel', 4, 'Kreisbewegung: Zentripetal- und Tangentialbeschleunigung', '2.5', R`
$$v=\omega r,\qquad a_Z=\frac{v^2}{r}=\omega^2r\ \ (\text{zum Zentrum}),\qquad a_T=\dot\omega\,r=\alpha r$$
$$|\vec a|=\sqrt{a_Z^2+a_T^2}=r\sqrt{\omega^4+\alpha^2}$$
<p>Bei Winkelbeschleunigung zeigt $\vec a$ nicht mehr zum Zentrum; $|\vec a|\propto r$.</p>`);
K(2, 'Konzept', 3, 'Waagrecht geworfener und fallen gelassener Ball: welcher landet zuerst?', '2.5', R`
<p><b>Gleichzeitig.</b> Die vertikale Bewegung ist unabhängig von der horizontalen: beide starten mit $v_y=0$ und haben $a_y=-g$.</p>`);
K(2, 'Konzept', 3, 'Betrag der Aufprallgeschwindigkeit beim Wurf von gleicher Höhe', '2.5', R`
<p>Hängt <b>nicht vom Abwurfwinkel</b> ab (Energieerhaltung):</p>
$$v_\text{Aufprall}=\sqrt{v_0^2+2gh}$$`);
K(2, 'Konzept', 3, 'Treffbedingung zweier bewegter Objekte', '2.5', R`
<p>Beide Koordinaten müssen <b>zur selben Zeit</b> übereinstimmen:</p>
$$x_1(t)=x_2(t)\quad\textbf{und}\quad y_1(t)=y_2(t)$$
<p>Aus einer Gleichung $t$ bestimmen, in die andere einsetzen.</p>`, { ex: 'HS25 A2 (Tontauben)' });
K(2, 'Konzept', 3, 'Zwei Lösungen der quadratischen Gleichung beim Wurf', '2.5', R`
<p>Beide Zeiten sind mathematisch Lösungen (Aufstieg bzw. Abstieg). Physikalisch sinnvolle Lösung <b>begründen</b>: z. B. trifft der Ball auf dem Weg nach oben → kleinere Zeit; Landung → positive, grössere Zeit.</p>`, { ex: 'HS23 2b' });
K(2, 'Konzept', 2, 'Optimaler Abwurfwinkel hangabwärts', '2.5', R`
<p>Auf ebenem Boden: $45^\circ$. Wirft man hangabwärts (Landepunkt tiefer), ist der optimale Winkel <b>kleiner als $45^\circ$</b>; hangaufwärts grösser.</p>`);

/* ================= 3 Dynamik ================= */
K(3, 'Gesetz', 3, 'Erstes Newtonsches Gesetz (Trägheitsprinzip)', '3.5', R`
<p>Ein Körper, auf den keine (resultierende) Kraft wirkt, bleibt in Ruhe oder bewegt sich gleichförmig geradlinig:</p>
$$\sum\vec F=0\iff\vec v=\text{konst.}$$
<p>Gilt nur in <b>Inertialsystemen</b>.</p>`);
K(3, 'Gesetz', 4, 'Zweites Newtonsches Gesetz (Aktionsprinzip)', '3.4', R`
$$\vec F=\frac{d\vec p}{dt},\qquad\vec p=m\vec v$$
<p>Bei konstanter Masse: $\vec F=m\vec a$. Bei veränderlicher Masse (Rakete) die Impulsform verwenden.</p>`);
K(3, 'Gesetz', 3, 'Drittes Newtonsches Gesetz (actio = reactio)', '3.6', R`
$$\vec F_{12}=-\vec F_{21}$$
<p>Die beiden Kräfte wirken auf <b>verschiedene Körper</b> – sie heben sich deshalb an einem Körper nie auf.</p>`);
K(3, 'Gesetz', 5, 'Impulserhaltung', '3.3', R`
<p>In einem <b>abgeschlossenen System</b> (keine äusseren Kräfte bzw. $\sum\vec F_\text{ext}=0$) ist der Gesamtimpuls erhalten:</p>
$$\vec P=\sum_i m_i\vec v_i=\text{konst.}$$
<p>Gilt komponentenweise: verschwindet nur $F_{\text{ext},x}$, ist nur $P_x$ erhalten.</p>`);
K(3, 'Formel', 3, 'Kraftstoss', '3.4', R`
$$\Delta\vec p=\int_{t_1}^{t_2}\vec F\,dt$$
<p>Ball prallt elastisch senkrecht an Wand: $|\Delta p|=2mv$.</p>`);
K(3, 'Formel', 3, 'Raketengleichung', '3.7', R`
<p>Ausströmgeschwindigkeit $u$ relativ zur Rakete, ohne äussere Kräfte:</p>
$$m\,dv=-u\,dm\quad\Longrightarrow\quad v=v_0+u\ln\frac{m_0}{m}$$
<p>Schub: $F=u\,|\dot m|$.</p>`, { fs: false });
K(3, 'Gesetz', 4, 'Haft- und Gleitreibung', '3.9', R`
$$F_H\le\mu_H F_N,\qquad F_G=\mu_G F_N,\qquad \mu_G<\mu_H$$
<p>Unabhängig von der Auflagefläche und (näherungsweise) von der Geschwindigkeit. Gleitreibung wirkt <b>entgegen der Relativbewegung</b>.</p>`, { tip: 'Haftreibung ist eine Zwangskraft: nur so gross wie nötig, höchstens μ_H·F_N.' });
K(3, 'Formel', 4, 'Schiefe Ebene mit Reibung', '3.9', R`
$$F_\parallel=mg\sin\alpha,\qquad F_N=mg\cos\alpha$$
$$\text{bleibt liegen}\iff\tan\alpha\le\mu_H,\qquad a=g(\sin\alpha-\mu_G\cos\alpha)\ \text{(rutschend)}$$`, { tip: 'Kontrolle mit α→0 und α→90°, sonst sind sin und cos schnell vertauscht.' });
K(3, 'Konzept', 3, 'Personenwaage auf schiefer Ebene', '3.9', R`
<p>Die Waage misst die Normalkraft $F_N=mg\cos\alpha$ → sie zeigt <b>weniger</b> an als $m$ (Anzeige $m\cos\alpha$).</p>`);
K(3, 'Formel', 3, 'Federkraft (Hooke)', '3.9', R`
$$F=-k\,x,\qquad E_\text{pot}=\tfrac12kx^2$$`);
K(3, 'Formel', 4, 'Zentrifugal- und Corioliskraft', '3.11', R`
<p>Im mit $\vec\omega$ rotierenden System (Geschwindigkeit $\vec v\,'$ relativ zum rotierenden System):</p>
$$\vec F_Z=-m\,\vec\omega\times(\vec\omega\times\vec r),\qquad |\vec F_Z|=m\omega^2r_\perp$$
$$\vec F_C=-2m\,\vec\omega\times\vec v\,'=2m\,\vec v\,'\times\vec\omega$$`, { ex: 'HS23 3e, FS24 3f, FS26 3' });
K(3, 'Formel', 3, 'Bewegungsgleichung im rotierenden Bezugssystem', '3.11', R`
$$m\vec a\,'=\vec F-2m\,\vec\omega\times\vec v\,'-m\,\vec\omega\times(\vec\omega\times\vec r)-m\,\dot{\vec\omega}\times\vec r$$
<p>Linear beschleunigtes System: Trägheitskraft $\vec F_T=-m\vec a_0$.</p>`);
K(3, 'Konzept', 4, 'Eigenschaften der Corioliskraft', '3.11', R`
<ul><li>Steht senkrecht auf $\vec\omega$ <b>und</b> auf $\vec v\,'$ → verrichtet <b>keine Arbeit</b>.</li>
<li>Verschwindet, wenn $\vec v\,'\parallel\vec\omega$ (oder $\vec v\,'=0$).</li>
<li>Richtung mit der Rechte-Hand-Regel bestimmen, in Zylinderkoordinaten angeben.</li></ul>`, { ex: 'FS24 3g' });
K(3, 'Konzept', 3, 'Masse gleitet radial auf rotierender Stange', '3.11', R`
<p>Bewegt sich $m$ mit $v$ radial nach aussen, während die Stange mit $\omega$ dreht, braucht es das Drehmoment</p>
$$\tau=\frac{d}{dt}\left(mr^2\omega\right)=2m\omega v r$$
<p>= Drehmoment der Corioliskraft $F_C=2m\omega v$ am Hebel $r$.</p>`, { ex: 'FS26 3f' });
K(3, 'Konzept', 2, 'Corioliskraft auf der Erde (Foucault-Pendel, Äquator)', '3.11', R`
<ul><li>In mittleren Breiten: für <b>jede</b> horizontale Bewegungsrichtung eine horizontale Coriolis-Komponente → Pendelebene dreht.</li>
<li>Am Äquator: Bewegung Nord–Süd ist $\parallel\vec\omega$ → <b>keine</b> Corioliskraft; Ost–West → Kraft vertikal.</li></ul>`);

/* ================= 4 Arbeit und Energie ================= */
K(4, 'Definition', 4, 'Arbeit und Leistung', '4.2', R`
$$W=\int_{\vec r_1}^{\vec r_2}\vec F\cdot d\vec r,\qquad P=\frac{dW}{dt}=\vec F\cdot\vec v$$
<p>Nur die Kraftkomponente <b>längs</b> des Weges verrichtet Arbeit. Bei konstanter Leistung: $W=Pt$.</p>`);
K(4, 'Gesetz', 4, 'Arbeitssatz (Energiesatz der Mechanik)', '4.3', R`
$$W_\text{gesamt}=\Delta E_\text{kin}=\tfrac12mv_2^2-\tfrac12mv_1^2$$`);
K(4, 'Definition', 5, 'Konservatives Kraftfeld', '4.4', R`
<p>Äquivalent (auf einfach zusammenhängendem Gebiet):</p>
<ul><li>$\int_1^2\vec F\cdot d\vec r$ ist <b>wegunabhängig</b></li>
<li>$\oint\vec F\cdot d\vec r=0$ für jeden geschlossenen Weg</li>
<li>$\nabla\times\vec F=0$</li>
<li>es gibt ein Potential: $\vec F=-\nabla E_\text{pot}$</li></ul>`, { ex: 'Konzeptfrage in fast jeder Prüfung' });
K(4, 'Formel', 4, 'Potentielle Energie: Beispiele', '4.4', R`
$$E_\text{pot}=mgh,\qquad E_\text{pot}=\tfrac12kx^2,\qquad E_\text{pot}=-\frac{GMm}{r}$$
$$\vec F=-\nabla E_\text{pot}\quad(\text{1D: }F=-\tfrac{dE_\text{pot}}{dx})$$`);
K(4, 'Gesetz', 5, 'Energieerhaltung', '4.5', R`
<p>Wirken nur konservative Kräfte:</p>
$$E_\text{kin}+E_\text{pot}=\text{konst.}$$
<p>Mit nichtkonservativen Kräften (Reibung): $\Delta E_\text{mech}=W_\text{nk}$ (meist $<0$).</p>`, { tip: 'Ansatz immer zuerst hinschreiben – gibt schon Punkte.' });
K(4, 'Konzept', 4, 'Arbeit auf geschlossenem Weg ist nicht null', '4.4', R`
<p>Dann muss eine <b>nichtkonservative</b> Kraft gewirkt haben. In einem nichtkonservativen Feld <b>kann</b> die Arbeit vom Weg abhängen.</p>`);
K(4, 'Konzept', 3, 'Bewegung entlang einer Äquipotentiallinie', '4.4', R`
<p>$\vec F=-\nabla E_\text{pot}$ steht senkrecht auf der Äquipotentiallinie, also senkrecht zur Bahn → die Kraft verrichtet <b>keine Arbeit</b>.</p>`);
K(4, 'Formel', 3, 'Gleichgewicht und Stabilität im Potential', '4.4', R`
$$\text{Gleichgewicht: }E_\text{pot}'(x_0)=0,\qquad \text{stabil: }E_\text{pot}''(x_0)>0$$
<p>Kleine Schwingungen um ein stabiles Minimum:</p>
$$\omega=\sqrt{\frac{E_\text{pot}''(x_0)}{m}}$$`, { fs: false, ex: 'FS25 A2 (Halfpipe)' });

/* ================= 5 Drehbewegungen ================= */
K(5, 'Definition', 5, 'Drehimpuls und Drehmoment', '5.2', R`
$$\vec L=\vec r\times\vec p,\qquad \vec M=\vec r\times\vec F,\qquad \frac{d\vec L}{dt}=\vec M$$
<p>Beide hängen vom gewählten <b>Bezugspunkt</b> ab.</p>`);
K(5, 'Gesetz', 5, 'Drehimpulserhaltung', '5.2', R`
<p>Ist das <b>äussere Drehmoment</b> bezüglich eines Punktes null, so ist der Drehimpuls bezüglich dieses Punktes erhalten:</p>
$$\vec M_\text{ext}=0\Longrightarrow\vec L=\text{konst.},\qquad J\omega=J'\omega'$$
<p>Zentralkräfte (Gravitation) haben bezüglich des Zentrums kein Drehmoment.</p>`, { ex: 'HS23 3f, HS25, FS16, HS13 A6' });
K(5, 'Konzept', 4, 'Pirouette: Arme anziehen', '5.2', R`
<p>$L=J\omega$ bleibt erhalten, $J$ sinkt → $\omega$ steigt. Die Rotationsenergie</p>
$$E=\frac{L^2}{2J}$$
<p><b>nimmt zu</b> – die Person verrichtet beim Anziehen Arbeit.</p>`);
K(5, 'Formel', 4, 'Analogie Translation – Rotation', '5.2 / 8.5', R`
<table class="pt"><tr><td>$x,\ v,\ a$</td><td>$\varphi,\ \omega,\ \alpha$</td></tr>
<tr><td>$m$</td><td>$J$</td></tr>
<tr><td>$\vec p=m\vec v$</td><td>$L=J\omega$</td></tr>
<tr><td>$F=ma$</td><td>$M=J\alpha$</td></tr>
<tr><td>$E=\tfrac12mv^2$</td><td>$E=\tfrac12J\omega^2$</td></tr>
<tr><td>$P=Fv$</td><td>$P=M\omega$</td></tr></table>`);
K(5, 'Konzept', 2, 'Riemenantrieb', '5.2', R`
<p>Der Riemen hat überall dieselbe Bahngeschwindigkeit:</p>
$$\omega_g r_g=\omega_k r_k$$
<p>Das kleine Rad dreht schneller.</p>`);

/* ================= 6 Vielteilchensysteme, Stösse ================= */
K(6, 'Definition', 4, 'Schwerpunkt', '6.2 / 8.2', R`
$$\vec R_S=\frac{1}{M}\sum_i m_i\vec r_i=\frac1M\int\vec r\,dm,\qquad M=\sum_i m_i$$`);
K(6, 'Gesetz', 4, 'Schwerpunktsatz', '6.2', R`
$$M\ddot{\vec R}_S=\sum\vec F_\text{ext}$$
<p>Der Schwerpunkt bewegt sich, als wäre die ganze Masse dort vereinigt und alle äusseren Kräfte griffen dort an. Innere Kräfte spielen keine Rolle.</p>`);
K(6, 'Konzept', 4, 'Gleicher Kraftstoss an verschiedenen Stellen einer Hantel', '6.2', R`
<p>Die <b>Schwerpunktsgeschwindigkeit ist gleich</b> ($\Delta\vec p$ gleich, Schwerpunktsatz). Nur die Rotation hängt vom Angriffspunkt ab.</p>`);
K(6, 'Formel', 3, 'Reduzierte Masse und Schwerpunktgeschwindigkeit', '6.6', R`
$$\mu=\frac{m_1m_2}{m_1+m_2},\qquad v_S=\frac{m_1v_1+m_2v_2}{m_1+m_2}$$
<p>Im Schwerpunktsystem ist der Gesamtimpuls null; beim elastischen Stoss kehren sich die Geschwindigkeiten dort nur um (Betrag bleibt).</p>`);
K(6, 'Konzept', 5, 'Was ist beim elastischen Stoss erhalten?', '6.8', R`
<p><b>Gesamtimpuls und gesamte kinetische Energie.</b> Nicht die Impulse oder Energien der einzelnen Teilchen.</p>
<p>Inelastisch: nur der Gesamtimpuls.</p>`);
K(6, 'Formel', 5, 'Elastischer Stoss in 1D', '6.8', R`
$$v_1'=\frac{(m_1-m_2)v_1+2m_2v_2}{m_1+m_2},\qquad v_2'=\frac{(m_2-m_1)v_2+2m_1v_1}{m_1+m_2}$$
<p>Kontrolle: $m_1=m_2$ → Geschwindigkeiten werden getauscht.</p>`, { fs: false });
K(6, 'Formel', 5, 'Vollkommen inelastischer Stoss', '6.8', R`
$$v'=\frac{m_1v_1+m_2v_2}{m_1+m_2},\qquad \Delta E_\text{Verlust}=\tfrac12\mu\,(v_1-v_2)^2$$
<p>Gleiche Massen, eine ruht: Verlust = <b>50 %</b> der kinetischen Energie.</p>`, { fs: false });
K(6, 'Konzept', 4, 'Elastischer zentraler Stoss gleicher Massen', '6.8', R`
<p>Die Geschwindigkeiten werden <b>getauscht</b>: die stossende Kugel bleibt stehen, die gestossene übernimmt $v$ (Newtonpendel, Pendelstoss).</p>`, { ex: 'FS24 4f, FS23' });
K(6, 'Konzept', 3, 'Leichter Ball prallt elastisch an schwere ruhende Kugel', '6.8', R`
<p>Ball kehrt mit fast gleichem Betrag um → behält fast die ganze Energie. Die schwere Kugel erhält fast den <b>doppelten Impuls</b> $2mv$, aber kaum Energie ($E=p^2/2M$).</p>
<p>Grenzfall Wand: Energie der Kugel erhalten, ihr <b>Impuls nicht</b>.</p>`);
K(6, 'Rezept', 5, 'Stoss in 2D', '6.8', R`
<ol><li>Achsen wählen, alle Geschwindigkeiten in $x$- und $y$-Komponenten zerlegen.</li>
<li>Impulserhaltung <b>getrennt</b> für $x$ und $y$ aufschreiben.</li>
<li>Elastisch? Dann zusätzlich $\sum E_\text{kin}$ erhalten. Sonst Energieverlust berechnen.</li>
<li>Übertragener Impuls $\Delta\vec p$; Winkel z. B. $\tan\theta=|\Delta p_x|/|\Delta p_y|$.</li></ol>`, { ex: 'HS23 A2 = Probeexam HS26' });
K(6, 'Formel', 3, 'Ballistisches Pendel', '6.8', R`
<p>Geschoss $m$ bleibt in Klotz $M$ stecken (inelastisch), dann Schwingen auf Höhe $h$ (Energie):</p>
$$v=\frac{m+M}{m}\sqrt{2gh}$$`, { fs: false });
K(6, 'Konzept', 3, 'Stoss mit Rotation', '6.8', R`
<p>Trifft ein Teilchen einen drehbaren Körper (Achse fest), ist der Impuls <b>nicht</b> erhalten (Achse übt Kraft aus), aber der <b>Drehimpuls um die Achse</b>. Frei schwebend: Impuls und Drehimpuls um den gemeinsamen Schwerpunkt.</p>`, { ex: 'FS24 2f, FS25 1.3' });

/* ================= 7 Gravitation ================= */
K(7, 'Gesetz', 5, 'Newtonsches Gravitationsgesetz', '7.1', R`
$$\vec F=-\frac{GMm}{r^2}\,\hat r,\qquad E_\text{pot}=-\frac{GMm}{r},\qquad g=\frac{GM}{R^2}$$
<p>Dreifacher Abstand → Kraft $\tfrac19$.</p>`);
K(7, 'Gesetz', 4, 'Keplersche Gesetze', '7.2', R`
<ol><li>Planeten bewegen sich auf <b>Ellipsen</b>, die Sonne steht in einem Brennpunkt.</li>
<li>Der Fahrstrahl überstreicht in gleichen Zeiten gleiche Flächen (= Drehimpulserhaltung).</li>
<li>$\dfrac{T^2}{a^3}=\dfrac{4\pi^2}{GM}$ gleich für alle Planeten.</li></ol>
<p>Falsch wäre z. B.: «Die Winkelgeschwindigkeit nimmt mit der Entfernung zu».</p>`);
K(7, 'Formel', 5, 'Kreisbahn', '7.2', R`
$$\frac{GMm}{r^2}=m\omega^2r=\frac{mv^2}{r}\ \Longrightarrow\ v=\sqrt{\frac{GM}{r}},\qquad T^2=\frac{4\pi^2}{GM}r^3$$`, { fs: false });
K(7, 'Formel', 4, 'Geostationäre Bahn', '7.2', R`
$$\omega=\frac{2\pi}{24\,\mathrm h},\qquad r_S=\sqrt[3]{\frac{GM}{\omega^2}}$$
<p>Über dem Äquator, Umlauf in Drehrichtung der Erde.</p>`, { fs: false, ex: 'FS24 A3, FS26 A3' });
K(7, 'Formel', 5, 'Energie auf Kreis- und Ellipsenbahn', '7.2–7.3', R`
$$\text{Kreis: }E_\text{kin}=\frac{GMm}{2r},\quad E=-\frac{GMm}{2r}=-E_\text{kin}$$
$$\text{Ellipse: }E=-\frac{GMm}{2a}\quad(a=\text{grosse Halbachse})$$`, { fs: false, ex: 'FS25 A4' });
K(7, 'Formel', 4, 'Vis-viva-Gleichung', '7.2', R`
$$v^2=GM\left(\frac2r-\frac1a\right)$$
<p>Folgt aus $E=\tfrac12mv^2-\tfrac{GMm}{r}=-\tfrac{GMm}{2a}$.</p>`, { fs: false });
K(7, 'Formel', 5, 'Fluchtgeschwindigkeit', '7.3', R`
$$E\ge0\iff v\ge v_F=\sqrt{\frac{2GM}{r}}=\sqrt2\,v_\text{Kreis}$$`, { fs: false, ex: 'FS25, FS26' });
K(7, 'Konzept', 4, 'Bahnform aus der Gesamtenergie', '7.3', R`
<p>$E<0$: Ellipse (Kreis) – gebunden<br>$E=0$: Parabel<br>$E>0$: Hyperbel</p>
<p>Komet mit $v>\sqrt{2GM/r}$ → Hyperbel.</p>`);
K(7, 'Formel', 4, 'Perihel und Aphel', '7.2', R`
$$r_Pv_P=r_Av_A\ (\text{Drehimpuls}),\qquad r_P+r_A=2a$$
<p>$E_\text{kin}$ ist im Aphel am kleinsten, im Perihel am grössten.</p>`);
K(7, 'Formel', 4, 'Hubarbeit im Gravitationsfeld', '7.1', R`
$$W=GMm\left(\frac1R-\frac1r\right)\quad(\text{von }R\text{ nach }r)$$
<p>Für $r-R\ll R$: $W\approx mgh$.</p>`, { fs: false });
K(7, 'Gesetz', 3, 'Gravitationsfeld einer homogenen Kugel', '7.4', R`
<p>Aussen ($r\ge R$): wie eine Punktmasse im Zentrum, $g=GM/r^2$.</p>
<p>Innen (Vollkugel): nur die Masse innerhalb $r$ zählt → $g(r)=\dfrac{GM}{R^3}\,r$ (linear). Hohlkugel innen: $g=0$.</p>`, { ex: 'FS11 (Loch durch die Erde → harmonische Schwingung)' });
K(7, 'Formel', 3, 'Effektives Potential', '7.3', R`
$$E_\text{pot,eff}(r)=\frac{L^2}{2mr^2}-\frac{GMm}{r}$$
<p>Minimum = Kreisbahn; Umkehrpunkte $r_P,r_A$ wo $E=E_\text{pot,eff}$.</p>`);
K(7, 'Formel', 3, 'Effektive Kraft auf rotierendem Planeten (Weltraumlift)', '7.1 / 3.11', R`
$$F_\text{eff}(r)=m\left(\omega^2r-\frac{GM}{r^2}\right)\quad(\text{nach aussen positiv})$$
<p>Null bei der geostationären Höhe. Arbeit für den Lift: $W=\int(-F_\text{eff})\,dr$.</p>`, { ex: 'FS26 A3' });
K(7, 'Konzept', 2, 'Was braucht man, um eine Kepler-Bahn festzulegen?', '7.3', R`
<p>$GM$, den Abstand $r$ und <b>beide</b> Geschwindigkeitskomponenten (radial und tangential). Mit nur $v_\perp$ ist z. B. der minimale Abstand nicht bestimmt. Aus der Bahnform allein ist die Lage der Sonne nicht eindeutig (zwei Brennpunkte).</p>`, { ex: 'FS26' });
K(7, 'Konzept', 2, 'Mond auf Kreisbahn im mitrotierenden System', '7.2 / 3.11', R`
<p>Dort ruht der Mond: Zentrifugalkraft und Gravitationskraft heben sich auf. Im Inertialsystem ist die Gravitation die Zentripetalkraft.</p>`);

/* ================= 8 Starrer Körper ================= */
K(8, 'Definition', 5, 'Trägheitsmoment', '8.5', R`
$$J=\sum_i m_i r_{\perp,i}^2=\int r_\perp^2\,dm=\int\rho\,r_\perp^2\,dV$$
<p>$r_\perp$ = Abstand zur <b>Drehachse</b> (nicht zum Ursprung).</p>`);
K(8, 'Rezept', 5, 'Trägheitsmoment per Integral', '8.5', R`
<ol><li>Koordinaten wählen: Scheibe/Ring → $dA=r\,dr\,d\varphi$; Zylinder → $dV=r\,dr\,d\varphi\,dz$; Kugel → $dV=r^2\sin\vartheta\,dr\,d\vartheta\,d\varphi$.</li>
<li>Dichte durch Masse ersetzen: $\rho=M/V$ bzw. $\sigma=M/A$.</li>
<li>$J=\rho\int r_\perp^2\,dV$, Grenzen sorgfältig (Halbzylinder: $\varphi\in[0,\pi]$).</li>
<li>In $M,R$ ausdrücken; Plausibilität: Vorfaktor zwischen 0 und 1 bei Achse durch den Körper.</li></ol>`, { ex: 'HS23 A4 (Ring), FS26 A4 (Halbzylinder)' });
K(8, 'Gesetz', 5, 'Satz von Steiner', '8.5.8', R`
$$J_A=J_S+Md^2$$
<p>$J_S$: Achse durch den <b>Schwerpunkt</b>, $d$: Abstand der parallelen Achse $A$.</p>`);
K(8, 'Konzept', 5, 'Steiner zwischen zwei Achsen, die nicht durch den Schwerpunkt gehen', '8.5.8', R`
<p>Immer über den Schwerpunkt gehen:</p>
$$J_S=J_A-Md_A^2,\qquad J_B=J_S+Md_B^2$$
<p>Direkt $J_B=J_A+M(d_B-d_A)^2$ ist <b>falsch</b>.</p>`, { ex: 'FS26 A4 (Schaukel)' });
K(8, 'Formel', 5, 'Trägheitsmoment: Stab', '8.5', R`
$$J_\text{Mitte}=\tfrac1{12}ML^2,\qquad J_\text{Ende}=\tfrac13ML^2$$
<p>Steiner: $\tfrac1{12}+\tfrac14=\tfrac13$.</p>`, { fs: false });
K(8, 'Formel', 5, 'Trägheitsmoment: Ring, Scheibe, Zylinder', '8.5', R`
<p>Achse = Symmetrieachse:</p>
$$\text{Ring/dünner Hohlzylinder: }MR^2,\qquad \text{Scheibe/Vollzylinder: }\tfrac12MR^2$$
$$\text{dicker Hohlzylinder: }\tfrac12M(R_1^2+R_2^2)$$`, { fs: false });
K(8, 'Formel', 5, 'Trägheitsmoment: Kugeln', '8.5', R`
$$\text{Vollkugel: }\tfrac25MR^2,\qquad \text{dünne Hohlkugel: }\tfrac23MR^2$$`, { fs: false });
K(8, 'Formel', 3, 'Trägheitsmoment: Quader und dünne Platte', '8.5', R`
<p>Achse durch den Schwerpunkt, senkrecht zur Fläche $a\times b$:</p>
$$J=\tfrac1{12}M(a^2+b^2)$$`, { fs: false });
K(8, 'Formel', 3, 'Schwerpunkte: Halbkreis, Halbkugel, Kegel', '8.2', R`
$$\text{Halbkreisfläche / Halbzylinder: }\frac{4R}{3\pi},\qquad \text{Halbkugel (voll): }\frac38R$$
$$\text{Kegel: }\frac h4\ \text{über der Grundfläche}$$`, { fs: false, ex: 'FS26 A4' });
K(8, 'Gesetz', 5, 'Bewegungsgleichung für Drehung um feste Achse', '8.5', R`
$$J\,\ddot\varphi=\sum M_\text{ext}$$
<p>Bei freier Bewegung: Schwerpunktsatz + $J_S\ddot\varphi=M_S$ (Momente bezüglich Schwerpunkt).</p>`);
K(8, 'Formel', 5, 'Kinetische Energie des starren Körpers', '8.5', R`
$$E_\text{kin}=\tfrac12Mv_S^2+\tfrac12J_S\omega^2=\tfrac12J_P\,\omega^2$$
<p>$J_P$: Trägheitsmoment um den momentanen Drehpunkt (z. B. Auflagepunkt beim Rollen).</p>`);
K(8, 'Formel', 5, 'Rollen ohne Gleiten auf der schiefen Ebene', '8.5', R`
$$v=\omega R,\qquad a=\frac{g\sin\alpha}{1+\frac{J}{mR^2}},\qquad v=\sqrt{\frac{2gh}{1+\frac{J}{mR^2}}}$$`, { fs: false, ex: 'FS24 A2, HS25, FS26' });
K(8, 'Konzept', 5, 'Wettrennen auf der schiefen Ebene', '8.5', R`
<p>Entscheidend ist nur $J/(mR^2)$ – <b>nicht</b> Masse oder Radius:</p>
<p>Gleiten (0) &gt; Vollkugel ($\tfrac25$) &gt; Vollzylinder ($\tfrac12$) &gt; Hohlkugel ($\tfrac23$) &gt; Ring/Hohlzylinder (1).</p>
<p>Reibungsfrei gleitende Kugel ist vor der rollenden unten.</p>`);
K(8, 'Konzept', 3, 'Geschwindigkeit des Berührpunkts beim Rollen', '8.5', R`
<p>$v=0$: Der Berührpunkt ist momentaner Drehpunkt (Momentanpol). Der oberste Punkt hat $2v_S$.</p>`);
K(8, 'Konzept', 3, 'Kinetische Energie einer rollenden Vollkugel', '8.5', R`
$$E=\tfrac12mv^2+\tfrac12\cdot\tfrac25mR^2\cdot\frac{v^2}{R^2}=\tfrac7{10}mv^2$$
<p>Unabhängig vom Radius.</p>`);
K(8, 'Konzept', 3, 'Reifen soll schneller die Ebene hinunterrollen', '8.5', R`
<p>Zusätzliche Masse <b>in die Achse</b> setzen: senkt $J/(mR^2)$. Gesamtmasse allein verändern nützt nichts.</p>`);
K(8, 'Konzept', 3, 'Vollkugel vs. Hohlkugel gleicher Masse und Radius', '8.5', R`
<p>$J_\text{voll}<J_\text{hohl}$ für <b>jede</b> gemeinsame Achse: der Steiner-Term $Md^2$ ist für beide gleich.</p>`);
K(8, 'Rezept', 4, 'Statik', '8.4', R`
<ol><li>Alle Kräfte einzeichnen: Gewicht im Schwerpunkt, Normal-, Reibungs-, Seilkräfte.</li>
<li>$\sum\vec F=0$ in zwei Richtungen.</li>
<li>$\sum\vec M=0$ um einen geschickten Punkt (dort, wo Unbekannte angreifen).</li>
<li>Haften prüfen: $F_R\le\mu_HF_N$.</li></ol>`, { fs: false, ex: 'FS25 A3, HS25 A3, HS23 A3a' });
K(8, 'Formel', 4, 'Kippen oder Rutschen?', '8.4', R`
<p>Kiste (Breite $L$, Höhe $h$, Schwerpunkt in der Mitte) auf schiefer Ebene:</p>
$$\text{kippt, wenn }\tan\alpha>\frac Lh,\qquad \text{rutscht, wenn }\tan\alpha>\mu_H$$
<p>Unmittelbar vor dem Kippen greift die Normalkraft an der <b>Kippkante</b> an.</p>`, { fs: false, ex: 'FS25 A3' });
K(8, 'Konzept', 3, 'Leiter an glatter Wand: Person steigt hoch', '8.4', R`
<p>Die Wandkraft <b>und</b> die benötigte Haftreibung am Boden nehmen zu (grösserer Hebel des Gewichts um den Fusspunkt). Die Normalkraft am Boden bleibt gleich.</p>`, { ex: 'FS26' });
K(8, 'Konzept', 2, 'Hebel mit Massen m und 3m an den Enden', '8.4', R`
<p>Schwerpunkt bzw. Auflagepunkt: $\tfrac l4$ neben der Mitte, zur schweren Seite hin ($\tfrac34 l$ von $m$).</p>`);
K(8, 'Definition', 2, 'Trägheitstensor und Hauptachsen', '8.5', R`
$$\vec L=\mathbf J\,\vec\omega,\qquad J_{ij}=\int\left(r^2\delta_{ij}-x_ix_j\right)dm$$
<p>Bezüglich der Hauptachsen ist $\mathbf J$ diagonal; nur dann gilt $\vec L\parallel\vec\omega$.</p>`);

/* ================= 9 Schwingungen ================= */
K(9, 'Rezept', 5, 'Schwingungsaufgabe', '9.2', R`
<ol><li>Freikörperbild bzw. Drehmoment um den Aufhängepunkt: $m\ddot x=\sum F$ oder $J\ddot\varphi=\sum M$ – zuerst die <b>exakte</b> DGL.</li>
<li>Kleinwinkelnäherung $\sin\varphi\approx\varphi$ → $\ddot\varphi+\omega^2\varphi=0$, $\omega$ ablesen.</li>
<li>$\varphi(t)=A\cos\omega t+B\sin\omega t$, Konstanten aus Anfangsbedingungen.</li>
<li>Skizze: $\dot\varphi$ ist um $\pi/2$ verschoben, Amplitude $\omega\varphi_0$.</li></ol>`, { ex: 'FS24 A4, HS23 A4, FS26 A4' });
K(9, 'Formel', 5, 'Harmonischer Oszillator', '9.2', R`
$$m\ddot x=-kx\iff\ddot x+\omega^2x=0,\qquad \omega=\sqrt{\frac km}$$
$$x(t)=A\cos(\omega t+\phi),\qquad T=\frac{2\pi}{\omega}$$`);
K(9, 'Formel', 5, 'Fadenpendel', '9.2', R`
$$ml\ddot\varphi=-mg\sin\varphi\ \approx -mg\varphi\quad\Longrightarrow\quad\omega=\sqrt{\frac gl}$$
<p>Unabhängig von der Masse. Auf dem Mond (kleineres $g$) → Frequenz kleiner.</p>`);
K(9, 'Formel', 5, 'Physikalisches Pendel', '9.2', R`
$$J_O\ddot\varphi=-Mgd\sin\varphi\quad\Longrightarrow\quad\omega=\sqrt{\frac{Mgd}{J_O}}$$
<p>$d$: Abstand Drehpunkt–Schwerpunkt, $J_O$ um den Drehpunkt (Steiner!). Reduzierte Pendellänge: $l_\text{red}=\dfrac{J_O}{Md}$.</p>`, { fs: false, ex: 'HS23 4e, FS26 A4' });
K(9, 'Formel', 4, 'Energie im harmonischen Oszillator', '9.2', R`
$$E=\tfrac12kA^2=\tfrac12mv_\text{max}^2=\tfrac12m\omega^2A^2$$
<p>$E_\text{kin}$ und $E_\text{pot}$ schwanken mit der <b>doppelten</b> Frequenz $2\omega$.</p>`);
K(9, 'Formel', 4, 'Federn parallel und in Serie', '9.2', R`
$$\text{parallel (oder beidseitig an der Masse): }k=k_1+k_2$$
$$\text{Serie: }\frac1k=\frac1{k_1}+\frac1{k_2}\ \Rightarrow\ k=\frac{k_1k_2}{k_1+k_2}$$`, { fs: false });
K(9, 'Konzept', 3, 'Masse plötzlich an eine Feder gehängt und losgelassen', '9.2', R`
<p>Maximale Dehnung = <b>doppelte</b> statische Dehnung $2mg/k$: Schwingung um die neue Gleichgewichtslage $mg/k$ mit Amplitude $mg/k$.</p>`, { ex: 'FS26' });
K(9, 'Konzept', 2, 'Federkonstante verdoppeln bei gleicher Amplitude', '9.2', R`
<p>$\omega$ wird $\sqrt2$-mal grösser, die Energie $\tfrac12kA^2$ verdoppelt sich.</p>`, { ex: 'HS25' });
K(9, 'Formel', 4, 'Gedämpfte Schwingung: die drei Fälle', '9.3', R`
$$\ddot x+2\rho\dot x+\omega_0^2x=0$$
<p><b>Schwach</b> ($\rho<\omega_0$): $x=Ae^{-\rho t}\cos(\omega t+\phi)$, $\omega=\sqrt{\omega_0^2-\rho^2}<\omega_0$ → Periode länger.</p>
<p><b>Kritisch</b> ($\rho=\omega_0$): $x=(A+Bt)e^{-\rho t}$.</p>
<p><b>Kriechfall</b> ($\rho>\omega_0$): $x=e^{-\rho t}\left(Ae^{\lambda t}+Be^{-\lambda t}\right)$, $\lambda=\sqrt{\rho^2-\omega_0^2}$.</p>`);
K(9, 'Konzept', 3, 'Kritisch gedämpft mit x(0) = 0 und Anfangsgeschwindigkeit v₀', '9.3', R`
$$x(t)=v_0\,t\,e^{-\rho t}$$
<p>Maximum bei $t=1/\rho$.</p>`, { fs: false, ex: 'FS26' });
K(9, 'Formel', 3, 'Gütefaktor', '9.3', R`
$$Q\approx\frac{\omega_0}{2\rho}$$
<p>Grosse Güte = schwache Dämpfung = schmale, hohe Resonanzkurve.</p>`, { fs: false, ex: 'FS24' });
K(9, 'Formel', 4, 'Erzwungene Schwingung: Amplitude und Phase', '9.4', R`
$$\ddot x+2\rho\dot x+\omega_0^2x=\frac{F_0}{m}\cos\Omega t,\qquad x_\text{stat}=A\cos(\Omega t+\phi)$$
$$A(\Omega)=\frac{F_0/m}{\sqrt{(\omega_0^2-\Omega^2)^2+4\rho^2\Omega^2}},\qquad \tan\phi=\frac{-2\rho\Omega}{\omega_0^2-\Omega^2}$$`);
K(9, 'Konzept', 4, 'Phase zwischen Kraft und Auslenkung', '9.4', R`
<p>$\Omega\ll\omega_0$: $\phi\approx0$ (in Phase)<br>$\Omega=\omega_0$: $\phi=-\pi/2$<br>$\Omega\gg\omega_0$: $\phi\to-\pi$ (gegenphasig)</p>`);
K(9, 'Formel', 3, 'Amplituden- und Leistungsresonanz', '9.4', R`
$$\Omega_\text{res}=\sqrt{\omega_0^2-2\rho^2}<\omega_0\quad(\text{max. Amplitude, dort }|\phi|<90^\circ)$$
<p>Die dissipierte Leistung ist maximal bei $\Omega=\omega_0$.</p>`, { fs: false, ex: 'HS23, FS26' });
K(9, 'Konzept', 2, 'Schwingungsisolierung', '9.4', R`
<p>Die übertragene Kraft ist klein, wenn $\omega_0\ll\Omega$ (weiche Lagerung). Ohne Dämpfung: Verhältnis $\dfrac{\omega_0^2}{\Omega^2-\omega_0^2}$; z. B. $<10\,\%$ ⟹ $\omega_0<\Omega/\sqrt{11}$.</p>`, { ex: 'HS25 A4' });
K(9, 'Formel', 3, 'Gekoppelte Pendel: Normalschwingungen', '9.7', R`
<p>Zwei gleiche Oszillatoren ($m,k$), gekoppelt mit Feder $\kappa$:</p>
$$q_1=x_1+x_2:\ \omega_1=\sqrt{\frac km},\qquad q_2=x_1-x_2:\ \omega_2=\sqrt{\frac{k+2\kappa}{m}}$$
<p>$x_1+x_2$ beschreibt die Schwerpunktschwingung (Kopplungsfeder ungedehnt).</p>`);
K(9, 'Formel', 2, 'Schwebung', '9.5', R`
$$\cos\omega_1t+\cos\omega_2t=2\cos\left(\tfrac{\omega_1-\omega_2}2t\right)\cos\left(\tfrac{\omega_1+\omega_2}2t\right)$$
<p>Schwebungsfrequenz (hörbar): $f_S=|f_1-f_2|$.</p>`);

/* ================= 10 Thermodynamik ================= */
K(10, 'Gesetz', 5, 'Zustandsgleichung des idealen Gases', '10.6', R`
$$pV=nRT=Nk_BT,\qquad R=N_Ak_B\approx8.31\,\tfrac{\mathrm J}{\mathrm{mol\,K}}$$
<p>Bei fester Gasmenge: $\dfrac{pV}{T}=\text{konst.}$ Temperaturen immer in <b>Kelvin</b>.</p>`);
K(10, 'Gesetz', 5, 'Erster Hauptsatz', '10.5', R`
$$dU=\delta Q^{\swarrow}+\delta W^{\swarrow}$$
<p>$\swarrow$ = dem Gas <b>zugeführt</b>. Am Gas verrichtete Arbeit: $\delta W^{\swarrow}=-p\,dV$.</p>`);
K(10, 'Konzept', 5, 'Vorzeichenkonvention bei Arbeit und Wärme', '10.5', R`
<p>Formelsammlung: $W^{\swarrow}$ = am Gas verrichtet (Kompression: $W^{\swarrow}>0$). $W^{\nearrow}=-W^{\swarrow}$ = vom Gas verrichtet.</p>
<p>In der Aufgabe <b>immer prüfen, welcher Pfeil verlangt ist</b> (FS26 wollte $W^{\nearrow}$).</p>`);
K(10, 'Formel', 5, 'Innere Energie und Wärmekapazitäten', '10.6', R`
$$U=\frac f2nRT,\qquad C_V=\frac f2R,\qquad C_p=C_V+R,\qquad \kappa=\frac{C_p}{C_V}=\frac{f+2}{f}$$
<p>$\Delta U=nC_V\Delta T$ für <b>jeden</b> Prozess des idealen Gases.</p>`);
K(10, 'Formel', 4, 'Freiheitsgrade', '10.6', R`
<p>1-atomig: $f=3$, $\kappa=\tfrac53$<br>2-atomig (Raumtemperatur, Vibration eingefroren): $f=5$, $\kappa=\tfrac75$</p>
<p>Mittlere Energie pro Molekül $\tfrac f2k_BT$, davon Translation $\tfrac32k_BT$.</p>`, { ex: 'FS24 A5' });
K(10, 'Formel', 5, 'Isochore Zustandsänderung', '10.6', R`
$$V=\text{konst.}:\quad W^{\swarrow}=0,\qquad Q^{\swarrow}=\Delta U=nC_V\Delta T,\qquad \frac{p_A}{T_A}=\frac{p_B}{T_B}$$`);
K(10, 'Formel', 5, 'Isobare Zustandsänderung', '10.6', R`
$$p=\text{konst.}:\quad W^{\swarrow}=-p\,\Delta V,\qquad \Delta U=nC_V\Delta T,\qquad Q^{\swarrow}=nC_p\Delta T$$
<p>$Q\ne\Delta U$! Wärme über $Q^{\swarrow}=\Delta U-W^{\swarrow}$ oder $nC_p\Delta T$.</p>`, { ex: 'HS23 5d' });
K(10, 'Formel', 5, 'Isotherme Zustandsänderung', '10.6', R`
$$T=\text{konst.}:\quad\Delta U=0,\qquad W^{\swarrow}=-nRT\ln\frac{V_2}{V_1},\qquad Q^{\swarrow}=-W^{\swarrow}=nRT\ln\frac{V_2}{V_1}$$`);
K(10, 'Formel', 5, 'Adiabatische Zustandsänderung', '10.6', R`
$$Q=0:\quad W^{\swarrow}=\Delta U=nC_V\Delta T$$
$$pV^\kappa=\text{konst.},\qquad TV^{\kappa-1}=\text{konst.},\qquad T^\kappa p^{1-\kappa}=\text{konst.}$$
<p>Kein Wärmeaustausch, aber Arbeit!</p>`);
K(10, 'Konzept', 4, 'Freie Expansion eines idealen Gases ins Vakuum', '10.6', R`
<p>$W=0$, $Q=0$ ⟹ $\Delta U=0$ ⟹ <b>$T$ bleibt gleich</b>. Irreversibel: $\Delta S=nR\ln\dfrac{V_2}{V_1}>0$ (wie für die reversible Isotherme zwischen denselben Zuständen).</p>`);
K(10, 'Konzept', 4, 'Isotherme Kompression: Vorzeichen', '10.6', R`
$$\Delta U=0,\qquad W^{\swarrow}>0,\qquad Q^{\swarrow}<0\ (\text{Gas gibt Wärme ab})$$`);
K(10, 'Konzept', 3, 'Isobare Expansion bzw. isochore Druckerhöhung', '10.6', R`
<p>In beiden Fällen steigt $T$, also $\Delta U\ne0$ und $Q^{\swarrow}\ne0$ (Wärme zugeführt).</p>`);
K(10, 'Konzept', 2, 'Ideales Gas bei konstanter Temperatur: Druck steigt', '10.6', R`
<p>$p\propto n/V\propto\rho$: die <b>Dichte steigt</b>.</p>`);
K(10, 'Rezept', 5, 'Kreisprozess', '10.5–10.7', R`
<ol><li>Tabelle A, B, C, D mit $p,V,T$; Bekanntes eintragen.</li>
<li>Fehlendes mit $pV=nRT$, Isotherme $pV=$ konst., Adiabate $pV^\kappa=$ konst.</li>
<li>Pro Schritt: $\Delta U=nC_V\Delta T$, $W^{\swarrow}$, dann $Q^{\swarrow}=\Delta U-W^{\swarrow}$.</li>
<li>Kontrolle: $\sum\Delta U=0$ über den Zyklus.</li>
<li>$\eta=|W_\text{netto}|/Q_\text{zu}$ (nur positive Wärmen).</li></ol>`, { fs: false, ex: 'HS23 A5, FS25 A5, HS25 A5, FS26 A5 – jede Prüfung ≈ 10 Punkte' });
K(10, 'Konzept', 5, 'Umlaufsinn im p-V-Diagramm', '10.7', R`
<p><b>Im Uhrzeigersinn</b>: Gas verrichtet Netto-Arbeit → Wärmekraftmaschine (Motor).<br>
<b>Gegen den Uhrzeigersinn</b>: Arbeit wird zugeführt → Kühlschrank/Wärmepumpe.</p>
<p>Fläche im Diagramm = $|W_\text{netto}|$.</p>`, { fs: false });
K(10, 'Formel', 5, 'Wirkungsgrad einer Wärmekraftmaschine', '10.7', R`
$$\eta=\frac{|W_\text{netto}|}{Q_\text{zu}}=1-\frac{|Q_\text{ab}|}{Q_\text{zu}}$$
<p>$Q_\text{zu}$: Summe nur der <b>zugeführten</b> (positiven) Wärmen.</p>`, { fs: false });
K(10, 'Formel', 5, 'Carnot-Wirkungsgrad', '10.7', R`
$$\eta_C=1-\frac{T_K}{T_W}$$
<p>Obere Schranke für jede Wärmekraftmaschine zwischen $T_W$ und $T_K$. <b>Kelvin</b> einsetzen ($926.85\,^\circ\mathrm C=1200\,\mathrm K$).</p>`, { ex: 'FS25, HS25 A5' });
K(10, 'Formel', 4, 'Wärmepumpe und Kältemaschine', '10.7', R`
$$\varepsilon_\text{WP}=\frac{|Q_W|}{W}\le\frac{T_W}{T_W-T_K},\qquad \varepsilon_\text{KM}=\frac{|Q_K|}{W}\le\frac{T_K}{T_W-T_K}$$
<p>Leistungszahlen können grösser als 1 sein.</p>`);
K(10, 'Formel', 4, 'Otto-Kreisprozess', '10.7', R`
<p>Zwei Adiabaten + zwei Isochoren, Verdichtung $r=V_\text{max}/V_\text{min}$:</p>
$$\eta_\text{Otto}=1-\frac{1}{r^{\kappa-1}}=1-r^{1-\kappa}$$`, { fs: false, ex: 'FS26 A5' });
K(10, 'Gesetz', 4, 'Zweiter Hauptsatz und Entropie', '10.7', R`
$$dS=\frac{\delta Q_\text{rev}^{\swarrow}}{T},\qquad \Delta S\ge0\ \text{im abgeschlossenen System}$$
<p>Wärme fliesst nicht von selbst von kalt nach warm; keine periodische Maschine wandelt Wärme vollständig in Arbeit um.</p>`);
K(10, 'Formel', 5, 'Entropieänderung des idealen Gases', '10.7', R`
$$\Delta S=nC_V\ln\frac{T_2}{T_1}+nR\ln\frac{V_2}{V_1}$$
<p>Isotherm: $nR\ln\tfrac{V_2}{V_1}$; isobar: $nC_p\ln\tfrac{T_2}{T_1}$; isochor: $nC_V\ln\tfrac{T_2}{T_1}$; adiabatisch reversibel: $0$.</p>`, { fs: false, ex: 'FS24 A5, FS25 A5' });
K(10, 'Formel', 4, 'Entropie eines Wärmebads', '10.7', R`
$$\Delta S_\text{Bad}=\frac{Q_\text{Bad}}{T_\text{Bad}}$$
<p>Vorzeichen aus Sicht des Bads: gibt es Wärme ans Gas ab, ist $Q_\text{Bad}<0$.</p>`, { fs: false });
K(10, 'Konzept', 4, 'Zustandsgrössen vs. Prozessgrössen', '10.5', R`
<p>$p,V,T,U,S$ hängen nur vom Zustand ab, <b>nicht vom Weg</b>. $Q$ und $W$ hängen vom Weg ab.</p>
<p>Z. B. haben isotherm-reversible und freie Expansion zwischen denselben Zuständen dasselbe $\Delta p$ und $\Delta S$.</p>`, { ex: 'FS26' });
K(10, 'Formel', 3, 'Wärmekapazität und Mischtemperatur', '10.3', R`
$$Q=mc\,\Delta T=nC\,\Delta T$$
<p>Mischung ohne Verluste: $\sum m_ic_i(T_m-T_i)=0$.</p>`);
K(10, 'Formel', 2, 'Latente Wärme', '10.8', R`
$$Q=m\,L$$
<p>Während des Phasenübergangs (Sieden, Schmelzen) bleibt $T$ konstant – die ganze Wärme geht in den Übergang.</p>`, { ex: 'FS26' });
K(10, 'Formel', 2, 'Van-der-Waals-Gas', '10.8', R`
$$\left(p+\frac{an^2}{V^2}\right)(V-nb)=nRT$$
<p>$a$: Anziehung (Kohäsionsdruck), $b$: Eigenvolumen (Kovolumen). Grosse Abweichung vom idealen Gas bei tiefen $T$ und hoher Dichte.</p>`);
K(10, 'Gesetz', 2, 'Nullter und dritter Hauptsatz', '10.4 / 10.9', R`
<p><b>0. HS:</b> Sind A und B je mit C im thermischen Gleichgewicht, dann auch miteinander → Temperatur ist wohldefiniert.</p>
<p><b>3. HS:</b> Der absolute Nullpunkt ist nicht erreichbar; $S\to$ konst. für $T\to0$.</p>`);

/* ---------- Abschluss: Nummern, IDs, Suchtext ---------- */
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const plain = s => s.replace(/<[^>]+>/g, ' ').replace(/\$+/g, ' ').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}^_\\]/g, ' ').replace(/\s+/g, ' ').trim();
const per = {}, seen = new Set();
window.CARDS = L.map((c, i) => {
  per[c.chap] = (per[c.chap] || 0) + 1;
  let id = 'phy-' + slug(c.title);
  while (seen.has(id)) id += '-2';
  seen.add(id);
  return {
    id, kind: c.kind, nr: c.chap + '.' + per[c.chap], chap: c.chap, chapTitle: CH[c.chap], sec: c.sec,
    star: false, title: c.title, titled: true, prio: c.prio, tip: c.tip || '',
    body: c.body.trim(), fs: c.fs !== false, ex: c.ex || '',
    img: null, page: null, proofP: null, proofH: null,
    text: c.title + ' ' + plain(c.body), ord: i,
  };
});
window.CHAPTERS = CH;
window.LOGIC = {};
})();
