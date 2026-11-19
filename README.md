# PINTU

The Gateway to Better Property Living — a React + Vite single-page app backed by a Node/Express API and MongoDB. Supports landlords, tenants, property managers and admins.

## Architecture

| Layer | Stack | Location |
| --- | --- | --- |
| Client | React 19, Vite, React Router | `src/` |
| API | Express, JWT auth, bcryptjs | `server/` |
| Database | MongoDB (local or Atlas) | configured by `MONGODB_URI` |

All persistent data — accounts, listings, posts, comments, likes, chats, ratings, wallets, transactions and enquiries — lives in MongoDB. The browser only stores the JWT and the current user for display.

## Run locally

You need Node 22+ and a MongoDB server. If you don't have one installed:

```bash
docker run -d --name pintu-mongo -p 27017:27017 mongo:7
```

Then copy the example env file and install dependencies:

```bash
cp .env.example .env.local
npm install
npm run dev          # starts the API (:4000) and Vite (:5173) together
```

Open the URL Vite prints (usually http://localhost:5173). To run the two processes separately, use `npm run dev:server` and `npm run dev:client`.

The first account registered in a fresh database automatically becomes the admin.

Other scripts:

```bash
npm run build     # production build into dist/
npm start         # API + built frontend on PORT (default 4000)
npm run preview   # Vite preview of dist/
npm run lint      # oxlint
```

## Environment variables

| Variable | Where | Default | Purpose |
| --- | --- | --- | --- |
| `MONGODB_URI` | server | `mongodb://127.0.0.1:27017/pintu` | Database connection. Use a `mongodb+srv://` URI for Atlas. |
| `JWT_SECRET` | server | dev-only fallback | Signs session tokens. Set a long random value in production. |
| `PORT` | server | `4000` | API / app port (cloud platforms usually inject this). |
| `CORS_ORIGIN` | server | localhost:5173,4173 | Comma-separated allowed origins when the client is on another domain. |
| `VITE_API_URL` | client | `/api` (production), `http://localhost:4000/api` (dev) | API base URL. Only needed when client and API are deployed separately. |

The server reads `.env.local` and `.env` via dotenv; Vite reads the same files but only exposes `VITE_*` keys to the browser. Never put Mongo credentials in a `VITE_*` variable.

## Deploying with MongoDB Atlas

1. Create an Atlas cluster and database user, then allow your app's IP (or `0.0.0.0/0` for platforms with dynamic IPs).
2. Set `MONGODB_URI` to the `mongodb+srv://...` connection string, plus a strong `JWT_SECRET`.
3. Build with `npm run build` and start with `npm start`. The Express server serves `dist/` and `/api` from the same origin, so `CORS_ORIGIN` and `VITE_API_URL` can be left unset.
4. Health check: `GET /api/health`.

Ready-made options:

- **Docker**: `docker build -t pintu . && docker run -p 4000:4000 -e MONGODB_URI=... -e JWT_SECRET=... pintu`
- **Render**: create a Web Service from `render.yaml` and fill in `MONGODB_URI` / `CORS_ORIGIN` in the dashboard.
- **Separate frontend hosting**: build with `VITE_API_URL=https://your-api.example.com/api` and set `CORS_ORIGIN=https://your-frontend.example.com` on the API.

## Pages

| Route | Description |
| --- | --- |
| `/`, `/community` | Home social feed: photo/video posts, likes, comments, ratings and direct messages |
| `/login`, `/signup` | Authentication |
| `/dashboard` | Profile, wallet, payments and membership tiers |
| `/marketplace` | Property listings with search, filters, CRUD and owner chat (Services menu) |
| `/enquiry` | Contact form (stored in MongoDB) |
| `/about`, `/mission`, `/how-it-works`, `/faq` | Informational pages |
| `/admin/login`, `/admin` | Admin portal: user management and membership payments |

Navigation is a bottom bar with five icons: **Home** (social feed), **Services** (Property Listings plus placeholder items for Rental Management, Payment Management and Maintenance Requests), **+** (create a photo/video post), **Notifications** (placeholder for admin announcements) and **Profile** (account menu). The old top menu has been removed.

## Notes

- Passwords are hashed with bcryptjs; API routes are protected with JWTs and role/ownership checks.
- Every user (tenant, landlord, property manager or admin) has a 1–5 star rating. You can rate another user once from their community post or marketplace listing.
- Property images and social feed media are stored as data URLs in MongoDB (feed posts allow up to 4 images of 3 MB each, or one 8 MB video).
- The Messages button on the right of the home feed opens a right-side inbox listing all conversations from posts and property listings.
- The first registered account becomes an admin; use the admin portal to change roles.
