import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User, insertUserSchema } from '@shared/schema';
import { Calculator, BookOpen, Trophy, User as UserIcon } from 'lucide-react';

interface HomePageProps {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
}

export function HomePage({ currentUser, setCurrentUser }: HomePageProps) {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    try {
      setIsLoading(true);
      const userData = {
        name: userName.trim(),
        totalScore: 0,
        mathScore: 0,
        languageScore: 0,
        currentRank: 'bronze',
        rewards: [],
      };

      const user = await apiRequest<User>('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      setCurrentUser(user);
      toast({
        title: '新しいユーザーを作成しました！',
        description: `${user.name}さん、学習を始めましょう！`,
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ユーザーの作成に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser) {
    return (
      <div className="learning-app">
        <div className="app-container">
          <div className="welcome-card">
            <h1 className="text-4xl font-bold mb-4">
              おかえりなさい、{currentUser.name}さん！
            </h1>
            <p className="text-xl opacity-90">
              今日も一緒に学習しましょう ✨
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="stats-card">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Trophy className="h-8 w-8" />
                <h3 className="text-xl font-bold">現在のランク</h3>
              </div>
              <div className="rank-badge">
                {currentUser.currentRank === 'bronze' && '🥉 ブロンズ'}
                {currentUser.currentRank === 'silver' && '🥈 シルバー'}
                {currentUser.currentRank === 'gold' && '🥇 ゴールド'}
                {currentUser.currentRank === 'platinum' && '💎 プラチナ'}
                {currentUser.currentRank === 'diamond' && '💎 ダイヤモンド'}
              </div>
              <p className="text-sm opacity-80 mt-2">
                総合スコア: {currentUser.totalScore}
              </p>
            </div>

            <div className="feature-card math-card">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Calculator className="h-8 w-8" />
                <h3 className="text-xl font-bold">算数</h3>
              </div>
              <p className="text-3xl font-bold mb-2">
                {currentUser.mathScore}
              </p>
              <p className="text-sm opacity-80 mb-4">算数スコア</p>
              <Link href="/math">
                <button className="secondary-button w-full">
                  算数問題を解く
                </button>
              </Link>
            </div>

            <div className="feature-card language-card">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <BookOpen className="h-8 w-8" />
                <h3 className="text-xl font-bold">国語</h3>
              </div>
              <p className="text-3xl font-bold mb-2">
                {currentUser.languageScore}
              </p>
              <p className="text-sm opacity-80 mb-4">国語スコア</p>
              <Link href="/language">
                <button className="secondary-button w-full">
                  国語問題を解く
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="feature-card">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-2xl mr-2">🎁</span>
                最近の特典
              </h3>
              {currentUser.rewards && currentUser.rewards.length > 0 ? (
                <div className="space-y-2">
                  {currentUser.rewards.slice(-3).map((rewardId) => (
                    <div key={rewardId} className="flex items-center space-x-2">
                      <span className="text-lg">🎉</span>
                      <span className="text-sm">特典獲得！</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">まだ特典を獲得していません</p>
              )}
              <Link href="/rewards">
                <button className="secondary-button w-full mt-4">
                  すべての特典を見る
                </button>
              </Link>
            </div>

            <div className="feature-card">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                学習のヒント
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-lg">📚</span>
                  <p className="text-sm">毎日少しずつ学習することが大切です</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-lg">🎯</span>
                  <p className="text-sm">間違えた問題は何度も挑戦してみましょう</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-lg">🏆</span>
                  <p className="text-sm">新しいランクを目指して頑張りましょう</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-app">
      <div className="app-container">
        <div className="welcome-card">
          <h1 className="text-5xl font-bold mb-4">
            学習アプリへようこそ！
          </h1>
          <p className="text-xl opacity-90 mb-8">
            算数と国語の問題で楽しく学習しましょう 🎓
          </p>
        </div>

        <div className="feature-card max-w-md mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">
            <UserIcon className="h-8 w-8 mr-2 text-purple-500" />
            新しいユーザーを作成
          </h2>
          <p className="text-gray-600 text-center mb-6">
            名前を入力して学習を始めましょう
          </p>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="あなたの名前を入力してください"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input-field w-full"
                disabled={isLoading}
              />
            </div>
            <button 
              type="submit" 
              className="primary-button w-full" 
              disabled={isLoading || !userName.trim()}
            >
              {isLoading ? '作成中...' : '学習を始める'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="feature-card math-card">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Calculator className="h-8 w-8" />
              <h3 className="text-2xl font-bold">算数</h3>
            </div>
            <p className="mb-4 opacity-90">
              テンキーを使って数字を入力し、計算問題を解きましょう
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-sm font-medium">足し算</span>
              <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-sm font-medium">引き算</span>
              <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-sm font-medium">掛け算</span>
              <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-sm font-medium">割り算</span>
            </div>
          </div>

          <div className="feature-card language-card">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8" />
              <h3 className="text-2xl font-bold">国語</h3>
            </div>
            <p className="mb-4 opacity-90">
              5つの選択肢から正しい答えを選んで学習しましょう
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-sm font-medium">漢字</span>
              <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-sm font-medium">語彙</span>
              <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-sm font-medium">文法</span>
              <span className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-sm font-medium">読解</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}