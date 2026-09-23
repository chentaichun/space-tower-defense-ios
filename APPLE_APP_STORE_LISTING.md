# Space Tower Defense - Apple App Store Listing

Updated September 23, 2026. DRAFT ONLY: native build, StoreKit, iOS ads, screenshots and privacy validation remain incomplete. See IOS_RELEASE_CHECKLIST.md.

## Release identity

- Platform: iOS and iPadOS
- Version: `2.9.24`
- Build: `57`
- Bundle ID: `com.mrchen.spacetowerdefense`
- Primary language: English (U.S.)
- Primary category: Games / Strategy
- Secondary category: Games / Casual
- Price: Free
- SKU suggestion: `STD-IOS`
- Privacy policy URL: `https://space-tower-defense.pages.dev/privacy.html`
- Support URL: `https://space-tower-defense.pages.dev/`

## App name decision

App Store Connect must check current name availability before creating the record. The name below is an existing proposal, not a verified available name.

Recommended first choice (26 characters):

`Space Tower Defense: Nexus`

Fallbacks:

- `Space Tower Defense: Orbit`
- `Space Tower Defense: Vanguard`

The installed Home Screen name can remain `Space Tower Defense` even when the App Store product-page name uses a unique suffix.

## English (U.S.) metadata

### Subtitle

`Idle Sci-Fi Tower Defense`

### Promotional text

Build your orbital defense, combine specialized turrets, and survive escalating enemy waves in a strategy game shaped by one independent developer.

### Keywords

`idle,strategy,turret,space,waves,roguelike,upgrade,sci-fi,survival,offline`

### Description

The last orbital defense line is yours.

Space Tower Defense is an idle sci-fi strategy game about building a powerful turret formation and surviving increasingly dangerous enemy waves. Choose a technology path during each run, improve your permanent fleet between battles, and adapt when elite enemies and massive bosses break through your usual plan.

FEATURES

• Build around main and auxiliary turret types
• Combine turret roles, star upgrades, and tactical synergies
• Choose run-defining technology cards as the battle develops
• Unlock ultimate abilities for specialized late-game builds
• Fight escalating waves, elite formations, and large boss encounters
• Use auto-upgrade controls and adjustable battle speeds
• Continue as a guest or use an optional player account for cloud saves
• Play in English, Traditional Chinese, Japanese, Korean, Russian, or Spanish

Monetization wording must be finalized after StoreKit and iOS advertising are implemented and verified. Do not publish this draft as a promise that purchases or ads are already available.

Space Tower Defense is developed by an independent creator. Player feedback helps guide future balance updates, quality improvements, and new content.

### What's New in Version 2.9.24

Version 2.9.24 expands the turret workshop, utilities, music collection, progression systems, and privacy controls. It also includes new tactical combinations, interface refinements, stability fixes, optional cloud-save improvements, and direct in-app account deletion.

## Traditional Chinese metadata

### 名稱

`Space Tower Defense: Nexus`

### 副標題

`放置系太空塔防戰略遊戲`

### 宣傳文字

建立軌道防線、組合專精砲台，在持續升級的敵軍浪潮中守住核心。由獨立開發者持續製作與改善。

### 關鍵字

`塔防,放置,太空,策略,砲台,波次,科幻,升級,單機,生存`

### 描述

最後一道軌道防線，由你守住。

《Space Tower Defense》是一款放置系科幻策略塔防遊戲。你將建立砲台編隊，在不斷變強的敵軍浪潮中生存；每一局選擇不同科技路線，戰鬥結束後強化永久艦隊，並在菁英敵人與大型 Boss 打亂原有計畫時重新調整戰術。

遊戲特色

• 多種主砲台與輔助砲台可供組合
• 搭配砲台定位、星級強化與戰術連動
• 隨戰況選擇科技卡，建立每一局不同流派
• 解鎖 多種終極技能，發展專精的後期配置
• 對抗持續升級的波次、菁英編隊與大型 Boss
• 支援自動升級與多段戰鬥速度
• 可直接以訪客遊玩，或選用玩家帳號同步雲端存檔
• 支援繁體中文、英文、日文、韓文、俄文與西班牙文

付費與廣告文案須等 StoreKit 和 iOS 廣告功能完成並驗證後定稿；目前草稿不可直接發布。

《Space Tower Defense》由個人獨立開發。玩家回饋會協助決定後續平衡調整、品質改善與新內容方向。

### 2.9.24 更新內容

2.9.24 擴充砲台工坊、實用道具、音樂收藏、養成系統及隱私控制，並加入更多戰術組合、介面改善、穩定性修正、雲端存檔改善，以及可在遊戲內直接永久刪除帳號的功能。

## App Review notes

1. The complete game can be played with the `Guest` button; sign-in is optional.
2. Reviewers may create a temporary Player ID and password to test cloud save. Settings includes a direct permanent account-deletion button.
3. Google sign-in is intentionally not shown on iOS. The iOS build uses the game's own optional account system and guest access.
4. RELEASE BLOCKER: current iOS hides the main cash shop and disables Android ads, but the newer starter-pack entry still references Play. Implement and validate Apple commerce before finalizing this review note.
5. The privacy policy is available from both the login screen and Settings.
6. The app supports portrait and landscape orientations. Gameplay is most naturally presented in landscape.
7. Encryption declaration: the app only uses standard system HTTPS and does not use non-exempt encryption.

## App Privacy questionnaire draft

Confirm every answer in App Store Connect against the production iOS build before submission.

- Data linked to the user: User ID/player ID, gameplay progress, purchase history if Apple IAP is enabled later, and user-submitted support content.
- Data not necessarily linked: diagnostics and product interaction analytics, depending on the final Firebase configuration.
- Advertising data and device identifiers: determine from the final native SDK configuration and observed collection. Hidden ad UI alone does not establish no collection.
- Tracking: determine from actual SDK practices and complete ATT where required; do not assume No from UI gating.
- Account creation: optional.
- Account deletion: available directly in Settings.

## Required screenshots

The existing `store-assets/screenshots-v2` images are `1920 x 1080`, which is not an accepted App Store screenshot size. Capture the actual iOS build in Xcode Simulator after signing is configured.

Minimum recommended capture set:

- iPhone 6.9-inch landscape: `2736 x 1260` or another currently accepted 6.9-inch size.
- iPad 13-inch landscape: `2752 x 2064` or `2732 x 2048`, because the current target supports iPad.
- 5 to 7 images per device family, following the existing sequence: technology choice, orbital crossfire, boss, EMP/frost, drone swarm, mothership, and build screen.

## Submission blockers

- Apple Developer Program enrollment and current agreement status must be confirmed in the signed-in account.
- App Store Connect must confirm the final available app name.
- A Mac with Xcode 26 and the iOS 26 SDK or later is required to sign, archive, validate, and upload this build.
- iPhone and iPad simulator screenshots must be captured at accepted App Store dimensions.
- If real-money currency purchases are enabled for launch, all 16 current products (13 consumable and 3 non-consumable) must be created in App Store Connect and StoreKit purchase verification must be implemented and tested first.
- If rewarded ads are enabled for launch, create a separate iOS app in AdMob and Firebase, add the iOS configuration files and privacy declarations, then retest consent and ad presentation on a real iPhone.

