# WardAir

A single-page civic air-quality action desk. Bring local particulate readings, review the interpretation, inspect source-linked evidence and prepare an action brief for a ward team, housing society or school.

## Run locally

Requires Node.js 20.9+ and npm.

```bash
npm ci
cp .env.example .env.local
# Set your server-only GEMINI_API_KEY and a model accessible to your project.
npm run dev
```

Open http://localhost:3000. **Load Sample Data** works immediately without a key or quota. It displays a clearly labeled fictional, precomputed brief. **Load period 2** demonstrates a changing observed hotspot and a sensor outage. Change the requester and reload the sample to explore different actions.

For a live run: paste/upload → **Analyze with Gemini** → review and correct/exclude rows → **Confirm & generate brief**. **Review locally** parses the documented column format without sending data to Google. Context changes mark the existing brief stale; explicitly regenerate after review. Live successful briefs are saved automatically; sample briefs have an explicit Save button.

## Environment

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Server-only Gemini key; never use a `NEXT_PUBLIC_` name |
| `GEMINI_MODEL` | Structured-output model with generation access in your project |

The local project successfully generated a basic response with `gemini-3.1-flash-lite`; availability and quotas remain project dependent. Listing a model does not guarantee generation access. `.env.example` contains no key. `.env.local` is ignored by Git. Do not overwrite an existing key when copying the example.

All Gemini calls go through `src/app/api/generate/route.ts`. There are two explicit operations: normalization, then briefing. The SDK has a 45-second request timeout and one attempt; no automatic retries. User cancellation aborts the request. Requests are capped while reading the body, including requests without a Content-Length header.

## Supported data

CSV, TSV or TXT, pasted or uploaded. For local parsing use:

```csv
site,pollutant,value,unit,timestamp,period
School gate,PM2.5,0.086,mg/m3,2026-11-10T08:00+05:30,spot
School gate,PM2.5,94,ug/m3,2026-11-10T09:00+05:30,spot
```

- Maximum 100 KB source text / 500 data rows, 2,000 normalized observations, 1 MB API request.
- Explicit PM2.5 and PM10 mass-concentration readings; mg/m³ converts to µg/m³. Gas concentrations and unspecified AQI scales are unsupported.
- Explicit ISO timestamp with timezone offset and an averaging-period label. Ambiguous dates, unknown units, negative/missing values, unusually high values and sensor-error rows require review and remain excluded by default.
- Quoted CSV fields, decimal comma in TSV/semicolon tables, repeated headers and duplicates are handled. Multiline quoted CSV records are not supported.
- No expected cadence is inferred: the UI reports sample counts and unknown expected coverage. It does not calculate an official AQI or regulatory daily average.
- Comparisons require the same locality, timezone, exact site name, pollutant, averaging period, count and timestamp time slots, with different reporting dates. These are observational changes, never causal effects. Standardize site aliases during review.

## Evidence and privacy

Metrics are computed deterministically on the server. Model output references allowed metric IDs; numerical readings render from metric objects. Evidence views show the calculation, included observations, exclusions and original source lines. Shape/reference checks do not independently prove every qualitative model statement: human review remains essential.

Data sent for Gemini analysis is processed by Google under its [Gemini API terms](https://ai.google.dev/gemini-api/terms). Supply environmental readings without personal identifiers. General exposure precautions cite [WHO guidance](https://www.who.int/news-room/questions-and-answers/item/air-pollution-personal-interventions-and-risk-communication), reviewed 14 November 2026. The app provides operational drafts, not diagnosis or health bands. Sample Hindi/Marathi drafts still need fluent human review.

Up to eight successful briefs and their action states are stored in versioned browser localStorage. History is local to that browser, with validated JSON export/import and clear controls. Full uploaded text is not persisted; observation source excerpts needed for evidence are retained. No auth, database, live feeds, maps, OCR, XLSX or PDF import.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
# Optional: two real Gemini requests with only fictional sample data.
node scripts/smoke.cjs
```

Tests cover provenance/conversion, duplicate/missing/zero handling, quoted CSV, matched comparisons and outage exclusions, zero baselines, evidence rejection, history integrity and API validation/failure paths. They mock the provider and do not consume quota. The optional smoke test loads `.env.local` and does not print credentials.

The UI uses responsive native global CSS. The starter Tailwind Turbopack loader was removed after its CSS subprocess failed to bind a port in this environment; the installed Next.js native CSS pipeline builds successfully. Cache Components and partial prefetching remain enabled.

## Vercel release

1. Push the repository to GitHub, then import it as a Next.js project in Vercel.
2. Set `GEMINI_API_KEY` and `GEMINI_MODEL` for the intended Preview/Production environments. Redeploy after changing environment variables.
3. Keep the standard `npm run build` command. The generation route exports `maxDuration = 60`; confirm that your Vercel plan supports this duration.
4. Configure available Vercel firewall/rate-limit protections before sharing a public live endpoint. The browser quota cooldown is not distributed server abuse protection. This app does not implement distributed rate limiting.
5. Preview-test the complete sample flow, narrow screens, keyboard/focus, long translations, clipboard/download and print. Review translations with fluent speakers.
6. Test one small live table, quota/error recovery, and refresh/history. Confirm no secrets or uploaded source text appear in logs. Only request ID, operation, duration and error code are logged.

No production deployment has been created by this implementation. Browser visual/accessibility/print verification requires a working browser preview service.
