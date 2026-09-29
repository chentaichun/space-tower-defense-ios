# iOS 2.9.28 / 62 release preparation

Verified 2026-09-29: canonical source, native identity and 90 packaged assets match 2.9.28 / 62. All 165 local tests pass. Live game release also matches 2.9.28 / 62.

Apple currently still has rejected 2.9.24 / 57.6. Build 62 has not yet been uploaded. No external TestFlight group existed at the start of this work.

Next: build the curated source with ios-testflight-upload, verify the signed IPA, confirm Apple processing, configure external TestFlight testing, and obtain physical-device QA/video before App Review resubmission. This workflow uploads the build without automatic App Review or beta-review submission and preserves existing listing screenshots.

The physical-device recording and purchase/restore evidence remain pending. Prior review requested additional information under Guideline 2.1. Historical signing, screenshots and 16 IAP metadata work can be reused subject to final build validation.

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