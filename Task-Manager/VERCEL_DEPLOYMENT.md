# Deploying TaskFlow Frontend & Backend Separately on Vercel

This guide gives you the exact, step-by-step instructions to deploy your **Express Backend** and **React Vite Frontend** as **two separate projects on Vercel**.

---

## 📋 Quick Overview

| Component | Vercel Project 1: Backend | Vercel Project 2: Frontend |
|---|---|---|
| **Root Directory** | `Task-Manager/backend` | `Task-Manager/frontend` |
| **Framework Preset** | `Other` | `Vite` |
| **Build Command** | Leave empty (none) | `npm run build` |
| **Output Directory** | Leave empty (none) | `dist` |
| **Configuration File** | `backend/vercel.json` | `frontend/vercel.json` |

---

## ⚙️ Step 1: Deploy Backend API on Vercel First

> Deploy the backend first so you have its live URL (e.g. `https://todo-backend-xyz.vercel.app`) to give to the frontend.

1. Open [vercel.com/new](https://vercel.com/new) and select your GitHub repository (**`My-Portfolio`**).
2. On the project configuration screen:
   - **Project Name**: e.g., `taskflow-backend` (or your choice).
   - **Root Directory**: Click **Edit** and choose `Task-Manager/backend`.
   - **Framework Preset**: Select **Other**.
3. Expand **Environment Variables** and add the following:

   | Key | Value / Example | Description |
   |---|---|---|
   | `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/tododb?retryWrites=true&w=majority` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `super_secret_jwt_key_todo_app_2026_teal_sage` | Secret key for JWT signing |
   | `ADMIN_USERNAME` | `admin` | Default admin username |
   | `ADMIN_PASSWORD` | `admin123` | Default admin password |
   | `AI_PROVIDER` | `groq` | Provider for AI task descriptions |
   | `GROQ_API_KEY` | `gsk_...` | Your Groq API key |
   | `GROQ_MODEL` | `openai/gpt-oss-20b` | Groq model identifier |
   | `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | *(Optional)* Google OAuth Client ID |
   | `CLIENT_URL` | `*` *(or your frontend Vercel URL once known)* | Allowed CORS origin |

4. Click **Deploy**.
5. Once deployment completes, note your backend URL:
   👉 Example: `https://taskflow-backend.vercel.app`
6. Verify your backend is running by opening:
   👉 `https://taskflow-backend.vercel.app/api/health`
   *(You should see `{"status":"ok", ...}`)*

> ⚠️ **Important (MongoDB Atlas Network Access)**:
> In your MongoDB Atlas dashboard under **Network Access**, ensure **IP Access List** is set to **`0.0.0.0/0` (Allow Access from Anywhere)**. Vercel serverless functions connect from dynamic cloud IP addresses.

---

## 🎨 Step 2: Deploy Frontend on Vercel

1. Open [vercel.com/new](https://vercel.com/new) again and select the same GitHub repository (**`My-Portfolio`**).
2. On the project configuration screen:
   - **Project Name**: e.g., `taskflow-frontend` (or your choice).
   - **Root Directory**: Click **Edit** and choose `Task-Manager/frontend`.
   - **Framework Preset**: **Vite** (Vercel detects this automatically).
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: `dist` (default).
3. Expand **Environment Variables** and add:

   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://taskflow-backend.vercel.app/api` | Point to your live backend from Step 1 |
   | `VITE_GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | *(Optional)* Google OAuth Client ID |

4. Click **Deploy**.
5. Your frontend is now live!
   👉 Example: `https://taskflow-frontend.vercel.app`

---

## 🔄 Step 3: Optional - Link Frontend URL to Backend CORS

*(Optional but recommended for strict CORS)*:
1. Go to your Backend project on Vercel -> **Settings** -> **Environment Variables**.
2. Update `CLIENT_URL` to your live frontend URL:
   `https://taskflow-frontend.vercel.app`
3. Click **Save** and trigger a **Redeploy** of the latest backend deployment.

---

## 📁 Repository Configuration Files Summary

All necessary Vercel configuration files are already set up in the codebase:
- **`Task-Manager/backend/vercel.json`**: Rewrites all API traffic to `api/index.js` serverless function.
- **`Task-Manager/backend/api/index.js`**: Serverless entry point exporting the Express application.
- **`Task-Manager/backend/config/db.js`**: Serverless-optimized MongoDB connection caching.
- **`Task-Manager/backend/server.js`**: Cross-origin CORS with automatic `*.vercel.app` support, and serverless lifecycle guard (`!process.env.VERCEL`).
- **`Task-Manager/frontend/vercel.json`**: Client-side SPA routing rewrites (`/*` -> `/index.html`) so refreshing any route works without 404s.
- **`Task-Manager/frontend/src/services/api.js`**: Automatic normalization of `VITE_API_URL`.
