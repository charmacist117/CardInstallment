const FALLBACK_INDUSTRIES = [
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

const SOURCE_NOTE =
  "공식 업종별 세부 조건을 자동 확인하지 못했습니다. 원문 확인이 필요합니다.";

const UNCONFIRMED = {
  noInterestMonths: [],
  partialMonths: [],
  minimumAmount: "원문 확인 필요",
  notes: [SOURCE_NOTE]
};

const NOT_FOUND_PHARMACY = {
  noInterestMonths: [],
  partialMonths: [],
  minimumAmount: "없음",
  notes: ["공식 페이지에 접속해 확인했지만 약국 관련 무이자할부 조건을 찾지 못했습니다."]
};

const NOT_FOUND_PHARMA_WHOLESALE = {
  noInterestMonths: [],
  partialMonths: [],
  minimumAmount: "없음",
  notes: [
    "공식 페이지에 접속해 확인했지만 제약회사/의약품도매 관련 무이자할부 조건을 찾지 못했습니다."
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

const NOT_FOUND_TAX = {
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

const VERIFIED_INDUSTRIES = {
  kb: [
    {
      id: "all",
      label: "전체/일반",
      noInterestMonths: ["2~5개월", "2~3개월"],
      partialMonths: ["6개월", "10개월", "12개월", "18개월", "24개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "KB국민카드 공식 생활편의업종 무이자할부 상세 페이지에서 업종별 2~5개월 또는 2~3개월 무이자할부와 부분무이자 조건을 확인했습니다."
      ]
    },
    {
      id: "tax",
      label: "국세/지방세",
      noInterestMonths: [],
      partialMonths: ["6개월", "10개월", "12개월"],
      minimumAmount: "5만원 이상",
      sourceUrl:
        "https://card.kbcard.com/SVC/DVIEW/HBBMCXCRVZZC0026",
      notes: [
        "KB국민카드 공식 이벤트 목록에서 국세·지방세 6/10/12개월 부분무이자할부 이벤트가 확인되었습니다."
      ]
    },
    {
      id: "hospital",
      label: "병원/의원/치과/한의원",
      noInterestMonths: ["2~5개월"],
      partialMonths: ["6개월", "10개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "KB국민카드 생활편의업종 상세 페이지에서 종합병원, 일반·치과·한방병원/한의원, 건강진단센터, 산후조리원이 2~5개월 무이자 및 6/10개월 부분무이자 대상임을 확인했습니다."
      ]
    },
    {
      id: "pharmacy",
      label: "약국",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["6개월", "10개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "KB국민카드 생활편의업종 상세 페이지에서 기타의료 업종의 약국이 2~3개월 무이자할부 대상임을 확인했습니다."
      ]
    },
    {
      id: "pharma_wholesale",
      label: "제약회사/의약품도매",
      ...NOT_FOUND_PHARMA_WHOLESALE,
      notes: [
        "KB국민카드 공통 업종별 무이자할부 기준에서는 제약회사/의약품도매 관련 무이자할부 조건을 찾지 못했습니다."
      ]
    },
    {
      id: "appliance",
      label: "가전제품",
      noInterestMonths: ["2~3개월"],
      partialMonths: [],
      minimumAmount: "5만원 이상",
      sourceUrl:
        "https://card.kbcard.com/BON/DVIEW/HBBMCXCRVNEC0001?mainCC=a&eventNum=1001152",
      notes: [
        "KB국민카드 생활편의업종 무이자할부 상세 페이지에서 가전 업종이 2~3개월 무이자할부 대상임을 확인했습니다."
      ]
    },
    {
      id: "education",
      label: "학원/교육",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["6개월", "10개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "KB국민카드 생활편의업종 상세 페이지에서 학원, 학습지 업종이 2~3개월 무이자할부 대상임을 확인했습니다. 문화센터는 제외됩니다."
      ]
    },
    {
      id: "auto",
      label: "자동차/보험",
      noInterestMonths: ["2~5개월", "2~3개월"],
      partialMonths: ["6개월", "10개월", "12개월", "18개월", "24개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "KB국민카드 생활편의업종 상세 페이지에서 손해보험은 2~5개월 무이자 및 6/10/12/18/24개월 부분무이자, 차량정비·부품·인테리어는 2~3개월 무이자 대상임을 확인했습니다."
      ]
    },
    {
      id: "shopping",
      label: "쇼핑/생활편의",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["6개월", "10개월", "12개월", "18개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "KB국민카드 생활편의업종 상세 페이지에서 온라인 쇼핑, 백화점/대형쇼핑센터/일반잡화판매점, 할인점, 여행, 가전, 의류, 안경점, 의료기기 및 용품 등이 2~3개월 무이자할부 대상임을 확인했습니다."
      ]
    }
  ],

  hyundai: [
    {
      id: "all",
      label: "전체/일반",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["10개월", "12개월", "18개월", "24개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "현대카드 공식 가맹점 업종별 무이자/부분 무이자 할부 상세 페이지에서 5만원 이상 결제 시 대상 업종별 최대 3개월 무이자 및 최대 24개월 부분무이자 조건을 확인했습니다."
      ]
    },
    {
      id: "tax",
      label: "국세/지방세",
      noInterestMonths: [],
      partialMonths: ["6개월", "10개월", "12개월"],
      minimumAmount: "5만원 이상",
      sourceUrl:
        "https://card.hyundaicard.com/magazine/%ED%98%84%EB%8C%80%EC%B9%B4%EB%93%9C-%EB%AC%B4%EC%9D%B4%EC%9E%90-%ED%95%A0%EB%B6%80-%EC%9D%B4%EB%B2%A4%ED%8A%B8-%EC%B4%9D%EC%A0%95%EB%A6%AC-%EC%97%85%EC%A2%85%EB%B3%84-%EB%AC%B4%EC%9D%B4%EC%9E%90-%ED%95%A0%EB%B6%80-%ED%99%95%EC%9D%B8%ED%95%98%EA%B8%B0.hdc",
      notes: [
        "현대카드 공식 무이자 할부 이벤트 안내에서 세금 납부 시 6/10/12개월 부분무이자할부 조건을 확인했습니다."
      ]
    },
    {
      id: "tax_other",
      label: "기타 세액납부",
      noInterestMonths: [],
      partialMonths: ["6개월", "10개월", "12개월"],
      minimumAmount: "5만원 이상",
      sourceUrl:
        "https://www.hyundaicard.com/cpb/ev/CPBEV0101_06.hc?bnftWebEvntCd=208407&searchWord=",
      notes: [
        "기타 세액납부 포함 항목: 관세, 환경개선부담금.",
        "현대카드 공식 세금 납부 부분무이자 이벤트에서 관세와 환경개선부담금이 적용 대상에 포함된 것으로 확인했습니다."
      ]
    },
    {
      id: "hospital",
      label: "병원/의원/치과/한의원",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["10개월", "12개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "현대카드 공식 상세 페이지에서 병원(종합/일반/동물/한의원)이 2~3개월 무이자 및 10/12개월 부분무이자 대상 업종으로 확인됐습니다. 약국은 해당 병원 업종 표기에 포함되지 않았습니다."
      ]
    },
    {
      id: "pharmacy",
      label: "약국",
      noInterestMonths: [],
      partialMonths: [],
      minimumAmount: "없음",
      notes: [
        "현대카드 공식 가맹점 업종별 무이자/부분 무이자 할부 상세 페이지에 접속해 확인했지만 약국 관련 무이자할부 조건을 찾지 못했습니다."
      ]
    },
    {
      id: "appliance",
      label: "가전제품",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["10개월", "12개월"],
      minimumAmount: "5만원 이상",
      sourceUrl:
        "https://www.hyundaicard.com/cpb/ev/CPBEV0101_06.hc?bnftWebEvntCd=XJO693&searchWord=",
      notes: [
        "현대카드 공식 가맹점 업종별 무이자/부분 무이자 할부 상세 페이지에서 가전 업종이 2~3개월 무이자 및 10/12개월 부분무이자 대상임을 확인했습니다."
      ]
    },
    {
      id: "education",
      label: "학원/교육",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["10개월", "12개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "현대카드 공식 상세 페이지에서 학원 업종이 2~3개월 무이자 및 10/12개월 부분무이자 대상 업종으로 확인됐습니다."
      ]
    },
    {
      id: "auto",
      label: "자동차/보험",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["10개월", "12개월", "18개월", "24개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "현대카드 공식 상세 페이지에서 손해보험은 2~3개월 무이자 및 10/12/18/24개월 부분무이자, 자동차 정비는 2~3개월 무이자 및 10/12개월 부분무이자 대상 업종으로 확인됐습니다."
      ]
    },
    {
      id: "shopping",
      label: "쇼핑/생활편의",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["10개월", "12개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "현대카드 공식 상세 페이지에서 온라인, 항공/면세점/여행, 백화점, 의류, 가전, 대형마트 등이 업종별 2~3개월 무이자 대상 업종으로 확인됐습니다. 일부 온라인몰은 1만원 이상 결제 시 적용됩니다."
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
      noInterestMonths: [],
      partialMonths: ["6개월", "10개월", "12개월"],
      minimumAmount: "5만원 이상",
      sourceUrl:
        "https://www.shinhancard.com/pconts/html/benefit/franchise/MOBFM04030/MOBFM04030C01.html?crustMenuId=ms126",
      notes: [
        "신한카드 공식 6월 무이자할부 안내에서 국세/지방세 업종의 슬림할부 6/10/12개월 조건을 확인했습니다."
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
      id: "appliance",
      label: "가전제품",
      noInterestMonths: ["2~3개월"],
      partialMonths: [],
      minimumAmount: "5만원 이상",
      sourceUrl:
        "https://www.shinhancard.com/pconts/html/benefit/franchise/MOBFM04030/MOBFM04030C01.html?crustMenuId=ms126",
      notes: [
        "신한카드 공식 업종별 무이자할부 안내에서 가전 업종이 2~3개월 무이자할부 대상임을 확인했습니다."
      ]
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
      ...NOT_FOUND_TAX,
      notes: [
        "삼성카드 공식 업종별 무이자할부 안내와 6월 무이자할부 안내에서 세금 업종은 제외 또는 별도 조건 미확인으로 확인했습니다."
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
      id: "appliance",
      label: "가전제품",
      noInterestMonths: ["2~3개월"],
      partialMonths: ["7개월", "11개월"],
      minimumAmount: "5만원 이상",
      sourceUrl:
        "https://www.samsungcard.com/personal/services/merchant/free-install/UHPPBE0701M0.jsp?click=gnb_benefit_free",
      notes: [
        "삼성카드 공식 무이자할부 가맹점 안내에서 가전 업종이 2~3개월 무이자할부 및 7/11개월 다이어트할부 대상임을 확인했습니다."
      ]
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
        "롯데카드 진행이벤트 목록에서 '생활 플러스 업종' 키워드로 확인되는 공식 상세 페이지 기준입니다. 2026.04.01~2026.06.30 기간 동안 5만원 이상 이용 시 대상 업종 2~5개월 무이자할부가 확인되었습니다."
      ]
    },
    {
      id: "tax",
      label: "국세/지방세",
      ...NOT_FOUND_TAX,
      notes: [
        "롯데카드 공식 생활 플러스 업종 무이자할부 페이지에 접속해 확인했지만 국세/지방세 관련 무이자할부 조건을 찾지 못했습니다."
      ]
    },
    {
      id: "hospital",
      label: "병원/의원/치과/한의원",
      noInterestMonths: ["2~5개월"],
      partialMonths: ["10개월", "12개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "롯데카드 생활 플러스 업종 상세 페이지에서 종합병원 업종이 2~5개월 무이자할부 대상에 포함된 것으로 확인되었습니다."
      ]
    },
    {
      id: "pharmacy",
      label: "약국",
      noInterestMonths: [],
      partialMonths: [],
      minimumAmount: "없음",
      notes: [
        "롯데카드 공식 페이지에 접속해 확인했지만 약국 관련 무이자할부 조건을 찾지 못했습니다."
      ]
    },
    {
      id: "education",
      label: "학원/교육",
      noInterestMonths: [],
      partialMonths: [],
      minimumAmount: "없음",
      notes: [
        "롯데카드 생활 플러스 업종 상세 페이지에 접속해 확인했지만 학원/교육 관련 무이자할부 조건을 찾지 못했습니다."
      ]
    },
    {
      id: "auto",
      label: "자동차/보험",
      noInterestMonths: ["2~5개월"],
      partialMonths: ["10개월", "12개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "롯데카드 생활 플러스 업종 상세 페이지에서 여행사·항공사 및 손해보험 업종이 2~5개월 무이자할부 대상에 포함된 것으로 확인되었습니다. 차량정비/자동차부품 업종은 해당 페이지에서 확인되지 않았습니다."
      ]
    },
    {
      id: "shopping",
      label: "쇼핑/생활편의",
      noInterestMonths: ["2~5개월"],
      partialMonths: ["10개월", "12개월"],
      minimumAmount: "5만원 이상",
      notes: [
        "롯데카드 생활 플러스 업종 상세 페이지에서 전자상거래 업종이 2~5개월 무이자할부 대상에 포함된 것으로 확인되었습니다. 유니클로, 자라 매장 결제 및 도시가스 결제는 제외됩니다."
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
    minimumAmount: "5만원 이상",
    sourceUrl:
      "https://www.hanacard.co.kr/OPP35250001D.web?schID=mcd&mID=OPP35250000D&AN_NO=14434",
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
    noInterestMonths: ["2~5개월", "2~4개월", "2~3개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    notes: [
      "페이북 공식 업종별 무이자할부 이미지 표에서 업종별로 2~5개월, 2~4개월, 2~3개월 무이자 대상이 나뉘어 있음을 확인했습니다."
    ]
  },
  {
    id: "tax",
    label: "국세/지방세",
    noInterestMonths: ["2~3개월"],
    partialMonths: ["6개월", "10개월", "12개월"],
    minimumAmount: "5만원 이상",
    sourceUrl:
      "https://web.paybooc.co.kr/web/evnt/evnt-dts?pybcUnifEvntNo=2026030037",
    notes: [
      "페이북 공식 세금 업종 이벤트에서 국세/지방세 2~3개월 무이자 및 6/10/12개월 부분 무이자가 확인되었습니다. 일부 발급 은행은 제외될 수 있습니다."
    ]
  },
  {
    id: "tax_other",
    label: "기타 세액납부",
    noInterestMonths: ["2~3개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    sourceUrl:
      "https://web.paybooc.co.kr/web/evnt/evnt-dts?evntMrktTypCd=&ingPositionTop=1466&ordering=RECENT&pybcUnifEvntNo=2026030035",
    notes: [
      "기타 세액납부 포함 항목: 4대보험.",
      "페이북 공식 업종별 무이자할부 이벤트 유의사항에서 4대보험 업종이 무이자할부 적용 대상 업종으로 확인됩니다. iM뱅크와 우리/우리BC 등 일부 발급사는 제외될 수 있습니다."
    ]
  },
  {
    id: "hospital",
    label: "병원/의원/치과/한의원",
    noInterestMonths: ["2~5개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    notes: [
      "페이북 공식 업종별 무이자할부 이미지 표에서 종합병원, 병원, 의원, 한의원, 치과의원, 치과병원, 한방병원 등이 2~5개월 대상 업종으로 확인됐습니다."
    ]
  },
  {
    id: "pharmacy",
    label: "약국",
    noInterestMonths: ["2~3개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    notes: [
      "페이북 공식 업종별 무이자할부 이미지 표의 2~3개월 대상 업종에 약국이 포함된 것을 확인했습니다."
    ]
  },
  {
    id: "pharma_wholesale",
    label: "제약회사/의약품도매",
    noInterestMonths: ["2~5개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    sourceUrl:
      "https://web.paybooc.co.kr/web/evnt/evnt-dts?evntMrktTypCd=&ingPositionTop=1466&ordering=RECENT&pybcUnifEvntNo=2026030035",
    notes: [
      "BC카드 공식 업종별 무이자할부 공통 업종표에서 제약회사 업종이 무이자할부 대상 업종으로 확인됩니다.",
      "BC카드 업종분류 기준에 따라 적용되며, 발급 은행/브랜드별 제외 조건이 있을 수 있습니다."
    ]
  },
  {
    id: "appliance",
    label: "가전제품",
    noInterestMonths: ["2~3개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    sourceUrl:
      "https://web.paybooc.co.kr/web/evnt/evnt-dts?evntMrktTypCd=&ingPositionTop=1466&ordering=RECENT&pybcUnifEvntNo=2026030035",
    notes: [
      "페이북 공식 업종별 무이자할부 이미지 표에서 가전/가구 업종이 2~3개월 무이자할부 대상 업종으로 확인됐습니다."
    ]
  },
  {
    id: "education",
    label: "학원/교육",
    noInterestMonths: ["2~3개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    notes: [
      "페이북 공식 업종별 무이자할부 이미지 표에서 외국어학원, 기능학원, 컴퓨터학원, 예체능학원, 보습학원, 학습지교육, 초중고교육기관, 유치원, 유아원, 독서실, 유학원 등이 2~3개월 대상 업종으로 확인됐습니다."
    ]
  },
  {
    id: "auto",
    label: "자동차/보험",
    noInterestMonths: ["2~3개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    notes: [
      "페이북 공식 업종별 무이자할부 이미지 표에서 자동차시트/타이어, 자동차부품, 자동차정비, 국산신차직영부품/정비업소, 세차장, 견인서비스 등 차량정비/유지 업종이 2~3개월 대상 업종으로 확인됐습니다."
    ]
  },
  {
    id: "shopping",
    label: "쇼핑/생활편의",
    noInterestMonths: ["2~5개월", "2~3개월"],
    partialMonths: [],
    minimumAmount: "5만원 이상",
    notes: [
      "페이북 공식 업종별 무이자할부 이미지 표에서 온라인PG/온라인MALL/백화점은 2~5개월, 대형마트/슈퍼/가전/가구 등은 2~3개월 대상 업종으로 확인됐습니다."
    ]
  }
];

VERIFIED_INDUSTRIES.nonghyup = [
  {
    id: "all",
    label: "전체/일반",
    noInterestMonths: ["2~6개월", "2~3개월"],
    partialMonths: ["10개월", "12개월", "18개월", "24개월"],
    minimumAmount: "5만원 이상",
    notes: [
      "NH농협카드 공식 2026년 업종별 무이자할부 혜택 게시글에서 업종별로 무이자/부분무이자 조건이 나뉘어 있음을 확인했습니다."
    ]
  },
  {
    id: "tax",
    label: "국세/지방세",
    noInterestMonths: [],
    partialMonths: ["4~10개월", "12개월"],
    minimumAmount: "5만원 이상",
    sourceUrl: "https://card.nonghyup.com/servlet/IpCb2002R.act?EVT_CRT_SQNO=5896",
    notes: [
      "NH농협카드 공식 2026년 업종별 무이자할부 혜택 게시글에서 국세/지방세 업종의 4~10/12개월 부분무이자할부 조건을 확인했습니다."
    ]
  },
  {
    id: "tax_other",
    label: "기타 세액납부",
    noInterestMonths: ["2~3개월"],
    partialMonths: ["4~10개월", "12개월", "18개월", "24개월"],
    minimumAmount: "5만원 이상",
    sourceUrl: "https://card.nonghyup.com/servlet/IpCb2002R.act?EVT_CRT_SQNO=5896",
    notes: [
      "기타 세액납부 포함 항목: 기타보험(4대보험).",
      "NH농협카드 공식 2026년 업종별 무이자할부 혜택 게시글에서 기타보험(4대보험)이 2~3개월 무이자 및 4~10/12/18/24개월 부분무이자 대상임을 확인했습니다."
    ]
  },
  {
    id: "hospital",
    label: "병원/의원/치과/한의원",
    noInterestMonths: ["2~3개월"],
    partialMonths: ["4~10개월", "12개월", "18개월", "24개월"],
    minimumAmount: "5만원 이상",
    notes: [
      "NH농협카드 공식 2026년 업종별 무이자할부 혜택 게시글에서 병원, 동물병원, 약국, 산후조리원 등이 포함된 의료 업종 묶음이 2~3개월 무이자 및 4~10/12/18/24개월 부분무이자 대상임을 확인했습니다."
    ]
  },
  {
    id: "pharmacy",
    label: "약국",
    noInterestMonths: ["2~3개월"],
    partialMonths: ["4~10개월", "12개월", "18개월", "24개월"],
    minimumAmount: "5만원 이상",
    notes: [
      "NH농협카드 공식 2026년 업종별 무이자할부 혜택 게시글에서 의료 업종 묶음에 약국이 포함되어 2~3개월 무이자 및 4~10/12/18/24개월 부분무이자 대상임을 확인했습니다."
    ]
  },
  {
    id: "appliance",
    label: "가전제품",
    noInterestMonths: ["2~3개월"],
    partialMonths: ["4~10개월", "12개월", "18개월", "24개월"],
    minimumAmount: "5만원 이상",
    sourceUrl: "https://card.nonghyup.com/servlet/IpCb2002R.act?EVT_CRT_SQNO=5896",
    notes: [
      "NH농협카드 공식 2026년 업종별 무이자할부 혜택 게시글에서 전자제품 업종이 2~3개월 무이자 및 4~10/12/18/24개월 부분무이자 대상임을 확인했습니다."
    ]
  },
  { id: "education", label: "학원/교육", ...UNCONFIRMED },
  { id: "auto", label: "자동차/보험", ...UNCONFIRMED },
  { id: "shopping", label: "쇼핑/생활편의", ...UNCONFIRMED }
];

for (const cardId of ["hana"]) {
  const industry = VERIFIED_INDUSTRIES[cardId]?.find((item) => item.id === "pharmacy");
  if (industry) {
    Object.assign(industry, NOT_FOUND_PHARMACY);
  }
}

Object.assign(
  VERIFIED_INDUSTRIES.hana.find((industry) => industry.id === "pharmacy"),
  {
    noInterestMonths: ["2~3개월"],
    partialMonths: ["10개월", "12개월"],
    minimumAmount: "5만원 이상",
    notes: [
      "하나카드 공식 6월 무이자할부 & 부분 무이자할부 혜택 상세 글에서 약국 업종이 무이자 2~3개월 및 부분무이자 10/12개월 대상임을 확인했습니다. 매일 00:00 KST 자동 수집 성공 시 최신 월간 게시글 기준으로 갱신됩니다."
    ]
  }
);

for (const cardId of ["woori", "ibk"]) {
  VERIFIED_INDUSTRIES[cardId] = FALLBACK_INDUSTRIES.map((industry) => {
    if (industry.id === "all") {
      return {
        ...industry,
        noInterestMonths: [],
        partialMonths: [],
        minimumAmount: "원문 확인 필요",
        notes: ["카드사 대표 조건 및 업종별 세부 조건은 원문 확인이 필요합니다."]
      };
    }
    if (industry.id === "pharmacy") {
      return { ...industry, ...NOT_FOUND_PHARMACY };
    }
    if (industry.id === "pharma_wholesale") {
      return { ...industry, ...NOT_FOUND_PHARMA_WHOLESALE };
    }
    return { ...industry, ...UNCONFIRMED };
  });
}

Object.assign(
  VERIFIED_INDUSTRIES.woori.find((industry) => industry.id === "tax"),
  {
    noInterestMonths: ["2~3개월"],
    partialMonths: ["6개월", "10개월", "12개월"],
    minimumAmount: "5만원 이상",
    sourceUrl:
      "https://pc.wooricard.com/dcpc/yh1/bnf/bnf02/prgevnt/movePrgEvntDtl.do?evntSrno=30005624",
    notes: [
      "우리카드 공식 할부 종합 안내에서 세금 업종(지방세, 국세)이 무이자 2~3개월 및 부분무이자 6/10/12개월 대상임을 확인했습니다."
    ]
  }
);

Object.assign(
  VERIFIED_INDUSTRIES.woori.find((industry) => industry.id === "tax_other"),
  {
    noInterestMonths: [],
    partialMonths: ["10개월", "12개월"],
    minimumAmount: "5만원 이상",
    sourceUrl:
      "https://pc.wooricard.com/dcpc/totSearch.do?gubn=01&mGubn=W&searchTerm=%EC%A7%80%EB%B0%A9%EC%84%B8",
    notes: [
      "기타 세액납부 포함 항목: 4대보험(국민연금, 건강보험, 고용보험, 산재보험).",
      "우리카드 공식 할부 혜택 안내에서 4대보험(국민연금, 건강보험, 고용보험, 산재보험)이 10/12개월 부분무이자 대상임을 확인했습니다."
    ]
  }
);

Object.assign(
  VERIFIED_INDUSTRIES.woori.find((industry) => industry.id === "pharmacy"),
  {
    noInterestMonths: ["2~3개월"],
    partialMonths: ["10개월", "12개월"],
    minimumAmount: "5만원 이상",
    notes: [
      "우리카드 공식 할부 종합 안내 검색 결과에서 약국 업종의 허용개월수가 무이자(2~3), 부분무이자(10/12)로 확인되었습니다."
    ]
  }
);

VERIFIED_INDUSTRIES.ibk = FALLBACK_INDUSTRIES.map((industry) => ({
  ...industry,
  noInterestMonths: [],
  partialMonths: [],
  minimumAmount: "없음",
  notes: [
    "IBK기업은행 공식 진행중 이벤트에서 생활편의/무이자할부 관련 게시글을 찾지 못하면 검색결과 없음으로 표시합니다."
  ]
}));

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

  return [
    ...policies,
    ...splitPolicies
  ];
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
      label: "제약회사/의약품도매",
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

export function getIndustryPolicies(cardId, fallback, overrides = []) {
  if (VERIFIED_INDUSTRIES[cardId]) {
    return appendFeeNotes(
      ensureVisibleCategoryPolicies(
        expandTaxCategories(
          applyIndustryOverrides(VERIFIED_INDUSTRIES[cardId], overrides)
        )
      )
    );
  }

  const fallbackPolicies = FALLBACK_INDUSTRIES.map((industry) => {
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

  return appendFeeNotes(
    ensureVisibleCategoryPolicies(
      expandTaxCategories(applyIndustryOverrides(fallbackPolicies, overrides))
    )
  );
}
