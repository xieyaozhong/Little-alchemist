# 小小煉金術士 Little Alchemist

輸入一個想完成的作品，網站會拆解出：

- 材料、用量與工具
- 三格簡易流程圖解
- 製作步驟與核心比例
- 科學或機械原理
- 影響成敗的關鍵變因
- 替代材料、失敗排查與安全提醒

目前內建 **106 種人工整理配方**：原有 6 種核心配方，再新增 100 種常見家庭、教室、回收手作與自然觀察項目。沒有收錄的安全成品，仍可交由伺服器端 AI 產生結構化配方草稿。

## 配方範圍

- 紙藝與結構：紙飛機、紙船、紙橋、紙塔、紙風車、紙板迷宮
- 機械與物理：氣球小車、風力小車、水輪、滑輪升降機、槓桿秤、擺錘
- 聲音與光學：紙杯電話、吸管排笛、橡皮筋吉他、潛望鏡、水滴放大鏡
- 生活科學：非牛頓流體、密度塔、毛細彩虹、浮沉子、鹽晶體、酸鹼指示液
- 回收與收納：牛奶盒筆筒、手機架、紙箱收納盒、寶特瓶花盆、瓶蓋棋盤
- 藝術與塑形：麵粉黏土、紙黏土、鹽麵糰、泡泡畫、刮畫紙、大理石紋紙
- 植物與氣象：種子發芽袋、水耕、扦插、種子紙、生態瓶、雨量計、風向標

每一種人工配方都有搜尋別名、材料、工具、步驟、原理、安全提醒與三階段 SVG 圖解。

## 功能

- 106 種人工配方搜尋與模糊比對
- 未收錄成品自動交由 AI 分析
- AI Moderation、危險關鍵字阻擋與伺服器端安全規則
- Structured Outputs／JSON Schema 固定 AI 回傳格式
- 收藏、隨機煉成、複製配方與原生分享
- 手機、平板與桌面響應式介面
- PWA 安裝與完整人工圖鑑離線快取
- GitHub Actions 自動檢查 106 種配方的數量、唯一性與必要欄位
- GitHub Pages 靜態版與 Vercel AI 完整版

## AI 安全設計

AI API 位於 `api/generate.js`，API Key 只從伺服器環境變數讀取，不會傳到瀏覽器。

後端流程：

1. 驗證輸入長度與請求頻率。
2. 阻擋武器、爆炸物、毒物、高壓電等危險關鍵字。
3. 使用 OpenAI Moderation 進行安全檢查。
4. 使用 Responses API 產生符合 JSON Schema 的繁體中文配方。
5. 再次限制欄位、文字長度、安全等級與圖解數量。
6. AI 配方標示為草稿，只暫存在目前瀏覽工作階段。

## 專案結構

```text
.
├── api/
│   └── generate.js
├── .github/workflows/
│   ├── pages.yml
│   └── validate.yml
├── index.html
├── styles.css
├── enhancements.css
├── config.js
├── app.js
├── recipes.js
├── recipe-factory.js
├── recipes-common-01.js ... recipes-common-12.js
├── diagrams.js
├── manifest.webmanifest
├── service-worker.js
├── icon.svg
├── vercel.json
└── .env.example
```

## 本機執行

```bash
python -m http.server 8000
```

瀏覽器開啟 `http://localhost:8000`。純靜態伺服器可使用完整 106 種人工圖鑑，但不會執行 `api/generate.js`。

## 啟用 AI

在 Vercel 匯入此 repository，並於 Project Settings → Environment Variables 新增：

```text
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-5-mini
```

重新部署後，網頁會使用同網域的 `/api/generate`。金鑰不可寫入 GitHub、`config.js` 或任何前端檔案。

可選的跨網域設定：

```text
ALLOWED_ORIGINS=https://你的前端網域
```

## 新增更多人工配方

少量核心配方可直接放在 `recipes.js`。大量常見配方建議放入新的 `recipes-common-XX.js`，並透過：

```js
window.LITTLE_ALCHEMIST_ADD_RECIPES([
  {
    id: "unique-id",
    title: "成品名稱",
    aliases: ["別名"],
    emoji: "🧪",
    category: "分類",
    summary: "簡介",
    formula: "核心比例或關係",
    materials: [["材料", "用量"]],
    tools: ["工具"],
    steps: ["至少三個步驟"],
    principle: "原理解說",
    focus: "影響結果的主要條件",
    icons: ["measure", "build", "test"],
    safety: ["安全提醒"]
  }
]);
```

`recipe-factory.js` 會補齊共用欄位並自動建立三格圖解。

## 部署

推送到 `main` 後：

- Vercel 會部署 AI 完整版。
- `.github/workflows/pages.yml` 會部署 GitHub Pages 靜態版。
- `.github/workflows/validate.yml` 會驗證 JavaScript、JSON、106 種唯一配方與三格圖解。

GitHub Pages 靜態網址：`https://xieyaozhong.github.io/Little-alchemist/`
