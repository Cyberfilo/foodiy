# Foodiy

Italian-aware meal tracking from a photo. Install on iPhone via Safari "Add to Home Screen". Family-sized (3–4 users), self-hosted on Railway.

> **License at a glance** (Foodiy is **source-available, not open-source** — see [LICENSE](./LICENSE) for the binding text):
>
> | Tier | Who it's for | Users/deployment | What's required |
> |---|---|---|---|
> | **Personal** | You + friends/family | **fewer than 10** | Tell me you're running it (one-line email or GitHub issue). |
> | **Community Development** | Forks, collaboration, beta/staging | **fewer than 25** | Tell me when you materially change or publish changes. Stay non-commercial. |
> | **Commercial** | Any paid/revenue/business use, incl. commercial enhancements | — | Pre-approval required. I must be both **informed AND included** as a participating party (attribution, revenue share, equity, or negotiated terms). |
>
> All contact: **filippo@menghi.dev** (subject prefix `[FOODIY-FSAL]` for notifications, `[FOODIY-FSAL COMMERCIAL REQUEST]` for commercial).

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

## Contributing / using this code

Pull requests and issues are welcome. By submitting a contribution you agree that your contribution becomes part of Foodiy under the same [FSAL](./LICENSE) terms.

How to pick a tier:

- **Personal tier (friends & family, < 10 users per deployment)** — free. Just notify me once you deploy or fork:
  - [Open a GitHub issue](https://github.com/Cyberfilo/foodiy/issues/new?title=%5BFSAL+Notification%5D) titled `[FSAL Notification]`, or
  - email `filippo@menghi.dev` with subject `[FOODIY-FSAL]`.
  - Include: your name/handle, a link to your fork (if any), which tier, and a one-line description of use.
- **Community Development tier (forks, collaboration, dev/beta, < 25 users per deployment)** — free. Notify me on first fork and each time you publish material changes. Keep it non-commercial while in this tier.
- **Commercial tier (any paid use, business use, or commercial improvement)** — requires prior written approval **and** inclusion of me as a participating party in the arrangement (attribution, revenue share, equity, or other negotiated terms). Send a request to `filippo@menghi.dev` with subject `[FOODIY-FSAL COMMERCIAL REQUEST]` describing intended use, scale, entity, and proposed inclusion terms.

Any derivative work must keep the LICENSE file and include this attribution: *Based on "Foodiy" by Filippo Mattia Menghi — https://github.com/Cyberfilo/foodiy — licensed under FSAL v1.1.*

## License

[Foodiy Source-Available License (FSAL) v1.1](./LICENSE).
Copyright © 2026 Filippo Mattia Menghi. All rights reserved except as expressly granted by the license.
