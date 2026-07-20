"use strict";

(() => {
  const library = window.LITTLE_ALCHEMIST_GEMS || {};
  const minerals = Array.isArray(library.minerals) ? library.minerals : [];
  const categories = library.categories || {};
  const paths = Array.isArray(library.paths) ? library.paths : [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const ui = {
    recipeTab: $("#recipeTab"), advancedTab: $("#advancedTab"), pharmacyTab: $("#pharmacyTab"), gemTab: $("#gemTab"),
    recipeView: $("#recipeView"), advancedView: $("#advancedView"), pharmacyView: $("#pharmacyView"), gemView: $("#gemView"),
    recipeActions: $("#recipeActions"), search: $("#gemSearch"), filters: $("#gemFilters"), system: $("#gemSystemFilter"),
    grid: $("#gemGrid"), detail: $("#gemDetail"), count: $("#gemCount"), paths: $("#gemPaths")
  };
  if (!ui.gemTab || !ui.gemView || !ui.recipeTab || !ui.advancedTab || !ui.pharmacyTab) return;

  let activeCategory = "all";
  let activeSystem = "all";
  let selectedId = minerals.find(item => item.id === "quartz")?.id || minerals[0]?.id || "";

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }
  function normalize(value) {
    return String(value || "").trim().toLocaleLowerCase("zh-Hant").replace(/[\s\-_/·・，。！？、,.!?()（）：:／]/g, "");
  }
  function formatFormula(value) {
    return escapeHtml(value).replace(/([A-Za-z\)])(\d+)/g, "$1<sub>$2</sub>").replace(/·nH<sub>2<\/sub>O/g, "·nH<sub>2</sub>O");
  }

  function setView(view, updateHash = true) {
    const states = { recipe: ui.recipeView, advanced: ui.advancedView, pharmacy: ui.pharmacyView, gems: ui.gemView };
    Object.entries(states).forEach(([key, panel]) => { if (panel) panel.hidden = key !== view; });
    if (ui.recipeActions) ui.recipeActions.hidden = view !== "recipe";
    [[ui.recipeTab,"recipe"],[ui.advancedTab,"advanced"],[ui.pharmacyTab,"pharmacy"],[ui.gemTab,"gems"]].forEach(([tab,key]) => {
      const selected = key === view;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    document.body.classList.toggle("advanced-mode", view === "advanced");
    document.body.classList.toggle("pharmacy-mode", view === "pharmacy");
    document.body.classList.toggle("gem-mode", view === "gems");
    if (updateHash) {
      const hash = view === "gems" ? `#gems=${encodeURIComponent(selectedId)}` : view === "pharmacy" ? "#pharmacy" : view === "advanced" ? "#advanced" : "#top";
      history.replaceState(null, "", hash);
    }
    if (view === "gems") requestAnimationFrame(() => ui.gemView.scrollIntoView({ block: "start" }));
  }

  function syncFromHash() {
    const match = window.location.hash.match(/^#gems(?:=([^&]+))?/);
    if (match) {
      const id = match[1] ? decodeURIComponent(match[1]) : "";
      if (id && minerals.some(item => item.id === id)) selectedId = id;
      setView("gems", false);
      renderDetail(minerals.find(item => item.id === selectedId) || minerals[0]);
      return;
    }
    if (window.location.hash.startsWith("#pharmacy")) setView("pharmacy", false);
    else if (window.location.hash === "#advanced") setView("advanced", false);
    else setView("recipe", false);
  }

  function mineralMatches(mineral) {
    const query = normalize(ui.search?.value);
    if (activeCategory !== "all" && mineral.category !== activeCategory) return false;
    if (activeSystem !== "all" && mineral.crystalSystem !== activeSystem) return false;
    if (!query) return true;
    return [mineral.title, mineral.english, mineral.formula, mineral.categoryLabel, mineral.crystalSystem, mineral.structure, mineral.genesis, mineral.environment, mineral.hardness, ...(mineral.aliases || []), ...(mineral.varieties || []), ...(mineral.associations || []), ...(mineral.keywords || [])]
      .some(value => normalize(value).includes(query));
  }

  function structureSvg(key) {
    const start = '<svg viewBox="0 0 260 180" role="img" aria-label="晶體結構概念示意">';
    const end = '</svg>';
    const node = (x,y,r=9,cls="") => `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/>`;
    const line = (x1,y1,x2,y2,cls="") => `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    const tetra = (x,y,s=28) => `${line(x,y-s,x-s,y+s)}${line(x,y-s,x+s,y+s)}${line(x-s,y+s,x+s,y+s)}${node(x,y-s,6,"oxygen")}${node(x-s,y+s,6,"oxygen")}${node(x+s,y+s,6,"oxygen")}${node(x,y+5,8,"silicon")}`;
    let body = "";
    if (["framework","diamond","cage"].includes(key)) {
      const pts=[[40,40],[100,25],[160,42],[220,28],[70,95],[135,85],[200,100],[35,145],[105,150],[170,140],[225,150]];
      const edges=[[0,1],[1,2],[2,3],[0,4],[1,4],[1,5],[2,5],[2,6],[3,6],[4,5],[5,6],[4,7],[4,8],[5,8],[5,9],[6,9],[6,10],[7,8],[8,9],[9,10]];
      body=edges.map(([a,b])=>line(...pts[a],...pts[b])).join("")+pts.map((p,i)=>node(...p,i%3===0?9:7,i%3===0?"primary":"secondary")).join("");
    } else if (["layered","sheet","curved-sheet","hydrated-layer"].includes(key)) {
      for(let row=0;row<3;row++){ const y=42+row*52; for(let i=0;i<5;i++){ const x=35+i*47+(row%2?22:0); body+=node(x,y,7,row===1?"primary":"secondary"); if(i<4) body+=line(x,y,x+47,y); } }
      body+=line(25,70,235,70,"weak")+line(25,122,235,122,"weak");
    } else if (["single-chain","double-chain","chain","chain-sulfide","carbonate-chain"].includes(key)) {
      for(let i=0;i<6;i++){ const x=25+i*42; const y=62+(i%2)*28; body+=node(x,y,8,"primary"); if(i) body+=line(x-42,62+((i-1)%2)*28,x,y); }
      if(key==="double-chain"){ for(let i=0;i<6;i++){const x=25+i*42;const y=125-(i%2)*22;body+=node(x,y,7,"secondary");if(i)body+=line(x-42,125-((i-1)%2)*22,x,y);body+=line(x,62+(i%2)*28,x,y,"weak");}}
    } else if (["ring","phosphate-channel"].includes(key)) {
      const cx=130,cy=88,r=58; const pts=Array.from({length:6},(_,i)=>[cx+Math.cos(Math.PI/3*i)*r,cy+Math.sin(Math.PI/3*i)*r]);
      pts.forEach((p,i)=>{const q=pts[(i+1)%6];body+=line(...p,...q)+node(...p,8,"primary");}); body+=node(cx,cy,14,"channel");
    } else if (["isolated","oxide","spinel","rutile","sulfide","tetra-sulfide","ionic-sulfide","helical-sulfide","sulfate","carbonate","phosphate-channel"].includes(key)) {
      body=tetra(65,76,32)+tetra(145,55,27)+tetra(200,112,30)+line(65,81,145,60,"weak")+line(145,60,200,117,"weak")+node(115,125,13,"metal")+node(180,38,12,"metal");
    } else if (["amorphous","microcrystal"].includes(key)) {
      const pts=[[32,42],[72,30],[112,48],[153,25],[210,45],[50,91],[95,82],[140,100],[190,86],[225,110],[25,142],[78,135],[125,150],[172,137],[218,153]];
      body=pts.map((p,i)=>node(...p,8,i%4===0?"primary":"secondary")).join("")+pts.slice(1).map((p,i)=>line(...pts[i],...p,"weak")).join("");
    } else if (["metal","ionic","molecular"].includes(key)) {
      for(let y=38;y<=142;y+=52){for(let x=35;x<=225;x+=48){body+=node(x+(y===90?20:0),y,10,(x+y)%3?"primary":"secondary");}}
    } else if (["fibrous"].includes(key)) {
      for(let i=0;i<9;i++){body+=`<path d="M${20+i*22} 155 C${45+i*18} 115 ${15+i*25} 70 ${38+i*22} 25"/>`;}
    } else {
      body=tetra(65,70)+tetra(135,105)+tetra(205,65)+line(65,75,135,110,"weak")+line(135,110,205,70,"weak");
    }
    return `${start}<g>${body}</g><text x="130" y="172" text-anchor="middle">概念結構示意・非原子比例模型</text>${end}`;
  }

  function renderFilters() {
    if (!ui.filters) return;
    ui.filters.innerHTML = [{key:"all",label:"全部礦物",icon:"✦"},...Object.entries(categories).map(([key,value])=>({key,label:value.label,icon:value.icon}))]
      .map(item=>`<button type="button" data-gem-category="${escapeHtml(item.key)}" aria-pressed="${String(activeCategory===item.key)}"><span>${escapeHtml(item.icon)}</span>${escapeHtml(item.label)}</button>`).join("");
  }

  function renderGrid() {
    if (!ui.grid) return;
    const visible = minerals.filter(mineralMatches);
    ui.grid.innerHTML = visible.map(mineral=>`
      <button class="gem-card category-${escapeHtml(mineral.category)}${mineral.id===selectedId?" is-selected":""}" type="button" data-gem-mineral="${escapeHtml(mineral.id)}">
        <div class="gem-card-top"><span>${escapeHtml(categories[mineral.category]?.icon || "◇")}</span><em>${escapeHtml(mineral.crystalSystem)}</em></div>
        <small>${escapeHtml(mineral.categoryLabel)}</small><strong>${escapeHtml(mineral.title)}</strong><i>${escapeHtml(mineral.english)}</i>
        <div class="gem-card-formula">${formatFormula(mineral.formula)}</div>
        <p>${escapeHtml(mineral.genesis)}</p><span class="gem-card-open">展開晶體檔案 →</span>
      </button>`).join("");
    if (!visible.length) ui.grid.innerHTML='<div class="gem-empty"><span>◇</span><h3>沒有符合的礦物</h3><p>可搜尋「石英、Al2O3、三方晶系、熱液、變質、硬度 7」等關鍵字。</p></div>';
    if (ui.count) ui.count.textContent=`顯示 ${visible.length}／${minerals.length} 種礦物`;
  }

  function renderDetail(mineral) {
    if (!mineral || !ui.detail) return;
    selectedId=mineral.id;
    const category=categories[mineral.category]||{};
    const varieties=(mineral.varieties||[]).length?mineral.varieties.map(item=>`<span>${escapeHtml(item)}</span>`).join(""):"<span>無特定寶石變種</span>";
    ui.detail.innerHTML=`
      <div class="gem-detail-visual category-${escapeHtml(mineral.category)}">
        <div class="gem-detail-symbol"><span>${escapeHtml(category.icon||"◇")}</span><small>${escapeHtml(mineral.categoryLabel)}</small></div>
        <div class="crystal-diagram">${structureSvg(mineral.structureKey)}</div>
      </div>
      <div class="gem-detail-copy">
        <div class="detail-kicker">${escapeHtml(mineral.english)}・${escapeHtml(mineral.crystalSystem)}</div>
        <h2>${escapeHtml(mineral.title)}</h2>
        <div class="gem-formula"><span>化學式</span><strong>${formatFormula(mineral.formula)}</strong></div>
        <p class="gem-structure">${escapeHtml(mineral.structure)}</p>
        <div class="gem-facts"><span><b>硬度</b>${escapeHtml(mineral.hardness)}</span><span><b>密度</b>${escapeHtml(mineral.density)}</span><span><b>解理</b>${escapeHtml(mineral.cleavage)}</span><span><b>光澤</b>${escapeHtml(mineral.luster)}</span><span><b>顏色</b>${escapeHtml(mineral.color)}</span><span><b>條痕</b>${escapeHtml(mineral.streak)}</span></div>
        <div class="gem-detail-columns">
          <section><h3>形成與產狀</h3><p>${escapeHtml(mineral.genesis)}</p><div class="gem-environment"><b>典型環境</b>${escapeHtml(mineral.environment)}</div><h4>常見共生</h4><div class="gem-tags">${(mineral.associations||[]).map(item=>`<span>${escapeHtml(item)}</span>`).join("")}</div></section>
          <section><h3>辨識與寶石變種</h3><p>${escapeHtml(mineral.identification)}</p><div class="gem-tags varieties">${varieties}</div><div class="gem-safety"><b>採集／處理安全</b><p>${escapeHtml(mineral.safety)}</p></div></section>
        </div>
      </div>`;
    $$('[data-gem-mineral]').forEach(button=>button.classList.toggle("is-selected",button.dataset.gemMineral===mineral.id));
    if(window.location.hash.startsWith("#gems")) history.replaceState(null,"",`#gems=${encodeURIComponent(mineral.id)}`);
  }

  function renderPaths() {
    if (!ui.paths) return;
    ui.paths.innerHTML=paths.map(path=>`<article class="gem-path"><span>${escapeHtml(path.icon)}</span><div><small>CRYSTAL PATH</small><h3>${escapeHtml(path.title)}</h3><p>${escapeHtml(path.summary)}</p></div><div>${(path.minerals||[]).map(id=>{const m=minerals.find(item=>item.id===id);return m?`<button type="button" data-gem-mineral="${escapeHtml(m.id)}">${escapeHtml(m.title)}</button>`:"";}).join("")}</div></article>`).join("");
  }

  ui.gemTab.addEventListener("click",()=>setView("gems"));
  ui.recipeTab.addEventListener("click",()=>setView("recipe"));
  ui.advancedTab.addEventListener("click",()=>setView("advanced"));
  ui.pharmacyTab.addEventListener("click",()=>setView("pharmacy"));
  const tabs=[ui.recipeTab,ui.advancedTab,ui.pharmacyTab,ui.gemTab];
  tabs.forEach((tab,index)=>tab.addEventListener("keydown",event=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;event.preventDefault();let next=index;if(event.key==="ArrowRight")next=(index+1)%tabs.length;if(event.key==="ArrowLeft")next=(index-1+tabs.length)%tabs.length;if(event.key==="Home")next=0;if(event.key==="End")next=tabs.length-1;tabs[next].focus();tabs[next].click();}));
  ui.search?.addEventListener("input",renderGrid);
  ui.system?.addEventListener("change",event=>{activeSystem=event.target.value;renderGrid();});
  ui.filters?.addEventListener("click",event=>{const button=event.target.closest("[data-gem-category]");if(!button)return;activeCategory=button.dataset.gemCategory;renderFilters();renderGrid();});
  [ui.grid,ui.paths].forEach(container=>container?.addEventListener("click",event=>{const button=event.target.closest("[data-gem-mineral]");if(!button)return;const mineral=minerals.find(item=>item.id===button.dataset.gemMineral);if(!mineral)return;renderDetail(mineral);ui.detail?.scrollIntoView({behavior:"smooth",block:"start"});}));
  document.addEventListener("click",event=>{const jump=event.target.closest("[data-gem-jump]");if(jump)$(jump.dataset.gemJump)?.scrollIntoView({behavior:"smooth",block:"start"});});
  window.addEventListener("hashchange",syncFromHash);
  renderPaths();renderFilters();renderGrid();renderDetail(minerals.find(item=>item.id===selectedId)||minerals[0]);syncFromHash();
})();