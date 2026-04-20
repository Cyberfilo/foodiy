# Foodiy

An iOS-first PWA for logging meals via photo, scoring them against a diet, and tracking weekly nutrition with an Italian-cuisine (CREA) bias. Family-sized (3–4 users), hosted on Railway.

## What this app is

User snaps a photo of a plate → OpenAI vision model identifies ingredients, weights, and cooking method → user reviews/adjusts the preview → app persists the meal, auto-groups it into breakfast/lunch/dinner, scores it 0–10 against the user's active diet, and rolls stats into a daily/weekly dashboard. A "Favorites" system lets users re-log frequent meals with one tap. A "Diet" uploader accepts pasted text or a file and extracts structured targets via OpenAI.

## Core flow end-to-end

```
Safari (PWA, Home Screen)
  → POST /api/auth/login       [name + PIN]  → HTTP-only JWT cookie
  → GET  /                     [Today view]  reads Meal rows for today, groups, renders rings + macro bars
  → Tap "+ camera"
      → /snap
      → User takes photo
      → POST /api/meals/analyze  (multipart: image)
          · saves image to /data/uploads (Railway volume)
          · calls OpenAI (model from OPENAI_MODEL env)
          · enriches ingredient names via CREA lookup
          · returns StructuredMeal {ingredients[], mealTypeGuess, clarifyingQuestions[]}
      → (optional) one-round clarification
      → User adjusts grams/cooking method
      → POST /api/meals  (confirmed meal)
          · scores vs active diet (lib/nutrition/scoring)
          · persists Meal + MealIngredient rows
          · returns meal with score
  → Today page refreshes
  → /week (Recharts multi-line: target vs actual per day)
  → /memory (grid gallery of meal photos, filter by week/month)
  → /favorites (one-tap relog; snapshot of ingredients + nutrition)
  → /diet (upload or paste plan; parsed via OpenAI; set as active)
```

## File inventory

### Config / root
- `package.json` — deps + scripts (`npm run dev`, `build`, `start`, `db:migrate`, `db:seed`)
- `tsconfig.json` — strict TypeScript
- `next.config.mjs` — PWA headers, standalone output for Railway
- `tailwind.config.ts` / `postcss.config.mjs` — styling
- `prisma/schema.prisma` — DB schema
- `prisma/seed.ts` — seed admin user + CREA data
- `.env.example` — env var contract (see "Hosting" below)
- `railway.json` — Railway deployment config
- `CLAUDE.md` — this file

### `src/lib/` (shared; no React)
- `db/prisma.ts` — Prisma client singleton (hot-reload safe)
- `auth/session.ts` — JWT encode/decode (jose), cookie name constants
- `auth/password.ts` — PIN hashing (bcryptjs)
- `auth/middleware-helper.ts` — getSessionUser() for API routes
- `ai/adapter.ts` — `MealAnalyzer` interface; `DietParser` interface
- `ai/openai-adapter.ts` — OpenAI implementation; uses `OPENAI_MODEL` env
- `ai/prompts.ts` — system prompts (meal analysis, diet parsing) with CREA/Italian bias
- `ai/schemas.ts` — Zod schemas for AI responses
- `nutrition/crea-data.ts` — curated Italian food composition table (~70 staples, per 100g values)
- `nutrition/crea-lookup.ts` — fuzzy ingredient name → CREA entry
- `nutrition/scoring.ts` — meal-vs-diet 0–10 score + breakdown
- `nutrition/totals.ts` — aggregate helpers (sum across ingredients, per-day, per-meal-type)
- `meal/grouping.ts` — time-window logic for breakfast/lunch/dinner; 75-min fold
- `storage/volume.ts` — save/read/delete images under `UPLOADS_DIR`
- `utils.ts` — `cn()` classnames helper

### `src/types/`
- `index.ts` — shared TS types (MealType, StructuredMeal, DietPlan, ScoreBreakdown, etc.)

### `src/app/` (App Router)
- `layout.tsx` — root layout, PWA meta tags, font, Toaster
- `globals.css` — Tailwind + CSS vars + safe-area helpers
- `page.tsx` — **Today** (home, authenticated)
- `login/page.tsx` — name + PIN login (or first-run setup)
- `snap/page.tsx` — photo capture → analyze → adjust → save
- `meal/[id]/page.tsx` — single meal detail + edit
- `week/page.tsx` — weekly multi-line chart (target vs actual)
- `memory/page.tsx` — gallery of all meal photos
- `favorites/page.tsx` — reusable meals grid, one-tap relog
- `diet/page.tsx` — upload/paste/active diet view
- `settings/page.tsx` — custom targets, meal-time windows, account admin

