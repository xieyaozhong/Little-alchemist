"use strict";
window.LITTLE_ALCHEMIST_ADD_PHARMACY_MODULES([
  {
    id: "adme", title: "ADME：藥物在體內的旅程", english: "Absorption, Distribution, Metabolism, Excretion", category: "pharmacokinetics", level: "核心",
    summary: "藥物動力學描述身體如何處理藥物，通常以吸收、分布、代謝與排除四個階段整理。",
    concepts: ["吸收決定藥物從給藥部位進入循環的速度與程度。", "分布受到血流、膜通透性、蛋白結合與組織親和力影響。", "代謝與排除共同決定藥物及代謝物離開體內的速度。"],
    connections: ["生體可用率", "分布體積", "清除率", "半衰期"], keywords: ["ADME", "吸收", "分布", "代謝", "排泄"]
  },
  {
    id: "bioavailability", title: "生體可用率與首渡效應", english: "Bioavailability and First-pass Effect", category: "pharmacokinetics", level: "核心",
    summary: "生體可用率描述給藥後有多少活性成分以未改變形式到達全身循環；口服藥常受腸道與肝臟首渡代謝影響。",
    concepts: ["靜脈給藥的全身生體可用率在定義上視為 100%。", "口服吸收良好仍可能因首渡代謝而降低全身暴露。", "比較製劑時常以濃度時間曲線下面積與峰值等指標評估。"],
    connections: ["給藥途徑", "AUC", "學名藥生體相等性"], keywords: ["bioavailability", "F", "首渡效應", "AUC"],
    formula: "F = 到達全身循環的藥量／給藥量"
  },
  {
    id: "distribution-volume", title: "分布體積", english: "Volume of Distribution", category: "pharmacokinetics", level: "進階",
    summary: "分布體積是把體內總藥量與血漿濃度連結的表觀參數，不是實際解剖空間。",
    concepts: ["高度留在血漿中的藥物通常有較小表觀分布體積。", "強烈進入組織或脂肪的藥物可能呈現很大的表觀分布體積。", "蛋白結合、體液量與組織組成會改變分布。"],
    connections: ["蛋白結合", "組織分布", "半衰期"], keywords: ["Vd", "分布體積", "血漿濃度"],
    formula: "Vd = 體內藥量／血漿濃度"
  },
  {
    id: "clearance", title: "清除率", english: "Clearance", category: "pharmacokinetics", level: "進階",
    summary: "清除率表示單位時間內，身體能把多少表觀血漿體積中的藥物完全移除。",
    concepts: ["總清除率可由肝、腎與其他途徑的清除率相加。", "清除率與器官血流、酵素活性、蛋白結合及腎功能有關。", "清除率下降通常使相同輸入下的平均暴露增加。"],
    connections: ["腎清除", "肝代謝", "穩態濃度"], keywords: ["clearance", "CL", "腎功能", "肝功能"],
    formula: "CL = 消除速率／血漿濃度"
  },
  {
    id: "half-life", title: "消除半衰期", english: "Elimination Half-life", category: "pharmacokinetics", level: "核心",
    summary: "半衰期是濃度或體內藥量下降一半所需的時間，受到分布體積與清除率共同影響。",
    concepts: ["多數常見情況可用一階消除近似，每個半衰期移除固定比例。", "半衰期較長通常代表累積與達穩態所需時間較長。", "疾病、年齡、交互作用與非線性動力學可能改變半衰期。"],
    connections: ["清除率", "分布體積", "累積", "穩態"], keywords: ["half-life", "t1/2", "半衰期", "消除"],
    formula: "t½ ≈ 0.693 × Vd／CL"
  },
  {
    id: "steady-state", title: "穩態、累積與 AUC", english: "Steady State, Accumulation and AUC", category: "pharmacokinetics", level: "進階",
    summary: "規律輸入與消除達到動態平衡時形成穩態；AUC 則表示一段時間內的總藥物暴露。",
    concepts: ["穩態不是濃度完全不變，而是每個給藥週期的波動型態重複。", "達到接近穩態通常需要數個半衰期。", "AUC 受輸入量、生體可用率與清除率影響。"],
    connections: ["半衰期", "清除率", "治療藥物監測"], keywords: ["steady state", "AUC", "累積", "穩態"]
  },
  {
    id: "drug-targets", title: "藥物標的：受體、酵素與離子通道", english: "Drug Targets", category: "pharmacodynamics", level: "核心",
    summary: "藥物可透過受體、酵素、離子通道、轉運蛋白、核酸或結構蛋白改變細胞訊號與生理功能。",
    concepts: ["受體結合常引發或抑制細胞訊號。", "酵素抑制可降低特定產物形成或改變代謝路徑。", "離子通道與轉運蛋白會直接影響膜電位、離子平衡或物質運輸。"],
    connections: ["親和力", "選擇性", "訊號傳遞"], keywords: ["受體", "酵素", "離子通道", "轉運蛋白", "target"]
  },
  {
    id: "agonist-antagonist", title: "致效劑、拮抗劑與部分致效劑", english: "Agonists and Antagonists", category: "pharmacodynamics", level: "核心",
    summary: "致效劑啟動受體訊號，拮抗劑阻止受體被啟動，部分致效劑則產生低於完全致效劑的最大反應。",
    concepts: ["競爭性拮抗通常與致效劑爭奪相同結合位置。", "非競爭性拮抗或不可逆結合可能降低最大反應。", "部分致效劑在沒有完全致效劑時可產生作用，在其存在時可能表現為功能性拮抗。"],
    connections: ["受體佔有率", "劑量反應曲線", "內在活性"], keywords: ["agonist", "antagonist", "致效劑", "拮抗劑", "部分致效劑"]
  },
  {
    id: "dose-response", title: "劑量反應、效價與效能", english: "Dose-response, Potency and Efficacy", category: "pharmacodynamics", level: "核心",
    summary: "劑量反應曲線用來描述藥物濃度或劑量與效果的關係，效價與最大效能是不同概念。",
    concepts: ["效價高代表較低濃度即可達到某一效果，不等於最大效果更強。", "效能描述可達到的最大反應。", "個體反應曲線與群體中達到特定結果的比例曲線需分開理解。"],
    connections: ["EC50", "Emax", "治療窗"], keywords: ["dose response", "potency", "efficacy", "EC50", "Emax"]
  },
  {
    id: "therapeutic-window", title: "治療窗與治療指數", english: "Therapeutic Window and Index", category: "pharmacodynamics", level: "核心",
    summary: "治療窗描述有效暴露與不可接受毒性之間的範圍；窄治療窗藥物通常需要更嚴格監測。",
    concepts: ["有效濃度與毒性濃度會因個體與臨床情境而變動。", "治療指數是群體層級比較安全範圍的概念，不可取代個別評估。", "血中濃度監測只適用於特定藥物與明確臨床問題。"],
    connections: ["治療藥物監測", "不良反應", "個體差異"], keywords: ["therapeutic window", "治療窗", "治療指數", "TDM"],
    safety: "本知識庫不提供個人濃度目標或劑量調整；窄治療窗藥品必須由專業人員監測。"
  },
  {
    id: "tolerance-dependence", title: "耐受性、快速耐受與依賴", english: "Tolerance and Dependence", category: "pharmacodynamics", level: "進階",
    summary: "反覆暴露可能造成受體調節、訊號適應或生理代償，使效果改變；依賴與成癮並非同義詞。",
    concepts: ["耐受性是相同暴露下效果下降。", "快速耐受可在短時間重複使用後出現。", "生理依賴代表突然停止可能出現戒斷反應；成癮還涉及失控使用與持續傷害。"],
    connections: ["受體調節", "戒斷", "成癮醫學"], keywords: ["耐受性", "tachyphylaxis", "依賴", "戒斷", "成癮"],
    safety: "疑似依賴或戒斷風險時，不應自行突然停藥，應尋求醫療專業評估。"
  },
  {
    id: "drug-interactions", title: "藥物交互作用", english: "Drug Interactions", category: "pharmacodynamics", level: "核心",
    summary: "交互作用可發生在吸收、蛋白結合、代謝、排泄或生理效果層面，也可能與食物、酒精、草藥及疾病狀態相關。",
    concepts: ["藥物動力學交互作用會改變暴露量或時間。", "藥效學交互作用可能產生加成、協同或拮抗。", "酵素或轉運蛋白的抑制與誘導通常有不同發生與消退時間。"],
    connections: ["CYP 酵素", "轉運蛋白", "QT 延長", "出血風險"], keywords: ["interaction", "交互作用", "CYP", "誘導", "抑制"],
    safety: "實際交互作用判讀需結合成分、劑量、時間、疾病與檢驗；不要只靠單一網路清單自行停換藥。"
  }
]);