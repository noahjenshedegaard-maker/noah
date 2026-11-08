#!/bin/bash
# Builds OnTrack.app and OnTrack-mac.zip from ontrack/index.html.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/../dist"
APP="$OUT/OnTrack.app"
rm -rf "$APP" "$OUT/OnTrack-mac.zip"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp "$HERE/Info.plist" "$APP/Contents/Info.plist"
cp "$HERE/launcher.sh" "$APP/Contents/MacOS/OnTrack"
chmod 755 "$APP/Contents/MacOS/OnTrack"
cp "$HERE/../index.html" "$APP/Contents/Resources/index.html"
python3 "$HERE/make_icon.py" "$APP/Contents/Resources/OnTrack.icns"
mv "$APP/Contents/Resources/OnTrack.png" "$OUT/icon-preview.png"
printf 'APPL????' > "$APP/Contents/PkgInfo"
(cd "$OUT" && zip -qry OnTrack-mac.zip OnTrack.app)
echo "Built $OUT/OnTrack-mac.zip"
