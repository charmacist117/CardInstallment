import { CARD_SOURCES } from "./cardSources.js";

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; CardPolicyViewer/0.1; +https://vercel.app)",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

function compact(value) {
  return value.replace(/\s+/g, " ").trim();
}

function htmlToText(html) {
  return compact(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#40;/g, "(")
      .replace(/&#41;/g, ")")
  );
}

function uniq(values) {
  return [...new Set(values.filter(Boolean).map((value) => compact(value)))];
}

function findPeriod(text) {
  const patterns = [
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*[~\-–]\s*(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일/,
    /(\d{4})[.\-]\s*(\d{1,2})[.\-]\s*(\d{1,2})\s*[~\-–]\s*(?:(\d{4})[.\-]\s*)?(\d{1,2})[.\-]\s*(\d{1,2})/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const endYear = match[4] || match[1];
    return `${match[1]}년 ${match[2]}월 ${match[3]}일 ~ ${endYear}년 ${match[5]}월 ${match[6]}일`;
  }

  const monthMatch = text.match(/(\d{4})년\s*(\d{1,2})월/);
  return monthMatch ? `${monthMatch[1]}년 ${monthMatch[2]}월 공지` : "";
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

function buildPolicyFromText(source, pageText) {
  const scopedText =
    source.urls.length > 1 || source.urls[0]?.priority === "secondary"
      ? issuerWindow(pageText, source.issuer)
      : pageText;
  const fallback = source.fallback;
  const noInterestMonths = findNoInterestMonths(scopedText);
  const partialMonths = findPartialMonths(scopedText);

  return {
    id: source.id,
    issuer: source.issuer,
    brandColor: source.brandColor,
    period: findPeriod(scopedText) || findPeriod(pageText) || fallback.period,
    noInterestMonths: noInterestMonths.length
      ? noInterestMonths
      : fallback.noInterestMonths,
    partialMonths: partialMonths.length ? partialMonths : fallback.partialMonths,
    minimumAmount:
      findMinimumAmount(scopedText) ||
      findMinimumAmount(pageText) ||
      fallback.minimumAmount,
    notes: fallback.notes,
    status: noInterestMonths.length ? "collected" : "fallback",
    sourceLabel: "",
    sourceUrl: "",
    updatedAt: new Date().toISOString()
  };
}

async function fetchSource(url) {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return htmlToText(await response.text());
}

async function collectOne(source) {
  const errors = [];

  for (const candidate of source.urls) {
    try {
      const text = await fetchSource(candidate.url);
      const policy = buildPolicyFromText(source, text);
      return {
        ...policy,
        sourceLabel: candidate.label,
        sourceUrl: candidate.url
      };
    } catch (error) {
      errors.push(`${candidate.label}: ${error.message}`);
    }
  }

  return {
    id: source.id,
    issuer: source.issuer,
    brandColor: source.brandColor,
    ...source.fallback,
    status: "unavailable",
    sourceLabel: source.urls[0]?.label || "원문",
    sourceUrl: source.urls[0]?.url || "",
    errors,
    updatedAt: new Date().toISOString()
  };
}

export async function collectPolicies() {
  const policies = await Promise.all(CARD_SOURCES.map(collectOne));
  const collectedCount = policies.filter(
    (policy) => policy.status === "collected"
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    collectedCount,
    totalCount: policies.length,
    policies
  };
}
