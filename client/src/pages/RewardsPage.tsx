import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { User, Reward } from '@shared/schema';
import { Trophy, Lock, Star, Gift } from 'lucide-react';

interface RewardsPageProps {
  currentUser: User | null;
}

export function RewardsPage({ currentUser }: RewardsPageProps) {
  const { data: rewards } = useQuery({
    queryKey: ['/rewards'],
    queryFn: () => apiRequest<Reward[]>('/rewards'),
  });

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ログインが必要です
        </h2>
        <p className="text-gray-600">
          特典を見るにはホームページでユーザーを作成してください。
        </p>
      </div>
    );
  }

  const sortedRewards = rewards?.sort((a, b) => a.requiredScore - b.requiredScore) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Gift className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-gray-900">特典一覧</h1>
        </div>
        <p className="text-gray-600">
          学習して特典を集めましょう！
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span>獲得済み特典</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600 mb-2">
                {currentUser.rewards.length}
              </p>
              <p className="text-sm text-gray-600">
                / {sortedRewards.length} 個
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-blue-500" />
              <span>現在のスコア</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {currentUser.totalScore}
              </p>
              <p className="text-sm text-gray-600">
                総合スコア
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="h-6 w-6 text-green-500" />
              <span>次の特典まで</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {(() => {
                const nextReward = sortedRewards.find(
                  reward => reward.requiredScore > currentUser.totalScore
                );
                const remaining = nextReward ? nextReward.requiredScore - currentUser.totalScore : 0;
                
                return (
                  <>
                    <p className="text-4xl font-bold text-green-600 mb-2">
                      {remaining}
                    </p>
                    <p className="text-sm text-gray-600">
                      {nextReward ? 'ポイント必要' : '全て獲得済み'}
                    </p>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">全ての特典</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedRewards.map((reward) => {
            const isUnlocked = currentUser.rewards.includes(reward.id);
            const canUnlock = currentUser.totalScore >= reward.requiredScore;
            
            return (
              <Card key={reward.id} className={`transition-all ${
                isUnlocked 
                  ? 'bg-green-50 border-green-200' 
                  : canUnlock 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{reward.icon}</span>
                      <span className={`${
                        isUnlocked ? 'text-green-800' : canUnlock ? 'text-blue-800' : 'text-gray-500'
                      }`}>
                        {reward.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isUnlocked ? (
                        <Trophy className="h-5 w-5 text-green-500" />
                      ) : canUnlock ? (
                        <Gift className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Lock className="h-5 w-5 text-gray-400" />
                      )}
                      <div className={`rank-badge rank-${reward.rank}`}>
                        {reward.rank === 'bronze' && '🥉'}
                        {reward.rank === 'silver' && '🥈'}
                        {reward.rank === 'gold' && '🥇'}
                        {reward.rank === 'platinum' && '💎'}
                        {reward.rank === 'diamond' && '💎'}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm mb-3 ${
                    isUnlocked ? 'text-green-700' : canUnlock ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {reward.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      必要スコア: {reward.requiredScore}
                    </span>
                    <span className={`text-sm font-bold ${
                      isUnlocked 
                        ? 'text-green-600' 
                        : canUnlock 
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                    }`}>
                      {isUnlocked ? '獲得済み' : canUnlock ? '獲得可能' : 'ロック中'}
                    </span>
                  </div>
                  
                  {!isUnlocked && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            canUnlock ? 'bg-blue-600' : 'bg-gray-400'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (currentUser.totalScore / reward.requiredScore) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        進捗: {Math.min(100, Math.round((currentUser.totalScore / reward.requiredScore) * 100))}%
                        {!canUnlock && ` (あと${reward.requiredScore - currentUser.totalScore}ポイント)`}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>特典獲得のコツ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-semibold">毎日の学習</h3>
                  <p className="text-sm text-gray-600">
                    毎日少しずつでも続けることが大切です
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💪</span>
                <div>
                  <h3 className="font-semibold">難易度に挑戦</h3>
                  <p className="text-sm text-gray-600">
                    高い難易度の問題ほど多くのポイントが獲得できます
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <h3 className="font-semibold">バランス良く学習</h3>
                  <p className="text-sm text-gray-600">
                    算数と国語の両方を学習しましょう
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <h3 className="font-semibold">復習も大切</h3>
                  <p className="text-sm text-gray-600">
                    間違えた問題を見直すことで理解が深まります
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}