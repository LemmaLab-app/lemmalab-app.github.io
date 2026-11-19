# Schneidet die Einträge aus der handschriftlichen Mitschrift aus (Zeilen aus lines.py, siehe entries.py)
import pymupdf as fitz, json, os, sys, numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(__file__) + '/..')
from entries import E
SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT + '/img', exist_ok=True)
B = json.load(open('ann/bands.json'))
DPI0, DPI = 110, 170; S = DPI / DPI0
_pages = {}
def page(f, p):
    if (f, p) not in _pages:
        pix = fitz.open(f'{SRC}/{f}.pdf')[p].get_pixmap(dpi=DPI)
        im = np.asarray(Image.frombytes('RGB', (pix.width, pix.height), pix.samples)).astype(int)
        # Karopapier entfernen: helle, wenig gesättigte Pixel werden weiss
        mx, mn = im.max(2), im.min(2)
        light = (mn > 150) & (mx - mn < 70) | (mn > 195)
        im[light] = 255
        img = Image.fromarray(im.astype('uint8'))
        # Bessere Lesbarkeit: Striche verdicken (Minimumfilter) und Mitteltöne abdunkeln, Farben (rot) bleiben erhalten
        img = img.filter(ImageFilter.MinFilter(3))
        a = np.asarray(img).astype(float) / 255
        a = np.where(a > 0.93, 1.0, a ** 2.4)
        _pages[(f, p)] = Image.fromarray((a * 255).astype('uint8'))
    return _pages[(f, p)]
def trim(im, pb, pt):
    # Nicht mitten durch eine Zeile schneiden: Schrift, die im Rand unten/oben nach einer Lücke beginnt, wegschneiden
    a = np.asarray(im.convert('L')) < 215
    rows = a.sum(1) > 0
    h = len(rows); y1 = h; y0 = 0
    if rows[h - pb:].any():
        for y in range(h - 3, h - pb - 1, -1):
            if not rows[y:y + 3].any() and rows[y + 3:].any(): y1 = y + 2; break
    if rows[:pt].any():
        for y in range(0, pt - 3):
            if not rows[y:y + 4].any() and rows[:y].any(): y0 = y + 2; break
    return im.crop((0, y0, im.width, y1))
out = []
for i, (kind, nr, title, regs) in enumerate(E):
    ims = []
    for (f, p, a, b) in regs:
        bd = B[f'{f}/{p}']
        y0 = (bd[a][0] - 7) * S; y1 = (bd[b][1] + 22) * S
        im = page(f, p); W = im.width
        cr = im.crop((int(0.075 * W), max(0, int(y0)), int(0.975 * W), min(im.height, int(y1))))
        ims.append(trim(cr, int(22 * S), int(7 * S)))
    w = max(im.width for im in ims); h = sum(im.height for im in ims) + 14 * (len(ims) - 1)
    cv = Image.new('RGB', (w, h), 'white'); y = 0
    for im in ims: cv.paste(im, (0, y)); y += im.height + 14
    cv = cv.quantize(colors=16, dither=Image.Dither.NONE)
    fn = f'm{i:03d}.png'
    cv.save(f'{OUT}/img/{fn}', optimize=True)
    out.append(dict(idx=i, kind=kind, nr=nr, title=title, img=fn, w=w, h=h, src=regs))
json.dump(out, open(f'{OUT}/items.json', 'w'), ensure_ascii=False, indent=1)
print(len(out), sum(os.path.getsize(f'{OUT}/img/' + o['img']) for o in out) // 1024, 'KB')
