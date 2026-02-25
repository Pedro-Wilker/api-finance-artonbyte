import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';

export let io: Server;

export const setupWebSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_dev_key') as any;
      socket.data.userId = decoded.sub; 
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  const marketNamespace = io.of('/market');
  const userNamespace = io.of('/user');

  marketNamespace.on('connection', (socket) => {
    console.log(`📈 Client connected to /market: ${socket.id}`);
  });

  userNamespace.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`); 
    console.log(`👤 User connected to /user: ${userId}`);
  });

  return io;
};