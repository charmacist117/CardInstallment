const FALLBACK_INDUSTRIES = [
  { id: "all", label: "전체/일반" },
  { id: "tax", label: "국세/지방세" },
  { id: "hospital", label: "병원/의원/치과/한의원" },
  { id: "pharmacy", label: "약국" },
  { id: "education", label: "학원/교육" },
  { id: "auto", label: "자동차/보험" },
  { id: "shopping", label: "쇼핑/생활편의" }
];

const SOURCE_NOTE =
  "공식 업종별 세부 조건을 자동 확인하지 못했습니다. 원문 확인이 필요합니다.";

const UNCONFIRMED = {
  noInterestMonths: [],
  partialMonths: [],
  minimumAmount: "원문 확인 필요",
  notes: [SOURCE_NOTE]
};

const VERIFIED_INDUSTRIES = {
  kb: [
    {
      id: "all",
      label: "전체/일반",
      noInterestMonths: ["2~5개월"],
      partialMonths: [],
      minimumAmount: "원문 확인 필요",
      notes: ["공식 이벤트 목록에서 무이자/할부 관련 이벤트가 확인되었습니다."]
    },
    {
      id: "tax",
      label: "국세/지방세",
      noInterestMonths: [],
      partialMonths: ["국세·지방세 부분 무이자할부"],
      minimumAmount: "원문 확인 필요",
      notes: [
        "KB국민카드 공식 이벤트 목록에서 '국세·지방세 부분 무이자할부!' 이벤트가 확인되었습니다."
      ]
    },
    { id: "hospital", label: "병원/의원/치과/한의원", ...UNCONFIRMED },
    { id: "pharmacy", label: "약국", ...UNCONFIRMED },
    { id: "education", label: "학원/교육", ...UNCONFIRMED },
    {
      id: "auto",
      label: "자동차/보험",
      noInterestMonths: ["주유권+5개월 무이자할부"],
      partialMonths: ["최대 60개월 슬림 할부"],
      minimumAmount: "원문 확인 필요",
      notes: [
        "KB국민카드 공식 이벤트 목록에서 자동차보험 및 신차 할부 이벤트가 확인되었습니다."
      ]
    },
    {
      id: "shopping",
      label: "쇼핑/생활편의",
      noInterestMonths: ["생활편의업종 무이자할부"],
      partialMonths: [],
      minimumAmount: "원문 확인 필요",
      notes: [
        "KB국민카드 공식 이벤트 목록에서 '생활편의업종 무이자할부' 이벤트가 확인되었습니다."
      ]
    }
  ],

  shinhan: [
    {
      id: "all",
      label: "전체/일반",
      noInterestMonths: ["2~7개월", "2~5개월", "2~3개월"],
      partialMonths: [
        "7개월",
        "9개월",
        "10개월",
        "11개월",
        "12개월",
        "18개월",
        "23개월",
        "24개월"
      ],
      minimumAmount: "5만원 이상",
      notes: ["공식 무이자할부 안내 페이지에서 확인된 대표 조건입니다."]
    },
    {
      id: "tax",
      label: "국세/지방세",
      noInterestMonths: ["2~7개월"],
      partialMonths: ["10개월", "12개월", "18개월", "24개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "국세는 10/12/18/24개월 슬림할부, 지방세는 10/12개월 슬림할부가 표시됩니다."
      ]
    },
    {
      id: "hospital",
      label: "병원/의원/치과/한의원",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["7개월", "9개월", "11개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "공식 페이지에서 종합병원과 일반병원 모두 2~3개월 무이자 및 7/9/11개월 슬림할부가 확인되었습니다. 일반병원에는 개인병원, 치과병원, 한의원 등이 포함됩니다."
      ]
    },
    {
      id: "pharmacy",
      label: "약국",
      noInterestMonths: ["2~3개월"],
      partialMonths: [],
      minimumAmount: "5만원 이상",
      notes: ["신한카드 공식 페이지에서 약국 2~3개월 무이자할부가 확인되었습니다."]
    },
    {
      id: "education",
      label: "학원/교육",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["10개월", "12개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "학원은 2~3개월, 대학등록금은 2~3개월 및 10/12개월 슬림할부가 표시됩니다."
      ]
    },
    {
      id: "auto",
      label: "자동차/보험",
      noInterestMonths: ["2~5개월", "2~3개월"],
      partialMonths: ["7개월", "9개월", "10개월", "11개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "손해보험은 2~5개월 및 7/9/11개월 슬림할부, 차량정비는 2~3개월 및 10개월 슬림할부가 표시됩니다."
      ]
    },
    {
      id: "shopping",
      label: "쇼핑/생활편의",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["7개월", "9개월", "11개월", "23개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "온라인 쇼핑은 2~3개월 무이자 및 7/9/11/23개월 슬림할부가 확인되었습니다."
      ]
    }
  ],

  samsung: [
    {
      id: "all",
      label: "전체/일반",
      noInterestMonths: ["2~5개월", "2~3개월"],
      partialMonths: [
        "6개월",
        "7개월",
        "10개월",
        "11개월",
        "12개월",
        "18개월",
        "23개월",
        "24개월"
      ],
      minimumAmount: "5만원 이상",
      notes: ["공식 무이자할부 가맹점 페이지에서 확인된 대표 조건입니다."]
    },
    {
      id: "tax",
      label: "국세/지방세",
      noInterestMonths: [],
      partialMonths: [],
      minimumAmount: "원문 확인 필요",
      notes: [
        "삼성카드 공식 업종표에는 국세/지방세 조건이 확인되지 않았습니다."
      ]
    },
    {
      id: "hospital",
      label: "병원/의원/치과/한의원",
      noInterestMonths: ["2~5개월"],
      partialMonths: ["7개월", "11개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "공식 페이지에서 병원 2~5개월 무이자할부가 확인되었습니다. 병원이 포함된 묶음 업종에는 7/11개월 다이어트 할부가 표시됩니다."
      ]
    },
    {
      id: "pharmacy",
      label: "약국",
      noInterestMonths: ["2~3개월"],
      partialMonths: [],
      minimumAmount: "5만원 이상",
      notes: ["삼성카드 공식 페이지에서 약국 2~3개월 무이자할부가 확인되었습니다."]
    },
    {
      id: "education",
      label: "학원/교육",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["6개월", "10개월", "12개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "학원은 2~3개월, 대학등록금은 2~3개월 및 6/10/12개월 다이어트 할부가 표시됩니다."
      ]
    },
    {
      id: "auto",
      label: "자동차/보험",
      noInterestMonths: ["2~5개월"],
      partialMonths: ["7개월", "11개월", "18개월", "24개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "자동차보험은 2~5개월 무이자 및 7/11/18/24개월 다이어트 할부가 표시됩니다."
      ]
    },
    {
      id: "shopping",
      label: "쇼핑/생활편의",
      noInterestMonths: ["2~5개월", "2~3개월", "10개월"],
      partialMonths: ["7개월", "11개월", "23개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "아울렛, 백화점, 대형마트, 온라인쇼핑몰 등은 업종별로 2~5개월 또는 2~3개월 무이자가 표시됩니다. 백화점 10개월은 100만원 이상 조건입니다."
      ]
    }
  ],

  lotte: [
    {
      id: "all",
      label: "전체/일반",
      noInterestMonths: ["2~5개월"],
      partialMonths: ["10개월", "12개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "공식 이벤트 상세에서 생활 플러스 업종 2~5개월 무이자 할부가 확인되었습니다."
      ]
    },
    { id: "tax", label: "국세/지방세", ...UNCONFIRMED },
    {
      id: "hospital",
      label: "병원/의원/치과/한의원",
      noInterestMonths: ["2~5개월"],
      partialMonths: ["10개월", "12개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "롯데카드 공식 이벤트 상세에서 종합병원 업종이 생활 플러스 2~5개월 무이자 할부 대상에 포함된 것으로 확인되었습니다."
      ]
    },
    { id: "pharmacy", label: "약국", ...UNCONFIRMED },
    { id: "education", label: "학원/교육", ...UNCONFIRMED },
    {
      id: "auto",
      label: "자동차/보험",
      noInterestMonths: ["2~5개월"],
      partialMonths: ["10개월", "12개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "롯데카드 공식 이벤트 상세에서 여행사·항공사/손해보험 업종이 대상에 포함된 것으로 확인되었습니다."
      ]
    },
    {
      id: "shopping",
      label: "쇼핑/생활편의",
      noInterestMonths: ["2~5개월"],
      partialMonths: ["10개월", "12개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "롯데카드 공식 이벤트 상세에서 전자상거래 업종이 대상에 포함된 것으로 확인되었습니다."
      ]
    }
  ]
};

