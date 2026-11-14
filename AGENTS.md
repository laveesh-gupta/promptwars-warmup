<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Hackathon Vibe-Coding Rules
- Keep everything on a single clean, responsive page (`src/app/page.tsx`). No auth or complex databases.
- Always route Gemini API calls through `src/app/api/generate/route.ts` using `process.env.GEMINI_API_KEY`. Never expose keys in client components.
- Always include a prominent "Load Sample Data" button so judges can test the core workflow in 1 click.
- Display loading skeletons during AI generation and render structured, readable UI cards—never raw JSON dumps.

Always use /api/generate for Gemini calls; never import @google/genai in client components.