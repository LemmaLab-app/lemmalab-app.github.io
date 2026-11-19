# Schneidet Definitionen, Sätze, … aus dem LinAlg-Skript (Menny Akka Ginosar, LA I/II) aus.
import pymupdf as fitz, re, json, os, sys
PDF = sys.argv[1]; OUT = sys.argv[2]
RANGES = [(94, 101), (120, 139), (148, 343), (344, 389), (404, 408), (409, 441)]   # gedruckte Seiten = PDF-Seiten
os.makedirs(OUT + '/img', exist_ok=True)
doc = fitz.open(PDF)
M = 83.0; RIGHT = 530.0; TOP = 62; BOT = 768
ENV = r'(Definition|Satz|Korollar|Lemma|Proposition|Theorem)'
HEAD = re.compile(r'^' + ENV + r'\s+(\d+\.\d+\.\d+)\s*(\((.*?)\))?')
STOPW = re.compile(r'^(Definition|Satz|Korollar|Lemma|Proposition|Theorem|Beispiel|Bemerkung|Übung|Notation|Konvention|Warnung|Frage|Aufgabe|Erinnerung|Algorithmus|Fazit|Achtung|Behauptung|Beobachtung|Motivation|Wichtig|Spezialfall)\b')
def norm(t): return t.replace('ﬁ', 'fi').replace('ﬂ', 'fl').replace('ﬀ', 'ff')
def lines_of(p):
    out = []
    for b in doc[p].get_text('dict')['blocks']:
        for l in b.get('lines', []):
            s = [x for x in l['spans'] if x['text'].strip()]
            if not s: continue
            t = norm(''.join(x['text'] for x in l['spans']).strip())
            y0, y1 = l['bbox'][1], l['bbox'][3]
            if y0 < TOP or y0 > BOT: continue
            out.append(dict(x0=l['bbox'][0], y0=y0, y1=y1, font=s[0]['font'], size=s[0]['size'], text=t))
    out.sort(key=lambda r: (round(r['y0']), r['x0']))
    # Fussnoten (10pt-Block am Seitenende) abschneiden
    k = len(out)
    while k > 0 and out[k - 1]['size'] < 11: k -= 1
    if k < len(out) and any(o['size'] < 10.5 and o['size'] > 9 for o in out[k:]):
        out = out[:k]
    return out
_fig = {}
def figs(p, ymin):
    if p not in _fig:
        tops = [d['rect'].y0 for d in doc[p].get_drawings() if d['rect'].height > 40 and d['rect'].width > 60]
        tops += [b['bbox'][1] for b in doc[p].get_text('dict')['blocks'] if b.get('type') == 1 and b['bbox'][3] - b['bbox'][1] > 30]
        _fig[p] = sorted(tops)
    return [t for t in _fig[p] if t > ymin]
def is_stop(l, kind='Definition'):
    t = l['text']; f = l['font']
    if l['x0'] < M + 3 and f.startswith('SFTI') and re.search(r'Beweis', t[:45]): return True
    if f.startswith('SFBX') and l['size'] > 12.5: return True          # Abschnittstitel
    if l['x0'] < M + 3 and STOPW.match(t) and (f.startswith('SFBX') or f.startswith('SFTI')): return True
    if t.startswith('Beweis') and l['x0'] < M + 3: return True
    if re.match(r'^(Figur|Abbildung|Tabelle) \d', t): return True
    if M + 12 <= l['x0'] <= M + 18 and f.startswith('SFRM') and (kind != 'Definition' or not re.match(r'^(•|\(|\d|[a-z]\))', t)): return True  # neuer Absatz
    return False
