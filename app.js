"use strict";

(() => {
  const curatedRecipes = Array.isArray(window.LITTLE_ALCHEMIST_RECIPES)
    ? window.LITTLE_ALCHEMIST_RECIPES
    : [];
  const diagramLibrary = window.LITTLE_ALCHEMIST_DIAGRAMS || {};

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const STORAGE_KEY = "little-alchemist-favorites-v1";
  const AI_CACHE_KEY = "little-alchemist-ai-recipes-v1";
  const AI_ENDPOINT = window.LITTLE_ALCHEMIST_CONFIG?.aiEndpoint || "./api/generate";
  const AI_TIMEOUT_MS = 48_000;

  const elements = {
    form: $("#searchForm"),
    input: $("#searchInput"),
    suggestions: $("#suggestions"),
    result: $("#resultContainer"),
    empty: $("#emptyState"),
    resultSection: $("#resultSection"),
    grid: $("#recipeGrid"),
    template: $("#recipeCardTemplate"),
    randomButton: $("#randomButton"),
    favoritesButton: $("#favoritesButton"),
    favoriteCount: $("#favoriteCount")
  };

  const blockedKeywords = [
    "炸彈", "爆炸物", "火藥", "槍", "子彈", "彈藥", "毒藥", "毒氣", "迷藥",
    "甲基安非他命", "冰毒", "毒品", "自製武器", "燃燒彈", "電擊器", "高壓電",
    "bomb", "explosive", "gunpowder", "poison", "weapon", "ammunition", "incendiary"
  ];

  const recipes = [...curatedRecipes, ...loadAIRecipes()];
  let favorites = loadFavorites();
  let favoritesOnly = false;
  let suggestionIndex = -1;
  let visibleSuggestions = [];
  let activeAIController = null;

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLocaleLowerCase("zh-Hant")
      .replace(/[\s\-_/·・，。！？、,.!?()（）]/g, "");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function hashString(value) {
    let hash = 2166136261;
    for (const char of String(value)) {
      hash ^= char.codePointAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function loadFavorites() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return new Set(Array.isArray(value) ? value : []);
    } catch {
      return new Set();
    }
  }

  function loadAIRecipes() {
    try {
      const value = JSON.parse(sessionStorage.getItem(AI_CACHE_KEY) || "[]");
      if (!Array.isArray(value)) return [];
      return value.filter(recipe => recipe && recipe.id && recipe.title && Array.isArray(recipe.steps));
    } catch {
      return [];
    }
  }

  function saveFavorites() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    elements.favoriteCount.textContent = String(favorites.size);
  }

  function saveAIRecipes() {
    const aiRecipes = recipes.filter(recipe => recipe.source === "ai").slice(0, 8);
    sessionStorage.setItem(AI_CACHE_KEY, JSON.stringify(aiRecipes));
  }

  function allSearchTerms(recipe) {
    return [recipe.title, recipe.category, ...(recipe.aliases || [])].map(normalize);
  }

  function searchScore(recipe, query) {
    const q = normalize(query);
    if (!q) return 0;
    const terms = allSearchTerms(recipe);
    if (normalize(recipe.title) === q) return 100;
    if ((recipe.aliases || []).some(alias => normalize(alias) === q)) return 95;
    if (terms.some(term => term.startsWith(q))) return 75;
    if (terms.some(term => term.includes(q) || q.includes(term))) return 55;

    const queryChars = new Set([...q]);
    const titleChars = new Set([...normalize(recipe.title)]);
    const overlap = [...queryChars].filter(char => titleChars.has(char)).length;
    return overlap >= Math.max(2, Math.ceil(queryChars.size * 0.55)) ? 20 + overlap : 0;
  }

  function findMatches(query, limit = recipes.length) {
    return recipes
      .map(recipe => ({ recipe, score: searchScore(recipe, query) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.recipe.title.localeCompare(b.recipe.title, "zh-Hant"))
      .slice(0, limit)
      .map(item => item.recipe);
  }

  function isBlocked(query) {
    const q = normalize(query);
    return blockedKeywords.some(keyword => q.includes(normalize(keyword)));
  }

  function setHash(id) {
    const target = id ? `#recipe=${encodeURIComponent(id)}` : "#top";
    if (window.location.hash !== target) history.replaceState(null, "", target);
  }

  function getRecipeById(id) {
    return recipes.find(item => item.id === id);
  }

  function renderCards() {
    elements.grid.innerHTML = "";
    const list = favoritesOnly ? recipes.filter(recipe => favorites.has(recipe.id)) : recipes;

    if (favoritesOnly && list.length === 0) {
      elements.grid.innerHTML = '<div class="not-found"><div class="empty-symbol">☆</div><h2>還沒有收藏</h2><p>打開任何配方，按下「加入收藏」就會保存在這台裝置。</p></div>';
      return;
    }

    list.forEach(recipe => {
      const fragment = elements.template.content.cloneNode(true);
      const card = $(".recipe-card", fragment);
      card.dataset.recipeId = recipe.id;
      card.classList.toggle("is-ai", recipe.source === "ai");
      $(".recipe-emoji", fragment).textContent = recipe.emoji;
      $(".recipe-category", fragment).innerHTML = recipe.source === "ai"
        ? `${escapeHtml(recipe.category)}<span class="recipe-ai-label">✦ AI</span>`
        : escapeHtml(recipe.category);
      $(".recipe-title", fragment).textContent = recipe.title;
      $(".recipe-summary", fragment).textContent = recipe.summary;
      $(".recipe-meta", fragment).innerHTML = [recipe.difficulty, recipe.time, recipe.safetyLabel]
        .map(value => `<span>${escapeHtml(value)}</span>`)
        .join("");

      const favoriteButton = $(".card-favorite", fragment);
      const selected = favorites.has(recipe.id);
      favoriteButton.textContent = selected ? "★" : "☆";
      favoriteButton.classList.toggle("is-favorite", selected);
      favoriteButton.setAttribute("aria-label", selected ? `取消收藏${recipe.title}` : `收藏${recipe.title}`);

      elements.grid.append(fragment);
    });
  }

  function listHtml(items, className = "prose-list") {
    const safeItems = Array.isArray(items) ? items : [];
    return `<ul class="${className}">${safeItems.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function materialHtml(materials) {
    const safeMaterials = Array.isArray(materials) ? materials : [];
    return `<ul class="clean-list">${safeMaterials.map(item => `
      <li><span>${escapeHtml(item.name)}</span><span>${escapeHtml(item.amount)}</span></li>
    `).join("")}</ul>`;
  }

  function iconSvg(icon) {
    const start = '<svg viewBox="0 0 120 120" aria-hidden="true">';
    const end = "</svg>";
    const icons = {
      measure: '<path d="M35 18v70a22 22 0 0 0 44 0V18"/><path d="M30 18h54"/><path class="diagram-fill" d="M36 68h42v20a21 21 0 0 1-42 0Z"/><path d="M44 39h12M44 50h18"/>',
      mix: '<path d="M43 18h34M49 18v25L28 91a12 12 0 0 0 11 17h42a12 12 0 0 0 11-17L71 43V18"/><path class="diagram-fill" d="M34 82c18-14 31 12 51-3l8 17a12 12 0 0 1-12 12H39a12 12 0 0 1-11-17Z"/><path d="M84 27 60 65"/>',
      ball: '<circle class="diagram-fill" cx="60" cy="61" r="35"/><path d="M38 90c12 13 32 17 48 7"/><path class="diagram-accent" d="M27 25 16 14m77 13 11-11M60 14V3"/>',
      build: '<rect class="diagram-fill" x="22" y="50" width="76" height="28" rx="7"/><circle cx="39" cy="87" r="13"/><circle cx="82" cy="87" r="13"/><path d="M31 50 46 34h28l15 16M24 64h72"/>',
      wind: '<circle cx="60" cy="64" r="30"/><path d="M60 34v60M30 64h60"/><path class="diagram-accent" d="M35 27c22-18 55-6 62 17m0 0-12-7m12 7 3-13"/>',
      move: '<path class="diagram-fill" d="M19 63h64l16 15H35Z"/><circle cx="42" cy="88" r="11"/><circle cx="82" cy="88" r="11"/><path class="diagram-accent" d="M11 40h33M5 53h25M20 28h18"/>',
      string: '<path d="M10 59h100"/><rect class="diagram-fill" x="47" y="47" width="26" height="24" rx="6"/><circle cx="10" cy="59" r="5"/><circle cx="110" cy="59" r="5"/>',
      inflate: '<path class="diagram-fill" d="M65 22c24 0 38 18 32 40-4 15-17 23-32 29-15-6-28-14-32-29-6-22 8-40 32-40Z"/><path d="m61 91-5 14h18l-5-14M55 105h20"/>',
      rocket: '<path class="diagram-fill" d="M68 21c20 12 28 31 23 55L68 99 45 76c-5-24 3-43 23-55Z"/><circle cx="68" cy="55" r="10"/><path d="m45 76-17 5 12-20m51 15 17 5-12-20"/><path class="diagram-accent" d="m57 99-7 14m18-14v16m11-16 7 14"/>',
      pour: '<path d="M23 26h42l8 24-27 45L20 73Z"/><path class="diagram-fill" d="M25 66c14-8 24 10 39 0L46 95 20 73Z"/><path d="m71 48 24 13"/><path class="diagram-accent" d="M98 65c0 9-7 14-13 14s-11-5-11-11c0-8 11-18 11-18s13 8 13 15Z"/>',
      drop: '<path class="diagram-fill" d="M60 17s29 31 29 55a29 29 0 1 1-58 0c0-24 29-55 29-55Z"/><path d="M47 78c4 8 11 12 20 12"/>',
      bubbles: '<circle class="diagram-fill" cx="43" cy="78" r="21"/><circle cx="79" cy="52" r="15"/><circle class="diagram-accent" cx="47" cy="31" r="9"/><path d="M91 89c8-8 12-18 12-29"/>',
      insert: '<path class="diagram-fill" d="M21 75c5-29 21-45 39-45s34 16 39 45c3 18-12 31-39 31S18 93 21 75Z"/><path d="M43 17v58M78 17v58"/><path class="diagram-accent" d="M37 17h12m23 0h12"/>',
      connect: '<circle cx="28" cy="60" r="15"/><circle cx="92" cy="60" r="15"/><path d="M43 60h34"/><path class="diagram-accent" d="m63 48 14 12-14 12"/>',
      light: '<path class="diagram-fill" d="M60 17a29 29 0 0 1 18 52c-7 6-9 11-9 18H51c0-7-2-12-9-18a29 29 0 0 1 18-52Z"/><path d="M50 88h20M53 99h14"/><path class="diagram-accent" d="M18 30 8 22m94 8 10-8M60 4V-7"/>',
      magnet: '<path class="diagram-fill" d="M27 29v35a33 33 0 0 0 66 0V29H75v35a15 15 0 0 1-30 0V29Z"/><path d="M27 43h18m30 0h18"/>',
      float: '<path d="M16 78c13-8 25 8 38 0s25 8 38 0 20 4 20 4"/><path class="diagram-fill" d="m37 63 46-9 9 16-55 9Z"/><path class="diagram-accent" d="M53 49 78 21"/>',
      compass: '<circle class="diagram-fill" cx="60" cy="61" r="43"/><path d="M60 10v11m0 80v11M9 61h11m80 0h11"/><path class="diagram-accent" d="m73 37-8 29-29 18 18-29Z"/>',
      shape: '<path class="diagram-fill" d="M25 89 42 31h36l17 58Z"/><path d="M42 31 60 15l18 16M37 64h46"/>',
      wait: '<circle class="diagram-fill" cx="60" cy="63" r="40"/><path d="M60 39v27l18 11M43 12h34"/>',
      test: '<path d="M30 20h60v84H30Z"/><path class="diagram-fill" d="M40 67h40v25H40Z"/><path d="M42 36h36M42 50h23"/><path class="diagram-accent" d="m43 78 9 9 24-25"/>',
      observe: '<path class="diagram-fill" d="M11 62s18-30 49-30 49 30 49 30-18 30-49 30S11 62 11 62Z"/><circle cx="60" cy="62" r="17"/><circle class="diagram-accent" cx="60" cy="62" r="5"/>',
      cut: '<circle cx="35" cy="88" r="14"/><circle cx="72" cy="88" r="14"/><path d="m45 79 48-54M61 73 28 26"/><path class="diagram-accent" d="m83 36 12-13"/>',
      fold: '<path class="diagram-fill" d="M24 24h72v72H24Z"/><path d="m24 96 72-72M52 52h44v44"/><path class="diagram-accent" d="m49 31 11 11-11 11"/>',
      paint: '<path d="m29 88 47-47 16 16-47 47-22 5Z"/><path class="diagram-fill" d="m76 41 12-12 16 16-12 12Z"/><path class="diagram-accent" d="M26 91 23 109l18-5"/>',
      clean: '<path class="diagram-fill" d="M38 17h44l-7 31H45Z"/><path d="M33 48h54l-8 58H41Z"/><path class="diagram-accent" d="M19 64h12m-16 16h16m-8 17h10"/>',
      heat: '<path class="diagram-fill" d="M29 75h62l-9 31H38Z"/><path d="M45 67c-11-15 10-19 0-36m17 36c-11-15 10-19 0-44m17 44c-11-15 10-19 0-36"/>',
      battery: '<rect class="diagram-fill" x="29" y="31" width="62" height="70" rx="8"/><path d="M48 31V19h24v12M46 65h28M60 51v28"/>',
      default: '<path class="diagram-fill" d="M60 15 75 45l33 5-24 23 6 32-30-15-30 15 6-32-24-23 33-5Z"/>'
    };
    return `${start}${icons[icon] || icons.default}${end}`;
  }

  function getDiagram(recipe) {
    const supplied = Array.isArray(recipe.diagram) && recipe.diagram.length === 3
      ? recipe.diagram
      : diagramLibrary[recipe.id];

    if (Array.isArray(supplied) && supplied.length) return supplied.slice(0, 3);

    return (recipe.steps || []).slice(0, 3).map((step, index) => ({
      icon: ["measure", "mix", "test"][index] || "observe",
      title: `步驟 ${index + 1}`,
      caption: step
    }));
  }

  function diagramHtml(recipe) {
    const diagram = getDiagram(recipe);
    return `
      <section class="visual-guide" aria-label="${escapeHtml(recipe.title)}簡單圖解">
        <div class="visual-guide-heading">
          <h3>簡單圖解</h3>
          <p>先看整體流程，再依下方完整步驟操作。</p>
        </div>
        <div class="diagram-flow">
          ${diagram.map((item, index) => `
            <article class="diagram-step">
              <span class="diagram-number">${index + 1}</span>
              <div class="diagram-picture">${iconSvg(item.icon)}</div>
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.caption)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function recipeText(recipe) {
    const lines = [
      `【${recipe.title}】`,
      recipe.summary,
      "",
      `配方比例：${recipe.formula}`,
      "",
      "材料：",
      ...recipe.materials.map(item => `- ${item.name}：${item.amount}`),
      "",
      "工具：",
      ...recipe.tools.map(item => `- ${item}`),
      "",
      "步驟：",
      ...recipe.steps.map((item, index) => `${index + 1}. ${item}`),
      "",
      "原理：",
      recipe.principle,
      "",
      "安全提醒：",
      ...recipe.safety.map(item => `- ${item}`),
      recipe.source === "ai" ? "\n※ 本配方由 AI 產生，實作前請由成人核對材料與環境。" : ""
    ];
    return lines.join("\n");
  }

  function renderRecipe(recipe, shouldScroll = true) {
    elements.empty.hidden = true;
    const selected = favorites.has(recipe.id);
    const aiSource = recipe.source === "ai";

    elements.result.innerHTML = `
      <article class="recipe-detail" data-detail-id="${escapeHtml(recipe.id)}">
        <header class="detail-hero">
          <div>
            <div class="detail-kicker">${escapeHtml(recipe.category)}</div>
            <h2>${escapeHtml(recipe.title)}</h2>
            <p class="detail-summary">${escapeHtml(recipe.summary)}</p>
            <div class="detail-meta">
              <span class="meta-pill">難度：${escapeHtml(recipe.difficulty)}</span>
              <span class="meta-pill">時間：${escapeHtml(recipe.time)}</span>
              <span class="safety-pill ${escapeHtml(recipe.safetyLevel)}">安全：${escapeHtml(recipe.safetyLabel)}</span>
              ${aiSource ? '<span class="meta-pill ai-source-pill">✦ AI 配方草稿</span>' : '<span class="meta-pill">人工整理</span>'}
            </div>
            ${aiSource ? '<div class="ai-notice"><span>✦</span><div><strong>AI 產生內容</strong><br>已經過格式與安全規則篩選，但材料差異與實際環境仍可能影響結果，實作前請由成人再次核對。</div></div>' : ""}
            <div class="detail-actions">
              <button class="primary-action detail-favorite" type="button">${selected ? "★ 已收藏" : "☆ 加入收藏"}</button>
              <button class="secondary-action copy-recipe" type="button">複製配方</button>
              <button class="secondary-action share-recipe" type="button">分享</button>
            </div>
          </div>
          <div class="detail-emoji" aria-hidden="true">${escapeHtml(recipe.emoji)}</div>
        </header>

        ${diagramHtml(recipe)}

        <div class="detail-grid">
          <div class="detail-column">
            <section class="detail-section">
              <h3><span>Ⅰ</span> 製作材料</h3>
              ${materialHtml(recipe.materials)}
            </section>
            <section class="detail-section">
              <h3><span>Ⅱ</span> 使用工具</h3>
              ${listHtml(recipe.tools)}
            </section>
            <section class="detail-section">
              <h3><span>Ⅲ</span> 配方比例</h3>
              <div class="formula-box">${escapeHtml(recipe.formula)}</div>
            </section>
            <section class="detail-section">
              <h3><span>✦</span> 替代材料</h3>
              <div class="tip-box">${listHtml(recipe.substitutes)}</div>
            </section>
          </div>

          <div class="detail-column">
            <section class="detail-section">
              <h3><span>Ⅳ</span> 製作步驟</h3>
              ${listHtml(recipe.steps, "step-list")}
            </section>
            <section class="detail-section">
              <h3><span>Ⅴ</span> 為什麼會成功</h3>
              <div class="principle-box">${escapeHtml(recipe.principle)}</div>
            </section>
            <section class="detail-section">
              <h3><span>◈</span> 影響結果的關鍵</h3>
              ${listHtml(recipe.keyVariables)}
            </section>
            <section class="detail-section">
              <h3><span>↻</span> 失敗排查</h3>
              <div class="tip-box">${listHtml(recipe.troubleshooting)}</div>
            </section>
            <section class="detail-section">
              <h3><span>!</span> 安全提醒</h3>
              <div class="safety-box">${listHtml(recipe.safety)}</div>
            </section>
          </div>
        </div>
      </article>
    `;

    setHash(recipe.id);
    elements.input.value = recipe.title;
    closeSuggestions();
    if (shouldScroll) elements.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderBlocked(query) {
    elements.empty.hidden = true;
    elements.result.innerHTML = `
      <div class="blocked-result">
        <div class="empty-symbol">⚠</div>
        <h2>這個項目不提供製作配方</h2>
        <p>「${escapeHtml(query)}」可能涉及武器、毒物、爆炸物、高壓電或其他高風險用途。小小煉金術士只提供適合教育與日常手作的低風險配方。</p>
      </div>`;
    setHash("");
    elements.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderAiLoading(query) {
    elements.empty.hidden = true;
    elements.result.innerHTML = `
      <div class="ai-loading" role="status">
        <div class="ai-loading-orbit" aria-hidden="true"></div>
        <h2>AI 正在拆解「${escapeHtml(query)}」</h2>
        <p>正在檢查安全性，整理材料、配方、三格圖解、製作步驟與科學原理。</p>
        <div class="ai-progress" aria-hidden="true"></div>
      </div>`;
    setHash("");
    elements.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderAiError(query, message, code = "") {
    const setupMessage = code === "AI_NOT_CONFIGURED" || code === "AI_ENDPOINT_MISSING"
      ? "目前 GitHub Pages 可以使用內建圖鑑，但 AI 需要部署在具有伺服器函式的環境，並設定 OPENAI_API_KEY。專案已加入 Vercel API，可直接匯入部署。"
      : message;

    elements.empty.hidden = true;
    elements.result.innerHTML = `
      <div class="not-found">
        <div class="empty-symbol">✦</div>
        <h2>AI 這次沒有完成配方</h2>
        <p>${escapeHtml(setupMessage || "AI 暫時無法使用，請稍後再試。")}</p>
        <div class="ai-error-actions">
          <button class="primary-action retry-ai" type="button" data-ai-query="${escapeHtml(query)}">重新分析</button>
          <button class="secondary-action show-library" type="button">查看內建圖鑑</button>
        </div>
        ${code ? `<div class="ai-error-code">${escapeHtml(code)}</div>` : ""}
      </div>`;
    setHash("");
    elements.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function normalizeAIRecipe(payload, query) {
    const recipe = payload?.recipe;
    if (!recipe || typeof recipe !== "object") throw new Error("AI 配方格式不完整");

    const id = `ai-${hashString(`${query}-${recipe.title}`)}`;
    const normalizedRecipe = {
      ...recipe,
      id,
      source: "ai",
      generatedAt: payload.generatedAt || new Date().toISOString(),
      model: payload.model || "AI",
      aliases: Array.isArray(recipe.aliases) ? recipe.aliases : [],
      materials: Array.isArray(recipe.materials) ? recipe.materials : [],
      tools: Array.isArray(recipe.tools) ? recipe.tools : [],
      steps: Array.isArray(recipe.steps) ? recipe.steps : [],
      keyVariables: Array.isArray(recipe.keyVariables) ? recipe.keyVariables : [],
      substitutes: Array.isArray(recipe.substitutes) ? recipe.substitutes : [],
      troubleshooting: Array.isArray(recipe.troubleshooting) ? recipe.troubleshooting : [],
      safety: Array.isArray(recipe.safety) ? recipe.safety : [],
      diagram: Array.isArray(recipe.diagram) ? recipe.diagram.slice(0, 3) : []
    };

    if (!normalizedRecipe.title || normalizedRecipe.materials.length < 2 || normalizedRecipe.steps.length < 3) {
      throw new Error("AI 配方缺少必要欄位");
    }
    return normalizedRecipe;
  }

  async function generateWithAI(query) {
    if (activeAIController) activeAIController.abort();
    const controller = new AbortController();
    activeAIController = controller;
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
    renderAiLoading(query);

    try {
      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: controller.signal
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const error = new Error("AI API endpoint is not available");
        error.code = "AI_ENDPOINT_MISSING";
        throw error;
      }

      const payload = await response.json();
      if (!response.ok) {
        const error = new Error(payload.error || "AI 無法完成配方。");
        error.code = payload.code || `HTTP_${response.status}`;
        throw error;
      }

      const aiRecipe = normalizeAIRecipe(payload, query);
      const existingIndex = recipes.findIndex(recipe => recipe.id === aiRecipe.id);
      if (existingIndex >= 0) recipes.splice(existingIndex, 1);
      recipes.unshift(aiRecipe);
      saveAIRecipes();
      renderCards();
      renderRecipe(aiRecipe, false);
    } catch (error) {
      if (error?.name === "AbortError") {
        renderAiError(query, "AI 回應時間過長，請稍後再試。", "AI_TIMEOUT");
      } else {
        renderAiError(query, error?.message, error?.code || "AI_REQUEST_FAILED");
      }
    } finally {
      clearTimeout(timeout);
      if (activeAIController === controller) activeAIController = null;
    }
  }

  function openRecipeById(id, shouldScroll = true) {
    const recipe = getRecipeById(id);
    if (recipe) renderRecipe(recipe, shouldScroll);
  }

  async function runSearch(rawQuery) {
    const query = String(rawQuery || "").trim();
    if (!query) {
      elements.input.focus();
      return;
    }
    if (isBlocked(query)) {
      renderBlocked(query);
      return;
    }

    const [best] = findMatches(query, 1);
    if (best && searchScore(best, query) >= 20) {
      renderRecipe(best);
      return;
    }
    await generateWithAI(query);
  }

  function toggleFavorite(id) {
    if (!id) return;
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    saveFavorites();
    renderCards();
    const recipe = getRecipeById(id);
    if (recipe && $(`[data-detail-id="${CSS.escape(id)}"]`)) renderRecipe(recipe, false);
  }

  function showSuggestions(query) {
    const q = query.trim();
    if (!q) {
      closeSuggestions();
      return;
    }

    visibleSuggestions = findMatches(q, 5);
    suggestionIndex = -1;
    if (!visibleSuggestions.length) {
      closeSuggestions();
      return;
    }

    elements.suggestions.innerHTML = visibleSuggestions.map((recipe, index) => `
      <button class="suggestion-item" type="button" role="option" aria-selected="false" data-suggestion-index="${index}">
        <span>${escapeHtml(recipe.emoji)} ${escapeHtml(recipe.title)}</span>
        <small>${escapeHtml(recipe.category)}${recipe.source === "ai" ? " · AI" : ""}</small>
      </button>
    `).join("");
    elements.suggestions.hidden = false;
  }

  function closeSuggestions() {
    elements.suggestions.hidden = true;
    elements.suggestions.innerHTML = "";
    visibleSuggestions = [];
    suggestionIndex = -1;
  }

  function updateSuggestionSelection() {
    $$(".suggestion-item", elements.suggestions).forEach((item, index) => {
      item.setAttribute("aria-selected", String(index === suggestionIndex));
    });
  }

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      const previous = button.textContent;
      button.textContent = "已複製";
      setTimeout(() => { button.textContent = previous; }, 1400);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
  }

  elements.form.addEventListener("submit", event => {
    event.preventDefault();
    void runSearch(elements.input.value);
  });

  elements.input.addEventListener("input", event => showSuggestions(event.target.value));
  elements.input.addEventListener("keydown", event => {
    if (elements.suggestions.hidden) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      suggestionIndex = Math.min(suggestionIndex + 1, visibleSuggestions.length - 1);
      updateSuggestionSelection();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      suggestionIndex = Math.max(suggestionIndex - 1, 0);
      updateSuggestionSelection();
    } else if (event.key === "Enter" && suggestionIndex >= 0) {
      event.preventDefault();
      renderRecipe(visibleSuggestions[suggestionIndex]);
    } else if (event.key === "Escape") {
      closeSuggestions();
    }
  });

  elements.suggestions.addEventListener("click", event => {
    const button = event.target.closest("[data-suggestion-index]");
    if (!button) return;
    const recipe = visibleSuggestions[Number(button.dataset.suggestionIndex)];
    if (recipe) renderRecipe(recipe);
  });

  document.addEventListener("click", event => {
    if (!event.target.closest("#searchForm")) closeSuggestions();

    const quick = event.target.closest("[data-query]");
    if (quick) void runSearch(quick.dataset.query);

    const resultChoice = event.target.closest("[data-result-id]");
    if (resultChoice) openRecipeById(resultChoice.dataset.resultId);
  });

  elements.grid.addEventListener("click", event => {
    const card = event.target.closest(".recipe-card");
    if (!card) return;
    if (event.target.closest(".card-favorite")) toggleFavorite(card.dataset.recipeId);
    else if (event.target.closest(".open-recipe") || event.target.closest(".recipe-card")) openRecipeById(card.dataset.recipeId);
  });

  elements.result.addEventListener("click", async event => {
    const retry = event.target.closest(".retry-ai");
    if (retry) {
      void generateWithAI(retry.dataset.aiQuery || elements.input.value);
      return;
    }

    if (event.target.closest(".show-library")) {
      document.querySelector(".library-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const detail = event.target.closest("[data-detail-id]");
    const id = detail?.dataset.detailId;
    const recipe = getRecipeById(id);
    if (!recipe) return;

    if (event.target.closest(".detail-favorite")) toggleFavorite(id);
    if (event.target.closest(".copy-recipe")) await copyText(recipeText(recipe), event.target.closest(".copy-recipe"));
    if (event.target.closest(".share-recipe")) {
      const data = { title: recipe.title, text: `${recipe.title}｜小小煉金術士`, url: window.location.href };
      if (navigator.share) {
        try { await navigator.share(data); } catch { /* User cancelled. */ }
      } else {
        await copyText(`${data.text}\n${data.url}`, event.target.closest(".share-recipe"));
      }
    }
  });

  elements.randomButton.addEventListener("click", () => {
    const pool = favoritesOnly && favorites.size
      ? recipes.filter(recipe => favorites.has(recipe.id))
      : recipes;
    if (pool.length) renderRecipe(pool[Math.floor(Math.random() * pool.length)]);
  });

  elements.favoritesButton.addEventListener("click", () => {
    favoritesOnly = !favoritesOnly;
    elements.favoritesButton.setAttribute("aria-pressed", String(favoritesOnly));
    elements.favoritesButton.childNodes[0].textContent = favoritesOnly ? "全部圖鑑 " : "收藏 ";
    renderCards();
    document.querySelector(".library-section")?.scrollIntoView({ behavior: "smooth" });
  });

  window.addEventListener("hashchange", () => {
    const match = window.location.hash.match(/^#recipe=([^&]+)/);
    if (match) openRecipeById(decodeURIComponent(match[1]), false);
  });

  saveFavorites();
  renderCards();

  const initialMatch = window.location.hash.match(/^#recipe=([^&]+)/);
  if (initialMatch) openRecipeById(decodeURIComponent(initialMatch[1]), false);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
  }
})();
