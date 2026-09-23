package com.mrchen.spacetowerdefense;

import android.os.Handler;
import android.os.Looper;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesResponseListener;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryProductDetailsResult;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@CapacitorPlugin(name = "GooglePlayBilling")
public class GooglePlayBillingPlugin extends Plugin implements PurchasesUpdatedListener {
    private BillingClient billingClient;
    private PluginCall pendingPurchaseCall;
    private boolean connecting;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final Map<PluginCall, Runnable> deadlines = new HashMap<>();
    private boolean foreground = true;
    private boolean purchaseLaunched;
    private boolean destroyed;
    private long connectionGeneration;

    private void emitState(PluginCall call, String stage, String code) {
        if (destroyed) return;
        JSObject event = new JSObject();
        event.put("stage", stage);
        event.put("code", code);
        event.put("product_id", call.getString("productId", ""));
        event.put("attempt_id", call.getString("attemptId", ""));
        notifyListeners("billingState", event);
    }

    private boolean finish(PluginCall call) {
        Runnable deadline = deadlines.remove(call);
        if (deadline == null) return false;
        main.removeCallbacks(deadline);
        int index = readyCallQueue.indexOf(call);
        if (index >= 0) { readyCallQueue.remove(index); readyQueue.remove(index); }
        if (pendingPurchaseCall == call) {
            pendingPurchaseCall = null;
            purchaseLaunched = false;
        }
        return true;
    }

    private void resolve(PluginCall call, JSObject result) {
        if (finish(call)) call.resolve(result);
    }

    private void fail(PluginCall call, String code) {
        if (finish(call)) {
            emitState(call, "request_error", code);
            call.reject("Google Play could not complete the request. Restore purchases to check its status.", code);
        }
    }

    private void deadline(PluginCall call, long delay) {
        Runnable previous = deadlines.remove(call);
        if (previous != null) main.removeCallbacks(previous);
        Runnable timer = new Runnable() {
            @Override public void run() {
                // Never unlock a second checkout while Play or its authentication UI owns focus.
                if (pendingPurchaseCall == call && purchaseLaunched &&
                    (!foreground || getActivity() == null || !getActivity().hasWindowFocus())) {
                    main.postDelayed(this, 2000);
                    return;
                }
                fail(call, "BILLING_TIMEOUT");
                if (connecting && readyCallQueue.isEmpty()) {
                    connecting = false;
                    connectionGeneration++;
                }
            }
        };
        deadlines.put(call, timer);
        main.postDelayed(timer, delay);
    }

