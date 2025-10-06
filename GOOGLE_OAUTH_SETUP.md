# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your AI chat application.

## 🔧 Backend Setup

### 1. Install Required Packages
```bash
cd backend
npm install passport passport-google-oauth20 express-session
```

### 2. Environment Variables
Add these variables to your `.env` file in the backend directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Session Configuration
SESSION_SECRET=your_session_secret_key_here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Google Cloud Console Setup - Detailed Step-by-Step Guide

#### **Step 1: Go to Google Cloud Console**
1. Open your browser and go to: **https://console.cloud.google.com/**
2. Sign in with your Google account

#### **Step 2: Create or Select a Project**
1. If you don't have a project, click **"Select a project"** at the top
2. Click **"New Project"**
3. Enter a project name (e.g., "AI Chat App")
4. Click **"Create"**
5. Wait for the project to be created and select it

#### **Step 3: Enable Google+ API**
1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** in the search bar
3. Click on **"Google+ API"** from the results
4. Click **"Enable"** button

#### **Step 4: Create OAuth 2.0 Credentials**
1. Go to **"APIs & Services"** → **"Credentials"** in the left sidebar
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth 2.0 Client IDs"**

#### **Step 5: Configure OAuth Consent Screen**
If this is your first time, you'll need to configure the consent screen:
1. Click **"CONFIGURE CONSENT SCREEN"**
2. Choose **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: "AI Chat App" (or your preferred name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"** through all the steps
6. Click **"Back to Dashboard"**

#### **Step 6: Create OAuth 2.0 Client ID**
1. Go back to **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client IDs"**
3. Choose **"Web application"** as the application type
4. Give it a name: "AI Chat App OAuth"
5. **Add Authorized redirect URIs**:
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:3001/api/auth/google/callback`
   - Click **"Create"**

#### **Step 7: Copy Your Credentials**
After creating, you'll see a popup with your credentials:
1. **Copy the Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
2. **Copy the Client Secret** (looks like: `GOCSPX-abcdefghijklmnop`)
3. **Keep this window open** - you'll need these values

#### **Step 8: Update Your Environment Variables**
1. Go to your backend folder: `m:\New folder\projectAI\backend`
2. Create a `.env` file (if it doesn't exist) or open the existing one
3. Add these lines with your actual credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Session Configuration
SESSION_SECRET=your_secure_session_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### **Step 9: Test Your Setup**
1. **Start your backend server:**
   ```bash
   cd "m:\New folder\projectAI\backend"
   npm start
   ```

2. **Start your frontend server:**
   ```bash
   cd "m:\New folder\projectAI\frontend"
   npm run dev
   ```

3. **Test Google OAuth:**
   - Go to `http://localhost:5173`
   - Click the **"Continue with Google"** button
   - You should be redirected to Google for authentication
   - After authentication, you'll be redirected back and logged in!

## 🎨 Frontend Setup

The frontend components are already set up with:
- Google Sign-In buttons in LoginForm and RegisterForm
- OAuth callback handler
- Integration with AuthContext

## 🚀 How It Works

### Authentication Flow:
1. **User clicks "Continue with Google"** button
2. **Redirects to Google** for authentication**
2. **Google redirects back** to `/api/auth/google/callback` with user data
3. **Backend creates/updates user** in database
4. **JWT token generated** and sent to frontend
5. **Frontend receives token** and logs user in automatically

### User Account Linking:
- If user exists with same email → Links Google account to existing account
- If user doesn't exist → Creates new account with Google data
- Google users get `isGoogleUser: true` and `isVerified: true`

## 🔒 Security Features

- **JWT Token Authentication**: Secure token-based authentication
- **Account Linking**: Links Google accounts to existing email accounts
- **Email Verification**: Google accounts are automatically verified
- **Session Management**: Secure session handling with express-session

## 📱 User Experience

### Login Form:
- Traditional email/password login
- "Continue with Google" button with divider
- Seamless switching between methods

### Register Form:
- Traditional registration form
- "Continue with Google" button for quick signup
- Automatic account creation with Google data

### Profile Management:
- Google users can update their profile
- Password change only available for non-Google users
- Avatar support from Google profile pictures

## 🔍 Troubleshooting

### Common Issues and Solutions:

#### **"Invalid redirect URI" Error:**
- **Problem**: Google OAuth redirect URI doesn't match
- **Solution**: 
  - Double-check the redirect URI in Google Cloud Console
  - Make sure it's exactly: `http://localhost:3001/api/auth/google/callback`
  - No trailing slashes or extra characters

#### **"Client ID not found" Error:**
- **Problem**: Google Client ID is incorrect or missing
- **Solution**:
  - Verify you copied the Client ID correctly from Google Cloud Console
  - Check for extra spaces in your `.env` file
  - Make sure the `.env` file is in the backend directory

#### **"Session error" or "Passport error":**
- **Problem**: Session configuration issues
- **Solution**:
  - Ensure `SESSION_SECRET` is set in your `.env` file
  - Make sure express-session is properly configured
  - Check that passport middleware is initialized

#### **Frontend not receiving token:**
- **Problem**: OAuth callback not reaching frontend
- **Solution**:
  - Verify `FRONTEND_URL=http://localhost:5173` in backend `.env`
  - Check that both servers are running
  - Ensure CORS is properly configured

#### **"Google+ API not enabled" Error:**
- **Problem**: Google+ API is not enabled in Google Cloud Console
- **Solution**:
  - Go to Google Cloud Console → APIs & Services → Library
  - Search for "Google+ API" and enable it
  - Wait a few minutes for the API to be activated

### Debug Steps:
1. **Check browser console** for JavaScript errors
2. **Check backend logs** for OAuth errors
3. **Verify all environment variables** are set correctly
4. **Test Google OAuth URLs manually**:
   - Try visiting: `http://localhost:3001/api/auth/google`
   - Should redirect to Google authentication

### Environment Variables Checklist:
```env
# Required for Google OAuth
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Required for sessions
SESSION_SECRET=your_secure_session_secret_here

# Required for frontend redirect
FRONTEND_URL=http://localhost:5173

# Required for JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Required for database
MONGODB_URI=mongodb://localhost:27017/projectAI
```

## 🧪 Testing

### 1. Start the Backend:
```bash
cd backend
npm start
```

### 2. Start the Frontend:
```bash
cd frontend
npm run dev
```

### 3. Test Google OAuth:
1. Go to `http://localhost:5173`
2. Click "Continue with Google" button
3. Complete Google authentication
4. Should redirect back and log you in automatically

### 4. Test Different Scenarios:
- **New user with Google**: Should create new account automatically
- **Existing user with Google**: Should link Google account to existing account
- **Existing user without Google**: Should work with traditional login
- **Profile management**: Google users should be able to update their profiles


## 🔄 Production Deployment

### Environment Variables for Production:
```env
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
SESSION_SECRET=your_secure_session_secret
```

### Google Cloud Console Production Setup:
1. Add production redirect URI
2. Update authorized domains
3. Configure OAuth consent screen for production

## 📚 API Endpoints

### Google OAuth Routes:
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/google/check` - Check if user has Google account

### User Model Updates:
- `googleId`: Google user ID
- `isGoogleUser`: Boolean flag for Google users
- `avatar`: Google profile picture URL
- `isVerified`: Auto-verified for Google users

## 🎯 Features Implemented

✅ **Backend OAuth Setup**
✅ **Frontend Google Sign-In Buttons**
✅ **OAuth Callback Handling**
✅ **User Account Linking**
✅ **JWT Token Integration**
✅ **Profile Management for Google Users**
✅ **Session Management**
✅ **Error Handling**

Your Google OAuth integration is now ready! Users can sign in with their Google accounts seamlessly. 🚀
