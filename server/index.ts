import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createRouter } from './routes';
import { FirestoreStorage } from './storage';
import { initializeFirestore } from './firebase';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firestore
initializeFirestore();

// Initialize storage with Firestore
const storage = new FirestoreStorage();

// Serve static files from client/dist first
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes
app.use('/api', createRouter(storage));

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend for all other routes (must be last)
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🔥 Server running on port ${port} with Firebase Firestore`);
  console.log(`📡 API available at: http://localhost:${port}/api`);
  console.log(`🌐 Frontend available at: http://localhost:${port}`);
});