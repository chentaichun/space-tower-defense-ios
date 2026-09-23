#!/bin/bash
set -euo pipefail
app="build/ios-simulator/Build/Products/Debug-iphonesimulator/App.app"
output="build/ios-simulator/smoke"
mkdir -p "$output"
bounded() {
  python3 - "$@" <<'PY'
import subprocess, sys
try:
    result = subprocess.run(sys.argv[2:], timeout=int(sys.argv[1]))
    raise SystemExit(result.returncode)
except subprocess.TimeoutExpired:
    print('Simulator command timed out: ' + ' '.join(sys.argv[2:]), file=sys.stderr)
    raise SystemExit(124)
PY
}
xcrun simctl list devices available --json > "$output/devices.json"
device=$(python3 - "$output/devices.json" <<'PY'
import json, sys
data = json.load(open(sys.argv[1]))
phones = [d for runtime, devices in data['devices'].items() if 'iOS' in runtime
          for d in devices if d.get('isAvailable') and d['name'].startswith('iPhone')]
if not phones:
    raise SystemExit('No available iPhone simulator')
preferred = [d for d in phones if 'Pro Max' in d['name']]
print((preferred or phones)[0]['udid'])
PY
)
xcrun simctl boot "$device" || true
bounded 180 xcrun simctl bootstatus "$device" -b
echo 'Installing simulator app'
bounded 90 xcrun simctl install "$device" "$app"
echo 'Launching simulator app'
launch=$(bounded 90 xcrun simctl launch --terminate-running-process "$device" com.mrchen.spacetowerdefense)
printf '%s\n' "$launch" > "$output/launch.txt"
pid=${launch##*: }
sleep 12
bounded 30 xcrun simctl io "$device" screenshot "$output/launch.png"
ps -p "$pid" -o pid=,comm= > "$output/processes.txt" || true
cat "$output/processes.txt"
if ! kill -0 "$pid" 2>/dev/null; then
  echo 'App process exited during launch smoke test'
  bounded 30 xcrun simctl spawn "$device" log show --last 2m --style compact --predicate 'process == "App"' > "$output/app.log" || true
  tail -n 100 "$output/app.log"
  exit 1
fi
echo 'iPhone simulator app survived 12 seconds; gameplay, purchases and device acceptance remain unverified.'

# Capture the second supported device family from the same native build.
# Screenshots are evidence for visual inspection, not an automatic acceptance pass.
xcrun simctl shutdown "$device"
tablet=$(python3 - "$output/devices.json" <<'PY'
import json, sys
data = json.load(open(sys.argv[1]))
tablets = [d for runtime, devices in data['devices'].items() if 'iOS' in runtime
           for d in devices if d.get('isAvailable') and 'iPad Pro 13-inch' in d['name']]
if not tablets:
    raise SystemExit('No available 13-inch iPad Pro simulator')
print(tablets[0]['udid'])
PY
)
xcrun simctl boot "$tablet"
bounded 180 xcrun simctl bootstatus "$tablet" -b
bounded 90 xcrun simctl install "$tablet" "$app"
launch=$(bounded 90 xcrun simctl launch --terminate-running-process "$tablet" com.mrchen.spacetowerdefense)
printf '%s\n' "$launch" > "$output/ipad-launch.txt"
pid=${launch##*: }
sleep 12
bounded 30 xcrun simctl io "$tablet" screenshot "$output/ipad-launch.png"
if ! kill -0 "$pid" 2>/dev/null; then
  echo 'iPad app process exited during launch smoke test'
  exit 1
fi
echo '13-inch iPad simulator survived 12 seconds; visual and purchase acceptance still required.'
