# Environment Configuration Reference

## Development (.env)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio
ADMIN_EMAIL=mahasethrahul7@gmail.com
NODE_ENV=development
```

## Production (.env.production - DO NOT COMMIT)
```env
# MongoDB Atlas Cloud Database
# Get this from: https://www.mongodb.com/cloud/atlas
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster-name.mongodb.net/portfolio?retryWrites=true&w=majority

# Frontend URL (for CORS)
VITE_API_URL=https://your-backend.vercel.app

# Admin Email
ADMIN_EMAIL=mahasethrahul7@gmail.com

# Deployment Environment
NODE_ENV=production

# Server Port (Vercel auto-assigns)
PORT=5000
```

## Setup Instructions

### 1. Local Development
Use the existing `.env` file in `backend/` directory

### 2. Production (Vercel)
1. **Create MongoDB Atlas Account**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get connection string

2. **Add to Vercel Dashboard**
   - Project Settings → Environment Variables
   - Add each variable from `.env.production`
   - Redeploy to apply changes

3. **Create .env.production (Local only, for testing)**
   - Copy the template above
   - Replace placeholders with real values
   - Never commit to Git

### 3. Frontend Environment Variables
Create `.env` in root directory:
```env
VITE_API_URL=http://localhost:5000
```

For production, set `VITE_API_URL` via Vercel environment variables.

## Security Notes
- ⚠️ Never commit `.env` or `.env.production` to Git
- ⚠️ Use strong passwords for MongoDB Atlas
- ⚠️ Keep connection strings private
- ⚠️ Rotate credentials periodically
- ✓ Use Vercel's environment variables for secrets
