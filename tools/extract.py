import pymupdf as fitz, re, json, os, sys

PDF = '/mnt/user-data/uploads/b73cbd1c-Analysis-Skript.pdf'
FIRST, LAST = 16, 491          # Kapitel 1-9 (1-basiert)
OUT = sys.argv[1] if len(sys.argv) > 1 else 'out'
os.makedirs(OUT + '/img', exist_ok=True)

KINDS = ['Definition', 'Satz', 'Korollar', 'Lemma', 'Proposition', 'Theorem', 'Axiom']
ANY_ENV = re.compile(r'^(Definition|Satz|Korollar|Lemma|Proposition|Theorem|Axiom|Beispiel|Übung|Wichtige|Bemerkung|Applet|Notation|Konvention|Aufgabe|Warnung|Frage|Interpretation|Variante|Erweiterung|Diskussion)\b')
HEAD = re.compile(r'^(Definition|Satz|Korollar|Lemma|Proposition|Theorem|Axiom)\s+(\d+\.\d+)\s*(\((.*?)\))?')

doc = fitz.open(PDF)

def lines_of(pno):
    pg = doc[pno]
    out = []
    for b in pg.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            s = l['spans']
            t = ''.join(x['text'] for x in s).strip()
            if not t:
                continue
            out.append(dict(x0=l['bbox'][0], y0=l['bbox'][1], x1=l['bbox'][2], y1=l['bbox'][3],
                            font=s[0]['font'], size=s[0]['size'], text=t,
                            bold=s[0]['font'].startswith('SFBX')))
    out.sort(key=lambda r: (round(r['y0']), r['x0']))
    return out

def page_bounds(lines):
    # Kopf-/Fusszeile ausschliessen: Seitenzahl unten, Fussnoten klein
    body = [l for l in lines if l['size'] > 10 and not re.fullmatch(r'\d+', l['text'])]
    return body

_figcache = {}
def fig_tops(p, ymin):
    if p not in _figcache:
        tops = []
        for d in doc[p].get_drawings():
            r = d['rect']
            if r.height > 40 and r.width > 40:
                tops.append(r.y0)
        for b in doc[p].get_text('dict')['blocks']:
            if b.get('type') == 1:
                tops.append(b['bbox'][1])
        _figcache[p] = sorted(tops)
    return [t for t in _figcache[p] if t > ymin]

def margin_of_page(p):
    return 82.8 if (p + 1) % 2 == 0 else 72.0

def margin_of(lines):
    from collections import Counter
    c = Counter(round(l['x0']) for l in lines if l['font'].startswith('SFRM'))
    m = min([x for x, n in c.items() if n >= 3] or [72])
    return m

def is_stop(l, kind, M=72):
    t = l['text']
    if l['bold'] and ANY_ENV.match(t):
        return True
    if l['font'].startswith('SFBX') and l['size'] > 11:   # Abschnittstitel
        return True
    if t.startswith('Beweis') and l['font'].startswith('SFTI'):
        return True
    if t.startswith('Figur') or t.startswith('Tabelle'):
        return True
    # neuer Absatz (Einzug ~98) in aufrechter Schrift
    if M + 13.5 <= l['x0'] <= M + 16 and l['font'].startswith('SFRM') and not re.match(r'^\(?[ivxa-h0-9]+\)', t) and not t.startswith('•'):
        return True
    return False

