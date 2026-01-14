# Deployment Guide

## Vercel Deployment

### Client (Frontend) Deployment

1. **Connect your GitHub repo to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository: `ahmad7assanbusiness-alt/Schedrix`
   - **IMPORTANT:** Select the `dev` branch (not `main`)

2. **Configure Vercel Project Settings:**
   Go to **Settings → General**
   - **Root Directory:** Leave empty (use root) - the `vercel.json` handles the build
   - **Framework Preset:** Other
   - **Build Command:** `cd client && npm install && npm run build`
   - **Output Directory:** `client/dist`
   - **Install Command:** `cd client && npm install`

   OR alternatively:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Environment Variables (if deploying backend separately):**
   - `VITE_API_URL` - Your backend API URL (e.g., `https://your-api.vercel.app`)

4. **Deploy:**
   - Click "Deploy"
   - The `vercel.json` configuration will handle SPA routing

### Server (Backend) Deployment

For the backend, you can deploy to:
- **Vercel** (with serverless functions)
- **Railway**
- **Render**
- **Heroku**

**Important:** Make sure to set these environment variables:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Your JWT secret key
- `PORT` - Port number (usually auto-set by platform)

### Troubleshooting

**404 Error on Vercel:**
- ✅ Fixed! The `vercel.json` file handles SPA routing
- The rewrite rules redirect all routes to `/index.html`

**Build Error: "No Next.js version detected":**
- ✅ Fixed! Updated `vercel.json` to configure for Vite, not Next.js
- Make sure you're deploying from the `dev` branch (not `main`)
- Verify build settings point to the `client` directory

**API Connection Issues:**
- Set `VITE_API_URL` environment variable in Vercel
- Make sure CORS is enabled on your backend
- Check that your backend is deployed and accessible

