import json, sys, re, shutil, os
import pymupdf as fitz
sys.path.insert(0, '/home/claude/src')
sys.path.insert(0, '/home/claude/prozentuale-wichtigkeit-der-beweise-analysis-1/daten')
from meta import NAMES, PRIO, TIPS
from beweise import B

DEST = sys.argv[1]
items = json.load(open('/home/claude/src/out/items.json'))
doc = fitz.open('/mnt/user-data/uploads/b73cbd1c-Analysis-Skript.pdf')

# Abschnitte aus dem Inhaltsverzeichnis
toc = doc.get_toc()
secs = []  # (startpage, chapter_no, chapter_title, section_title, starred)
chap_titles = {}
ci = 0
for lvl, title, page in toc:
    if lvl == 1:
        ci += 1
        chap_titles[ci] = title
        if ci > 9: break
        secs.append((page, ci, title, title, False))
    elif lvl == 2 and ci <= 9:
        secs.append((page, ci, chap_titles[ci], title, title.strip().endswith('*')))

def sec_of(page):
    best = None
    for s in secs:
        if s[0] <= page: best = s
    return best

# Beweis-Wahrscheinlichkeit aus dem Modell
G, K = 1.0, 2.5
C = {0: 0.35, 1: 0.8, 2: 2.0}; S = {0: 0.1, 1: 0.55, 2: 1.0}
rows = []
for nr, name, kap, h, ho, a, z, l in B:
    w = (G + h + 0.5 * ho + 0.3 * a) * C[z] * S[l]
    rows.append((nr, w, h, ho))
W = sum(r[1] for r in rows)
ABBR = {'Prop.': 'Proposition', 'Kor.': 'Korollar', 'Thm.': 'Theorem', 'Lemma': 'Lemma', 'Satz': 'Satz'}
proof = {}
for nr, w, h, ho in rows:
    p = 1 - (1 - w / W) ** K
    parts = nr.split('/')
    kind = None
    for part in parts:
        part = part.strip()
        m = re.match(r'(Prop\.|Kor\.|Thm\.|Lemma|Satz)?\s*(\d+\.\d+)', part)
        if m.group(1): kind = ABBR[m.group(1)]
        proof[f'{kind} {m.group(2)}'] = dict(p=round(p, 4), h=h, ho=ho)

cards = []
for it in items:
    key = f"{it['kind']} {it['nr']}"
    s = sec_of(it['page'])
    chap = int(it['nr'].split('.')[0])
    prio = PRIO.get(key, 3)
    if s[4] and prio > 2: prio = 2   # Sternabschnitte = Zusatzstoff
    pr = proof.get(key)
    cards.append(dict(
        id=key.replace(' ', '-'),
        kind=it['kind'], nr=it['nr'], chap=chap,
        chapTitle=chap_titles[chap], sec=s[3], star=s[4],
        title=it['title'] or NAMES.get(key, ''), titled=bool(it['title']),
        prio=prio, tip=TIPS.get(key, ''),
        img=it['img'], w=it['w'], h=it['h'], mask=it['mask'],
        page=it['page'] - 15,            # gedruckte Seitenzahl
        proofP=pr['p'] if pr else None, proofH=(pr['h'] + pr['ho']) if pr else None,
        text=re.sub(r'\s+', ' ', it['plain'])[:400],
    ))

missing = [k for k in list(PRIO) + list(TIPS) + list(NAMES) if k.replace(' ', '-') not in {c['id'] for c in cards}]
assert not missing, missing
# Sortierschlüssel = Reihenfolge im Skript
for i, c in enumerate(cards): c['ord'] = i

os.makedirs(DEST + '/img', exist_ok=True)
for c in cards:
    shutil.copy('/home/claude/src/out/img/' + c['img'], DEST + '/img/' + c['img'])
with open(DEST + '/data.js', 'w') as f:
    f.write('// Automatisch erzeugt aus dem Skript (Kapitel 1–9). Nicht von Hand ändern.\n')
    f.write('window.CARDS = ' + json.dumps(cards, ensure_ascii=False, separators=(',', ':')) + ';\n')
    f.write('window.CHAPTERS = ' + json.dumps({k: v for k, v in chap_titles.items() if k <= 9}, ensure_ascii=False) + ';\n')
from collections import Counter
print(len(cards), Counter(c['prio'] for c in cards), sum(1 for c in cards if c['proofP']))
