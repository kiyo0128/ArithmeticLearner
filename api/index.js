const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Firebase Admin SDK の初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: "arithmetic-learner",
      private_key_id: "eba1e3e3d674d737742c17b432b500b97c4cb4af",
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: "firebase-adminsdk-fbsvc@arithmetic-learner.iam.gserviceaccount.com",
      client_id: "105808018864293434988",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40arithmetic-learner.iam.gserviceaccount.com"
    })
  });
}

const db = admin.firestore();
const app = express();

// ミドルウェア
app.use(cors({ origin: true }));
app.use(express.json());

// ユーザー作成
app.post('/api/users', async (req, res) => {
  try {
    const { name, password } = req.body;
    
    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    // ユーザーをFirestoreに保存
    const userRef = db.collection('users').doc();
    await userRef.set({
      name,
      password, // 本番では暗号化が必要
      totalScore: 0,
      mathScore: 0,
      languageScore: 0,
      currentRank: 'bronze',
      rewards: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ 
      id: userRef.id,
      name,
      totalScore: 0,
      mathScore: 0,
      languageScore: 0,
      currentRank: 'bronze',
      rewards: []
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ユーザー取得
app.get('/api/users/:id', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: userDoc.id,
      ...userDoc.data()
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// 問題取得
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

// ランダム問題取得
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
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    res.json(randomQuestion);
  } catch (error) {
    console.error('Error fetching random question:', error);
    res.status(500).json({ error: 'Failed to fetch random question' });
  }
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Vercel用のエクスポート
module.exports = app; 