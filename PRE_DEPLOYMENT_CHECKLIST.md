# Pre-Deployment Checklist

## Database Backup
- [ ] Install MongoDB tools (if not already installed)
- [ ] Run: `node backend/export_data.js`
- [ ] Verify backup files in `backups/` folder
- [ ] Save backup to external storage

## Verify All Data
- [ ] Run: `node backend/migrate_to_production.js`
- [ ] Check `migration_report.json` for all collections
- [ ] Confirm total document count matches expectations

## Cloud Database Setup
- [ ] Create MongoDB Atlas account
- [ ] Create free tier cluster
- [ ] Create database user with password
- [ ] Add your IP to IP Whitelist
- [ ] Get connection string (save to `.env.production`)
- [ ] Test local connection with new MongoDB URI

## Repository Preparation
- [ ] Ensure `.env` and `.env.production` are in `.gitignore`
- [ ] Review `README.md` for deployment instructions
- [ ] Test build locally: `npm run build`
- [ ] Check `dist/` folder is created successfully

## Vercel Setup
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Framework: Vite
  - Build command: `npm run build`
  - Output directory: `dist`
- [ ] Add environment variables:
  - [ ] `MONGODB_URI` (from MongoDB Atlas)
  - [ ] `ADMIN_EMAIL`
  - [ ] `NODE_ENV=production`
  - [ ] `VITE_API_URL` (will be set after first deployment)

## Pre-Deployment Testing
- [ ] Test API endpoints locally with production MongoDB URI
- [ ] Test file uploads
- [ ] Test contact form
- [ ] Test admin authentication
- [ ] Test all admin CRUD operations

## First Deployment
- [ ] Deploy to Vercel
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors
- [ ] Get production URL

## Post-Deployment Verification
- [ ] Visit production URL
- [ ] Check if frontend loads
- [ ] Test API: `curl https://your-domain.vercel.app/api/certificates`
- [ ] Verify all data appears correctly
- [ ] Test contact form submission
- [ ] Test file uploads on admin panel
- [ ] Monitor logs for errors

## Monitoring
- [ ] Set up Vercel alerts
- [ ] Monitor MongoDB usage
- [ ] Check application logs regularly
- [ ] Monitor storage usage

## Rollback Plan
- [ ] Keep previous deployment version
- [ ] Know how to restore from backup
- [ ] Test rollback procedure locally before production

---

**Status: READY FOR DEPLOYMENT ✓**

Once all items are checked, proceed with deployment!
