# Jharkhand Tourism Project - Complete Deployment Setup

## 📋 Project Summary

This is a full-stack tourism platform with:
- **Next.js Frontend** - Modern React application with Radix UI components
- **Express.js Backend** - REST API with MongoDB integration
- **MongoDB Database** - Cloud database for storing places, users, bookings
- **AI Features** - Chatbot (powered by Groq), Travel Planner (Gemini API)
- **Payment Integration** - Razorpay for payment processing

## 🎯 Deployment Architecture

```
┌─────────────────────────┐
│  Vercel (Frontend)      │
│  Next.js Application    │
│  https://vercel.app     │
└────────────┬────────────┘
             │ (HTTP Calls to API)
             │
┌────────────▼────────────┐
│  Railway (Backend)      │
│  Express.js API         │
│  https://railway.app    │
└────────────┬────────────┘
             │ (Database Queries)
             │
┌────────────▼────────────┐
│  MongoDB Atlas          │
│  Cloud Database         │
│  (Secured Connection)   │
└─────────────────────────┘
```

## 🔑 Required API Keys & Credentials

### Already Available (in .env):
✅ **MongoDB Connection**
- Username: `maniharika945_db_user`
- Password: `NnMs3xFkNLKvhCxr`
- Cluster: `cluster0.kgucvtd.mongodb.net`

✅ **Groq API Key** (for Chatbot)
- Already configured in the local .env file.

### Need to Generate/Provide:

**1. Gemini API Key** (for Travel Planner AI)
- Get from: https://makersuite.google.com/app/apikey
- Steps:
  1. Go to https://makersuite.google.com/app/apikey
  2. Click "Create API Key"
  3. Copy the key
  4. Add to environment variables

**2. JWT Secret** (for Authentication)
- Generate a random string (min 32 characters)
- Use: https://www.random.org/strings/ or `openssl rand -base64 32`
- Example: `your_random_secret_key_minimum_32_characters_for_security`

**3. Razorpay Keys** (if payment testing needed)
- Test keys already in frontend (.env.example)
- Get production keys from: https://dashboard.razorpay.com (if needed)

## 📝 Files Prepared for Deployment

The following files have been created to assist with deployment:

1. **DEPLOYMENT_GUIDE.md** - Comprehensive step-by-step guide
2. **QUICK_DEPLOYMENT.md** - Quick checklist for faster setup
3. **vercel.json** - Configuration for Vercel deployment
4. **backend/railway.json** - Configuration for Railway deployment
5. **backend/Procfile** - Process file for Railway

## 🚀 Deployment Steps (High-Level)

### Step 1: Prepare Local Repository
```bash
# Verify git status
cd /path/to/Tourism-Jharkhand
git status  # Should be clean

# Ensure code is pushed to GitHub
git push origin main
```
✅ **Already done** - Code is on GitHub at:
`https://github.com/PRATHAM10805/Tourism-Jharkhand.git`

### Step 2: Deploy Backend to Railway
1. Create Railway account (connect GitHub)
2. Create new project from GitHub repo
3. Select `/backend` directory
4. Add environment variables (see QUICK_DEPLOYMENT.md)
5. Deploy
6. **Copy Railway URL** (provided at end)

### Step 3: Deploy Frontend to Vercel
1. Create Vercel account (connect GitHub)
2. Import the GitHub repository
3. Set root directory to repository root
4. Add environment variables with Railway URL
5. Deploy
6. **Copy Vercel URL** (provided at end)

### Step 4: Configure CORS
- Update Railway's `FRONTEND_URL` variable with Vercel URL
- This allows frontend to communicate with backend

### Step 5: Test Application
- Visit frontend URL
- Test key features (chatbot, destinations, travel planner)
- Verify no console errors

## 🔒 Security Configuration

### Environment Variables - **NEVER committed to Git**
```
.env files are in .gitignore ✅
Secrets stored in platform settings ✅
API keys not hardcoded ✅
```

### CORS Configuration - **Restricted to Production Domains**
Backend CORS allows:
- Production Vercel URL
- Localhost (for development)

