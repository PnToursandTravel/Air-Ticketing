# Cloudflare Pages Deployment Guide

This repository (`https://github.com/PnToursandTravel/Air-Ticketing`) is pre-configured for automated deployment via **Cloudflare Pages** connected to GitHub.

---

## 1. Cloudflare Dashboard Setup (Step-by-Step)

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation menu, click **Workers & Pages**.
3. Click the **Create application** button.
4. Select the **Pages** tab and click **Connect to Git**.
5. Select your GitHub account (**PnToursandTravel**) and choose the repository:
   ```text
   Air-Ticketing
   ```
6. Click **Begin setup**.

---

## 2. Build & Deployment Settings

In the **Set up builds and deployments** screen, enter the following configuration:

| Field | Value |
|---|---|
| **Project name** | `air-ticketing` (or `pntoursandtravel-air-ticketing`) |
| **Production branch** | `main` |
| **Framework preset** | `Next.js` |
| **Build command** | `npm run build` *(runs `prisma generate && next build`)* |
| **Build output directory** | `.next` |
| **Root directory** | `/` *(leave default / empty)* |

---

## 3. Environment Variables

Under **Environment variables (advanced)**, add the following key-value pairs:

| Variable Name | Value | Purpose |
|---|---|---|
| `NODE_VERSION` | `20.18.0` | Forces Cloudflare to use modern Node.js 20 runtime |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disables Next.js telemetry for faster builds |
| `DATABASE_URL` | `file:./dev.db` | Local SQLite path or your remote PostgreSQL/D1 connection string |
| `SESSION_SECRET` | `pn-tours-secret-key-2026-prod-jwt-airline-suite` | Session cryptographic encryption key |

---

## 4. Deploy

1. Click **Save and Deploy**.
2. Cloudflare Pages will clone the GitHub repository, install dependencies, generate Prisma Client, compile Next.js 14, and deploy to a global edge URL (e.g., `https://air-ticketing.pages.dev`).
3. Every future `git push` to `main` will automatically trigger a new deployment.
