const STATUS_LABELS = {
  collected: "수집됨",
  fallback: "보조값",
  unavailable: "확인 필요"
};

let policies = [];
const selectedIndustries = {};

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
  const selectedIndustryId =
    selectedIndustries[policy.id] || industryPolicies[0]?.id || "";

  return (
    industryPolicies.find((item) => item.id === selectedIndustryId) ||
    industryPolicies[0] ||
    null
  );
}

function renderIndustrySelector(policy, selectedIndustry) {
  const industryPolicies = policy.industryPolicies || [];
  if (!industryPolicies.length) return "";

  return `
    <label class="industrySelect">
      <span>업종 선택</span>
      <select data-policy-id="${escapeHtml(policy.id)}">
        ${industryPolicies
          .map(
            (item) =>
              `<option value="${escapeHtml(item.id)}" ${
                item.id === selectedIndustry?.id ? "selected" : ""
              }>${escapeHtml(item.label)}</option>`
          )
          .join("")}
      </select>
    </label>
  `;
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
        monthScore(b.noInterestMonths || []) -
        monthScore(a.noInterestMonths || [])
    );

  grid.innerHTML = filtered
    .map((policy) => {
      const selectedIndustry = getSelectedIndustry(policy);
      const noInterestMonths =
        selectedIndustry?.noInterestMonths || policy.noInterestMonths || [];
      const partialMonths =
        selectedIndustry?.partialMonths || policy.partialMonths || [];
      const minimumAmount =
        selectedIndustry?.minimumAmount || policy.minimumAmount || "";
      const industrySelector = renderIndustrySelector(policy, selectedIndustry);
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

          <div class="policyRows">
            ${industrySelector}
            <div>
              <span>무이자할부</span>
              <strong>${escapeHtml(noInterestMonths.length ? noInterestMonths.join(", ") : "원문 확인")}</strong>
            </div>
            <div>
              <span>부분무이자</span>
              <strong>${escapeHtml(partialMonths.length ? partialMonths.join(", ") : "없음 또는 미확인")}</strong>
            </div>
            <div>
              <span>결제금액</span>
              <strong>${escapeHtml(minimumAmount || "가맹점별 상이")}</strong>
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

  grid.querySelectorAll(".industrySelect select").forEach((select) => {
    select.addEventListener("change", (event) => {
      selectedIndustries[event.target.dataset.policyId] = event.target.value;
      render();
    });
  });
}

async function loadPolicies() {
  const notice = document.querySelector("#notice");

  try {
    const response = await fetch("/api/policies");
    const payload = await response.json();
    policies = payload.policies || [];

    document.querySelector("#updatedAt").textContent =
      formatTime(payload.generatedAt) || "조회 완료";
    document.querySelector("#totalCount").textContent = policies.length || "-";
    document.querySelector("#collectedCount").textContent = payload.totalCount
      ? `${payload.collectedCount || 0}/${payload.totalCount}`
      : "-";
    const bestMonth = monthScore(
      policies.flatMap((policy) => policy.noInterestMonths || [])
    );
    document.querySelector("#bestMonth").textContent = bestMonth
      ? `${bestMonth}개월`
      : "-";
    notice.hidden = true;
    render();
  } catch (error) {
    notice.textContent = `수집 API 호출에 실패했습니다: ${error.message}`;
    notice.classList.add("error");
  }
}

document.querySelector("#searchInput").addEventListener("input", render);
loadPolicies();
