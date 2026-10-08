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

// Initialize Kafka and start server
const startServer = async () => {
  try {
    // Connect Kafka Producer
    await connectProducer();
    
    // Start Kafka Consumer and pass the socket.io instance
    // Note: If Kafka isn't running locally, this might throw an error and crash.
    // Ensure Zookeeper and Kafka are running on localhost:9092
    await startConsumer(io);

    // Start the server
    httpServer.listen(PORT, () => {
      console.log(`🚀 SentinelX API Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();