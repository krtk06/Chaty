# Chatyy Server

The backend API for Chaty, an AI chat application. It is a Node.js and Express server that handles users, chats, AI messages, images, document uploads, and credit payments.

## What it does

- Register and log in users, returns a JWT token.
- Store chat history in MongoDB.
- Send text prompts to the Gemini model through the OpenAI SDK.
- Generate AI images with ImageKit and host them on the ImageKit CDN.
- Parse uploaded documents and answer questions about them.
- Track credits for every user and deduct them per request.
- Sell credit plans through Stripe checkout.
- Listen to Stripe webhooks and add credits after a successful payment.
- Serve published AI images for the community feed.

## Tech stack

- Node.js with Express 5.
- Mongoose as the MongoDB object model.
- JSON Web Tokens for authentication.
- bcryptjs to hash passwords.
- Stripe for payments and webhooks.
- ImageKit for image generation and storage.
- OpenAI SDK pointed at the Google Gemini API.
- Multer for handling file uploads.
- pdfjs-dist, mammoth, and xlsx to extract text from documents.
- cors and dotenv for the server setup.
- nodemon as the dev process runner.

## Folder structure

```
server/
├── server.js              App entry, middleware, route mounting
├── vercel.json            Vercel serverless build config
├── configs/
│   ├── db.js              MongoDB connection
│   ├── imageKit.js        ImageKit client
│   └── openai.js          OpenAI client pointing at Gemini
├── controllers/
│   ├── userControllers.js    Register, login, profile, published images
│   ├── chatControllers.js    Create, list, delete chats
│   ├── messageController.js  Text, image, and document messages
│   ├── creditController.js   Plans and Stripe checkout
│   └── webhooks.js           Stripe webhook handler
├── middlewares/
│   └── auth.js            JWT protect middleware
├── models/
│   ├── user.js            User model with credit balance
│   ├── Chat.js            Chat and message model
│   └── Transaction.js     Payment transaction model
├── routes/
│   ├── userRoutes.js      /api/user routes
│   ├── chatRoutes.js      /api/chat routes
│   ├── messageRoutes.js   /api/message routes
│   └── creditRoutes.js    /api/credit routes
└── utils/
    └── documentParser.js  Extract text from uploaded files
```

## Server setup

`server.js` connects to MongoDB, sets up the JSON body parser with a 2 MB limit, enables CORS, and mounts the route groups:

- `/api/user`
- `/api/chat`
- `/api/message`
- `/api/credit`
- `/api/stripe` for the Stripe webhook, which uses the raw body parser.

The webhook route must be registered before `express.json`, because Stripe needs the raw request body to verify the signature.

## API routes

### User

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/user/register` | no | Create a user, returns a token |
| POST | `/api/user/login` | no | Log in, returns a token |
| GET | `/api/user/data` | yes | Get the logged in user |
| PUT | `/api/user/update` | yes | Update name, email, avatar, or password |
| GET | `/api/user/published-images` | no | List published AI images |

### Chat

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/chat/create` | yes | Create a new empty chat |
| GET | `/api/chat/get` | yes | List the user chats, newest first |
| POST | `/api/chat/delete` | yes | Delete one chat |

### Message

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/message/text` | yes | Send a text prompt, gets a text reply |
| POST | `/api/message/image` | yes | Generate an AI image |
| POST | `/api/message/document` | yes | Upload a file, gets an analysis reply |

The document route uses Multer with memory storage and accepts a single file field named `file`.

### Credit

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/credit/plan` | no | List the available plans |
| POST | `/api/credit/purchase` | yes | Create a Stripe checkout session |

## Authentication

The `protect` middleware in `middlewares/auth.js` runs on protected routes. It reads the `Authorization` header, accepts a `Bearer` prefixed token or a bare token, verifies it with `JWT_SECRET`, loads the user by id, and attaches the user to `req.user`. If the token is missing or invalid it returns a 401 response.

Tokens are signed for 30 days. Passwords are hashed with bcryptjs before a user is saved, using a Mongoose pre-save hook.

## Credits

New users start with 20 credits. Requests cost the following:

- Text message: 1 credit.
- Image generation: 2 credits.
- Document analysis: 2 credits.

The check happens inside each message controller. If the balance is too low, the request returns a failure message and nothing is saved.

## Message flow

### Text

`textMessageController` checks the credit balance, appends the user prompt to the chat, and calls the Gemini model through `openai.js`. The model in use is `gemini-2.5-flash`. It uses a helper with retry logic that handles rate limits, waits at least 6 seconds between requests, and backs off with exponential delays on HTTP 429 responses. The reply is saved to the chat and 1 credit is deducted.

### Image

`imageMessageController` checks for 2 credits, saves the prompt, builds an ImageKit generation URL from the prompt, downloads the generated PNG, uploads it to the `Chaty` folder in ImageKit, and stores the returned URL in the chat. If the prompt was marked as published, the image appears in the community feed.

### Document

`documentMessageController` checks for 2 credits, saves the message with the file name, and passes the file buffer to `parseDocument` in `utils/documentParser.js`. The extracted text is sent to the model with a system prompt for document analysis. The reply is saved and 2 credits are deducted.

## Document parsing

`documentParser.js` reads the file MIME type and extracts text:

- PDF: walks every page with pdfjs-dist.
- Word: uses mammoth to get raw text.
- Excel: reads each sheet and converts it to CSV.
- Plain text, CSV, JSON, HTML, and XML: read as UTF-8 text.

Any other MIME type throws an unsupported file error.

## Payments

`creditController.js` defines three plans: Basic (10 USD, 100 credits), Pro (20 USD, 500 credits), and Premium (30 USD, 1000 credits). `purchasePlans` creates a `Transaction` record marked as unpaid, then creates a Stripe checkout session with the plan as the line item. The success URL points to `/loading` and the cancel URL points to the home page. The session carries the transaction id and the app id in its metadata.

`webhooks.js` listens for the `payment_intent.succeeded` event. It looks up the checkout session by payment intent, reads the transaction id from the metadata, verifies the app id matches `Chaty`, finds the unpaid transaction, adds its credits to the user, and marks it as paid. Events from other apps are ignored.

## Models

### User

`name`, `email`, `password`, `credits` (default 20), and `avatar`. Email is unique. Timestamps are enabled.

### Chat

`userId`, `userName`, `name`, and an array of messages. Each message stores `isImage`, `isDocument`, `fileName`, `isPublished`, `role`, `content`, and `timestamp`. Timestamps are enabled.

### Transaction

`userId`, `planId`, `amount`, `credits`, and `isPaid`. Timestamps are enabled.

## Environment variables

Create a `.env` file in this folder.

```
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your-secret
GEMINI_API_KEY=your-gemini-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_PRIVATE_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=3000
```

The Gemini key is passed to the OpenAI SDK with the base URL `https://generativelanguage.googleapis.com/v1beta/openai/`, so a Gemini API key works with the OpenAI client.

## Run locally

Requirements: Node.js 22 and a running MongoDB instance.

```
npm install
npm run server
```

`npm run server` uses nodemon and watches the files. The server listens on `PORT` or port 3000 by default.

For local Stripe webhook testing, use the Stripe CLI to forward webhook events to the local server:

```
stripe listen --forward-to localhost:3000/api/stripe
```

## Scripts

- `npm run server` starts the server with nodemon.
- `npm start` starts the server with plain node.

## Deployment

The `vercel.json` file builds `server.js` with the Vercel Node runtime and routes all traffic to it. The environment variables above must be set in the Vercel project settings. The frontend calls the deployed URL through `VITE_SERVER_URL`.