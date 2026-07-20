"use strict";
window.LITTLE_ALCHEMIST_ADD_PHARMACY_MODULES([
  {
    id: "pharmacy-scope", title: "藥學在做什麼", english: "Scope of Pharmacy", category: "foundations", level: "入門",
    summary: "藥學連結化學、生物、醫療與公共衛生，關心藥品從發現、製造、評估到安全使用的完整生命週期。",
    concepts: ["藥物科學研究活性分子與生物系統的互動。", "藥劑學把活性成分轉化為可控制品質與釋放的劑型。", "臨床與社區藥學強調用藥評估、溝通、監測與風險管理。"],
    connections: ["藥物化學", "藥理學", "藥劑學", "藥物分析", "法規科學"], keywords: ["藥學系", "藥師", "藥品生命週期"]
  },
  {
    id: "drug-names", title: "藥品的三種名稱", english: "Drug Naming", category: "foundations", level: "入門",
    summary: "同一活性成分可能同時有化學名、通用名與商品名，辨識時應優先確認活性成分與含量。",
    concepts: ["化學名描述分子結構，但通常不適合日常溝通。", "國際非專利名稱或通用名用來辨識活性成分。", "商品名由廠商使用，不同商品可能含相同成分，也可能是複方。"],
    connections: ["仿單閱讀", "學名藥", "複方製劑"], keywords: ["通用名", "學名", "商品名", "brand", "generic"],
    safety: "不要只憑外觀或商品名判斷藥品；實際使用前應核對活性成分、含量、劑型與標示。"
  },
  {
    id: "routes", title: "給藥途徑", english: "Routes of Administration", category: "foundations", level: "核心",
    summary: "口服、舌下、吸入、皮膚、眼用、直腸與注射等途徑會改變吸收速度、局部性與風險。",
    concepts: ["口服方便但可能受腸胃吸收與首渡效應影響。", "吸入與局部劑型可把較高濃度帶到特定部位，但操作技巧很重要。", "注射可避開部分吸收障礙，卻需要無菌技術與專業操作。"],
    connections: ["生體可用率", "首渡效應", "無菌製劑"], keywords: ["口服", "注射", "吸入", "舌下", "局部用藥"],
    safety: "不同途徑不可自行互換；不可把口服液、外用液或注射劑當成其他途徑使用。"
  },
  {
    id: "dosage-forms", title: "劑型總覽", english: "Dosage Forms", category: "foundations", level: "入門",
    summary: "錠劑、膠囊、溶液、懸浮液、乳劑、貼片、栓劑與注射劑，是為了控制穩定性、使用方式與釋放行為。",
    concepts: ["劑型不是包裝而已，它會影響藥物釋放、吸收與保存。", "速放、腸溶、緩釋等設計具有不同目的。", "液體製劑易調整體積，但沉降、污染與量取誤差更需注意。"],
    connections: ["賦形劑", "溶離", "藥物穩定性"], keywords: ["錠劑", "膠囊", "糖漿", "貼片", "緩釋", "腸溶"],
    safety: "緩釋、控釋或腸溶製劑通常不應任意磨粉、咬碎或剝開；應依標示或專業指示處理。"
  },
  {
    id: "labels", title: "藥袋、標籤與仿單", english: "Medication Labels", category: "foundations", level: "核心",
    summary: "藥品標示把成分、含量、用途、警語、保存與使用方式轉成可執行的安全資訊。",
    concepts: ["核對名稱、含量、劑型、途徑與有效期限是基本步驟。", "警語與禁忌不等於每個人都一定發生，但代表必須評估風險。", "批號、製造與保存資訊可支援品質追溯。"],
    connections: ["用藥錯誤", "藥品法規", "藥物警戒"], keywords: ["藥袋", "仿單", "標籤", "保存", "有效期限"],
    safety: "不要移除原包裝或把多種藥混放在無標示容器；有疑問時應由藥師或醫療人員確認。"
  },
  {
    id: "evidence", title: "藥學資訊與實證層級", english: "Evidence and Drug Information", category: "foundations", level: "核心",
    summary: "藥學判斷應區分機轉推論、實驗研究、臨床試驗、系統性回顧、指南與上市後真實世界資料。",
    concepts: ["機轉合理不代表臨床一定有效。", "隨機對照試驗可降低部分偏差，但受族群、時間與終點限制。", "上市後監測能發現較罕見或長期的安全訊號。"],
    connections: ["臨床試驗", "藥物警戒", "仿單更新"], keywords: ["實證醫學", "臨床試驗", "系統性回顧", "指南"]
  },
  {
    id: "solubility-pka", title: "溶解度、pKa 與脂溶性", english: "Solubility, pKa and Lipophilicity", category: "pharmaceutics", level: "進階",
    summary: "分子的電離狀態、晶型與親水／親脂性會共同影響溶解、膜穿透、配方與分布。",
    concepts: ["弱酸弱鹼的電離比例會隨環境 pH 改變。", "未電離形式常較容易穿越脂質膜，但未必最容易溶於水。", "鹽類、共溶劑、界面活性劑與粒徑控制可改善配方表現。"],
    connections: ["吸收", "鹽類設計", "晶型", "分配係數"], keywords: ["pKa", "logP", "溶解度", "電離", "Henderson-Hasselbalch"],
    formula: "pH = pKa + log([A⁻]/[HA])"
  },
  {
    id: "dissolution", title: "溶離與釋放", english: "Dissolution and Release", category: "pharmaceutics", level: "核心",
    summary: "固體藥品必須先從劑型釋放並溶解，才有機會被吸收；表面積、攪拌、擴散層與溶解度都會影響速度。",
    concepts: ["崩散是錠劑碎開，溶離是藥物分子進入溶液，兩者不同。", "粒徑變小通常增加表面積，但也可能影響穩定性與製造。", "溶離試驗是比較製劑表現的重要品質工具。"],
    connections: ["錠劑", "生體可用率", "品質管制"], keywords: ["溶離", "崩散", "Noyes-Whitney", "釋放"]
  },
  {
    id: "excipients", title: "賦形劑的功能", english: "Pharmaceutical Excipients", category: "pharmaceutics", level: "核心",
    summary: "賦形劑不是單純填充物；它們可協助成形、崩散、潤滑、增稠、防腐、調味、包衣與穩定。",
    concepts: ["稀釋劑提供體積與壓錠性。", "崩散劑、黏合劑與潤滑劑需要平衡，否則會影響強度與釋放。", "防腐劑與抗氧化劑需在有效性、相容性與安全性之間取得平衡。"],
    connections: ["錠劑製造", "配方相容性", "過敏與耐受性"], keywords: ["賦形劑", "黏合劑", "崩散劑", "防腐劑", "包衣"]
  },
  {
    id: "solid-dosage", title: "錠劑與膠囊", english: "Tablets and Capsules", category: "pharmaceutics", level: "核心",
    summary: "固體製劑需控制粉體流動、混合均勻、壓縮、含量均一、硬度、脆碎度、崩散與溶離。",
    concepts: ["直接壓錠、濕式造粒與乾式造粒各有適用材料。", "膠囊殼可容納粉末、顆粒或液體填充物。", "包衣可遮味、防潮、辨識或控制釋放位置。"],
    connections: ["粉體工程", "GMP", "溶離試驗"], keywords: ["壓錠", "膠囊", "造粒", "硬度", "含量均一"]
  },
  {
    id: "liquid-dosage", title: "溶液、懸浮液與乳劑", english: "Liquid Dosage Forms", category: "pharmaceutics", level: "核心",
    summary: "液體製劑依成分是否真正溶解、以固體微粒分散或形成油水兩相，而有不同穩定性與使用方式。",
    concepts: ["溶液分子尺度均一，通常不需搖勻。", "懸浮液會沉降，需控制粒徑、黏度與再分散性。", "乳劑利用界面活性劑穩定油相與水相，但仍可能乳析、聚結或破乳。"],
    connections: ["界面化學", "流變學", "防腐"], keywords: ["糖漿", "懸浮液", "乳劑", "搖勻", "界面活性劑"],
    safety: "液體藥品應使用有刻度量具，不宜用一般餐具估量；懸浮液須依標示充分搖勻。"
  },
  {
    id: "sterile-products", title: "無菌製劑與生物製劑", english: "Sterile and Biological Products", category: "pharmaceutics", level: "進階",
    summary: "注射、眼用及部分生物製劑需嚴格控制無菌、內毒素、微粒、容器完整性、溫度與操作環境。",
    concepts: ["無菌不等於沒有內毒素或微粒。", "終端滅菌優先於無菌操作，但材料與產品必須能耐受。", "蛋白質與疫苗可能對溫度、震盪、光線或凍結特別敏感。"],
    connections: ["無菌製程", "冷鏈", "容器密封完整性"], keywords: ["無菌", "內毒素", "注射劑", "眼藥", "冷鏈"],
    safety: "無菌製劑的配置、分裝與注射屬專業操作，不應在非合格環境自行進行。"
  }
]);