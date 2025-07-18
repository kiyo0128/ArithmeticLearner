import 'dotenv/config';
import { initializeFirestore, COLLECTIONS } from './server/firebase';
import { FirestoreStorage } from './server/storage';

// Firebase接続テスト
async function testFirebaseConnection() {
  try {
    console.log('🔄 Firebase接続テスト開始...');
    
    // Firestore初期化
    const db = initializeFirestore();
    console.log('✅ Firestore初期化完了');
    
    // FirestoreStorage初期化
    const storage = new FirestoreStorage();
    console.log('✅ FirestoreStorage初期化完了');
    
    // テストデータの作成
    console.log('\n📝 テストデータの作成...');
    
    // 1. テスト用問題の作成
    console.log('📚 テスト問題作成中...');
    const testMathQuestion = await storage.createQuestion({
      type: 'math',
      question: '2 + 3 = ?',
      answer: '5',
      difficulty: 1,
    });
    console.log('✅ 算数問題作成完了:', testMathQuestion.id);
    
    const testLanguageQuestion = await storage.createQuestion({
      type: 'language',
      question: 'テスト問題: 「いぬ」をカタカナで書くと？',
      answer: 'イヌ',
      choices: ['イヌ', 'イム', 'イナ', 'イウ', 'イエ'],
      difficulty: 1,
    });
    console.log('✅ 国語問題作成完了:', testLanguageQuestion.id);
    
    // 2. テスト用ユーザーの作成
    console.log('👤 テストユーザー作成中...');
    const testUser = await storage.createUser({
      name: 'テストユーザー',
      password: '1234',
      totalScore: 0,
      mathScore: 0,
      languageScore: 0,
      currentRank: 'bronze',
      rewards: [],
    });
    console.log('✅ ユーザー作成完了:', testUser.id);
    
    // 3. テスト用回答の作成
    console.log('💬 テスト回答作成中...');
    const testAnswer = await storage.createAnswer({
      userId: testUser.id,
      questionId: testMathQuestion.id,
      userAnswer: '5',
      isCorrect: true,
    });
    console.log('✅ 回答作成完了:', testAnswer.id);
    
    // 4. データ読み取りテスト
    console.log('\n🔍 データ読み取りテスト...');
    
    // 問題の読み取り
    const mathQuestions = await storage.getQuestionsByType('math');
    const languageQuestions = await storage.getQuestionsByType('language');
    console.log(`✅ 算数問題数: ${mathQuestions.length}問`);
    console.log(`✅ 国語問題数: ${languageQuestions.length}問`);
    
    // ユーザーの読み取り
    const retrievedUser = await storage.getUserById(testUser.id);
    console.log(`✅ ユーザー読み取り: ${retrievedUser?.name}`);
    
    // 回答の読み取り
    const userAnswers = await storage.getAnswersByUserId(testUser.id);
    console.log(`✅ ユーザー回答数: ${userAnswers.length}件`);
    
    // 5. 更新テスト
    console.log('\n🔄 データ更新テスト...');
    const updatedUser = await storage.updateUser(testUser.id, {
      totalScore: 100,
      mathScore: 60,
      languageScore: 40,
      currentRank: 'silver',
    });
    console.log(`✅ ユーザー更新完了: ${updatedUser.name} (${updatedUser.currentRank})`);
    
    // 6. 統計情報の表示
    console.log('\n📊 統計情報...');
    const questionsSnapshot = await db.collection(COLLECTIONS.QUESTIONS).get();
    const usersSnapshot = await db.collection(COLLECTIONS.USERS).get();
    const answersSnapshot = await db.collection(COLLECTIONS.ANSWERS).get();
    const rewardsSnapshot = await db.collection(COLLECTIONS.REWARDS).get();
    
    console.log(`📚 問題数: ${questionsSnapshot.size}問`);
    console.log(`👥 ユーザー数: ${usersSnapshot.size}人`);
    console.log(`💬 回答数: ${answersSnapshot.size}件`);
    console.log(`🏆 報酬数: ${rewardsSnapshot.size}種類`);
    
    console.log('\n🎉 Firebase接続テスト完了！');
    console.log('✅ Firestore正常に動作しています');
    
  } catch (error) {
    console.error('❌ Firebase接続テストでエラーが発生しました:', error);
    throw error;
  }
}

// テストの実行
if (require.main === module) {
  testFirebaseConnection()
    .then(() => {
      console.log('\n🚀 テスト完了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 テスト失敗:', error);
      process.exit(1);
    });
}

export { testFirebaseConnection }; 