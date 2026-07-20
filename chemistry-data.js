"use strict";

(() => {
  const categoryLabels = {
    "nonmetal": "非金屬",
    "noble-gas": "惰性氣體",
    "alkali-metal": "鹼金屬",
    "alkaline-earth": "鹼土金屬",
    "metalloid": "類金屬",
    "halogen": "鹵素",
    "transition": "過渡金屬",
    "post-transition": "後過渡金屬",
    "lanthanide": "鑭系元素",
    "actinide": "錒系元素",
    "unknown": "性質待確認"
  };

  const chemistry = {
    categoryLabels,
    elements: [],
    reactions: [],
    addElements(records) {
      records.forEach(record => {
        const [number, symbol, name, mass, period, group, category, phase, use] = record;
        const categoryLabel = categoryLabels[category] || category;
        this.elements.push({
          number,
          symbol,
          name,
          english: symbol,
          mass,
          period,
          group,
          category,
          categoryLabel,
          phase,
          intro: use || `${name}（${symbol}）屬於${categoryLabel}，原子序為 ${number}。學習重點包括電子組態、常見氧化態、化合物性質，以及它在材料、分析或地球科學中的角色。`
        });
      });
    },
    addReactions(records) {
      this.reactions.push(...records);
    }
  };

  window.LITTLE_ALCHEMIST_CHEMISTRY = chemistry;
})();
