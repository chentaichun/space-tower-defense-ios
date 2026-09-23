import Foundation
import StoreKit
import Capacitor
#if DEBUG
import AppTrackingTransparency
#endif

// Finishing a transaction is an explicit step after server fulfillment.
@objc(AppleStoreBillingPlugin)
public class AppleStoreBillingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppleStoreBillingPlugin"
    public let jsName = "AppleStoreBilling"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "queryProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "queryPurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "finishTransaction", returnType: CAPPluginReturnPromise)
    ]
    private var updatesTask: Task<Void, Never>?

    public override func load() {
        updatesTask = Task { [weak self] in
            for await result in Transaction.updates {
                guard let self = self else { return }
                if case .verified(let transaction) = result {
                    self.notifyListeners("purchaseUpdated", data: ["status": "ok", "purchases": [self.payload(transaction)]], retainUntilConsumed: true)
                }
            }
        }
    }
    deinit { updatesTask?.cancel() }

    private func payload(_ transaction: Transaction) -> [String: Any] {
        var value: [String: Any] = [
            "transactionId": String(transaction.id),
            "originalTransactionId": String(transaction.originalID),
            "products": [transaction.productID],
            "purchaseToken": String(transaction.id),
            "orderId": String(transaction.id),
            "purchaseState": transaction.revocationDate == nil ? 1 : 0,
            "revoked": transaction.revocationDate != nil
        ]
        if let token = transaction.appAccountToken { value["appAccountToken"] = token.uuidString.lowercased() }
        if #available(iOS 16.0, *) { value["environment"] = transaction.environment.rawValue }
        return value
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": AppStore.canMakePayments])
    }

    @objc func queryProducts(_ call: CAPPluginCall) {
        let identifiers = call.getArray("productIds", String.self) ?? []
        guard !identifiers.isEmpty, identifiers.count <= 100 else { call.reject("Invalid products", "INVALID_PRODUCTS"); return }
        Task {
            do {
                let products = try await Product.products(for: identifiers)
                call.resolve(["products": products.map { product -> [String: Any] in
                    ["productId": product.id, "title": product.displayName,
                     "description": product.description, "formattedPrice": product.displayPrice,
                     "priceCurrencyCode": product.priceFormatStyle.currencyCode,
                     "priceAmountMicros": NSDecimalNumber(decimal: product.price * 1_000_000).int64Value]
                }])
            } catch { call.reject("App Store products unavailable", "STORE_UNAVAILABLE") }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId"),
              let rawToken = call.getString("appAccountToken"),
              let token = UUID(uuidString: rawToken) else {
            call.reject("A player purchase token is required", "ACCOUNT_REQUIRED"); return
        }
        Task { @MainActor in
            do {
                guard let product = try await Product.products(for: [productId]).first else {
                    call.reject("Product unavailable", "PRODUCT_UNAVAILABLE"); return
                }
                switch try await product.purchase(options: [.appAccountToken(token)]) {
                case .success(let result):
                    guard case .verified(let transaction) = result else {
                        call.reject("Apple signature verification failed", "UNVERIFIED_TRANSACTION"); return
                    }
                    call.resolve(["status": "ok", "purchases": [self.payload(transaction)]])
                case .pending: call.resolve(["status": "pending", "purchases": []])
                case .userCancelled: call.resolve(["status": "cancelled", "purchases": []])
                @unknown default: call.reject("Unknown purchase result", "PURCHASE_RESULT_UNKNOWN")
                }
            } catch { call.reject("App Store purchase failed", "PURCHASE_FAILED") }
        }
    }

    @objc func queryPurchases(_ call: CAPPluginCall) {
        let restore = call.getBool("restore") ?? false
        Task {
            do {
                // Only a user-initiated Restore requests App Store authentication.
                if restore { try await AppStore.sync() }
                var purchases: [UInt64: [String: Any]] = [:]
                for await result in Transaction.unfinished {
                    if case .verified(let transaction) = result { purchases[transaction.id] = self.payload(transaction) }
                }
                for await result in Transaction.currentEntitlements {
                    if case .verified(let transaction) = result { purchases[transaction.id] = self.payload(transaction) }
                }
                call.resolve(["status": "ok", "purchases": Array(purchases.values)])
            } catch { call.reject("Restore could not complete", "RESTORE_FAILED") }
        }
    }

    @objc func finishTransaction(_ call: CAPPluginCall) {
        guard let value = call.getString("transactionId"), let id = UInt64(value) else {
            call.reject("Invalid transaction identifier", "INVALID_TRANSACTION"); return
        }
        Task {
            for await result in Transaction.unfinished {
                if case .verified(let transaction) = result, transaction.id == id {
                    await transaction.finish()
                    call.resolve(["finished": true]); return
                }
            }
            call.resolve(["finished": true, "alreadyFinished": true])
        }
    }
}

