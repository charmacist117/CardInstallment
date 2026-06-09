export const INDUSTRY_CATALOG = [
  { id: "all", label: "전체/일반" },
  { id: "tax", label: "국세/지방세" },
  { id: "tax_other", label: "기타 세액납부" },
  { id: "hospital", label: "병원/의원/치과/한의원" },
  { id: "pharmacy", label: "약국" },
  { id: "pharma_wholesale", label: "제약회사/의약품도매" },
  { id: "appliance", label: "가전제품" },
  { id: "vehicle_purchase", label: "차량 구매" },
  { id: "education", label: "학원/교육" },
  { id: "auto", label: "자동차/보험" },
  { id: "shopping", label: "쇼핑/생활편의" }
];

export const VISIBLE_INDUSTRY_ORDER = [
  "pharmacy",
  "pharma_wholesale",
  "appliance",
  "vehicle_purchase",
  "tax",
  "tax_other"
];

export const VISIBLE_INDUSTRY_IDS = new Set(VISIBLE_INDUSTRY_ORDER);
