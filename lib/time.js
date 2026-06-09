export const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function getKstDate(value = new Date()) {
  return new Date(value.getTime() + KST_OFFSET_MS);
}

export function getCurrentKstMonth(value = new Date()) {
  return getKstDate(value).getUTCMonth() + 1;
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
