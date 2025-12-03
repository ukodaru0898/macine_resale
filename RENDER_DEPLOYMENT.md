# 🚀 Deploy to Render.com (Free)

## Why Render?
- ✅ **100% Free** for basic usage
- ✅ **No installation** needed for client
- ✅ **Just share a URL** - client opens in browser
- ✅ **Auto-updates** when you push to GitHub
- ✅ **HTTPS included** automatically

---

## 📋 Prerequisites

1. **GitHub Account** (free)
2. **Render Account** (free) - Sign up at https://render.com

---

## 🎯 Step-by-Step Deployment

### Step 1: Push Code to GitHub

If you haven't already:

```bash
cd "/Users/udaykirankodaru/Documents/Machine Resale rate Caluclations/frontend"
chmod +x github-setup.sh
./github-setup.sh
```

**Important**: Repository must be **Public** for Render free tier!

---

### Step 2: Deploy Backend to Render

1. **Go to**: https://render.com/
2. **Sign in** with GitHub
3. Click **"New +"** → **"Web Service"**

4. **Connect Repository**:
   - Click "Configure account" if needed
   - Select your repository
   - Click "Connect"

5. **Configure Backend**:
   ```
   Name:             machine-resale-backend
   Region:           Oregon (or closest to you)
   Branch:           main
   Root Directory:   (leave empty)
   Runtime:          Docker
   Dockerfile Path:  Dockerfile.backend
   Instance Type:    Free
   ```

6. **Environment Variables**:
   Click "Add Environment Variable":
   ```
   PORT = 5001
   PYTHONUNBUFFERED = 1
   DATABASE_URL = (see PostgreSQL setup below)
   ```

7. **Advanced Settings** (expand):
   - Health Check Path: `/health`
   - Docker Command: (leave empty)

**PostgreSQL Database Setup** (Recommended for Production):

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   ```
   Name:          machine-resale-db
   Database:      machine_resale
   User:          (auto-generated)
   Region:        Same as backend
   Instance Type: Free
   ```
3. Click **"Create Database"**
4. Wait 2 minutes for provisioning
5. Copy the **Internal Database URL** (starts with `postgresql://`)
6. Go back to your backend service → Environment → Add:
   ```
   DATABASE_URL = postgresql://user:pass@host/dbname
   ```
   (Paste the Internal Database URL you copied)
7. Save and trigger manual deploy

**Note**: Without PostgreSQL, user accounts will reset on every deployment. SQLite is only for local development.

8. Click **"Create Web Service"**

9. **Wait 3-5 minutes** for deployment
   - Watch the logs - you'll see "Running on http://0.0.0.0:5001"
   - Copy the backend URL (e.g., `https://machine-resale-backend.onrender.com`)

---

### Step 3: Deploy Frontend to Render

1. Click **"New +"** → **"Web Service"** again

2. **Select same repository**

3. **Configure Frontend**:
   ```
   Name:             machine-resale-frontend
   Region:           Same as backend
   Branch:           main
   Root Directory:   (leave empty)
   Runtime:          Docker
   Dockerfile Path:  Dockerfile
   Instance Type:    Free
   ```

4. **Environment Variables**:
   ```
   VITE_BACKEND_URL = https://machine-resale-backend.onrender.com
   ```
   ⚠️ Use YOUR actual backend URL from Step 2!

5. Click **"Create Web Service"**

6. **Wait 3-5 minutes** for deployment

---

## ✅ Access Your Application

Once deployed:

1. **Frontend URL**: `https://machine-resale-frontend.onrender.com`
2. **Share this URL** with your client
3. Client opens it in browser - **no installation needed**!

---

## 🔍 Troubleshooting

### ❌ Backend shows "Build failed"

**Check Dockerfile.backend**:
- Ensure `requirements.txt` exists in `/backend` folder
- Check logs for missing dependencies

### ❌ Frontend shows 502 or CORS errors

**Fix**: Update backend URL in frontend environment variables:
1. Go to frontend service on Render
2. Environment → Edit
3. Set `VITE_BACKEND_URL` to correct backend URL
4. Save and redeploy

### ❌ "Free instance spins down after 15 minutes of inactivity"

**Normal behavior** on free tier:
- First request after idle takes 30-60 seconds
- Upgrade to paid tier ($7/month) for always-on

### ❌ Base.xlsx not found

**Fix**: Ensure `public/sample_data/Base.xlsx` exists:
```bash
ls public/sample_data/Base.xlsx
```

If missing, copy from backend:
```bash
cp backend/sample_data/Base.xlsx public/sample_data/
```

Then commit and push:
```bash
git add public/sample_data/Base.xlsx
git commit -m "Add Base.xlsx for Render deployment"
git push
```

Render will auto-redeploy.

---

## 💰 Pricing

| Feature | Free | Paid ($7/month) |
|---------|------|-----------------|
| CPU | 0.1 CPU | 0.5 CPU |
| RAM | 512 MB | 512 MB |
| Uptime | Spins down after 15 min | Always on |
| Build time | 90 sec deploy | Priority builds |

**Recommendation**: Start with **Free** tier. Upgrade only if client needs 24/7 uptime.

---

## 🔄 Auto-Deploy Updates

Every time you push to GitHub, Render **automatically rebuilds and deploys**!

```bash
# Make changes to code
git add .
git commit -m "Fixed optimizer bug"
git push

# Render auto-deploys in ~3 minutes
```

---

## 📊 Monitor Your App

**Render Dashboard**: https://dashboard.render.com

- View logs in real-time
- Monitor CPU/RAM usage
- Check deployment history
- Set up custom domains (paid)

---

## 🎁 Alternative: One-Click Deploy

**Easiest method** - Add this button to your GitHub README:

```markdown
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/YOUR_REPO)
```

Client clicks button → Render auto-configures everything!

---

## 🆘 Need Help?

1. **Render Docs**: https://render.com/docs
2. **Community**: https://community.render.com
3. **Support**: support@render.com (responds in ~1 day)

---

## 📝 Summary

**For Client**:
- Open: `https://machine-resale-frontend.onrender.com`
- Upload `Base.xlsx`
- Click "Optimize Bundle"
- Download results
- **No installation, no Docker, no setup!**

**For You**:
- Update code → `git push`
- Render auto-deploys in 3 minutes
- Share new URL if needed

---

**🎉 That's it! Your app is now live on the internet!**
