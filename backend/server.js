// server.js
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import express from 'express';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  origin: 'https://bhawani-caterers.vercel.app/',
  credentials: true, // important for cookies/auth
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

export default app;