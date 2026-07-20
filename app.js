"use strict";

(() => {
  const recipes = Array.isArray(window.LITTLE_ALCHEMIST_RECIPES)
    ? window.LITTLE_ALCHEMIST_RECIPES
    : [];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

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

  const STORAGE_KEY = "little-alchemist-favorites-v1";
  const blockedKeywords = [
    "炸彈", "爆炸物", "火藥", "槍", "子彈", "毒藥", "毒氣", "迷藥",
    "甲基安非他命", "冰毒", "毒品", "自製武器", "燃燒彈", "電擊器",
    "bomb", "explosive", "gunpowder", "poison", "weapon"
  ];

  let favorites = loadFavorites();
  let favoritesOnly = false;
  let suggestionIndex = -1;
  let visibleSuggestions = [];

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLocaleLowerCase("zh-Hant")
      .replace(/[\s\-_/·・，。！？、,.!?()（）]/g, "");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function loadFavorites() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return new Set(Array.isArray(value) ? value : []);
    } catch {
      return new Set();
    }
  }

  function saveFavorites() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    elements.favoriteCount.textContent = String(favorites.size);
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
      $(".recipe-emoji", fragment).textContent = recipe.emoji;
      $(".recipe-category", fragment).textContent = recipe.category;
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
    return `<ul class="${className}">${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function materialHtml(materials) {
    return `<ul class="clean-list">${materials.map(item => `
      <li><span>${escapeHtml(item.name)}</span><span>${escapeHtml(item.amount)}</span></li>
    `).join("")}</ul>`;
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
      ...recipe.safety.map(item => `- ${item}`)
    ];
    return lines.join("\n");
  }

  function renderRecipe(recipe, shouldScroll = true) {
    elements.empty.hidden = true;
    const selected = favorites.has(recipe.id);

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
            </div>
            <div class="detail-actions">
              <button class="primary-action detail-favorite" type="button">${selected ? "★ 已收藏" : "☆ 加入收藏"}</button>
              <button class="secondary-action copy-recipe" type="button">複製配方</button>
              <button class="secondary-action share-recipe" type="button">分享</button>
            </div>
          </div>
          <div class="detail-emoji" aria-hidden="true">${escapeHtml(recipe.emoji)}</div>
        </header>

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
        <p>「${escapeHtml(query)}」可能涉及武器、毒物、爆炸物或其他高風險用途。小小煉金術士只提供適合教育與日常手作、經人工檢查的低風險配方。</p>
      </div>`;
    setHash("");
    elements.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderNotFound(query) {
    const nearby = findMatches(query, 3);
    const alternatives = nearby.length
      ? `<div class="quick-picks" style="margin-top:18px"><span>可能是：</span>${nearby.map(recipe => `<button type="button" data-result-id="${escapeHtml(recipe.id)}">${escapeHtml(recipe.title)}</button>`).join("")}</div>`
      : `<div class="quick-picks" style="margin-top:18px"><span>先試試：</span>${recipes.slice(0, 4).map(recipe => `<button type="button" data-result-id="${escapeHtml(recipe.id)}">${escapeHtml(recipe.title)}</button>`).join("")}</div>`;

    elements.empty.hidden = true;
    elements.result.innerHTML = `
      <div class="not-found">
        <div class="empty-symbol">?</div>
        <h2>圖鑑裡還沒有「${escapeHtml(query)}」</h2>
        <p>目前版本只顯示已人工檢查的配方，不會為未知成品即興產生可能不安全或不可行的做法。後續可透過受控後端加入 AI 分析與人工審核流程。</p>
        ${alternatives}
      </div>`;
    setHash("");
    elements.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openRecipeById(id, shouldScroll = true) {
    const recipe = recipes.find(item => item.id === id);
    if (recipe) renderRecipe(recipe, shouldScroll);
  }

  function runSearch(rawQuery) {
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
    if (best && searchScore(best, query) >= 20) renderRecipe(best);
    else renderNotFound(query);
  }

  function toggleFavorite(id) {
    if (!id) return;
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    saveFavorites();
    renderCards();
    const recipe = recipes.find(item => item.id === id);
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
        <small>${escapeHtml(recipe.category)}</small>
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
    runSearch(elements.input.value);
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
    if (quick) runSearch(quick.dataset.query);

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
    const detail = event.target.closest("[data-detail-id]");
    const id = detail?.dataset.detailId;
    const recipe = recipes.find(item => item.id === id);
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
    renderRecipe(pool[Math.floor(Math.random() * pool.length)]);
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
