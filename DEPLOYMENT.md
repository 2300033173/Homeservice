# 🚀 HouseMate Deployment Guide

## Vercel Deployment Steps

### 1. Prerequisites
- GitHub repository with your code
- Vercel account (free)
- Supabase project setup

### 2. Deploy to Vercel

**Option A: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `housemate` repository
5. Configure settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

**Option B: Vercel CLI**
```bash
npm i -g vercel
cd HouseMate
vercel --prod
```

### 3. Environment Variables (Important!)

Add these in Vercel Dashboard → Settings → Environment Variables:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Custom Domain (Optional)
- Go to Vercel Dashboard → Domains
- Add your custom domain
- Update DNS settings as instructed

### 5. Database Setup
1. Create Supabase project
2. Run `FINAL_SUPABASE_SETUP.sql` in SQL Editor
3. Update environment variables in Vercel

## 🔧 Configuration Files Added

- `vercel.json` - Vercel deployment config
- `_redirects` - SPA routing support
- Updated `package.json` - Build optimization

## 🌐 Live URLs

After deployment, you'll get:
- **Production**: `https://your-project.vercel.app`
- **Custom Domain**: `https://yourdomain.com` (if configured)

## 📱 Features Deployed

✅ Complete React application
✅ Supabase database integration
✅ Role-based authentication
✅ 100+ home services
✅ Real-time booking system
✅ Modern responsive UI
✅ Performance optimizations

## 🔄 Auto-Deployment

Vercel automatically deploys when you:
- Push to `main` branch
- Merge pull requests
- Make any changes to connected repository

## 🛠 Troubleshooting

**Build Errors:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

**Database Issues:**
- Confirm Supabase URL and keys
- Check RLS policies in Supabase
- Verify SQL setup completed

**Routing Issues:**
- Ensure `_redirects` file exists
- Check `vercel.json` configuration

## 📞 Support

For deployment issues:
1. Check Vercel build logs
2. Verify Supabase connection
3. Test locally first with `npm run build`

---

**Your HouseMate platform will be live in minutes!** 🎉