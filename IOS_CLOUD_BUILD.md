# Windows → 雲端 Mac → Apple 上架

已選用 Codemagic 個人方案。2026-09-23 查核官方文件：個人帳號每月有 500 分鐘 macOS M2 免費額度；開啟付費後超額 M2 為 US$0.095／分鐘。Team 不適用免費額度。帳號已建立，Billing 實際顯示 0 / 500 分鐘、Enable subscription 與 No previous transactions；未啟用付費。

專用私有來源：https://github.com/chentaichun/space-tower-defense-ios ，分支 `codex/ios-cloud`。遊戲內容為 2.9.24 / 57；`.gitattributes` 保留 Windows/macOS 間的原始位元組。

雲端 Xcode 26.6 編譯、146 項測試與 61 個遊戲檔案封裝比對已通過。先前 Simulator 日誌確認缺少 AdMob App ID 導致 `GADInvalidInitializationException`；已補上專用 iOS ID。修正版 commit `9855d68` 已通過原生編譯、封裝核對及 Simulator 程序存活 12 秒檢查：https://codemagic.io/app/6ab3507b76bda2e5cfeea02f/build/6ab35637362df3e768539cca 。尚未簽章／上傳 TestFlight／送審。

使用者已提供 Apple 商店購買完成頁。付款後帳號仍為 Pending，Apple 頁面表示最多 48 小時處理；App Store Connect 尚未可用。不要再次購買。

## 已備妥

- `codemagic.yaml`：手動觸發、M2、30 分鐘上限、Node 22、目前穩定 Xcode。安裝鎖定依賴、同步最新版、跑測試、核對線上版本，再編譯 Simulator App。
- Shared Xcode scheme：雲端可找到 App target。
- `tools/verify-ios-live-version.mjs`：阻擋雲端 checkout 與正式線上版本不同的建置；本地內容更新後需同步到雲端來源。
- `tools/verify-ios-bundle.py`：核對實際編譯 .app 的版本／build／Bundle ID，並逐檔驗證內容 SHA-256。
- 成品是 Simulator 用 .app ZIP，不是可送審的 IPA；原生編譯已在雲端 macOS 通過，修正版已通過短時間啟動，畫面、遊玩與真機仍待驗收。

## 實際啟用順序

1. 使用個人方案建立／登入 Codemagic。服務條款及 GitHub 安裝授權由本人確認；Apple 密碼不放入 Codemagic、原始碼或建置變數。
2. 建立專用私有原始碼儲存庫。正式遊戲資料夾目前沒有 Git；Documents 的同名 Git 專案是平衡工作區，不能拿去建置遊戲。只同步遊戲來源、iOS、測試及必要工具；排除 .admin-key.txt、.wrangler、密鑰、付款資料、backups、日誌、錄影及舊成品。先掃描再推送，不能直接 git add 整個資料夾。
3. Codemagic 只授權這個私有儲存庫，執行 ios-simulator-check。初次仍可能遇到原生編譯問題；編譯成功也不代表能啟動，現有 Firebase 設定缺口仍需解決。
4. 完成 IOS_RELEASE_CHECKLIST.md 中 StoreKit、iOS 廣告／Firebase、圖示、隱私、登入及真機驗收。
5. Apple Developer 會員啟用後，建立 App Store Connect 記錄。以最小必要權限建立 API key，交由 Codemagic 的安全設定管理 signing certificates／provisioning profiles。API key 建立與授權需在實際操作時確認。
6. 新增已簽章 Archive／IPA 工作流程；驗證 IPA 內的 .app 內容，先上傳 TestFlight。每次 Apple 已接收的 build 重建需新 build number，版本號保持對應遊戲內容。
7. 從雲端 Simulator 擷取 iPhone/iPad 截圖；找可用 iPhone 測試者或真機測試服務驗收付款、廣告、效能。雲端編譯不能替代真機測試。
8. 完成商店資料與審查測試存取，再送 App Review。上傳 IPA、通過審核、正式上架是三個不同狀態。

## 官方資料

- Capacitor 流程：https://docs.codemagic.io/yaml-quick-start/building-an-ionic-app/
- 價格：https://docs.codemagic.io/billing/pricing/
- Apple 簽章：https://docs.codemagic.io/yaml-code-signing/signing-ios/

目前無須購買實體 Mac；Apple Developer 會員費仍是另一項獨立費用。
