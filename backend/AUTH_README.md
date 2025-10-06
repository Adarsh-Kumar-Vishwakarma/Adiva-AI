# Authentication System Documentation

## Overview
This project now includes a comprehensive authentication system with MongoDB integration, JWT tokens, and secure user management.

## Features
- ✅ User registration and login
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Account lockout after failed attempts
- ✅ Profile management
- ✅ Password change functionality
- ✅ Secure cookie handling
- ✅ Input validation
- ✅ MongoDB integration

## API Endpoints

### Authentication Routes

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get User Profile
```
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### Change Password
```
PUT /api/auth/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

## Environment Variables

Add these to your `.env` file:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/projectAI

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_EXPIRE=7d
```

## Security Features

### Password Requirements
- Minimum 6 characters
- Must contain at least one lowercase letter
- Must contain at least one uppercase letter
- Must contain at least one number

### Account Security
- Passwords are hashed with bcrypt (salt rounds: 12)
- Account lockout after 5 failed login attempts
- Lockout duration: 2 hours
- JWT tokens expire after 7 days (configurable)
- Secure HTTP-only cookies

### Input Validation
- Email format validation
- Name length validation (2-50 characters)
- Password strength validation
- SQL injection protection via Mongoose

## Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Examples

### Frontend Integration

#### Register a new user
```javascript
const registerUser = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  
  const data = await response.json();
  return data;
};
```

#### Login user
```javascript
const loginUser = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token for future requests
    localStorage.setItem('token', data.data.token);
  }
  
  return data;
};
```

#### Make authenticated requests
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};
```

## Testing

Run the authentication test:
```bash
node test-auth.js
```

This will test:
- User registration
- User login
- Profile fetching
- User logout
- Invalid login handling

## Error Handling

The API returns consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (if any)
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `423` - Locked (account locked)
- `500` - Internal Server Error

## Middleware

### Authentication Middleware
- `verifyToken` - Required for protected routes
- `optionalAuth` - Optional authentication for public routes
- `requireAdmin` - Admin-only routes

### Usage in Routes
```javascript
import { verifyToken, requireAdmin } from '../middleware/auth.js';

// Protected route
router.get('/protected', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Admin only route
router.get('/admin', verifyToken, requireAdmin, (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```

## Production Considerations

1. **Environment Variables**: Use strong, unique JWT secrets
2. **HTTPS**: Always use HTTPS in production
3. **Database**: Use MongoDB Atlas or secure MongoDB instance
4. **Rate Limiting**: Already implemented in the main server
5. **CORS**: Configure CORS properly for your frontend domain
6. **Monitoring**: Add logging and monitoring for security events

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify MONGODB_URI in .env file

2. **JWT Token Errors**
   - Check JWT_SECRET is set
   - Verify token format in Authorization header

3. **Password Validation Errors**
   - Ensure password meets requirements
   - Check for special characters

4. **Account Locked**
   - Wait for lockout period to expire
   - Reset login attempts in database

### Database Queries

```javascript
// Reset user login attempts
await User.findByIdAndUpdate(userId, {
  $unset: { loginAttempts: 1, lockUntil: 1 }
});

// Deactivate user account
await User.findByIdAndUpdate(userId, { isActive: false });

// Get all users (admin only)
await User.find({}).select('-password');
```
