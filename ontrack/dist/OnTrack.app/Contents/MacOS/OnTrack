#!/bin/bash
# OnTrack launcher: opens the app page in its own window.
# Uses Chrome/Edge/Brave "app mode" (no tabs or address bar) if one is installed, otherwise Safari.
RES="$(cd "$(dirname "$0")/../Resources" && pwd)"
PAGE="file://${RES// /%20}/index.html"
for B in "Google Chrome" "Microsoft Edge" "Brave Browser"; do
  if open -Ra "$B" >/dev/null 2>&1; then
    exec open -na "$B" --args --app="$PAGE"
  fi
done
exec open -a Safari "$RES/index.html"
