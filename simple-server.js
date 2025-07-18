const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// Simple in-memory storage
let users = [];
let questions = [];
let answers = [];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/users', (req, res) => {
  const user = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...req.body,
    createdAt: new Date()
  };
  users.push(user);
  res.json(user);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users[userIndex] = { ...users[userIndex], ...req.body };
  res.json(users[userIndex]);
});

app.post('/api/questions', (req, res) => {
  const question = {
    ...req.body,
    createdAt: new Date()
  };
  questions.push(question);
  res.json(question);
});

app.post('/api/answers', (req, res) => {
  const { userId, questionId, userAnswer } = req.body;
  
  console.log('Answer submission request:', { userId, questionId, userAnswer });
  console.log('Total users:', users.length);
  console.log('Total questions:', questions.length);
  
  // Find user and question
  const user = users.find(u => u.id === userId);
  const question = questions.find(q => q.id === questionId);
  
  console.log('User found:', !!user);
  console.log('Question found:', !!question);
  
  if (!user) {
    console.log('User not found with ID:', userId);
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (!question) {
    console.log('Question not found with ID:', questionId);
    console.log('Available questions:', questions.map(q => q.id));
    return res.status(404).json({ error: 'Question not found' });
  }
  
  // Check if answer is correct
  const isCorrect = userAnswer.toString().trim() === question.answer.toString().trim();
  
  // Create answer record
  const answer = {
    id: `answer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    questionId,
    userAnswer,
    isCorrect,
    answeredAt: new Date()
  };
  answers.push(answer);
  
  // Update user scores
  if (isCorrect) {
    user.totalScore = (user.totalScore || 0) + 1;
    if (question.type === 'math') {
      user.mathScore = (user.mathScore || 0) + 1;
    } else if (question.type === 'language') {
      user.languageScore = (user.languageScore || 0) + 1;
    }
    
    // Update user in the users array
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = user;
    }
  }
  
  // Mock rewards
  const newRewards = [];
  if (user.totalScore === 1) {
    newRewards.push({
      id: 'reward_1',
      name: 'はじめの一歩',
      description: '最初の正解！',
      requiredScore: 1,
      icon: '🎉'
    });
  }
  
  res.json({
    answer,
    user,
    scoreIncrement: isCorrect ? 1 : 0,
    rankUp: false,
    newRewards
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Web app: http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api`);
});