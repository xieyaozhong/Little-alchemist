"use strict";

(() => {
  const ICON_FALLBACK = ["measure", "build", "test"];

  function uniqueText(items) {
    return [...new Set((items || []).map(item => String(item || "").trim()).filter(Boolean))];
  }

  function defaultVariables(focus) {
    return [
      `${focus || "材料比例、尺寸與組裝精度"}會直接影響成品表現。`,
      "一次只改變一個條件，才能判斷是哪個因素造成差異。",
      "記錄用量、尺寸、時間與結果，下次可更快調整。"
    ];
  }

  function defaultSubstitutes() {
    return [
      "裝飾材料可以省略，不影響核心原理。",
      "替換材料時，優先選擇尺寸、重量與柔軟度接近的低風險材料。",
      "先用少量或小尺寸測試，確認可行後再製作完整版本。"
    ];
  }

  function defaultTroubleshooting(recipe) {
    return [
      `無法成功：重新核對「${recipe.formula}」，並確認材料沒有漏放。`,
      `結構不穩或效果不明顯：檢查${recipe.focus || "尺寸、比例與接點"}，每次只調整一項。`,
      "結果與預期不同：回到第一步縮小尺寸重做，並記錄每次改動。"
    ];
  }

  function defaultSafety(level) {
    return level === "medium"
      ? [
          "標示為成人陪同的步驟應由成人操作或全程監督。",
          "只使用完整、乾淨、來源明確的材料；破損材料立即停用。",
          "完成後清潔桌面與雙手，成品不放入口鼻。"
        ]
      : [
          "依年齡選擇安全剪刀與工具，使用後立即收好。",
          "小零件遠離幼兒與寵物，成品不可食用。",
          "材料破損、發霉、過熱或出現異味時立即停止。"
        ];
  }

  function makeDiagram(recipe) {
    const steps = recipe.steps || [];
    const indexes = [0, Math.max(1, Math.floor((steps.length - 1) / 2)), steps.length - 1];
    const titles = ["準備與量取", "組裝與製作", "完成與測試"];
    const icons = recipe.icons?.length === 3 ? recipe.icons : ICON_FALLBACK;
    return indexes.map((stepIndex, index) => ({
      icon: icons[index],
      title: titles[index],
      caption: String(steps[stepIndex] || steps[index] || "").slice(0, 70)
    }));
  }

  window.LITTLE_ALCHEMIST_ADD_RECIPES = definitions => {
    if (!Array.isArray(window.LITTLE_ALCHEMIST_RECIPES)) {
      window.LITTLE_ALCHEMIST_RECIPES = [];
    }

    const existingIds = new Set(window.LITTLE_ALCHEMIST_RECIPES.map(recipe => recipe.id));
    const additions = (definitions || [])
      .filter(recipe => recipe?.id && recipe?.title && !existingIds.has(recipe.id))
      .map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        aliases: uniqueText(recipe.aliases),
        emoji: recipe.emoji || "🧪",
        category: recipe.category || "生活手作",
        difficulty: recipe.difficulty || "入門",
        time: recipe.time || "約 20～30 分鐘",
        safetyLevel: recipe.safetyLevel === "medium" ? "medium" : "low",
        safetyLabel: recipe.safetyLevel === "medium" ? "成人陪同" : "低風險",
        summary: recipe.summary,
        formula: recipe.formula,
        materials: (recipe.materials || []).map(([name, amount]) => ({ name, amount })),
        tools: uniqueText(recipe.tools),
        steps: uniqueText(recipe.steps),
        principle: recipe.principle,
        keyVariables: defaultVariables(recipe.focus),
        substitutes: recipe.substitutes?.length ? uniqueText(recipe.substitutes) : defaultSubstitutes(),
        troubleshooting: recipe.troubleshooting?.length
          ? uniqueText(recipe.troubleshooting)
          : defaultTroubleshooting(recipe),
        safety: recipe.safety?.length ? uniqueText(recipe.safety) : defaultSafety(recipe.safetyLevel),
        diagram: makeDiagram(recipe)
      }));

    window.LITTLE_ALCHEMIST_RECIPES.push(...additions);
  };
})();
