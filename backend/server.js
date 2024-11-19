import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import http from 'http';
import { Server } from 'socket.io';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import chatRoutes from './routes/chat.routes.js';

import connectMongoDB from './db/connectMongoDB.js';

const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret', // Use a strong secret
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set to true if using https
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chats', chatRoutes);



// Inside the production check
if (process.env.NODE_ENV === 'production') {
    console.log('NODE_ENV is production');
    console.log('Serving static files from frontend/dist');
    const indexPath = path.resolve(__dirname, 'frontend', 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('index.html found');
    } else {
      console.log('index.html not found');
    }
    app.use(express.static(path.join(__dirname, 'frontend', 'dist')));
  
    app.get('*', (req, res) => {
      res.sendFile(indexPath);
    });
  } else {
    console.log('NODE_ENV is not production, current value:', process.env.NODE_ENV);
  }
  

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.roomId).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  connectMongoDB();
});

export default io;
