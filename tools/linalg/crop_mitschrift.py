# Schneidet die Einträge aus der handschriftlichen Mitschrift aus (Zeilen aus lines.py, siehe entries.py)
import pymupdf as fitz, json, os, sys, numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(__file__) + '/..')
from entries import E
SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT + '/img', exist_ok=True)
B = json.load(open('ann/bands.json'))
DPI0, DPI = 110, 300; S = DPI / DPI0
_pages = {}
def page(f, p):
    """Seite in voller Scan-Auflösung (300 dpi), Karopapier weg, Schrift dunkel, Strichbreite wie im Original, Rot bleibt rot."""
    if (f, p) not in _pages:
        import cv2
        pix = fitz.open(f'{SRC}/{f}.pdf')[p].get_pixmap(dpi=DPI)
        rgb = np.asarray(Image.frombytes('RGB', (pix.width, pix.height), pix.samples)).astype(np.float32)
        mn = rgb.min(2)
        bg = cv2.blur(cv2.dilate(mn, np.ones((31, 31), np.uint8)), (31, 31))   # Papierhelligkeit (ungleichmässiger Scan)
        dark = np.clip(1 - mn / np.maximum(bg, 1), 0, 1)                      # 0 = Papier, 1 = Tinte
        sat = rgb.max(2) - mn
        dark[((sat < 70) & (dark < 0.30)) | (dark < 0.15)] = 0               # Karolinien und Rauschen weg
        d = np.clip((dark - 0.15) / 0.30, 0, 1) ** 0.8                        # kräftiger Kontrast, Strichbreite wie im Original
        red = ((rgb[..., 0] - rgb[..., 2] > 40) & (rgb[..., 0] - rgb[..., 1] > 40)).astype(np.uint8)
        red = cv2.dilate(red, np.ones((7, 7), np.uint8)) > 0
        ink = np.zeros_like(rgb); ink[red] = (205, 20, 45)
        out = 255 * (1 - d[..., None]) + ink * d[..., None]
        _pages[(f, p)] = Image.fromarray(np.clip(out, 0, 255).astype('uint8'))
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
    W0 = max(im.width for im in ims); H0 = sum(im.height for im in ims) + 14 * (len(ims) - 1)
    cv = Image.new('RGB', (W0, H0), 'white'); y = 0
    for im in ims: cv.paste(im, (0, y)); y += im.height + 14
    a = np.asarray(cv.convert('L')) < 160
    cols = np.where(a.sum(0) > 2)[0]
    if len(cols): cv = cv.crop((max(0, cols[0] - 25), 0, min(cv.width, cols[-1] + 25), cv.height))
    if cv.width > 1500: cv = cv.resize((1500, round(cv.height * 1500 / cv.width)), Image.LANCZOS)
    w, h = cv.size
    cv = cv.quantize(colors=16, dither=Image.Dither.NONE)
    fn = f'm{i:03d}.png'
    cv.save(f'{OUT}/img/{fn}', optimize=True)
    out.append(dict(idx=i, kind=kind, nr=nr, title=title, img=fn, w=w, h=h, src=regs))
json.dump(out, open(f'{OUT}/items.json', 'w'), ensure_ascii=False, indent=1)
print(len(out), sum(os.path.getsize(f'{OUT}/img/' + o['img']) for o in out) // 1024, 'KB')
