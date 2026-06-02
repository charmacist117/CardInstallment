import { collectPolicies } from "../lib/scraper.js";

export default async function handler(request, response) {
  try {
    const payload = await collectPolicies();
    response.setHeader(
      "Cache-Control",
      "s-maxage=21600, stale-while-revalidate=86400"
    );
    response.status(200).json(payload);
  } catch (error) {
    response.status(500).json({
      generatedAt: new Date().toISOString(),
      error: error.message,
      policies: []
    });
  }
}
