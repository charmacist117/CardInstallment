# 카드 무이자할부 정책 조회

카드사별 무이자할부 안내 페이지와 PG사의 월간 통합 공지를 수집해 현재 적용 가능한 할부 기간을 보여주는 Vercel용 앱입니다.

## 실행

정적 화면은 `index.html`을 열어서 확인할 수 있습니다. API는 Vercel 배포 후 `/api/policies`에서 동작합니다.

## Vercel 배포

1. 이 폴더를 GitHub 저장소로 올립니다.
2. Vercel에서 새 프로젝트를 만들고 저장소를 연결합니다.
3. Framework Preset은 `Other` 또는 자동 감지를 사용합니다.
4. 배포 후 첫 화면과 `/api/policies`가 카드사별 수집 결과를 반환하는지 확인합니다.

## 수집 방식

- `lib/cardSources.js`에 카드사별 공식/보조 URL을 둡니다.
- `/api/policies`는 각 URL의 HTML을 가져와 텍스트로 바꾼 뒤 기간, 무이자 개월, 부분무이자, 최소 결제금액을 추출합니다.
- 화면에서는 하나의 업종 드롭다운으로 전체 카드사의 업종별 정책을 비교하며, `lib/industryPolicies.js`의 업종별 보정값을 함께 표시합니다.
- Vercel Cron은 매일 00:00 KST(UTC 15:00)에 API를 호출해 최신 페이지를 미리 데워 둡니다.

카드사 페이지 구조가 바뀌거나 이미지/PDF로만 공지되는 경우 자동 추출이 제한될 수 있습니다. 이때 앱에는 원문 링크와 수집 상태가 함께 표시됩니다.

## 유지보수 구조

- `lib/industryCatalog.js`: 업종 ID, 화면 표시명, 드롭다운 노출 순서를 관리합니다.
- `lib/cardSources.js`: 카드사별 공식 URL, 검색 URL, 보조 상세 URL을 관리합니다.
- `lib/industryPolicies.js`: 카드사별로 직접 검증한 업종별 보정값을 관리합니다.
- `lib/policyDefaults.js`: 검색결과 없음, 세금 수수료 안내, 세금 세부 카테고리 생성 등 공통 후처리 규칙을 관리합니다.
- `lib/scraper.js`: 카드사 페이지 수집, 텍스트 추출, 카드사별 특수 탐색 로직을 관리합니다.
- `lib/time.js`: KST 기준 월/자정/캐시 만료 계산을 관리합니다.
- `api/policies.js`: Vercel 서버리스 API 진입점입니다. 수집 로직은 `lib/scraper.js`를 호출합니다.
- `scripts/exportPolicies.js`: Vercel 외 환경에서 같은 수집 결과를 JSON으로 출력하는 CLI 진입점입니다.

## 변경/추가 방법

1. 새 업종을 추가하려면 `lib/industryCatalog.js`에 업종 ID와 표시명을 추가하고, 화면에 노출할 경우 `VISIBLE_INDUSTRY_ORDER`에도 넣습니다.
2. 카드사별 공식 URL이 바뀌면 `lib/cardSources.js`의 해당 카드 URL을 수정합니다.
3. 공식 페이지에서 확인한 업종별 조건은 `lib/industryPolicies.js`에 카드사 ID별로 추가합니다.
4. 여러 카드사에 공통으로 적용되는 표시 규칙이나 안내문은 `lib/policyDefaults.js`에 추가합니다.
5. 카드사 페이지 탐색 방식이 바뀌면 `lib/scraper.js`의 해당 카드 collector 또는 추출 함수를 수정합니다.

## 로컬/외부 실행

- 문법 확인: `npm run check`
- JSON 수집 결과 출력: `npm run export:policies`

`export:policies`는 Vercel이 아닌 로컬 스케줄러, GitHub Actions, 다른 서버에서도 같은 수집 모듈을 재사용할 때 사용할 수 있습니다.
