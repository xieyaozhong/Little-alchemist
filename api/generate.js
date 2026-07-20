"use strict";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODERATIONS_URL = "https://api.openai.com/v1/moderations";
const MAX_QUERY_LENGTH = 60;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 10;

const BLOCKED_TERMS = [
  "炸彈", "爆炸物", "火藥", "槍", "子彈", "彈藥", "燃燒彈", "毒藥", "毒氣",
  "迷藥", "毒品", "冰毒", "甲基安非他命", "自製武器", "電擊器", "高壓電",
  "bomb", "explosive", "gunpowder", "ammunition", "poison", "weapon", "incendiary"
];

const ICONS = [
  "measure", "mix", "shape", "build", "connect", "pour", "drop", "heat", "wait",
  "test", "move", "cut", "fold", "paint", "observe", "clean", "inflate", "magnet",
  "float", "light", "bubbles", "rocket", "battery", "compass", "ball", "insert",
  "string", "wind"
];

const RECIPE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["safe", "refusalReason", "recipe"],
  properties: {
    safe: { type: "boolean" },
    refusalReason: { type: "string" },
    recipe: {
      type: "object",
      additionalProperties: false,
      required: [
        "title", "aliases", "emoji", "category", "difficulty", "time", "safetyLevel",
        "safetyLabel", "summary", "formula", "materials", "tools", "steps", "principle",
        "keyVariables", "substitutes", "troubleshooting", "safety", "diagram"
      ],
      properties: {
        title: { type: "string" },
        aliases: { type: "array", items: { type: "string" } },
        emoji: { type: "string" },
        category: { type: "string" },
        difficulty: { type: "string" },
        time: { type: "string" },
        safetyLevel: { type: "string", enum: ["low", "medium"] },
        safetyLabel: { type: "string" },
        summary: { type: "string" },
        formula: { type: "string" },
        materials: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["name", "amount"],
            properties: {
              name: { type: "string" },
              amount: { type: "string" }
            }
          }
        },
        tools: { type: "array", items: { type: "string" } },
        steps: { type: "array", items: { type: "string" } },
        principle: { type: "string" },
        keyVariables: { type: "array", items: { type: "string" } },
        substitutes: { type: "array", items: { type: "string" } },
        troubleshooting: { type: "array", items: { type: "string" } },
        safety: { type: "array", items: { type: "string" } },
        diagram: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["icon", "title", "caption"],
            properties: {
              icon: { type: "string", enum: ICONS },
              title: { type: "string" },
              caption: { type: "string" }
            }
          }
        }
      }
    }
  }
};

const DEVELOPER_PROMPT = `
你是「小小煉金術士」的安全配方編輯器。使用者會輸入一個想製作的成品。

你的任務：
1. 只為一般家庭、教室或手作環境可安全完成的低風險作品建立繁體中文配方。
2. 給出容易取得的材料、合理用量、工具、逐步方式、科學或機械原理、影響變因、替代材料、失敗排查與安全提醒。
3. diagram 必須剛好提供 3 個簡單圖解階段，每個 caption 最多 35 個中文字。
4. 步驟應具體但不冗長，通常 4 至 7 步；材料通常 3 至 8 項。
5. 若存在多種做法，優先選擇低溫、低壓、無明火、無強酸強鹼、無有毒溶劑、無市電的版本。
6. 不可假裝已驗證未知精密數值；不確定時使用保守範圍並清楚提醒成人評估。
7. safetyLabel 使用「低風險」或「成人陪同」。

必須拒絕：
- 武器、槍械、彈藥、爆炸物、燃燒物、陷阱、毒物、迷藥、非法藥物。
- 高壓容器、市電、高電壓、危險雷射、強腐蝕性化學品或會釋放有毒氣體的製作。
- 入侵、繞過安全、傷害人或動物、違法用途。
- 成品本身無法由一般使用者安全自製，或缺乏足夠資訊判斷安全性的項目。

拒絕時 safe=false，refusalReason 用一句繁體中文說明；recipe 的字串填空字串、陣列填空陣列，diagram 填空陣列。
接受時 safe=true，refusalReason 填空字串。不要加入 Markdown，不要加入 schema 以外欄位。
`;

function normalizeText(value) {
  return String(value || "").trim();
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (Array.isArray(forwarded)) return forwarded[0];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function rateLimit(ip) {
  const store = globalThis.__littleAlchemistRateLimit || new Map();
  globalThis.__littleAlchemistRateLimit = store;
  const now = Date.now();
  const previous = (store.get(ip) || []).filter(timestamp => now - timestamp < RATE_WINDOW_MS);
  if (previous.length >= RATE_LIMIT) return false;
  previous.push(now);
  store.set(ip, previous);
  return true;
}

function setCors(req, res) {
  const origin = req.headers.origin;
  const allowed = normalizeText(process.env.ALLOWED_ORIGINS)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);

  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  for (const item of payload?.output || []) {
    for (const part of item?.content || []) {
      if (part?.type === "output_text" && typeof part.text === "string") return part.text;
    }
  }
  return "";
}

function trimArray(value, max, mapper = item => normalizeText(item)) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, max).map(mapper).filter(Boolean);
}

