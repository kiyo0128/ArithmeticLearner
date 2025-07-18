import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { User, Answer, RANK_REQUIREMENTS } from '@shared/schema';
import { Trophy, Calculator, BookOpen, Star, TrendingUp } from 'lucide-react';

interface ProfilePageProps {
  currentUser: User | null;
}

export function ProfilePage({ currentUser }: ProfilePageProps) {
  const { data: answers } = useQuery({
    queryKey: ['/users', currentUser?.id, 'answers'],
    queryFn: () => apiRequest<Answer[]>(`/users/${currentUser?.id}/answers`),
    enabled: !!currentUser,
  });

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ログインが必要です
        </h2>
        <p className="text-gray-600">
          プロフィールを見るにはホームページでユーザーを作成してください。
        </p>
      </div>
    );
  }

  const correctAnswers = answers?.filter(answer => answer.isCorrect).length || 0;
  const totalAnswers = answers?.length || 0;
  const accuracy = totalAnswers > 0 ? ((correctAnswers / totalAnswers) * 100).toFixed(1) : '0';

  const getNextRank = () => {
    const ranks = Object.entries(RANK_REQUIREMENTS).sort((a, b) => b[1] - a[1]);
    const currentRankIndex = ranks.findIndex(([rank]) => rank === currentUser.currentRank);
    return currentRankIndex > 0 ? ranks[currentRankIndex - 1] : null;
  };

  const nextRank = getNextRank();
  const progressToNextRank = nextRank 
    ? ((currentUser.totalScore / nextRank[1]) * 100).toFixed(1)
    : '100';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentUser.name}さんのプロフィール
        </h1>
        <div className={`rank-badge rank-${currentUser.currentRank} text-lg`}>
          {currentUser.currentRank === 'bronze' && '🥉 ブロンズ'}
          {currentUser.currentRank === 'silver' && '🥈 シルバー'}
          {currentUser.currentRank === 'gold' && '🥇 ゴールド'}
          {currentUser.currentRank === 'platinum' && '💎 プラチナ'}
          {currentUser.currentRank === 'diamond' && '💎 ダイヤモンド'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span>総合スコア</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {currentUser.totalScore}
              </p>
              <p className="text-sm text-gray-600">
                獲得ポイント
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-6 w-6 text-blue-500" />
              <span>算数スコア</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {currentUser.mathScore}
              </p>
              <p className="text-sm text-gray-600">
                算数問題のスコア
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-green-500" />
              <span>国語スコア</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600 mb-2">
                {currentUser.languageScore}
              </p>
              <p className="text-sm text-gray-600">
                国語問題のスコア
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-purple-500" />
              <span>学習統計</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">解答数</span>
                <span className="font-semibold">{totalAnswers}問</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">正解数</span>
                <span className="font-semibold text-green-600">{correctAnswers}問</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">正解率</span>
                <span className="font-semibold text-blue-600">{accuracy}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">獲得特典</span>
                <span className="font-semibold text-purple-600">{currentUser.rewards.length}個</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-yellow-500" />
              <span>ランク進捗</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">現在のランク</span>
                  <div className={`rank-badge rank-${currentUser.currentRank}`}>
                    {currentUser.currentRank === 'bronze' && '🥉 ブロンズ'}
                    {currentUser.currentRank === 'silver' && '🥈 シルバー'}
                    {currentUser.currentRank === 'gold' && '🥇 ゴールド'}
                    {currentUser.currentRank === 'platinum' && '💎 プラチナ'}
                    {currentUser.currentRank === 'diamond' && '💎 ダイヤモンド'}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  現在のスコア: {currentUser.totalScore}
                </div>
              </div>
              
              {nextRank && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">次のランク</span>
                    <div className={`rank-badge rank-${nextRank[0]}`}>
                      {nextRank[0] === 'silver' && '🥈 シルバー'}
                      {nextRank[0] === 'gold' && '🥇 ゴールド'}
                      {nextRank[0] === 'platinum' && '💎 プラチナ'}
                      {nextRank[0] === 'diamond' && '💎 ダイヤモンド'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    必要スコア: {nextRank[1]} ({nextRank[1] - currentUser.totalScore}足りない)
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, parseFloat(progressToNextRank))}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    進捗: {progressToNextRank}%
                  </div>
                </div>
              )}
              
              {currentUser.currentRank === 'diamond' && (
                <div className="text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <p className="text-sm text-gray-600">
                    最高ランクに到達しました！
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近の活動</CardTitle>
        </CardHeader>
        <CardContent>
          {answers && answers.length > 0 ? (
            <div className="space-y-3">
              {answers.slice(-10).reverse().map((answer, index) => (
                <div key={answer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      answer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      {new Date(answer.answeredAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      回答: {answer.userAnswer}
                    </span>
                    <span className={`text-sm font-semibold ${
                      answer.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {answer.isCorrect ? '正解' : '不正解'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">まだ問題を解いていません</p>
              <p className="text-sm text-gray-500 mt-2">
                算数や国語の問題を解いて活動を始めましょう！
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}