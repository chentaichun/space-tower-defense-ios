#!/bin/bash
set -euo pipefail
app="build/ios-simulator/Build/Products/Debug-iphonesimulator/App.app"
output="$(pwd)/build/ios-simulator/smoke"
mkdir -p "$output"
if ! command -v applesimutils >/dev/null; then
  export HOMEBREW_NO_AUTO_UPDATE=1
  brew tap wix/brew
  if brew help trust >/dev/null 2>&1; then
    brew trust --formula wix/brew/applesimutils
  fi
  brew install wix/brew/applesimutils
fi
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
  # Exercise the real OS-level opt-out state, keeping ATT out of store captures.
  bounded 90 applesimutils --byId "$device" --bundle com.mrchen.spacetowerdefense --setPermissions 'userTracking=NO'
  bounded 180 xcrun simctl bootstatus "$device" -b
  data=$(xcrun simctl get_app_container "$device" com.mrchen.spacetowerdefense data)
  phases="home shop gameplay store"
  if [ "$family" = iphone ]; then
    phases="$phases vip"
  fi
  if [ "$family" = iphone ] && [ "${STD_CAPTURE_LISTING_ONLY:-0}" != 1 ]; then
    phases="$phases obsidian_120 obsidian_420 obsidian_1100 obsidian_1800 obsidian_2650 obsidian_5800 obsidian_10000 obsidian_24000 spacecoin_1000 spacecoin_6000 spacecoin_11000 spacecoin_25000 spacecoin_80000 double_gold_v1 remove_ads_v1 starter_emerald_v1"
  fi
  for phase in $phases; do
    echo "Capturing actual native $family UI: $phase"
    ready="$data/Documents/capture-$phase.json"
    for attempt in 1 2; do
      rm -f "$ready"
      SIMCTL_CHILD_STD_CAPTURE_PHASE="$phase" bounded 90 xcrun simctl launch --terminate-running-process "$device" com.mrchen.spacetowerdefense
      for i in $(seq 1 90); do
        [ -f "$ready" ] && break
        sleep 1
      done
      [ -f "$ready" ] && break
      bounded 30 xcrun simctl io "$device" screenshot "$output/$family-$phase-failure-$attempt.png" || true
      bounded 30 xcrun simctl spawn "$device" log show --last 3m --style compact --predicate 'process == "App" OR process CONTAINS "WebContent"' > "$output/$family-$phase-failure-$attempt.log" 2>&1 || true
      grep -Ei 'capture|crash|terminated|error|exception|memory' "$output/$family-$phase-failure-$attempt.log" | tail -n 100 || true
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
  if [ "${STD_CAPTURE_LISTING_ONLY:-0}" = 1 ]; then
    STD_CAPTURE_FAMILY="$family" node tools/upload-ios-screenshots.mjs
  fi
done
cp "$output/iphone-gameplay.png" "$output/launch.png"
cp "$output/ipad-gameplay.png" "$output/ipad-launch.png"
echo 'Actual native UI captures ready for human visual acceptance. Purchases remain unverified.'