    private void guarded(PluginCall call, Runnable action) {
        if (!deadlines.containsKey(call)) return;
        try { action.run(); } catch (Exception error) { fail(call, "BILLING_EXCEPTION"); }
    }
    private final List<Runnable> readyQueue = new ArrayList<>();
    private final List<PluginCall> readyCallQueue = new ArrayList<>();

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder()
                    .enableOneTimeProducts()
                    .build()
            )
            .enableAutoServiceReconnection()
            .build();
    }

    private JSObject billingError(BillingResult result) {
        JSObject data = new JSObject();
        data.put("responseCode", result.getResponseCode());
        data.put("debugMessage", result.getDebugMessage());
        return data;
    }

    private void rejectBilling(PluginCall call, BillingResult result) {
        if (!finish(call)) return;
        call.reject(
            result.getDebugMessage().isEmpty() ? "Google Play Billing is unavailable." : result.getDebugMessage(),
            String.valueOf(result.getResponseCode()),
            null,
            billingError(result)
        );
    }

    private void whenReady(PluginCall call, Runnable action) {
        if (Looper.myLooper() != Looper.getMainLooper()) {
            main.post(() -> whenReady(call, action));
            return;
        }
        if (destroyed) { call.reject("Billing was closed.", "BILLING_CLOSED"); return; }
        if ("purchase".equals(call.getMethodName())) {
            if (pendingPurchaseCall != null) {
                call.reject("A purchase is already in progress.", "BILLING_BUSY");
                return;
            }
            pendingPurchaseCall = call;
        }
        deadline(call, 30000);
        if (billingClient != null && billingClient.isReady()) {
            guarded(call, action);
            return;
        }
        readyQueue.add(() -> guarded(call, action));
        readyCallQueue.add(call);
        if (connecting) return;
        connecting = true;
        final long generation = ++connectionGeneration;
        try {
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                main.post(() -> {
                if (destroyed || generation != connectionGeneration) return;
                connecting = false;
                List<Runnable> actions = new ArrayList<>(readyQueue);
                List<PluginCall> calls = new ArrayList<>(readyCallQueue);
                readyQueue.clear();
                readyCallQueue.clear();
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    for (PluginCall queuedCall : calls) rejectBilling(queuedCall, result);
                    return;
                }
                for (Runnable queuedAction : actions) queuedAction.run();
                });
            }

            @Override
            public void onBillingServiceDisconnected() {
                main.post(() -> {
                if (destroyed || generation != connectionGeneration) return;
                connecting = false;
                for (PluginCall queuedCall : new ArrayList<>(readyCallQueue)) fail(queuedCall, "BILLING_DISCONNECTED");
                });
            }
        });
        } catch (Exception error) {
            connecting = false;
            for (PluginCall queuedCall : new ArrayList<>(readyCallQueue)) fail(queuedCall, "BILLING_CONNECTION_FAILED");
        }
    }

    private ProductDetails.OneTimePurchaseOfferDetails offerFor(ProductDetails details) {
        List<ProductDetails.OneTimePurchaseOfferDetails> offers = details.getOneTimePurchaseOfferDetailsList();
        if (offers != null && !offers.isEmpty()) return offers.get(0);
        return details.getOneTimePurchaseOfferDetails();
    }

    private JSObject productJson(ProductDetails details) {
        JSObject product = new JSObject();
        product.put("productId", details.getProductId());
        product.put("name", details.getName());
        product.put("title", details.getTitle());
        product.put("description", details.getDescription());
        ProductDetails.OneTimePurchaseOfferDetails offer = offerFor(details);
        if (offer != null) {
            product.put("formattedPrice", offer.getFormattedPrice());
            product.put("priceCurrencyCode", offer.getPriceCurrencyCode());
            product.put("priceAmountMicros", offer.getPriceAmountMicros());
        }
        return product;
    }

    private JSObject purchaseJson(Purchase purchase) {
        JSObject item = new JSObject();
        item.put("purchaseToken", purchase.getPurchaseToken());
        item.put("orderId", purchase.getOrderId());
        item.put("purchaseTime", purchase.getPurchaseTime());
        item.put("purchaseState", purchase.getPurchaseState());
        item.put("acknowledged", purchase.isAcknowledged());
        item.put("autoRenewing", purchase.isAutoRenewing());
        item.put("products", new JSArray(purchase.getProducts()));
        item.put("quantity", purchase.getQuantity());
        return item;
    }

    private JSObject purchasesJson(List<Purchase> purchases, String status) {
        JSArray items = new JSArray();
        if (purchases != null) {
            for (Purchase purchase : purchases) items.put(purchaseJson(purchase));
        }
        JSObject result = new JSObject();
        result.put("status", status);
        result.put("purchases", items);
        return result;
    }

    private void queryProductDetails(List<String> productIds, ProductDetailsResultHandler handler) {
        List<QueryProductDetailsParams.Product> products = new ArrayList<>();
        for (String productId : productIds) {
            products.add(
                QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(productId)
                    .setProductType(BillingClient.ProductType.INAPP)
                    .build()
            );
        }
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
            .setProductList(products)
            .build();
        billingClient.queryProductDetailsAsync(params, (result, details) -> main.post(() -> handler.onResult(result, details)));
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        whenReady(call, () -> {
            JSObject result = new JSObject();
            result.put("available", true);
            resolve(call, result);
        });
    }

    @PluginMethod
    public void queryProducts(PluginCall call) {
        JSArray requested = call.getArray("productIds", new JSArray());
        List<String> productIds = new ArrayList<>();
        try {
            for (int index = 0; index < requested.length(); index++) {
                String productId = requested.getString(index);
                if (!productId.isEmpty()) productIds.add(productId);
            }
        } catch (JSONException error) {
            call.reject("Product IDs must be strings.");
            return;
        }
        if (productIds.isEmpty()) {
            call.reject("At least one product ID is required.");
            return;
        }
        whenReady(call, () -> queryProductDetails(productIds, (billingResult, detailsResult) -> {
            guarded(call, () -> {
            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                rejectBilling(call, billingResult);
                return;
            }
            JSArray products = new JSArray();
            for (ProductDetails details : detailsResult.getProductDetailsList()) {
                products.put(productJson(details));
            }
            JSArray unfetched = new JSArray();
            detailsResult.getUnfetchedProductList().forEach(item -> {
                JSObject failed = new JSObject();
                failed.put("productId", item.getProductId());
                failed.put("statusCode", item.getStatusCode());
                unfetched.put(failed);
            });
            JSObject result = new JSObject();
            result.put("products", products);
            result.put("unfetchedProducts", unfetched);
            resolve(call, result);
            });
        }));
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId", "");
        if (productId.isEmpty()) {
            call.reject("A product ID is required.");
            return;
        }
        whenReady(call, () -> queryProductDetails(Collections.singletonList(productId), (billingResult, detailsResult) -> {
            guarded(call, () -> {
            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                rejectBilling(call, billingResult);
                return;
            }
            if (detailsResult.getProductDetailsList().isEmpty()) {
                fail(call, "PRODUCT_UNAVAILABLE");
                return;
            }
            ProductDetails details = detailsResult.getProductDetailsList().get(0);
            BillingFlowParams.ProductDetailsParams.Builder item =
                BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(details);
            ProductDetails.OneTimePurchaseOfferDetails offer = offerFor(details);
            if (offer != null && offer.getOfferToken() != null && !offer.getOfferToken().isEmpty()) {
                item.setOfferToken(offer.getOfferToken());
            }
            BillingFlowParams.Builder params = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(item.build()));
            String accountId = call.getString("obfuscatedAccountId", "");
            if (!accountId.isEmpty() && accountId.length() <= 64) {
                params.setObfuscatedAccountId(accountId);
            }
            if (getActivity() == null || getActivity().isFinishing() || !foreground) {
                fail(call, "ACTIVITY_UNAVAILABLE");
                return;
            }
            purchaseLaunched = true;
            deadline(call, 120000);
            emitState(call, "native_launch", "START");
            BillingResult launchResult = billingClient.launchBillingFlow(getActivity(), params.build());
            emitState(call, "native_launch_result", String.valueOf(launchResult.getResponseCode()));
            if (launchResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                rejectBilling(call, launchResult);
            }
            });
        }));
    }

    @PluginMethod
    public void queryPurchases(PluginCall call) {
        whenReady(call, () -> {
            QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.INAPP)
                .build();
            billingClient.queryPurchasesAsync(params, new PurchasesResponseListener() {
                @Override
                public void onQueryPurchasesResponse(BillingResult result, List<Purchase> purchases) {
                    main.post(() -> {
                    if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        rejectBilling(call, result);
                        return;
                    }
                    resolve(call, purchasesJson(purchases, "restored"));
                    });
                }
            });
        });
    }

    @PluginMethod
    public void consumePurchase(PluginCall call) {
        String purchaseToken = call.getString("purchaseToken", "");
        if (purchaseToken.isEmpty()) {
            call.reject("A purchase token is required.");
            return;
        }
        whenReady(call, () -> {
            ConsumeParams params = ConsumeParams.newBuilder()
                .setPurchaseToken(purchaseToken)
                .build();
            billingClient.consumeAsync(params, (result, consumedToken) -> {
                main.post(() -> {
                int responseCode = result.getResponseCode();
                if (
                    responseCode != BillingClient.BillingResponseCode.OK &&
                    responseCode != BillingClient.BillingResponseCode.ITEM_NOT_OWNED
                ) {
                    rejectBilling(call, result);
                    return;
                }
                JSObject payload = new JSObject();
                payload.put("consumed", true);
                payload.put("alreadyConsumed", responseCode == BillingClient.BillingResponseCode.ITEM_NOT_OWNED);
                payload.put("purchaseToken", consumedToken == null ? purchaseToken : consumedToken);
                resolve(call, payload);
                });
            });
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        main.post(() -> deliverPurchases(result, purchases));
    }

    private void deliverPurchases(BillingResult result, List<Purchase> purchases) {
        if (destroyed) return;
        String status = "error";
        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
            status = "updated";
        } else if (result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            status = "cancelled";
        }
        JSObject payload = purchasesJson(purchases, status);
        payload.put("responseCode", result.getResponseCode());
        payload.put("debugMessage", result.getDebugMessage());
        boolean matches = purchases == null || purchases.isEmpty();
        if (pendingPurchaseCall != null && purchases != null) for (Purchase purchase : purchases) {
            if (purchase.getProducts().contains(pendingPurchaseCall.getString("productId", ""))) matches = true;
        }
        if (pendingPurchaseCall != null && matches) {
            PluginCall call = pendingPurchaseCall;
            resolve(call, payload);
        } else {
            notifyListeners("purchaseUpdated", payload);
        }
    }

    @Override
    protected void handleOnPause() {
        foreground = false;
        super.handleOnPause();
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        foreground = true;
        final PluginCall returningCall = pendingPurchaseCall;
        if (returningCall == null || !purchaseLaunched) return;
        main.postDelayed(() -> recoverPurchase(returningCall), 1500);
    }

    private void recoverPurchase(PluginCall call) {
        if (destroyed || pendingPurchaseCall != call || !purchaseLaunched) return;
        if (!foreground || getActivity() == null || !getActivity().hasWindowFocus()) {
            main.postDelayed(() -> recoverPurchase(call), 1500);
            return;
        }
        // A returned activity must not wait forever for a lost Play callback.
        deadline(call, 30000);
        emitState(call, "resume_query", "START");
        guarded(call, () -> billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
            (result, purchases) -> main.post(() -> {
                if (pendingPurchaseCall != call || !foreground || getActivity() == null || !getActivity().hasWindowFocus()) return;
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    rejectBilling(call, result);
                    return;
                }
                List<Purchase> matching = new ArrayList<>();
                if (purchases != null) for (Purchase purchase : purchases) {
                    if (purchase.getProducts().contains(call.getString("productId", ""))) matching.add(purchase);
                }
                if (!matching.isEmpty()) resolve(call, purchasesJson(matching, "updated"));
                else fail(call, "PURCHASE_RESULT_UNKNOWN");
            })
        ));
    }

    @Override
    protected void handleOnDestroy() {
        destroyed = true;
        for (PluginCall call : new ArrayList<>(deadlines.keySet())) fail(call, "BILLING_CLOSED");
        main.removeCallbacksAndMessages(null);
        if (billingClient != null) billingClient.endConnection();
        super.handleOnDestroy();
    }

    private interface ProductDetailsResultHandler {
        void onResult(BillingResult result, QueryProductDetailsResult detailsResult);
    }
}
