# Deployment Guide

This guide covers deploying the ScheduleManager app to production with:
- **Backend**: Railway
- **Frontend**: Vercel

## Prerequisites

- GitHub repository connected to Railway and Vercel
- PostgreSQL database (Railway PostgreSQL or Supabase)
- Node.js 18+ runtime

## Backend Deployment (Railway)

### 1. Connect Repository to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `ahmad7assanbusiness-alt/Schedrix`
5. Railway will auto-detect the `server` directory

### 2. Configure Environment Variables

In Railway dashboard, go to your service → **Variables** tab and add:

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Important:**
- `DATABASE_URL`: Use Railway's PostgreSQL service or your Supabase connection string
- `JWT_SECRET`: Generate a strong random string (e.g., use `openssl rand -base64 32`)
- `PORT`: Railway automatically sets this (no need to set manually)
- `HOST`: Defaults to `0.0.0.0` (no need to set manually)

### 3. Configure Build Settings

Railway auto-detects Node.js projects. Ensure:
- **Root Directory**: `server` (if deploying from monorepo root)
- **Build Command**: Railway auto-runs `npm install`
- **Start Command**: `npm start` (runs `node src/index.js`)

### 4. Deploy

Railway will automatically:
1. Install dependencies (`npm install`)
2. Run the start command (`npm start`)
3. Expose your app on a public URL

### 5. Get Your Backend URL

After deployment, Railway provides a public URL like:
- `https://your-app.up.railway.app`

Copy this URL - you'll need it for the frontend.

### 6. Verify Backend is Running

Test the health endpoint:
```bash
curl https://your-app.up.railway.app/api/health
```

Should return: `{"status":"live"}`

## Frontend Deployment (Vercel)

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your repository: `ahmad7assanbusiness-alt/Schedrix`
4. Select the branch (e.g., `dev` or `main`)

### 2. Configure Project Settings

In Vercel project settings:

- **Framework Preset**: Other
- **Root Directory**: `client` (or leave empty if using root `vercel.json`)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 3. Set Environment Variables

In Vercel dashboard → **Settings** → **Environment Variables**, add:

```
VITE_API_URL=https://your-app.up.railway.app
```

**Important:** Replace `https://your-app.up.railway.app` with your actual Railway backend URL.

### 4. Deploy

Click "Deploy" - Vercel will:
1. Install dependencies
2. Build the React app
3. Deploy to a public URL

### 5. Get Your Frontend URL

After deployment, Vercel provides a URL like:
- `https://your-app.vercel.app`

This is your production frontend URL.

## Local Development

### Backend (Server)

```bash
cd server
npm install
npm run dev  # Uses nodemon for auto-reload
```

Server runs on: `http://localhost:4000`

### Frontend (Client)

```bash
cd client
npm install
npm run dev  # Vite dev server
```

Client runs on: `http://localhost:5173`

The frontend automatically uses `http://localhost:4000` in development mode (when `VITE_API_URL` is not set).

## Environment Variable Summary

### Backend (Railway)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `PORT` | No | Auto-set by Railway |
| `HOST` | No | Defaults to `0.0.0.0` |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (Production) | Backend API URL from Railway |

**Local Development:** Frontend falls back to `http://localhost:4000` if `VITE_API_URL` is not set.

## Troubleshooting

### Backend Issues

**Server not starting on Railway:**
- Check Railway logs for errors
- Verify `DATABASE_URL` is correct
- Ensure `JWT_SECRET` is set
- Check that `npm start` runs successfully locally

**Database connection errors:**
- Verify `DATABASE_URL` format is correct
- Check database is accessible from Railway's IP ranges
- For Supabase: Use connection pooling URL if available

**CORS errors:**
- Backend CORS is configured to allow all origins
- If issues persist, check Railway logs

### Frontend Issues

**Build fails on Vercel:**
- Check build logs for errors
- Verify all dependencies are in `package.json`
- Ensure `VITE_API_URL` is set (required in production)

**API connection errors:**
- Verify `VITE_API_URL` points to your Railway backend URL
- Check backend is running and accessible
- Test backend health endpoint: `curl https://your-backend.railway.app/api/health`

**404 errors on routes:**
- `vercel.json` is configured for SPA routing
- All routes redirect to `/index.html`

### General Issues

**Environment variables not working:**
- For Vercel: Restart deployment after adding variables
- For Railway: Redeploy after adding variables
- Frontend variables must start with `VITE_` to be exposed

**Local vs Production:**
- Local development uses `localhost` automatically
- Production requires environment variables set in deployment platform
- Never commit `.env` files to git (already in `.gitignore`)

## Production Checklist

- [ ] Backend deployed to Railway
- [ ] Database connected and migrations run
- [ ] `DATABASE_URL` set in Railway
- [ ] `JWT_SECRET` set in Railway (strong random value)
- [ ] Backend health endpoint accessible
- [ ] Frontend deployed to Vercel
- [ ] `VITE_API_URL` set in Vercel (points to Railway backend)
- [ ] Frontend loads without errors
- [ ] API calls work from frontend to backend
- [ ] Local development still works

## Continuous Deployment

Both Railway and Vercel automatically redeploy on git push:

- **Railway**: Redeploys when code is pushed to the connected branch
- **Vercel**: Redeploys when code is pushed (configure branch in settings)

No manual deployment needed - just push to your repository!
