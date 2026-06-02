const COMMON_INDUSTRIES = [
  {
    id: "all",
    label: "전체/일반",
    noInterestMonths: [],
    partialMonths: [],
    minimumAmount: "",
    notes: ["카드사 공통 또는 대표 조건입니다."]
  },
  {
    id: "tax",
    label: "국세/지방세",
    noInterestMonths: [],
    partialMonths: ["10개월", "12개월"],
    minimumAmount: "5만원 이상",
    notes: ["세금 업종은 일반 무이자보다 부분무이자가 적용되는 경우가 많습니다."]
  },
  {
    id: "hospital",
    label: "병원/의료",
    noInterestMonths: ["2~3개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    notes: ["가맹점 및 병원 업종 분류에 따라 적용 여부가 달라질 수 있습니다."]
  },
  {
    id: "education",
    label: "학원/교육",
    noInterestMonths: ["2~3개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    notes: ["일부 교육 업종은 별도 이벤트로 운영됩니다."]
  },
  {
    id: "auto",
    label: "자동차/보험",
    noInterestMonths: ["2~5개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    notes: ["자동차, 보험 이벤트는 카드사별 별도 조건이 많습니다."]
  },
  {
    id: "shopping",
    label: "쇼핑/생활편의",
    noInterestMonths: ["2~5개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    notes: ["온라인몰, 백화점, 마트 등 가맹점별 예외가 있을 수 있습니다."]
  }
];

const OVERRIDES = {
  shinhan: {
    tax: { partialMonths: ["7개월", "9개월", "11개월", "23개월"] },
    hospital: { noInterestMonths: ["2~3개월"] },
    education: { noInterestMonths: ["2~3개월"] },
    shopping: { noInterestMonths: ["2~5개월"] }
  },
  kb: {
    tax: {
      noInterestMonths: [],
      partialMonths: ["10개월", "12개월", "18개월"],
      notes: ["공식 이벤트 목록에서 국세·지방세 부분 무이자할부가 감지되었습니다."]
    },
    auto: {
      noInterestMonths: ["5개월"],
      partialMonths: ["60개월 슬림 할부"],
      notes: ["공식 이벤트 목록에서 자동차보험 및 신차 할부 이벤트가 감지되었습니다."]
    },
    shopping: {
      noInterestMonths: ["2~5개월"],
      notes: ["공식 이벤트 목록에서 생활편의업종 무이자할부가 감지되었습니다."]
    }
  },
  hyundai: {
    tax: { partialMonths: ["8개월", "10개월", "12개월"] },
    shopping: { noInterestMonths: ["2~5개월"] }
  },
  samsung: {
    tax: { noInterestMonths: [], partialMonths: [] },
    hospital: { noInterestMonths: ["2~3개월"] },
    shopping: { noInterestMonths: ["2~5개월"] }
  },
  lotte: {
    shopping: { noInterestMonths: ["2~5개월"] }
  },
  hana: {
    tax: { partialMonths: ["6개월", "10개월", "12개월"] },
    shopping: { noInterestMonths: ["2~5개월"] }
  },
  bc: {
    tax: { partialMonths: ["10개월", "12개월"] },
    shopping: { noInterestMonths: ["2~6개월"] }
  },
  woori: {
    tax: { partialMonths: ["10개월", "12개월"] },
    shopping: { noInterestMonths: ["2~6개월"] }
  },
  ibk: {
    shopping: { noInterestMonths: ["2~3개월"] }
  }
};

function mergePolicy(base, override = {}) {
  return {
    ...base,
    ...override,
    notes: [...(base.notes || []), ...(override.notes || [])]
  };
}

export function getIndustryPolicies(cardId, fallback) {
  return COMMON_INDUSTRIES.map((industry) => {
    const base = {
      ...industry,
      noInterestMonths: industry.noInterestMonths.length
        ? industry.noInterestMonths
        : fallback.noInterestMonths,
      partialMonths: industry.partialMonths.length
        ? industry.partialMonths
        : fallback.partialMonths,
      minimumAmount: industry.minimumAmount || fallback.minimumAmount
    };

    if (industry.id === "all") {
      return {
        ...base,
        noInterestMonths: fallback.noInterestMonths,
        partialMonths: fallback.partialMonths,
        minimumAmount: fallback.minimumAmount
      };
    }

    return mergePolicy(base, OVERRIDES[cardId]?.[industry.id]);
  });
}
