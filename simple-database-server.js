const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'client/dist')));

// API Routes
app.get('/api/questions/math', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM questions WHERE type = 'math' ORDER BY RANDOM()");
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/questions/language', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM questions WHERE type = 'language' ORDER BY RANDOM()");
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/question/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const result = await pool.query("SELECT * FROM questions WHERE type = $1 ORDER BY RANDOM() LIMIT 1", [type]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'No questions found' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, totalScore = 0, mathScore = 0, languageScore = 0, currentRank = 'bronze', rewards = [] } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    
    const result = await pool.query(`
      INSERT INTO users (id, name, "totalScore", "mathScore", "languageScore", "currentRank", rewards, "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `, [id, name, totalScore, mathScore, languageScore, currentRank, JSON.stringify(rewards)]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const { id, type, question, answer, choices, difficulty } = req.body;
    
    const result = await pool.query(`
      INSERT INTO questions (id, type, question, answer, choices, difficulty, "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO UPDATE SET
        type = EXCLUDED.type,
        question = EXCLUDED.question,
        answer = EXCLUDED.answer,
        choices = EXCLUDED.choices,
        difficulty = EXCLUDED.difficulty
      RETURNING *
    `, [id || Math.random().toString(36).substr(2, 9), type, question, answer, JSON.stringify(choices || []), difficulty]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Frontend available at: http://localhost:${port}`);
});