import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3000);
const FREE_DAILY_LIMIT = Number(process.env.FREE_DAILY_LIMIT ?? 5);
const MAX_INPUT_CHARS = 4000;

const client = new Anthropic();

const PLATFORMS = {
  etsy: "Etsy (title max 140 chars, exactly 13 tags of max 20 chars each, warm handmade tone)",
  shopify: "Shopify (SEO title under 70 chars, meta description under 160 chars, scannable HTML-free description)",
  amazon: "Amazon (title under 200 chars, 5 benefit-led bullet points, backend search terms under 250 bytes)",
  ebay: "eBay (title max 80 chars, item specifics list, clear condition and shipping notes)",
};

const SYSTEM_PROMPT = `You are an expert e-commerce copywriter and marketplace SEO specialist.
You write product listings that rank well in marketplace search and convert browsers into buyers.

Rules:
- Only state facts the seller provided. Never invent materials, dimensions, certifications or claims.
  If something important is missing (size, material, care), add a short "Seller checklist" at the end listing what to fill in.
- Respect every character limit for the target platform exactly.
- Lead with the buyer's benefit, then the features.
- Use plain Markdown: a "## Title" section, a "## Description" section, and a section for the platform's keywords/tags/bullets.
- No preamble or sign-off; output the listing only.`;

// In-memory usage counter: visitor IP -> { day, count }. Resets on restart.
const usage = new Map();

function underFreeLimit(ip) {
  if (FREE_DAILY_LIMIT <= 0) return true;
  const day = new Date().toISOString().slice(0, 10);
  const entry = usage.get(ip);
  if (!entry || entry.day !== day) {
    usage.set(ip, { day, count: 1 });
    return true;
  }
  if (entry.count >= FREE_DAILY_LIMIT) return false;
  entry.count += 1;
  return true;
}

async function readJson(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 20_000) throw new Error("Request too large");
  }
  return JSON.parse(body);
}

async function handleGenerate(req, res) {
  let input;
  try {
    input = await readJson(req);
  } catch {
    res.writeHead(400, { "content-type": "application/json" });
    return res.end(JSON.stringify({ error: "Invalid request." }));
  }

  const product = String(input.product ?? "").trim();
  const platform = PLATFORMS[input.platform] ? input.platform : "etsy";
  if (!product || product.length > MAX_INPUT_CHARS) {
    res.writeHead(400, { "content-type": "application/json" });
    return res.end(JSON.stringify({ error: `Describe your product in 1-${MAX_INPUT_CHARS} characters.` }));
  }

  if (!underFreeLimit(req.socket.remoteAddress ?? "unknown")) {
    res.writeHead(429, { "content-type": "application/json" });
    return res.end(JSON.stringify({ error: "You've used today's free listings. Upgrade to Pro for unlimited." }));
  }

  res.writeHead(200, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-cache" });

  try {
    const stream = client.beta.messages.stream({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      output_config: { effort: "low" },
      // If a request is declined by a safety classifier, the API retries it on a fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Target platform: ${PLATFORMS[platform]}\n\nProduct details from the seller:\n${product}`,
        },
      ],
    });

    stream.on("text", (text) => res.write(text));
    const message = await stream.finalMessage();
    if (message.stop_reason === "refusal") {
      res.write("\n\n[This product couldn't be written up. Try rephrasing the description.]");
    } else if (message.stop_reason === "max_tokens") {
      res.write("\n\n[Output was cut off. Try a shorter description.]");
    }
  } catch (err) {
    console.error(err);
    if (err instanceof Anthropic.AuthenticationError) {
      res.write("\n\n[Server error: the ANTHROPIC_API_KEY is missing or invalid.]");
    } else if (err instanceof Anthropic.RateLimitError) {
      res.write("\n\n[We're busy right now. Please try again in a minute.]");
    } else {
      res.write("\n\n[Something went wrong generating your listing. Please try again.]");
    }
  }
  res.end();
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/generate") {
    return handleGenerate(req, res);
  }
  if (req.method === "GET" && req.url === "/api/health") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ ok: true, hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY) }));
  }
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    const html = await fs.readFile(path.join(here, "public", "index.html"));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(html);
  }
  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`ListingLift running at http://localhost:${PORT}`);
});
