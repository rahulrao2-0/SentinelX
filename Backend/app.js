import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './src/config/db.js';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './src/routes/auth.js';
import logsRoutes from './src/routes/logs.js';
import { connectProducer } from './src/kafka/producer.js';
import { startConsumer } from './src/kafka/consumer.js';


const app = express();
const PORT = 3000;

// Create HTTP server to attach Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // For testing purposes
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit to handle massive log batches

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/logs', logsRoutes);


// Socket.io Setup
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Automatically join the single test room for testing
  socket.join('test-room');
  console.log(`[Socket.io] Client ${socket.id} joined 'test-room'`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start HTTP server immediately
httpServer.listen(PORT, () => {
  console.log(`🚀 SentinelX API Server is running on http://localhost:${PORT}`);
});

// Initialize database and Kafka services concurrently in the background
const initServices = async () => {
  try {
    await connectDB();

    // Connect Kafka Producer and Consumer concurrently without blocking server startup
    await Promise.all([
      connectProducer(),
      startConsumer(io)
    ]);
    console.log('✅ Kafka services initialized');
  } catch (err) {
    console.error('❌ Failed to initialize background services:', err);
  }
};

initServices(); 