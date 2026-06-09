import { collectPolicies } from "../lib/scraper.js";
import {
  currentKstMidnightIso,
  secondsUntilNextKstMidnight
} from "../lib/time.js";

export default async function handler(request, response) {
  try {
    const payload = await collectPolicies();
    const maxAge = secondsUntilNextKstMidnight();

    response.setHeader(
      "Cache-Control",
      `s-maxage=${maxAge}, stale-while-revalidate=3600`
    );
    response.setHeader("X-Refresh-Basis", "00:00 Asia/Seoul");
    response.status(200).json(payload);
  } catch (error) {
    response.status(500).json({
      generatedAt: currentKstMidnightIso(),
      error: error.message,
      policies: []
    });
  }
}
