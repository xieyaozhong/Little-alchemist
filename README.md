# 小小煉金術士 Little Alchemist

輸入一個想完成的作品，網站會把它拆成：

- 製作材料與精確用量
- 所需工具與可替代材料
- 三格簡易流程圖解
- 製作配方與逐步流程
- 科學或機械原理
- 影響成敗的關鍵變因
- 失敗排查與安全提醒

網站會優先搜尋人工整理圖鑑；沒有收錄的安全成品，會呼叫伺服器端 AI 產生結構化配方草稿。

## 已收錄配方

- 彈力球（也支援「彈簧球」、「跳跳球」等別名）
- 橡皮筋動力車
- 氣球火箭
- 自製熔岩燈
- 檸檬電池
- 自製指南針

每個內建配方都有三格 SVG 圖解。AI 配方也必須產生三個圖解階段，並會標示為「AI 配方草稿」。

## 功能

- 成品名稱搜尋與模糊比對
- 未收錄成品自動交由 AI 分析
- AI Moderation、危險關鍵字阻擋與伺服器端安全規則
- 固定 JSON Schema，避免 AI 回傳無法使用的自由格式內容
- 材料、工具、比例、步驟與原理解說
- 三格 SVG 流程圖解
- 替代材料、變因分析、失敗排查與安全分級
- 收藏、隨機煉成、複製配方與原生分享
- 手機、平板與桌面響應式介面
- PWA 安裝與離線快取
- GitHub Pages 靜態圖鑑部署
- Vercel AI 完整版部署

## AI 安全設計

AI API 位於 `api/generate.js`，金鑰只從伺服器環境變數讀取，不會傳到瀏覽器。

後端流程：

1. 驗證輸入長度與請求頻率。
2. 阻擋武器、爆炸物、毒物、高壓電等危險關鍵字。
3. 呼叫 `omni-moderation-latest` 進行內容安全檢查。
4. 使用 OpenAI Responses API 產生符合 JSON Schema 的繁體中文配方。
5. 再次限制陣列長度、文字長度、安全等級與圖解數量。
6. AI 配方只暫存在目前瀏覽工作階段，不會混成永久人工圖鑑。

AI 仍可能出錯，因此介面會清楚標示草稿並要求成人再次核對。

## 專案結構

```text
.
├── api/
│   └── generate.js
├── .github/workflows/pages.yml
├── index.html
├── styles.css
├── enhancements.css
├── app.js
├── recipes.js
├── diagrams.js
├── manifest.webmanifest
├── service-worker.js
├── icon.svg
├── vercel.json
└── .env.example
```

## 本機執行靜態圖鑑

```bash
python -m http.server 8000
```

瀏覽器開啟 `http://localhost:8000`。純靜態伺服器不會執行 `api/generate.js`，因此只能使用內建圖鑑與圖解。

## 啟用 AI

### 方式一：部署完整網站到 Vercel

1. 在 Vercel 匯入此 GitHub repository。
2. Framework Preset 選擇 `Other`，一般情況不需要 Build Command。
3. 在 Project Settings → Environment Variables 新增：

```text
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-5-mini
```

4. 重新部署。
5. 網頁會使用同網域的 `/api/generate`，不需要把 API Key 放到前端。

可選環境變數：

```text
ALLOWED_ORIGINS=https://你的前端網域
```

只有前端與 API 分開部署時才需要設定跨網域來源。

### 方式二：只使用 GitHub Pages

GitHub Pages 只能提供靜態檔案，因此會保留人工圖鑑、搜尋、收藏、圖解與離線功能，但無法直接執行 AI API。要使用 AI，請將整個專案部署到 Vercel，或另外部署 `api/generate.js` 後設定前端 API endpoint。

## 新增人工配方

在 `recipes.js` 的 `window.LITTLE_ALCHEMIST_RECIPES` 陣列加入物件：

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

接著在 `diagrams.js` 使用相同 `id` 加入三個圖解階段：

```js
"unique-id": [
  { icon: "measure", title: "量取材料", caption: "簡短說明" },
  { icon: "mix", title: "混合製作", caption: "簡短說明" },
  { icon: "test", title: "完成測試", caption: "簡短說明" }
]
```

## GitHub Pages 部署

推送到 `main` 後，`.github/workflows/pages.yml` 會部署靜態版本。首次使用時，在 repository 的 **Settings → Pages** 將來源設定為 **GitHub Actions**。

靜態網址：`https://xieyaozhong.github.io/Little-alchemist/`
