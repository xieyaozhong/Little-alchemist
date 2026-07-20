"use strict";

(() => {
  const chemistry = window.LITTLE_ALCHEMIST_CHEMISTRY || {};
  const elements = Array.isArray(chemistry.elements) ? chemistry.elements : [];
  const reactions = Array.isArray(chemistry.reactions) ? chemistry.reactions : [];
  const categoryLabels = chemistry.categoryLabels || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const ui = {
    recipeTab: $("#recipeTab"),
    advancedTab: $("#advancedTab"),
    recipeView: $("#recipeView"),
    advancedView: $("#advancedView"),
    recipeActions: $("#recipeActions"),
    elementSearch: $("#elementSearch"),
    elementFilters: $("#elementFilters"),
    periodicTable: $("#periodicTable"),
    lanthanideTable: $("#lanthanideTable"),
    actinideTable: $("#actinideTable"),
    elementDetail: $("#elementDetail"),
    reactionSearch: $("#reactionSearch"),
    reactionFilters: $("#reactionFilters"),
    reactionGrid: $("#reactionGrid"),
    elementCount: $("#elementCount"),
    reactionCount: $("#reactionCount")
  };

  if (!ui.recipeTab || !ui.advancedTab || !ui.recipeView || !ui.advancedView) return;

  let activeElementCategory = "all";
  let activeReactionCategory = "all";
  let selectedElement = elements.find(item => item.number === 6) || elements[0];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLocaleLowerCase("zh-Hant")
      .replace(/[\s\-_/·・，。！？、,.!?()（）]/g, "");
  }

  function formatFormula(value) {
    let safe = escapeHtml(value);
    safe = safe.replace(/([A-Za-z\)])(\d+)/g, "$1<sub>$2</sub>");
    safe = safe
      .replaceAll("→", '<span class="reaction-arrow" aria-label="生成">→</span>')
      .replaceAll("⇌", '<span class="reaction-arrow" aria-label="可逆">⇌</span>')
      .replaceAll("↑", '<span class="state-mark" title="氣體逸出">↑</span>')
      .replaceAll("↓", '<span class="state-mark" title="沉澱生成">↓</span>');
    return safe;
  }

  function switchTab(tab, updateHash = true) {
    const advanced = tab === "advanced";
    ui.recipeView.hidden = advanced;
    ui.advancedView.hidden = !advanced;
    if (ui.recipeActions) ui.recipeActions.hidden = advanced;
    ui.recipeTab.setAttribute("aria-selected", String(!advanced));
    ui.advancedTab.setAttribute("aria-selected", String(advanced));
    ui.recipeTab.tabIndex = advanced ? -1 : 0;
    ui.advancedTab.tabIndex = advanced ? 0 : -1;
    document.body.classList.toggle("advanced-mode", advanced);

    if (updateHash) {
      history.replaceState(null, "", advanced ? "#advanced" : "#top");
    }

    if (advanced) {
      requestAnimationFrame(() => ui.advancedView.scrollIntoView({ block: "start" }));
    }
  }

  function syncTabFromHash() {
    switchTab(window.location.hash === "#advanced", false);
  }

  function elementMatches(element) {
    const query = normalize(ui.elementSearch?.value);
    const inCategory = activeElementCategory === "all" || element.category === activeElementCategory;
    if (!inCategory) return false;
    if (!query) return true;
    return [
      element.number,
      element.symbol,
      element.name,
      element.english,
      element.categoryLabel,
      element.phase,
      element.intro
    ].some(value => normalize(value).includes(query));
  }

  function elementButton(element, series = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `element-cell element-${element.category}`;
    button.dataset.elementNumber = String(element.number);
    button.hidden = !elementMatches(element);
    button.setAttribute("aria-label", `${element.number} ${element.name} ${element.symbol}`);
    if (!series) {
      button.style.gridColumn = String(element.group);
      button.style.gridRow = String(element.period + 1);
    }
    button.innerHTML = `
      <small>${element.number}</small>
      <strong>${escapeHtml(element.symbol)}</strong>
      <span>${escapeHtml(element.name)}</span>
    `;
    if (selectedElement?.number === element.number) button.classList.add("is-selected");
    return button;
  }

  function renderPeriodicTable() {
    if (!ui.periodicTable) return;
    ui.periodicTable.innerHTML = "";

    for (let group = 1; group <= 18; group += 1) {
      const label = document.createElement("span");
      label.className = "group-label";
      label.style.gridColumn = String(group);
      label.style.gridRow = "1";
      label.textContent = String(group);
      ui.periodicTable.append(label);
    }

    elements
      .filter(element => !["lanthanide", "actinide"].includes(element.category))
      .forEach(element => ui.periodicTable.append(elementButton(element)));

    [
      { period: 6, label: "57–71", text: "鑭系" },
      { period: 7, label: "89–103", text: "錒系" }
    ].forEach(item => {
      const cell = document.createElement("div");
      cell.className = "series-placeholder";
      cell.style.gridColumn = "3";
      cell.style.gridRow = String(item.period + 1);
      cell.innerHTML = `<small>${item.label}</small><strong>${item.text}</strong>`;
      ui.periodicTable.append(cell);
    });

    renderSeries(ui.lanthanideTable, "lanthanide");
    renderSeries(ui.actinideTable, "actinide");
    updateElementResultCount();
  }

  function renderSeries(container, category) {
    if (!container) return;
    container.innerHTML = "";
    elements.filter(item => item.category === category).forEach(element => {
      container.append(elementButton(element, true));
    });
  }

  function updateElementResultCount() {
    if (!ui.elementCount) return;
    const count = elements.filter(elementMatches).length;
    ui.elementCount.textContent = `顯示 ${count}／${elements.length} 種元素`;
  }

  function renderElementFilters() {
    if (!ui.elementFilters) return;
    const categories = [...new Set(elements.map(item => item.category))];
    ui.elementFilters.innerHTML = [
      { key: "all", label: "全部" },
      ...categories.map(key => ({ key, label: categoryLabels[key] || key }))
    ].map(item => `
      <button type="button" data-element-category="${escapeHtml(item.key)}"
        aria-pressed="${String(activeElementCategory === item.key)}">
        ${escapeHtml(item.label)}
      </button>
    `).join("");
  }

  function renderElementDetail(element) {
    if (!element || !ui.elementDetail) return;
    selectedElement = element;
    const groupText = element.group ? `第 ${element.group} 族` : element.categoryLabel;
    ui.elementDetail.innerHTML = `
      <div class="element-detail-symbol element-${escapeHtml(element.category)}">
        <small>${element.number}</small>
        <strong>${escapeHtml(element.symbol)}</strong>
        <span>${escapeHtml(element.name)}</span>
      </div>
      <div class="element-detail-copy">
        <div class="detail-kicker">${escapeHtml(element.english)}</div>
        <h3>${escapeHtml(element.name)} <span>${escapeHtml(element.symbol)}</span></h3>
        <p>${escapeHtml(element.intro)}</p>
        <div class="element-facts">
          <span><b>原子序</b>${element.number}</span>
          <span><b>相對原子量</b>${escapeHtml(element.mass)}</span>
          <span><b>位置</b>第 ${element.period} 週期・${escapeHtml(groupText)}</span>
          <span><b>分類</b>${escapeHtml(element.categoryLabel)}</span>
          <span><b>常溫狀態</b>${escapeHtml(element.phase)}</span>
        </div>
      </div>
    `;
    $$('[data-element-number]').forEach(button => {
      button.classList.toggle("is-selected", Number(button.dataset.elementNumber) === element.number);
    });
  }

  function filterElements() {
    $$('[data-element-number]').forEach(button => {
      const element = elements.find(item => item.number === Number(button.dataset.elementNumber));
      button.hidden = !element || !elementMatches(element);
    });
    updateElementResultCount();
  }

  function reactionMatches(reaction) {
    const query = normalize(ui.reactionSearch?.value);
    const inCategory = activeReactionCategory === "all" || reaction.category === activeReactionCategory;
    if (!inCategory) return false;
    if (!query) return true;
    return [
      reaction.title,
      reaction.equation,
      reaction.category,
      reaction.type,
      reaction.conditions,
      reaction.observation,
      reaction.concept
    ].some(value => normalize(value).includes(query));
  }

  function renderReactionFilters() {
    if (!ui.reactionFilters) return;
    const categories = [...new Set(reactions.map(item => item.category))];
    ui.reactionFilters.innerHTML = [
      { key: "all", label: "全部" },
      ...categories.map(key => ({ key, label: key }))
    ].map(item => `
      <button type="button" data-reaction-category="${escapeHtml(item.key)}"
        aria-pressed="${String(activeReactionCategory === item.key)}">
        ${escapeHtml(item.label)}
      </button>
    `).join("");
  }

  function renderReactions() {
    if (!ui.reactionGrid) return;
    const visible = reactions.filter(reactionMatches);
    ui.reactionGrid.innerHTML = visible.map((reaction, index) => `
      <article class="reaction-card">
        <div class="reaction-card-head">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <small>${escapeHtml(reaction.category)}・${escapeHtml(reaction.type)}</small>
            <h3>${escapeHtml(reaction.title)}</h3>
          </div>
        </div>
        <div class="reaction-equation" aria-label="${escapeHtml(reaction.equation)}">
          ${formatFormula(reaction.equation)}
        </div>
        <dl>
          <div><dt>條件</dt><dd>${escapeHtml(reaction.conditions || "依課堂情境")}</dd></div>
          <div><dt>現象</dt><dd>${escapeHtml(reaction.observation)}</dd></div>
          <div><dt>理解</dt><dd>${escapeHtml(reaction.concept)}</dd></div>
          ${reaction.note ? `<div class="reaction-note"><dt>提醒</dt><dd>${escapeHtml(reaction.note)}</dd></div>` : ""}
        </dl>
      </article>
    `).join("");

    if (!visible.length) {
      ui.reactionGrid.innerHTML = '<div class="advanced-empty">沒有符合條件的反應式，請改用元素名稱、物質名稱或反應類型搜尋。</div>';
    }
    if (ui.reactionCount) ui.reactionCount.textContent = `顯示 ${visible.length}／${reactions.length} 條反應式`;
  }

  ui.recipeTab.addEventListener("click", () => switchTab("recipe"));
  ui.advancedTab.addEventListener("click", () => switchTab("advanced"));

  [ui.recipeTab, ui.advancedTab].forEach((tab, index, tabs) => {
    tab.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });

  ui.elementSearch?.addEventListener("input", filterElements);
  ui.elementFilters?.addEventListener("click", event => {
    const button = event.target.closest("[data-element-category]");
    if (!button) return;
    activeElementCategory = button.dataset.elementCategory;
    renderElementFilters();
    filterElements();
  });

  [ui.periodicTable, ui.lanthanideTable, ui.actinideTable].forEach(container => {
    container?.addEventListener("click", event => {
      const button = event.target.closest("[data-element-number]");
      if (!button) return;
      const element = elements.find(item => item.number === Number(button.dataset.elementNumber));
      if (element) renderElementDetail(element);
    });
  });

  ui.reactionSearch?.addEventListener("input", renderReactions);
  ui.reactionFilters?.addEventListener("click", event => {
    const button = event.target.closest("[data-reaction-category]");
    if (!button) return;
    activeReactionCategory = button.dataset.reactionCategory;
    renderReactionFilters();
    renderReactions();
  });

  document.addEventListener("click", event => {
    const jump = event.target.closest("[data-advanced-jump]");
    if (!jump) return;
    const target = $(jump.dataset.advancedJump);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("hashchange", syncTabFromHash);

  renderElementFilters();
  renderPeriodicTable();
  renderElementDetail(selectedElement);
  renderReactionFilters();
  renderReactions();
  syncTabFromHash();
})();