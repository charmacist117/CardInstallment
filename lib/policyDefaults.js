import { INDUSTRY_CATALOG } from "./industryCatalog.js";

const SOURCE_NOTE =
  "공식 업종별 세부 조건을 자동 확인하지 못했습니다. 원문 확인이 필요합니다.";

export const UNCONFIRMED = {
  noInterestMonths: [],
  partialMonths: [],
  minimumAmount: "원문 확인 필요",
  notes: [SOURCE_NOTE]
};

export const NOT_FOUND_PHARMACY = {
  noInterestMonths: [],
  partialMonths: [],
  minimumAmount: "없음",
  notes: ["공식 페이지에 접속해 확인했지만 약국 관련 무이자할부 조건을 찾지 못했습니다."]
};

export const NOT_FOUND_PHARMA_WHOLESALE = {
  noInterestMonths: [],
  partialMonths: [],
  minimumAmount: "없음",
  notes: [
    "공식 페이지에 접속해 확인했지만 제약회사 관련 무이자할부 조건을 찾지 못했습니다."
  ]
};

const NOT_FOUND_APPLIANCE = {
  noInterestMonths: [],
  partialMonths: [],
  minimumAmount: "없음",
  notes: [
    "공식 페이지에 접속해 확인했지만 가전제품 업종 관련 무이자할부 조건을 찾지 못했습니다."
  ]
};

const NOT_FOUND_VEHICLE_PURCHASE = {
  noInterestMonths: [],
  partialMonths: [],
  minimumAmount: "없음",
  notes: [
    "공식 월간 업종별 무이자할부 페이지에서 차량 구매(신차/중고차) 관련 무이자할부 조건을 찾지 못했습니다.",
    "차량 구매는 카드사별 오토할부, 오토캐시백 등 별도 금융상품으로 운영될 수 있어 일반 업종별 무이자할부 조건과 구분됩니다."
  ]
};

export const NOT_FOUND_TAX = {
  noInterestMonths: [],
  partialMonths: [],
  minimumAmount: "없음",
  notes: ["공식 페이지에 접속해 확인했지만 국세/지방세 관련 무이자할부 조건을 찾지 못했습니다."]
};

const NOT_FOUND_OTHER_TAX = {
  noInterestMonths: [],
  partialMonths: [],
  minimumAmount: "없음",
  notes: [
    "공식 페이지에 접속해 확인했지만 국세/지방세 외 기타 세액납부 관련 무이자할부 조건을 찾지 못했습니다."
  ]
};

const TAX_FEE_NOTE =
  "수수료 안내: 국세는 카드 납부 시 납부대행수수료가 납세자 부담으로 부과됩니다. 국세청 안내 기준 신용카드는 납부세액의 0.4~0.8%, 체크카드는 0.15~0.5% 범위가 적용됩니다. 지방세는 일반적으로 카드 납부대행수수료가 없지만, 할부수수료나 은행 CD/ATM 타행 이용수수료 등은 납부 채널에 따라 별도로 발생할 수 있습니다.";

const OTHER_TAX_FEE_NOTE =
  "수수료 안내: 기타 세액납부는 항목별 수수료 기준이 다릅니다. 4대보험은 카드 납부 시 신용카드 0.8%, 체크카드 0.5% 납부대행수수료가 납부자 부담으로 가산됩니다. 관세는 카드 납부 시 납부대행수수료가 납세자 부담으로 부과될 수 있으며, 환경개선부담금·세외수입 등은 납부 채널별 수수료를 별도 확인해야 합니다.";

export function buildFallbackPolicies(fallback) {
  return INDUSTRY_CATALOG.map((industry) => {
    if (industry.id === "all") {
      return {
        ...industry,
        noInterestMonths: fallback.noInterestMonths || [],
        partialMonths: fallback.partialMonths || [],
        minimumAmount: fallback.minimumAmount || "원문 확인 필요",
        notes: [
          "카드사 대표 조건입니다. 업종별 세부 조건은 원문 확인이 필요합니다."
        ]
      };
    }

    return {
      ...industry,
      ...UNCONFIRMED
    };
  });
}

