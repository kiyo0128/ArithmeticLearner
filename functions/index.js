const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Firebase Admin SDK initialization
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

// Express app setup
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// API Routes
app.get('/api/questions', async (req, res) => {
  try {
    const { type = 'math', limit = 10 } = req.query;
    
    const questionsRef = db.collection('questions');
    let query = questionsRef.where('type', '==', type);
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const snapshot = await query.get();
    const questions = [];
    
    snapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.get('/api/random-question', async (req, res) => {
  try {
    const { type = 'math' } = req.query;
    
    const questionsRef = db.collection('questions');
    const snapshot = await questionsRef.where('type', '==', type).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: 'No questions found' });
    }
    
    const questions = [];
    snapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get random question
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    res.json(randomQuestion);
  } catch (error) {
    console.error('Error fetching random question:', error);
    res.status(500).json({ error: 'Failed to fetch random question' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
