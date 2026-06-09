import { collectPolicies } from "../lib/scraper.js";

const payload = await collectPolicies();
process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
