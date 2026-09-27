# Jharkhand Tourism – Deployment Guide

## 1. Project Overview

The Jharkhand Tourism project is a smart tourism web application designed to promote the eco-tourism and cultural tourism of Jharkhand.

### Technology Stack

* **Frontend:** Next.js, React, JavaScript, HTML, CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **AI:** Groq API
* **AI Model:** `openai/gpt-oss-20b`
* **Payment:** Razorpay
* **Frontend Hosting:** Vercel
* **Backend Hosting:** Railway
* **Source Code:** GitHub

### Deployment Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Vercel        │
                    │   Next.js Frontend  │
                    └──────────┬──────────┘
                               │
                         HTTPS API Calls
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Railway        │
                    │ Node.js + Express   │
                    │      Backend        │
                    └──────┬───────┬──────┘
                           │       │
                 ┌─────────┘       └─────────┐
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │  MongoDB Atlas  │         │    Groq API     │
        │    Database     │         │   AI Chatbot    │
        └─────────────────┘         └─────────────────┘

                         │
                         ▼
                  ┌─────────────┐
                  │  Razorpay   │
                  │   Payment   │
                  └─────────────┘
```

---

# 2. Prerequisites

Before deployment, make sure you have:

1. GitHub account
2. GitHub repository containing the project
3. Vercel account
4. Railway account
5. MongoDB Atlas account
6. Groq API key
7. Razorpay account and API keys if payment functionality is enabled

### Repository

The project repository is:

`Maniharika4508/Tourism-Jharkhand`

Do not add API keys, passwords, or database credentials to the GitHub repository.

---

# 3. MongoDB Atlas Configuration

The project uses MongoDB Atlas for storing tourism-related application data.

### Required Environment Variable

```env
MONGODB_URI=your_mongodb_connection_string
```

The actual MongoDB connection string must be stored only in the deployment platform's environment variables.

### MongoDB Atlas Settings

1. Open MongoDB Atlas.
2. Select the project cluster.
3. Open **Database Access**.
4. Verify the database user.
5. Open **Network Access**.
6. Add the required IP access configuration.
7. Verify that the backend can connect to MongoDB.

### Database

The application uses:

```text
jharkhand_tourism
```

Do not place the MongoDB username or password inside the README or source code.

---

# 4. Backend Deployment – Railway

The backend is a Node.js and Express.js application.

### Backend Location

```text
Tourism-Jharkhand/backend
```

### Step 1 – Create Railway Project

1. Open Railway.
2. Sign in using GitHub.
3. Create a new project.
4. Select **Deploy from GitHub Repo**.
5. Select:

```text
Maniharika4508/Tourism-Jharkhand
```

6. Configure the service to use the backend directory.

---

## Step 2 – Backend Environment Variables

Add the following variables in Railway:

```env
MONGODB_URI=your_mongodb_uri
NODE_ENV=production
PORT=5000
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

If Razorpay is enabled in the backend:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Use your actual values only inside Railway Environment Variables.

### Important

Never commit:

```text
.env
.env.local
.env.production
```

to GitHub.

---

# 5. Backend Start Command

The backend uses Node.js and Express.

Typical start command:

```bash
node server.js
```

For local development:

```bash
npm install
npm run dev
```

The backend should start successfully before continuing with frontend deployment.

---

# 6. Backend API Testing

After Railway deployment, Railway provides a public HTTPS URL.

For example:

```text
https://your-backend-name.up.railway.app
```

Test the health endpoint:

```text
https://your-backend-name.up.railway.app/api/health
```

The backend should return a successful response.

Other important API routes include:

```text
/api/health
/api/chatbot/health
/api/travel-planner/health
/api/docs
```

The exact availability of individual routes depends on the current project implementation.

---

# 7. Frontend Deployment – Vercel

The frontend is a Next.js application.

### Step 1 – Create Vercel Project

1. Open Vercel.
2. Sign in with GitHub.
3. Select **Add New Project**.
4. Import:

```text
Maniharika4508/Tourism-Jharkhand
```

5. Select **Next.js** as the framework.
6. Keep the project root at the repository root.
7. Verify the build configuration.
8. Deploy the project.

---

# 8. Frontend Environment Variables

After Railway provides the backend URL, configure the frontend environment variable in Vercel.

```env
NEXT_PUBLIC_API_URL=https://your-backend-name.up.railway.app
```