VERIFIED_INDUSTRIES.hana = [
  {
    id: "all",
    label: "전체/일반",
    noInterestMonths: ["2~3개월"],
    partialMonths: ["6개월", "10개월", "12개월", "18개월"],
    minimumAmount: "5만원 이상",
    notes: [
      "하나카드 공식 이벤트/납부 안내에서 확인 가능한 대표 조건입니다. 업종별 적용 여부는 원문 확인이 필요합니다."
    ]
  },
  {
    id: "tax",
    label: "국세/지방세",
    noInterestMonths: [],
    partialMonths: ["6개월", "10개월", "12개월"],
    minimumAmount: "원문 확인 필요",
    notes: [
      "하나카드 공식 이벤트 상세에서 국세/지방세 6/10/12개월 부분 무이자할부가 확인되었습니다."
    ]
  },
  { id: "hospital", label: "병원/의원/치과/한의원", ...UNCONFIRMED },
  { id: "pharmacy", label: "약국", ...UNCONFIRMED },
  {
    id: "education",
    label: "학원/교육",
    noInterestMonths: ["2~3개월"],
    partialMonths: ["6개월", "10개월", "15개월"],
    minimumAmount: "5만원 이상",
    notes: [
      "하나카드 공식 대학등록금 납부 안내에서 2~3개월 전액 무이자 또는 6/10/15개월 부분 무이자가 확인되었습니다. 일반 학원 업종은 원문 확인이 필요합니다."
    ]
  },
  { id: "auto", label: "자동차/보험", ...UNCONFIRMED },
  { id: "shopping", label: "쇼핑/생활편의", ...UNCONFIRMED }
];

