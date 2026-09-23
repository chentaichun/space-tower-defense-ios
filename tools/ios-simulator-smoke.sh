#!/bin/bash
set -euo pipefail
app="build/ios-simulator/Build/Products/Debug-iphonesimulator/App.app"
output="build/ios-simulator/smoke"
mkdir -p "$output"
xcrun simctl list devices available --json > "$output/devices.json"
device=$(python3 - "$output/devices.json" <<'PY'
import json, sys
data = json.load(open(sys.argv[1]))
phones = [d for runtime, devices in data['devices'].items() if 'iOS' in runtime
          for d in devices if d.get('isAvailable') and d['name'].startswith('iPhone')]
if not phones:
    raise SystemExit('No available iPhone simulator')
print(phones[0]['udid'])
PY
)
xcrun simctl boot "$device" || true
xcrun simctl bootstatus "$device" -b
xcrun simctl install "$device" "$app"
launch=$(xcrun simctl launch --terminate-running-process "$device" com.mrchen.spacetowerdefense)
printf '%s\n' "$launch" > "$output/launch.txt"
pid=${launch##*: }
sleep 12
xcrun simctl io "$device" screenshot "$output/launch.png"
ps -p "$pid" -o pid=,comm= > "$output/processes.txt" || true
cat "$output/processes.txt"
if ! kill -0 "$pid" 2>/dev/null; then
  echo 'App process exited during launch smoke test'
  xcrun simctl spawn "$device" log show --last 2m --style compact --predicate 'process == "App"' > "$output/app.log" || true
  tail -n 100 "$output/app.log"
  exit 1
fi
echo 'iPhone simulator app survived 12 seconds; gameplay, purchases and device acceptance remain unverified.'
