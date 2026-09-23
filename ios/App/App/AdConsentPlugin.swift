import Foundation
import Capacitor
import UserMessagingPlatform
import AppTrackingTransparency

// Consent must work before MobileAds.start; the ad plugin's presenter is only
// attached during its initialize call, so use our own Capacitor presenter.
@objc(AdConsentPlugin)
public class AdConsentPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AdConsentPlugin"
    public let jsName = "AdConsent"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestConsent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showPrivacyOptionsForm", returnType: CAPPluginReturnPromise)
    ]

    @MainActor private func result(_ error: Error? = nil) -> [String: Any] {
        let info = ConsentInformation.shared
        var value: [String: Any] = [
            "canRequestAds": info.canRequestAds,
            "privacyOptionsRequirementStatus": info.privacyOptionsRequirementStatus == .required ? "REQUIRED" : "NOT_REQUIRED",
            "trackingAuthorized": ATTrackingManager.trackingAuthorizationStatus == .authorized
        ]
        if let error = error {
            value["errorMessage"] = error.localizedDescription
            value["errorCode"] = (error as NSError).code
        }
        return value
    }

    @objc public func requestConsent(_ call: CAPPluginCall) {
        Task { @MainActor in
            guard let presenter = self.bridge?.viewController else {
                call.reject("Consent presenter unavailable")
                return
            }
            do {
                try await ConsentInformation.shared.requestConsentInfoUpdate(with: RequestParameters())
                try await ConsentForm.loadAndPresentIfRequired(from: presenter)
                if ConsentInformation.shared.canRequestAds && ATTrackingManager.trackingAuthorizationStatus == .notDetermined {
                    _ = await ATTrackingManager.requestTrackingAuthorization()
                }
                call.resolve(self.result())
            } catch {
                // Only the SDK's current canRequestAds can authorize cached consent.
                call.resolve(self.result(error))
            }
        }
    }

    @objc public func showPrivacyOptionsForm(_ call: CAPPluginCall) {
        Task { @MainActor in
            guard let presenter = self.bridge?.viewController else {
                call.reject("Consent presenter unavailable")
                return
            }
            do {
                try await ConsentForm.presentPrivacyOptionsForm(from: presenter)
                call.resolve(self.result())
            } catch { call.reject(error.localizedDescription) }
        }
    }
}
