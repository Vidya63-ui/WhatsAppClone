import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

let io;

export const initSocket = (server) => {
  // Parse CORS origins from environment variable
  const corsOrigins = process.env.SOCKET_CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];
  const transports = process.env.SOCKET_TRANSPORTS?.split(',') || ['websocket', 'polling'];
  const jwtSecret = process.env.JWT_SECRET;

  io = new Server(server, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: transports,
    // pingInterval/pingTimeout can be adjusted as needed
  });

  io.on('connection', (socket) => {
    // Attempt to read token from cookies (httpOnly cookie named 'token')
    const cookie = socket.handshake.headers?.cookie || '';
    const tokenCookie = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (!token) {
      // no token - disconnect
      socket.emit('unauthorized');
      socket.disconnect(true);
      return;
    }

    try {
      const payload = jwt.verify(token, jwtSecret);
      const userId = payload.id;
      socket.userId = userId;
      socket.join(userId);
      socket.emit('connected', { userId });
    } catch (err) {
      socket.emit('unauthorized');
      socket.disconnect(true);
      return;
    }

    socket.on('join', (room) => {
      if (room) socket.join(room);
    });

    socket.on('disconnect', (reason) => {
      // handle presence cleanup if needed
    });
  });

  return io;
};

export const getIO = () => io;
