# Render Deployment Guide

## Pre-Deployment Checklist

- ✅ MongoDB Atlas cluster created and connection string obtained
- ✅ Environment variables configured in `.env` files
- ✅ Frontend build optimized with Vite
- ✅ Backend configured to serve static frontend files
- ✅ CORS configured for production URLs

## Deployment Steps

### 1. Connect GitHub Repository to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Sign in with your GitHub account
4. Click "New +" and select "Web Service"
5. Choose your GitHub repository
6. Fill in the deployment details:
   - **Name**: `whatsapp-clone` (or your preferred name)
   - **Root Directory**: `./` (leave empty or specify root)
   - **Runtime**: Node
   - **Build Command**: 
     ```
     cd backend && npm install && cd ../frontend && npm install && npm run build && cd ../backend
     ```
   - **Start Command**: 
     ```
     cd backend && npm start
     ```
   - **Plan**: Free (or paid if preferred)

### 2. Set Environment Variables on Render

After creating the service, go to the Environment tab and add these variables:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<your secure JWT secret>
JWT_EXPIRE=7d
FRONTEND_URL=<your render URL>
ALLOWED_ORIGINS=<your render URL>
SOCKET_CORS_ORIGIN=<your render URL>
SOCKET_TRANSPORTS=websocket,polling
```

### 3. Configure Frontend URLs

Update the backend `.env` file with your Render deployment URL:

```env
# Example: https://whatsapp-clone-xyz.onrender.com
FRONTEND_URL=https://yourdomain.onrender.com
ALLOWED_ORIGINS=https://yourdomain.onrender.com
SOCKET_CORS_ORIGIN=https://yourdomain.onrender.com
```

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the build logs in the Render dashboard
4. Once deployed, your app will be available at `https://yourdomain.onrender.com`

## Important Notes

### MongoDB Atlas Configuration

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0`
3. Add Render's IP address to MongoDB Atlas IP whitelist (usually allow all: 0.0.0.0/0)
4. Use the connection string as `MONGODB_URI` in environment variables

### CORS & SSL

- Render automatically provides HTTPS/SSL
- Update `ALLOWED_ORIGINS` and `SOCKET_CORS_ORIGIN` with your HTTPS Render URL
- Remove localhost URLs from production environment

### Build Time

- The first build might take 3-5 minutes
- Subsequent deployments with auto-deploy on GitHub push should be faster

### Free Tier Limitations

- Application spins down after 15 minutes of inactivity
- No custom domain (use Render subdomain)
- 0.5 GB RAM limit

### Database Backups

- Enable automated backups in MongoDB Atlas
- Free tier allows 7-day backup retention

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all environment variables are set
- Verify MongoDB connection string is correct

### Application Won't Start
- Check that PORT is set to 3000 or match Render's assigned port
- Verify MongoDB connection is working
- Check Node.js compatibility

### Frontend Not Displaying
- Ensure frontend build completes successfully
- Check that `/dist` folder is being created
- Verify static file serving in `backend/app.js`

### Socket.IO Connection Issues
- Ensure `SOCKET_CORS_ORIGIN` matches your Render URL
- Check that websocket transport is enabled
- Verify HTTPS connection (not HTTP)

## Local Testing Before Deployment

To test the production build locally:

```bash
# Terminal 1 - Build and run backend with frontend
cd frontend && npm install && npm run build
cd ../backend && npm install && npm start

# The app will be available at http://localhost:3000
```

## Post-Deployment

1. Test all features: authentication, messaging, contacts, real-time updates
2. Monitor Render dashboard for errors
3. Set up email notifications for deployment failures
4. Consider upgrading from free tier if needed for production use
5. Regularly backup MongoDB data

## Cost Estimate

- **Render Web Service (Free)**: Free with limitations
- **Render Web Service (Paid)**: Starting at $7/month
- **MongoDB Atlas (Free)**: 512MB storage, 3 nodes
- **MongoDB Atlas (Paid)**: Starting at $57/month for M10

For a production application, consider upgrading to paid tiers for better reliability and performance.
