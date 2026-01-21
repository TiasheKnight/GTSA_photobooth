# GTSA Photobooth - Deployment Guide

## Local Development with Docker

### Prerequisites
- Docker Desktop installed
- `.env` file with configuration

### Running Locally

```bash
# Build and start container
docker-compose up --build

# App will be available at http://localhost:5000
```

**Stopping the container:**
```bash
docker-compose down
```

### Rebuilding Dependencies

If you add new packages to `requirements.txt`:
```bash
docker-compose up --build
```

---

## Deployment to Render

This guide will help you deploy your Flask photobooth app to Render using Docker.

### Prerequisites
- GitHub account
- Render account (free at https://render.com)
- Docker image built and tested locally

### Step 1: Push Code to GitHub

If you haven't already, initialize and push your project:

```bash
# In your project directory
git add .
git commit -m "Prepare for deployment"
git push origin main
```

If you need to create a new GitHub repo:
1. Go to https://github.com/new
2. Create a new repository (e.g., `gtsa-photobooth`)
3. Follow the instructions to push your existing code

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up (you can use your GitHub account)
3. Go to your dashboard

### Step 3: Create Web Service

1. Click **"New +"** and select **"Web Service"**
2. Select **"Connect a repository"** and authenticate with GitHub
3. Find and select your `gtsa-photobooth` repository
4. Configure as follows:

| Setting | Value |
|---------|-------|
| Name | `gtsa-photobooth` |
| Environment | `Docker` (auto-detected from Dockerfile) |
| Region | `Ohio` (or closest to you) |
| Branch | `main` |
| Build Command | (Leave empty - Docker builds automatically) |
| Start Command | (Leave empty - Procfile used) |
| Plan | `Free` |

**Note:** Render will automatically detect the `Dockerfile` and build your image. No build/start commands needed.

### Step 4: Add Environment Variables

In the Render dashboard, go to **Environment** and add:

```
SECRET_KEY=your-secret-key-here
MAIL_SERVER=your-email-provider-smtp
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
FLASK_DEBUG=False
```

**For Gmail:**
- MAIL_SERVER: `smtp.gmail.com`
- MAIL_PORT: `587`
- MAIL_PASSWORD: Use an [App Password](https://support.google.com/accounts/answer/185833)

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically start building and deploying
3. Check logs for any errors
4. Once deployed, you'll get a URL like: `https://gtsa-photobooth.onrender.com`

### Step 6: Access Your App

Visit your new URL in your browser. The app should be live!

### Important Notes

- **Free tier limitations:**
  - Spins down after 15 minutes of inactivity
  - Takes ~30 seconds to restart
  - Not suitable for high-traffic production use

- **For production use:**
  - Upgrade to a paid plan
  - Set up a custom domain
  - Enable HTTPS (automatic with Render)

### Troubleshooting

**Check logs:**
```
In Render dashboard → Logs tab
```

**Common issues:**
- Module not found: Add to requirements.txt
- Environment variables not set: Check Env tab
- Email not working: Verify MAIL credentials
- Port issues: Ensure start command uses `gunicorn`

### Redeploying

Simply push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will automatically rebuild and redeploy!

### Update Requirements

If you install new packages locally:
```bash
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update dependencies"
git push origin main
```

---

**Need help?** Visit https://render.com/docs