### Database Access - **Secured Connection String**
- MongoDB Atlas IP Whitelist: 0.0.0.0/0 (for cloud deployment)
- Production credentials never exposed in code

## 📊 Feature Checklist for Testing

After deployment, verify these features work:

**Frontend Features:**
- [ ] Home page loads with destinations
- [ ] Eco-tourism page displays places
- [ ] Cultural tourism section loads
- [ ] Tourist destinations with details show
- [ ] AI Chatbot widget (click bottom-right corner)
- [ ] Travel Planner generates itineraries
- [ ] Navigation and routing works

**Backend Features:**
- [ ] API health endpoint responds: `/api/health`
- [ ] Places endpoint returns data: `/api/places`
- [ ] Chatbot responds: `/api/chatbot/message`
- [ ] Travel planner works: `/api/travel-planner/generate`
- [ ] CORS headers present in responses

**Database Features:**
- [ ] Sample data is available
- [ ] Images load correctly
- [ ] User can be created (auth endpoints work)

## 🎯 Final Submission URLs

After successful deployment, you'll have:

**For Hackathon Submission:**
```
🌐 Frontend: https://your-app.vercel.app
🔌 Backend API: https://your-backend.railway.app/api
📱 Responsive: Yes (works on mobile)
🔒 HTTPS: Yes (automatic)
```

## 📞 Support & Troubleshooting

### Common Issues & Solutions

**Issue: "Cannot GET /"**
- Frontend is not deployed yet
- Deploy to Vercel first

**Issue: "CORS error in console"**
- Backend CORS not configured correctly
- Update FRONTEND_URL in Railway
- Check if backend is running

**Issue: "Cannot connect to MongoDB"**
- MongoDB URI is incorrect
- Check if MongoDB Atlas is accessible from Railway
- Verify IP whitelist in MongoDB Atlas

**Issue: "Deployment stuck or failed"**
- Check platform logs (Railway/Vercel)
- Verify all environment variables are set
- Ensure package.json has correct start scripts

### Useful Links

- Railway Logs: Dashboard → Service → Logs tab
- Vercel Logs: Dashboard → Project → Deployments → Logs
- MongoDB Atlas: https://cloud.mongodb.com

## 📚 Architecture Details

### Frontend (Next.js)
- Framework: Next.js 14+
- Components: Radix UI + TailwindCSS
- Build: `npm run build`
- Start: `npm start`
- API calls via: `/api/*` proxy routes
- Environment: `NEXT_PUBLIC_API_URL` for backend

### Backend (Express.js)
- Framework: Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT
- Middleware: CORS, Helmet, Rate Limiting
- Start: `node server.js`
- Port: Environment variable `PORT` (default 5000)

### Database (MongoDB)
- Service: MongoDB Atlas
- Plan: Free tier (sufficient for hackathon)
- Access: Connection string with authentication
- Collections: Places, Users, Bookings, etc.

## ✨ Key Features Explained

1. **AI Chatbot** - Powered by Groq SDK for fast responses
2. **Travel Planner** - Generates itineraries using Gemini API
3. **Places Database** - MongoDB with rich tourism data
4. **User Authentication** - JWT-based login/signup
5. **Image Upload** - Multer integration for file handling
6. **Payment Integration** - Razorpay for transactions
7. **Blockchain** - Web3 integration for transaction verification
8. **Responsive Design** - Mobile-first UI with Radix components

## 🏁 Next Steps

1. **Read QUICK_DEPLOYMENT.md** for step-by-step instructions
2. **Create accounts** on Vercel and Railway
3. **Gather API keys** (Gemini key especially)
4. **Deploy backend** to Railway
5. **Deploy frontend** to Vercel
6. **Test thoroughly** before hackathon submission
7. **Document URLs** for final submission

---

**Estimated deployment time: 45-60 minutes**
**Most of the time is waiting for builds to complete**

Good luck with your hackathon! 🎉

For detailed step-by-step instructions, see **QUICK_DEPLOYMENT.md** or **DEPLOYMENT_GUIDE.md**
