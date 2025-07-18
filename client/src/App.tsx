import { Router, Route, Link } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { HomePage } from '@/pages/HomePage';
import { MathPage } from '@/pages/MathPage';
import { LanguagePage } from '@/pages/LanguagePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RewardsPage } from '@/pages/RewardsPage';
import { useState } from 'react';
import { User } from '@shared/schema';

const queryClient = new QueryClient();

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">学習アプリ</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  ホーム
                </Link>
                <Link href="/math" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  算数
                </Link>
                <Link href="/language" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  国語
                </Link>
                <Link href="/rewards" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  特典
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  プロフィール
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Router>
            <Route path="/" component={() => <HomePage currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
            <Route path="/math" component={() => <MathPage currentUser={currentUser} />} />
            <Route path="/language" component={() => <LanguagePage currentUser={currentUser} />} />
            <Route path="/profile" component={() => <ProfilePage currentUser={currentUser} />} />
            <Route path="/rewards" component={() => <RewardsPage currentUser={currentUser} />} />
          </Router>
        </main>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;