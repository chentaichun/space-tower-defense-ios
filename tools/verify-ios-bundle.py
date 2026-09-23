"""Verify a built .app (simulator or exported IPA's Payload/App.app).

This verifies packaged content only; it does not claim signing, launch, payment,
device acceptance, or App Store review success.
"""
import hashlib
import json
import plistlib
import sys
from pathlib import Path


def verify(bundle, report):
    info = plistlib.loads((bundle / 'Info.plist').read_bytes())
    errors = []
    if info.get('GADApplicationIdentifier') != 'ca-app-pub-4461762858602817~8384236486':
        errors.append('Missing or incorrect iOS AdMob app ID')
    firebase_path = bundle / 'GoogleService-Info.plist'
    if not firebase_path.is_file():
        errors.append('Missing Firebase iOS configuration')
    else:
        firebase = plistlib.loads(firebase_path.read_bytes())
        if firebase.get('BUNDLE_ID') != report['bundleId']:
            errors.append('Firebase bundle ID mismatch')
        if firebase.get('PROJECT_ID') != 'space-tower-defense-4231e' or not firebase.get('GOOGLE_APP_ID'):
            errors.append('Firebase project configuration mismatch')
    for key, expected in [('CFBundleShortVersionString', report['version']),
                          ('CFBundleVersion', str(report['build'])),
                          ('CFBundleIdentifier', report['bundleId'])]:
        if str(info.get(key, '')) != expected:
            errors.append(f'{key} mismatch')
    for item in report['files']:
        name = item['path']
        target = bundle / 'public' / name
        if not target.is_file():
            errors.append(f'Missing bundled file: {name}')
        elif hashlib.sha256(target.read_bytes()).hexdigest() != item['sha256']:
            errors.append(f'Stale bundled file: {name}')
    expected_assets = {item['path'] for item in report['files'] if item['path'].startswith('assets/')}
    for asset in (bundle / 'public' / 'assets').rglob('*'):
        if asset.is_file() and asset.relative_to(bundle / 'public').as_posix() not in expected_assets:
            errors.append(f'Obsolete bundled asset: {asset.name}')
    return errors


if __name__ == '__main__':
    root = Path(__file__).resolve().parent.parent
    report = json.loads((root / 'release/ios/source-verification.json').read_text(encoding='utf-8'))
    if not report['assetsMatch']:
        raise SystemExit('Source verification did not pass.')
    bundle = Path(sys.argv[1]).resolve()
    errors = verify(bundle, report)
    result = dict(version=report['version'], build=report['build'],
                  fileCount=report['fileCount'], bundleContentVerified=not errors,
                  signingVerified=False, deviceTested=False, appStoreSubmitted=False,
                  errors=errors)
    (root / 'release/ios/bundle-verification.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(result, indent=2))
    raise SystemExit(1 if errors else 0)
