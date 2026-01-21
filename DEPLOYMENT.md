# Deployment Guide

This guide covers deploying the ScheduleManager app to production with:
- **Backend**: Render (FREE) or Railway
- **Frontend**: Vercel

## Prerequisites

- GitHub repository connected to Render/Railway and Vercel
- PostgreSQL database (Render PostgreSQL, Supabase, or Railway PostgreSQL)
- Node.js 18+ runtime

## Backend Deployment (Render - FREE)

**Render offers a free tier for web services!**

### 1. Create Account and Connect Repository

1. Go to [render.com](https://render.com)
2. Sign up for free (GitHub login works)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository: `ahmad7assanbusiness-alt/Schedrix`
5. Select the `dev` branch (or `main`)

### 2. Configure Web Service

**Settings:**
- **Name**: `schedrix-backend` (or any name)
- **Region**: Choose closest to you (Oregon, Frankfurt, Singapore)
- **Branch**: `dev` (or `main`)
- **Root Directory**: `server` (important!)
- **Runtime**: `Node`
- **Build Command**: `npm install && npx prisma generate`
- **Start Command**: `npm start`
- **Plan**: **Free** (select "Starter" plan - it's free!)

### 3. Set Environment Variables

In the "Environment" section, add:

```
DATABASE_URL=postgresql://user:password@host:5432/database?connection_limit=10&pool_timeout=20
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=production
```

**Important:**
- `DATABASE_URL`: Use Render PostgreSQL, Supabase, or any PostgreSQL database
  - **Connection Pooling**: For production, add `?connection_limit=10&pool_timeout=20` to optimize database connections
  - **Supabase**: Use the "Connection Pooling" URL from your Supabase dashboard (port 6543 instead of 5432)
- `JWT_SECRET`: Generate a strong random string (e.g., `openssl rand -base64 32`)
- `PORT`: Render automatically sets this (no need to set manually)

**Performance Tip:** Connection pooling parameters (`connection_limit` and `pool_timeout`) help prevent database connection exhaustion and improve response times, especially on Render's free tier.

### 4. Create PostgreSQL Database (Optional - Free on Render)

If you need a database:
1. Click "New +" → "PostgreSQL"
2. Choose **Free** plan
3. Copy the **Internal Database URL** (for Render services) or **External Database URL** (for external access)
4. Use this as your `DATABASE_URL`

### 5. Deploy

Click "Create Web Service" - Render will:
1. Install dependencies
2. Generate Prisma client
3. Start your server
4. Provide a public URL: `https://your-app.onrender.com`

**⚠️ Render Free Tier Cold Starts:**
- Services spin down after 15 minutes of inactivity
- **First request after spin-down takes 30-60 seconds to respond** (this is why login/dashboard may appear slow or fail)
- Subsequent requests are fast while the service is awake
- **Solution:** Upgrade to Render's paid tier ($7/month) to avoid cold starts, OR use Railway ($5/month free credit)

### 6. Get Your Backend URL

After deployment, Render provides a URL like:
- `https://schedrix-backend.onrender.com`

Copy this URL - you'll need it for the frontend.

### 7. Verify Backend is Running

Test the health endpoint:
```bash
curl https://your-app.onrender.com/api/health
```

Should return: `{"status":"live"}`

## Backend Deployment (Railway - Alternative)

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

### Backend (Render/Railway)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `PORT` | No | Auto-set by platform |
| `HOST` | No | Defaults to `0.0.0.0` |
| `NODE_ENV` | No | Set to `production` |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (Production) | Backend API URL from Render/Railway (e.g., `https://your-app.onrender.com`) |

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
- Verify `VITE_API_URL` points to your Render/Railway backend URL
- Check backend is running and accessible
- Test backend health endpoint: `curl https://your-backend.onrender.com/api/health`
- **Render Free Tier**: Services may take 30-60 seconds to wake up after inactivity
  - **This is the main cause of slow login/dashboard loading**
  - First request after 15 min inactivity triggers a cold start
  - Consider upgrading to paid tier or using Railway for better performance

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

- [ ] Backend deployed to Render (free) or Railway
- [ ] Database connected (Render PostgreSQL, Supabase, or Railway)
- [ ] `DATABASE_URL` set in backend platform
- [ ] `JWT_SECRET` set in backend platform (strong random value)
- [ ] Backend health endpoint accessible (`/api/health`)
- [ ] Frontend deployed to Vercel
- [ ] `VITE_API_URL` set in Vercel (points to Render/Railway backend)
- [ ] Frontend loads without errors
- [ ] API calls work from frontend to backend
- [ ] Local development still works

## Continuous Deployment

All platforms automatically redeploy on git push:

- **Render**: Redeploys when code is pushed to the connected branch
- **Railway**: Redeploys when code is pushed to the connected branch
- **Vercel**: Redeploys when code is pushed (configure branch in settings)

No manual deployment needed - just push to your repository!

## Free Tier Limitations

### Render Free Tier:
- ✅ Free web services (spins down after 15 min inactivity)
- ✅ Free PostgreSQL database (90 days, then $7/month)
- ✅ Automatic wake-up on request (30-60 second delay)
- ✅ 750 hours/month free compute time
- ⚠️ Service may take 30-60 seconds to wake up after inactivity

### Railway:
- ✅ $5/month free credit (enough for small projects)
- ⚠️ Requires payment method (but uses free credits first)

**Recommendation**: Start with **Render** for completely free deployment!
