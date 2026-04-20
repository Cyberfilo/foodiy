# Foodiy

Italian-aware meal tracking from a photo. Install on iPhone via Safari "Add to Home Screen". Family-sized (3–4 users), self-hosted on Railway.

## Quickstart (local)

```bash
npm install
cp .env.example .env     # fill in OPENAI_API_KEY, JWT_SECRET, etc.
# Point DATABASE_URL at a local Postgres (Docker: docker run -p 5432:5432 -e POSTGRES_PASSWORD=x postgres:16)
npm run db:migrate       # creates the schema
npm run dev
```

Open http://localhost:3000 — you'll hit the first-run setup (needs `ADMIN_SETUP_TOKEN` from `.env`).

## Deploy on Railway

1. **Fork/push this repo to GitHub.**
2. **Create a new Railway project** → "Deploy from GitHub repo".
3. **Add a Postgres plugin** — Railway auto-wires `DATABASE_URL`.
4. **Add a Volume** — mount path `/data`, size ~5GB.
5. **Set env vars** in the Railway service settings:
   - `JWT_SECRET` — `openssl rand -base64 32`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional; defaults to `gpt-5.4`)
   - `UPLOADS_DIR=/data/uploads`
   - `ADMIN_SETUP_TOKEN=<anything>` — used only for first-user registration
6. **Deploy.** Railway reads `railway.json` and runs `npm ci && prisma generate && next build` → `npm start` (which runs `prisma migrate deploy` before `next start`).
7. **Open the public URL on iPhone Safari** → Share → Add to Home Screen.
8. **First login**: go to `/login`, enter your name, a 4–8 digit PIN, and your `ADMIN_SETUP_TOKEN`. You become the admin.
9. **Add family members**: `/login` shows login-only thereafter; admin can add new users through their own settings flow (or directly via `POST /api/auth/setup` while logged in as admin).
10. **Unset `ADMIN_SETUP_TOKEN`** after initial setup (no longer used by live paths).

### Why Railway volume over external storage
You asked to keep photos forever. `UPLOADS_DIR=/data/uploads` is on the mounted volume, survives redeploys, and stays private (no bucket to leak). Photos are served through `/api/images/[filename]` with an owner-check so one family member can't see another's plates.

## Architecture

See `CLAUDE.md` for the full map. High-level:

- **Next.js 15 App Router** (TypeScript) — one codebase, SSR pages + API routes.
- **Postgres + Prisma** — users, meals, ingredients, diets, favorites.
- **OpenAI** — `gpt-5.4` (configurable) for photo analysis and diet parsing. System prompt biases toward CREA / Italian standards.
- **CREA nutrition data** — ~80 Italian staples seeded in `src/lib/nutrition/crea-data.ts`; fuzzy-match ingredient names, blend with LLM estimates.
- **Transparent scoring** — each meal is scored 0–10 vs. the active diet with a reason breakdown. Formula in `src/lib/nutrition/scoring.ts`.
- **Meal grouping** — 75-min rolling window folds snaps into the same breakfast/lunch/dinner.

## Key scripts

```
npm run dev           # local dev
npm run build         # prisma generate + next build
npm start             # prisma migrate deploy + next start
npm run db:migrate    # prisma migrate dev (create migrations locally)
npm run db:studio     # Prisma Studio GUI
npm run typecheck     # tsc --noEmit
```

## Troubleshooting

- **`sharp` fails on install**: Railway's Nixpacks includes libvips. If self-hosting elsewhere, install `libvips-dev`.
- **`pdf-parse` test file error**: fixed by importing from `pdf-parse/lib/pdf-parse.js` — don't revert.
- **OpenAI model 404**: change `OPENAI_MODEL` env var to a SKU that exists for your key (e.g. `gpt-4o`).
- **"invalid setup token" on first login**: `ADMIN_SETUP_TOKEN` isn't set in Railway env, or was cleared. Set it, redeploy, then try again.

## License

Private use.