### `src/app/api/`
- `auth/login/route.ts` — POST name+PIN, set cookie
- `auth/logout/route.ts` — POST clears cookie
- `auth/setup/route.ts` — POST first-run creates admin; adds family members
- `me/route.ts` — GET current user
- `users/route.ts` — GET list (admin only) / POST create (admin only)
- `meals/analyze/route.ts` — POST image → StructuredMeal preview
- `meals/route.ts` — GET list (filters: date range) / POST persist confirmed meal
- `meals/[id]/route.ts` — GET / PATCH / DELETE
- `meals/[id]/favorite/route.ts` — POST snapshot as favorite
- `diets/route.ts` — GET list / POST create (text or file upload)
- `diets/[id]/route.ts` — GET / PATCH / DELETE
- `diets/[id]/activate/route.ts` — POST set as active for current user
- `favorites/route.ts` — GET / POST direct create
- `favorites/[id]/route.ts` — DELETE / POST (log as a new meal)
- `images/[filename]/route.ts` — GET protected image stream (owner-only)
- `stats/day/route.ts` — GET aggregates for a date
- `stats/week/route.ts` — GET per-day aggregates for a week

### `src/components/ui/`
Minimal, shadcn-inspired Tailwind primitives (no Radix dep):
- `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`, `badge.tsx`, `slider.tsx`, `tabs.tsx`, `dialog.tsx`, `toast.tsx`

### `src/components/feature/`
- `bottom-nav.tsx` — 5-tab fixed iOS-safe-area nav
- `app-header.tsx` — page title + user menu
- `nutrition-ring.tsx` — SVG ring showing calorie progress
- `macro-bars.tsx` — protein/carbs/fat/fiber bar set
- `meal-card.tsx` — photo + name + time + calories + score
- `meal-group.tsx` — breakfast/lunch/dinner header + cards
- `snap-camera.tsx` — file input w/ preview + "retake"
- `ingredient-editor.tsx` — adjustable rows for grams + cooking method
- `diet-score-breakdown.tsx` — score + reason chips
- `weekly-chart.tsx` — Recharts multi-line target vs actual
- `diet-uploader.tsx` — paste text or upload file
- `favorite-tile.tsx` — grid tile for favorites

## File relationships (change-one-affects-another map)

- **Prisma schema ↔ `src/types`**: Regenerate Prisma client (`npm run db:generate`) after schema changes; update types to match.
- **`ai/schemas.ts` ↔ `ai/openai-adapter.ts`**: OpenAI response_format must match the Zod schema shape.
- **`ai/prompts.ts` ↔ `nutrition/crea-data.ts`**: The system prompt references CREA bias; if CREA data changes substantially (new categories), update the prompt.
- **`nutrition/scoring.ts` ↔ `components/feature/diet-score-breakdown.tsx`**: Scoring contract (returns `{score, reasons[]}`) must match what the breakdown renders.
- **`meal/grouping.ts` ↔ `components/feature/meal-group.tsx`**: Grouping returns an array of grouped meals; component renders them.
- **`storage/volume.ts` ↔ `api/images/[filename]/route.ts`**: Storage writes filenames; the images route reads them with ownership check.
- **`auth/session.ts` ↔ `middleware.ts` ↔ every API route**: Cookie name and JWT secret shared. Routes pull userId via `getSessionUser()`.

## Hosting & deployment

- **Platform**: Railway (one service for the Next.js app + one Postgres plugin + one volume).
- **Volume**: mounted at `/data`; uploads go to `/data/uploads`. Survives redeploys.
- **Deploy**: push to GitHub `main` → Railway auto-builds.
- **Build command**: `npm ci && npx prisma generate && npm run build`
- **Start command**: `npx prisma migrate deploy && npm start`

### Required env vars
- `DATABASE_URL` — auto-set by Railway Postgres plugin
- `JWT_SECRET` — 32+ random bytes (`openssl rand -base64 32`)
- `OPENAI_API_KEY`
- `OPENAI_MODEL` — defaults to `gpt-5.4`; change here if SKU changes
- `UPLOADS_DIR` — set to `/data/uploads` on Railway
- `NEXT_PUBLIC_APP_NAME` — defaults to `Foodiy`
- `ADMIN_SETUP_TOKEN` — one-time token required for first-user registration; unset after setup

### iOS install
After deploy, open the Railway public URL in Safari → Share → Add to Home Screen. The PWA manifest + apple meta tags make it launch standalone with no browser chrome.

## Project internal state files

This project does NOT currently maintain `.claude/state/*.md` files. If evolving scope needs them, follow the convention in the global user CLAUDE.md (`plan.md`, `todo.md`, `decisions.md`, `abbreviations.md`).
