# 5DAI Learning Quest

五日 AI 課程的靜態學習入口。目前完成 Day 1：教材閱讀、任務清單、XP 與白皮書簡報。

## 網站結構

- `index.html`：課程入口與五日地圖，不放任務資料庫。
- `day1.html`：Day 1 教材入口與唯一的進度資料庫。
- `podcast.html`：完整 Podcast，提供文章版與原始圖卡版。
- `assignment.html`：完整 Assignment，提供文章版與原始圖卡版。
- `whitepaper.html`：由 Day_1.pdf 整理的 30 頁圖解簡報。
- `course-data.js`：穩定的任務 ID、分組與 XP。
- `progress.js`：共用 localStorage、舊版進度遷移與容錯。
- `material.js`：教材雙閱讀模式與 Podcast 完成狀態。

## 教材閱讀模式

Podcast 與 Assignment 維持單一網址與單一內容來源：

- 手機首次開啟預設為原始 1080 × 1920 圖卡版。
- 桌機首次開啟預設為目錄＋文章的一覽閱讀版。
- 頁首可手動切換「文章版／圖卡版」。
- 手動選擇保存在 `localStorage`，之後優先沿用。
- 手機圖卡可點擊放大，並左右滑動切換。

## 進度保存

網站是純前端 GitHub Pages 網站。進度保存在目前瀏覽器的 `localStorage`，不會跨裝置同步。白皮書讀到每個六頁分段的末頁時，會自動完成對應任務。

## 公開內容說明

這是公開 repository，包含使用者明確要求公開的完整 Podcast 與 Assignment 轉製內容，也包含從 Day 1 白皮書擷取、用於閱讀簡報的圖解。原始 `Day_1.pdf` 不會上傳到 repository。

## 本機檢查

```powershell
node scripts/validate-site.mjs
```

檢查內容包括本地連結、必要檔案、教材切換控制、白皮書頁數與 JavaScript 語法。

## 擴充 Day 2-5

新增日期時，優先擴充 `course-data.js` 的穩定 ID 與共用版型，不要在各頁重複建立另一套 localStorage。
