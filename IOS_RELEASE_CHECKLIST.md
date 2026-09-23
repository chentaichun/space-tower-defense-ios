# iOS 2.9.24 / 57 上架工作紀錄

更新：2026-09-23。狀態：**最新版原始碼與 iOS 資源已對齊；雲端原生編譯與封裝比對已通過，iPhone 模擬器短時間啟動已通過；會員與 App Store Connect 已開通，Bundle ID 註冊、簽署與內購等驗收未完成，不能送審。**

## 2026-09-23 後續進度

- 台灣稅務問卷、W-8BEN 與外國受益所有人聲明在 Apple 後台均為已完成。
- 郵局收款帳戶已由使用者提交，銀行與付費 App 協議目前正在處理；不保存完整銀行或稅務證號。
- 使用者選擇以歐盟貿易商身分繼續。英文地址與信箱草稿已填，尚缺公開聯絡電話，未提交或完成驗證。
- commit 385d9c3 的 iOS 2.9.24 / 57 簽署 IPA 封裝及內容驗證通過，尚未上傳 Apple。
- StoreKit 原生橋接已加入；commit 91b7fab 的雲端原生簽署編譯、封裝內容與配發描述檔驗證已通過。前端與伺服器交易驗證尚未接通，不能視為內購完成。
- 原有 146 項測試再次通過；這不包含 Apple Sandbox 實際交易驗收。
## 已完成並驗證

- package.json、package-lock.json、index.html、app-version.json、Android 版本與線上 `/api/app-version` 均為 2.9.24 / 57（本次查驗；上傳前需再次確認）。
- Xcode Debug 與 Release 均已更新為 2.9.24 / 57。
- `npm run ios:prepare` 可在 Windows 或 Mac 執行：同步正式來源、執行 Capacitor iOS sync、对齊版本、修正 Windows 產生的 Swift 套件路徑。
- `npm run ios:verify` 對正式來源、site 與 iOS public 的 61 個遊戲檔案／素材逐檔做 SHA-256 比對，並偵測多餘的舊素材。
- 報告：`release/ios/source-verification.json`。資源一致不等於原生建置／送審完成。
- 146 項測試通過，包括版本號相同但素材過期、Xcode 版本過期、舊素材殘留、來源版本衝突等檢查。
- 現有程式含 App 內永久刪除帳號流程與後端驗證；仍需 iPhone 上端到端測試。
- 現有 iOS 路徑隱藏 Google 登入並停止 Android 廣告初始化；Android 更新提示只在 Android 啟用，不會直接對 iOS 強制跳轉 Play。

## 帳號與建置環境

- [x] 2026-09-23 使用者自行完成 Apple Developer 一年會員訂單（NT$3,400），已提供 Apple 商店 thankyou 完成頁。未將付款資料或訂單編號寫入專案。
- [x] 會員啟用：使用者提供 App Store Connect 開通郵件；2026-09-23 實際登入成功，依使用者當下確認接受首次服務條款，進入 App 列表。
- [x] 使用者註冊 Bundle ID com.mrchen.spacetowerdefense；App Store Connect 下拉清單已核對一致。Apple Team ID：28SC4755RX（使用者提供識別碼頁）。
- [x] 已建立 iOS App：Space Tower Defense: Nexus、英文（美國）、SKU STD-IOS；Apple App ID 6815095860，版本 2.9.24 已儲存，狀態「準備提交」。尚無已上傳建置。
- [x] App Store Connect API 存取申請及使用聲明均經使用者當下確認後提交，Apple 已核准。
- [ ] 使用者明確授權建立並連接 Codemagic 專用 App 管理 API 金鑰。已建立 Codemagic iOS Release（Key ID 2R9U8QQBS7），Apple 一次性下載按鈕已消失，但 Downloads／Temp 未找到 .p8；已詢問使用者下載位置。尚未將私密金鑰交給 Codemagic，不可聲稱簽署連線完成。
- [x] 使用者從 Chrome 建立並下載替代金鑰 2R949MR5KU；依既有授權上傳至 Codemagic Developer Portal，整合名稱 Codemagic iOS Release 2。後台顯示已連接 1 個金鑰。私密內容未寫入原始碼或工作紀錄。
- [ ] 每個 workflow 的簽署與上傳仍需設定；舊金鑰 2R9U8QQBS7 待使用者確認後撤銷。
- [x] 使用者確認沒有 Mac，採雲端 Mac 路徑；已選 Codemagic 個人 M2，見 IOS_CLOUD_BUILD.md。
- [x] Codemagic 個人免費帳號、私有來源庫連線已完成；未啟用付費訂閱。
- [x] Codemagic Xcode 26.6 原生編譯、61 個封裝遊戲檔案核對通過；雲端 146 項測試通過。
- [x] 修正缺少 iOS AdMob App ID 導致的 GADInvalidInitializationException；build 6ab35637362df3e768539cca 原生編譯／封裝驗證／iPhone Simulator 程序存活 12 秒檢查通過。截圖由雲端產生，但尚未取回做畫面驗收；短時間存活不代表完整遊玩或真機通過。
- [ ] iPhone 與 iPad 的驗收路徑；目前 target 支援兩者。
- [ ] Apple Team、Bundle ID、簽章、App Store Connect App record 與唯一 App 名稱。
- [ ] 發行地區、EU trader 聲明（如發行 EU）、付費 App 協議、稅務與銀行資料（若啟用內購）。法律／身分／付款資料須由本人確認。

