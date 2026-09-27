# Jharkhand Tourism – User Authentication System

## 1. Introduction

The Jharkhand Tourism application includes a user authentication module that allows users to create accounts, securely log in, manage their profiles, and log out of the application.

The system uses frontend authentication components together with backend APIs and database storage to manage registered users.

---

# 2. Authentication Capabilities

The authentication module provides the following functionality:

* New user account creation
* Existing user login
* User logout
* Profile viewing
* Profile information editing
* Password management
* Authentication state handling
* Protected application routes
* Backend request authentication
* Input validation and error handling

---

# 3. User Registration

New users can create an account by providing the required information.

### Registration Details

* Name
* Email address
* Phone number
* Password

The registration form validates the entered information before sending the request to the backend.

The backend checks whether the email is already registered and securely stores the user's password after hashing.

---

# 4. User Login

Registered users can access their account through the login page.

### Login Process

```text
User enters credentials
        ↓
Frontend validates input
        ↓
Request sent to backend
        ↓
Backend verifies account
        ↓
Password verification
        ↓
JWT token generated
        ↓
User session established
        ↓
Authenticated interface displayed
```

A valid authentication token allows the user to access protected resources.

---

# 5. Logout

Users can securely sign out from the navigation menu.

During logout:

1. The current authentication data is cleared.
2. Stored session information is removed.
3. The application returns to the unauthenticated state.
4. Protected pages can no longer be accessed using the previous session.

---

# 6. Profile Management

Authenticated users can access their profile page.

The profile section provides options to:

* View account information
* Update name
* Update phone number
* View account status
* View membership information
* Manage account-related information

Profile operations are available only to authenticated users.

---

# 7. Frontend Authentication Module

## Authentication Page

**Location:**

```text
/app/auth/page.tsx
```

The authentication page provides both login and registration functionality.

Main features include:

* Login/signup switching
* Form validation
* Error messages
* Loading indicators
* Backend API integration
* Responsive interface

---

## Authentication State Hook

**Location:**

```text
/hooks/use-auth.ts
```

This hook manages authentication-related state throughout the frontend.

Responsibilities include:

* Maintaining current user information
* Tracking login status
* Performing login requests
* Performing logout operations
* Maintaining authentication state after page reload
* Updating profile information

---

## Navigation Integration

**Location:**

```text
/components/navigation.tsx
```

The navigation component changes according to the user's authentication state.

### Logged-out state

Users can access the authentication interface.

### Logged-in state

Users can see:

* User information
* Profile option
* Logout option

The navigation is also designed to work on smaller screens.

---

## Profile Interface

**Location:**

```text
/app/profile/page.tsx
```

The profile page displays information belonging to the authenticated user.

Users can edit permitted profile fields through the interface.

---

# 8. Backend Authentication

The backend handles authentication requests and user account operations.

## Authentication Controller

**Location:**

```text
/backend/controllers/authController.js
```

The controller m
