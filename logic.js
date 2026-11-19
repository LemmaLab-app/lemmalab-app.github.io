// Prädikatenlogische Formulierungen (aus tools/logic.py erzeugt). Format: id -> [[Beschriftung, LaTeX], …]
window.LOGIC = {
"Lemma-1.3": [
[
"",
"\\forall n\\in\\mathbb N:\\ \\sum_{k=1}^{n} k^2=\\frac{n^3}{3}+\\frac{n^2}{2}+\\frac{n}{6}"
]
],
"Definition-1.22": [
[
"disjunkt",
"A,B \\text{ disjunkt} :\\Longleftrightarrow A\\cap B=\\varnothing \\;\\Longleftrightarrow\\; \\neg\\,\\exists x:\\ (x\\in A\\wedge x\\in B)"
],
[
"paarweise disjunkt",
"\\forall A_1,A_2\\in\\mathcal A:\\ A_1\\neq A_2 \\implies A_1\\cap A_2=\\varnothing"
]
],
"Definition-1.23": [
[
"",
"X\\times Y=\\{(x,y)\\mid x\\in X\\wedge y\\in Y\\},\\qquad (x,y)=(x',y')\\iff x=x'\\wedge y=y'"
]
],
"Definition-1.27": [
[
"",
"Q\\in\\mathcal P(X)\\iff Q\\subseteq X\\iff \\forall x\\in Q:\\ x\\in X"
]
],
"Definition-1.31": [
[
"Funktion",
"f:X\\to Y \\text{ Funktion}:\\Longleftrightarrow \\forall x\\in X\\ \\exists!\\,y\\in Y:\\ y=f(x)"
]
],
"Definition-1.33": [
[
"injektiv",
"\\forall x_1,x_2\\in X:\\ f(x_1)=f(x_2)\\implies x_1=x_2"
],
[
"surjektiv",
"\\forall y\\in Y\\ \\exists x\\in X:\\ f(x)=y"
],
[
"bijektiv",
"\\forall y\\in Y\\ \\exists!\\,x\\in X:\\ f(x)=y"
]
],
"Definition-1.36": [
[
"",
"f^{-1}:Y\\to X,\\qquad \\forall y\\in Y\\ \\forall x\\in X:\\ \\big(f^{-1}(y)=x\\iff f(x)=y\\big)"
]
],
"Definition-1.37": [
[
"",
"g\\circ f:X\\to Z,\\qquad \\forall x\\in X:\\ (g\\circ f)(x)=g(f(x))"
]
],
"Lemma-1.40": [
[
"(i)",
"f,g \\text{ injektiv}\\implies g\\circ f \\text{ injektiv}"
],
[
"(ii)",
"f,g \\text{ surjektiv}\\implies g\\circ f \\text{ surjektiv}"
],
[
"(iii)",
"f,g \\text{ bijektiv}\\implies g\\circ f \\text{ bijektiv}\\ \\wedge\\ (g\\circ f)^{-1}=f^{-1}\\circ g^{-1}"
]
],
"Definition-1.48": [
[
"",
"x\\in f^{-1}(B)\\iff x\\in X\\wedge f(x)\\in B"
]
],
"Definition-1.51": [
[
"",
"\\mathcal P \\text{ Partition von } X:\\Longleftrightarrow \\big(\\forall P\\in\\mathcal P:\\ \\varnothing\\neq P\\subseteq X\\big)\\ \\wedge\\ \\big(\\forall P,P'\\in\\mathcal P:\\ P\\neq P'\\Rightarrow P\\cap P'=\\varnothing\\big)\\ \\wedge\\ \\big(\\forall x\\in X\\ \\exists P\\in\\mathcal P:\\ x\\in P\\big)"
]
],
"Lemma-1.52": [
[
"",
"\\big(\\forall P\\in\\mathcal P:\\ f_P:P\\to Y\\big)\\implies \\exists!\\,f:X\\to Y\\ \\ \\forall P\\in\\mathcal P:\\ f|_P=f_P"
]
],
"Definition-1.54": [
[
"",
"f^{\\circ 0}=\\mathrm{id}_X,\\qquad \\forall n\\in\\mathbb N_0:\\ f^{\\circ(n+1)}=f\\circ f^{\\circ n}"
]
],
"Definition-1.58": [
[
"",
"R \\text{ Relation auf } X\\times Y:\\Longleftrightarrow R\\subseteq X\\times Y,\\qquad xRy:\\Longleftrightarrow (x,y)\\in R"
]
],
"Proposition-1.67": [
[
"",
"\\sim \\text{ Äquivalenzrelation}\\implies \\mathcal P_\\sim=\\{[x]_\\sim\\mid x\\in X\\}\\text{ ist Partition von }X"
],
[
"",
"\\mathcal P \\text{ Partition}\\implies \\big(x\\sim_{\\mathcal P}y:\\Longleftrightarrow \\exists P\\in\\mathcal P:\\ x\\in P\\wedge y\\in P\\big)\\text{ ist Äquivalenzrelation}"
],
[
"",
"\\mathcal P_{\\sim_{\\mathcal P}}=\\mathcal P\\quad\\wedge\\quad \\sim_{\\mathcal P_\\sim}\\;=\\;\\sim"
]
],
"Definition-1.74": [
[
"",
"|X|=n:\\Longleftrightarrow \\exists f:\\{1,\\dots,n\\}\\to X \\text{ bijektiv}"
]
],
"Proposition-1.75": [
[
"",
"|X|=m>n=|Y|\\implies \\neg\\,\\exists f:X\\to Y \\text{ injektiv}"
],
[
"",
"\\exists f:X\\to Y \\text{ bijektiv}\\iff |X|=|Y|"
]
],
"Definition-1.79": [
[
"abzählbar",
"X \\text{ abzählbar}:\\Longleftrightarrow \\exists f:\\mathbb N\\to X \\text{ bijektiv}"
],
[
"überabzählbar",
"X \\text{ überabzählbar}:\\Longleftrightarrow \\neg(X\\text{ endlich})\\wedge\\neg(X\\text{ abzählbar})"
]
],
"Lemma-1.80": [
[
"",
"X \\text{ abzählbar}\\ \\wedge\\ Y\\subseteq X\\implies Y\\text{ endlich}\\ \\vee\\ Y\\text{ abzählbar}"
]
],
"Definition-2.12": [
[
"",
"M\\subseteq\\mathbb R \\text{ induktiv}:\\Longleftrightarrow 1\\in M\\ \\wedge\\ \\forall x\\in\\mathbb R:\\ (x\\in M\\Rightarrow x+1\\in M)"
]
],
"Definition-2.13": [
[
"",
"n\\in\\mathbb N:\\Longleftrightarrow \\forall M\\subseteq\\mathbb R:\\ \\big(M\\text{ induktiv}\\Rightarrow n\\in M\\big)"
]
],
"Lemma-2.14": [
[
"",
"\\mathbb N\\text{ induktiv}\\ \\wedge\\ \\forall M\\subseteq\\mathbb R:\\ \\big(M\\text{ induktiv}\\Rightarrow \\mathbb N\\subseteq M\\big)"
]
],
"Lemma-2.17": [
[
"",
"\\forall m,n\\in\\mathbb N:\\ m+n\\in\\mathbb N\\ \\wedge\\ m\\cdot n\\in\\mathbb N"
]
],
"Lemma-2.18": [
[
"",
"\\forall n\\in\\mathbb N:\\ n=1\\ \\vee\\ n-1\\in\\mathbb N"
],
[
"",
"\\forall m,n\\in\\mathbb N:\\ m\\le n\\le m+1\\implies n=m\\ \\vee\\ n=m+1"
]
],
"Lemma-2.23": [
[
"",
"\\forall m,n\\in\\mathbb N:\\ m<n\\implies n-m\\in\\mathbb N"
]
],
"Lemma-2.25": [
[
"",
"\\forall m,n\\in\\mathbb Z:\\ m+n\\in\\mathbb Z\\ \\wedge\\ mn\\in\\mathbb Z"
]
],
"Lemma-2.27": [
[
"",
"\\forall r,s\\in\\mathbb Q:\\ -r\\in\\mathbb Q\\ \\wedge\\ r+s\\in\\mathbb Q\\ \\wedge\\ rs\\in\\mathbb Q\\ \\wedge\\ \\big(r\\neq 0\\Rightarrow r^{-1}\\in\\mathbb Q\\big)"
]
],
"Lemma-2.30": [
[
"",
"\\neg\\,\\exists p\\in\\mathbb Z\\ \\exists q\\in\\mathbb N:\\ \\Big(\\frac pq\\Big)^2=2"
]
],
"Satz-2.31": [
[
"",
"\\forall n\\in\\mathbb N_0\\ \\forall d\\in\\mathbb N\\ \\exists q\\in\\mathbb N_0\\ \\exists r\\in\\mathbb N_0:\\ r<d\\ \\wedge\\ n=qd+r"
]
],
"Lemma-2.37": [
[
"(i)",
"\\forall z\\in\\mathbb C:\\ z\\bar z\\in\\mathbb R\\ \\wedge\\ z\\bar z\\ge 0\\ \\wedge\\ (z\\bar z=0\\iff z=0)"
],
[
"(ii)",
"\\forall z,w\\in\\mathbb C:\\ \\overline{z+w}=\\bar z+\\bar w"
],
[
"(iii)",
"\\forall z,w\\in\\mathbb C:\\ \\overline{z\\cdot w}=\\bar z\\cdot\\bar w"
]
],
"Definition-2.43": [
[
"Umgebung",
"U \\text{ Umgebung von } x:\\Longleftrightarrow \\exists a,b\\in\\mathbb R:\\ x\\in(a,b)\\subseteq U"
],
[
"δ-Umgebung",
"y\\in(x-\\delta,x+\\delta)\\iff |y-x|<\\delta"
]
],
"Definition-2.48": [
[
"offen",
"U\\subseteq\\mathbb R\\text{ offen}:\\Longleftrightarrow \\forall x\\in U\\ \\exists\\varepsilon>0\\ \\forall y\\in\\mathbb R:\\ |y-x|<\\varepsilon\\Rightarrow y\\in U"
],
[
"abgeschlossen",
"A\\subseteq\\mathbb R\\text{ abgeschlossen}:\\Longleftrightarrow \\mathbb R\\setminus A\\text{ offen}"
]
],
"Definition-2.52": [
[
"",
"w\\in B_r(z)\\iff w\\in\\mathbb C\\wedge |z-w|<r"
]
],
"Definition-2.54": [
[
"offen",
"U\\subseteq\\mathbb C\\text{ offen}:\\Longleftrightarrow \\forall z\\in U\\ \\exists r>0\\ \\forall w\\in\\mathbb C:\\ |z-w|<r\\Rightarrow w\\in U"
],
[
"abgeschlossen",
"A\\subseteq\\mathbb C\\text{ abgeschlossen}:\\Longleftrightarrow \\mathbb C\\setminus A\\text{ offen}"
]
],
"Definition-2.56": [
[
"",
"x_0=\\max(X):\\Longleftrightarrow x_0\\in X\\ \\wedge\\ \\forall x\\in X:\\ x\\le x_0"
]
],
"Definition-2.57": [
[
"",
"x_0=\\min(X):\\Longleftrightarrow x_0\\in X\\ \\wedge\\ \\forall x\\in X:\\ x\\ge x_0"
]
],
"Definition-2.58": [
[
"von oben beschränkt",
"\\exists s\\in\\mathbb R\\ \\forall x\\in X:\\ x\\le s"
],
[
"von unten beschränkt",
"\\exists t\\in\\mathbb R\\ \\forall x\\in X:\\ t\\le x"
],
[
"beschränkt",
"X\\text{ v.o. beschränkt}\\ \\wedge\\ X\\text{ v.u. beschränkt}\\iff \\exists M\\ge 0\\ \\forall x\\in X:\\ |x|\\le M"
]
],
"Proposition-2.62": [
[
"",
"\\varnothing\\neq A\\subseteq\\mathbb R\\text{ v.o. beschränkt}\\ \\wedge\\ c>0\\implies cA\\text{ v.o. beschränkt}\\ \\wedge\\ \\sup(cA)=c\\,\\sup(A)"
]
],
"Proposition-2.63": [
[
"",
"A,B\\neq\\varnothing\\text{ v.o. beschränkt}\\implies \\sup(A+B)=\\sup(A)+\\sup(B),\\quad A+B=\\{a+b\\mid a\\in A,\\ b\\in B\\}"
]
],
"Satz-2.68": [
[
"(i)",
"\\forall\\,\\varnothing\\neq M\\subseteq\\mathbb Z:\\ \\big(\\exists s\\in\\mathbb R\\ \\forall m\\in M:\\ m\\le s\\big)\\implies \\exists\\max(M)"
],
[
"(ii)",
"\\forall x\\in\\mathbb R\\ \\exists!\\,n\\in\\mathbb Z:\\ n\\le x<n+1"
],
[
"(iii)",
"\\forall\\varepsilon>0\\ \\exists n\\in\\mathbb N:\\ \\tfrac1n<\\varepsilon"
]
],
"Korollar-2.70": [
[
"",
"\\forall a,b\\in\\mathbb R:\\ a<b\\implies \\exists r\\in\\mathbb Q:\\ a<r<b"
]
],
"Definition-2.73": [
[
"",
"x_0 \\text{ Häufungspunkt von } A:\\Longleftrightarrow \\forall\\varepsilon>0\\ \\exists a\\in A:\\ 0<|a-x_0|<\\varepsilon"
]
],
"Satz-2.75": [
[
"",
"A\\subseteq\\mathbb R\\text{ beschränkt}\\ \\wedge\\ A\\text{ unendlich}\\implies \\exists x_0\\in\\mathbb R\\ \\forall\\varepsilon>0\\ \\exists a\\in A:\\ 0<|a-x_0|<\\varepsilon"
]
],
"Satz-2.77": [
[
"",
"\\big(\\forall m,n\\in\\mathbb N:\\ m\\le n\\Rightarrow a_m\\le a_n\\le b_n\\le b_m\\big)\\implies \\bigcap_{n=1}^\\infty[a_n,b_n]=\\big[\\sup_n a_n,\\ \\inf_n b_n\\big]\\neq\\varnothing"
]
],
"Korollar-2.81": [
[
"",
"\\neg\\,\\exists f:\\mathbb N\\to[0,1]\\text{ surjektiv}\\qquad(\\text{also } [0,1]\\text{ und } \\mathbb R \\text{ überabzählbar})"
]
],
"Korollar-2.83": [
[
"",
"f:C\\to\\{L,R\\}^{\\mathbb N_0}\\text{ bijektiv}\\implies C\\text{ überabzählbar}"
]
],
"Lemma-3.5": [
[
"",
"\\forall a\\in\\mathbb R\\ \\forall n\\in\\mathbb N_0:\\ a\\ge -1\\implies (1+a)^n\\ge 1+na"
]
],
"Proposition-3.8": [
[
"",
"\\forall n\\in\\mathbb N_0\\ \\forall q\\in\\mathbb C:\\ \\sum_{k=0}^n q^k=\\begin{cases} n+1 & q=1\\\\[2pt] \\dfrac{q^{n+1}-1}{q-1} & q\\neq 1\\end{cases}"
]
],
"Definition-3.11": [
[
"",
"f\\text{ Polynomfunktion}:\\Longleftrightarrow \\exists n\\in\\mathbb N_0\\ \\exists a_0,\\dots,a_n\\in\\mathbb C\\ \\forall z\\in\\mathbb C:\\ f(z)=\\sum_{k=0}^n a_kz^k,\\qquad \\deg f=\\max\\{k\\mid a_k\\neq 0\\}"
]
],
"Proposition-3.15": [
[
"Wachstum",
"\\deg f\\ge 1\\implies \\forall M>0\\ \\exists R\\ge 1\\ \\forall z\\in\\mathbb C:\\ |z|\\ge R\\Rightarrow |f(z)|\\ge M"
],
[
"Eindeutigkeit",
"f(T)\\mapsto (z\\mapsto f(z))\\ \\text{ist bijektiv: }\\ \\big(\\forall z:\\ f(z)=g(z)\\big)\\Rightarrow f=g\\text{ (gleiche Koeffizienten)}"
]
],
"Definition-3.24": [
[
"",
"0!=1,\\qquad \\forall n\\in\\mathbb N:\\ n!=\\prod_{k=1}^n k=n\\cdot(n-1)!"
]
],
"Lemma-3.25": [
[
"",
"\\forall n\\in\\mathbb N:\\ |S_n|=\\big|\\{\\sigma:\\{1,\\dots,n\\}\\to\\{1,\\dots,n\\}\\mid \\sigma\\text{ bijektiv}\\}\\big|=n!"
]
],
"Proposition-3.26": [
[
"",
"\\forall n\\in\\mathbb N_0\\ \\forall k\\in\\mathbb N,\\ 1\\le k\\le n:\\ \\binom n0=\\binom nn=1\\ \\wedge\\ \\binom n{k-1}+\\binom nk=\\binom{n+1}k"
]
],
"Satz-3.28": [
[
"",
"\\forall w,z\\in\\mathbb C\\ \\forall n\\in\\mathbb N_0:\\ (w+z)^n=\\sum_{k=0}^n\\binom nk w^{n-k}z^k"
]
],
"Proposition-3.32": [
[
"",
"\\forall d\\in\\mathbb N_0\\ \\exists c_0,\\dots,c_d\\in\\mathbb Q\\ \\forall n\\in\\mathbb N:\\ \\sum_{k=1}^n k^d=\\tfrac{1}{d+1}n^{d+1}+c_dn^d+\\dots+c_1n+c_0"
]
],
"Definition-3.37": [
[
"v.o. beschränkt",
"\\exists s\\in\\mathbb R\\ \\forall x\\in D:\\ f(x)\\le s"
],
[
"v.u. beschränkt",
"\\exists t\\in\\mathbb R\\ \\forall x\\in D:\\ f(x)\\ge t"
],
[
"beschränkt",
"\\exists M\\ge 0\\ \\forall x\\in D:\\ |f(x)|\\le M"
]
],
"Proposition-3.50": [
[
"",
"f_1,f_2\\text{ stetig bei }x_0\\implies \\forall a\\in\\mathbb R:\\ f_1+f_2,\\ f_1\\cdot f_2,\\ af_1\\text{ stetig bei }x_0"
]
],
"Korollar-3.51": [
[
"",
"\\forall n\\in\\mathbb N_0\\ \\forall a_0,\\dots,a_n\\in\\mathbb R:\\ \\Big(x\\mapsto\\sum_{k=0}^na_kx^k\\Big)\\in C(\\mathbb R)"
]
],
"Proposition-3.52": [
[
"",
"f\\text{ stetig bei }x_0\\ \\wedge\\ g\\text{ stetig bei }f(x_0)\\implies g\\circ f\\text{ stetig bei }x_0"
]
],
"Satz-3.58": [
[
"",
"I\\text{ Intervall},\\ f:I\\to\\mathbb R\\text{ stetig}:\\quad \\forall a,b\\in I\\ \\forall c\\in\\mathbb R:\\ \\big(f(a)\\le c\\le f(b)\\ \\vee\\ f(b)\\le c\\le f(a)\\big)\\implies \\exists x\\text{ zwischen }a,b:\\ f(x)=c"
]
],
"Satz-3.62": [
[
"",
"I\\text{ Intervall},\\ f\\text{ stetig, streng monoton}\\implies f(I)\\text{ Intervall}\\ \\wedge\\ \\exists f^{-1}:f(I)\\to I\\text{ stetig, streng monoton}"
]
],
"Lemma-3.65": [
[
"",
"\\forall m,k\\in\\mathbb N:\\ \\sqrt[m]k\\in\\mathbb Q\\iff \\sqrt[m]k\\in\\mathbb Z"
]
],
"Satz-3.67": [
[
"",
"a<b,\\ f:[a,b]\\to\\mathbb C\\text{ stetig}\\implies \\exists M\\in\\mathbb R\\ \\forall x\\in[a,b]:\\ |f(x)|\\le M"
]
],
"Korollar-3.69": [
[
"",
"a<b,\\ f:[a,b]\\to\\mathbb R\\text{ stetig}\\implies \\exists x_+,x_-\\in[a,b]\\ \\forall x\\in[a,b]:\\ f(x_-)\\le f(x)\\le f(x_+)"
]
],
"Definition-3.71": [
[
"",
"f\\text{ glm. stetig}:\\Longleftrightarrow \\forall\\varepsilon>0\\ \\exists\\delta>0\\ \\forall x,y\\in D:\\ |x-y|<\\delta\\Rightarrow |f(x)-f(y)|<\\varepsilon"
]
],
"Satz-3.75": [
[
"",
"f:[a,b]\\to\\mathbb C\\text{ stetig}\\implies \\forall\\varepsilon>0\\ \\exists\\delta>0\\ \\forall x,y\\in[a,b]:\\ |x-y|<\\delta\\Rightarrow|f(x)-f(y)|<\\varepsilon"
]
],
"Definition-4.1": [
[
"",
"Z=\\{a=x_0<x_1<\\dots<x_n=b\\},\\quad n\\in\\mathbb N:\\qquad \\forall k\\in\\{1,\\dots,n\\}:\\ x_{k-1}<x_k"
]
],
"Definition-4.2": [
[
"",
"f\\in TF([a,b]):\\Longleftrightarrow \\exists\\text{ Zerlegung }Z=\\{x_0<\\dots<x_n\\}\\ \\forall k\\in\\{1,\\dots,n\\}\\ \\exists c_k\\in\\mathbb R\\ \\forall x\\in(x_{k-1},x_k):\\ f(x)=c_k"
]
],
"Definition-4.3": [
[
"feiner",
"Z'\\text{ feiner als }Z:\\Longleftrightarrow \\forall x\\ \\big(x\\text{ Teilungspunkt von }Z\\Rightarrow x\\text{ Teilungspunkt von }Z'\\big)"
],
[
"gemeinsame Verfeinerung",
"\\text{Teilungspunkte}(Z\\vee Z')=\\text{Teilungspunkte}(Z)\\cup\\text{Teilungspunkte}(Z')"
]
],
"Definition-4.4": [
[
"",
"I(f,Z)=\\sum_{k=1}^n c_k\\,(x_k-x_{k-1}),\\qquad \\forall x\\in(x_{k-1},x_k):\\ f(x)=c_k"
]
],
"Lemma-4.5": [
[
"",
"\\forall Z,Z'\\text{ Zerlegungen in Konstanzintervalle von }f:\\ I(f,Z)=I(f,Z')"
]
],
"Definition-4.6": [
[
"",
"\\int_a^b f\\,dx:=I(f,Z)"
],
[
"Z beliebige Zerlegung in Konstanzintervalle von f",
"\\forall k\\ \\forall x\\in(x_{k-1},x_k):\\ f(x)=c_k"
]
],
"Lemma-4.7": [
[
"",
"\\forall f,g\\in TF([a,b])\\ \\forall s\\in\\mathbb R:\\ f+g,\\ sf\\in TF\\ \\wedge\\ \\int_a^b(f+g)=\\int_a^bf+\\int_a^bg\\ \\wedge\\ \\int_a^b sf=s\\int_a^bf"
]
],
"Lemma-4.8": [
[
"",
"\\forall f,g\\in TF([a,b]):\\ \\big(\\forall x\\in[a,b]:\\ f(x)\\le g(x)\\big)\\implies \\int_a^bf\\,dx\\le\\int_a^bg\\,dx"
]
],
"Definition-4.10": [
[
"Untersummen",
"\\mathcal U(f)=\\Big\\{\\int_a^bu\\,dx\\ \\Big|\\ u\\in TF([a,b])\\ \\wedge\\ \\forall x:\\ u(x)\\le f(x)\\Big\\}"
],
[
"Obersummen",
"\\mathcal O(f)=\\Big\\{\\int_a^bo\\,dx\\ \\Big|\\ o\\in TF([a,b])\\ \\wedge\\ \\forall x:\\ f(x)\\le o(x)\\Big\\}"
]
],
"Definition-4.11": [
[
"",
"f\\text{ R-integrierbar}:\\Longleftrightarrow \\sup\\mathcal U(f)=\\inf\\mathcal O(f)\\quad\\big(=:\\textstyle\\int_a^bf\\,dx\\big)"
]
],
"Proposition-4.12": [
[
"(i)⇔(iii)",
"f\\in\\mathcal R([a,b])\\iff \\forall\\varepsilon>0\\ \\exists u,o\\in TF([a,b]):\\ u\\le f\\le o\\ \\wedge\\ \\int_a^b(o-u)\\,dx<\\varepsilon"
],
[
"(ii)",
"\\exists!\\,I\\in\\mathbb R\\ \\forall u,o\\in TF,\\ u\\le f\\le o:\\ \\int_a^bu\\le I\\le\\int_a^bo"
]
],
"Satz-4.19": [
[
"",
"\\forall f_1,f_2,f\\in\\mathcal R([a,b])\\ \\forall s\\in\\mathbb R:\\ f_1+f_2,\\ sf\\in\\mathcal R\\ \\wedge\\ \\int(f_1+f_2)=\\int f_1+\\int f_2\\ \\wedge\\ \\int sf=s\\int f"
]
],
"Satz-4.24": [
[
"(i)",
"f_1\\ge 0\\implies \\int_a^bf_1\\,dx\\ge 0"
],
[
"(ii)",
"f_1\\le f_2\\implies \\int_a^bf_1\\,dx\\le\\int_a^bf_2\\,dx"
],
[
"(iii)",
"|f_1|\\in\\mathcal R([a,b])\\ \\wedge\\ \\Big|\\int_a^bf_1\\,dx\\Big|\\le\\int_a^b|f_1|\\,dx"
]
],
"Satz-4.26": [
[
"",
"f\\in\\mathcal R([a,c])\\iff f|_{[a,b]}\\in\\mathcal R([a,b])\\wedge f|_{[b,c]}\\in\\mathcal R([b,c]),\\qquad \\int_a^cf=\\int_a^bf+\\int_b^cf"
]
],
"Definition-4.29": [
[
"",
"\\forall\\alpha,\\beta,\\gamma\\in[a,b]:\\ I(\\alpha,\\alpha)=0\\ \\wedge\\ I(\\alpha,\\beta)=-I(\\beta,\\alpha)\\ \\wedge\\ I(\\alpha,\\beta)+I(\\beta,\\gamma)=I(\\alpha,\\gamma)"
]
],
"Proposition-4.30": [
[
"",
"\\Big(\\forall\\alpha<\\beta:\\ (\\beta-\\alpha)\\inf_{(\\alpha,\\beta)}f\\le I(\\alpha,\\beta)\\le(\\beta-\\alpha)\\sup_{(\\alpha,\\beta)}f\\Big)\\implies \\forall\\alpha,\\beta:\\ I(\\alpha,\\beta)=\\int_\\alpha^\\beta f\\,dx"
]
],
"Satz-4.31": [
[
"",
"\\forall f\\in F([a,b]):\\ f\\text{ monoton}\\implies f\\in\\mathcal R([a,b])"
]
],
"Definition-4.33": [
[
"",
"f\\text{ stückweise monoton}:\\Longleftrightarrow \\exists Z=\\{x_0<\\dots<x_n\\}\\ \\forall k\\in\\{1,\\dots,n\\}:\\ f|_{(x_{k-1},x_k)}\\text{ monoton}"
]
],
"Korollar-4.34": [
[
"",
"f\\text{ stückweise monoton}\\ \\wedge\\ f\\text{ beschränkt}\\implies f\\in\\mathcal R([a,b])"
]
],
"Satz-4.37": [
[
"",
"\\forall d\\in\\mathbb N_0:\\ \\int_a^bx^d\\,dx=\\frac{1}{d+1}\\big(b^{d+1}-a^{d+1}\\big)"
]
],
"Satz-4.42": [
[
"",
"a<b,\\ f\\in C([a,b])\\implies f\\in\\mathcal R([a,b])"
]
],
"Proposition-4.44": [
[
"",
"f\\in\\mathcal R([a,b])\\iff \\forall\\varepsilon>0\\ \\exists f_+,f_-\\in C([a,b]):\\ f_-\\le f\\le f_+\\ \\wedge\\ \\int_a^b(f_+-f_-)\\,dx<\\varepsilon"
]
],
"Definition-5.1": [
[
"Definitheit",
"\\forall v\\in V:\\ \\|v\\|=0\\iff v=0"
],
[
"Homogenität",
"\\forall v\\in V\\ \\forall\\alpha\\in\\mathbb K:\\ \\|\\alpha v\\|=|\\alpha|\\,\\|v\\|"
],
[
"Dreiecksungl.",
"\\forall v_1,v_2\\in V:\\ \\|v_1+v_2\\|\\le\\|v_1\\|+\\|v_2\\|"
]
],
"Proposition-5.3": [
[
"",
"\\forall v,w\\in\\mathbb C^d:\\ |\\langle v,w\\rangle|\\le\\|v\\|_2\\|w\\|_2,\\qquad \"=\"\\iff \\exists\\alpha\\in\\mathbb C:\\ \\alpha v=w\\ \\vee\\ v=\\alpha w"
]
],
"Korollar-5.5": [
[
"",
"\\|v\\|_2=\\sqrt{\\textstyle\\sum_{j=1}^d|v_j|^2}"
],
[
"erfüllt Definitheit, Homogenität, Dreiecksungleichung",
"\\forall v,w\\in\\mathbb C^d\\ \\forall\\alpha:\\ \\|v\\|_2=0\\Leftrightarrow v=0,\\ \\ \\|\\alpha v\\|_2=|\\alpha|\\|v\\|_2,\\ \\ \\|v+w\\|_2\\le\\|v\\|_2+\\|w\\|_2"
]
],
"Definition-5.10": [
[
"Definitheit",
"\\forall x_1,x_2\\in X:\\ d(x_1,x_2)=0\\iff x_1=x_2"
],
[
"Symmetrie",
"\\forall x_1,x_2\\in X:\\ d(x_1,x_2)=d(x_2,x_1)"
],
[
"Dreiecksungl.",
"\\forall x_1,x_2,x_3\\in X:\\ d(x_1,x_3)\\le d(x_1,x_2)+d(x_2,x_3)"
]
],
"Lemma-5.11": [
[
"",
"\\|\\cdot\\|\\text{ Norm auf }V\\implies d(v_1,v_2):=\\|v_1-v_2\\|\\text{ ist Metrik auf }V"
]
],
"Definition-5.16": [
[
"Ball",
"x\\in B_r(x_0)\\iff d(x,x_0)<r"
],
[
"offen",
"O\\subseteq X\\text{ offen}:\\Longleftrightarrow \\forall x_0\\in O\\ \\exists r>0:\\ B_r(x_0)\\subseteq O"
]
],
"Lemma-5.17": [
[
"",
"\\forall x\\in B_{r_1}(x_1)\\cap B_{r_2}(x_2)\\ \\exists r>0:\\ B_r(x)\\subseteq B_{r_1}(x_1)\\cap B_{r_2}(x_2)"
]
],
"Definition-5.20": [
[
"Folge",
"(a_n)_n\\in X^{\\mathbb N}:\\Longleftrightarrow a:\\mathbb N\\to X,\\ n\\mapsto a_n"
],
[
"konstant",
"\\forall m,n\\in\\mathbb N:\\ a_m=a_n"
],
[
"schliesslich konstant",
"\\exists N\\in\\mathbb N\\ \\forall m,n\\ge N:\\ a_m=a_n"
]
],
"Definition-5.21": [
[
"",
"\\lim_{n\\to\\infty}a_n=A:\\Longleftrightarrow \\forall\\varepsilon>0\\ \\exists N\\in\\mathbb N\\ \\forall n\\ge N:\\ d(a_n,A)<\\varepsilon"
]
],
"Lemma-5.22": [
[
"",
"\\big(a_n\\to A\\ \\wedge\\ a_n\\to B\\big)\\implies A=B"
]
],
"Definition-5.24": [
[
"",
"U\\text{ Umgebung von }x_0:\\Longleftrightarrow \\exists\\varepsilon>0:\\ B_\\varepsilon(x_0)\\subseteq U"
]
],
"Lemma-5.25": [
[
"",
"\\forall\\ell\\in\\mathbb N_0:\\ (a_n)_n\\text{ konvergent}\\iff(a_{n+\\ell})_n\\text{ konvergent},\\qquad \\lim_n a_n=\\lim_n a_{n+\\ell}"
]
],
"Lemma-5.27": [
[
"",
"(a_n)_n\\text{ konvergent}\\implies \\exists M\\ge 0\\ \\forall n\\in\\mathbb N:\\ \\|a_n\\|\\le M"
]
],
"Proposition-5.30": [
[
"(i)",
"a_n\\to a,\\ b_n\\to b\\implies a_n+b_n\\to a+b"
],
[
"(ii)",
"a_n\\to a,\\ b_n\\to b\\implies a_nb_n\\to ab"
],
[
"(iii)",
"\\big(\\forall n:\\ a_n\\neq0\\big)\\wedge a_n\\to a\\neq0\\implies \\tfrac1{a_n}\\to\\tfrac1a"
]
],
"Definition-5.38": [
[
"",
"(a_{n_k})_k\\text{ Teilfolge}:\\Longleftrightarrow \\forall k\\in\\mathbb N:\\ n_k<n_{k+1}\\quad(n_k\\in\\mathbb N)"
]
],
"Lemma-5.39": [
[
"",
"a_n\\to A\\implies \\forall(n_k)_k\\text{ streng monoton wachsend}:\\ a_{n_k}\\to A"
]
],
"Proposition-5.42": [
[
"",
"\\exists(a_{n_k})_k:\\ a_{n_k}\\to A\\iff \\forall\\varepsilon>0\\ \\forall N\\in\\mathbb N\\ \\exists n\\ge N:\\ d(a_n,A)<\\varepsilon"
]
],
"Proposition-5.44": [
[
"",
"v_n\\xrightarrow{\\|\\cdot\\|_\\infty}v\\iff v_n\\xrightarrow{\\|\\cdot\\|_1}v\\iff v_n\\xrightarrow{\\|\\cdot\\|_2}v\\iff \\forall j\\in\\{1,\\dots,d\\}:\\ \\pi_j(v_n)\\to\\pi_j(v)"
]
],
"Korollar-5.45": [
[
"",
"a_n\\to a\\iff \\operatorname{Re}(a_n)\\to\\operatorname{Re}(a)\\ \\wedge\\ \\operatorname{Im}(a_n)\\to\\operatorname{Im}(a)"
]
],
"Definition-5.48": [
[
"",
"\\forall\\varepsilon>0\\ \\exists\\delta>0\\ \\forall x\\in X:\\ d_X(x,x_0)<\\delta\\Rightarrow d_Y(f(x),f(x_0))<\\varepsilon"
]
],
"Lemma-5.49": [
[
"folgenstetig",
"\\forall(x_n)_n\\in X^{\\mathbb N}:\\ x_n\\to x_0\\implies f(x_n)\\to f(x_0)"
],
[
"Aussage",
"f\\ \\varepsilon\\text{-}\\delta\\text{-stetig bei }x_0\\iff f\\text{ folgenstetig bei }x_0"
]
],
"Proposition-5.50": [
[
"",
"f\\text{ stetig}\\iff \\forall x\\in X\\ \\forall U\\subseteq Y\\ \\big(U\\text{ Umgebung von }f(x)\\Rightarrow f^{-1}(U)\\text{ Umgebung von }x\\big)"
]
],
"Definition-5.52": [
[
"glm. stetig",
"\\forall\\varepsilon>0\\ \\exists\\delta>0\\ \\forall x_1,x_2\\in X:\\ d_X(x_1,x_2)<\\delta\\Rightarrow d_Y(f(x_1),f(x_2))<\\varepsilon"
],
[
"Lipschitz",
"\\exists L\\ge0\\ \\forall x_1,x_2\\in X:\\ d_Y(f(x_1),f(x_2))\\le L\\,d_X(x_1,x_2)"
]
],
"Proposition-5.53": [
[
"(i)",
"f,g\\text{ stetig}\\implies g\\circ f\\text{ stetig}"
],
[
"(ii)",
"f:X\\to\\mathbb C^d\\text{ stetig}\\iff\\forall j:\\ \\pi_j\\circ f\\text{ stetig}"
]
],
"Proposition-6.1": [
[
"(i)",
"\\big(\\forall n\\in\\mathbb N:\\ a_n\\le b_n\\big)\\implies a\\le b"
],
[
"(ii)",
"a<b\\implies \\exists N\\in\\mathbb N\\ \\forall n\\ge N:\\ a_n<b_n"
]
],
"Lemma-6.2": [
[
"",
"\\big(\\forall n:\\ a_n\\le b_n\\le c_n\\big)\\ \\wedge\\ a_n\\to A\\ \\wedge\\ c_n\\to A\\implies b_n\\to A"
]
],
"Satz-6.5": [
[
"",
"(a_n)_n\\text{ monoton}:\\quad (a_n)_n\\text{ konvergent}\\iff \\exists M\\ \\forall n:\\ |a_n|\\le M;\\qquad \\text{wachsend}\\Rightarrow\\lim a_n=\\sup_n a_n,\\ \\ \\text{fallend}\\Rightarrow\\lim a_n=\\inf_n a_n"
]
],
"Definition-6.8": [
[
"",
"\\limsup_{n\\to\\infty}a_n=\\lim_{n\\to\\infty}\\Big(\\sup_{k\\ge n}a_k\\Big)=\\inf_{n\\in\\mathbb N}\\ \\sup_{k\\ge n}a_k"
]
],
"Definition-6.9": [
[
"",
"\\liminf_{n\\to\\infty}a_n=\\lim_{n\\to\\infty}\\Big(\\inf_{k\\ge n}a_k\\Big)=\\sup_{n\\in\\mathbb N}\\ \\inf_{k\\ge n}a_k"
]
],
"Satz-6.11": [
[
"nur endlich viele darüber",
"\\forall\\varepsilon>0\\ \\exists N\\in\\mathbb N\\ \\forall n\\ge N:\\ a_n\\le\\limsup_k a_k+\\varepsilon"
],
[
"unendlich viele nahe dran",
"\\forall\\varepsilon>0\\ \\forall N\\in\\mathbb N\\ \\exists n\\ge N:\\ a_n>\\limsup_k a_k-\\varepsilon"
]
],
"Korollar-6.14": [
[
"",
"(a_n)_n\\text{ beschränkt}:\\quad \\liminf_{n\\to\\infty}a_n=\\limsup_{n\\to\\infty}a_n\\iff (a_n)_n\\text{ konvergent}"
]
],
"Satz-6.15": [
[
"",
"a_{n_k}\\to L\\implies \\liminf_n a_n\\le L\\le\\limsup_n a_n"
],
[
"",
"\\exists(n_k)_k:\\ a_{n_k}\\to\\limsup_n a_n\\ \\ \\wedge\\ \\ \\exists(m_k)_k:\\ a_{m_k}\\to\\liminf_n a_n"
]
],
"Definition-6.19": [
[
"→ ∞",
"\\lim_{n\\to\\infty}a_n=\\infty:\\Longleftrightarrow \\forall\\varepsilon>0\\ \\exists N\\in\\mathbb N\\ \\forall n\\ge N:\\ a_n\\ge\\varepsilon^{-1}"
],
[
"→ −∞",
"\\lim_{n\\to\\infty}a_n=-\\infty:\\Longleftrightarrow \\forall\\varepsilon>0\\ \\exists N\\in\\mathbb N\\ \\forall n\\ge N:\\ a_n\\le-\\varepsilon^{-1}"
]
],
"Definition-6.22": [
[
"",
"(a_n)_n\\text{ Cauchy}:\\Longleftrightarrow \\forall\\varepsilon>0\\ \\exists N\\in\\mathbb N\\ \\forall m,n\\ge N:\\ d(a_m,a_n)<\\varepsilon"
]
],
"Satz-6.26": [
[
"",
"\\big(\\exists A\\in\\mathbb R\\ \\forall\\varepsilon>0\\ \\exists N\\ \\forall n\\ge N:\\ |a_n-A|<\\varepsilon\\big)\\iff \\big(\\forall\\varepsilon>0\\ \\exists N\\ \\forall m,n\\ge N:\\ |a_m-a_n|<\\varepsilon\\big)"
]
],
"Proposition-6.29": [
[
"",
"\\forall x\\in\\mathbb R:\\ \\exp(x)=\\lim_{n\\to\\infty}\\Big(1+\\frac xn\\Big)^n\\text{ existiert};\\quad \\forall x,y\\in\\mathbb R:\\ \\exp(x+y)=\\exp(x)\\exp(y)"
]
],
"Korollar-6.33": [
[
"",
"\\log=\\exp^{-1}:\\mathbb R_{>0}\\to\\mathbb R,\\qquad \\forall a,b>0:\\ \\log(ab)=\\log a+\\log b"
]
],
"Lemma-6.39": [
[
"Grenzwert",
"\\lim_{x\\to x_0}f(x)=A:\\Longleftrightarrow \\forall\\varepsilon>0\\ \\exists\\delta>0\\ \\forall x\\in D:\\ 0<|x-x_0|<\\delta\\Rightarrow|f(x)-A|<\\varepsilon"
],
[
"Aussage",
"f\\text{ stetig bei }x_0\\iff \\lim_{x\\to x_0}f(x)=f(x_0)"
]
],
"Lemma-6.40": [
[
"",
"\\lim_{x\\to x_0}f(x)=A\\iff \\forall(a_n)_n\\in(D\\setminus\\{x_0\\})^{\\mathbb N}:\\ a_n\\to x_0\\Rightarrow f(a_n)\\to A"
]
],
"Proposition-6.41": [
[
"",
"\\lim_{x\\to x_0}f(x)=y_0\\ \\wedge\\ g\\text{ stetig bei }y_0\\implies \\lim_{x\\to x_0}g(f(x))=g(y_0)"
]
],
"Definition-6.46": [
[
"Maschenweite",
"|Z|=\\max_{k=1,\\dots,n}(x_k-x_{k-1})"
],
[
"Zwischenpunkte",
"\\forall k\\in\\{1,\\dots,n\\}:\\ z_k\\in[x_{k-1},x_k]"
],
[
"Riemann-Summe",
"R(f,Z,z)=\\sum_{k=1}^nf(z_k)(x_k-x_{k-1})"
]
],
"Definition-7.1": [
[
"Partialsumme",
"s_n=\\sum_{k=1}^na_k"
],
[
"konvergent",
"\\sum_{k=1}^\\infty a_k=S:\\Longleftrightarrow \\forall\\varepsilon>0\\ \\exists N\\in\\mathbb N\\ \\forall n\\ge N:\\ \\Big|\\sum_{k=1}^na_k-S\\Big|<\\varepsilon"
],
[
"absolut konvergent",
"\\sum_{k=1}^\\infty|a_k|\\text{ konvergent}"
]
],
"Proposition-7.2": [
[
"",
"\\sum_{k=1}^\\infty a_k\\text{ konvergent}\\implies \\forall\\varepsilon>0\\ \\exists N\\ \\forall n\\ge N:\\ |a_n|<\\varepsilon\\quad(\\lim a_n=0)"
]
],
"Lemma-7.6": [
[
"",
"\\sum a_k,\\sum b_k\\text{ konv.},\\ \\alpha\\in\\mathbb C\\implies \\sum(a_k+b_k)=\\sum a_k+\\sum b_k\\ \\wedge\\ \\sum\\alpha a_k=\\alpha\\sum a_k"
]
],
"Lemma-7.8": [
[
"",
"\\forall N\\in\\mathbb N:\\ \\sum_{k=1}^\\infty a_k\\text{ konv.}\\iff\\sum_{k=N}^\\infty a_k\\text{ konv.},\\qquad \\sum_{k=1}^\\infty a_k=\\sum_{k=1}^{N-1}a_k+\\sum_{k=N}^\\infty a_k"
]
],
"Lemma-7.9": [
[
"",
"\\sum_n a_n\\text{ konv.}\\ \\wedge\\ (n_k)_k\\text{ str. mon. wachsend}\\implies \\sum_{k=1}^\\infty\\Big(\\sum_{n=n_{k-1}+1}^{n_k}a_n\\Big)=\\sum_{n=1}^\\infty a_n\\quad(n_0:=0)"
]
],
"Proposition-7.11": [
[
"",
"\\big(\\forall k:\\ a_k\\ge0\\big)\\implies \\Big(\\sum a_k\\text{ konvergent}\\iff \\exists M\\ \\forall n:\\ s_n\\le M\\Big)"
]
],
"Korollar-7.12": [
[
"",
"\\big(\\exists N\\ \\forall k\\ge N:\\ 0\\le a_k\\le b_k\\big)\\implies \\Big(\\sum b_k\\text{ konv.}\\Rightarrow\\sum a_k\\text{ konv.}\\Big)\\wedge\\Big(\\sum a_k\\text{ div.}\\Rightarrow\\sum b_k\\text{ div.}\\Big)"
]
],
"Proposition-7.16": [
[
"",
"a_1\\ge a_2\\ge\\dots\\ge0\\implies \\Big(\\sum_{k=1}^\\infty a_k\\text{ konv.}\\iff\\sum_{k=1}^\\infty2^ka_{2^k}\\text{ konv.}\\Big)"
]
],
"Satz-7.21": [
[
"",
"\\sum a_n\\text{ bedingt konv. (reell)}\\implies \\forall A\\in\\mathbb R\\ \\exists\\varphi:\\mathbb N\\to\\mathbb N\\text{ bijektiv}:\\ \\sum_{n=1}^\\infty a_{\\varphi(n)}=A"
]
],
"Proposition-7.25": [
[
"",
"a_n\\searrow0\\implies \\sum_{k=1}^\\infty(-1)^{k+1}a_k\\text{ konv.}\\ \\wedge\\ \\forall\\ell\\in\\mathbb N:\\ \\Big|\\sum_{k=1}^\\ell(-1)^{k+1}a_k-\\sum_{k=1}^\\infty(-1)^{k+1}a_k\\Big|\\le a_{\\ell+1}"
]
],
"Satz-7.26": [
[
"",
"\\sum_{k=1}^\\infty a_k\\text{ konv.}\\iff \\forall\\varepsilon>0\\ \\exists N\\in\\mathbb N\\ \\forall n\\ge m\\ge N:\\ \\Big|\\sum_{k=m}^na_k\\Big|<\\varepsilon"
]
],
"Proposition-7.28": [
[
"",
"\\sum|a_n|\\text{ konv.}\\implies \\sum a_n\\text{ konv.}\\ \\wedge\\ \\Big|\\sum_{n=1}^\\infty a_n\\Big|\\le\\sum_{n=1}^\\infty|a_n|"
]
],
"Korollar-7.29": [
[
"",
"\\big(\\exists N\\ \\forall n\\ge N:\\ |a_n|\\le b_n\\big)\\ \\wedge\\ \\sum b_n\\text{ konv.}\\implies \\sum|a_n|\\text{ konv.}"
]
],
"Korollar-7.30": [
[
"",
"\\alpha=\\limsup_{n\\to\\infty}\\sqrt[n]{|a_n|}:\\qquad \\alpha<1\\Rightarrow\\sum|a_n|\\text{ konv.},\\qquad \\alpha>1\\Rightarrow\\sum a_n\\text{ div.}\\ \\wedge\\ a_n\\not\\to0"
]
],
"Korollar-7.32": [
[
"",
"\\big(\\forall n:\\ a_n\\neq0\\big)\\wedge\\ \\alpha=\\lim_{n\\to\\infty}\\frac{|a_{n+1}|}{|a_n|}\\text{ existiert}:\\qquad \\alpha<1\\Rightarrow\\sum|a_n|\\text{ konv.},\\qquad\\alpha>1\\Rightarrow\\sum a_n\\text{ div.}"
]
],
"Satz-7.35": [
[
"",
"\\sum|a_n|\\text{ konv.}\\ \\wedge\\ \\varphi:\\mathbb N\\to\\mathbb N\\text{ bijektiv}\\implies \\sum|a_{\\varphi(n)}|\\text{ konv.}\\ \\wedge\\ \\sum_{n=1}^\\infty a_{\\varphi(n)}=\\sum_{n=1}^\\infty a_n"
]
],
"Satz-7.36": [
[
"",
"\\sum|a_n|,\\sum|b_n|\\text{ konv.},\\ \\varphi:\\mathbb N\\to\\mathbb N\\times\\mathbb N\\text{ bijektiv}\\implies \\sum_{n=1}^\\infty a_{\\varphi(n)_1}b_{\\varphi(n)_2}=\\Big(\\sum a_n\\Big)\\Big(\\sum b_n\\Big)\\text{ (abs. konv.)}"
]
],
"Korollar-7.37": [
[
"",
"\\sum|a_n|,\\sum|b_n|\\text{ konv.}\\implies \\sum_{n=0}^\\infty\\Big(\\sum_{k=0}^na_{n-k}b_k\\Big)=\\Big(\\sum_{n=0}^\\infty a_n\\Big)\\Big(\\sum_{n=0}^\\infty b_n\\Big)"
]
],
"Satz-7.48": [
[
"",
"\\big(\\forall n:\\ f_n\\text{ stetig}\\big)\\ \\wedge\\ \\big(\\forall\\varepsilon>0\\ \\exists N\\ \\forall n\\ge N\\ \\forall x\\in D:\\ |f_n(x)-f(x)|<\\varepsilon\\big)\\implies f\\text{ stetig}"
]
],
"Satz-7.49": [
[
"",
"\\big(\\forall n:\\ f_n\\in\\mathcal R([a,b])\\big)\\ \\wedge\\ f_n\\rightrightarrows f\\implies f\\in\\mathcal R([a,b])\\ \\wedge\\ \\lim_{n\\to\\infty}\\int_a^bf_n\\,dx=\\int_a^bf\\,dx"
]
],
"Definition-7.55": [
[
"",
"R=\\frac{1}{\\limsup_{n\\to\\infty}\\sqrt[n]{|a_n|}}\\in[0,\\infty],\\qquad \\tfrac1{+\\infty}=0,\\ \\tfrac10=+\\infty"
]
],
"Satz-7.56": [
[
"",
"\\forall z\\in\\mathbb C:\\ |z|<R\\Rightarrow\\sum a_nz^n\\text{ abs. konv.},\\qquad |z|>R\\Rightarrow\\sum a_nz^n\\text{ div.}"
],
[
"",
"\\forall S\\in(0,R):\\ \\sum_{n=0}^Na_nz^n\\rightrightarrows\\sum_{n=0}^\\infty a_nz^n\\text{ auf }B_S(0)"
]
],
"Lemma-7.60": [
[
"",
"\\big(\\forall n:\\ a_n\\neq0\\big)\\wedge \\lim_{n\\to\\infty}\\frac{|a_n|}{|a_{n+1}|}\\text{ existiert}\\implies R=\\lim_{n\\to\\infty}\\frac{|a_n|}{|a_{n+1}|}"
]
],
"Proposition-7.62": [
[
"",
"\\forall z\\in\\mathbb C,\\ |z|<\\min\\{R_a,R_b\\}:\\ \\sum a_nz^n+\\sum b_nz^n=\\sum(a_n+b_n)z^n\\ \\wedge\\ \\Big(\\sum a_nz^n\\Big)\\Big(\\sum b_nz^n\\Big)=\\sum_n\\Big(\\sum_{k=0}^na_{n-k}b_k\\Big)z^n"
]
],
"Satz-7.65": [
[
"",
"\\sum_{n=0}^\\infty a_nR^n\\text{ konvergent}\\implies \\lim_{x\\nearrow R}\\sum_{n=0}^\\infty a_nx^n=\\sum_{n=0}^\\infty a_nR^n"
]
],
"Satz-7.68": [
[
"",
"\\exp(z)=\\sum_{k=0}^\\infty\\frac{z^k}{k!};\\qquad \\forall z,w\\in\\mathbb C:\\ \\exp(z+w)=\\exp(z)\\exp(w)\\ \\wedge\\ |\\exp(z)|=\\exp(\\operatorname{Re}z)"
]
],
"Satz-7.72": [
[
"",
"\\forall z\\in\\mathbb C:\\ e^{iz}=\\cos z+i\\sin z,\\quad \\sin z=\\frac{e^{iz}-e^{-iz}}{2i},\\quad \\cos z=\\frac{e^{iz}+e^{-iz}}{2},\\quad \\sin^2z+\\cos^2z=1"
]
],
"Satz-7.74": [
[
"",
"\\exists!\\,\\pi\\in(0,4):\\ \\sin(\\pi)=0;\\qquad e^{2\\pi i}=1,\\ e^{\\pi i}=-1,\\ e^{\\frac{\\pi}{2}i}=i"
]
],
"Korollar-7.75": [
[
"",
"\\forall z\\in\\mathbb C:\\ \\sin(z+\\pi)=-\\sin z,\\ \\cos(z+\\pi)=-\\cos z,\\ \\sin(z+2\\pi)=\\sin z,\\ \\cos(z+2\\pi)=\\cos z,\\ \\cos z=\\sin\\!\\big(z+\\tfrac\\pi2\\big)"
]
],
"Lemma-7.81": [
[
"",
"\\forall z\\in\\mathbb C\\ \\exists!\\,r\\ge0\\ \\exists\\theta\\in[0,2\\pi):\\ z=re^{i\\theta};\\qquad z\\neq0\\Rightarrow\\theta\\text{ eindeutig}"
]
],
"Satz-7.85": [
[
"",
"f(x)=\\sum c_nx^n\\ (\\text{Radius }R)\\implies F(x)=\\sum\\frac{c_n}{n+1}x^{n+1}\\text{ hat Radius }R\\ \\wedge\\ \\forall a,b\\in(-R,R):\\ \\int_a^bf\\,dx=F(b)-F(a)"
]
],
"Korollar-7.86": [
[
"",
"\\forall a,b\\in\\mathbb R:\\ \\int_a^b\\exp=\\exp b-\\exp a,\\quad \\int_a^b\\sin=-\\cos b+\\cos a,\\quad \\int_a^b\\cos=\\sin b-\\sin a"
]
],
"Proposition-7.97": [
[
"",
"f_P:[0,1]\\to[0,1]^2\\text{ stetig}\\ \\wedge\\ \\forall y\\in[0,1]^2\\ \\exists t\\in[0,1]:\\ f_P(t)=y"
]
],
"Definition-8.1": [
[
"",
"f\\text{ diff'bar bei }a:\\Longleftrightarrow \\exists L\\in\\mathbb R\\ \\forall\\varepsilon>0\\ \\exists\\delta>0\\ \\forall x\\in D:\\ 0<|x-a|<\\delta\\Rightarrow\\Big|\\frac{f(x)-f(a)}{x-a}-L\\Big|<\\varepsilon\\quad(L=f'(a))"
]
],
"Proposition-8.5": [
[
"",
"f,g\\text{ diff'bar bei }a\\implies (f+g)'(a)=f'(a)+g'(a)\\ \\wedge\\ (fg)'(a)=f'(a)g(a)+f(a)g'(a)"
]
],
"Korollar-8.6": [
[
"",
"\\forall x\\in\\mathbb R:\\ (1)'=0,\\qquad \\forall n\\in\\mathbb N\\ \\forall x\\in\\mathbb R:\\ (x^n)'=nx^{n-1}"
]
],
"Satz-8.8": [
[
"",
"f\\text{ diff'bar bei }x_0\\ \\wedge\\ g\\text{ diff'bar bei }f(x_0)\\implies (g\\circ f)'(x_0)=g'(f(x_0))\\,f'(x_0)"
]
],
"Korollar-8.11": [
[
"",
"f,g\\text{ diff'bar bei }a\\ \\wedge\\ g(a)\\neq0\\implies \\Big(\\frac fg\\Big)'(a)=\\frac{f'(a)g(a)-f(a)g'(a)}{g(a)^2}"
]
],
"Satz-8.14": [
[
"",
"f\\text{ bijektiv},\\ f,f^{-1}\\text{ stetig},\\ f\\text{ diff'bar bei }x_0,\\ f'(x_0)\\neq0\\implies (f^{-1})'(y_0)=\\frac{1}{f'(x_0)},\\quad y_0=f(x_0)"
]
],
"Definition-8.16": [
[
"lokales Maximum",
"\\exists\\delta>0\\ \\forall x\\in D\\cap(x_0-\\delta,x_0+\\delta):\\ f(x)\\le f(x_0)"
],
[
"isoliertes lok. Max.",
"\\exists\\delta>0\\ \\forall x\\in D\\cap(x_0-\\delta,x_0+\\delta)\\setminus\\{x_0\\}:\\ f(x)<f(x_0)"
]
],
"Proposition-8.17": [
[
"",
"x_0\\text{ lok. Extremum}\\ \\wedge\\ f\\text{ diff'bar bei }x_0\\ \\wedge\\ x_0\\text{ links- und rechtsseitiger HP von }D\\implies f'(x_0)=0"
]
],
"Korollar-8.18": [
[
"",
"x_0\\text{ lok. Extremum}\\implies x_0\\in\\{\\text{Endpunkte}\\}\\ \\vee\\ f\\text{ nicht diff'bar bei }x_0\\ \\vee\\ f'(x_0)=0"
]
],
"Korollar-8.25": [
[
"",
"(f+g)^{(n)}=f^{(n)}+g^{(n)},\\qquad (fg)^{(n)}=\\sum_{k=0}^n\\binom nk f^{(k)}g^{(n-k)}"
]
],
"Korollar-8.26": [
[
"",
"f,g\\ n\\text{-mal diff'bar}\\implies g\\circ f\\ n\\text{-mal diff'bar}"
]
],
"Satz-8.28": [
[
"",
"f\\in C([a,b])\\ \\wedge\\ f\\text{ diff'bar auf }(a,b)\\ \\wedge\\ f(a)=f(b)\\implies \\exists\\xi\\in(a,b):\\ f'(\\xi)=0"
]
],
"Theorem-8.29": [
[
"",
"f\\in C([a,b])\\ \\wedge\\ f\\text{ diff'bar auf }(a,b)\\implies \\exists\\xi\\in(a,b):\\ f'(\\xi)=\\frac{f(b)-f(a)}{b-a}"
]
],
"Korollar-8.33": [
[
"",
"\\big(\\exists c\\ \\forall x\\in I:\\ f(x)=c\\big)\\iff \\big(f\\text{ diff'bar}\\ \\wedge\\ \\forall x\\in I:\\ f'(x)=0\\big)"
]
],
"Korollar-8.37": [
[
"Randpunkt a",
"a\\in I\\ \\wedge\\ f'(a)>0\\Rightarrow a\\text{ isol. lok. Min.},\\qquad f'(a)<0\\Rightarrow a\\text{ isol. lok. Max.}"
],
[
"kein Extremum",
"\\exists\\delta>0\\ \\forall x\\in(x_0-\\delta,x_0+\\delta)\\setminus\\{x_0\\}:\\ f'(x)>0\\ \\ (\\text{bzw. }<0)\\implies \\text{kein lok. Extremum in }x_0"
],
[
"Maximum",
"\\exists\\delta>0:\\ \\big(\\forall x\\in(x_0-\\delta,x_0):\\ f'(x)>0\\big)\\wedge\\big(\\forall x\\in(x_0,x_0+\\delta):\\ f'(x)<0\\big)\\implies x_0\\text{ isol. lok. Max.}"
],
[
"Minimum",
"\\exists\\delta>0:\\ \\big(\\forall x\\in(x_0-\\delta,x_0):\\ f'(x)<0\\big)\\wedge\\big(\\forall x\\in(x_0,x_0+\\delta):\\ f'(x)>0\\big)\\implies x_0\\text{ isol. lok. Min.}"
],
[
"Randpunkt b",
"b\\in I\\ \\wedge\\ f'(b)>0\\Rightarrow b\\text{ isol. lok. Max.},\\qquad f'(b)<0\\Rightarrow b\\text{ isol. lok. Min.}"
],
[
"2. Ableitung",
"f\\in C^2(I)\\ \\wedge\\ f'(x_0)=0:\\quad f''(x_0)<0\\Rightarrow\\text{isol. lok. Max.},\\qquad f''(x_0)>0\\Rightarrow\\text{isol. lok. Min.}"
]
],
"Definition-8.38": [
[
"konvex",
"\\forall x_0,x_1\\in I\\ \\forall t\\in[0,1]:\\ f\\big((1-t)x_0+tx_1\\big)\\le(1-t)f(x_0)+tf(x_1)"
],
[
"streng konvex",
"\\forall x_0\\neq x_1\\in I\\ \\forall t\\in(0,1):\\ f\\big((1-t)x_0+tx_1\\big)<(1-t)f(x_0)+tf(x_1)"
]
],
"Lemma-8.39": [
[
"",
"f\\text{ konvex}\\iff \\forall x_0,x,x_1\\in I:\\ x_0<x<x_1\\Rightarrow\\frac{f(x)-f(x_0)}{x-x_0}\\le\\frac{f(x_1)-f(x)}{x_1-x}"
]
],
"Proposition-8.40": [
[
"",
"f\\text{ diff'bar}:\\quad f\\text{ (streng) konvex}\\iff f'\\text{ (streng) monoton wachsend}"
]
],
"Korollar-8.42": [
[
"",
"\\big(\\forall x\\in I:\\ f''(x)\\ge0\\big)\\Rightarrow f\\text{ konvex},\\qquad \\big(\\forall x\\in I:\\ f''(x)>0\\big)\\Rightarrow f\\text{ streng konvex}"
]
],
"Lemma-8.44": [
[
"",
"f\\text{ konvex},\\ t_k\\in[0,1],\\ \\sum_{k=1}^nt_k=1\\implies f\\Big(\\sum_{k=1}^nt_kx_k\\Big)\\le\\sum_{k=1}^nt_kf(x_k)"
]
],
"Satz-8.48": [
[
"",
"f,g\\in C([a,b]),\\ \\text{diff'bar auf }(a,b)\\implies \\exists\\xi\\in(a,b):\\ g'(\\xi)\\big(f(b)-f(a)\\big)=f'(\\xi)\\big(g(b)-g(a)\\big)"
]
],
"Satz-8.49": [
[
"",
"\\big(\\forall x:\\ g(x)\\neq0\\wedge g'(x)\\neq0\\big)\\wedge\\lim_{x\\searrow a}\\frac{f'(x)}{g'(x)}=L\\wedge\\Big(\\lim_{x\\searrow a}f=\\lim_{x\\searrow a}g=0\\ \\vee\\ \\lim_{x\\searrow a}g=\\pm\\infty\\Big)\\implies \\lim_{x\\searrow a}\\frac{f(x)}{g(x)}=L"
]
],
"Lemma-8.59": [
[
"",
"F'=f\\ \\wedge\\ F_1'=f\\text{ auf }I\\implies \\exists C\\in\\mathbb R\\ \\forall x\\in I:\\ F_1(x)=F(x)+C"
]
],
"Lemma-8.60": [
[
"",
"F'=f:\\quad \\big(\\forall x\\in I:\\ y'(x)+f(x)y(x)=0\\big)\\iff \\exists c\\in\\mathbb R\\ \\forall x\\in I:\\ y(x)=c\\,e^{-F(x)}"
]
],
"Lemma-8.61": [
[
"",
"y_{\\text{part}}'+fy_{\\text{part}}=g\\implies \\big(y'+fy=g\\iff \\exists y_{\\text{hom}}:\\ y_{\\text{hom}}'+fy_{\\text{hom}}=0\\ \\wedge\\ y=y_{\\text{part}}+y_{\\text{hom}}\\big)"
]
],
"Definition-9.1": [
[
"",
"F:[a,b]\\to\\mathbb R,\\qquad \\forall x\\in[a,b]:\\ F(x)=\\int_a^xf(t)\\,dt"
]
],
"Theorem-9.2": [
[
"",
"f\\in\\mathcal R([a,b])\\ \\wedge\\ f\\text{ stetig bei }x_0\\implies F(x)=\\int_a^xf(t)\\,dt\\text{ diff'bar bei }x_0\\ \\wedge\\ F'(x_0)=f(x_0)"
]
],
"Korollar-9.3": [
[
"",
"f\\in C([a,b])\\implies \\Big(F'=f\\iff \\exists C\\in\\mathbb R\\ \\forall x\\in[a,b]:\\ F(x)=\\int_a^xf(t)\\,dt+C\\Big)"
]
],
"Korollar-9.4": [
[
"",
"f\\in C([a,b])\\ \\wedge\\ F'=f\\implies \\int_a^bf(t)\\,dt=F(b)-F(a)"
]
],
"Korollar-9.5": [
[
"",
"F\\in C^1([a,b])\\implies \\forall x\\in[a,b]:\\ F(x)=F(a)+\\int_a^xF'(t)\\,dt"
]
],
"Korollar-9.11": [
[
"",
"R>0\\implies \\forall x\\in(-R,R):\\ f'(x)=\\sum_{n=1}^\\infty nc_nx^{n-1}\\quad(\\text{Radius }R)"
]
],
"Lemma-9.33": [
[
"",
"f\\ge0,\\ \\forall b>a:\\ f\\in\\mathcal R([a,b])\\implies \\int_a^\\infty f(x)\\,dx=\\sup\\Big\\{\\int_a^bf(x)\\,dx\\ \\Big|\\ b>a\\Big\\}\\in[0,\\infty]"
]
],
"Satz-9.35": [
[
"",
"f:[1,\\infty)\\to\\mathbb R_{\\ge0}\\text{ mon. fallend}\\implies \\sum_{n=2}^\\infty f(n)\\le\\int_1^\\infty f(x)\\,dx\\le\\sum_{n=1}^\\infty f(n)\\ \\wedge\\ \\Big(\\sum f(n)\\text{ konv.}\\iff\\int_1^\\infty f\\text{ konv.}\\Big)"
]
],
"Theorem-9.46": [
[
"",
"f\\in C^{n+1}((a,b))\\implies \\forall x\\in(a,b):\\ f(x)=\\sum_{k=0}^n\\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k+\\int_{x_0}^xf^{(n+1)}(t)\\frac{(x-t)^n}{n!}\\,dt"
]
],
"Korollar-9.47": [
[
"",
"\\big|f(x)-P^f_{x_0,n}(x)\\big|\\le M_{n+1}\\frac{|x-x_0|^{n+1}}{(n+1)!},\\qquad M_{n+1}=\\max_{t\\text{ zw. }x_0,x}|f^{(n+1)}(t)|"
]
],
"Lemma-9.67": [
[
"",
"\\varphi\\text{ Reparametrisierung}\\implies L(\\gamma\\circ\\varphi)=L(\\gamma);\\qquad \\gamma\\text{ regulär}\\implies \\exists\\varphi:\\ \\forall s:\\ \\|(\\gamma\\circ\\varphi)'(s)\\|=1"
]
]
};
