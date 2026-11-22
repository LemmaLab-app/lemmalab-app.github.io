#!/bin/sh
# Version erhöhen: setzt APP_VERSION und alle ?v= in index.html auf die aktuelle UTC-Zeit
# (JJJJ-MM-TT.HHMM) und baut sw.js neu. Zeitbasiert, damit parallele Änderungen nie auf
# eine ältere/gleiche Nummer zurückfallen – die Update-Erkennung braucht nur eine neue Zeichenkette.
cd "$(dirname "$0")/.." || exit 1
V=$(date -u +%Y-%m-%d.%H%M)
sed -i -E "s/const APP_VERSION = '[^']+'/const APP_VERSION = '$V'/" app.js
sed -i -E "s/\?v=[0-9]{4}-[0-9]{2}-[0-9]{2}\.[0-9]+/?v=$V/g; s/(name=\"lemmalab-v\" content=\")[^\"]+/\1$V/" index.html
python3 tools/build_sw.py >/dev/null
echo "$V"
