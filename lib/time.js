export const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function getKstDate(value = new Date()) {
  return new Date(value.getTime() + KST_OFFSET_MS);
}

export function getCurrentKstMonth(value = new Date()) {
  return getKstDate(value).getUTCMonth() + 1;
}

export function getCurrentKstYear(value = new Date()) {
  return getKstDate(value).getUTCFullYear();
}

export function currentKstMonthPeriod(value = new Date()) {
  const kstDate = getKstDate(value);
  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth() + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return `${year}년 ${month}월 1일 ~ ${year}년 ${month}월 ${lastDay}일`;
}

export function currentKstMidnightIso(value = new Date()) {
  const kstDate = getKstDate(value);
  const kstMidnightUtcMs =
    Date.UTC(
      kstDate.getUTCFullYear(),
      kstDate.getUTCMonth(),
      kstDate.getUTCDate(),
      0,
      0,
      0
    ) - KST_OFFSET_MS;

  return new Date(kstMidnightUtcMs).toISOString();
}

export function secondsUntilNextKstMidnight(now = new Date()) {
  const kstNow = getKstDate(now);
  const nextKstMidnightUtcMs =
    Date.UTC(
      kstNow.getUTCFullYear(),
      kstNow.getUTCMonth(),
      kstNow.getUTCDate() + 1,
      0,
      0,
      0
    ) - KST_OFFSET_MS;

  return Math.max(60, Math.floor((nextKstMidnightUtcMs - now.getTime()) / 1000));
}

export function secondsUntilNextRefresh(now = new Date()) {
  const kstNow = getKstDate(now);
  const nextRefreshHour = Math.floor(kstNow.getUTCHours() / 6) * 6 + 6;
  const nextRefreshUtcMs =
    Date.UTC(
      kstNow.getUTCFullYear(),
      kstNow.getUTCMonth(),
      kstNow.getUTCDate(),
      nextRefreshHour,
      0,
      0
    ) - KST_OFFSET_MS;

  return Math.max(60, Math.floor((nextRefreshUtcMs - now.getTime()) / 1000));
}
