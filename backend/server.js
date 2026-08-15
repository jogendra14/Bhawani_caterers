// server.js
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import express from 'express';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://10.75.232.49:5173',
  'https://bhawani-caterers.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(new Error('CORS not allowed'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
await connectDB();

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Catering API is running',
    version: '1.0.0'
  });
});

import orderRoutes from './routes/orderRoutes.js'
import materialRoutes from './routes/materialRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import userRoutes from './routes/userRoutes.js';

app.use('/api/orders', orderRoutes);
app.use('/api/raw-materials', materialRoutes);
app.use('/api/Items', itemRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔══════════════════════════════════════════════╗
║  🚀 SERVER STARTED SUCCESSFULLY              ║
╠══════════════════════════════════════════════╣
║  📍 Port: ${PORT}                              ║
║  🌍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(26)} ║
║  🛣️  API Base: http://localhost:${PORT}/api      ║
║  ❤️  Health: http://localhost:${PORT}/api/health ║
╚══════════════════════════════════════════════╝
      `);
});

export default app;