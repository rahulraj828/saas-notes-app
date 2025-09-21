# SaaS Notes App

Lightweight multi-tenant Notes application (Next.js + API routes + MongoDB).

Key requirements implemented:
- Multi-tenant isolation via `tenantId` on `User` and `Note`.
- JWT auth with `JWT_SECRET`.
- Free plan note limit (3 notes) enforced server-side.
- Health endpoint: `GET /api/health` → `{ "status": "ok" }`.
- CORS enabled for all API routes (permissive `Access-Control-Allow-Origin: *`).

Deployment (Vercel):

1. Create a Vercel project and connect this repository.
2. In Vercel dashboard, set the following Environment Variables:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random secret
3. Build & Output Settings: Next.js defaults are fine.
4. After deploy, run the seed script once locally or via a serverless job to create test tenants/users, or use the provided seed script locally:

```powershell
cd D:\New-practice\saas-notes-app
npm install
cp .env.example .env
# edit .env with proper values
npm run seed
```

Notes:
- CORS: All API routes respond with permissive CORS headers to allow automated test scripts and dashboards to access the API.
- Health: `GET /api/health` returns `{ status: 'ok' }` and can be used by uptime checks.
- Frontend: Login with seeded accounts (e.g. `admin@acme.test` / `password`) and use the Dashboard to list/create/delete notes. Admin users can upgrade tenant to Pro via the dashboard which calls `/api/tenants/:slug/upgrade`.
SaaS Notes App

Multi-tenancy approach: Shared schema with `tenantId` on `User` and `Note` models. This ensures strict isolation by always filtering queries by `tenantId`.

Setup:
1. Create a `.env` file with `MONGO_URI` and `JWT_SECRET`.
2. Run `npm install`.
3. Run `npm run seed` to create tenants and test users.
4. Run `npm run dev` to start the dev server.

Test accounts (password: password):
- admin@acme.test (admin)
- user@acme.test (member)
- admin@globex.test (admin)
- user@globex.test (member)

Notes:
- Free plan limits tenants to 3 notes. Admin can upgrade tenant via `POST /api/tenants/:slug/upgrade`.

Production seeding (Vercel)
---------------------------
To seed the production database from Vercel in a controlled way, add a secret `SEED_SECRET` in your Vercel Environment Variables. Then call the protected seed endpoint once:

```powershell
# Example (PowerShell)
Invoke-RestMethod -Method Post -Uri "https://<your-app>.vercel.app/api/seed" -Headers @{ 'x-seed-secret' = 'replace_with_your_seed_secret' }
```

Notes:
- Set `SEED_SECRET` in Vercel before calling this endpoint. The endpoint will reset tenants/users/notes and recreate the test accounts.
- After seeding, remove or rotate the `SEED_SECRET` to avoid accidental reseeds.
