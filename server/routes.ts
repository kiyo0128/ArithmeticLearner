import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IStorage } from './storage';
import { insertQuestionSchema, insertUserSchema, insertAnswerSchema, QUESTION_TYPE, RANK_REQUIREMENTS, RANK } from '../shared/schema';

const router = Router();

// Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

export function createRouter(storage: IStorage) {
  // Generate a new question using Gemini AI  
  router.post('/generate-question', async (req, res) => {
    try {
      const { type, difficulty } = req.body;
      
      if (!type || !difficulty) {
        return res.status(400).json({ error: 'Type and difficulty are required' });
      }

      if (type === 'math') {
        const { generateMathQuestion } = await import('./gemini');
        const question = await generateMathQuestion(difficulty);
        
        return res.json({
          id: `math_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          type: 'math',
          question: question.question,
          answer: question.answer,
          explanation: question.explanation,
          difficulty: difficulty
        });
      } else if (type === 'language') {
        const { generateLanguageQuestion } = await import('./gemini');
        const question = await generateLanguageQuestion(difficulty);
        
        return res.json({
          id: `lang_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          type: 'language',
          question: question.question,
          options: question.choices,
          answer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: difficulty
        });
      } else {
        return res.status(400).json({ error: 'Invalid question type' });
      }
    } catch (error) {
      console.error('Error generating question:', error);
      return res.status(500).json({ error: 'Failed to generate question' });
    }
  });

  // Save question to database
  router.post('/questions', async (req, res) => {
    try {
      const { id, type, question, answer, choices, difficulty } = req.body;
      
      const savedQuestion = await storage.saveQuestion({
        type,
        question,
        answer,
        choices: choices || [],
        difficulty
      }, id);
      
      res.json(savedQuestion);
    } catch (error) {
      console.error('Error saving question:', error);
      res.status(500).json({ error: 'Failed to save question' });
    }
  });

  // Get questions from database
  router.get('/questions/:type', async (req, res) => {
    try {
      const { type } = req.params;
      if (type !== 'math' && type !== 'language') {
        return res.status(400).json({ error: 'Invalid question type' });
      }
      console.log(`Fetching ${type} questions from database...`);
      const questions = await storage.getQuestionsByType(type);
      console.log(`Found ${questions.length} ${type} questions`);
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  });

  // Get a random question from database (prioritizing stored questions)
  router.get('/question/:type', async (req, res) => {
    try {
      const { type } = req.params;
      if (type !== 'math' && type !== 'language') {
        return res.status(400).json({ error: 'Invalid question type' });
      }
      const difficulty = parseInt(req.query.difficulty as string) || 1;
      
      // Try to get from database first
      const storedQuestions = await storage.getQuestionsByType(type);
      
      if (storedQuestions.length > 0) {
        // Return a random stored question
        const randomIndex = Math.floor(Math.random() * storedQuestions.length);
        const question = storedQuestions[randomIndex];
        
        return res.json({
          id: question.id,
          type: question.type,
          question: question.question,
          answer: question.answer,
          choices: question.choices,
          difficulty: question.difficulty,
          source: 'database'
        });
      }
      
      // Fallback to AI generation if no stored questions
      if (type === 'math') {
        const { generateMathQuestion } = await import('./gemini');
        const question = await generateMathQuestion(difficulty);
        
        return res.json({
          id: `math_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          type: 'math',
          question: question.question,
          answer: question.answer,
          explanation: question.explanation,
          difficulty: difficulty,
          source: 'ai'
        });
      } else if (type === 'language') {
        const { generateLanguageQuestion } = await import('./gemini');
        const question = await generateLanguageQuestion(difficulty);
        
        return res.json({
          id: `lang_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          type: 'language',
          question: question.question,
          options: question.choices,
          answer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: difficulty,
          source: 'ai'
        });
      }
      
      return res.status(400).json({ error: 'Invalid question type' });
    } catch (error) {
      console.error('Error getting question:', error);
      return res.status(500).json({ error: 'Failed to get question' });
    }
  });

  // Bulk save questions
  router.post('/questions/bulk', async (req, res) => {
    try {
      const { questions } = req.body;
      
      if (!Array.isArray(questions)) {
        return res.status(400).json({ error: 'Questions must be an array' });
      }
      
      const savedQuestions = [];
      for (const question of questions) {
        const savedQuestion = await storage.saveQuestion({
          type: question.type,
          question: question.question,
          answer: question.answer,
          choices: question.choices || [],
          difficulty: question.difficulty
        }, question.id);
        savedQuestions.push(savedQuestion);
      }
      
      res.json({ 
        message: `Successfully saved ${savedQuestions.length} questions`,
        count: savedQuestions.length
      });
    } catch (error) {
      console.error('Error bulk saving questions:', error);
      res.status(500).json({ error: 'Failed to bulk save questions' });
    }
  });

  // Generate a new question using Gemini AI (original endpoint)
  router.post('/questions/generate', async (req, res) => {
    try {
      const { type, difficulty } = req.body;
      
      if (!type || !difficulty) {
        return res.status(400).json({ error: 'Type and difficulty are required' });
      }

      let prompt = '';
      
      if (type === QUESTION_TYPE.MATH) {
        prompt = `
小学1年生レベルの算数問題を1問作成してください。
以下の形式でJSON形式で回答してください：
{
  "question": "問題文",
  "answer": "正解（数字のみ）"
}

要件：
- 数字は1から10までの範囲
- 足し算か引き算のみ
- 結果は0から20の範囲内
- 小学1年生が理解できる問題レベル
- 問題文は日本語で、答えは数字のみ

例：
- 3 + 4 = ? (答え: 7)
- 8 - 3 = ? (答え: 5)
- りんごが5個あります。3個食べました。残りは何個ですか？ (答え: 2)

**重要**: 小学1年生向けの問題のみを作成してください。
`;
      } else if (type === QUESTION_TYPE.LANGUAGE) {
        prompt = `
小学1年生レベルの国語問題を1問作成してください。
以下の形式でJSON形式で回答してください：
{
  "question": "問題文",
  "answer": "正解",
  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4", "選択肢5"]
}

**必須条件**：
- 漢字は一切使用しない
- ひらがなとカタカナのみ使用
- 簡単な動物の名前のひらがな→カタカナ変換問題のみ
- 小学1年生が知っている3-4文字の動物名のみ

**問題例**：
「ねこ」をカタカナで書くとどれですか？
選択肢: ["ネコ", "ネカ", "コネ", "ケノ", "ノケ"]
正解: ネコ

**使用可能な動物名**：
いぬ、ねこ、うさぎ、ぶた、とり、いのしし、きつね、りす、くま、ぞう

**絶対に避けるべき内容**：
- 漢字を含む問題
- 敬語、慣用句
- 複雑な文法
- 小学1年生が理解困難な語彙
`;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSONを抽出して解析
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }
      
      const aiResponse = JSON.parse(jsonMatch[0]);
      
      const questionData = {
        type,
        question: aiResponse.question,
        answer: aiResponse.answer,
        choices: aiResponse.choices || undefined,
        difficulty: parseInt(difficulty),
      };

      const validatedQuestion = insertQuestionSchema.parse(questionData);
      const question = await storage.createQuestion(validatedQuestion);
      
      res.json(question);
    } catch (error) {
      console.error('Error generating question:', error);
      res.status(500).json({ error: 'Failed to generate question' });
    }
  });

  // Get user by ID
  router.get('/users/:id', async (req, res) => {
    try {
      const user = await storage.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // Create a new user
  router.post('/users', async (req, res) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedUser);
      res.json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // User login
  router.post('/login', async (req, res) => {
    try {
      const { name, password } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Name is required' });
      }
      
      if (!password || typeof password !== 'string' || password.trim() === '') {
        return res.status(400).json({ message: 'Password is required' });
      }
      
      const user = await storage.getUserByNameAndPassword(name.trim(), password.trim());
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid name or password' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ message: 'Failed to log in' });
    }
  });

  // Submit an answer
  router.post('/answers', async (req, res) => {
    try {
      const { userId, questionId, userAnswer } = req.body;
      
      if (!userId || !questionId || userAnswer === undefined) {
        return res.status(400).json({ error: 'UserId, questionId, and userAnswer are required' });
      }

      const question = await storage.getQuestionById(questionId);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isCorrect = userAnswer.toString().trim() === question.answer.toString().trim();
      
      const answerData = {
        userId,
        questionId,
        userAnswer: userAnswer.toString(),
        isCorrect,
      };

      const validatedAnswer = insertAnswerSchema.parse(answerData);
      const answer = await storage.createAnswer(validatedAnswer);

      // Update user score if correct
      if (isCorrect) {
        const scoreIncrement = question.difficulty;
        const newTotalScore = user.totalScore + scoreIncrement;
        const newMathScore = question.type === QUESTION_TYPE.MATH ? user.mathScore + scoreIncrement : user.mathScore;
        const newLanguageScore = question.type === QUESTION_TYPE.LANGUAGE ? user.languageScore + scoreIncrement : user.languageScore;
        
        // Check for rank up
        let newRank = user.currentRank;
        for (const [rank, requirement] of Object.entries(RANK_REQUIREMENTS)) {
          if (newTotalScore >= requirement && getRankPriority(rank) > getRankPriority(newRank)) {
            newRank = rank as keyof typeof RANK_REQUIREMENTS;
          }
        }

        // Check for new rewards
        const allRewards = await storage.getAllRewards();
        const newRewards = allRewards.filter(reward => 
          newTotalScore >= reward.requiredScore && 
          !user.rewards.includes(reward.id)
        ).map(reward => reward.id);

        const updatedUser = await storage.updateUser(userId, {
          totalScore: newTotalScore,
          mathScore: newMathScore,
          languageScore: newLanguageScore,
          currentRank: newRank,
          rewards: [...user.rewards, ...newRewards],
        });

        res.json({ 
          answer, 
          user: updatedUser, 
          scoreIncrement, 
          rankUp: newRank !== user.currentRank,
          newRewards: newRewards.length > 0 ? allRewards.filter(r => newRewards.includes(r.id)) : []
        });
      } else {
        res.json({ answer, user, scoreIncrement: 0, rankUp: false, newRewards: [] });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  });

  // Get all rewards
  router.get('/rewards', async (_, res) => {
    try {
      const rewards = await storage.getAllRewards();
      res.json(rewards);
    } catch (error) {
      console.error('Error getting rewards:', error);
      res.status(500).json({ error: 'Failed to get rewards' });
    }
  });

  // Get user's answers
  router.get('/users/:id/answers', async (req, res) => {
    try {
      const answers = await storage.getAnswersByUserId(req.params.id);
      res.json(answers);
    } catch (error) {
      console.error('Error getting user answers:', error);
      res.status(500).json({ error: 'Failed to get user answers' });
    }
  });



  return router;
}

// Helper function to get rank priority for comparison
function getRankPriority(rank: string): number {
  const priorities = {
    [RANK.BRONZE]: 1,
    [RANK.SILVER]: 2,
    [RANK.GOLD]: 3,
    [RANK.PLATINUM]: 4,
    [RANK.DIAMOND]: 5,
  };
  return priorities[rank as keyof typeof priorities] || 0;
}