"use strict";

(() => {
  const categories = {
    foundations: { label: "藥學基礎", icon: "⚕", description: "藥品名稱、劑型、給藥途徑、標示與實證資訊。" },
    pharmaceutics: { label: "藥劑學", icon: "⚗", description: "把活性成分設計成穩定、可製造、可使用的藥品。" },
    pharmacokinetics: { label: "藥物動力學", icon: "⌁", description: "藥物在體內的吸收、分布、代謝與排除。" },
    pharmacodynamics: { label: "藥效學", icon: "◎", description: "藥物如何作用於受體、酵素、離子通道與生理系統。" },
    medicinalChemistry: { label: "藥物化學", icon: "⬡", description: "分子結構、官能基、立體化學、代謝與構效關係。" },
    therapeutics: { label: "治療藥理", icon: "✚", description: "常見藥物家族的作用原理、限制與重要風險。" },
    safety: { label: "毒理與用藥安全", icon: "△", description: "不良反應、交互作用、特殊族群與藥害監測。" },
    quality: { label: "分析、品質與法規", icon: "◇", description: "鑑別、純度、含量、製造品質、臨床試驗與上市監測。" }
  };

  const paths = [
    { id: "start", title: "入門路線", icon: "Ⅰ", summary: "先建立藥品、劑型、標示與安全使用的共同語言。", modules: ["pharmacy-scope", "drug-names", "routes", "dosage-forms", "labels", "evidence"] },
    { id: "formulation", title: "製劑路線", icon: "Ⅱ", summary: "理解溶解度、賦形劑、錠劑、液體製劑與無菌製劑。", modules: ["solubility-pka", "dissolution", "excipients", "solid-dosage", "liquid-dosage", "sterile-products"] },
    { id: "pkpd", title: "PK／PD 路線", icon: "Ⅲ", summary: "串連 ADME、半衰期、清除率、受體與劑量反應。", modules: ["adme", "bioavailability", "distribution-volume", "clearance", "half-life", "drug-targets", "dose-response"] },
    { id: "chemistry", title: "藥物化學路線", icon: "Ⅳ", summary: "從官能基與立體化學理解活性、選擇性與代謝。", modules: ["functional-groups", "stereochemistry", "sar", "prodrugs", "phase-metabolism", "chemical-stability"] },
    { id: "clinical", title: "臨床安全路線", icon: "Ⅴ", summary: "理解常見藥物家族、不良反應、交互作用與特殊族群。", modules: ["analgesics", "antiinfectives", "cardiovascular", "endocrine", "cns", "adverse-reactions", "special-populations"] },
    { id: "industry", title: "產業與法規路線", icon: "Ⅵ", summary: "從分析方法、GMP、臨床試驗走到核准與上市後監測。", modules: ["identity-purity-potency", "chromatography", "spectroscopy", "stability-testing", "gmp-quality", "clinical-development"] }
  ];

  window.LITTLE_ALCHEMIST_PHARMACY = { categories, paths, modules: [] };
  window.LITTLE_ALCHEMIST_ADD_PHARMACY_MODULES = definitions => {
    const library = window.LITTLE_ALCHEMIST_PHARMACY;
    if (!library || !Array.isArray(definitions)) return;
    const ids = new Set(library.modules.map(item => item.id));
    definitions.forEach(item => {
      if (!item?.id || !item?.title || ids.has(item.id)) return;
      const category = categories[item.category] ? item.category : "foundations";
      library.modules.push({
        id: item.id,
        title: item.title,
        english: item.english || "",
        category,
        categoryLabel: categories[category].label,
        level: item.level || "核心",
        summary: item.summary || "",
        concepts: Array.isArray(item.concepts) ? item.concepts : [],
        connections: Array.isArray(item.connections) ? item.connections : [],
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
        formula: item.formula || "",
        safety: item.safety || "本頁只供教育用途，不構成個人診斷、處方或劑量建議。"
      });
      ids.add(item.id);
    });
  };
})();