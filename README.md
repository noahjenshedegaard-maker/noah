# ListingLift

AI product-listing writer for Etsy, Shopify, Amazon and eBay sellers, powered by Claude.

A seller pastes rough product notes, picks a marketplace, and gets a search-friendly title,
description and tags/bullets that follow that platform's character limits. The listing streams in live.

## Run it

You need Node.js 22 or later and an Anthropic API key from https://console.anthropic.com/.

```bash
npm install
cp .env.example .env      # then paste your key into .env
npm start
```

Open http://localhost:3000.

## How it works

- `server.js`: a small Node server with no framework. `POST /api/generate` sends the product notes to Claude and streams the reply back.
- `public/index.html`: the whole front end in one file.
- Free tier: each visitor gets `FREE_DAILY_LIMIT` listings per day. The counter is kept in memory, so it resets when the server restarts.

## Before charging money

1. **Payments**: add Stripe Checkout (or Lemon Squeezy) for a Pro plan and skip the free limit for paying users.
2. **Accounts**: add login (for example Clerk or Supabase Auth) so limits follow the user, not their IP address.
3. **Hosting**: deploy to Render, Railway or Fly.io and set `ANTHROPIC_API_KEY` as a secret there.
4. **Costs**: every listing is a paid API call. Set a spend limit in the Anthropic Console.
