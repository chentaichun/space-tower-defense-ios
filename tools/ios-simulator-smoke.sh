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
xcrun simctl list devicetypes --json > "$output/device-types.json"
# Create an actual 6.5-inch simulator, rather than resizing another device's image.
python3 - "$output/devices.json" "$output/device-types.json" <<'PY'
import json, subprocess, sys
devices = json.load(open(sys.argv[1]))['devices']
types = json.load(open(sys.argv[2]))['devicetypes']
runtime = next((r for r, ds in devices.items() if 'iOS' in r and any(d.get('isAvailable') for d in ds)), None)
kind = next((d['identifier'] for d in types if d['name'] == 'iPhone 11 Pro Max'), None)
if not runtime or not kind:
    raise SystemExit('The required 6.5-inch iPhone simulator type/runtime is unavailable')
subprocess.run(['xcrun', 'simctl', 'create', 'Release iPhone 6.5', kind, runtime], check=True)
PY
xcrun simctl list devices available --json > "$output/devices.json"
device=$(python3 - "$output/devices.json" <<'PY'
import json, sys
data = json.load(open(sys.argv[1]))
phones = [d for runtime, devices in data['devices'].items() if 'iOS' in runtime
          for d in devices if d.get('isAvailable') and d['name'] == 'Release iPhone 6.5']
if not phones:
    raise SystemExit('No available iPhone simulator')
print(phones[0]['udid'])
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
sleep 45
bounded 30 xcrun simctl spawn "$device" log show --last 2m --style compact --predicate 'process == "App"' > "$output/app.log" || true
grep -E 'Game startup|Unknown class|Capacitor|Error|error|WebView|Loading app' "$output/app.log" | tail -n 60 || true
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
bounded 240 maestro --device "$device" test --test-output-dir "$output/iphone-flow" tools/ios-capture-flow.yaml
find "$output/iphone-flow" -name gameplay.png -exec cp {} "$output/launch.png" \;

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
sleep 45
bounded 30 xcrun simctl spawn "$tablet" log show --last 2m --style compact --predicate 'process == "App"' > "$output/ipad-app.log" || true
grep -E 'Game startup|Unknown class|Capacitor|Error|error|WebView|Loading app' "$output/ipad-app.log" | tail -n 60 || true
bounded 30 xcrun simctl io "$tablet" screenshot "$output/ipad-launch.png"
if ! kill -0 "$pid" 2>/dev/null; then
  echo 'iPad app process exited during launch smoke test'
  exit 1
fi
echo '13-inch iPad simulator survived 12 seconds; visual and purchase acceptance still required.'
bounded 240 maestro --device "$tablet" test --test-output-dir "$output/ipad-flow" tools/ios-capture-flow.yaml
find "$output/ipad-flow" -name gameplay.png -exec cp {} "$output/ipad-launch.png" \;
