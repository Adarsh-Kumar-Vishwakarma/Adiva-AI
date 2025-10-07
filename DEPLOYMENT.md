# Adiva AI - Vercel Deployment Guide

This guide will help you deploy your Adiva AI application to Vercel.

## 🚀 Deployment Options

### Option 1: Deploy Frontend and Backend Separately (Recommended)

#### Frontend Deployment
1. **Deploy Frontend to Vercel:**
   ```bash
   cd frontend
   vercel --prod
   ```

2. **Backend Deployment:**
   ```bash
   cd backend
   vercel --prod
   ```

### Option 2: Deploy as Monorepo

1. **From project root:**
   ```bash
   vercel --prod
   ```

## 🔧 Environment Variables Setup

### Frontend Environment Variables (Vercel Dashboard)
- `VITE_API_URL` = `https://your-backend-url.vercel.app`
- `VITE_GOOGLE_CLIENT_ID` = `your_google_client_id`

### Backend Environment Variables (Vercel Dashboard)
- `MONGODB_URI` = `your_mongodb_connection_string`
- `OPENAI_API_KEY` = `your_openai_api_key`
- `ANTHROPIC_API_KEY` = `your_anthropic_api_key`
- `JWT_SECRET` = `your_jwt_secret`
- `SESSION_SECRET` = `your_session_secret`
- `GOOGLE_CLIENT_ID` = `your_google_client_id`
- `GOOGLE_CLIENT_SECRET` = `your_google_client_secret`
- `NODE_ENV` = `production`

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas database configured
- [ ] OpenAI API key obtained
- [ ] Google OAuth credentials set up
- [ ] Environment variables configured
- [ ] Frontend API URL updated to point to backend
- [ ] All sensitive data removed from code
- [ ] .env files properly gitignored

## 🌐 Post-Deployment Steps

1. **Update CORS settings** in backend for production domain
2. **Test authentication** flows
3. **Verify AI chat functionality**
4. **Check image upload processing**
5. **Monitor error logs** in Vercel dashboard

## 🔍 Troubleshooting

### Common Issues:
- **CORS errors**: Update backend CORS settings for production domain
- **Environment variables**: Ensure all required env vars are set in Vercel
- **Database connection**: Verify MongoDB Atlas connection string
- **API endpoints**: Check that frontend is pointing to correct backend URL

### Debug Commands:
```bash
# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Redeploy with debug
vercel --debug
```

## 📊 Monitoring

- Monitor your deployments in the Vercel dashboard
- Check function logs for errors
- Monitor API usage and performance
- Set up alerts for critical issues
