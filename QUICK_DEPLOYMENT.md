# Jharkhand Tourism – Hackathon Deployment Checklist

## Deployment Goal

The application will be deployed using:

* **GitHub** – Source code
* **Railway** – Backend API
* **Vercel** – Next.js frontend
* **MongoDB Atlas** – Database
* **Groq API** – AI chatbot
* **Razorpay** – Payment service, if enabled

---

# Step 1: Prepare the Project

Before starting deployment, verify that the latest project changes are pushed to GitHub.

### Check the repository

```text
Maniharika4508/Tourism-Jharkhand
```

### Local verification

Run the frontend:

```bash
npm install
npm run dev
```

Run the backend separately:

```bash
cd backend
npm install
npm run dev
```

Verify that the frontend and backend work correctly before deploying.

### Pre-deployment checklist

* [ ] Frontend opens correctly
* [ ] Backend starts without errors
* [ ] MongoDB connection works
* [ ] Chatbot responds
* [ ] Trip Planner works
* [ ] Images load correctly
* [ ] `.env` files are excluded from Git
* [ ] Latest code is pushed to GitHub

---

# Step 2: Publish the Backend

The Express.js backend will run on Railway.

### Railway Setup

1. Open Railway.
2. Sign in using GitHub.
3. Create a new project.
4. Choose the GitHub repository.
5. Select the `Tourism-Jharkhand` repository.
6. Configure the backend service to use:

```text
backend/
```

Railway will then build the Node.js backend.

---

## Backend Configuration

Add the required environment variables from the Railway dashboard.

Use placeholders for private values:

```env
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
PORT=5000
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=your_vercel_frontend_url
```

If Razorpay is configured:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Security Rule

Do **not** paste actual passwords, API keys, or secret keys into documentation.

---

## Start Command

The backend should use:

```bash
node server.js
```

After deployment, wait until Railway reports that the service is running.

Copy the generated Railway HTTPS URL.

Example:

```text
https://your-project.up.railway.app
```

---

# Step 3: Verify the Backend

Open the following URL in a browser:

```text
https://your-project.up.railway.app/api/health
```

A successful response confirms that the backend is reachable.

Also verify the project-specific services:

```text
/api/chatbot/health
/api/travel-planner/health
```

If an endpoint is not implemented in the deployed version, use only the routes available in the current project.

### Backend checklist

* [ ] Railway deployment completed
* [ ] Backend URL generated
* [ ] `/api/health` responds
* [ ] MongoDB connection successful
* [ ] Groq API configured
* [ ] Required environment variables added
* [ ] No secret is exposed in logs or source code

---

# Step 4: Publish the Frontend

The Next.js frontend will be deployed through Vercel.

### Vercel Setup

1. Open Vercel.
2. Sign in with GitHub.
3. Select **Add New Project**.
4. Import:

```text
Maniharika4508/Tourism-Jharkhand
```

5. Select **Next.js** if it is not automatically detected.
6. Keep the repository root as the project root.
7. Confirm the build configuration.
8. Start the deployment.

---

# Step 5: Connect Frontend with Railway

After getting the Railway backend URL, configure the Vercel environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-project.up.railway.app
```

If the application uses the frontend URL variable, configure:

```env
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

Replace the example values with the actual deployed URLs.

After saving environment variables, redeploy the Vercel project so the new configuration is applied.

---

# Step 6: Configure Production CORS

The frontend and backend are hosted on different platforms.

Therefore, the backend must allow requests from the deployed frontend.

In Railway, configure:

```env
FRONTEND_URL=https://your-project.vercel.app
```

Then redeploy the backend.

### Verify

Open the Vercel website and test:

* Destination data
* Chatbot
* Trip Planner
* API-based features

There should be no browser CORS errors.

---

# Step 7: Test the AI Chatbot

The tourism chatbot uses Groq AI.

### Environment Variable

```env
GROQ_API_KEY=your_groq_api_key
```

Test with questions such as:

```text
Tell me about Dassam Falls.
```

```text
Tell me about Hundru Falls.
```

```text
What are the famous places to visit in Jharkhand?
```

```text
Plan a 3-day trip to Jharkhand.
```

Also test multilingual input:

```text
దస్సం జలపాతం గురించి చెప్పు.
```

```text
झारखंड की जनजातीय संस्कृति के बारे में बताओ।
```

### Chatbot verification

* [ ] Chatbot button appears
* [ ] Message can be submitted
* [ ] Backend receives the request
* [ ] AI response is displayed
* [ ] Follow-up questions work
* [ ] Multilingual responses work
* [ ] Unsupported information is not randomly invented

---

# Step 8: Test the Tourism Website

Open the Vercel production URL and verify the main sections.

### Website

* [ ] Homepage
* [ ] Navigation
* [ ] Destination explorer
* [ ] Waterfalls
* [ ] Eco-tourism information
* [ ] Cultural tourism
* [ ] Local food
* [ ] Handicrafts
* [ ] Festivals
* [ ] Images
* [ ] Maps/location features
* [ ] Responsive layout

---

# S