VERIFIED_INDUSTRIES.bc = [
  {
    id: "all",
    label: "전체/일반",
    noInterestMonths: ["2~5개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    notes: [
      "페이북 공식 업종별 무이자할부 안내에서 대상 업종 5만원 이상 결제 시 2~5개월 무이자 혜택이 확인되었습니다."
    ]
  },
  {
    id: "tax",
    label: "국세/지방세",
    noInterestMonths: ["2~3개월"],
    partialMonths: ["6개월", "10개월", "12개월"],
    minimumAmount: "5만원 이상",
    notes: [
      "페이북 공식 세금 업종 이벤트에서 국세/지방세 2~3개월 무이자 및 6/10/12개월 부분 무이자가 확인되었습니다. 일부 발급 은행은 제외될 수 있습니다."
    ]
  },
  { id: "hospital", label: "병원/의원/치과/한의원", ...UNCONFIRMED },
  { id: "pharmacy", label: "약국", ...UNCONFIRMED },
  { id: "education", label: "학원/교육", ...UNCONFIRMED },
  { id: "auto", label: "자동차/보험", ...UNCONFIRMED },
  {
    id: "shopping",
    label: "쇼핑/생활편의",
    noInterestMonths: ["2~5개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    notes: [
      "페이북 공식 업종별 무이자할부 안내에서 대상 업종 2~5개월 무이자가 확인되었습니다. 세부 대상 업종 이미지는 서버 텍스트로 확인되지 않아 원문 확인을 권장합니다."
    ]
  }
];

export function getIndustryPolicies(cardId, fallback) {
  if (VERIFIED_INDUSTRIES[cardId]) {
    return VERIFIED_INDUSTRIES[cardId];
  }

  return FALLBACK_INDUSTRIES.map((industry) => {
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
