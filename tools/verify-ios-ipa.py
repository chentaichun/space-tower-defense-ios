"""Validate the actual exported IPA before it can be selected for upload."""
import json
import plistlib
import subprocess
import tempfile
import zipfile
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec

root = Path(__file__).resolve().parent.parent
ipas = list((root / 'build/ios/ipa').glob('*.ipa'))
if len(ipas) != 1:
    raise SystemExit('Expected exactly one exported IPA')
spec = spec_from_file_location('bundle_verify', root / 'tools/verify-ios-bundle.py')
mod = module_from_spec(spec)
spec.loader.exec_module(mod)
report = json.loads((root / 'release/ios/source-verification.json').read_text())
with tempfile.TemporaryDirectory() as directory:
    with zipfile.ZipFile(ipas[0]) as archive:
        for name in archive.namelist():
            target = (Path(directory) / name).resolve()
            if not target.is_relative_to(Path(directory).resolve()):
                raise SystemExit('Invalid archive path')
        archive.extractall(directory)
    apps = list((Path(directory) / 'Payload').glob('*.app'))
    if len(apps) != 1:
        raise SystemExit('Expected one app in Payload')
    errors = mod.verify(apps[0], report)
    profile = subprocess.run(['security', 'cms', '-D', '-i', str(apps[0] / 'embedded.mobileprovision')], capture_output=True, check=True)
    profile = plistlib.loads(profile.stdout)
    entitlements = profile['Entitlements']
    if entitlements.get('application-identifier') != '28SC4755RX.com.mrchen.spacetowerdefense':
        errors.append('Incorrect signed application identifier')
    if entitlements.get('get-task-allow') or profile.get('ProvisionedDevices'):
        errors.append('Not an App Store distribution profile')
    if errors:
        raise SystemExit('\n'.join(errors))
result = dict(version=report['version'], build=report['build'], iosBuild=report.get('iosBuild', str(report['build'])),
              ipa=str(ipas[0].relative_to(root)), bundleContentVerified=True,
              distributionProfileVerified=True, appStoreUploaded=False, deviceTested=False)
(root / 'release/ios/ipa-verification.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result, indent=2))
