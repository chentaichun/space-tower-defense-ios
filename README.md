# Space Tower Defense｜太空塔防

以太空戰鬥為主題的塔防遊戲，包含砲塔養成、波次挑戰、裝備與商店系統，以及持續開發中的排位對戰。

**這裡是完整主專案的原始碼：網頁遊戲、Android、iOS 與後端服務。**

| 項目 | 目前原始碼狀態 |
| --- | --- |
| 主專案版本 | 2.9.34 |
| Android | 2.9.34 / versionCode 72 |
| iOS 獨立建置快照 | 2.9.30 / build 68.1 |
| 最新原始碼分支 | `main` |
| iOS 建置分支 | `codex/ios-cloud` |

程式碼庫名稱沿用早期 iOS 建置設定，因此網址仍有 `-ios`；`main` 已收錄跨平台主專案。原始碼版本與各商店實際上架狀態分開管理。

## 遊戲與系統

- 波次塔防、敵人與 Boss 戰鬥、砲塔升級與成長。
- 砲塔目錄、裝備、稀有度、抽取與特殊能力。
- 排位賽介面、配對規則、伺服器戰鬥、段位與結算。
- 繁體中文、英文、日文、韓文、西班牙文與俄文介面。
- 玩家帳號、進度儲存、排行榜與帳號刪除。
- Android / iOS 原生內購串接、權益驗證與獎勵廣告整合。
- 遊戲音樂、音效、背景與砲塔美術資源。

## 程式碼導覽

| 位置 | 內容 |
| --- | --- |
| [`index.html`](index.html)、[`v2-features.js`](v2-features.js) | 主遊戲介面與戰鬥系統 |
| [`ranked.html`](ranked.html)、`ranked-*.js` | 排位賽介面、戰鬥、配對、音效與段位 |
| [`turret-catalog.js`](turret-catalog.js) | 共用砲塔目錄 |
| `game-locale*.js`、[`v2-i18n.js`](v2-i18n.js) | 多語系文字與介面切換 |
| [`android/`](android/) | Android 原生專案與 Google Play Billing |
| [`ios/`](ios/) | iOS 原生專案與 Apple StoreKit |
| [`functions/`](functions/) | 帳號、排行榜、商店、付款與排位 API |
| [`server/`](server/) | 排位配對與戰鬥服務 |
| [`migrations/`](migrations/) | 資料庫結構變更 |
| [`assets/`](assets/) | 遊戲美術、音樂與音效 |
| [`tests/`](tests/) | 自動化回歸測試 |
| [`tools/`](tools/) | 本機預覽、檢查、打包與同步工具 |

## 本機預覽

需要 Node.js 22.13 或更新版本及 npm。

```sh
npm ci
node tools/dev-preview-server.cjs 4182
```

開啟 <http://127.0.0.1:4182/>；排位介面位於 <http://127.0.0.1:4182/ranked.html>。此預覽使用本機記憶體中的排位資料；正式帳號、付款、廣告與雲端功能另需對應服務設定。

## 檢查與平台建置

```sh
npm run check
npm test
npm run cap:sync:android
```

Android 原生建置需要 JDK 與 Android SDK；iOS 原生建置需要 macOS / Xcode。簽署憑證與伺服器密鑰不包含在此程式碼庫內。iOS 保留獨立版本，不能將目前主專案直接視為已驗證的新 iOS 發行版。

## 更新與資源

後續主專案修改完成並檢查後，同步至 `main`。同步程序見 [`docs/GITHUB_SYNC.md`](docs/GITHUB_SYNC.md)，檔案雜湊與平台版本見 [`source-snapshot.json`](source-snapshot.json)。

素材來源與授權說明見 [`assets/README.md`](assets/README.md)。公開檢視程式碼不代表授予第三方素材額外的使用或再散布權利。