items = []
for pno in range(FIRST - 1, LAST):
    L = page_bounds(lines_of(pno))
    for i, l in enumerate(L):
        if not l['bold']:
            continue
        m = HEAD.match(l['text'])
        if not m or l['x0'] > margin_of_page(pno) + 3:
            continue
        kind, nr, _, title = m.group(1), m.group(2), m.group(3), m.group(4)
        # Region(en) sammeln
        regions = []
        cur_p, start_y = pno, l['y0'] - 3
        j = i + 1
        lines = L
        end_y = None
        while True:
            stop = None
            for k in range(j, len(lines)):
                if is_stop(lines[k], kind, margin_of_page(cur_p)):
                    stop = lines[k]
                    break
            figs = fig_tops(cur_p, start_y + 12)
            if stop is not None:
                y_end = stop['y0'] - 4
                if figs and figs[0] < y_end:
                    y_end = figs[0] - 4
                regions.append((cur_p, start_y, y_end))
                break
            if figs:
                regions.append((cur_p, start_y, figs[0] - 4))
                break
            # bis Seitenende
            ymax = max([x['y1'] for x in lines if x['y0'] >= start_y] + [start_y + 10])
            regions.append((cur_p, max(start_y, 66), min(ymax + 3, 768)))
            cur_p += 1
            if cur_p > LAST or len(regions) > 2:
                break
            lines = page_bounds(lines_of(cur_p))
            if not lines:
                break
            start_y = lines[0]['y0'] - 3
            j = 0
        items.append(dict(kind=kind, nr=nr, title=title, page=pno + 1, regions=regions,
                          text=l['text']))

# Duplikate (gleiche Nummer) – erste behalten
seen, uniq = set(), []
for it in items:
    key = it['kind'] + it['nr']
    if key in seen:
        continue
    seen.add(key)
    uniq.append(it)
items = uniq
OVR = {'Proposition3.26': 282, 'Satz2.75': 438}
for it in items:
    k = it['kind'] + it['nr']
    if k in OVR:
        p, y0, _ = it['regions'][0]
        it['regions'] = [(p, y0, OVR[k])]

from PIL import Image
ZOOM = 2.2
for it in items:
    ims = []
    for (p, y0, y1) in it['regions']:
        pg = doc[p]
        if y1 - y0 < 16:
            continue
        M = margin_of_page(p); clip = fitz.Rect(M - 5, y0, M + 447, y1)
        pix = pg.get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM), clip=clip)
        ims.append(Image.frombytes('RGB', (pix.width, pix.height), pix.samples))
    if not ims:
        continue
    w = max(im.width for im in ims)
    h = sum(im.height for im in ims) + 12 * (len(ims) - 1)
    canvas = Image.new('RGB', (w, h), 'white')
    y = 0
    for im in ims:
        canvas.paste(im, (0, y)); y += im.height + 12
    canvas = canvas.convert('L').quantize(colors=8, dither=Image.Dither.NONE)
    fn = f"{it['kind'][:3].lower()}-{it['nr'].replace('.', '-')}.png"
    canvas.save(f"{OUT}/img/{fn}", optimize=True, bits=3)
    it['img'] = fn
    it['h'] = h; it['w'] = w
    # Maske für den Titel (Kopfzeile bis inkl. Schlusspunkt)
    p, y0, _ = it['regions'][0]
    M = margin_of_page(p)
    mask = None
    for b in doc[p].get_text('dict')['blocks']:
        for l in b.get('lines', []):
            if abs(l['bbox'][1] - (y0 + 3)) < 2.5 and l['spans'] and l['spans'][0]['font'].startswith('SFBX'):
                x1 = None; depth = 0; seen_title = False
                for sp in l['spans']:
                    t = sp['text']
                    x1 = sp['bbox'][2]
                    if '(' in t: seen_title = True
                    if sp['font'].startswith('SFBX') and t.strip().endswith('.') and (seen_title or re.search(r'\d\.\d+\.$', t.strip())):
                        break
                    if sp['font'].startswith('SFBX') and t.strip() == '.':
                        break
                mask = [0, max(0, (l['bbox'][1] - y0 - 1) * ZOOM), (x1 - (M - 5) + 2) * ZOOM, (l['bbox'][3] - y0 + 1) * ZOOM]
                break
        if mask: break
    it['mask'] = [round(v) for v in mask] if mask else None
    # Klartext (für Suche)
    txt = []
    for (p, y0, y1) in it['regions']:
        M = margin_of_page(p); txt.append(doc[p].get_text('text', clip=fitz.Rect(M - 5, y0, M + 447, y1)))
    it['plain'] = re.sub(r'\s+', ' ', ' '.join(txt)).strip()

json.dump(items, open(f'{OUT}/items.json', 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(items), Counter(i['kind'] for i in items))
