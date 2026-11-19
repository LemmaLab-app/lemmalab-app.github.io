"""Erzeugt sw.js mit der Liste aller Dateien, die offline verfügbar sein sollen."""
import os, json, hashlib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files = ['./', 'index.html', 'fach.js', 'app.js', 'data.js', 'logic.js', 'physik.js', 'account.js', 'manifest.webmanifest',
         'vendor/supabase/supabase.js',
         'vendor/katex/katex.min.js', 'vendor/katex/katex.min.css']
files += ['vendor/katex/fonts/' + f for f in sorted(os.listdir(os.path.join(ROOT, 'vendor/katex/fonts')))]
files += ['icons/' + f for f in sorted(os.listdir(os.path.join(ROOT, 'icons')))]
files += ['img/' + f for f in sorted(os.listdir(os.path.join(ROOT, 'img')))]
h = hashlib.sha1()
for f in files:
    p = os.path.join(ROOT, 'index.html' if f == './' else f)
    h.update(open(p, 'rb').read())
version = h.hexdigest()[:10]
tpl = open(os.path.join(ROOT, 'tools/sw.template.js')).read()
open(os.path.join(ROOT, 'sw.js'), 'w').write(tpl.replace('__VERSION__', version).replace('__FILES__', json.dumps(files, indent=1)))
print('sw.js', version, len(files), 'Dateien')