function applyIndustryOverrides(basePolicies, overrides = []) {
  if (!overrides.length) return basePolicies;

  const overrideMap = new Map(overrides.map((industry) => [industry.id, industry]));
  return basePolicies.map((industry) => ({
    ...industry,
    ...(overrideMap.get(industry.id) || {})
  }));
}

function isConfirmedNoResult(industry) {
  return (
    industry?.minimumAmount === "없음" &&
    !industry?.noInterestMonths?.length &&
    !industry?.partialMonths?.length
  );
}

function createSplitTaxPolicy(taxPolicy, id, label) {
  if (isConfirmedNoResult(taxPolicy)) {
    return {
      id,
      label,
      ...NOT_FOUND_TAX,
      notes: [
        `공식 페이지에 접속해 확인했지만 ${label} 관련 무이자할부 조건을 찾지 못했습니다.`
      ],
      sourceUrl: taxPolicy.sourceUrl
    };
  }

  return {
    ...taxPolicy,
    id,
    label,
    notes: [
      ...(taxPolicy.notes || []),
      `${label} 항목으로 분리 표시했습니다.`
    ]
  };
}

function expandTaxCategories(policies) {
  const taxPolicy = policies.find((industry) => industry.id === "tax");
  if (!taxPolicy) return policies;

  const existingIds = new Set(policies.map((industry) => industry.id));
  const splitPolicies = [
    existingIds.has("tax_national")
      ? null
      : createSplitTaxPolicy(taxPolicy, "tax_national", "국세"),
    existingIds.has("tax_local")
      ? null
      : createSplitTaxPolicy(taxPolicy, "tax_local", "지방세"),
    existingIds.has("tax_other")
      ? null
      : {
          id: "tax_other",
          label: "기타 세액납부",
          ...NOT_FOUND_OTHER_TAX,
          sourceUrl: taxPolicy.sourceUrl
        }
  ].filter(Boolean);

  return [...policies, ...splitPolicies];
}

function appendFeeNotes(policies) {
  return policies.map((industry) => {
    if (industry.id === "tax") {
      return {
        ...industry,
        notes: [...(industry.notes || []), TAX_FEE_NOTE]
      };
    }

    if (industry.id === "tax_other") {
      return {
        ...industry,
        notes: [...(industry.notes || []), OTHER_TAX_FEE_NOTE]
      };
    }

    return industry;
  });
}

function ensureVisibleCategoryPolicies(policies) {
  const visibleDefaults = [
    {
      id: "pharma_wholesale",
      label: "제약회사",
      fallback: NOT_FOUND_PHARMA_WHOLESALE
    },
    {
      id: "appliance",
      label: "가전제품",
      fallback: NOT_FOUND_APPLIANCE
    },
    {
      id: "vehicle_purchase",
      label: "차량 구매",
      fallback: NOT_FOUND_VEHICLE_PURCHASE
    }
  ];

  const policyMap = new Map(policies.map((industry) => [industry.id, industry]));

  for (const item of visibleDefaults) {
    const current = policyMap.get(item.id);
    if (!current) {
      policyMap.set(item.id, {
        id: item.id,
        label: item.label,
        ...item.fallback
      });
      continue;
    }

    if (
      current.minimumAmount === "원문 확인 필요" &&
      !current.noInterestMonths?.length &&
      !current.partialMonths?.length
    ) {
      policyMap.set(item.id, {
        ...current,
        ...item.fallback
      });
    }
  }

  return [...policyMap.values()];
}

export function finalizeIndustryPolicies(basePolicies, overrides = []) {
  return appendFeeNotes(
    ensureVisibleCategoryPolicies(
      expandTaxCategories(applyIndustryOverrides(basePolicies, overrides))
    )
  );
}
