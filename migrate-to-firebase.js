"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateData = migrateData;
const firebase_1 = require("./server/firebase");
const db_1 = require("./server/db");
const schema_1 = require("./shared/schema");
// PostgreSQL から Firestore への移行スクリプト
async function migrateData() {
    try {
        console.log('🔄 Firebase移行開始...');
        // 1. 問題データの移行
        console.log('📚 問題データを移行中...');
        const questionsData = await db_1.db.select().from(schema_1.questions);
        console.log(`📊 移行予定の問題数: ${questionsData.length}問`);
        // Firestore に問題データを保存
        let migratedQuestions = 0;
        for (const question of questionsData) {
            await firebase_1.db.collection(firebase_1.COLLECTIONS.QUESTIONS).doc(question.id).set({
                id: question.id,
                type: question.type,
                question: question.question,
                answer: question.answer,
                choices: question.choices || [],
                difficulty: question.difficulty,
                createdAt: question.createdAt || new Date(),
            });
            migratedQuestions++;
            if (migratedQuestions % 50 === 0) {
                console.log(`✅ ${migratedQuestions}問移行完了...`);
            }
        }
        console.log(`✅ 問題データ移行完了: ${migratedQuestions}問`);
        // 2. ユーザーデータの移行
        console.log('👥 ユーザーデータを移行中...');
        const usersData = await db_1.db.select().from(schema_1.users);
        console.log(`📊 移行予定のユーザー数: ${usersData.length}人`);
        let migratedUsers = 0;
        for (const user of usersData) {
            await firebase_1.db.collection(firebase_1.COLLECTIONS.USERS).doc(user.id).set({
                id: user.id,
                name: user.name,
                password: user.password,
                totalScore: user.totalScore,
                mathScore: user.mathScore,
                languageScore: user.languageScore,
                currentRank: user.currentRank,
                rewards: user.rewards || [],
                createdAt: user.createdAt || new Date(),
            });
            migratedUsers++;
        }
        console.log(`✅ ユーザーデータ移行完了: ${migratedUsers}人`);
        // 3. 回答データの移行
        console.log('💬 回答データを移行中...');
        const answersData = await db_1.db.select().from(schema_1.answers);
        console.log(`📊 移行予定の回答数: ${answersData.length}件`);
        let migratedAnswers = 0;
        for (const answer of answersData) {
            await firebase_1.db.collection(firebase_1.COLLECTIONS.ANSWERS).doc(answer.id).set({
                id: answer.id,
                userId: answer.userId,
                questionId: answer.questionId,
                userAnswer: answer.userAnswer,
                isCorrect: answer.isCorrect,
                answeredAt: answer.answeredAt || new Date(),
            });
            migratedAnswers++;
            if (migratedAnswers % 100 === 0) {
                console.log(`✅ ${migratedAnswers}件回答移行完了...`);
            }
        }
        console.log(`✅ 回答データ移行完了: ${migratedAnswers}件`);
        // 4. 統計情報の表示
        console.log('\n🎉 Firebase移行完了！');
        console.log(`📚 問題: ${migratedQuestions}問`);
        console.log(`👥 ユーザー: ${migratedUsers}人`);
        console.log(`💬 回答: ${migratedAnswers}件`);
        // 5. 移行確認
        console.log('\n🔍 移行確認中...');
        const firestoreQuestions = await firebase_1.db.collection(firebase_1.COLLECTIONS.QUESTIONS).get();
        const firestoreUsers = await firebase_1.db.collection(firebase_1.COLLECTIONS.USERS).get();
        const firestoreAnswers = await firebase_1.db.collection(firebase_1.COLLECTIONS.ANSWERS).get();
        console.log(`✅ Firestore問題数: ${firestoreQuestions.size}問`);
        console.log(`✅ Firestoreユーザー数: ${firestoreUsers.size}人`);
        console.log(`✅ Firestore回答数: ${firestoreAnswers.size}件`);
        console.log('\n🚀 移行が正常に完了しました！');
    }
    catch (error) {
        console.error('❌ 移行中にエラーが発生しました:', error);
        throw error;
    }
}
// 移行の実行
if (require.main === module) {
    migrateData()
        .then(() => {
        console.log('移行完了');
        process.exit(0);
    })
        .catch((error) => {
        console.error('移行失敗:', error);
        process.exit(1);
    });
}
