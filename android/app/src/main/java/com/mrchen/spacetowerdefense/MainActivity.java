package com.mrchen.spacetowerdefense;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String APP_PREFS = "space_tower_native";
    private static final String LAST_ASSET_VERSION = "last_asset_version";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GooglePlayBillingPlugin.class);
        registerPlugin(AdConsentPlugin.class);
        super.onCreate(savedInstanceState);
        WindowCompat.enableEdgeToEdge(getWindow());
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView())
            .setAppearanceLightStatusBars(false);
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView())
            .setAppearanceLightNavigationBars(false);
        refreshBundledAssetsAfterUpdate();
    }

    private void refreshBundledAssetsAfterUpdate() {
        try {
            PackageInfo packageInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            @SuppressWarnings("deprecation")
            long currentVersion = packageInfo.versionCode;
            SharedPreferences preferences = getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE);
            long previousVersion = preferences.getLong(LAST_ASSET_VERSION, -1L);
            if (previousVersion == currentVersion) return;

            preferences.edit().putLong(LAST_ASSET_VERSION, currentVersion).apply();
            WebView webView = bridge.getWebView();
            if (webView != null) {
                webView.clearCache(true);
                webView.post(webView::reload);
            }
        } catch (Exception ignored) {
            // The bundled app still loads normally if cache maintenance is unavailable.
        }
    }
}
