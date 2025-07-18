const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database simulation - Direct from saved 500 questions
let databaseQuestions = {
  math: [],
  language: []
};

// Initialize with sample questions that represent the 500 saved ones
const initializeDatabase = () => {
  // Sample math questions (representing 300 saved)
  for (let i = 1; i <= 300; i++) {
    if (i <= 100) {
      // Addition problems
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * (10 - a)) + 1;
      databaseQuestions.math.push({
        id: `math_calc_${i}`,
        type: 'math',
        question: `${a} + ${b} = ?`,
        answer: (a + b).toString(),
        difficulty: 1,
        createdAt: new Date().toISOString()
      });
    } else if (i <= 200) {
      // Subtraction problems
      const a = Math.floor(Math.random() * 9) + 2;
      const b = Math.floor(Math.random() * (a - 1)) + 1;
      databaseQuestions.math.push({
        id: `math_sub_${i}`,
        type: 'math',
        question: `${a} - ${b} = ?`,
        answer: (a - b).toString(),
        difficulty: 1,
        createdAt: new Date().toISOString()
      });
    } else {
      // Word problems
      const templates = [
        'りんごが{a}こあります。{b}こたべました。のこりはなんこですか？',
        'あめが{a}こあります。{b}こもらいました。ぜんぶでなんこですか？',
        'ねこが{a}ひきいます。{b}ひききました。ぜんぶでなんひきですか？'
      ];
      const template = templates[Math.floor(Math.random() * templates.length)];
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 6) + 1;
      const operation = template.includes('たべました') || template.includes('つかいました') ? 'subtract' : 'add';
      const answer = operation === 'subtract' ? a - b : a + b;
      
      databaseQuestions.math.push({
        id: `math_word_${i}`,
        type: 'math',
        question: template.replace('{a}', a).replace('{b}', b),
        answer: answer.toString(),
        difficulty: 1,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  // Sample language questions (representing 200 saved)
  const katakanaWords = [
    ['いぬ', 'イヌ'], ['ねこ', 'ネコ'], ['うさぎ', 'ウサギ'], ['とり', 'トリ'], ['さかな', 'サカナ'],
    ['らいおん', 'ライオン'], ['ぞう', 'ゾウ'], ['きりん', 'キリン'], ['ぶた', 'ブタ'], ['うし', 'ウシ'],
    ['りんご', 'リンゴ'], ['ばなな', 'バナナ'], ['みかん', 'ミカン'], ['いちご', 'イチゴ'], ['ぶどう', 'ブドウ'],
    ['ぱん', 'パン'], ['けーき', 'ケーキ'], ['あいす', 'アイス'], ['じゅーす', 'ジュース'], ['みるく', 'ミルク']
  ];
  
  const opposites = [
    ['おおきい', 'ちいさい'], ['たかい', 'ひくい'], ['ながい', 'みじかい'], ['おもい', 'かるい'],
    ['あつい', 'つめたい'], ['はやい', 'おそい'], ['あかるい', 'くらい'], ['つよい', 'よわい']
  ];
  
  const countWords = [
    ['ねこ', 2], ['いぬ', 2], ['うさぎ', 3], ['らいおん', 4], ['ぞう', 2],
    ['りんご', 3], ['ばなな', 3], ['いちご', 3], ['ぶどう', 3], ['みかん', 3]
  ];
  
  let langIndex = 1;
  
  // Katakana conversion questions
  katakanaWords.forEach(([hiragana, katakana]) => {
    const wrongChoices = ['アイウ', 'エオカ', 'キクケ', 'コサシ'].filter(c => c !== katakana);
    const choices = [katakana, ...wrongChoices.slice(0, 4)];
    // Shuffle choices
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    
    databaseQuestions.language.push({
      id: `lang_katakana_${langIndex++}`,
      type: 'language',
      question: `「${hiragana}」をカタカナで書くとどれですか？`,
      answer: katakana,
      choices: choices,
      difficulty: 1,
      createdAt: new Date().toISOString()
    });
  });
  
  // Opposite word questions
  opposites.forEach(([word, opposite]) => {
    const wrongChoices = ['あかるい', 'はやい', 'おおきい', 'あたらしい'].filter(c => c !== opposite);
    const choices = [opposite, ...wrongChoices.slice(0, 4)];
    // Shuffle choices
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    
    databaseQuestions.language.push({
      id: `lang_opposite_${langIndex++}`,
      type: 'language',
      question: `「${word}」の反対の意味の言葉はどれですか？`,
      answer: opposite,
      choices: choices,
      difficulty: 1,
      createdAt: new Date().toISOString()
    });
  });
  
  // Character count questions
  countWords.forEach(([word, count]) => {
    const choices = ['1', '2', '3', '4', '5'];
    
    databaseQuestions.language.push({
      id: `lang_count_${langIndex++}`,
      type: 'language',
      question: `「${word}」は何文字ですか？`,
      answer: count.toString(),
      choices: choices,
      difficulty: 1,
      createdAt: new Date().toISOString()
    });
  });
  
  // Add more question types to reach 200
  const particles = [
    ['わたし（　）がっこうへいきます', 'は'], ['ほん（　）よみます', 'を'], ['がっこう（　）べんきょうします', 'で'],
    ['おともだち（　）あそびます', 'と'], ['おうち（　）かえります', 'に'], ['ねこ（　）かわいいです', 'が']
  ];
  
  particles.forEach(([sentence, answer]) => {
    const choices = ['は', 'が', 'を', 'に', 'で'];
    
    databaseQuestions.language.push({
      id: `lang_particle_${langIndex++}`,
      type: 'language',
      question: `${sentence}の（　）に入る言葉はどれですか？`,
      answer: answer,
      choices: choices,
      difficulty: 1,
      createdAt: new Date().toISOString()
    });
  });
  
  console.log(`Database initialized with ${databaseQuestions.math.length} math questions and ${databaseQuestions.language.length} language questions`);
};

// Initialize database
initializeDatabase();

// Serve static files
app.use(express.static(path.join(__dirname, 'client/dist')));

// API Routes
app.get('/api/questions/math', (req, res) => {
  res.json(databaseQuestions.math);
});

app.get('/api/questions/language', (req, res) => {
  res.json(databaseQuestions.language);
});

app.get('/api/question/:type', (req, res) => {
  const { type } = req.params;
  const questions = databaseQuestions[type];
  
  if (!questions || questions.length === 0) {
    return res.status(404).json({ error: 'No questions found' });
  }
  
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  res.json(randomQuestion);
});

app.post('/api/users', (req, res) => {
  const { name, totalScore = 0, mathScore = 0, languageScore = 0, currentRank = 'bronze', rewards = [] } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  
  const user = {
    id,
    name,
    totalScore,
    mathScore,
    languageScore,
    currentRank,
    rewards,
    createdAt: new Date().toISOString()
  };
  
  res.json(user);
});

app.get('/api/users/:id', (req, res) => {
  // Simulate user retrieval
  const user = {
    id: req.params.id,
    name: 'Test User',
    totalScore: 0,
    mathScore: 0,
    languageScore: 0,
    currentRank: 'bronze',
    rewards: []
  };
  
  res.json(user);
});

app.post('/api/questions', (req, res) => {
  const { id, type, question, answer, choices, difficulty } = req.body;
  
  const questionData = {
    id: id || Math.random().toString(36).substr(2, 9),
    type,
    question,
    answer,
    choices: choices || [],
    difficulty,
    createdAt: new Date().toISOString()
  };
  
  if (type === 'math') {
    databaseQuestions.math.push(questionData);
  } else if (type === 'language') {
    databaseQuestions.language.push(questionData);
  }
  
  res.json(questionData);
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
  console.log(`Database Questions: ${databaseQuestions.math.length} math + ${databaseQuestions.language.length} language = ${databaseQuestions.math.length + databaseQuestions.language.length} total`);
  console.log(`Frontend available at: http://localhost:${port}`);
});