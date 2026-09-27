# AI Travel Planner – Implementation & Setup Guide

## 1. Introduction

The AI Travel Planner is an integrated feature of the Jharkhand Tourism platform that generates personalized travel plans based on the user's preferences.

The planner is connected directly with the existing Node.js and Express.js backend and uses the Groq AI service for itinerary generation.

The feature is designed specifically around Jharkhand tourism destinations and travel interests.

---

# 2. System Architecture

The travel planner follows this flow:

```text id="v3h8nd"
User
  │
  ▼
Travel Planner Form
  │
  ▼
Next.js Frontend
  │
  ▼
Express.js API
  │
  ├───────────────► Destination Data
  │
  ▼
Groq AI Service
  │
  ▼
Generated Itinerary
  │
  ▼
Frontend Result Page
```

---

# 3. Main Capabilities

The planner accepts travel preferences and creates a customized itinerary.

Users can specify:

* Destination
* Number of days
* Travel interests
* Budget range
* Group size
* Accommodation preference

The generated plan can contain suitable destinations and activities based on the submitted preferences.

---

# 4. Groq API Configuration

The AI functionality requires a Groq API key.

### Step 1 – Create API Key

1. Open the Groq developer console.
2. Sign in or create an account.
3. Open the API key section.
4. Generate a new key.
5. Copy the generated credential.

The key should be treated as a private secret.

---

# 5. Environment Configuration

Open the backend project:

```bash id="yqk6ta"
cd backend
```

Create or update the local environment configuration:

```env id="4kcbx9"
GROQ_API_KEY=your_groq_api_key
```

Do not commit the actual API key to GitHub.

For production deployment, configure the same variable through the Railway environment settings.

---

# 6. Install Backend Dependencies

If dependencies have not already been installed:

```bash id="v4f6e1"
cd backend
npm install
```

This installs the packages required by the Express server and travel planner service.

---

# 7. Running the Application Locally

## Start Backend

```bash id="8bqjca"
cd backend
npm start
```

The backend should be available on:

```text id="m9g4pk"
http://localhost:5000
```

## Start Frontend

Open another terminal:

```bash id="x1u5t7"
npm run dev
```

The Next.js application can then be opened in the browser.

If port 3000 is already occupied, Next.js may use another available port.

---

# 8. Travel Planner API

The travel planner exposes dedicated backend routes.

### Generate Itinerary

```text id="6v9jqs"
POST /api/travel-planner/generate
```

Used to create an AI-generated travel plan.

### Destination List

```text id="8zv8s1"
GET /api/travel-planner/destinations
```

Returns destination information available to the planner.

### Service Status

```text id="4g5e4k"
GET /api/travel-planner/health
```

Used to verify whether the travel planner service is running.

---

# 9. Travel Planner User Flow

The user experience follows this process:

```text id="0j7i5e"
AI Features
     ↓
AI Travel Planner
     ↓
Travel Preferences
     ↓
Generate Itinerary
     ↓
Backend Processing
     ↓
AI Response
     ↓
Personalized Travel Plan
```

---

# 10. Travel Preference Form

The planner can collect the following information.

### Destination

Examples:

* Ranchi
* Netarhat
* Betla
* Other supported Jharkhand destinations

### Duration

The user can specify the required trip duration.

### Interests

Possible interests include:

* Nature
* Culture
* Waterfalls
* Wildlife
* Adventure
* Local experiences

### Budget

Users can select a suitable budget category such as:

* Budget
* Medium
* Luxury

### Group Size

The planner can consider different travel group sizes.

### Accommodation

Users can specify their preferred accommodation type.

---

# 11. Example Request

A sample travel request can be represented as:

```json id="6d4y1r"
{
  "destination": "Ranchi",
  "duration": "3 days",
  "interests": [
    "Culture",
    "Nature",
    "Waterfalls"
  ],
  "budget": "Medium",
  "groupSize": "2-4 people",
  "accommodation": "Hotels"
}
```

The backend processes these preferences and sends the relevant information to the AI service.

---

# 12. AI Itinerary Generation

The backend prepares a tourism-focused prompt using the user's preferences.

The AI service then generates an itinerary according to the requested:

* Destination
* Duration
* Interests
* Budget
* Group size
* Accommodation preference

The resulting itinerary is returned to the frontend and displayed to the user.

---

# 13. Fallback Handling

The travel planner includes error-handling mechanisms for situations where the AI service cannot provide a response.

Possible causes include:

* Missing API key
* Invalid API credentials
* Temporary AI service failure
* Request timeout
* Invalid user input
* Backend connectivity problems

The application can handle these situations without completely breaking the travel planner interface.

---

# 14. Request Protection

The travel planner API can use rate limiting to prevent excessive requests.

For example:

```javascript id="a1y8cw"
windowMs: 15 * 60 * 1000
max: 10
```

This configuration represents a limited number of requests within a 15-minute window.

The exact limit can be adjusted according to the deployment requirements.

---

# 15. Frontend Integration

The travel planner is available through the application's AI-related features.

Users can:

1. Open the AI Features section.
2. Select the AI Travel Planner.
3. Enter their travel preferences.
4. Submit the form.
5. Wait for AI processing.
6. View the generated itinerary.

The interface also provides loading and error states to improve the user experience.

---

# 16. Testing the Backend

A dedicated test script can be used if it exists in the current project:

```bash id="4v7e2c"
cd backend
node test-travel-planner.js
```

The test process can verify:

* Health endpoint
* Destination endpoint
* Itinerary generation
* Error/fallback handling
* Request limiting

---

# 17. Manual API Verification

Check whether the backend is running:

```bash id="q8e0g7"
curl http://localhost:5000/api/health
```

Check the travel planner service:

```bash id="t6p0k3"
curl http://localhost:5000/api/travel-planner/health
```

A successful response confirms that the corresponding backend service is reachable.

---

# 18. Common Problems

## Backend Connection Error

**Problem:** Frontend shows a network error.

**Check:**

* Backend server is running.
* Correct backend URL is configured.
* API route exists.
* No CORS error is present.

---

## AI Service Error

**Problem:** The planner cannot generate an itinerary.

**Check:**

```env id="l0o6pc"
GROQ_API_KEY=your_groq_api_key
```

Verify that the key is valid and available to the backend.

---

## Too Many Requests

**Problem:** The server reports a rate-limit error.

**Reason:** The configured request limit has been reached.

**Action:** Wait for the rate-limit window to reset before testing again.

---

## Empty or Invalid Result

Check:

* User input values
* Backend logs
* Groq API response
* Network connection
* Request payload

---

# 19. Customization

The travel planner can be modified as the tourism platform grows.

### AI Prompt

The AI prompt can be customized in the travel planner controller to change the style and structure of generated itineraries.

### Destination Data

Additional Jharkhand destinations can be added to the planner's destination data.

### Request Limits

The rate-limit configuration can be changed according to application requirements.

---

# 20. Production Configuration

For deployment, the AI key should be stored in the backend hosting environment.

Example Railway variable:

```env id="1e8a5z"
GROQ_API_KEY=your_production_groq_key
```

The frontend should communicate with the deployed Railway backend using:

```env id="g8j1pd"
NEXT_PUBLIC_API_URL=https://your-backend-url
```

Never expose the Groq secret through frontend environment variables.

---

# 21. Feature Verification Checklist

### Backend

* [ ] Travel planner routes available
* [ ] Health endpoint working
* [ ] Destination endpoint working
* [ ] Groq API configured
* [ ] Error handling verified
* [ ] Rate limiting verified

### Frontend

* [ ] AI Features section opens
* [ ] Travel Planner page loads
* [ ] Form accepts user preferences
* [ ] Generate button works
* [ ] Loading state appears
* [ ] Generated itinerary is displayed
* [ ] Error messages are handled

### Deployment

* [ ] Railway backend deployed
* [ ] Vercel frontend deployed
* [ ] `NEXT_PUBLIC_API_URL` configured
* [ ] Groq key configured in Railway
* [ ] CORS configured
* [ ] Public website tested

---

# 22. Expected Working Flow

When the implementation is configured correctly:

```text id="h7w1mz"
User opens website
        ↓
AI Features
        ↓
Travel Planner
        ↓
Select destination
        ↓
Enter duration & interests
        ↓
Select budget & group size
        ↓
Generate Itinerary
        ↓
Backend receives request
        ↓
Groq processes tourism request
        ↓
AI itinerary returned
        ↓
Personalized trip displayed
```

---

# 23. Implementation Summary

The AI Travel Planner extends the Jharkhand Tourism platform with personalized itinerary generation.

It combines:

```text id="3d8z4j"
Next.js
   +
Express.js
   +
Jharkhand Tourism Data
   +
Groq AI
   +
MongoDB
```

The feature provides users with an interactive way to plan Jharkhand trips according to their individual travel preferences.