If the project uses an application URL variable:

```env
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

Replace the example URLs with the actual deployed URLs.

---

# 9. CORS Configuration

The frontend and backend are hosted separately.

Therefore, the backend must allow requests from the deployed Vercel frontend.

Set:

```env
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

After changing the environment variable:

1. Save the variable.
2. Redeploy the Railway backend.
3. Open the Vercel website.
4. Test API-dependent features.

---

# 10. AI Chatbot Configuration

The tourism chatbot uses the **Groq API**.

### Required Variable

```env
GROQ_API_KEY=your_groq_api_key
```

The project uses:

```text
openai/gpt-oss-20b
```

The API key must be configured in Railway.

It must **not** be placed directly inside frontend code.

### Chatbot Testing

Test questions such as:

```text
Tell me about Dassam Falls.
```

```text
Tell me about Hundru Falls.
```

```text
Plan a 3-day trip to Jharkhand.
```

```text
झारखंड की जनजातीय संस्कृति के बारे में बताओ।
```

```text
దస్సం జలపాతం గురించి చెప్పు.
```

The chatbot should answer using the project's tourism knowledge and should avoid inventing unsupported information.

---

# 11. AI Trip Planner Testing

After deployment, test the AI Trip Planner using different inputs.

Example:

```text
Duration: 3 Days
Budget: Medium
Interest: Waterfalls
Activities: Nature and Culture
```

Verify that:

* The request reaches the backend.
* The AI service responds.
* A suitable itinerary is generated.
* The frontend displays the response correctly.

---

# 12. Razorpay Payment Configuration

If Razorpay payment functionality is enabled, configure the required keys only through Railway environment variables.

```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### Testing

First use Razorpay test mode.

Verify:

1. Payment page opens.
2. Test payment can be completed.
3. Success response is received.
4. Failure response is handled correctly.
5. Backend verifies the payment response.

For real payments, the Razorpay account must be properly configured for live transactions and the live credentials must be stored securely on the backend.

---

# 13. Deployment Testing Checklist

After both services are deployed, test the following.

### Frontend

* [ ] Homepage loads
* [ ] Navigation works
* [ ] Destination pages load
* [ ] Images load correctly
* [ ] Dark green theme is displayed correctly
* [ ] Responsive design works
* [ ] Chatbot opens correctly
* [ ] Trip Planner works

### Backend

* [ ] `/api/health` works
* [ ] MongoDB connection works
* [ ] Chatbot API works
* [ ] Trip Planner API works
* [ ] Required API routes respond correctly

### Database

* [ ] MongoDB Atlas connection works
* [ ] Required tourism data is available
* [ ] No database credentials are exposed publicly

### Payment

* [ ] Razorpay test checkout opens
* [ ] Success flow works
* [ ] Failure flow works

---

# 14. Common Deployment Problems

## Frontend Cannot Connect to Backend

Check:

```env
NEXT_PUBLIC_API_URL
```

Make sure it contains the correct Railway HTTPS URL.

Then redeploy the frontend.

---

## CORS Error

Check the Railway variable:

```env
FRONTEND_URL
```

It should contain the exact Vercel frontend URL.

After changing it, redeploy the backend.

---

## Chatbot Not Working

Check:

```env
GROQ_API_KEY
```

Also check Railway logs for API or backend errors.

---

## MongoDB Connection Error

Check:

* MongoDB URI
* MongoDB username
* MongoDB password
* Network Access settings
* Database user permissions
* Railway environment variables

Never place the password directly in source code.

---

## Images Not Loading

Check:

* Image paths
* `public` directory
* Next.js image configuration
* Deployment logs
* Browser console errors

---

## Build Failure

Check:

```bash
npm install
npm run build
```

Run the build locally before pushing deployment changes.

Also make sure generated folders such as:

```text
.next/
node_modules/
```

are not committed to GitHub.

---

# 15. GitHub Deployment Workflow

The recommended development workflow is:

```text
Local Development
       ↓
Test Frontend
       ↓
Test Backend
       ↓
Test MongoDB
       ↓
Test AI Chatbot
       ↓
Git Commit
       ↓
Git Push
       ↓
GitHub
       ↓
Vercel + Railway
       ↓
Production Website
```

For future updates:

```bash
git add .
git commit -m "Update Jharkhand Tourism project"
git push ori
```
