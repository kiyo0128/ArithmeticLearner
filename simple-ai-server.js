const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.use(express.json());

// Generate AI questions endpoint
app.post('/api/generate-question', async (req, res) => {
  try {
    const { type, difficulty } = req.body;
    
    if (!type || !difficulty) {
      return res.status(400).json({ error: 'Type and difficulty are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    if (type === 'math') {
      const prompt = `小学1年生（6-7歳）向けの算数問題を生成してください。

**学習指導要領に基づく内容:**
- 数と計算：1から10までの数の理解
- 足し算：1桁+1桁（答えが10以下）
- 引き算：1桁-1桁（答えが0以上）
- 数の大小比較
- 具体物を使った数え方
- 10の合成と分解

**問題の条件:**
- 数字は1-10の範囲内のみ使用
- 足し算の答えは10以下
- 引き算の答えは0以上
- 文章問題は身近な物（りんご、えんぴつ、本など）を使用
- 説明は1年生でも理解できる優しい言葉で

**問題パターン例:**
- 「3 + 2 = ?」
- 「7 - 3 = ?」
- 「りんごが5こあります。全部で何こですか？」
- 「4と何を足すと10になりますか？」
- 「6と3では、どちらが大きいですか？」

以下のJSON形式で回答してください：
{
  "question": "問題文",
  "answer": "答え（数字のみ）",
  "explanation": "1年生向けの優しい解説"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSONを抽出
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response');
      }
      
      const questionData = JSON.parse(jsonMatch[0]);
      
      return res.json({
        id: `math_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        type: 'math',
        question: questionData.question,
        answer: questionData.answer,
        explanation: questionData.explanation,
        difficulty: difficulty
      });
      
    } else if (type === 'language') {
      const prompt = `小学1年生（6-7歳）向けの国語問題を生成してください。

**学習指導要領に基づく内容:**
- ひらがな46文字の読み書き
- カタカナ46文字の読み書き
- 基本的な語彙（身近な物の名前）
- 反対語（大きい⇔小さい など）
- 文字数を数える
- 音の識別（最初の音、同じ音など）

**問題の条件:**
- 漢字は一切使用しない（ひらがな・カタカナのみ）
- 身近な物の名前を使用（動物、食べ物、学用品など）
- 1年生でも理解できる優しい言葉で出題
- 選択肢は5個

**問題パターン例:**
- 「『おおきい』の反対の言葉はどれですか？」
- 「『いぬ』をカタカナで書くとどれですか？」
- 「『ありがとう』は何文字ですか？」
- 「『か』で始まる言葉はどれですか？」

以下のJSON形式で回答してください：
{
  "question": "問題文",
  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4", "選択肢5"],
  "correctAnswer": "正解の選択肢",
  "explanation": "1年生向けの優しい解説"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSONを抽出
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response');
      }
      
      const questionData = JSON.parse(jsonMatch[0]);
      
      return res.json({
        id: `lang_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        type: 'language',
        question: questionData.question,
        options: questionData.choices,
        answer: questionData.correctAnswer,
        explanation: questionData.explanation,
        difficulty: difficulty
      });
      
    } else {
      return res.status(400).json({ error: 'Invalid question type' });
    }
  } catch (error) {
    console.error('Error generating question:', error);
    return res.status(500).json({ error: 'Failed to generate question: ' + error.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'client/dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Index file not found');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI学習アプリがポート ${PORT} で起動しました`);
  console.log(`アクセス: http://localhost:${PORT}`);
});