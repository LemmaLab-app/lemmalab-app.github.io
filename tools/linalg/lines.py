# Erkennt Schriftzeilen auf handschriftlichen Seiten (Tintenprofil) und nummeriert sie
import pymupdf as fitz, numpy as np, sys, json, glob, os
from PIL import Image, ImageDraw, ImageFont
DPI = 110
def bands(im):
    a = np.asarray(im.convert('RGB')).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    gray = (r + g + b) / 3
    ink = (gray < 110) | ((r > 150) & (g < 90) & (b < 110))   # schwarz/blau oder rot
    ink[:, :60] = False; ink[:, -40:] = False                  # Lochrand
    prof = ink.sum(1)
    rows = prof > 4
    out = []; y = 0; H = len(rows)
    while y < H:
        if rows[y]:
            s = y
            while y < H and rows[y]: y += 1
            out.append([s, y])
        y += 1
    m = []
    for s, e in out:
        if m and s - m[-1][1] < 7: m[-1][1] = e
        else: m.append([s, e])
    return [b for b in m if b[1] - b[0] >= 6]
if __name__ == '__main__':
    src, outdir = sys.argv[1], sys.argv[2]
    os.makedirs(outdir, exist_ok=True)
    res = {}
    font = ImageFont.load_default(size=22)
    for f in sorted(glob.glob(src + '/*.pdf')):
        d = fitz.open(f); key = os.path.basename(f)[:-4]
        for p in range(len(d)):
            pix = d[p].get_pixmap(dpi=DPI)
            im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
            B = bands(im); res[f'{key}/{p}'] = B
            dr = ImageDraw.Draw(im)
            for i, (s, e) in enumerate(B):
                dr.line([(0, s), (25, s)], fill=(0, 160, 0), width=2)
                dr.text((2, (s + e) / 2 - 11), str(i), fill=(0, 140, 0), font=font)
            im.save(f'{outdir}/{key}_{p}.jpg', quality=72)
    json.dump(res, open(outdir + '/bands.json', 'w'))
