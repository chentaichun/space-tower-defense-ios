# iOS 2.9.24 release status

Updated 2026-09-23. NOT SUBMITTED FOR APP REVIEW; NOT PUBLICLY AVAILABLE.

## Verified complete

- App Store Connect app: Space Tower Defense: Nexus, 6815095860, bundle com.mrchen.spacetowerdefense.
- Apple membership, Free/Paid Apps agreements, bank account and Taiwan/US tax forms are active/completed.
- Canonical game source is C:/Users/User/space_tower_defense, game 2.9.24 / 57.
- StoreKit native bridge, client fulfillment and authenticated Apple transaction verification are implemented.
- Dedicated IAP key is stored in Cloudflare production encrypted secrets; private keys are excluded from repository.
- Backend deployed to production; catalog reports Apple store ready. This only proves configuration, not a successful real purchase.
- 151 local tests pass, including mocked Apple verification, replay protection and fulfillment-before-finish behavior.
- Signed build 57 uploaded successfully and Apple processed it as VALID. Apple build ID: 0da62709-3ef5-4c53-86dc-3adaddab31b4.
- All 16 IAP products have English localization, USA base prices and availability in 175 territories.
- Simulator build at 43e2f79 survived 12 seconds. Gameplay and screenshots have not been visually verified.
- iOS AdMob rewarded units created for supplies and revive; game advertising still disabled until integration/consent verification.

## In progress

- Packaging revision 57.1 (commit 9f88db9) replaces default icon/launch image. Cloud build: https://codemagic.io/app/6ab3507b76bda2e5cfeea02f/build/6ab377445ba1154be177adc5
- European trader contact draft uses previously confirmed English address/email; public telephone still missing.
- AdMob consent message applicability to iOS.

## Required before submission

- Inspect actual iPhone/iPad screens; create compliant store and IAP review screenshots. Current artifact download is blocked by the in-app browser.
- End-to-end Apple Sandbox purchase, restore, pending/cancel and account-switch validation. Sandbox is intentionally restricted to approved test player keys; no blanket production allowance.
- Investigate production Apple transaction API 401; sandbox API authenticated correctly and returned 4040010 for a deliberately nonexistent transaction.
- Configure iOS ads, UMP/ATT and privacy declarations; verify consent, reward and no-ads entitlement behavior.
- Complete public trader telephone and verification.
- Finalize store metadata, privacy labels, age rating, review details, screenshots and first-version IAP attachment.
- Select final valid build; submit review only after the above pass.
- Refund notification/reconciliation and entitlement revocation remain unimplemented.

## Public distribution

Reserved URL: https://apps.apple.com/app/id6815095860 . Do not advertise as downloadable until Apple status and public listing are verified.

Machine-readable evidence and IDs: release/ios/cloud-build-status.json. Historical checklist: release/ios/checklist-history-20260923.md.
