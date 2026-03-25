# ScaleForge Deployment Guide

This document outlines the steps to deploy ScaleForge to a cloud environment (e.g., Render, Railway, or Vercel).

## Environment Variables

You must configure the following environment variables on your hosting platform:

| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | Set to `production` to enable static file serving. |
| `MONGODB_URI` | Your production MongoDB connection string. |
| `JWT_SECRET` | A long, secure string for signing tokens. |
| `OPENAI_API_KEY` | Your Groq API key (e.g., `gsk_...`). |
| `FRONTEND_URL` | The URL of your deployed frontend (to restrict CORS). |
| `VITE_API_BASE_URL` | (Frontend only) Set to your full API URL if the backend is hosted on a different domain. |

## Deployment Steps

### 1. Unified Deployment (Recommended)
You can deploy both the frontend and backend together. The backend will serve the frontend's built files.

1.  **Build Frontend**: Run `npm run build` in the `frontend` directory.
2.  **Start Backend**: Ensure `NODE_ENV=production` is set.
3.  **Pathing**: The backend expects the `dist` folder to be located at `../frontend/dist`.

### 2. Separate Deployment
If you deploy the frontend and backend to different platforms:

1.  **Backend**: Set `FRONTEND_URL` to your frontend's domain.
2.  **Frontend**: Build with `VITE_API_BASE_URL` set to your backend's API URL (e.g., `https://api.scaleforge.com/api/v1`).

---
For more information, contact the ScaleForge development team.
