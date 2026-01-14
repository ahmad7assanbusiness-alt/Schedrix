# Deployment Guide

## Vercel Deployment

### Client (Frontend) Deployment

1. **Connect your GitHub repo to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository: `ahmad7assanbusiness-alt/Schedrix`
   - Select the `dev` branch

2. **Configure Vercel settings:**
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Environment Variables (if deploying backend separately):**
   - `VITE_API_URL` - Your backend API URL (e.g., `https://your-api.vercel.app`)

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically detect the `vercel.json` configuration

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
- Make sure `vercel.json` is in the root or client directory
- Verify the rewrite rules are correct

**API Connection Issues:**
- Set `VITE_API_URL` environment variable in Vercel
- Make sure CORS is enabled on your backend
- Check that your backend is deployed and accessible

