# 小小煉金術士 Little Alchemist

輸入一個想完成的作品，網站會把它拆成：

- 製作材料與精確用量
- 所需工具與可替代材料
- 製作配方與逐步流程
- 科學或機械原理
- 影響成敗的關鍵變因
- 失敗排查與安全提醒

這是一個不需要後端、可直接部署到 GitHub Pages 的繁體中文 PWA。

## 已收錄配方

- 彈力球（也支援「彈簧球」、「跳跳球」等別名）
- 橡皮筋動力車
- 氣球火箭
- 自製熔岩燈
- 檸檬電池
- 自製指南針

第一版只顯示人工整理與檢查的生活科學配方。未知項目不會自動編造做法；武器、毒物、爆炸物等高風險關鍵字會被阻擋。

## 功能

- 成品名稱搜尋與模糊比對
- 即時搜尋建議
- 材料、工具、比例、步驟與原理解說
- 替代材料、變因分析、失敗排查與安全分級
- 收藏與隨機煉成
- 複製完整配方與原生分享
- 手機、平板與桌面響應式介面
- PWA 安裝與離線快取
- GitHub Actions 自動部署 GitHub Pages

## 專案結構

```text
.
├── index.html
├── styles.css
├── app.js
├── recipes.js
├── manifest.webmanifest
├── service-worker.js
├── icon.svg
└── .github/workflows/pages.yml
```

## 本機執行

這是純靜態網站，請用本機 HTTP 伺服器開啟：

```bash
python -m http.server 8000
```

瀏覽器開啟 `http://localhost:8000`。

## 新增配方

在 `recipes.js` 的 `window.LITTLE_ALCHEMIST_RECIPES` 陣列加入物件。每筆資料應包含：

```js
{
  id: "unique-id",
  title: "成品名稱",
  aliases: ["別名"],
  emoji: "🧪",
  category: "科學分類",
  difficulty: "入門",
  time: "約 20 分鐘",
  safetyLevel: "low",
  safetyLabel: "低風險",
  summary: "簡介",
  formula: "配方或核心關係",
  materials: [{ name: "材料", amount: "用量" }],
  tools: ["工具"],
  steps: ["步驟"],
  principle: "原理解說",
  keyVariables: ["關鍵變因"],
  substitutes: ["替代材料"],
  troubleshooting: ["失敗排查"],
  safety: ["安全提醒"]
}
```

新增內容前應先確認材料、濃度、使用情境與兒童安全性。

## 部署

推送到 `main` 後，`.github/workflows/pages.yml` 會部署靜態網站。首次使用時，請在 repository 的 **Settings → Pages** 將來源設定為 **GitHub Actions**。

預期網址：`https://xieyaozhong.github.io/Little-alchemist/`

## 下一階段

若要讓未知成品也能由 AI 產生分析，建議新增受控後端：AI 先輸出結構化草稿，再經安全規則、來源驗證與人工審核後才公開，不要把 API Key 放在前端或 GitHub Pages。
