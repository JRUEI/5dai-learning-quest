# 5DAI Learning Quest

五日 AI 課程的靜態學習入口。目前完成 Day 1：教材閱讀、任務清單、XP、白皮書簡報與學習筆記。

## 網站結構

- `index.html`：課程入口與五日地圖，不放任務資料庫。
- `day1.html`：Day 1 唯一的進度與筆記資料庫。
- `podcast.html`：完整 Podcast 閱讀版。
- `assignment.html`：完整 Assignment 閱讀版。
- `whitepaper.html`：由 Day_1.pdf 整理的 30 頁圖解簡報。
- `course-data.js`：穩定的任務 ID、分組與 XP。
- `progress.js`：共用 localStorage、舊版進度遷移與容錯。

## 進度保存

網站是純前端 GitHub Pages 網站。進度與筆記保存在目前瀏覽器的 `localStorage`，不會跨裝置同步。白皮書讀到每個六頁分段的末頁時，會自動完成對應任務。

## 公開內容說明

這是公開 repository，包含使用者明確要求公開的完整 Podcast 與 Assignment 轉製內容，也包含從 Day 1 白皮書擷取、用於閱讀簡報的圖解。原始 `Day_1.pdf` 不會上傳到 repository。

## 本機檢查

使用 Node.js 執行：

```powershell
node scripts/validate-site.mjs
```

檢查內容包括本地連結、必要檔案、教材標題、白皮書頁數與 JavaScript 語法。

## 擴充 Day 2-5

新增日期時，優先擴充 `course-data.js` 的穩定 ID 與共用版型，不要在各頁重複建立另一套 localStorage。
