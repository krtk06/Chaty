# Chatyy Frontend

The frontend web app for Chaty, an AI chat application. It is a React single page app that talks to the Chaty backend API over HTTP.

## What it does

- Login and signup for users.
- Send text prompts to an AI model and get text replies.
- Generate AI images from a text prompt.
- Upload a document (PDF, Word, Excel, or a text file) and ask questions about its content.
- Browse AI images that other users published to the community feed.
- Buy credit plans through a Stripe checkout page that the backend opens.
- Edit your profile, change your name, email, avatar color, and password.
- Switch between light and dark themes.
- Track your remaining credits on every message.

## Tech stack

- React 19 with Vite 7 as the build tool.
- React Router 7 for page navigation.
- Tailwind CSS 4 for styling, loaded through the Vite plugin.
- Axios for API calls to the backend.
- React Markdown to render AI replies as formatted text.
- Prism.js for code highlighting inside replies.
- react-hot-toast for notifications.
- Moment.js to show message timestamps.
- Motion for UI animations.
- Three.js for the animated 3D background on the loading page.
- clsx and tailwind-merge for conditional class names.
- animate-ui components for the animated sidebar icon and other primitives.

## Folder structure

```
Chatyy/
├── index.html              Entry HTML file
├── vite.config.js          Vite config, path alias for src
├── vercel.json             Rewrite rules for the single page app
├── components.json         shadcn style component config
├── jsconfig.json           JS path alias config
├── src/
│   ├── main.jsx            App entry point, mounts the router and context
│   ├── App.jsx             Top level layout, routes, sidebar state
│   ├── index.css           Global styles, Tailwind entry, theme reset
│   ├── assets/
│   │   ├── assets.js       Image and icon imports, exported as assets
│   │   ├── prism.css       Prism theme used for code blocks
│   │   └── ...             PNG, JPG, and SVG files
│   ├── components/
│   │   ├── ChatBox.jsx     Chat screen, prompt input, text and image modes
│   │   ├── Message.jsx     Renders a single user or AI message
│   │   ├── Sidebar.jsx     Chat list, new chat, logout, navigation
│   │   ├── fluid.jsx       3D fluid background used on the loading page
│   │   └── animate-ui/     Motion primitives and icons
│   ├── context/
│   │   └── AppContext.jsx  Global state, user, chats, theme, axios client
│   ├── hooks/
│   │   └── use-is-in-view.jsx  In view observer hook
│   ├── icons/              Inline SVG icon components
│   ├── lib/
│   │   └── utils.js        Shared class name helper
│   └── pages/
│       ├── Login.jsx       Login and signup form
│       ├── Loading.jsx     Loading screen after a purchase
│       ├── Community.jsx   Community image feed
│       ├── Credits.jsx     Credit plans and purchase buttons
│       └── Settings.jsx    Profile and password editor
```

## How the app is wired

`main.jsx` mounts the app inside a `BrowserRouter` and an `AppContextProvider`.

`AppContext.jsx` holds the shared state:

- `user` and `setUser`, the logged in user object.
- `token` and `setToken`, the JWT stored in localStorage.
- `chats` and `selectedChat`, the chat list for the user.
- `theme` and `setTheme`, saved in localStorage, applied as a `dark` class on the document element.
- `axios`, an Axios instance with the base URL set to `VITE_SERVER_URL`.
- `fetchUser`, loads the user profile from `/api/user/data`.
- `fetchUsersChats`, loads the chat list from `/api/chat/get`.
- `createNewChat`, calls `/api/chat/create` and refreshes the list.

`App.jsx` checks if a user is logged in. A logged in user sees the sidebar and the routed pages. A guest sees the login page. The main routes are:

- `/` for the chat box.
- `/community` for the community feed.
- `/credits` for credit plans.
- `/settings` for profile settings.
- `/login` for the login page.

## Chat screen

`ChatBox.jsx` has three modes: text, image, and document.

- Text mode sends the prompt to `/api/message/text` and deducts 1 credit.
- Image mode sends the prompt to `/api/message/image`, with an option to publish the image to the community, and deducts 2 credits.
- Document mode sends a file through a multipart form to `/api/message/document` and deducts 2 credits. It shows the chosen file name before sending.

`Message.jsx` renders each message. User messages show an avatar and the text. AI text messages render with React Markdown and Prism. AI image messages show the generated image. Document messages show a file icon and the file name.

## Credit plans

The credits page loads the plans from `/api/credit/plan`. Clicking a plan calls `/api/credit/purchase`, and the backend returns a Stripe checkout URL. The app opens that URL. After the payment, Stripe redirects to `/loading`, where the app refreshes the user data and returns to the chat screen.

## Environment variables

Create a `.env` file in this folder.

```
VITE_SERVER_URL=http://localhost:3000
```

This is the base URL of the backend API. Every Axios call is relative to this value.

## Run locally

Requirements: Node.js 22.

```
npm install
npm run dev
```

The Vite dev server runs on port 5173. It listens on all network interfaces, so you can open it from another device on the same network.

## Scripts

- `npm run dev` starts the dev server with hot reload.
- `npm run build` builds the production bundle into `dist`.
- `npm run preview` serves the production bundle locally.
- `npm run lint` runs ESLint over the source.

## Deployment

The `vercel.json` file rewrites every path back to `/`, which is required for a single page app. Any page route, like `/settings`, must fall back to the app shell. The backend API is hosted separately, and `VITE_SERVER_URL` is set to the deployed API URL in the Vercel environment.