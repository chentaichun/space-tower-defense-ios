# iOS 2.9.24 release status

Updated 2026-09-23. NOT SUBMITTED FOR APP REVIEW; NOT PUBLICLY AVAILABLE.

## Completed and verified

- Apple app 6815095860, bundle com.mrchen.spacetowerdefense; agreements, banking and tax forms active/completed.
- Game source 2.9.24 / 57 matches live version; Apple build 57.2 is VALID and selected. Build commit e72d2c1.
- 153 local tests passed; source/package asset verification passed. This is not device acceptance.
- StoreKit bridge and authenticated server verification deployed; 16 IAP products have localization, prices and territory settings.
- iOS AdMob inventory and UMP/ATT gating implemented; European and US privacy messages published for both platforms.
- EN and Traditional Chinese listing metadata, category, age rating and free download price saved.
- All 12 App Privacy data types configured and published after explicit user confirmation.
- Review contact and guest access notes saved through Apple API; fresh page confirms former validation errors are gone.
- Content rights set to USES_THIRD_PARTY_CONTENT and verified via Apple API. See release/ios/music-rights-audit.md for source records.
- Existing four-hour monitor apple remains ACTIVE. See APPLE_MONITORING_GUIDE.md.

## In progress and remaining

- Native screenshot capture completed on actual cloud simulators: 6.5-inch iPhone 11 Pro Max and 13-inch iPad Pro. Build 6ab3816979b1d5259f0e3519, commit 6969ce4.
- Artifact space-tower-defense-ios_6_artifacts.zip download blocked by the Codex browser (ERR_BLOCKED_BY_CLIENT); user asked to download through their own Chrome. Screenshots not yet inspected or uploaded.
- Apple preflight now requires iPhone/iPad screenshots; inspect screenshots before uploading. No browser mockups or resized substitute screenshots.
- IAP review screenshots and first-version attachment still pending.
- Actual Sandbox purchase/restore, cancel/pending, account switching and ad reward verification remain untested.
- Sandbox API authentication works with a deliberately nonexistent transaction (4040010); production returns 401 and remains unverified. Do not treat this as a successful purchase.
- EU trader contact verification remains incomplete. Phone supplied for review; public use has not been separately confirmed.
- Refund notification/reconciliation and entitlement withdrawal remain unimplemented.
- Store availability requires final verification before submission.

Reserved public URL: https://apps.apple.com/app/id6815095860 . Do not promote as downloadable until Apple approval and public availability are verified.

