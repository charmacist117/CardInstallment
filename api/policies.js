import { collectPolicies } from "../lib/scraper.js";
import {
  currentKstMonthPeriod,
  secondsUntilNextRefresh
} from "../lib/time.js";

export default async function handler(request, response) {
  try {
    const payload = await collectPolicies();
    const maxAge = secondsUntilNextRefresh();

    response.setHeader(
      "Cache-Control",
      `s-maxage=${maxAge}, stale-while-revalidate=600`
    );
    response.setHeader("X-Refresh-Basis", "Every 6 hours");
    response.status(200).json(payload);
  } catch (error) {
    response.status(500).json({
      generatedAt: new Date().toISOString(),
      reflectedAt: "",
      targetPeriod: currentKstMonthPeriod(),
      error: error.message,
      policies: []
    });
  }
}
