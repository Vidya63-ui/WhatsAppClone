import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  // Prevent SSR issues (Vite / Next / Remix safety)
  if (typeof window === 'undefined') return null;

  // Prevent multiple socket connections
  if (socket) return socket;

  const socketUrl =
    import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

  // Initialize socket connection
  socket = io(socketUrl, {
    withCredentials: true, // send httpOnly cookies (JWT)
    transports: ['websocket'], // optional but recommended
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('unauthorized', () => {
    console.warn('Socket unauthorized - token missing or invalid');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const getSocket = () => socket;