items = []
pages = [p - 1 for a, b in RANGES for p in range(a, b + 1)]
for pno in pages:
    L = lines_of(pno)
    for i, l in enumerate(L):
        m = HEAD.match(l['text'])
        if not m or not l['font'].startswith('SFBX') or l['x0'] > M + 3: continue
        kind, nr, title = m.group(1), m.group(2), m.group(4)
        regions = []; cur, sy, j, lines = pno, l['y0'] - 3, i + 1, L
        while True:
            stop = next((x for x in lines[j:] if is_stop(x, kind)), None)
            fg = figs(cur, sy + 12)
            if stop is not None:
                ye = stop['y0'] - 4
                if fg and fg[0] < ye: ye = fg[0] - 4
                regions.append((cur, sy, ye)); break
            if fg:
                regions.append((cur, sy, fg[0] - 4)); break
            ymax = max([x['y1'] for x in lines if x['y0'] >= sy] + [sy + 10])
            regions.append((cur, sy, min(ymax + 3, BOT)))
            cur += 1
            if cur not in pages or len(regions) > 2: break
            lines = lines_of(cur)
            if not lines: break
            sy = lines[0]['y0'] - 3; j = 0
        items.append(dict(kind=kind, nr=nr, title=title, page=pno + 1, regions=regions))
items = [it for it in items if not it['nr'].startswith('3.') or it['nr'] in {'3.2.3','3.2.5','3.2.8','3.2.9','3.2.11','3.2.14'} or it['nr'][:3] in ('3.4','3.6')]
seen = set(); items = [it for it in items if not (it['kind'] + it['nr'] in seen or seen.add(it['kind'] + it['nr']))]
from PIL import Image
Z = 2.2
for it in items:
    ims = []
    for (p, y0, y1) in it['regions']:
        if y1 - y0 < 14: continue
        pix = doc[p].get_pixmap(matrix=fitz.Matrix(Z, Z), clip=fitz.Rect(M - 5, y0, RIGHT + 18, y1))
        ims.append(Image.frombytes('RGB', (pix.width, pix.height), pix.samples))
    if not ims: continue
    w = max(im.width for im in ims); h = sum(im.height for im in ims) + 12 * (len(ims) - 1)
    cv = Image.new('RGB', (w, h), 'white'); y = 0
    for im in ims: cv.paste(im, (0, y)); y += im.height + 12
    cv = cv.convert('L').quantize(colors=8, dither=Image.Dither.NONE)
    fn = f"s{it['kind'][:3].lower()}-{it['nr'].replace('.', '-')}.png"
    cv.save(f'{OUT}/img/{fn}', optimize=True, bits=3)
    it.update(img=fn, w=w, h=h)
    # Maske über dem fett gesetzten Titel (bis zum Punkt nach der Nummer bzw. der Klammer)
    p, y0, _ = it['regions'][0]; mask = None
    for b in doc[p].get_text('dict')['blocks']:
        for l in b.get('lines', []):
            if abs(l['bbox'][1] - (y0 + 3)) < 2.5 and l['spans'] and l['spans'][0]['font'].startswith('SFBX'):
                x1 = None
                for sp in l['spans']:
                    if not sp['font'].startswith('SFBX'): break
                    x1 = sp['bbox'][2]
                    if sp['text'].rstrip().endswith('.') and (')' in sp['text'] or not it['title']): break
                mask = [0, max(0, (l['bbox'][1] - y0 - 1) * Z), (x1 - (M - 5) + 2) * Z, (l['bbox'][3] - y0 + 1) * Z]
                break
        if mask: break
    it['mask'] = [round(v) for v in mask] if mask else None
    txt = [doc[p].get_text('text', clip=fitz.Rect(M - 5, y0, RIGHT + 5, y1)) for (p, y0, y1) in it['regions']]
    it['plain'] = norm(re.sub(r'\s+', ' ', ' '.join(txt)).strip())
KEEP3 = {'3.2.3', '3.2.5', '3.2.8', '3.2.9', '3.2.11', '3.2.14'}
items = [it for it in items if not it['nr'].startswith('3.') or it['nr'] in KEEP3 or it['nr'][:3] in ('3.4', '3.6')]
items = [it for it in items if 'img' in it]
json.dump(items, open(f'{OUT}/items.json', 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(items), Counter(i['kind'] for i in items), Counter(i['nr'].split('.')[0] for i in items))
