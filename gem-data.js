"use strict";

(() => {
  const categories = {
    native: { label: "自然元素", icon: "◆", description: "由單一元素組成，鍵結方式直接控制硬度、延展性與導電性。" },
    oxide: { label: "氧化物", icon: "◉", description: "氧與金屬或半金屬形成的礦物，常見於岩漿分異、變質與氧化帶。" },
    sulfide: { label: "硫化物", icon: "✦", description: "金屬與硫形成的重要礦石礦物，多與熱液及岩漿硫化物作用有關。" },
    halide: { label: "鹵化物", icon: "▣", description: "鹵素陰離子形成的離子晶體，常見於蒸發岩或熱液環境。" },
    carbonate: { label: "碳酸鹽", icon: "△", description: "含 CO₃ 平面基團，常由沉積、熱液或次生氧化作用形成。" },
    sulfate: { label: "硫酸鹽", icon: "◇", description: "含 SO₄ 四面體，常見於蒸發岩與硫化物氧化帶。" },
    phosphate: { label: "磷酸鹽", icon: "⬡", description: "含 PO₄ 四面體，常見於岩漿副礦物、偉晶岩或次生富集。" },
    tectosilicate: { label: "架狀矽酸鹽", icon: "⌘", description: "SiO₄ 四面體共享四個頂點形成三維骨架，包含石英與長石。" },
    cyclosilicate: { label: "環狀矽酸鹽", icon: "⬢", description: "四面體連成環，常形成柱狀晶體與可容納離子的通道。" },
    nesosilicate: { label: "島狀矽酸鹽", icon: "▲", description: "SiO₄ 四面體彼此孤立，以金屬陽離子連接，常具高密度與高硬度。" },
    inosilicate: { label: "鏈狀矽酸鹽", icon: "〰", description: "四面體形成單鏈或雙鏈，代表礦物為輝石與角閃石。" },
    phyllosilicate: { label: "層狀矽酸鹽", icon: "≋", description: "四面體形成薄片，層間鍵結較弱，因此常有一組完全解理。" }
  };

  const crystalSystems = ["等軸晶系", "四方晶系", "六方晶系", "三方晶系", "斜方晶系", "單斜晶系", "三斜晶系", "非晶質", "混合／集合體"];

  const paths = [
    { id: "crystal", icon: "01", title: "晶體結構與晶系", summary: "先理解晶格、配位多面體、七大晶系與對稱性。", minerals: ["diamond", "halite", "quartz", "rutile", "calcite", "gypsum"] },
    { id: "silicate", icon: "02", title: "矽酸鹽結構演化", summary: "沿著孤立四面體、環、鏈、層到三維架構建立結構地圖。", minerals: ["olivine", "beryl", "diopside", "tremolite", "muscovite", "orthoclase"] },
    { id: "gem", icon: "03", title: "寶石礦物與致色", summary: "比較剛玉、綠柱石、石榴子石、碧璽、鋯石與黃玉。", minerals: ["corundum", "beryl", "tourmaline", "pyrope", "zircon", "topaz"] },
    { id: "genesis", icon: "04", title: "岩漿—熱液—變質—沉積", summary: "從形成環境理解礦物為何在特定岩石與礦床中出現。", minerals: ["olivine", "cassiterite", "gold", "kyanite", "calcite", "halite"] },
    { id: "ore", icon: "05", title: "礦石礦物與金屬來源", summary: "辨認鐵、銅、鋅、鉛、錫、汞與鉬的重要礦物。", minerals: ["magnetite", "chalcopyrite", "sphalerite", "galena", "cassiterite", "molybdenite"] },
    { id: "identify", icon: "06", title: "肉眼鑑定與安全", summary: "依硬度、解理、條痕、光澤、密度與共生關係縮小判斷。", minerals: ["quartz", "calcite", "fluorite", "gypsum", "pyrite", "galena"] }
  ];

  window.LITTLE_ALCHEMIST_GEMS = { categories, crystalSystems, paths, minerals: [] };
  window.LITTLE_ALCHEMIST_ADD_MINERALS = definitions => {
    const library = window.LITTLE_ALCHEMIST_GEMS.minerals;
    const ids = new Set(library.map(item => item.id));
    for (const item of definitions || []) {
      if (!item?.id || !item?.title || ids.has(item.id)) continue;
      const category = categories[item.category] || { label: item.category || "其他", icon: "◇" };
      library.push({
        ...item,
        categoryLabel: category.label,
        aliases: Array.isArray(item.aliases) ? item.aliases : [],
        varieties: Array.isArray(item.varieties) ? item.varieties : [],
        associations: Array.isArray(item.associations) ? item.associations : [],
        keywords: Array.isArray(item.keywords) ? item.keywords : []
      });
      ids.add(item.id);
    }
  };
})();