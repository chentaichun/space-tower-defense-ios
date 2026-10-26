// Preserve native load diagnostics that capacitor-community/admob 8.0.0 drops.
// Reapply after dependency installation; refuse to patch an unfamiliar callback.
import {readFile, writeFile} from 'node:fs/promises';
const target = new URL('../node_modules/@capacitor-community/admob/android/src/main/java/com/getcapacitor/community/admob/rewarded/RewardedAdCallbackAndListeners.kt', import.meta.url);
let source = await readFile(target, 'utf8');
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

// A lost/very slow load callback must not leave every reward button locked.
// Retire the native request too: merely timing out JavaScript would allow a
// late callback to replace the ad belonging to a newer request.
source = await readFile(target, 'utf8');
if (!source.includes('// SpaceTower: bound rewarded load lifetime')) {
  const start = '        return object : RewardedAdLoadCallback() {';
  const loaded = '            override fun onAdLoaded(ad: RewardedAd) {';
  const failed = '            override fun onAdFailedToLoad(adError: LoadAdError) {';
  for (const token of [start, loaded, failed]) {
    if (!source.includes(token)) throw new Error('AdMob load callback changed; review lifetime patch.');
  }
  source = source.replace(start, `${start}
            // SpaceTower: bound rewarded load lifetime
            private val handler = android.os.Handler(android.os.Looper.getMainLooper())
            private var finished = false
            private val timeout = Runnable {
                if (!finished) {
                    finished = true
                    AdRewardExecutor.mRewardedAd = null
                    val error = JSObject().put("code", "LOAD_TIMEOUT")
                        .put("message", "Rewarded ad load timed out")
                    notifyListenersFunction.accept(RewardAdPluginEvents.FailedToLoad, error)
                    call.reject("Rewarded ad load timed out", "LOAD_TIMEOUT", error)
                }
            }
            init { handler.postDelayed(timeout, 45000L) }
            private fun finishLoad(): Boolean {
                if (finished) return false
                finished = true
                handler.removeCallbacks(timeout)
                return true
            }`)
    .replace(loaded, `${loaded}
                if (!finishLoad()) return`)
    .replace(failed, `${failed}
                if (!finishLoad()) return
                AdRewardExecutor.mRewardedAd = null`);
  await writeFile(target, source);
}

const executorTarget = new URL('../node_modules/@capacitor-community/admob/android/src/main/java/com/getcapacitor/community/admob/rewarded/AdRewardExecutor.java', import.meta.url);
let executor = await readFile(executorTarget, 'utf8');
if (!executor.includes('// SpaceTower: consume once and catch on UI thread')) {
  const body = /                    mRewardedAd\.show\(\r?\n                        activitySupplier\.get\(\),\r?\n                        RewardedAdCallbackAndListeners\.INSTANCE\.getOnUserEarnedRewardListener\(call, notifyListenersFunction\)\r?\n                    \);/;
  if (!body.test(executor)) throw new Error('AdMob show executor changed; review show patch.');
  executor = executor.replace(body, `                    // SpaceTower: consume once and catch on UI thread
                    final RewardedAd ad = mRewardedAd;
                    mRewardedAd = null;
                    try {
                        if (ad == null) {
                            call.reject("Rewarded ad is no longer available");
                            return;
                        }
                        ad.show(activitySupplier.get(),
                            RewardedAdCallbackAndListeners.INSTANCE.getOnUserEarnedRewardListener(call, notifyListenersFunction));
                    } catch (Exception ex) {
                        call.reject(ex.getLocalizedMessage(), ex);
                    }`);
  await writeFile(executorTarget, executor);
}
console.log('Android rewarded load lifetime and single-use display patches applied.');

// Post-run interstitials share the UI lock with opt-in rewards. Bound their
// load too, otherwise one stalled automatic request disables the reward UI.
const interstitialTarget = new URL('../node_modules/@capacitor-community/admob/android/src/main/java/com/getcapacitor/community/admob/interstitial/InterstitialAdCallbackAndListeners.kt', import.meta.url);
let interstitial = await readFile(interstitialTarget, 'utf8');
if (!interstitial.includes('// SpaceTower: bound interstitial load lifetime')) {
  const start = '        return object : InterstitialAdLoadCallback() {';
  const loaded = '            override fun onAdLoaded(ad: InterstitialAd) {';
  const failed = '            override fun onAdFailedToLoad(adError: LoadAdError) {';
  for (const token of [start, loaded, failed]) {
    if (!interstitial.includes(token)) throw new Error('AdMob interstitial callback changed; review lifetime patch.');
  }
  interstitial = interstitial.replace(start, `${start}
            // SpaceTower: bound interstitial load lifetime
            private val handler = android.os.Handler(android.os.Looper.getMainLooper())
            private var finished = false
            private val timeout = Runnable {
                if (!finished) {
                    finished = true
                    AdInterstitialExecutor.interstitialAd = null
                    val error = JSObject().put("code", "LOAD_TIMEOUT")
                        .put("message", "Interstitial ad load timed out")
                    notifyListenersFunction.accept(InterstitialAdPluginPluginEvent.FailedToLoad, error)
                    call.reject("Interstitial ad load timed out", "LOAD_TIMEOUT", error)
                }
            }
            init { handler.postDelayed(timeout, 45000L) }
            private fun finishLoad(): Boolean {
                if (finished) return false
                finished = true
                handler.removeCallbacks(timeout)
                return true
            }`)
    .replace(loaded, `${loaded}
                if (!finishLoad()) return`)
    .replace(failed, `${failed}
                if (!finishLoad()) return
                AdInterstitialExecutor.interstitialAd = null`);
  await writeFile(interstitialTarget, interstitial);
}
const interstitialExecutorTarget = new URL('../node_modules/@capacitor-community/admob/android/src/main/java/com/getcapacitor/community/admob/interstitial/AdInterstitialExecutor.java', import.meta.url);
let interstitialExecutor = await readFile(interstitialExecutorTarget, 'utf8');
if (!interstitialExecutor.includes('// SpaceTower: catch interstitial load on UI thread')) {
  const start = '                    final AdRequest adRequest = RequestHelper.createRequest(adOptions);';
  const end = /                        adCallbackAndListeners.getInterstitialAdLoadCallback\(call, notifyListenersFunction\)\r?\n                    \);/;
  const show = '                    interstitialAd.show(activitySupplier.get());';
  if (!interstitialExecutor.includes(start) || !end.test(interstitialExecutor) || !interstitialExecutor.includes(show)) throw new Error('AdMob interstitial executor changed; review patch.');
  interstitialExecutor = interstitialExecutor.replace(start, `                    // SpaceTower: catch interstitial load on UI thread
                    try {
${start}`).replace(end, `$&
                    } catch (Exception ex) {
                        call.reject(ex.getLocalizedMessage(), ex);
                    }`).replace(show, `                    final InterstitialAd ad = interstitialAd;
                    interstitialAd = null;
                    if (ad == null) { call.reject("Interstitial is no longer available"); return; }
                    ad.show(activitySupplier.get());`);
  await writeFile(interstitialExecutorTarget, interstitialExecutor);
}
console.log('Android interstitial load lifetime and UI-thread handling applied.');
