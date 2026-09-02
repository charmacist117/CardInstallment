import { CARD_SOURCES, CURRENT_MONTH_PERIOD } from "./cardSources.js";
import { getIndustryPolicies } from "./industryPolicies.js";
import {
  getCurrentKstMonth,
  getKstDate
} from "./time.js";

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

function compact(value) {
  return value.replace(/\s+/g, " ").trim();
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#40;/g, "(")
    .replace(/&#41;/g, ")")
    .replace(/&middot;|&#183;|&#xB7;/gi, "·");
}

function htmlToText(html) {
  return compact(
    decodeEntities(html)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function stripTags(value) {
  return compact(
    decodeEntities(value)
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function uniq(values) {
  return [...new Set(values.filter(Boolean).map((value) => compact(value)))];
}

function findPeriod(text) {
  const normalizedText = text.replace(/\((?:월|화|수|목|금|토|일)\)/g, "");
  const patterns = [
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*[~\-–]\s*(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일/,
    /(\d{4})[.\-]\s*(\d{1,2})[.\-]\s*(\d{1,2})\s*[~\-–]\s*(?:(\d{4})[.\-]\s*)?(\d{1,2})[.\-]\s*(\d{1,2})/,
    /(\d{2})년\s*(\d{1,2})월\s*(\d{1,2})일\s*[~\-–]\s*(?:(\d{2})년\s*)?(\d{1,2})월\s*(\d{1,2})일/
  ];

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (!match) continue;
    const startYear = match[1].length === 2 ? `20${match[1]}` : match[1];
    const rawEndYear = match[4] || match[1];
    const endYear = rawEndYear.length === 2 ? `20${rawEndYear}` : rawEndYear;
    return `${startYear}년 ${match[2]}월 ${match[3]}일 ~ ${endYear}년 ${match[5]}월 ${match[6]}일`;
  }

  const monthMatch = normalizedText.match(/(\d{4})년\s*(\d{1,2})월/);
  return monthMatch ? `${monthMatch[1]}년 ${monthMatch[2]}월 공지` : "";
}

function parsePeriodDate(year, month, day) {
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function parsePeriodRange(period) {
  if (!period || period === "검색결과 없음") return null;

  const normalized = period.replace(/\s+/g, " ");
  const matches = [
    ...normalized.matchAll(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/g)
  ];
  if (matches.length >= 2) {
    return {
      start: parsePeriodDate(matches[0][1], matches[0][2], matches[0][3]),
      end: parsePeriodDate(matches[1][1], matches[1][2], matches[1][3])
    };
  }

  const dotted = [
    ...normalized.matchAll(/(\d{4})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})/g)
  ];
  if (dotted.length >= 2) {
    return {
      start: parsePeriodDate(dotted[0][1], dotted[0][2], dotted[0][3]),
      end: parsePeriodDate(dotted[1][1], dotted[1][2], dotted[1][3])
    };
  }

  return null;
}

function getKstToday() {
  const kstDate = getKstDate();
  return new Date(
    Date.UTC(kstDate.getUTCFullYear(), kstDate.getUTCMonth(), kstDate.getUTCDate())
  );
}

function isPeriodActive(period) {
  const range = parsePeriodRange(period);
  if (!range) return false;

  const today = getKstToday();
  return today >= range.start && today <= range.end;
}

function isPeriodTooBroad(range) {
  const dayMs = 24 * 60 * 60 * 1000;
  return (range.end.getTime() - range.start.getTime()) / dayMs > 370;
}

function candidateFreshness(candidate) {
  if (!candidate.period || candidate.period === "검색결과 없음") return 1;
  return isPeriodActive(candidate.period) ? 2 : 0;
}

function orderedCandidateUrls(source) {
  return [...source.urls].sort(
    (a, b) => candidateFreshness(b) - candidateFreshness(a)
  );
}

function currentCandidateUrls(source) {
  return orderedCandidateUrls(source).filter(
    (candidate) => candidateFreshness(candidate) > 0
  );
}

function resolvePolicyPeriod(scopedText, pageText, fallbackPeriod) {
  const detectedPeriod = findPeriod(scopedText) || findPeriod(pageText);
  if (!detectedPeriod) return fallbackPeriod;

  const range = parsePeriodRange(detectedPeriod);
  if (range && !isPeriodActive(detectedPeriod)) return fallbackPeriod;
  if (range && isPeriodTooBroad(range)) return fallbackPeriod;

  return detectedPeriod;
}

function findMinimumAmount(text) {
  const amounts = [...text.matchAll(/([1-9]\d*)\s*만원\s*이상/g)].map(
    (match) => Number(match[1])
  );
  if (!amounts.length) return "";

  const uniqueAmounts = [...new Set(amounts)];
  if (uniqueAmounts.includes(5)) return "5만원 이상";

  const minimum = Math.min(...uniqueAmounts);
  return uniqueAmounts.length > 1
    ? `${minimum}만원 이상 등 조건별 상이`
    : `${minimum}만원 이상`;
}

function normalizeMonthRange(value) {
  return compact(value)
    .replace(/\s*~\s*/g, "~")
    .replace(/\s*-\s*/g, "~")
    .replace(/\s*·\s*/g, ", ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+개월/g, "개월")
    .replace(/개월\s*개월/g, "개월");
}

function findNoInterestMonths(text) {
  const matches = [];
  const patterns = [
    /무이자\s*할부\s*([0-9,\s~\-·]+개월?)/g,
    /([2-9]\s*[~\-]\s*\d{1,2}\s*개월)\s*무이자\s*할부/g,
    /([2-9]\s*[~\-]\s*\d{1,2}\s*개월)\s*무이자/g
  ];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      matches.push(normalizeMonthRange(match[1]));
    }
  }

  return uniq(matches)
    .filter((value) => /^[23]/.test(value))
    .slice(0, 6);
}

function findPartialMonths(text) {
  const matches = [];
  const patterns = [
    /부분\s*무이자\s*할부\s*([0-9,\s~\-·]+개월?)/g,
    /슬림\s*할부\s*([0-9,\s~\-·]+개월?)/g,
    /([4-9]\s*[~\-]\s*\d{1,2}\s*개월|1[0-9]\s*개월|2[0-4]\s*개월)\s*부분\s*무이자/g
  ];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      matches.push(normalizeMonthRange(match[1]));
    }
  }

  return uniq(matches).slice(0, 8);
}

function issuerWindow(text, issuer) {
  const aliases = {
    KB국민카드: ["KB국민", "국민카드"],
    BC카드: ["비씨", "BC"],
    NH농협카드: ["NH농협", "농협카드"],
    우리카드: ["우리"],
    IBK기업은행: ["IBK", "기업은행", "IBK카드"],
    신한카드: ["신한"],
    삼성카드: ["삼성"],
    현대카드: ["현대"],
    롯데카드: ["롯데"],
    하나카드: ["하나"]
  }[issuer] || [issuer];

  for (const alias of aliases) {
    const index = text.indexOf(alias);
    if (index >= 0) {
      return text.slice(Math.max(0, index - 400), index + 1800);
    }
  }
  return text.slice(0, 2400);
}

function parseSeparatedMonths(value) {
  const normalized = stripTags(value)
    .replace(/[ㆍ·]/g, ",")
    .replace(/\s+/g, "");
  if (!normalized) return [];

  const range = normalized.match(/([2-9]\d?\s*[~\-]\s*\d{1,2})개월/);
  if (range) return [`${range[1].replace(/\s+/g, "")}개월`];

  return uniq(
    [...normalized.matchAll(/\d{1,2}/g)].map((match) => `${match[0]}개월`)
  );
}

function findShinhanCategorySection(html, label) {
  const headingRegex = new RegExp(
    `<h3\\b[^>]*>\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|<)`,
    "i"
  );
  const heading = html.match(headingRegex);
  if (!heading) return "";

  const start = heading.index;
  const rest = html.slice(start + heading[0].length);
  const nextHeading = rest.search(/<li>\s*<h3\b[^>]*class=["'][^"']*title--l/i);
  return html.slice(
    start,
    nextHeading >= 0 ? start + heading[0].length + nextHeading : start + 2400
  );
}

function extractShinhanBenefit(section) {
  const benefits = {
    noInterestMonths: [],
    partialMonths: []
  };
  const pairs = [
    ...section.matchAll(
      /<strong\b[^>]*class=["'][^"']*shc-list__title[^"']*["'][^>]*>([\s\S]*?)<\/strong>\s*<span\b[^>]*class=["'][^"']*shc-list__details[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi
    )
  ];

  for (const pair of pairs) {
    const title = stripTags(pair[1]);
    const months = parseSeparatedMonths(pair[2]);
    if (title.includes("무이자")) {
      benefits.noInterestMonths.push(...months);
    } else if (title.includes("슬림")) {
      benefits.partialMonths.push(...months);
    }
  }

  return {
    noInterestMonths: uniq(benefits.noInterestMonths),
    partialMonths: uniq(benefits.partialMonths)
  };
}

function extractShinhanIndustryPolicies(html, sourceUrl) {
  const pharmacySection = findShinhanCategorySection(html, "약국");
  if (!pharmacySection) return [];

  const pharmacyBenefit = extractShinhanBenefit(pharmacySection);
  if (
    !pharmacyBenefit.noInterestMonths.length &&
    !pharmacyBenefit.partialMonths.length
  ) {
    return [];
  }

  return [
    {
      id: "pharmacy",
      label: "약국",
      ...pharmacyBenefit,
      minimumAmount: "5만원 이상",
      sourceUrl,
      notes: [
        "신한카드 공식 혜택 > 무이자할부 안내 페이지에서 약국 업종 조건을 자동 확인했습니다."
      ]
    }
  ];
}

function extractKbEvents(html) {
  if (!html) return [];

  const eventRegex =
    /goDetail\('([^']+)'[\s\S]*?<span class="subject">([\s\S]*?)<\/span>\s*<span class="date">([^<]+)<\/span>/g;
  const keywordRegex = /무이자|할부|개월/;

  return [...html.matchAll(eventRegex)]
    .map((match) => ({
      id: match[1],
      title: stripTags(match[2]),
      period: match[3].trim()
    }))
    .filter((event) => keywordRegex.test(event.title))
    .slice(0, 8);
}

function findKbLivingConvenienceEvent(html) {
  return extractKbEvents(html)
    .filter(
      (event) =>
        event.title.includes("생활편의업종") &&
        event.title.includes("무이자할부") &&
        isPeriodActive(event.period)
    )
    .sort((a, b) => {
      const aRange = parsePeriodRange(a.period);
      const bRange = parsePeriodRange(b.period);
      return (bRange?.start?.getTime() || 0) - (aRange?.start?.getTime() || 0);
    })[0];
}

function extractKbLivingConvenienceTable(html) {
  const captionIndex = html.indexOf("KB국민카드 생활편의업종 구분, 대상 업종 테이블");
  if (captionIndex < 0) return "";

  const tableStart = html.lastIndexOf("<table", captionIndex);
  const tableEnd = html.indexOf("</table>", captionIndex);
  if (tableStart < 0 || tableEnd < 0) return "";

  return html.slice(tableStart, tableEnd + "</table>".length);
}

function parseKbBenefitMonths(benefitText) {
  const noInterestMonths = uniq(
    [...benefitText.matchAll(/([2-9]\s*~\s*\d{1,2})\s*개월\s*무이자/g)].map(
      (match) => `${match[1].replace(/\s+/g, "")}개월`
    )
  );
  const partialMonths = uniq(
    [...benefitText.matchAll(/([0-9/,\s]+)\s*개월\s*부분무이자/g)]
      .flatMap((match) => match[1].split(/[\/,\s]+/))
      .filter(Boolean)
      .map((month) => `${month}개월`)
  );

  return { noInterestMonths, partialMonths };
}

function extractKbIndustryPolicies(html, text, sourceUrl) {
  const tableHtml = extractKbLivingConvenienceTable(html);
  if (!tableHtml) return [];

  let carriedBenefit = "";
  let carriedRows = 0;
  const rows = [...tableHtml.matchAll(/<tr[\s\S]*?<\/tr>/gi)];

  for (const row of rows) {
    const cells = [...row[0].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)].map(
      (cell) => ({
        attrs: cell[1],
        text: stripTags(cell[2])
      })
    );
    if (!cells.length) continue;

    let benefitText = "";
    if (cells.length >= 3) {
      benefitText = cells[2].text;
      const rowSpan = Number(cells[2].attrs.match(/rowspan=["']?(\d+)/i)?.[1] || 1);
      carriedBenefit = rowSpan > 1 ? benefitText : "";
      carriedRows = Math.max(0, rowSpan - 1);
    } else if (carriedRows > 0) {
      benefitText = carriedBenefit;
      carriedRows -= 1;
    }

    const categoryText = cells.slice(0, 2).map((cell) => cell.text).join(" ");
    if (!categoryText.includes("약국") || !benefitText) continue;

    const { noInterestMonths, partialMonths } = parseKbBenefitMonths(benefitText);
    if (!noInterestMonths.length && !partialMonths.length) return [];

    return [
      {
        id: "pharmacy",
        label: "약국",
        noInterestMonths,
        partialMonths,
        minimumAmount: /5\s*만원\s*이상/.test(text) ? "5만원 이상" : "원문 확인 필요",
        sourceUrl,
        notes: [
          "KB국민카드 공식 이벤트 검색에서 생활편의업종 무이자할부 글을 찾고, 상세 표의 약국 포함 행 조건을 자동 확인했습니다."
        ]
      }
    ];
  }

  return [];
}

function findHanaCurrentMonthDetail(html) {
  const month = getCurrentKstMonth();
  const title = `${month}월, 무이자할부 & 부분 무이자할부 혜택`;
  const normalizedHtml = html.replace(/&amp;/g, "&");
  const titleIndex = normalizedHtml.indexOf(title);
  if (titleIndex < 0) return null;

  const windowText = normalizedHtml.slice(
    Math.max(0, titleIndex - 2000),
    titleIndex + 2000
  );
  const detailPath = windowText.match(/OPP35250001D\.web[^"'<>\\\s)]*AN_NO[=&#37;3D]+(\d+)/i);
  const detailId =
    detailPath?.[1] ||
    windowText.match(/goView\(['"]?(\d+)['"]?\)/i)?.[1] ||
    windowText.match(/AN_NO['"]?\s*[:=]\s*['"]?(\d+)/i)?.[1] ||
    windowText.match(/AN_NO=(\d+)/i)?.[1];

  if (!detailId) return null;

  return {
    title,
    url: `https://www.hanacard.co.kr/OPP35250001D.web?AN_NO=${detailId}&mID=OPP35250000D&schID=ncd`
  };
}

function findNonghyupInstallmentDetail(html, text, keywords = []) {
  const normalizedHtml = html.replace(/&amp;/g, "&");
  const candidates = [
    ...normalizedHtml.matchAll(/IpCb2002R\.act\?[^"'<>\\\s)]*EVT_CRT_SQNO=(\d+)/gi),
    ...normalizedHtml.matchAll(/EVT_CRT_SQNO['"]?\s*[:=]\s*['"]?(\d+)/gi)
  ];
  const uniqueIds = [...new Set(candidates.map((match) => match[1]))];
  const searchTerms = keywords.length ? keywords : ["무이자할부", "무이자 할부"];

  for (const id of uniqueIds) {
    const idIndex = normalizedHtml.indexOf(id);
    const windowText = stripTags(
      normalizedHtml.slice(Math.max(0, idIndex - 1200), idIndex + 1200)
    );

    if (
      searchTerms.some((keyword) => windowText.includes(keyword)) ||
      /업종별\s*무이자/.test(windowText)
    ) {
      return {
        title:
          windowText.match(/20\d{2}년\s*[^|]{0,40}무이자[^|]{0,40}혜택/)?.[0] ||
          "공식 업종별 무이자할부 혜택",
        url: `https://card.nonghyup.com/servlet/IpCb2002R.act?EVT_CRT_SQNO=${id}`
      };
    }
  }

  const textMatch =
    text.includes("2026년 업종별 무이자할부 혜택") ||
    searchTerms.some((keyword) => text.includes(keyword));
  return textMatch && uniqueIds[0]
    ? {
        title: "공식 업종별 무이자할부 혜택",
        url: `https://card.nonghyup.com/servlet/IpCb2002R.act?EVT_CRT_SQNO=${uniqueIds[0]}`
      }
    : null;
}

const HANA_CATEGORY_LABELS = [
  "온라인쇼핑",
  "백화점",
  "손해보험",
  "종합병원",
  "일반병원",
  "한방병원",
  "치과병원",
  "약국",
  "대형마트",
  "항공",
  "면세점",
  "여행사",
  "SSM",
  "대형쇼핑센터/아울렛",
  "차량정비",
  "가전",
  "가구",
  "의류/스포츠/레저용품",
  "세금(국세/지방세)",
  "4대보험",
  "동물병원",
  "학원"
];

function findHanaCategoryWindow(text, label) {
  const start = text.indexOf(label);
  if (start < 0) return "";

  const end = HANA_CATEGORY_LABELS.reduce((nearest, nextLabel) => {
    if (nextLabel === label) return nearest;
    const index = text.indexOf(nextLabel, start + label.length);
    return index > start && index < nearest ? index : nearest;
  }, text.length);

  return text.slice(start, end);
}

function parseHanaMonths(section) {
  const noInterestMonths = [];
  const partialMonths = [];

  for (const match of section.matchAll(/무이자할부\s*([0-9]{1,2}\s*[~\-]\s*[0-9]{1,2})\s*개월/g)) {
    noInterestMonths.push(`${match[1].replace(/\s+/g, "")}개월`);
  }

  for (const match of section.matchAll(/부분\s*무이자할부\s*([0-9/,\s]+)\s*개월/g)) {
    for (const month of match[1].split(/[\/,\s]+/)) {
      if (month) partialMonths.push(`${month}개월`);
    }
  }

  return {
    noInterestMonths: uniq(noInterestMonths),
    partialMonths: uniq(partialMonths)
  };
}

function formatWooriNoInterest(value) {
  const compactValue = value.replace(/\s+/g, "");
  return compactValue ? [`${compactValue}개월`] : [];
}

function formatWooriPartial(value) {
  return value
    .replace(/\\/g, "")
    .split(/[\/,\s]+/)
    .filter(Boolean)
    .map((month) => `${month}개월`);
}

function extractWooriIndustryPolicies(text, sourceUrl) {
  const pharmacyIndex = text.indexOf("약국");
  if (pharmacyIndex < 0) return [];

  const beforePharmacy = text.slice(0, pharmacyIndex);
  const benefitMatches = [
    ...beforePharmacy.matchAll(/(부분무이자|무이자)\s*\(([^)]+)\)/g)
  ];
  const noInterest = [...benefitMatches]
    .reverse()
    .find((match) => match[1] === "무이자")?.[2];
  const partial = [...benefitMatches]
    .reverse()
    .find((match) => match[1] === "부분무이자")?.[2];
  const noInterestMonths = noInterest ? formatWooriNoInterest(noInterest) : [];
  const partialMonths = partial ? formatWooriPartial(partial) : [];
  const hasPharmacyBenefit = noInterestMonths.length || partialMonths.length;

  return [
    {
      id: "pharmacy",
      label: "약국",
      noInterestMonths,
      partialMonths,
      minimumAmount: hasPharmacyBenefit ? "5만원 이상" : "없음",
      notes: [
        hasPharmacyBenefit
          ? "우리카드 공식 할부 종합 안내에서 약국 업종의 허용개월수를 자동 확인했습니다."
          : "우리카드 공식 할부 종합 안내에서 약국 업종을 확인했지만 무이자/부분무이자 허용개월수는 검색결과 없음으로 확인했습니다."
      ]
    }
  ];
}

function formatCompactDateRange(start, end) {
  const startMatch = start?.match(/^(\d{4})(\d{2})(\d{2})/);
  const endMatch = end?.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!startMatch || !endMatch) return "";

  return `${startMatch[1]}년 ${Number(startMatch[2])}월 ${Number(startMatch[3])}일 ~ ${endMatch[1]}년 ${Number(endMatch[2])}월 ${Number(endMatch[3])}일`;
}

function formatDashedDateRange(start, end) {
  const startMatch = start?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const endMatch = end?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!startMatch || !endMatch) return "";

  return `${startMatch[1]}년 ${Number(startMatch[2])}월 ${Number(startMatch[3])}일 ~ ${endMatch[1]}년 ${Number(endMatch[2])}월 ${Number(endMatch[3])}일`;
}

function findWooriInstallmentDetail(searchHtml, searchText) {
  const normalizedHtml = searchHtml.replace(/&amp;/g, "&");
  const embeddedEvent = normalizedHtml.match(
    /EVNT_SRNO&#034;:&#034;(\d+)&#034;[\s\S]{0,5000}?CD_EVNT_NM&#034;:&#034;([^"]*?할부[^"]*?종합[^"]*?안내[^"]*?)&#034;/i
  );
  const embeddedEventBeforeTitle = normalizedHtml.match(
    /WEB_BDT_CNTNTS&#034;:&#034;[\s\S]{0,5000}?NTC_SDT&#034;:&#034;(\d{4}-\d{2}-\d{2})&#034;[\s\S]{0,800}?EVNT_SRNO&#034;:&#034;(\d+)&#034;[\s\S]{0,500}?CD_EVNT_NM&#034;:&#034;([^"]*?할부[^"]*?종합[^"]*?안내[^"]*?)&#034;/i
  );

  if (embeddedEvent || embeddedEventBeforeTitle) {
    const eventNo = embeddedEventBeforeTitle?.[2] || embeddedEvent?.[1];
    const eventIndex = embeddedEventBeforeTitle?.index ?? embeddedEvent?.index ?? 0;
    const eventWindow = normalizedHtml.slice(
      Math.max(0, eventIndex - 20000),
      eventIndex + 3000
    );
    const periodMatch = eventWindow
      .match(/기간\\n\s*(\d{2}년\s*\d{1,2}월\s*\d{1,2}일[\s\S]{0,30}?\d{2}년\s*\d{1,2}월\s*\d{1,2}일)/);
    const noticeStart = eventWindow.match(/NTC_SDT&#034;:&#034;(\d{4}-\d{2}-\d{2})/)?.[1];
    const noticeEnd = eventWindow.match(/NTC_EDT&#034;:&#034;(\d{4}-\d{2}-\d{2})/)?.[1];
    return {
      title: "공식 할부 종합 안내",
      url: `https://pc.wooricard.com/dcpc/totSearch.do?gubn=01&mGubn=W&searchTerm=%ED%95%A0%EB%B6%80%20%EC%A2%85%ED%95%A9%20%EC%95%88%EB%82%B4#evntSrno=${eventNo}`,
      period: periodMatch ? findPeriod(periodMatch[1]) : formatDashedDateRange(noticeStart, noticeEnd),
      embedded: true
    };
  }

  const detailMatches = [
    ...normalizedHtml.matchAll(
      /(?:href=["']([^"']*movePrgEvntDtl\.do\?[^"']*evntSrno=\d+[^"']*)["']|movePrgEvntDtl\.do\?[^"'<>\\\s)]*evntSrno[=&#37;3D]+(\d+)|EVNT_SRNO&#034;:&#034;(\d+)&#034;)/gi
    )
  ];
  const seen = new Set();
  const candidates = detailMatches
    .map((match) => {
      const rawUrl =
        match[1] ||
        `/dcpc/yh1/bnf/bnf02/prgevnt/movePrgEvntDtl.do?evntSrno=${match[2] || match[3]}`;
      const context = normalizedHtml.slice(
        Math.max(0, match.index - 500),
        match.index + 500
      );
      try {
        return {
          url: new URL(rawUrl, "https://pc.wooricard.com").href,
          score: /할부\s*종합\s*안내/.test(stripTags(context)) ? 10 : 0
        };
      } catch {
        return null;
      }
    })
    .filter((candidate) => {
      if (!candidate?.url || seen.has(candidate.url)) return false;
      seen.add(candidate.url);
      return true;
    });

  if (candidates.length) {
    const best = candidates.sort((a, b) => b.score - a.score)[0];
    return {
      title: "공식 할부 종합 안내",
      url: best.url
    };
  }

  const eventNumber = searchText.match(/evntSrno\s*[:=]\s*(\d+)/i)?.[1];
  return eventNumber
    ? {
        title: "공식 할부 종합 안내",
        url: `https://pc.wooricard.com/dcpc/yh1/bnf/bnf02/prgevnt/movePrgEvntDtl.do?evntSrno=${eventNumber}`
      }
    : null;
}

function hasIbkInstallmentKeyword(text, keywords = []) {
  const normalizedText = text.replace(/\s+/g, "");
  return keywords.some((keyword) => normalizedText.includes(keyword.replace(/\s+/g, "")));
}

function findIbkDetailUrl(html, keywords = []) {
  const normalizedHtml = html.replace(/&amp;/g, "&");
  const normalizedKeywords = keywords.map((keyword) => keyword.replace(/\s+/g, ""));
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of normalizedHtml.matchAll(anchorRegex)) {
    const label = stripTags(match[2]).replace(/\s+/g, "");
    if (!normalizedKeywords.some((keyword) => label.includes(keyword))) continue;

    try {
      return new URL(match[1], "https://www.ibk.co.kr").href;
    } catch {
      return null;
    }
  }

  return null;
}

function extractIbkIndustryPolicies(text, sourceUrl) {
  const pharmacyIndex = text.indexOf("약국");
  if (pharmacyIndex < 0) {
    return [
      {
        id: "pharmacy",
        label: "약국",
        noInterestMonths: [],
        partialMonths: [],
        minimumAmount: "없음",
        notes: [
          "IBK기업은행 공식 이벤트 게시글에서 약국 관련 무이자할부 조건을 찾지 못했습니다."
        ]
      }
    ];
  }

  const windowText = text.slice(Math.max(0, pharmacyIndex - 800), pharmacyIndex + 800);
  const noInterestMonths = uniq(
    [...windowText.matchAll(/(?:무이자(?:할부)?|허용개월수)\s*\(?\s*([2-9]\s*[~\-]\s*\d{1,2})\s*\)?\s*개월?/g)].map(
      (match) => `${match[1].replace(/\s+/g, "")}개월`
    )
  );
  const partialMonths = uniq(
    [...windowText.matchAll(/부분\s*무이자(?:할부)?\s*\(?\s*([0-9/,\s]+)\s*\)?\s*개월?/g)]
      .flatMap((match) => match[1].split(/[\/,\s]+/))
      .filter(Boolean)
      .map((month) => `${month}개월`)
  );
  const hasPharmacyBenefit = noInterestMonths.length || partialMonths.length;

  return [
    {
      id: "pharmacy",
      label: "약국",
      noInterestMonths,
      partialMonths,
      minimumAmount: hasPharmacyBenefit ? "5만원 이상" : "없음",
      notes: [
        hasPharmacyBenefit
          ? "IBK기업은행 공식 이벤트 게시글에서 약국 관련 무이자할부 조건을 자동 확인했습니다."
          : "IBK기업은행 공식 이벤트 게시글에서 약국 업종을 확인했지만 무이자/부분무이자 조건은 검색결과 없음으로 확인했습니다."
      ]
    }
  ];
}

function extractHyundaiIndustryPolicies(text, sourceUrl) {
  if (!/가맹점\s*업종별\s*무이자/.test(text)) return [];

  const hasPharmacy = text.includes("약국");
  if (hasPharmacy) {
    return [];
  }

  return [
    {
      id: "pharmacy",
      label: "약국",
      noInterestMonths: [],
      partialMonths: [],
      minimumAmount: "없음",
      notes: [
        "현대카드 공식 가맹점 업종별 무이자/부분 무이자 할부 상세 페이지에서 약국 관련 조건을 찾지 못했습니다."
      ]
    }
  ];
}

function extractHanaIndustryPolicies(text, sourceUrl) {
  const minimumAmount = /5\s*만원\s*이상/.test(text) ? "5만원 이상" : "원문 확인 필요";
  const pharmacySection = findHanaCategoryWindow(text, "약국");
  if (!pharmacySection) return [];

  let pharmacyMonths = parseHanaMonths(pharmacySection);
  if (!pharmacyMonths.noInterestMonths.length && !pharmacyMonths.partialMonths.length) {
    const pharmacyIndex = text.indexOf("약국");
    const noticeIndex = text.indexOf("유의사항", pharmacyIndex);
    const broadSection = text.slice(
      pharmacyIndex,
      noticeIndex > pharmacyIndex ? noticeIndex : pharmacyIndex + 2000
    );
    pharmacyMonths = parseHanaMonths(broadSection);
  }
  const hasPharmacyBenefit =
    pharmacyMonths.noInterestMonths.length || pharmacyMonths.partialMonths.length;

  return [
    {
      id: "pharmacy",
      label: "약국",
      noInterestMonths: pharmacyMonths.noInterestMonths,
      partialMonths: pharmacyMonths.partialMonths,
      minimumAmount: hasPharmacyBenefit ? minimumAmount : "없음",
      notes: [
        hasPharmacyBenefit
          ? "하나카드 공식 월간 무이자할부 혜택 글에서 약국 업종 조건을 자동 확인했습니다."
          : "하나카드 공식 월간 무이자할부 혜택 글에서 약국 업종을 확인했지만 무이자/부분무이자 조건은 검색결과 없음으로 확인했습니다."
      ]
    }
  ];
}

function parsePayboocEventData(html) {
  const match = html.match(/const eventData = (\{[\s\S]*?\});\s*\n/);
  if (!match) return null;

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function parsePayboocEventList(html) {
  const match = html.match(/const evntInfo = (\{[\s\S]*?\});\s*\n/);
  if (!match) return [];

  try {
    return JSON.parse(match[1])?.evntInqrList || [];
  } catch {
    return [];
  }
}

function payboocPeriod(event) {
  return formatCompactDateRange(
    event?.evntStrtDtm || event?.evntBltnStrtDtm,
    event?.evntEndDtm || event?.evntBltnEndDtm
  );
}

function findBcIndustryInstallmentEvent(html) {
  const events = parsePayboocEventList(html);
  const today = getKstToday();
  const parsedEvent = events
    .filter((event) => {
      const haystack = [
        event.pybcUnifEvntNm1,
        event.pybcUnifEvntNm2,
        event.pybcUnifEvntNm3,
        event.evntSrchKwdNm
      ].join(" ");
      const period = payboocPeriod(event);
      const range = parsePeriodRange(period);
      return (
        haystack.includes("업종별") &&
        haystack.includes("무이자") &&
        range &&
        today >= range.start &&
        today <= range.end
      );
    })
    .sort((a, b) => String(b.evntStrtDtm || "").localeCompare(String(a.evntStrtDtm || "")))[0];

  if (parsedEvent) return parsedEvent;

  const matches = [...html.matchAll(/"pybcUnifEvntNo":"(\d+)"/g)];
  const escapedIndustry = "\\uC5C5\\uC885\\uBCC4";
  const escapedNoInterest = "\\uBB34\\uC774\\uC790";
  const industryTitleIndex = html.indexOf(`"pybcUnifEvntNm1":"${escapedIndustry} ${escapedNoInterest}\\uD560\\uBD80"`);

  if (industryTitleIndex >= 0) {
    const objectStart = html.lastIndexOf('"pybcUnifEvntNo":"', industryTitleIndex);
    const windowText = html.slice(objectStart, industryTitleIndex + 4000);
    const eventNo = windowText.match(/"pybcUnifEvntNo":"(\d+)"/)?.[1];
    const start =
      windowText.match(/"evntStrtDtm":"(\d{14})"/)?.[1] ||
      windowText.match(/"evntBltnStrtDtm":"(\d{14})"/)?.[1];
    const end =
      windowText.match(/"evntEndDtm":"(\d{14})"/)?.[1] ||
      windowText.match(/"evntBltnEndDtm":"(\d{14})"/)?.[1];
    const period = formatCompactDateRange(start, end);
    const range = parsePeriodRange(period);

    if (eventNo && range && today >= range.start && today <= range.end) {
      return {
        pybcUnifEvntNo: eventNo,
        evntStrtDtm: start,
        evntEndDtm: end,
        pybcUnifEvntNm1: "업종별 무이자할부"
      };
    }
  }

  return matches
    .map((match) => {
      const windowText = html.slice(match.index, match.index + 4000);
      if (!windowText.includes(escapedIndustry) || !windowText.includes(escapedNoInterest)) {
        return null;
      }

      const start =
        windowText.match(/"evntStrtDtm":"(\d{14})"/)?.[1] ||
        windowText.match(/"evntBltnStrtDtm":"(\d{14})"/)?.[1];
      const end =
        windowText.match(/"evntEndDtm":"(\d{14})"/)?.[1] ||
        windowText.match(/"evntBltnEndDtm":"(\d{14})"/)?.[1];
      const period = formatCompactDateRange(start, end);
      const range = parsePeriodRange(period);
      if (!range || today < range.start || today > range.end) return null;

      return {
        pybcUnifEvntNo: match[1],
        evntStrtDtm: start,
        evntEndDtm: end,
        pybcUnifEvntNm1: "업종별 무이자할부"
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.evntStrtDtm || "").localeCompare(String(a.evntStrtDtm || "")))[0];
}

function extractBcIndustryPolicies(eventData, sourceUrl) {
  const groups = eventData?.eventDetailsGroupBaseDtoList || [];
  const groupText = JSON.stringify(groups);
  const hasPharmacyInTwoToThree =
    groupText.includes("대상 업종 (2~3개월)") &&
    groupText.includes("2026060044_tabel_03_0624.png");
  if (!hasPharmacyInTwoToThree) return [];

  return [
    {
      id: "pharmacy",
      label: "약국",
      noInterestMonths: ["2~3개월"],
      partialMonths: [],
      minimumAmount: "5만원 이상",
      sourceUrl,
      notes: [
        "페이북 공식 업종별 무이자할부 상세의 2~3개월 대상 업종 이미지 표에서 약국 업종을 자동 확인했습니다."
      ]
    }
  ];
}

function findDetectedEvents(source, html) {
  if (source.id === "kb") return extractKbEvents(html);
  return [];
}

function buildPolicyFromText(source, pageText, html = "") {
  const scopedText =
    source.urls.length > 1 || source.urls[0]?.priority === "secondary"
      ? issuerWindow(pageText, source.issuer)
      : pageText;
  const fallback = source.fallback;
  const noInterestMonths = findNoInterestMonths(scopedText);
  const partialMonths = findPartialMonths(scopedText);
  const detectedEvents = findDetectedEvents(source, html);
  const eventNotes = detectedEvents.length
    ? [
        `공식 페이지에서 확인된 이벤트: ${detectedEvents
          .map((event) => event.title)
          .join(", ")}`
      ]
    : [];

  return {
    id: source.id,
    issuer: source.issuer,
    brandColor: source.brandColor,
    period: resolvePolicyPeriod(scopedText, pageText, fallback.period),
    noInterestMonths: noInterestMonths.length
      ? noInterestMonths
      : fallback.noInterestMonths,
    partialMonths: partialMonths.length ? partialMonths : fallback.partialMonths,
    minimumAmount:
      findMinimumAmount(scopedText) ||
      findMinimumAmount(pageText) ||
      fallback.minimumAmount,
    notes: [...eventNotes, ...fallback.notes],
    industryPolicies: getIndustryPolicies(source.id, {
      noInterestMonths: noInterestMonths.length
        ? noInterestMonths
        : fallback.noInterestMonths,
      partialMonths: partialMonths.length ? partialMonths : fallback.partialMonths,
      minimumAmount:
        findMinimumAmount(scopedText) ||
        findMinimumAmount(pageText) ||
        fallback.minimumAmount
    }, source.industryOverrides || []),
    detectedEvents,
    status: noInterestMonths.length || detectedEvents.length ? "collected" : "fallback",
    sourceLabel: "",
    sourceUrl: "",
    updatedAt: new Date().toISOString()
  };
}

function buildPolicyFromPage(source, page, sourceInfo, overrides = [], extra = {}) {
  const policy = buildPolicyFromText(
    {
      ...source,
      industryOverrides: overrides
    },
    page.text,
    page.html
  );

  const reflectedAt =
    policy.status === "collected" || overrides.length || extra.reflected
      ? new Date().toISOString()
      : undefined;

  return {
    ...policy,
    status: overrides.length ? "collected" : policy.status,
    period:
      sourceInfo.period && isPeriodActive(sourceInfo.period)
        ? sourceInfo.period
        : policy.period,
    sourceLabel: sourceInfo.label,
    sourceUrl: sourceInfo.url,
    reflectedAt,
    ...extra
  };
}

async function readSourceResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "";
  let html = new TextDecoder("utf-8").decode(buffer);
  const headerCharset = contentType.match(/charset=([^;]+)/i)?.[1]?.toLowerCase();
  const htmlCharset = html.match(/charset=["']?([^"'\s/>]+)/i)?.[1]?.toLowerCase();
  const charset = headerCharset || htmlCharset || "";

  if (/euc-kr|ks_c_5601|cp949/.test(charset)) {
    html = new TextDecoder("euc-kr").decode(buffer);
  }

  return {
    html,
    text: htmlToText(html)
  };
}

async function fetchSource(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...REQUEST_HEADERS,
      ...(options.headers || {})
    }
  });

  return readSourceResponse(response);
}

async function fetchKbEventSearch(sourceUrl, keyword) {
  const searchUrl = new URL(sourceUrl);
  searchUrl.search = "isAjax=Y&isNoFrame=Y";

  const body = new URLSearchParams({
    pageCount: "1",
    카드이벤트구분: "",
    이벤트혜택구분: "ALL",
    이벤트일련번호: "",
    가맹점분류코드: "",
    prevUrl: "HBBMCXCRVNEC0001",
    대고객게시여부: "",
    admin: "",
    검색이벤트명: keyword
  });

  return fetchSource(searchUrl.href, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Referer: sourceUrl
    },
    body
  });
}

async function collectCandidateUrls(source, errors = []) {
  for (const candidate of currentCandidateUrls(source)) {
    try {
      const page = await fetchSource(candidate.url);
      return buildPolicyFromPage(source, page, candidate, [], { errors });
    } catch (error) {
      errors.push(`${candidate.label}: ${error.message}`);
    }
  }

  return null;
}

function unavailablePolicy(source, errors = []) {
  const sourceInfo = currentCandidateUrls(source)[0] || source.urls[0] || {};

  return {
    id: source.id,
    issuer: source.issuer,
    brandColor: source.brandColor,
    ...source.fallback,
    status: "unavailable",
    sourceLabel: sourceInfo.label || "원문",
    sourceUrl: sourceInfo.url || "",
    errors,
    industryPolicies: getIndustryPolicies(source.id, source.fallback),
    updatedAt: new Date().toISOString()
  };
}

async function collectShinhan(source, errors = []) {
  const sourceInfo = source.urls[0];

  try {
    const page = await fetchSource(sourceInfo.url);
    const period = findPeriod(page.text);
    const overrides = extractShinhanIndustryPolicies(page.html, sourceInfo.url);
    const hasPharmacy = overrides.some((industry) => industry.id === "pharmacy");

    if (!period || !isPeriodActive(period)) {
      errors.push("신한카드 공식 무이자할부 안내의 현재 월 행사 기간을 확인하지 못했습니다.");
    }

    if (!hasPharmacy) {
      errors.push("신한카드 공식 무이자할부 안내에서 약국 업종 조건을 찾지 못했습니다.");
    }

    const policy = buildPolicyFromPage(
      source,
      page,
      {
        label: sourceInfo.label,
        url: sourceInfo.url,
        period
      },
      overrides
    );

    return period && isPeriodActive(period) && hasPharmacy
      ? policy
      : {
          ...policy,
          status: "fallback",
          reflectedAt: undefined,
          errors
        };
  } catch (error) {
    errors.push(`${sourceInfo.label}: ${error.message}`);
  }

  return unavailablePolicy(source, errors);
}

async function collectKb(source, errors = []) {
  const searchSource =
    source.urls.find((candidate) => candidate.searchKeyword) ||
    source.urls.find((candidate) => !candidate.url.includes("eventNum=")) ||
    source.urls[0];
  const keyword = searchSource.searchKeyword || "생활편의업종";

  try {
    const searchPage = await fetchKbEventSearch(searchSource.url, keyword);
    const event = findKbLivingConvenienceEvent(searchPage.html);

    if (event?.id) {
      const detailUrl = `https://card.kbcard.com/BON/DVIEW/HBBMCXCRVNEC0001?mainCC=a&eventNum=${event.id}`;
      const detailPage = await fetchSource(detailUrl);
      const period = findPeriod(event.period) || findPeriod(detailPage.text) || event.period;
      const overrides = extractKbIndustryPolicies(detailPage.html, detailPage.text, detailUrl);

      return buildPolicyFromPage(
        source,
        detailPage,
        {
          label: event.title,
          url: detailUrl,
          period
        },
        overrides,
        {
          detectedEvents: [event]
        }
      );
    }

    errors.push("KB국민카드 이벤트 검색에서 현재 적용 중인 생활편의업종 무이자할부 글을 찾지 못했습니다.");
  } catch (error) {
    errors.push(`${searchSource.label}: ${error.message}`);
  }

  return collectCandidateUrls(source, errors);
}

async function collectHana(source, errors = []) {
  const listSource =
    source.urls.find((candidate) => candidate.url.includes("OPP35250000D.web")) ||
    source.urls[0];

  try {
    const listPage = await fetchSource(listSource.url);
    const detail = findHanaCurrentMonthDetail(listPage.html);

    if (detail) {
      const detailPage = await fetchSource(detail.url);
      return buildPolicyFromPage(
        source,
        detailPage,
        { label: detail.title, url: detail.url },
        extractHanaIndustryPolicies(detailPage.text, detail.url)
      );
    }

    errors.push("현재 월 무이자할부 혜택 글을 목록에서 찾지 못했습니다.");
  } catch (error) {
    errors.push(`${listSource.label}: ${error.message}`);
  }

  return collectCandidateUrls(source, errors);
}

async function collectWoori(source, errors = []) {
  const searchSource =
    source.urls.find((candidate) => candidate.searchKeyword) || source.urls[0];

  try {
    const searchPage = await fetchSource(searchSource.url);
    const detail = findWooriInstallmentDetail(searchPage.html, searchPage.text);
    const targetPage = detail?.url && !detail.embedded ? await fetchSource(detail.url) : searchPage;
    const targetUrl = detail?.url || searchSource.url;
    const overrides = extractWooriIndustryPolicies(targetPage.text, targetUrl);
    return buildPolicyFromPage(
      source,
      targetPage,
      {
        label: overrides.length
        ? "공식 할부 종합 안내"
        : searchSource.label,
        url: targetUrl,
        period: detail?.period
      },
      overrides
    );
  } catch (error) {
    errors.push(`${searchSource.label}: ${error.message}`);
  }

  return collectCandidateUrls(source, errors);
}

async function collectBc(source, errors = []) {
  const listSource = source.urls.find((candidate) => candidate.searchKeywords) || source.urls[0];

  try {
    const listPage = await fetchSource(listSource.url);
    const event = findBcIndustryInstallmentEvent(listPage.html);

    if (event?.pybcUnifEvntNo) {
      const detailUrl = `https://web.paybooc.co.kr/web/evnt/evnt-dts?pybcUnifEvntNo=${event.pybcUnifEvntNo}&evntMrktTypCd=06&ordering=RECENT`;
      const detailPage = await fetchSource(detailUrl);
      const eventData = parsePayboocEventData(detailPage.html);
      const period = payboocPeriod(eventData || event);
      const overrides = extractBcIndustryPolicies(eventData, detailUrl);

      return buildPolicyFromPage(
        source,
        detailPage,
        {
          label: "페이북 업종별 무이자할부 상세",
          url: detailUrl,
          period
        },
        overrides
      );
    }

    errors.push("페이북 이벤트 목록에서 현재 적용 중인 업종별 무이자할부 글을 찾지 못했습니다.");
  } catch (error) {
    errors.push(`${listSource.label}: ${error.message}`);
  }

  return collectCandidateUrls(source, errors);
}

async function collectIbk(source, errors = []) {
  const listSource = source.urls[0];

  try {
    const listPage = await fetchSource(listSource.url);
    const keywords = listSource.searchKeywords || [];
    const hasKeyword = hasIbkInstallmentKeyword(listPage.text, keywords);
    let targetPage = listPage;
    let targetUrl = listSource.url;
    let targetLabel = listSource.label;

    if (hasKeyword) {
      const detailUrl = findIbkDetailUrl(listPage.html, keywords);
      if (detailUrl) {
        targetPage = await fetchSource(detailUrl);
        targetUrl = detailUrl;
        targetLabel = "공식 생활편의/무이자할부 이벤트";
      }
    }

    const overrides = hasKeyword
      ? extractIbkIndustryPolicies(targetPage.text, targetUrl)
      : [];
    return buildPolicyFromPage(
      source,
      targetPage,
      {
        label: hasKeyword ? targetLabel : "공식 진행중 이벤트 검색결과 없음",
        url: targetUrl
      },
      overrides,
      hasKeyword ? {} : { period: "검색결과 없음" }
    );
  } catch (error) {
    errors.push(`${listSource.label}: ${error.message}`);
  }

  return unavailablePolicy(source, errors);
}

async function collectNonghyup(source, errors = []) {
  const listSource = source.urls.find((candidate) => candidate.priority === "primary") || source.urls[0];
  const detailSource = source.urls.find(
    (candidate) => candidate.priority === "fallback-detail"
  );

  try {
    const listPage = await fetchSource(listSource.url);
    const detail = findNonghyupInstallmentDetail(
      listPage.html,
      listPage.text,
      listSource.searchKeywords
    );

    if (detail) {
      const detailPage = await fetchSource(detail.url);
      return buildPolicyFromPage(source, detailPage, {
        label: detail.title,
        url: detail.url,
        period: detailSource?.period
      });
    }

    errors.push("공식 이벤트 목록에서 무이자할부 상세 글을 찾지 못했습니다.");
  } catch (error) {
    errors.push(`${listSource.label}: ${error.message}`);
  }

  if (detailSource) {
    try {
      const detailPage = await fetchSource(detailSource.url);
      return buildPolicyFromPage(source, detailPage, detailSource, [], { errors });
    } catch (error) {
      errors.push(`${detailSource.label}: ${error.message}`);
    }
  }

  return unavailablePolicy(source, errors);
}

async function collectHyundai(source, errors = []) {

  for (const candidate of currentCandidateUrls(source)) {
    try {
      const page = await fetchSource(candidate.url);
      return buildPolicyFromPage(
        source,
        page,
        candidate,
        extractHyundaiIndustryPolicies(page.text, candidate.url)
      );
    } catch (error) {
      errors.push(`${candidate.label}: ${error.message}`);
    }
  }

  return null;
}

const CARD_COLLECTORS = {
  bc: collectBc,
  hana: collectHana,
  hyundai: collectHyundai,
  ibk: collectIbk,
  kb: collectKb,
  nonghyup: collectNonghyup,
  shinhan: collectShinhan,
  woori: collectWoori
};

async function collectOne(source) {
  const collector = CARD_COLLECTORS[source.id] || collectCandidateUrls;
  const errors = [];
  return (await collector(source, errors)) || unavailablePolicy(source, errors);
}

export async function collectPolicies() {
  const policies = await Promise.all(CARD_SOURCES.map(collectOne));
  const collectedCount = policies.filter(
    (policy) => policy.status === "collected"
  ).length;
  const reflectedCount = policies.filter((policy) => policy.reflectedAt).length;
  const reflectedAt = policies
    .map((policy) => policy.reflectedAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  return {
    generatedAt: new Date().toISOString(),
    reflectedAt,
    targetPeriod: CURRENT_MONTH_PERIOD,
    collectedCount,
    reflectedCount,
    totalCount: policies.length,
    policies
  };
}
