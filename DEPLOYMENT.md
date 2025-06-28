# 🚀 Railway Deployment Guide

## Why Railway over Render?

- **Speed**: Deployments take 30 seconds vs 5+ minutes on Render
- **Reliability**: Less downtime and better uptime
- **Free Tier**: $5/month credit (enough for small apps)
- **Developer Experience**: Better CLI, logs, and dashboard

## Step-by-Step Railway Setup

### 1. Create Railway Account

1. Go to [Railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Verify your email

### 2. Deploy Your Backend

1. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `meeting-app` repository

2. **Configure Service**
   - **Root Directory**: `meeting-game-backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Environment**: Node.js (auto-detected)

3. **Deploy**
   - Click "Deploy" and wait ~30 seconds
   - Your app will be live at `https://your-app-name.railway.app`

### 3. Get Railway Token

1. Go to Railway Dashboard → Account → Tokens
2. Click "New Token"
3. Copy the token (you'll need this for GitHub Actions)

### 4. Set up GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `RAILWAY_TOKEN`: Your Railway API token
   - `RAILWAY_SERVICE`: Your Railway service name (found in Railway dashboard)

### 5. Update Frontend Configuration

Once deployed, update your frontend to use the new Railway URL:

```javascript
// In your frontend code, the API base URL will automatically detect Railway
// But you can also set it manually in your .env file:
VITE_API_BASE_URL=https://your-app-name.railway.app
```

### 6. Test Deployment

1. Push a small change to trigger automatic deployment
2. Check that your backend responds at the Railway URL
3. Test the frontend connection

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Railway logs for errors
   - Ensure `package.json` has correct scripts
   - Verify all dependencies are in `package.json`

2. **App Won't Start**
   - Check if port is set correctly (Railway sets `PORT` env var)
   - Verify start command is correct
   - Check logs for runtime errors

3. **CORS Issues**
   - Update CORS origins in `index.js` to include your Railway domain
   - Add `https://omribardiam.github.io` to allowed origins

### Railway CLI (Optional)

Install Railway CLI for local development:

```bash
npm install -g @railway/cli
railway login
railway link  # Link to your project
railway up    # Deploy manually
```

## Migration from Render

If you're currently using Render:

1. **Keep Render running** until Railway is confirmed working
2. **Deploy to Railway** following steps above
3. **Test thoroughly** on Railway
4. **Update frontend** to use Railway URL
5. **Delete Render service** once confirmed working

## Cost Comparison

| Platform | Free Tier | Paid Plans | Speed |
|----------|-----------|------------|-------|
| **Railway** | $5/month credit | $20/month | ⚡ Fast |
| Render | 750 hours/month | $7/month | 🐌 Slow |
| Fly.io | 3 VMs, 3GB storage | $1.94/month | ⚡ Fast |
| Cyclic | 1 app, 512MB RAM | $5/month | ⚡ Fast |

## Next Steps

1. Deploy to Railway
2. Test all features (scoring, chat, quests)
3. Update your team with the new URL
4. Monitor Railway dashboard for any issues

---

**Need help?** Check Railway's [documentation](https://docs.railway.app) or their Discord community! 