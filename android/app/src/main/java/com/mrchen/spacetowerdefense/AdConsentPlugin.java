package com.mrchen.spacetowerdefense;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.FormError;
import com.google.android.ump.UserMessagingPlatform;

/** Keeps the SDK's consent decision available even when its network update fails. */
@CapacitorPlugin(name = "AdConsent")
public class AdConsentPlugin extends Plugin {
    @PluginMethod
    public void requestConsent(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            ConsentInformation info = UserMessagingPlatform.getConsentInformation(getContext());
            info.requestConsentInfoUpdate(getActivity(), new ConsentRequestParameters.Builder().build(),
                () -> UserMessagingPlatform.loadAndShowConsentFormIfRequired(getActivity(),
                    error -> resolveState(call, info, error)),
                error -> resolveState(call, info, error));
        });
    }

    private void resolveState(PluginCall call, ConsentInformation info, FormError error) {
        JSObject result = new JSObject();
        result.put("canRequestAds", info.canRequestAds());
        result.put("isConsentFormAvailable", info.isConsentFormAvailable());
        result.put("privacyOptionsRequirementStatus", info.getPrivacyOptionsRequirementStatus().name());
        if (error != null) {
            result.put("errorCode", error.getErrorCode());
            result.put("errorMessage", error.getMessage());
        }
        call.resolve(result);
    }
}
