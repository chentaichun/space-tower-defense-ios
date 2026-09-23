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
phone=$(python3 - "$output/devices.json" "$output/device-types.json" <<'PY'
import json, subprocess, sys
devices=json.load(open(sys.argv[1]))['devices']
types=json.load(open(sys.argv[2]))['devicetypes']
runtime=next(r for r,ds in devices.items() if 'iOS' in r and any(d.get('isAvailable') for d in ds))
kind=next(d['identifier'] for d in types if d['name']=='iPhone 11 Pro Max')
print(subprocess.check_output(['xcrun','simctl','create','Release iPhone 6.5',kind,runtime],text=True).strip())
PY
)
tablet=$(python3 - "$output/devices.json" <<'PY'
import json,sys
print(next(d['udid'] for r,ds in json.load(open(sys.argv[1]))['devices'].items() if 'iOS' in r for d in ds if d.get('isAvailable') and 'iPad Pro 13-inch' in d['name']))
PY
)
for spec in "iphone:$phone" "ipad:$tablet"; do
  family=${spec%%:*}; device=${spec#*:}
  xcrun simctl boot "$device"
  bounded 180 xcrun simctl bootstatus "$device" -b
  bounded 90 xcrun simctl install "$device" "$app"
  data=$(xcrun simctl get_app_container "$device" com.mrchen.spacetowerdefense data)
  phases="home shop gameplay store"
  if [ "$family" = iphone ]; then
    phases="$phases obsidian_120 obsidian_420 obsidian_1100 obsidian_1800 obsidian_2650 obsidian_5800 obsidian_10000 obsidian_24000 spacecoin_1000 spacecoin_6000 spacecoin_11000 spacecoin_25000 spacecoin_80000 double_gold_v1 remove_ads_v1 starter_emerald_v1"
  fi
  for phase in $phases; do
    echo "Capturing actual native $family UI: $phase"
    SIMCTL_CHILD_STD_CAPTURE_PHASE="$phase" bounded 90 xcrun simctl launch --terminate-running-process "$device" com.mrchen.spacetowerdefense
    ready="$data/Documents/capture-$phase.json"
    for i in $(seq 1 90); do
      [ -f "$ready" ] && break
      sleep 1
    done
    if [ ! -f "$ready" ]; then
      bounded 30 xcrun simctl spawn "$device" log show --last 2m --style compact --predicate 'process == "App"' | tail -n 80 || true
      exit 1
    fi
    cp "$ready" "$output/$family-$phase.json"
    cat "$ready"
    echo
    python3 - "$ready" <<'PY'
import json,sys
state=json.load(open(sys.argv[1]))
assert 'Space Tower Defense' in state['title'], 'Unexpected native web view'
assert state.get('text','').strip(), 'Native web view is empty'
if state['phase']=='gameplay':
    assert state['inGame'], 'Deploy control did not start an actual game'
PY
    sleep 2
    bounded 30 xcrun simctl io "$device" screenshot "$output/$family-$phase.png"
  done
  xcrun simctl shutdown "$device"
done
cp "$output/iphone-gameplay.png" "$output/launch.png"
cp "$output/ipad-gameplay.png" "$output/ipad-launch.png"
echo 'Actual native UI captures ready for human visual acceptance. Purchases remain unverified.'
