# Erzeugt linalg.js (Kartenset Lineare Algebra I/II) und kopiert die Bilder nach <repo>/img (Präfix la-).
#   Teil 1: Mitschrift der Vorlesung (handschriftlich) – Vorrang, Reihenfolge der Vorlesung
#   Teil 2: Skript Menny Akka Ginosar (LA I/II) – Stoff, der in der Mitschrift (noch) nicht vorkommt
import json, os, re, shutil, sys
import pymupdf as fitz
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, HERE + '/..')
from entries import E
from meta_mitschrift import PRIO_M, TIPS_M, SEC_OF, SECTIONS, PAGES
from meta_skript import T, TIPS
REPO, SKRIPT_PDF = sys.argv[1], sys.argv[2]
mit = json.load(open(HERE + '/../mit/items.json'))
skr = json.load(open(HERE + '/../skr/items.json'))
cards, chapters = [], {1: 'Algebraische Strukturen und die Sprache der Mathematik', 2: 'Vektorräume', 3: 'Lineare Abbildungen'}
for it in mit:
    kind, nr, title, regs = E[it['idx']]
    f, p, a, _ = regs[0]
    sid = SEC_OF[f]
    cid = f'm-{f}-{p}-{a}'
    img = f'la-{cid}.png'
    shutil.copy(HERE + '/../mit/img/' + it['img'], f'{REPO}/img/{img}')
    cards.append(dict(id=cid, kind=kind, nr=nr, chap=SECTIONS[sid][0], chapTitle=chapters[SECTIONS[sid][0]],
        sec=f'§{sid} {SECTIONS[sid][1]}', star=False, title=title, titled=True, prio=PRIO_M[it['idx']],
        tip=TIPS_M.get(it['idx'], ''), img=img, w=it['w'], h=it['h'], mask=None,
        page=PAGES[f][p], src='Mitschrift', proofP=None, proofH=None, text=title))
# Skript
doc = fitz.open(SKRIPT_PDF)
toc = doc.get_toc(); secs = []
for lvl, title, page in toc:
    m = re.match(r'^\s*', title)
    if lvl == 2: secs.append((page, title))
nums = {}
cur = [0, 0]
sec_named = []
for lvl, title, page in toc:
    if lvl == 1: cur = [cur[0] + 1, 0]
    elif lvl == 2: cur[1] += 1; sec_named.append((page, f'{cur[0] - 1}.{cur[1]} {title}'))
def sec_of(page):
    best = None
    for p, t in sec_named:
        if p <= page: best = t
    return best
CH = {3: (4, 'Rang und lineare Gleichungssysteme (Skript)'), 4: (5, 'Determinanten (Skript)'), 5: (6, 'Eigenwerte und Eigenvektoren (Skript)'),
      6: (7, 'Euklidische und unitäre Vektorräume (Skript)'), 7: (8, 'Lineare Abbildungen auf Skalarprodukträumen (Skript)'),
      8: (9, 'Bilinearformen und quadratische Formen (Skript)'), 9: (10, 'Jordan Normalform (Skript)'),
      10: (11, 'Dualraum II: Annulator (Skript)'), 11: (12, 'Multilineare Algebra und Tensorprodukt (Skript)')}
for it in skr:
    nr = it['nr']; ch, cht = CH[int(nr.split('.')[0])]; chapters[ch] = cht
    t, prio = T[nr]
    title = t or re.sub(r'\d+$', '', (it['title'] or '').strip('[] ')) or ''
    if nr == '6.5.5': title = 'Darstellungssatz von Riesz'
    if nr == '7.4.17': title = 'Satz vom Fussball'
    cid = f"s-{it['kind']}-{nr}"; img = 'la-' + it['img']
    shutil.copy(HERE + '/../skr/img/' + it['img'], f'{REPO}/img/{img}')
    cards.append(dict(id=cid, kind=it['kind'], nr=nr, chap=ch, chapTitle=cht, sec=sec_of(it['page']), star=False,
        title=title, titled=bool(it['title']) and t is None, prio=max(1, prio - 1), tip=TIPS.get(nr, ''), img=img, w=it['w'], h=it['h'],
        mask=it['mask'], page=it['page'], src='Skript', proofP=None, proofH=None, text=re.sub(r'\s+', ' ', it['plain'])[:400]))
for i, c in enumerate(cards): c['ord'] = i
assert len({c['id'] for c in cards}) == len(cards)
with open(f'{REPO}/linalg.js', 'w') as fo:
    fo.write('// LemmaLab – Kartenset Lineare Algebra I/II. Automatisch erzeugt (tools/linalg/build_la.py). Nicht von Hand ändern.\n')
    fo.write('// Kap. 1–3: Mitschrift der Vorlesung (Vorrang); Kap. 4–12: Skript Menny Akka Ginosar für Stoff, der noch nicht in der Mitschrift ist.\n')
    fo.write('window.CARDS = ' + json.dumps(cards, ensure_ascii=False, separators=(',', ':')) + ';\n')
    fo.write('window.CHAPTERS = ' + json.dumps(chapters, ensure_ascii=False) + ';\n')
from collections import Counter
print(len(cards), Counter(c['src'] for c in cards), sorted(Counter(c['prio'] for c in cards).items()))
