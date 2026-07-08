import { collectPolicies } from "../lib/scraper.js";
import { currentKstMonthPeriod } from "../lib/time.js";

export default async function handler(request, response) {
  try {
    const payload = await collectPolicies();

    response.setHeader("Cache-Control", "no-store, max-age=0");
    response.setHeader("X-Refresh-Basis", "On request + Vercel cron");
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
