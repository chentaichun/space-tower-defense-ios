// Preserve native load diagnostics that capacitor-community/admob 8.0.0 drops.
// Reapply after dependency installation; refuse to patch an unfamiliar callback.
import {readFile, writeFile} from 'node:fs/promises';
const target = new URL('../node_modules/@capacitor-community/admob/android/src/main/java/com/getcapacitor/community/admob/rewarded/RewardedAdCallbackAndListeners.kt', import.meta.url);
const source = await readFile(target, 'utf8');
const marker = '// SpaceTower: retain native rewarded load response';
if (source.includes(marker)) {
  console.log('Android rewarded load diagnostics already applied.');
} else {
  const pattern = /                val adMobError = AdMobPluginError\(adError\)\r?\n\r?\n                notifyListenersFunction.accept\(RewardAdPluginEvents.FailedToLoad, adMobError\)\r?\n                call.reject\(adError.message\)/;
  if (!pattern.test(source)) throw new Error('AdMob rewarded callback changed; review the diagnostics patch before building.');
  const replacement = `                ${marker}
                val adMobError = JSObject()
                    .put("code", adError.code)
                    .put("message", adError.message)
                    .put("domain", adError.domain)
                    .put("responseInfo", adError.responseInfo?.toString())
                android.util.Log.w("SpaceTowerAds", adError.toString())
                notifyListenersFunction.accept(RewardAdPluginEvents.FailedToLoad, adMobError)
                call.reject(adError.message, adError.code.toString(), adMobError)`;
  await writeFile(target, source.replace(pattern, replacement));
  console.log('Android rewarded load diagnostics applied.');
}
