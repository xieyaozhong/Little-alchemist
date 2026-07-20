"use strict";

(() => {
  const pharmacy = window.LITTLE_ALCHEMIST_PHARMACY || {};
  const modules = Array.isArray(pharmacy.modules) ? pharmacy.modules : [];
  const categories = pharmacy.categories || {};
  const paths = Array.isArray(pharmacy.paths) ? pharmacy.paths : [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const ui = {
    recipeTab: $("#recipeTab"),
    advancedTab: $("#advancedTab"),
    pharmacyTab: $("#pharmacyTab"),
    recipeView: $("#recipeView"),
    advancedView: $("#advancedView"),
    pharmacyView: $("#pharmacyView"),
    recipeActions: $("#recipeActions"),
    search: $("#pharmacySearch"),
    filters: $("#pharmacyFilters"),
    grid: $("#pharmacyGrid"),
    detail: $("#pharmacyDetail"),
    count: $("#pharmacyCount"),
    paths: $("#pharmacyPaths")
  };

  if (!ui.pharmacyTab || !ui.pharmacyView || !ui.recipeTab || !ui.advancedTab) return;

  let activeCategory = "all";
  let selectedId = modules[0]?.id || "";

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
      .replace(/[\s\-_/·・，。！？、,.!?()（）：:]/g, "");
  }

  function setView(view, updateHash = true) {
    const isRecipe = view === "recipe";
    const isAdvanced = view === "advanced";
    const isPharmacy = view === "pharmacy";

    ui.recipeView.hidden = !isRecipe;
    ui.advancedView.hidden = !isAdvanced;
    ui.pharmacyView.hidden = !isPharmacy;
    if (ui.recipeActions) ui.recipeActions.hidden = !isRecipe;

    [
      [ui.recipeTab, isRecipe],
      [ui.advancedTab, isAdvanced],
      [ui.pharmacyTab, isPharmacy]
    ].forEach(([tab, selected]) => {
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    document.body.classList.toggle("advanced-mode", isAdvanced);
    document.body.classList.toggle("pharmacy-mode", isPharmacy);

    if (updateHash) {
      const nextHash = isPharmacy ? `#pharmacy=${encodeURIComponent(selectedId)}` : isAdvanced ? "#advanced" : "#top";
      history.replaceState(null, "", nextHash);
    }

    if (isPharmacy) requestAnimationFrame(() => ui.pharmacyView.scrollIntoView({ block: "start" }));
  }

  function syncFromHash() {
    const pharmacyMatch = window.location.hash.match(/^#pharmacy(?:=([^&]+))?/);
    if (pharmacyMatch) {
      const id = pharmacyMatch[1] ? decodeURIComponent(pharmacyMatch[1]) : "";
      if (id && modules.some(item => item.id === id)) selectedId = id;
      setView("pharmacy", false);
      renderDetail(modules.find(item => item.id === selectedId) || modules[0]);
      return;
    }
    if (window.location.hash === "#advanced") setView("advanced", false);
    else setView("recipe", false);
  }

  function moduleMatches(module) {
    const query = normalize(ui.search?.value);
    const categoryMatch = activeCategory === "all" || module.category === activeCategory;
    if (!categoryMatch) return false;
    if (!query) return true;
    return [
      module.title,
      module.english,
      module.categoryLabel,
      module.level,
      module.summary,
      module.formula,
      ...(module.concepts || []),
      ...(module.connections || []),
      ...(module.keywords || [])
    ].some(value => normalize(value).includes(query));
  }

  function renderFilters() {
    if (!ui.filters) return;
    ui.filters.innerHTML = [
      { key: "all", label: "全部領域", icon: "✦" },
      ...Object.entries(categories).map(([key, value]) => ({ key, label: value.label, icon: value.icon }))
    ].map(item => `
      <button type="button" data-pharmacy-category="${escapeHtml(item.key)}" aria-pressed="${String(activeCategory === item.key)}">
        <span aria-hidden="true">${escapeHtml(item.icon)}</span>${escapeHtml(item.label)}
      </button>
    `).join("");
  }

  function renderGrid() {
    if (!ui.grid) return;
    const visible = modules.filter(moduleMatches);
    ui.grid.innerHTML = visible.map(module => {
      const category = categories[module.category] || {};
      return `
        <button class="pharmacy-card category-${escapeHtml(module.category)}${module.id === selectedId ? " is-selected" : ""}" type="button" data-pharmacy-module="${escapeHtml(module.id)}">
          <span class="pharmacy-card-icon" aria-hidden="true">${escapeHtml(category.icon || "⚕")}</span>
          <small>${escapeHtml(module.categoryLabel)}・${escapeHtml(module.level)}</small>
          <strong>${escapeHtml(module.title)}</strong>
          <em>${escapeHtml(module.english)}</em>
          <p>${escapeHtml(module.summary)}</p>
          <span class="pharmacy-card-open">展開知識卡 →</span>
        </button>
      `;
    }).join("");

    if (!visible.length) {
      ui.grid.innerHTML = '<div class="pharmacy-empty"><span>⌕</span><h3>沒有符合的藥學主題</h3><p>可改用「半衰期、錠劑、受體、HPLC、抗生素、GMP」等關鍵字搜尋。</p></div>';
    }
    if (ui.count) ui.count.textContent = `顯示 ${visible.length}／${modules.length} 個主題`;
  }

  function renderDetail(module) {
    if (!module || !ui.detail) return;
    selectedId = module.id;
    const category = categories[module.category] || {};
    const formula = module.formula ? `
      <div class="pharmacy-formula">
        <span>核心關係</span><strong>${escapeHtml(module.formula)}</strong>
      </div>` : "";
    ui.detail.innerHTML = `
      <div class="pharmacy-detail-mark category-${escapeHtml(module.category)}">
        <span>${escapeHtml(category.icon || "⚕")}</span>
        <small>${escapeHtml(module.categoryLabel)}</small>
      </div>
      <div class="pharmacy-detail-copy">
        <div class="detail-kicker">${escapeHtml(module.english)}・${escapeHtml(module.level)}</div>
        <h2>${escapeHtml(module.title)}</h2>
        <p class="pharmacy-detail-summary">${escapeHtml(module.summary)}</p>
        ${formula}
        <div class="pharmacy-detail-columns">
          <section>
            <h3>核心知識</h3>
            <ul>${(module.concepts || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </section>
          <section>
            <h3>知識連結</h3>
            <div class="pharmacy-tags">${(module.connections || []).map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>
            <div class="pharmacy-safety"><b>安全邊界</b><p>${escapeHtml(module.safety)}</p></div>
          </section>
        </div>
      </div>
    `;
    $$("[data-pharmacy-module]").forEach(button => {
      button.classList.toggle("is-selected", button.dataset.pharmacyModule === module.id);
    });
    if (window.location.hash.startsWith("#pharmacy")) {
      history.replaceState(null, "", `#pharmacy=${encodeURIComponent(module.id)}`);
    }
  }

  function renderPaths() {
    if (!ui.paths) return;
    ui.paths.innerHTML = paths.map(path => `
      <article class="pharmacy-path">
        <span class="pharmacy-path-number">${escapeHtml(path.icon)}</span>
        <div><small>LEARNING PATH</small><h3>${escapeHtml(path.title)}</h3><p>${escapeHtml(path.summary)}</p></div>
        <div class="pharmacy-path-modules">
          ${(path.modules || []).map(id => {
            const module = modules.find(item => item.id === id);
            return module ? `<button type="button" data-pharmacy-module="${escapeHtml(module.id)}">${escapeHtml(module.title)}</button>` : "";
          }).join("")}
        </div>
      </article>
    `).join("");
  }

  ui.pharmacyTab.addEventListener("click", () => setView("pharmacy"));
  ui.recipeTab.addEventListener("click", () => setView("recipe"));
  ui.advancedTab.addEventListener("click", () => setView("advanced"));

  const tabs = [ui.recipeTab, ui.advancedTab, ui.pharmacyTab];
  tabs.forEach((tab, index) => {
    tab.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      tabs[next].focus();
      tabs[next].click();
    });
  });

  ui.search?.addEventListener("input", renderGrid);
  ui.filters?.addEventListener("click", event => {
    const button = event.target.closest("[data-pharmacy-category]");
    if (!button) return;
    activeCategory = button.dataset.pharmacyCategory;
    renderFilters();
    renderGrid();
  });

  [ui.grid, ui.paths].forEach(container => {
    container?.addEventListener("click", event => {
      const button = event.target.closest("[data-pharmacy-module]");
      if (!button) return;
      const module = modules.find(item => item.id === button.dataset.pharmacyModule);
      if (!module) return;
      renderDetail(module);
      ui.detail?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.addEventListener("click", event => {
    const jump = event.target.closest("[data-pharmacy-jump]");
    if (!jump) return;
    $(jump.dataset.pharmacyJump)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("hashchange", syncFromHash);

  renderPaths();
  renderFilters();
  renderGrid();
  renderDetail(modules.find(item => item.id === selectedId) || modules[0]);
  syncFromHash();
})();