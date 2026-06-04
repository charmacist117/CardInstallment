const STATUS_LABELS = {
  collected: "수집됨",
  fallback: "보조값",
  unavailable: "확인 필요"
};

let policies = [];
let selectedIndustryId = "all";

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul"
  }).format(new Date(value));
}

function monthScore(months) {
  return months.reduce((score, item) => {
    const numbers = item.match(/\d+/g)?.map(Number) || [];
    return Math.max(score, ...numbers, 0);
  }, 0);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getSelectedIndustry(policy) {
  const industryPolicies = policy.industryPolicies || [];
  return (
    industryPolicies.find((item) => item.id === selectedIndustryId) ||
    industryPolicies.find((item) => item.id === "all") ||
    industryPolicies[0] ||
    null
  );
}

function getComparableMonths(policy) {
  const selectedIndustry = getSelectedIndustry(policy);
  return selectedIndustry?.noInterestMonths || policy.noInterestMonths || [];
}

function updateBestMonth() {
  const bestMonth = monthScore(policies.flatMap(getComparableMonths));
  document.querySelector("#bestMonth").textContent = bestMonth
    ? `${bestMonth}개월`
    : "-";
}

function isConfirmedNone(industry) {
  return industry?.minimumAmount === "없음";
}

function formatNoInterestMonths(industry, policy) {
  const months = industry?.noInterestMonths || policy.noInterestMonths || [];
  if (months.length) return months.join(", ");
  return isConfirmedNone(industry) ? "검색결과 없음" : "원문 확인";
}

function formatPartialMonths(industry, policy) {
  const months = industry?.partialMonths || policy.partialMonths || [];
  if (months.length) return months.join(", ");
  return isConfirmedNone(industry) ? "검색결과 없음" : "없음 또는 미확인";
}

function formatMinimumAmount(industry, policy) {
  if (isConfirmedNone(industry)) return "검색결과 없음";
  if (industry?.minimumAmount) return industry.minimumAmount;
  return policy.minimumAmount || "가맹점별 상이";
}

function populateIndustryFilter() {
  const select = document.querySelector("#industryFilter");
  const industryMap = new Map();

  for (const policy of policies) {
    for (const industry of policy.industryPolicies || []) {
      if (!industryMap.has(industry.id)) {
        industryMap.set(industry.id, industry.label);
      }
    }
  }

  select.innerHTML = [...industryMap.entries()]
    .map(
      ([id, label]) =>
        `<option value="${escapeHtml(id)}" ${
          id === selectedIndustryId ? "selected" : ""
        }>${escapeHtml(label)}</option>`
    )
    .join("");
  select.disabled = industryMap.size === 0;
}

function render() {
  const query = document.querySelector("#searchInput").value.trim().toLowerCase();
  const grid = document.querySelector("#policyGrid");
  const filtered = policies
    .filter((policy) => {
      if (!query) return true;
      const industries = (policy.industryPolicies || []).flatMap((item) => [
        item.label,
        ...(item.noInterestMonths || []),
        ...(item.partialMonths || []),
        ...(item.notes || [])
      ]);
      const haystack = [
        policy.issuer,
        policy.period,
        policy.minimumAmount,
        ...(policy.noInterestMonths || []),
        ...(policy.partialMonths || []),
        ...(policy.notes || []),
        ...industries
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort(
      (a, b) =>
        monthScore(getComparableMonths(b)) - monthScore(getComparableMonths(a))
    );

  grid.innerHTML = filtered
    .map((policy) => {
      const selectedIndustry = getSelectedIndustry(policy);
      const noInterestText = formatNoInterestMonths(selectedIndustry, policy);
      const partialText = formatPartialMonths(selectedIndustry, policy);
      const minimumAmount = formatMinimumAmount(selectedIndustry, policy);
      const industryNotes = (selectedIndustry?.notes || [])
        .map((note) => `<li>${escapeHtml(note)}</li>`)
        .join("");
      const notes = (policy.notes || [])
        .map((note) => `<li>${escapeHtml(note)}</li>`)
        .join("");
      const detectedEvents = (policy.detectedEvents || [])
        .map(
          (event) =>
            `<li><strong>${escapeHtml(event.title)}</strong><span>${escapeHtml(event.period)}</span></li>`
        )
        .join("");
      const eventList = detectedEvents
        ? `<div class="events"><span>공식 페이지 감지</span><ul>${detectedEvents}</ul></div>`
        : "";
      const source = policy.sourceUrl
        ? `<a class="sourceLink" href="${escapeHtml(policy.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(policy.sourceLabel || "원문 보기")}</a>`
        : "";

      return `
        <article class="card">
          <div class="cardHeader">
            <span class="brandMark" style="background-color: ${escapeHtml(policy.brandColor)}" aria-hidden="true"></span>
            <div>
              <h2>${escapeHtml(policy.issuer)}</h2>
              <p>${escapeHtml(policy.period)}</p>
            </div>
            <span class="badge ${escapeHtml(policy.status)}">${escapeHtml(STATUS_LABELS[policy.status] || policy.status)}</span>
          </div>

          <div class="selectedIndustry">
            <span>비교 업종</span>
            <strong>${escapeHtml(selectedIndustry?.label || "전체/일반")}</strong>
          </div>

          <div class="policyRows">
            <div>
              <span>무이자할부</span>
              <strong>${escapeHtml(noInterestText)}</strong>
            </div>
            <div>
              <span>부분무이자</span>
              <strong>${escapeHtml(partialText)}</strong>
            </div>
            <div>
              <span>결제금액</span>
              <strong>${escapeHtml(minimumAmount)}</strong>
            </div>
          </div>

          ${industryNotes ? `<ul class="notes industryNotes">${industryNotes}</ul>` : ""}
          <ul class="notes">${notes}</ul>
          ${eventList}
          ${source}
        </article>
      `;
    })
    .join("");

  updateBestMonth();
}

async function loadPolicies() {
  const notice = document.querySelector("#notice");

  try {
    const response = await fetch("/api/policies");
    const payload = await response.json();
    policies = payload.policies || [];

    populateIndustryFilter();
    document.querySelector("#updatedAt").textContent =
      formatTime(payload.generatedAt) || "조회 완료";
    document.querySelector("#totalCount").textContent = policies.length || "-";
    document.querySelector("#collectedCount").textContent = payload.totalCount
      ? `${payload.collectedCount || 0}/${payload.totalCount}`
      : "-";
    notice.hidden = true;
    render();
  } catch (error) {
    notice.textContent = `수집 API 호출에 실패했습니다: ${error.message}`;
    notice.classList.add("error");
  }
}

document.querySelector("#searchInput").addEventListener("input", render);
document.querySelector("#industryFilter").addEventListener("change", (event) => {
  selectedIndustryId = event.target.value;
  render();
});
loadPolicies();
