import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import {errorMiddleware} from './middleware/error.js';
import massageRoutes from './routes/messageRoutes.js';
import contactroutes from './routes/contactRoutes.js';
import { initSocket } from './utils/socket.js';

// Load environment variables
dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle uncaught exceptions synchronously
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
});

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse CORS origins from environment variable
const corsOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['https://whatsappclone-fqbr.onrender.com/','http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
    origin: corsOrigins,
    // Include PATCH and OPTIONS for preflight requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
}));
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/massage', massageRoutes);
app.use('/api/v1/contact', contactroutes);

// Serve static files from frontend build
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Handle all other routes by serving index.html (for React Router)
app.get(/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/dist/index.html")
  );
});


app.use(errorMiddleware);

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
mongoose.connect(mongoUri).then(()=>{
       console.log("MongoDB Connected Successfully!")
    }).catch((error)=>{
        console.error('MongoDB connection error:', error && error.stack ? error.stack : error);
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Initialize Socket.IO
const io = initSocket(server);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err && err.stack ? err.stack : err);
    server.close(() => {
        process.exit(1);
    });
});
