import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';
import { Numpad } from '@/components/Numpad';
import { Calculator, Trophy, Star, RefreshCw } from 'lucide-react';

interface MathPageProps {
  currentUser: User | null;
}

interface Question {
  id: string;
  type: string;
  question: string;
  answer: string;
  difficulty: number;
  createdAt: string;
}

export function MathPage({ currentUser }: MathPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateQuestionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<Question>('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'math', difficulty }),
      });
    },
    onSuccess: (question) => {
      setCurrentQuestion(question);
      setUserAnswer('');
      setShowResult(false);
    },
    onError: () => {
      toast({
        title: 'エラー',
        description: '問題の生成に失敗しました。もう一度お試しください。',
        variant: 'destructive',
      });
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !currentQuestion) {
        throw new Error('User or question not found');
      }

      return apiRequest('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          questionId: currentQuestion.id,
          userAnswer,
        }),
      });
    },
    onSuccess: (result) => {
      setIsCorrect(result.isCorrect);
      setShowResult(true);

      if (result.isCorrect) {
        setScore(prev => prev + result.scoreIncrement);
        setStreak(prev => prev + 1);
        toast({
          title: '正解！',
          description: `+${result.scoreIncrement}ポイント獲得！`,
        });

        if (result.rankUp) {
          toast({
            title: '🎉 ランクアップ！',
            description: `新しいランクに到達しました！`,
          });
        }

        if (result.newRewards.length > 0) {
          toast({
            title: '🎁 新しい特典を獲得！',
            description: `${result.newRewards.length}個の特典を獲得しました！`,
          });
        }
      } else {
        setStreak(0);
        toast({
          title: '不正解',
          description: `正解は「${currentQuestion?.answer}」でした。`,
          variant: 'destructive',
        });
      }

      queryClient.invalidateQueries();
    },
    onError: () => {
      toast({
        title: 'エラー',
        description: '答えの送信に失敗しました。',
        variant: 'destructive',
      });
    },
  });

  const handleNumberClick = (num: string) => {
    if (userAnswer.length < 5) {
      setUserAnswer(prev => prev + num);
    }
  };

  const handleClear = () => {
    setUserAnswer('');
  };

  const handleSubmit = () => {
    if (!userAnswer || !currentQuestion) return;
    submitAnswerMutation.mutate();
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    generateQuestionMutation.mutate();
  };

  if (!currentUser) {
    return (
      <div className="learning-app">
        <div className="app-container">
          <div className="welcome-card">
            <h1 className="text-3xl font-bold mb-4">算数ページ</h1>
            <p className="text-lg">ログインして算数問題に挑戦しましょう！</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-app">
      <div className="app-container">
        <div className="welcome-card">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Calculator className="h-12 w-12 text-pink-500" />
            <h1 className="text-4xl font-bold">算数チャレンジ</h1>
          </div>
          <p className="text-xl opacity-90">
            計算問題を解いてスコアを伸ばそう！
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stats-card">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-bold">スコア</h3>
            </div>
            <p className="text-3xl font-bold">{currentUser.mathScore + score}</p>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Trophy className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-bold">連続正解</h3>
            </div>
            <p className="text-3xl font-bold">{streak}</p>
          </div>

          <div className="stats-card">
            <h3 className="text-lg font-bold mb-2">難易度</h3>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    difficulty === level
                      ? 'bg-white text-gray-800 shadow-md'
                      : 'bg-white bg-opacity-50 text-gray-600 hover:bg-opacity-70'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!currentQuestion ? (
          <div className="text-center">
            <div className="feature-card max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4">準備はいいですか？</h2>
              <p className="mb-6">「問題を開始」ボタンを押して算数問題に挑戦しましょう！</p>
              <button
                onClick={() => generateQuestionMutation.mutate()}
                disabled={generateQuestionMutation.isPending}
                className="primary-button"
              >
                {generateQuestionMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="loading-spinner w-5 h-5"></div>
                    問題を生成中...
                  </div>
                ) : (
                  '問題を開始'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="question-card fade-in">
              <div className="question-text">
                {currentQuestion.question}
              </div>

              {!showResult ? (
                <div>
                  <Numpad
                    onNumberClick={handleNumberClick}
                    onClear={handleClear}
                    onSubmit={handleSubmit}
                    value={userAnswer}
                    disabled={submitAnswerMutation.isPending}
                  />

                  {submitAnswerMutation.isPending && (
                    <div className="text-center mt-4">
                      <div className="loading-spinner"></div>
                      <p className="text-gray-600 mt-2">答えを確認中...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`result-card ${isCorrect ? 'correct' : 'incorrect'} fade-in`}>
                  <div className="text-4xl mb-4">
                    {isCorrect ? '🎉' : '😅'}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {isCorrect ? '正解です！' : '不正解...'}
                  </h3>
                  <p className="text-lg mb-4">
                    正解は「{currentQuestion.answer}」でした
                  </p>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={handleNextQuestion}
                      disabled={generateQuestionMutation.isPending}
                      className="primary-button"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      次の問題
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}