import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Question, User, QUESTION_TYPE } from '@shared/schema';
import { BookOpen, Check, X, Star, Trophy, RotateCcw } from 'lucide-react';

interface LanguagePageProps {
  currentUser: User | null;
}

export function LanguagePage({ currentUser }: LanguagePageProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();

  const generateQuestionMutation = useMutation({
    mutationFn: async (difficulty: number) => {
      return apiRequest<Question>('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'language', difficulty }),
      });
    },
    onSuccess: (question) => {
      setCurrentQuestion(question);
      setSelectedAnswer('');
      setShowResult(false);
      setLastResult(null);
    },
    onError: (error) => {
      toast({
        title: 'エラー',
        description: '問題の生成に失敗しました。',
        variant: 'destructive',
      });
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (answer: string) => {
      if (!currentUser || !currentQuestion) throw new Error('Missing data');
      return apiRequest<any>('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          questionId: currentQuestion.id,
          userAnswer: answer,
        }),
      });
    },
    onSuccess: (result) => {
      setLastResult(result);
      setShowResult(true);
      
      if (result.answer.isCorrect) {
        toast({
          title: '正解です！',
          description: `${result.scoreIncrement}ポイント獲得しました！`,
        });
        
        if (result.rankUp) {
          toast({
            title: 'ランクアップ！',
            description: `新しいランクに到達しました！`,
          });
        }
        
        if (result.newRewards.length > 0) {
          result.newRewards.forEach((reward: any) => {
            toast({
              title: '特典獲得！',
              description: `${reward.name}を獲得しました！`,
            });
          });
        }
      } else {
        toast({
          title: '不正解です',
          description: `正解は「${currentQuestion?.answer}」でした。`,
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'エラー',
        description: '回答の送信に失敗しました。',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    submitAnswerMutation.mutate(selectedAnswer);
  };

  const handleNewQuestion = () => {
    generateQuestionMutation.mutate(difficulty);
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer('');
    generateQuestionMutation.mutate(difficulty);
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ログインが必要です
        </h2>
        <p className="text-gray-600">
          国語問題を解くにはホームページでユーザーを作成してください。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <BookOpen className="h-8 w-8 text-green-500" />
          <h1 className="text-3xl font-bold text-gray-900">国語問題</h1>
        </div>
        <p className="text-gray-600">
          5つの選択肢から正しい答えを選びましょう
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>問題設定</span>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">難易度: {difficulty}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  難易度を選択
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Button
                      key={level}
                      variant={difficulty === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDifficulty(level)}
                      disabled={generateQuestionMutation.isPending}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={handleNewQuestion}
                disabled={generateQuestionMutation.isPending}
                className="w-full"
              >
                {generateQuestionMutation.isPending ? '問題生成中...' : '新しい問題を生成'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>現在のステータス</span>
              <div className={`rank-badge rank-${currentUser.currentRank}`}>
                {currentUser.currentRank === 'bronze' && '🥉 ブロンズ'}
                {currentUser.currentRank === 'silver' && '🥈 シルバー'}
                {currentUser.currentRank === 'gold' && '🥇 ゴールド'}
                {currentUser.currentRank === 'platinum' && '💎 プラチナ'}
                {currentUser.currentRank === 'diamond' && '💎 ダイヤモンド'}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {currentUser.languageScore}
                </p>
                <p className="text-sm text-gray-600">国語スコア</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {currentUser.totalScore}
                </p>
                <p className="text-sm text-gray-600">総合スコア</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>問題</span>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">
                  難易度 {currentQuestion.difficulty}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 mb-6">
                  {currentQuestion.question}
                </p>

                {showResult && lastResult && (
                  <div className={`p-4 rounded-lg mb-6 ${
                    lastResult.answer.isCorrect 
                      ? 'bg-green-50 border-2 border-green-200' 
                      : 'bg-red-50 border-2 border-red-200'
                  }`}>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      {lastResult.answer.isCorrect ? (
                        <Trophy className="h-8 w-8 text-green-500" />
                      ) : (
                        <RotateCcw className="h-8 w-8 text-red-500" />
                      )}
                      <p className={`text-2xl font-bold ${
                        lastResult.answer.isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {lastResult.answer.isCorrect ? '正解！' : '不正解'}
                      </p>
                    </div>
                    <p className="text-lg text-gray-700">
                      正解: {currentQuestion.answer}
                    </p>
                    {lastResult.answer.isCorrect && (
                      <p className="text-sm text-green-600 mt-2">
                        +{lastResult.scoreIncrement} ポイント獲得！
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {currentQuestion.choices?.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(choice)}
                      disabled={submitAnswerMutation.isPending || showResult}
                      className={`choice-button w-full p-4 text-left rounded-lg transition-all ${
                        selectedAnswer === choice ? 'selected' : ''
                      } ${
                        showResult && choice === currentQuestion.answer
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : showResult && selectedAnswer === choice && choice !== currentQuestion.answer
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{choice}</span>
                        {showResult && choice === currentQuestion.answer && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                        {showResult && selectedAnswer === choice && choice !== currentQuestion.answer && (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {!showResult && (
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer || submitAnswerMutation.isPending}
                    className="w-full mt-6"
                    size="lg"
                  >
                    {submitAnswerMutation.isPending ? '回答中...' : '答える'}
                  </Button>
                )}

                {showResult && (
                  <Button
                    onClick={handleNextQuestion}
                    className="w-full mt-6"
                    size="lg"
                    disabled={generateQuestionMutation.isPending}
                  >
                    次の問題へ
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!currentQuestion && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              問題を生成しましょう
            </h3>
            <p className="text-gray-600 mb-6">
              上のボタンを押して新しい国語問題を生成してください
            </p>
            <Button
              onClick={handleNewQuestion}
              disabled={generateQuestionMutation.isPending}
              size="lg"
            >
              {generateQuestionMutation.isPending ? '問題生成中...' : '問題を生成'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}