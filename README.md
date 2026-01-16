# WhatsApp Clone - Full Stack Application

A full-stack WhatsApp-like messaging application built with React (frontend) and Node.js/Express (backend) with real-time messaging capabilities using Socket.IO.

## Table of Contents
- [Recent Updates](#recent-updates)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)
- [Backend API Endpoints](#backend-api-endpoints)
- [Notes](#notes)

## Recent Updates

### New Features (Latest)
- ✅ **All Contacts View**: Button to view all saved contacts with delete functionality
- ✅ **Search & Message by Email**: Search any registered user by email and message them directly
- ✅ **Smart Contact Detection**: Shows if a user is a saved contact when searching
- ✅ **Direct Messaging**: Message any registered user even if they're not in your contacts
- ✅ **Environment Configuration**: Centralized .env configuration for backend and frontend
- ✅ **Dotenv Support**: Load environment variables from .env files for secure configuration
- ✅ **Socket.IO Real-time**: Real-time messaging with configurable Socket.IO settings

### Frontend Performance Fixes
- ✅ Fixed multiple authentication requests issue
- ✅ Added request deduplication to prevent duplicate API calls
- ✅ Improved API interceptor to prevent redirect loops
- ✅ Added guards to prevent React StrictMode from causing duplicate requests

## Backend Changes Made

The following changes were made to the backend to support the frontend:

### 1. **User Controller (`backend/controller/userController.js`)**
   - ✅ Added missing `Message` import for the `getChatList` function
   - ✅ Enabled `getUserDetails` function (uncommented) to support `/api/v1/user/me` endpoint
   - ✅ Added `getUserDetails` export in routes

### 2. **User Routes (`backend/routes/userRoutes.js`)**
   - ✅ Enabled `/me` endpoint by uncommenting and importing `getUserDetails`
   - ✅ Added `getUserDetails` to imports

### 3. **Contact Controller (`backend/controller/contactController.js`)**
   - ✅ Fixed contact search bug: Changed from overwriting `contact` variable to using `$or` query to search by either `name` or `email`
   - ✅ Updated `getContacts` to return full contacts array with populated `contactUser` data (name, email) instead of just count
   - ✅ Updated `createContact` to return populated contact with user information
   - ✅ Fixed deprecated `.remove()` method to `.deleteOne()` in `deleteContact`

### 4. **Message Controller (`backend/controller/messageController.js`)**
   - ✅ Added `.populate()` for `sender` and `receiver` fields in `getMessages` to include user information
   - ✅ Fixed deprecated `result.nModified` to `result.modifiedCount` in `markMessagesAsRead`

### 5. **User Controller (`backend/controller/userController.js`) - New**
   - ✅ Added `searchUserByEmail` function to search users by email address
   - ✅ Returns user information (id, name, email) for messaging

### 6. **User Routes (`backend/routes/userRoutes.js`) - New**
   - ✅ Added `GET /search` endpoint for searching users by email

## Project Structure

```
WhatsApp/
├── backend/
│   ├── app.js
│   ├── controller/
│   │   ├── contactController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── catchAsyncError.js
│   │   └── error.js
│   ├── models/
│   │   ├── contactSchema.js
│   │   ├── messageSchema.js
│   │   └── userSchema.js
│   ├── routes/
│   │   ├── contactRoutes.js
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   └── utils/
│       └── jwtToken.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatList.jsx
    │   │   ├── ContactModal.jsx
    │   │   ├── MessageArea.jsx
    │   │   └── MessageInput.jsx
    │   ├── pages/
    │   │   ├── Chat.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Backend API Endpoints

### User Routes (`/api/v1/user`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /logout` - Logout user (requires auth)
- `GET /me` - Get current user details (requires auth)
- `GET /chatlist` - Get chat list with last messages (requires auth)
- `GET /search?email=xxx` - Search user by email address (requires auth)

### Contact Routes (`/api/v1/contact`)
- `GET /` - Get all contacts (requires auth)
- `POST /` - Create a new contact (requires auth)
- `GET /:id` - Get a specific contact (requires auth)
- `PUT /:id` - Update contact display name (requires auth)
- `DELETE /:id` - Delete a contact (requires auth)

### Message Routes (`/api/v1/massage`)
- `GET /:id?page=1` - Get messages with a user (requires auth, paginated)
- `POST /:id` - Send a message to a user (requires auth)
- `PUT /:id` - Update a message (requires auth, 5-minute limit)
- `DELETE /:id` - Delete a message (requires auth, 5-minute limit)
- `PATCH /:id/read` - Mark messages as read (requires auth)

## Frontend Features

- ✅ User authentication (Login/Register)
- ✅ Chat list with last messages
- ✅ Real-time messaging interface
- ✅ Message editing (within 5 minutes)
- ✅ Message deletion (within 5 minutes)
- ✅ Read receipts (single/double checkmarks)
- ✅ Contact management (add, update, delete)
- ✅ **View all saved contacts** with delete functionality
- ✅ **Search & message by email** - Find and message any registered user
- ✅ **Smart contact detection** - Shows saved contacts in search results
- ✅ Pagination for message history
- ✅ Beautiful WhatsApp-like UI
- ✅ Responsive design
- ✅ Environment-based configuration

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the required environment variables:
```bash
cp .env .env.backup  # Create a backup
# Edit .env file with your configuration
```

4. Make sure MongoDB is running on `localhost:27017`

5. Start the backend server:
```bash
node app.js
```

The backend will run on `http://localhost:3000` (or the port specified in .env)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the frontend directory with the required environment variables:
```bash
cp .env.local .env.local.backup  # Create a backup
# Edit .env.local file with your configuration
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Environment Configuration

### Backend Environment Variables (`.env`)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/

# JWT
JWT_SECRET=takeYour$1$Time
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Socket.IO
SOCKET_CORS_ORIGIN=http://localhost:5173,http://localhost:3000
SOCKET_TRANSPORTS=websocket,polling
```

**Variable Descriptions:**
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRE`: JWT token expiration time
- `FRONTEND_URL`: Frontend URL for CORS
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `SOCKET_CORS_ORIGIN`: Comma-separated list of allowed Socket.IO origins
- `SOCKET_TRANSPORTS`: Comma-separated list of Socket.IO transports (websocket, polling)

### Frontend Environment Variables (`.env.local`)

```env
# API
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Socket.IO
VITE_SOCKET_URL=http://localhost:3000
```

**Variable Descriptions:**
- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_SOCKET_URL`: Socket.IO server URL

### Important Notes on Environment Variables

1. **Backend**: The `.env` file is loaded using `dotenv` package. Make sure `dotenv` is installed:
   ```bash
   npm install dotenv
   ```

2. **Frontend**: Vite automatically loads `.env.local` variables prefixed with `VITE_`. Access them in code:
   ```javascript
   import.meta.env.VITE_API_BASE_URL
   ```

3. **Security**: Never commit `.env` or `.env.local` files to version control. They are already listed in `.gitignore`.

4. **Production Deployment**: Update environment variables appropriately for production environments.

## Deployment

### Render Deployment

This application is ready for deployment on [Render](https://render.com). For detailed deployment instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md).

**Quick Start:**

1. Push your code to GitHub
2. Connect your repository to Render
3. Set environment variables in Render dashboard:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Strong secret key for JWT
   - `ALLOWED_ORIGINS` - Your Render URL
   - `SOCKET_CORS_ORIGIN` - Your Render URL

4. Deploy! Render will:
   - Install dependencies for backend and frontend
   - Build the frontend with Vite
   - Serve the frontend static files from the backend
   - Start the Node.js server

**Important**: Before deployment, ensure:
- MongoDB Atlas cluster is created with proper network access
- All sensitive variables are configured in Render (not in code)
- Git repository is public or properly configured
- Frontend build command completes successfully locally

For full deployment guide including troubleshooting, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md).

## Setup Instructions (Original)

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- Vite for build tooling
- CSS3 for styling

## Notes

- The backend uses cookie-based authentication with httpOnly cookies
- Messages can only be edited/deleted within 5 minutes of sending
- The frontend automatically marks messages as read when a chat is opened
- Chat list shows the last message and timestamp for each conversation
- Contacts can have custom display names different from their actual user names
- Environment variables are loaded from `.env` (backend) and `.env.local` (frontend)
- Ensure `.env` and `.env.local` files are added to `.gitignore` for security
