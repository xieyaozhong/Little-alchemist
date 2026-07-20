"use strict";
window.LITTLE_ALCHEMIST_ADD_PHARMACY_MODULES([
  {
    id: "adverse-reactions", title: "不良反應的分類與判讀", english: "Adverse Drug Reactions", category: "safety", level: "核心",
    summary: "不良反應可依可預測性、劑量關聯、時間與嚴重度分類；副作用、過敏、毒性與疾病惡化不應混為一談。",
    concepts: ["A 型反應通常與已知藥理作用及劑量相關。", "B 型反應較不容易預測，可能涉及免疫或特殊體質。", "時間關聯、停藥後變化、再暴露與其他原因有助於因果評估。"],
    connections: ["因果評估", "藥物警戒", "風險溝通"], keywords: ["不良反應", "副作用", "ADR", "嚴重不良事件"],
    safety: "疑似嚴重過敏、呼吸困難、昏厥、廣泛水泡或意識改變時應立即求助，不要等待自行觀察。"
  },
  {
    id: "allergy-vs-side-effect", title: "藥物過敏與一般副作用", english: "Drug Allergy versus Side Effects", category: "safety", level: "入門",
    summary: "藥物過敏通常涉及免疫機制；噁心、嗜睡或口乾等常見藥理副作用，不等同真正過敏。",
    concepts: ["立即型過敏可能出現蕁麻疹、喘鳴、血壓下降或喉頭症狀。", "延遲型反應可能在數日後出現皮疹或器官影響。", "紀錄疑似藥名、反應型態、時間與處理方式，比只寫『藥物過敏』更有用。"],
    connections: ["免疫學", "交叉過敏", "藥歷"], keywords: ["過敏", "皮疹", "副作用", "anaphylaxis"]
  },
  {
    id: "poisoning-principles", title: "中毒處置的基本原則", english: "Principles of Poisoning Management", category: "safety", level: "核心",
    summary: "中毒處置先確保呼吸循環與現場安全，再辨識物質、暴露途徑、時間與症狀；不是所有情況都適合催吐或使用偏方。",
    concepts: ["毒性取決於物質、劑量、時間、途徑與個體狀態。", "支持性治療常比追求特定解毒劑更重要。", "包裝、成分與暴露量資訊可協助專業人員判斷。"],
    connections: ["毒物動力學", "解毒劑", "急救"], keywords: ["中毒", "過量", "毒理", "解毒"],
    safety: "疑似中毒或過量時應立即聯絡當地緊急醫療或毒物諮詢單位；不要自行催吐、灌水或混合化學品。"
  },
  {
    id: "special-populations", title: "特殊族群的藥動與風險", english: "Special Populations", category: "safety", level: "進階",
    summary: "兒童、長者、孕哺、肝腎功能異常與重症患者的體液、代謝、清除與敏感度可能不同。",
    concepts: ["兒童不是縮小版成人，器官成熟度與劑型可用性都會影響治療。", "長者常同時面臨多重疾病、多重用藥與跌倒風險。", "孕哺期評估需同時考量母體疾病未治療風險、胎兒或嬰兒暴露與替代方案。"],
    connections: ["腎功能", "肝功能", "胎盤與乳汁轉移"], keywords: ["兒科", "老人", "懷孕", "哺乳", "肝腎功能"],
    safety: "特殊族群的用藥不可只依一般成人資訊推算，應由醫療專業個別評估。"
  },
  {
    id: "medication-errors", title: "用藥錯誤與相似藥名", english: "Medication Errors and LASA", category: "safety", level: "核心",
    summary: "看似、聽似藥名，包裝相近、單位混淆、轉抄錯誤與資訊斷裂，都可能造成可預防傷害。",
    concepts: ["同名不同含量與同成分不同商品都需核對。", "mg、mL、單位與濃度不可互換。", "條碼、雙人核對、清楚標示與藥物整合可降低系統性風險。"],
    connections: ["LASA", "藥物整合", "人因工程"], keywords: ["用藥錯誤", "LASA", "相似藥名", "雙人核對"],
    safety: "不確定藥名、含量或用法時先停止操作並確認，不要依顏色、形狀或記憶猜測。"
  },
  {
    id: "pharmacovigilance", title: "藥物警戒與上市後監測", english: "Pharmacovigilance", category: "safety", level: "核心",
    summary: "臨床試驗無法涵蓋所有族群與罕見事件，上市後需持續蒐集、分析與處理安全訊號。",
    concepts: ["自發通報可發現罕見或非預期事件，但不能直接計算發生率。", "訊號代表需要進一步評估，不等於已證實因果。", "風險管理可能導致警語更新、限制使用、教育措施或回收。"],
    connections: ["MedWatch", "風險管理計畫", "標籤更新"], keywords: ["藥物警戒", "pharmacovigilance", "安全訊號", "上市後監測"]
  },
  {
    id: "identity-purity-potency", title: "鑑別、純度與含量", english: "Identity, Purity and Potency", category: "quality", level: "核心",
    summary: "藥品品質至少要確認它是正確物質、雜質在可接受範圍、活性成分含量符合規格，且劑量單位間一致。",
    concepts: ["鑑別試驗回答『是不是這個成分』。", "純度與雜質試驗評估原料、製程與降解產物。", "含量測定與含量均一性分別關注整體平均與單位間差異。"],
    connections: ["藥典", "規格", "標準品"], keywords: ["assay", "純度", "含量", "鑑別", "雜質"]
  },
  {
    id: "chromatography", title: "層析法", english: "Chromatography", category: "quality", level: "進階",
    summary: "HPLC、GC 與薄層層析利用分析物在固定相與移動相之間分配差異進行分離、鑑別與定量。",
    concepts: ["保留時間可協助鑑別，但通常需搭配標準品或光譜資訊。", "解析度、選擇性、效率與峰形影響分離品質。", "方法需驗證準確度、精密度、專一性、線性與範圍。"],
    connections: ["HPLC", "GC", "TLC", "方法驗證"], keywords: ["層析", "HPLC", "GC", "保留時間", "解析度"]
  },
  {
    id: "spectroscopy", title: "光譜與結構鑑定", english: "Spectroscopy", category: "quality", level: "進階",
    summary: "UV-Vis、IR、NMR 與質譜提供不同層次的吸收、官能基、原子環境與質量資訊，常需互相佐證。",
    concepts: ["UV-Vis 常用於具有發色團的定量分析。", "IR 可辨識官能基與指紋區特徵。", "NMR 與質譜可協助確認骨架、分子量、碎片與雜質。"],
    connections: ["Beer-Lambert 定律", "IR", "NMR", "MS"], keywords: ["光譜", "UV", "IR", "NMR", "質譜"],
    formula: "A = εbc"
  },
  {
    id: "stability-testing", title: "穩定性與溶離品質試驗", english: "Stability and Performance Testing", category: "quality", level: "核心",
    summary: "穩定性研究確認產品在時間、溫度、濕度與光照下仍符合規格；溶離試驗則監測固體製劑釋放表現。",
    concepts: ["長期、加速與光穩定性研究服務不同目的。", "包裝系統是產品穩定性的一部分。", "規格趨勢可在超出標準前揭露製程或保存問題。"],
    connections: ["有效期限", "包裝", "溶離", "降解物"], keywords: ["穩定性試驗", "加速試驗", "溶離", "有效期限"]
  },
  {
    id: "gmp-quality", title: "GMP 與品質系統", english: "Good Manufacturing Practice", category: "quality", level: "核心",
    summary: "GMP 以人員、廠房、設備、文件、原料、製程、驗證、偏差與持續改善確保每批產品一致可追溯。",
    concepts: ["品質不能只靠成品檢驗，必須設計進製程。", "紀錄需即時、可讀、可追溯且不能任意修改。", "偏差、變更、超規格與客訴需調查根本原因並採取矯正預防措施。"],
    connections: ["驗證", "CAPA", "資料完整性", "品質風險管理"], keywords: ["GMP", "品質保證", "驗證", "CAPA", "資料完整性"]
  },
  {
    id: "clinical-development", title: "臨床試驗、核准與標示", english: "Clinical Development and Regulation", category: "quality", level: "核心",
    summary: "藥物開發從非臨床研究、早期人體試驗、確認性試驗、審查核准到上市後監測，持續累積品質、安全與有效性證據。",
    concepts: ["第一期通常著重安全、耐受與藥動；第二期探索療效與方案；第三期以較大族群確認效益風險。", "核准不是研究終點，上市後仍需監測罕見風險與真實世界使用。", "標示應反映核准依據、適應症、風險與使用資訊。"],
    connections: ["IND", "NDA", "臨床試驗", "上市後監測", "CTD"], keywords: ["臨床試驗", "phase 1", "phase 2", "phase 3", "FDA", "核准"],
    safety: "藥品是否適用於個人，不能只依核准狀態或單篇研究判斷；需由合格醫療專業評估。"
  }
]);