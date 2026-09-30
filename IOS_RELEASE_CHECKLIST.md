# 2026-09-30 follow-up

TestFlight 2.9.28 (62) is IN_BETA_TESTING. Supplied physical-device video (iPhone 17 / iOS 26.6.1, user-reported) was uploaded to App Review Information; attachment 842ee099-8862-4087-846e-b07b78ad3b4d is COMPLETE. Seven-part review notes saved with explicit verification limits. The video demonstrates gameplay and native sandbox purchase sheets but omits app launch, registration/login and deletion required in Apple's actual message. No new App Review submission was made.

Production leaderboard now returns only fixed-format system-generated Pilot codes and scores for all users. Deployment dd404523 verified on both production/deployment APIs; 166 tests pass. Backend-only change; build 62 assets remain unchanged. Old video shows prior names; request supplemental launch/account-flow/current-leaderboard video. See release/ios/device-recording-2.9.28.md and release/ios/release-progress-20260930.json.

---
# iOS 2.9.28 / 62 release status

Verified 2026-09-29: signed build uploaded successfully, Apple processing VALID, external TestFlight review WAITING_FOR_REVIEW. NOT YET AVAILABLE TO THE EXTERNAL TESTER; NOT PUBLICLY RELEASED.

- Canonical source, cloud build and 90 packaged assets match 2.9.28 / 62; all 165 local tests pass.
- Source commit: 61ec86a429d436620876c4725aacd6b9012fa592.
- Codemagic build: 6abb7952083ff0a9a53a52fe (finished, 5m 11s).
- Apple build: 25d7946b-fe53-4ade-8075-1f7636673f30, processing VALID, external WAITING_FOR_BETA_REVIEW.
- Actual IPA content and App Store distribution profile verified. Cloud/source content SHA256: 553c03e2dea2e26433769b311b7ab42110b9f4f6549cfed033b41da74c3b4c7e.
- External group iOS Device Testing created, public link disabled, requested tester added, build 62 assigned.
- English and Traditional Chinese beta descriptions/test notes saved; existing Apple review contact and demo account reused in beta review information.
- App Store draft updated to 2.9.28 with selected build 62; state PREPARE_FOR_SUBMISSION. No new public App Review submission was made.
- Physical-device QA and recording remain pending. External beta review approval is needed before the tester can install.
- IPA and evidence are in release/ios/SpaceTowerDefense-2.9.28-62.ipa and release/ios/build-62-evidence/.
- Recording instructions: release/ios/device-recording-2.9.28.md.
- Previous EU trader proof and refund/entitlement reconciliation items still require follow-up; this release preparation did not resolve those items.

---
## Historical submission record (2.9.24)
# iOS 2.9.24 release status

Verified 2026-09-24 02:06 CST: SUBMITTED, WAITING_FOR_REVIEW. NOT YET PUBLIC.

- Apple app 6815095860, bundle com.mrchen.spacetowerdefense.
- Latest submitted release 2.9.24 (57.6), commit 5ce70a9, source assets SHA256 35d487f96e14973e31baff88f92adba008df34e07d7280ba75f25dcc80885be6.
- Cloud build 6ab40ed36d1d073f3c46dc83 uploaded successfully. Apple build b236daac-e4af-4825-ae51-edf117a949a9 is VALID and selected.
- Submission eee55b08-39e7-4c5d-acba-24e1b641b86c, submitted 2026-09-23T18:06:40.602Z, contains the App and all 16 IAPs. UI confirms 17 items submitted. API confirms WAITING_FOR_REVIEW and AFTER_APPROVAL.
- Release is automatic after Apple approval. Do not confuse submission with public availability.
- 155 tests pass, 88 packaged source assets verified. Native iPhone 1242x2688 and iPad 2064x2752 screenshots inspected: full-screen battle rendering corrected. Four iPhone and three iPad screenshots retained in each of en-US and zh-Hant. Notification-obscured iPad home removed.
- Native IAP review screenshots uploaded for all 16 products. Listing, contact, age rating, pricing, content rights, published privacy declarations and encryption status completed.
- Apple agreements, banking and tax information were completed in preceding verified work.

## Remaining external steps and verification limits

- Wait for Apple review; address any rejection. Public release has not been verified.
- EU trader identity/name proof is still at the document upload step. Do not fabricate a document or falsely declare non-trader status.
- Existing four-hour automation apple is PAUSED, as observed 2026-09-24. No recurring checks are promised while paused.
- No physical iPhone/iPad testing. Cloud simulator GPU process crashes/recovery were observed, including retry before successful captures; visual correction is verified, but absence of device crashes is not established.
- Actual Apple Sandbox purchase/restore and ad reward end-to-end testing remain unverified. Sandbox API authentication was validated using a nonexistent transaction (4040010); production returned 401 before publication and requires post-release verification.
- Refund notification/reconciliation and entitlement withdrawal remain unimplemented.
- 173 territories configured; China mainland and Vietnam excluded for missing game licenses. EU availability depends on trader verification.

Reserved public URL: https://apps.apple.com/app/id6815095860
Review: https://appstoreconnect.apple.com/apps/6815095860/distribution/reviewsubmissions/details/eee55b08-39e7-4c5d-acba-24e1b641b86c
Analytics guide: APPLE_MONITORING_GUIDE.md
Native images and verification records: release/ios/