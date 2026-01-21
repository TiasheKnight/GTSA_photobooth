# Docker & Deployment Quick Start

## Why Docker?

✅ **Consistency** - Same environment everywhere (dev, test, production)  
✅ **Isolation** - No conflicts with system Python or other projects  
✅ **Reproducibility** - Others can run your code exactly as intended  
✅ **Reliability** - Fixes the "works on my machine" problem  

## Local Development

### Start the App with Docker

```bash
cd /path/to/gtsa-photobooth
docker-compose up --build
```

The app will be at **http://localhost:5000**

### Stop the App

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f
```

### Rebuild if Dependencies Change

```bash
docker-compose up --build
```

---

## Deploy to Render (with Docker)

### Why Render?

- **Free tier** with automatic deployments
- **Detects Dockerfile** automatically
- **Auto-redeploy** on every git push
- **Environment variables** dashboard
- **Logs** accessible in UI

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git push origin render
   ```

2. **Go to [render.com](https://render.com)**

3. **Create Web Service**
   - Click "New +" → "Web Service"
   - Select your GitHub repo
   - **Important**: Set Environment to **Docker**
   - Leave build/start commands empty (uses Procfile)
   - Select Free plan

4. **Add Environment Variables** in Render dashboard:
   ```
   SECRET_KEY=<generate-random-string>
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_USE_TLS=True
   ```

5. **Deploy!** - Watch the logs in Render dashboard

### Troubleshooting

**"Service failing to start"**
- Check logs in Render dashboard
- Verify all required env vars are set

**"Module not found"**
- Ensure `requirements.txt` has all dependencies
- Rebuild with `docker-compose up --build` locally to test

**"Address already in use"**
- Stop previous container: `docker-compose down`
- Clear Docker: `docker system prune`

---

## Files Added for Docker

- **Dockerfile** - Defines the container image
- **docker-compose.yml** - Local development orchestration
- **.dockerignore** - Excludes unnecessary files from image
- **Procfile** - Updated for Docker deployment

All original Flask code remains unchanged!
