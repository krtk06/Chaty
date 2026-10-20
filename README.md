# Chatyy

A lightweight AI chat and image-generation app. Talk to a model in text, generate images from prompts, publish the ones you like to a community gallery, and ask questions about uploaded documents — all paid for with credits.

Two apps live in this repository:

| Folder | What it is | Stack |
| --- | --- | --- |
| [`Chatyy/`](Chatyy) | Web frontend | React 19 · Vite 7 · Tailwind CSS 4 · Motion |
| [`server/`](server) | REST API + Stripe webhook | Node.js · Express 5 · MongoDB · Mongoose |

## Features

- **AI chat** — full conversation history is sent with every message, so the model remembers the thread.
- **Image generation** — provider chain with automatic failover (ImageKit → Gemini → OpenAI); the result is hosted on ImageKit and shown inline.
- **Document Q&A** — upload a PDF, Word (docx), Excel, or text file and ask questions about its contents.
- **Community gallery** — publish generated images and browse what other people created.
- **Credits** — atomic spending, automatic refunds when generation fails, and Stripe Checkout for top-ups.
- **Accounts** — email/password plus Google and Apple sign-in.
- **Profile settings** — name, email, avatar colour and password.
- **Polish** — light/dark themes, full-bleed welcome screen, custom 404, Terms & Conditions and Privacy Policy pages.

## Quick start

Requirements: **Node.js 22+**, a MongoDB database, and (for the full experience) an OpenCode Go API key, an ImageKit account and Stripe test keys. Everything without credentials degrades gracefully; image generation simply reports that no provider is configured.

### 1. Backend

```bash
cd server
cp .env.example .env     # fill in the values
npm install
npm run server           # http://localhost:3001
```

### 2. Frontend

```bash
cd Chatyy
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

`VITE_SERVER_URL` in `Chatyy/.env` must point at the backend (default `http://localhost:3001`). If you change `PORT` in `server/.env`, update it here too.

## Environment variables

Full templates live in [`server/.env.example`](server/.env.example) and [`Chatyy/.env.example`](Chatyy/.env.example).

### Server

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URL` | yes | MongoDB connection string (the app uses the `Chaty` database unless the URL already names one) |
| `JWT_SECRET` | yes | Signs auth tokens |
| `OPENCODE_API_KEY` | yes\* | Text/document model key — OpenCode Go |
| `IMAGEKIT_URL_ENDPOINT` / `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` | for images | Image generation + hosting |
| `GEMINI_API_KEY` | optional | Gemini image fallback |
| `OPENAI_API_KEY` | optional | OpenAI images fallback |
| `IMAGE_PROVIDER` | optional | `auto` (default), `imagekit`, `gemini` or `openai` |
| `STRIPE_PRIVATE_KEY` / `STRIPE_WEBHOOK_SECRET` | for payments | Checkout + webhook verification |
| `GOOGLE_CLIENT_ID` / `APPLE_CLIENT_ID` | optional | Social sign-in (must match the frontend IDs) |
| `PORT` | optional | API port (default `3001` here) |

\* `OPENAI_API_KEY` also works as a fallback for the model client.

### Frontend

| Variable | Purpose |
| --- | --- |
| `VITE_SERVER_URL` | Base URL of the API |
| `VITE_GOOGLE_CLIENT_ID` | Google sign-in (optional; buttons stay disabled without it) |
| `VITE_APPLE_CLIENT_ID` | Apple sign-in (optional) |

## API overview

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/user/register` | — | Create an account, returns a JWT |
| POST | `/api/user/login` | — | Log in, returns a JWT |
| POST | `/api/user/google` · `/api/user/apple` | — | Social sign-in |
| GET | `/api/user/data` | ✓ | Current user |
| PUT | `/api/user/update` | ✓ | Update name, email, avatar or password |
| GET | `/api/user/published-images` | — | Community feed |
| GET | `/api/chat/create` · `/api/chat/get` | ✓ | Create / list chats |
| POST | `/api/chat/delete` | ✓ | Delete a chat |
| POST | `/api/message/text` | ✓ | Chat reply (1 credit) |
| POST | `/api/message/image` | ✓ | Generate an image (2 credits) |
| POST | `/api/message/document` | ✓ | Analyze an upload, `multipart/form-data` (2 credits) |
| GET | `/api/credit/plan` | — | Credit plans |
| POST | `/api/credit/purchase` | ✓ | Create a Stripe Checkout session |
| POST | `/api/stripe` | signature | Stripe webhook |

Auth uses `Authorization: <jwt>` or `Authorization: Bearer <jwt>`.

## Scripts

### Frontend (`Chatyy/`)

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the build |
| `npm run lint` | ESLint |

### Server (`server/`)

| Command | What it does |
| --- | --- |
| `npm run server` | Nodemon dev server |
| `npm start` | Plain Node server |

## Quality checks

The frontend is expected to pass both ESLint and the [aislop](https://github.com/scanaislop/aislop) quality gate (100/100):

```bash
cd Chatyy
npm run lint
npx aislop scan
npm run build
```

## Payments locally

```bash
stripe listen --forward-to localhost:3001/api/stripe
```

Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`, then buy a plan from the Credits page with a test card. Credits are granted by the webhook, and `/loading` polls until they appear.

## Deployment

- **Frontend** — Vercel. `Chatyy/vercel.json` rewrites every path to `/` for the SPA; set `VITE_SERVER_URL` to the deployed API URL.
- **Backend** — Vercel Node runtime. `server/vercel.json` builds `server.js` and allows up to 60s for the image route. Set all server variables in the project settings.
- **Stripe** — point a webhook endpoint at `https://<api-domain>/api/stripe` for `checkout.session.completed` and `payment_intent.succeeded`.

## More documentation

- [Frontend README](Chatyy/README.md)
- [Server README](server/README.md)
