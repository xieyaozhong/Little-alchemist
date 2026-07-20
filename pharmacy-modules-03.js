"use strict";
window.LITTLE_ALCHEMIST_ADD_PHARMACY_MODULES([
  {
    id: "functional-groups", title: "官能基與藥物性質", english: "Functional Groups", category: "medicinalChemistry", level: "核心",
    summary: "胺、羧酸、醯胺、酯、醇、酚、醚與芳香環等官能基會影響酸鹼性、氫鍵、溶解度、代謝與結合。",
    concepts: ["可電離官能基會改變不同 pH 下的帶電比例。", "氫鍵供體與受體影響水溶性與標的結合。", "酯常較易水解，醯胺通常較穩定，但仍須看整體結構與環境。"],
    connections: ["pKa", "膜穿透", "代謝穩定性"], keywords: ["官能基", "胺", "羧酸", "酯", "醯胺"]
  },
  {
    id: "stereochemistry", title: "立體化學與手性", english: "Stereochemistry and Chirality", category: "medicinalChemistry", level: "進階",
    summary: "鏡像異構物可能對受體、代謝酵素與轉運蛋白表現不同，因此活性、毒性與動力學都可能不同。",
    concepts: ["R／S 描述手性中心的絕對構型，不直接代表旋光方向。", "對映異構物物理性質相近，但在手性生物環境中可產生不同效果。", "外消旋體與單一對映體的臨床與製造策略需個別評估。"],
    connections: ["對映異構物", "選擇性", "不對稱合成"], keywords: ["chirality", "手性", "R/S", "對映異構物"]
  },
  {
    id: "sar", title: "構效關係與藥效團", english: "Structure–Activity Relationship", category: "medicinalChemistry", level: "進階",
    summary: "構效關係研究分子結構改變如何影響活性、選擇性、溶解度、代謝與毒性，藥效團則描述關鍵空間特徵。",
    concepts: ["更強的標的親和力不一定代表更好的整體藥物。", "加入或移除取代基可能同時影響多個性質。", "藥物設計需在效力、選擇性、暴露、穩定性與安全性間取得平衡。"],
    connections: ["先導化合物", "藥效團", "ADMET"], keywords: ["SAR", "構效關係", "pharmacophore", "藥效團"]
  },
  {
    id: "prodrugs", title: "前驅藥設計", english: "Prodrugs", category: "medicinalChemistry", level: "進階",
    summary: "前驅藥本身活性較低或不同，進入體內後經化學或酵素轉換成活性形式，以改善吸收、分布、耐受性或標的傳遞。",
    concepts: ["前驅藥可暫時遮蔽極性官能基以改善膜穿透。", "活化速度與位置會影響效果與個體差異。", "肝腎功能、基因與交互作用可能改變前驅藥轉換。"],
    connections: ["酯酶", "首渡代謝", "標靶傳遞"], keywords: ["prodrug", "前驅藥", "活化"]
  },
  {
    id: "phase-metabolism", title: "第一相與第二相代謝", english: "Phase I and Phase II Metabolism", category: "medicinalChemistry", level: "核心",
    summary: "藥物代謝常分為氧化、還原、水解等第一相反應，以及葡萄醣醛酸化、硫酸化、乙醯化等第二相結合反應。",
    concepts: ["第一相不一定讓藥物失活，也可能產生活性或反應性代謝物。", "第二相通常提高極性，但並非所有結合物都完全無活性。", "CYP 酵素、轉移酶與轉運蛋白共同決定代謝與排泄。"],
    connections: ["CYP450", "代謝物", "酵素誘導與抑制"], keywords: ["phase I", "phase II", "CYP", "葡萄醣醛酸化", "代謝"]
  },
  {
    id: "chemical-stability", title: "藥物的化學穩定性", english: "Chemical Stability", category: "medicinalChemistry", level: "核心",
    summary: "水解、氧化、光分解、異構化與聚合等降解途徑會降低含量或產生雜質，配方與包裝需控制水、氧、光、溫度與 pH。",
    concepts: ["溫度上升通常加快多數降解反應。", "抗氧化劑、螯合劑、惰性氣體與避光包裝可降低特定風險。", "有效期限建立在穩定性研究與規格內，不等於過期當下立即完全失效。"],
    connections: ["保存條件", "雜質", "穩定性試驗"], keywords: ["水解", "氧化", "光分解", "有效期限", "stability"]
  },
  {
    id: "analgesics", title: "止痛與抗發炎藥理", english: "Analgesics and Anti-inflammatory Drugs", category: "therapeutics", level: "核心",
    summary: "止痛藥可透過中樞疼痛路徑、前列腺素合成或其他機制降低疼痛；不同家族的抗發炎、退燒與風險並不相同。",
    concepts: ["NSAIDs 主要抑制環氧化酵素與前列腺素生成。", "乙醯胺酚類以止痛退燒為主，抗發炎效果有限。", "鴉片類作用於中樞受體，需嚴格評估呼吸抑制、耐受與依賴風險。"],
    connections: ["COX", "前列腺素", "疼痛路徑"], keywords: ["止痛藥", "NSAID", "退燒", "抗發炎"],
    safety: "本頁不提供止痛藥個人選擇或劑量；重複成分、肝腎疾病、出血風險與酒精使用都需專業評估。"
  },
  {
    id: "antiinfectives", title: "抗感染藥與抗藥性", english: "Antiinfectives and Resistance", category: "therapeutics", level: "核心",
    summary: "抗菌、抗病毒、抗黴菌與抗寄生蟲藥針對不同病原與生命週期；不當使用會增加失敗、不良反應與抗藥性。",
    concepts: ["抗生素只針對特定細菌標的，對一般病毒感染無效。", "抗藥性可來自標的改變、藥物破壞、外排幫浦或通透性下降。", "培養、藥敏、感染部位與宿主狀態會影響藥物選擇。"],
    connections: ["細胞壁", "核糖體", "抗藥性", "抗菌藥物管理"], keywords: ["抗生素", "抗病毒", "抗黴菌", "抗藥性"],
    safety: "抗感染藥不應自行購買、分享或以剩藥治療；是否需要以及療程長短應由醫療專業判斷。"
  },
  {
    id: "allergy-respiratory", title: "過敏與呼吸系統藥理", english: "Allergy and Respiratory Pharmacology", category: "therapeutics", level: "核心",
    summary: "抗組織胺、支氣管擴張、吸入型抗發炎與白三烯路徑藥物分別處理過敏介質、氣道平滑肌與慢性發炎。",
    concepts: ["第一代抗組織胺較容易進入中樞並造成嗜睡與抗膽鹼作用。", "支氣管擴張可緩解氣流受限，但不一定控制底層發炎。", "吸入裝置操作與吸氣技巧會顯著影響實際到達肺部的藥量。"],
    connections: ["H1 受體", "β2 受體", "吸入劑型"], keywords: ["抗組織胺", "氣喘", "支氣管擴張", "吸入器"],
    safety: "呼吸困難、嘴唇發紫或疑似嚴重過敏反應屬緊急狀況，不應只依賴知識庫自行處理。"
  },
  {
    id: "cardiovascular", title: "心血管藥理地圖", english: "Cardiovascular Pharmacology", category: "therapeutics", level: "進階",
    summary: "心血管藥物可調節血容量、血管張力、心率、收縮力、凝血與脂質代謝，常需結合血壓、心電圖與實驗室監測。",
    concepts: ["利尿劑改變鈉水排泄與體液量。", "腎素—血管張力素系統、鈣離子通道與交感神經是常見標的。", "抗血小板與抗凝血藥降低血栓風險，但也提高出血風險。"],
    connections: ["RAAS", "鈣離子通道", "凝血瀑布"], keywords: ["降血壓", "利尿劑", "抗凝血", "心律", "膽固醇"],
    safety: "心血管藥物不應自行增減或停用；突然停藥、脫水、腎功能改變與交互作用可能造成嚴重後果。"
  },
  {
    id: "endocrine", title: "內分泌與代謝藥理", english: "Endocrine and Metabolic Pharmacology", category: "therapeutics", level: "進階",
    summary: "內分泌藥物會影響胰島素、甲狀腺、類固醇、骨代謝與其他回饋軸，作用常與飲食、器官功能及監測密切相關。",
    concepts: ["胰島素與不同降血糖機轉會影響低血糖、體重與器官風險。", "外源性類固醇可抑制下視丘—腦下垂體—腎上腺軸。", "甲狀腺與骨代謝藥物的吸收和效果常受時間、食物或礦物質影響。"],
    connections: ["荷爾蒙回饋", "血糖", "骨重塑"], keywords: ["糖尿病", "胰島素", "甲狀腺", "類固醇", "骨質疏鬆"],
    safety: "低血糖、腎上腺危象或嚴重電解質異常可能危及生命；藥物調整必須由醫療專業進行。"
  },
  {
    id: "cns", title: "中樞神經與精神藥理", english: "Central Nervous System Pharmacology", category: "therapeutics", level: "進階",
    summary: "中樞藥物透過單胺、GABA、麩胺酸、離子通道與神經網路調節情緒、睡眠、癲癇、注意力與精神症狀。",
    concepts: ["不同藥物即使作用於同一傳遞物，也可能因受體亞型與腦區而效果不同。", "臨床效果與副作用的時間軸可能不一致。", "鎮靜、認知、跌倒、戒斷與自殺風險需要持續評估。"],
    connections: ["血腦障壁", "神經傳遞物", "受體調節"], keywords: ["抗憂鬱", "安眠", "抗癲癇", "抗精神病", "GABA"],
    safety: "精神或神經用藥不可因短期感受自行突然停藥；出現自傷想法、意識改變或嚴重過敏應立即尋求專業協助。"
  }
]);