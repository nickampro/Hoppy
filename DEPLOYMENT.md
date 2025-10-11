# Hoppy Game - CapRover Deployment Guide

## 📦 Deployment Files

This repository is now configured for easy CapRover deployment with the following files:

- `Dockerfile` - Multi-stage production build
- `captain-definition` - CapRover configuration
- `nginx.conf` - Optimized web server configuration
- `.dockerignore` - Build optimization

## 🚀 CapRover Deployment Steps

### 1. Prerequisites
- CapRover server set up and running
- Domain configured for your CapRover instance
- CLI tool installed: `npm install -g caprover`

### 2. Deploy to CapRover

```bash
# Login to your CapRover instance
caprover login

# Deploy the app (run from project root)
caprover deploy

# Or deploy with a specific app name
caprover deploy --appName hoppy-game
```

### 3. App Configuration

After deployment, configure your app in CapRover:

1. **Domain**: Set up your custom domain
2. **HTTPS**: Enable SSL certificate
3. **Environment**: Set to production
4. **Health Check**: Uses `/health` endpoint

## 🔧 Features Included

### Docker Optimization
- Multi-stage build for smaller image size
- Production-optimized nginx configuration
- Proper PWA headers and caching
- Health check endpoint

### PWA Features
- Service worker with offline functionality
- Web app manifest for installation
- Mobile-optimized responsive design
- Touch controls for mobile devices

### Performance
- Gzip compression enabled
- Static asset caching (1 year for images/fonts)
- Service worker cache invalidation
- Optimized nginx configuration

## 📱 PWA Installation

Once deployed, users can:
1. Visit your domain
2. See "Install App" prompt on supported browsers
3. Install as native-like app on their device
4. Use offline after first load

## 🛠 Troubleshooting

### Build Issues
- Ensure `captain-definition` file is in project root
- Check that `Dockerfile` is properly formatted
- Verify all dependencies are in `package.json`

### Runtime Issues
- Check app logs in CapRover dashboard
- Verify nginx configuration syntax
- Test health endpoint: `https://your-domain/health`

## 🎮 Game Features

- Touch controls for mobile
- Keyboard controls for desktop
- High score persistence
- Offline play capability
- Responsive design for all screen sizes

## 📊 Performance Tips

- App uses aggressive caching for static assets
- Service worker provides offline functionality
- Nginx serves static files efficiently
- Gzip compression reduces bandwidth

---

Ready for deployment! 🚀