## 尚未完成的工程與素材

- [ ] **StoreKit 全流程**：現有現金商品依賴 GooglePlayBilling。不能把 iOS 隱藏／停用狀態當作最新版商業功能完成。需商品查詢、當地化價格、購買／待付款／取消、Apple 伺服器交易驗證、玩家綁定、防重複發貨、重啟補發、適用商品恢復購買與退款處理。
- [ ] **商品設定**：最新清單 16 項，見 `release/ios/products-draft.csv`；13 項消耗型、3 項非消耗型。禮包永久權益恢復不得再次發放一次性消耗獎勵。CSV 是準備資料，尚未在 Apple 建立。
- [ ] **付費入口**：新手包及新增入口需完整走查；目前新手包仍可顯示 Google Play 專用價格／操作，禁止直接送審。
- [ ] **Firebase 驗收**：已在既有 Firebase 專案建立 iOS App，下載官方 GoogleService-Info.plist，核對 Bundle ID／project ID 並加入 Xcode resource；已加入實際 bundle 設定檢查。雲端重新編譯及短時間啟動已通過；事件／崩潰上報仍待驗收。
- [ ] **iOS AdMob**：已建立 iOS App 並加入專用 GADApplicationIdentifier；此修正已通過原生編譯及短時間啟動驗證。專用廣告單元、必要 SKAdNetwork 資訊、iOS 廣告及同意流程仍未完成，不能沿用 Android IDs。
- [ ] **隱私**：依最終 SDK 與蒐集行為完成 App Privacy、privacy manifests／required-reason APIs、隱私政策與 ATT 判定。不能因 JS 隱藏廣告就宣稱 SDK 不蒐集資料。
- [ ] **登入**：既有 iOS 提供自有玩家帳密／訪客，隱藏 Google 登入；驗證舊帳號跨平台使用。如要啟用第三方主帳號登入，依 4.8 完成符合條件的替代登入及帳號連結，通常採 Sign in with Apple。
- [ ] **App Store 更新**：取得 Apple App ID 後新增 iOS 專用更新來源、商店 URL 與獨立發布狀態，不得共用 Android 強制更新政策。
- [ ] **圖示**：目前 iOS AppIcon 是 Capacitor 預設圖。正式素材為 store-assets/source-icon.png 或 app-icon-1024.png；後者有透明度，需輸出 Apple 接受的 1024×1024 無 alpha 版本並視覺驗證，尚未替換。
- [ ] **啟動畫面**：仍引用原始 Splash asset；需使用正式素材並驗證各方向。
- [ ] **截圖**：需從實際 iOS build／Simulator 擷取 iPhone 與 iPad 圖，不使用 Android 截圖冒充。

## App Store Connect 資料

- [ ] 名稱可用性、SKU、主要語言、Games 分類、價格與地區。
- [ ] APPLE_APP_STORE_LISTING.md 的中英文文案依最終啟用功能定稿。
- [ ] 年齡分級依科幻戰鬥、隨機獎勵、廣告及互動內容實際回答。
- [ ] 付費隨機獎勵在購買前揭露機率。
- [ ] 隱私／支援網址、權利與素材授權、著作權人、審查聯絡資料。
- [ ] 內購截圖、名稱／描述／售價／地區，依 Connect 要求與首版提交。
- [ ] 審查可完整使用的帳號或模式；真實玩家帳密不得寫入專案。
- [ ] 按最終套件確認加密使用狀況與 export compliance 聲明。

## Mac 操作與驗收

```bash
npm ci
npm run ios:prepare
npm test
npm run ios:verify
npx cap open ios
```

Xcode 設定 Team 後先測 Simulator／真機，再 Archive、Validate App、上傳 TestFlight。指令不會自動上傳，也不替代簽章或原生測試。

驗收：冷啟動、離線、登入／刪除、存檔、音樂（含 OGG 相容性）、前後台切換、安全區域、橫直向、低記憶體、效能、全商品、付款／取消／待付款／斷線補發／恢復、廣告完成／中斷、同意拒絕與多語系。

上傳前再次核對最新來源及線上版本。若已超過 2.9.24，重新準備、驗證與 Archive，不上傳此舊快照。產生 IPA 後仍需核對 CFBundleShortVersionString、CFBundleVersion、Bundle ID 與封裝檔案雜湊，才能證明實際上傳的是同版。

## 官方依據

- 工具鏈：https://developer.apple.com/news/upcoming-requirements/
- 審查：https://developer.apple.com/app-store/review/guidelines/
- 提交：https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/overview-of-submitting-for-review
- 截圖：https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
- SDK 隱私：https://developer.apple.com/support/third-party-SDK-requirements/
- 追蹤：https://developer.apple.com/app-store/user-privacy-and-data-use/


