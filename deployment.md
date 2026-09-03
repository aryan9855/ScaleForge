# ScaleForge Deployment Guide

This document outlines the steps to deploy ScaleForge to a cloud environment (e.g., Render, Railway, or Vercel).

## Environment Variables

You must configure the following environment variables on your hosting platform:

| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | Set to `production` to enable static file serving. |
| `MONGO_URI` | Your production MongoDB connection string. |
| `REDIS_URL` | Redis connection string, such as `redis://localhost:6379` or `redis://redis:6379` inside Compose. |
| `JWT_SECRET` | A long, secure string for signing tokens. |
| `OPENAI_API_KEY` | Your Groq API key (e.g., `gsk_...`). |
| `GROQ_MODEL` | Groq model used for interview turns; defaults to `openai/gpt-oss-120b`. |
| `FRONTEND_URL` | The URL of your deployed frontend (to restrict CORS). |
| `VITE_API_BASE_URL` | (Frontend only) Set to your full API URL if the backend is hosted on a different domain. |
| `VITE_SOCKET_URL` | (Frontend only) Set to the backend URL for Socket.IO when frontend and backend are deployed separately. |
| `SMTP_HOST` | SMTP server hostname used for password reset emails. |
| `SMTP_PORT` | SMTP server port, usually `587` or `465`. |
| `SMTP_USER` | SMTP username. |
| `SMTP_PASS` | SMTP password or provider app password. |
| `EMAIL_FROM` | Sender address for password reset emails. |

## Deployment Steps

### Local Redis with Docker

From the repository root, start Redis with:

```bash
docker compose up -d redis
```

The backend connects to this container with `REDIS_URL=redis://localhost:6379` when Node runs on the host. If the backend is also a Compose service, use `REDIS_URL=redis://redis:6379` instead. Redis stores active interview sessions for one hour and maintains the live leaderboard; MongoDB remains the permanent store.

### Password reset email

Configure the SMTP variables above in production. Password reset tokens expire after 15 minutes and are stored hashed in MongoDB. During local development, if SMTP is not configured, the API response includes a local reset URL for testing.

### 1. Unified Deployment (Recommended)
You can deploy both the frontend and backend together. The backend will serve the frontend's built files.

1.  **Build Frontend**: Run `npm run build` in the `frontend` directory.
2.  **Start Backend**: Ensure `NODE_ENV=production` is set.
3.  **Pathing**: The backend expects the `dist` folder to be located at `../frontend/dist`.

### 2. Existing Vercel + Render Deployment

Pushing the code is only the first step. Before redeploying, configure these variables in the hosting dashboards.

#### Render backend

Set:

```env
NODE_ENV=production
MONGO_URI=<your MongoDB Atlas URI>
REDIS_URL=<your hosted Redis URL, usually rediss://...>
JWT_SECRET=<new secure secret>
OPENAI_API_KEY=<your Groq key>
GROQ_MODEL=openai/gpt-oss-120b
FRONTEND_URL=https://scale-forge-omega.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your Gmail address>
SMTP_PASS=<your Gmail app password>
EMAIL_FROM=<your Gmail address>
```

Do not use `redis://localhost:6379` on Render. The Docker Redis container is for local development; Render needs a hosted Redis provider such as Render Redis, Redis Cloud, or Upstash. The backend also needs a persistent web-service process because Socket.IO runs on the backend.

#### Vercel frontend

Set these variables, then redeploy the frontend:

```env
VITE_API_BASE_URL=https://scaleforge-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://scaleforge-backend.onrender.com
```

If your Render or Vercel domains differ, use the actual deployed URLs in both `FRONTEND_URL` and the `VITE_*` variables.

#### Update order

1. Create or connect hosted Redis and set `REDIS_URL` in Render.
2. Set the SMTP variables in Render for password reset emails.
3. Set the two `VITE_*` variables in Vercel.
4. Push the code to Git.
5. Confirm Render starts successfully and reports Redis connected.
6. Confirm Vercel rebuilds with the production API and Socket.IO URLs.
7. Test demo mode, login, forgot password, interview completion, leaderboard, and live updates.

Without the hosted Redis URL, the Render backend will fail during startup. Without the Vercel variables, the frontend may continue calling the old API or connect Socket.IO to the wrong host.

---
For more information, contact the ScaleForge development team.