function sanitizeRecipe(recipe) {
  const clean = {
    title: normalizeText(recipe.title).slice(0, 40),
    aliases: trimArray(recipe.aliases, 6).map(item => item.slice(0, 30)),
    emoji: normalizeText(recipe.emoji).slice(0, 8) || "🧪",
    category: normalizeText(recipe.category).slice(0, 30),
    difficulty: normalizeText(recipe.difficulty).slice(0, 20),
    time: normalizeText(recipe.time).slice(0, 30),
    safetyLevel: recipe.safetyLevel === "medium" ? "medium" : "low",
    safetyLabel: recipe.safetyLevel === "medium" ? "成人陪同" : "低風險",
    summary: normalizeText(recipe.summary).slice(0, 220),
    formula: normalizeText(recipe.formula).slice(0, 220),
    materials: trimArray(recipe.materials, 10, item => {
      const name = normalizeText(item?.name).slice(0, 50);
      const amount = normalizeText(item?.amount).slice(0, 80);
      return name && amount ? { name, amount } : null;
    }),
    tools: trimArray(recipe.tools, 10).map(item => item.slice(0, 80)),
    steps: trimArray(recipe.steps, 8).map(item => item.slice(0, 260)),
    principle: normalizeText(recipe.principle).slice(0, 900),
    keyVariables: trimArray(recipe.keyVariables, 6).map(item => item.slice(0, 220)),
    substitutes: trimArray(recipe.substitutes, 6).map(item => item.slice(0, 220)),
    troubleshooting: trimArray(recipe.troubleshooting, 6).map(item => item.slice(0, 220)),
    safety: trimArray(recipe.safety, 8).map(item => item.slice(0, 240)),
    diagram: trimArray(recipe.diagram, 3, item => {
      const icon = ICONS.includes(item?.icon) ? item.icon : "observe";
      const title = normalizeText(item?.title).slice(0, 20);
      const caption = normalizeText(item?.caption).slice(0, 70);
      return title && caption ? { icon, title, caption } : null;
    })
  };

  if (!clean.title || clean.materials.length < 2 || clean.steps.length < 3 || clean.diagram.length !== 3) {
    throw new Error("AI 回傳的配方結構不完整");
  }
  return clean;
}

async function callOpenAI(url, body, apiKey, signal) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    signal
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error("OpenAI request failed");
    error.status = response.status;
    error.requestId = response.headers.get("x-request-id") || "";
    throw error;
  }
  return payload;
}

module.exports = async function handler(req, res) {
  setCors(req, res);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "只接受 POST 請求。" });

  const ip = getClientIp(req);
  if (!rateLimit(ip)) return res.status(429).json({ error: "AI 使用次數過於頻繁，請稍後再試。" });

  const apiKey = normalizeText(process.env.OPENAI_API_KEY);
  if (!apiKey) {
    return res.status(503).json({
      error: "AI 尚未啟用：伺服器缺少 OPENAI_API_KEY 環境變數。",
      code: "AI_NOT_CONFIGURED"
    });
  }

  const body = parseBody(req);
  const query = normalizeText(body.query);
  if (!query) return res.status(400).json({ error: "請輸入想製作的成品。" });
  if (query.length > MAX_QUERY_LENGTH) return res.status(400).json({ error: "成品名稱過長。" });

  const normalizedQuery = query.toLowerCase().replace(/\s+/g, "");
  if (BLOCKED_TERMS.some(term => normalizedQuery.includes(term.toLowerCase().replace(/\s+/g, "")))) {
    return res.status(422).json({ error: "這個項目可能涉及危險用途，因此不提供製作配方。", code: "UNSAFE_REQUEST" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 38_000);

  try {
    const moderation = await callOpenAI(
      OPENAI_MODERATIONS_URL,
      { model: "omni-moderation-latest", input: query },
      apiKey,
      controller.signal
    );

    if (moderation?.results?.[0]?.flagged) {
      return res.status(422).json({ error: "這個項目未通過安全檢查，因此不提供製作配方。", code: "UNSAFE_REQUEST" });
    }

    const model = normalizeText(process.env.OPENAI_MODEL) || "gpt-5-mini";
    const response = await callOpenAI(
      OPENAI_RESPONSES_URL,
      {
        model,
        store: false,
        reasoning: { effort: "low" },
        max_output_tokens: 4200,
        input: [
          { role: "developer", content: [{ type: "input_text", text: DEVELOPER_PROMPT }] },
          { role: "user", content: [{ type: "input_text", text: `想製作的成品：${query}` }] }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "little_alchemist_recipe",
            strict: true,
            schema: RECIPE_SCHEMA
          }
        }
      },
      apiKey,
      controller.signal
    );

    const outputText = extractOutputText(response);
    if (!outputText) throw new Error("AI 沒有回傳可讀內容");

    const generated = JSON.parse(outputText);
    if (!generated.safe) {
      return res.status(422).json({
        error: normalizeText(generated.refusalReason) || "這個項目不適合在一般環境自行製作。",
        code: "UNSUPPORTED_RECIPE"
      });
    }

    const recipe = sanitizeRecipe(generated.recipe);
    return res.status(200).json({ recipe, model, generatedAt: new Date().toISOString() });
  } catch (error) {
    if (error?.name === "AbortError") {
      return res.status(504).json({ error: "AI 回應逾時，請稍後再試。", code: "AI_TIMEOUT" });
    }
    console.error("Little Alchemist AI error", {
      message: error?.message,
      status: error?.status,
      requestId: error?.requestId
    });
    return res.status(502).json({ error: "AI 暫時無法完成配方，請稍後再試。", code: "AI_UPSTREAM_ERROR" });
  } finally {
    clearTimeout(timeout);
  }
};
