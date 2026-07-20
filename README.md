# 小小煉金術士 Little Alchemist

一個結合生活製作、AI 配方、基礎化學與藥學知識地圖的響應式 PWA。

## 三個主頁面

### 配方圖鑑

- 107 種人工整理配方
- 材料、工具、用量、替代方案與失敗排查
- 三格 SVG 圖解、原理解說與安全提醒
- 收藏、隨機煉成、分享與離線快取
- 未收錄的安全成品可交由伺服器端 AI 產生草稿

### 進階煉金術

- 完整 118 種元素週期表
- 元素名稱、符號、原子序、原子量、週期、族、分類與常溫狀態
- 元素搜尋、分類篩選與詳細介紹
- 30 條國中常用平衡反應式
- 燃燒、分解、中和、置換、沉澱、生物與地球化學分類
- 每條反應附條件、現象、核心概念與安全邊界

### 高級煉金術

以大學藥學核心架構整理 **8 大領域、48 個主題、6 條學習路線**：

- 藥學基礎：藥品名稱、給藥途徑、劑型、標籤與實證資訊
- 藥劑學：溶解度、溶離、賦形劑、固體與液體製劑、無菌製劑
- 藥物動力學：ADME、生體可用率、分布體積、清除率、半衰期與穩態
- 藥效學：受體、致效與拮抗、劑量反應、治療窗、耐受與交互作用
- 藥物化學：官能基、手性、構效關係、前驅藥、代謝與穩定性
- 治療藥理：止痛、抗感染、過敏呼吸、心血管、內分泌與中樞藥理
- 毒理與用藥安全：不良反應、過敏、中毒、特殊族群、用藥錯誤與藥物警戒
- 分析、品質與法規：層析、光譜、穩定性、GMP、臨床試驗與上市監測

藥學頁只提供教育內容，不提供個人診斷、處方選擇、劑量調整、停藥建議或藥物合成步驟。

## AI 安全設計

AI API 位於 `api/generate.js`，API Key 只從伺服器環境變數讀取，不會傳到瀏覽器。

後端流程：

1. 驗證輸入長度與請求頻率。
2. 阻擋武器、爆炸物、毒物、高壓電等高風險關鍵字。
3. 使用 OpenAI Moderation 進行安全檢查。
4. 使用 Responses API 與固定 JSON Schema 產生繁體中文配方。
5. 再次限制欄位、文字長度、安全等級與圖解數量。
6. AI 配方只保留於目前瀏覽工作階段並標示為草稿。

## 專案結構

```text
.
├── api/generate.js
├── .github/workflows/
│   ├── pages.yml
│   └── validate.yml
├── index.html
├── styles.css
├── enhancements.css
├── advanced-alchemy.css
├── pharmacy-alchemy.css
├── app.js
├── advanced-alchemy.js
├── pharmacy-alchemy.js
├── recipes.js
├── recipe-factory.js
├── recipes-common-01.js ... recipes-common-13.js
├── diagrams.js
├── chemistry-data.js
├── chemistry-elements-01.js ... chemistry-elements-04.js
├── chemistry-reactions.js
├── pharmacy-data.js
├── pharmacy-modules-01.js ... pharmacy-modules-04.js
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

開啟 `http://localhost:8000`。靜態伺服器可使用配方、元素、反應式與藥學知識庫，但不會執行 AI API。

## 啟用 AI

在 Vercel 的 Project Settings → Environment Variables 新增：

```text
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-5-mini
```

重新部署後，網頁會使用同網域的 `/api/generate`。金鑰不可寫入 GitHub、`config.js` 或前端檔案。

可選的跨網域設定：

```text
ALLOWED_ORIGINS=https://你的前端網域
```

## 自動驗證

`.github/workflows/validate.yml` 會檢查：

- JavaScript 與 JSON 語法
- 107 種唯一配方與三格圖解
- 118 種唯一元素與 30 條反應式
- 48 個藥學主題、8 大分類與 6 條有效學習路線
- 三個主標籤與必要頁面元件

## 部署

推送到 `main` 後：

- Vercel 部署 AI 完整版
- GitHub Actions 部署 GitHub Pages 靜態版
- 驗證工作流程檢查所有知識庫

GitHub Pages：`https://xieyaozhong.github.io/Little-alchemist/`