@objc(GameBridgeViewController)
class GameBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(AppleStoreBillingPlugin())
        bridge?.registerPluginInstance(AdConsentPlugin())
        #if DEBUG
        if let phase = ProcessInfo.processInfo.environment["STD_CAPTURE_PHASE"],
           phase.range(of: "^[a-z0-9_]+$", options: .regularExpression) != nil {
            captureVisibleGameUI(phase: phase, attempt: 0)
        }
        #endif
    }

    #if DEBUG
    // Simulator-only UI test hook: clicks the same visible controls as a player.
    // No balances, progression, products or gameplay state are fabricated.
    private func captureVisibleGameUI(phase: String, attempt: Int) {
        guard attempt < 60 else { NSLog("Capture failed: game DOM did not become ready"); return }
        DispatchQueue.main.asyncAfter(deadline: .now() + (attempt == 0 ? 8 : 1)) { [weak self] in
            guard let self = self else { return }
            self.webView?.evaluateJavaScript("document.documentElement.dataset.languageReady === 'true' && !!document.getElementById('deploymentButton')") { ready, error in
                guard (ready as? Bool) == true else {
                    self.captureVisibleGameUI(phase: phase, attempt: attempt + 1); return
                }
                let control = ["home": "", "shop": "shopOpenButton", "gameplay": "deploymentButton", "store": "homeStoreTab", "starter_emerald_v1": "homeStarterPackButton"][phase] ?? "shopOpenButton"
                let action = control.isEmpty ? "true" : "(() => { const b=document.getElementById('\(control)'); b.scrollIntoView({block:'center'}); b.click(); return true; })()"
                self.webView?.evaluateJavaScript(action) { _, error in
                    guard error == nil else { NSLog("Capture UI action failed: %@", String(describing: error)); return }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 10) {
                        guard ATTrackingManager.trackingAuthorizationStatus == .denied else {
                            NSLog("Capture refused: simulator tracking opt-out has not been configured"); return
                        }
                        if !["home", "shop", "gameplay", "store", "starter_emerald_v1"].contains(phase) {
                            self.webView?.evaluateJavaScript("(() => { const b=document.querySelector('[data-shop-product=\"\(phase)\"], [data-entitlement-product=\"\(phase)\"]'); const d=b?.closest('details'); if(d && !d.open) d.querySelector('summary').click(); b?.closest('.shop-product')?.scrollIntoView({block:'center'}); })()")
                        }
                        self.webView?.evaluateJavaScript("JSON.stringify({phase:'\(phase)',title:document.title,inGame:document.body.classList.contains('in-game'),text:document.body.innerText.slice(0,1600)})") { value, error in
                            guard let text = value as? String, error == nil else {
                                NSLog("Capture state failed for %@: %@", phase, String(describing: error)); return
                            }
                            if phase == "gameplay",
                               let data = text.data(using: .utf8),
                               let state = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                               state["inGame"] as? Bool != true {
                                NSLog("Capture waiting for actual deployment to finish");
                                self.captureVisibleGameUI(phase: phase, attempt: attempt + 1)
                                return
                            }
                            let documents = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                            try? text.write(to: documents.appendingPathComponent("capture-\(phase).json"), atomically: true, encoding: .utf8)
                            NSLog("Capture UI ready: %@", text)
                        }
                    }
                }
            }
        }
    }
    #endif
}
