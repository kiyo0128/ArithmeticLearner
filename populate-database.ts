// 生成された算数問題をデータベースに保存するスクリプト
import { db } from './server/db';
import { questions } from './shared/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import { generateAllMathQuestions } from './math-questions-generator';

async function populateMathQuestions() {
    try {
        console.log('算数問題をデータベースに保存中...');
        
        // 既存の算数問題を削除
        await db.delete(questions).where(eq(questions.type, 'math'));
        console.log('既存の算数問題を削除しました');
        
        // 問題を生成
        const allQuestions = generateAllMathQuestions();
        console.log(`生成された問題数: ${allQuestions.total}問`);
        
        // 計算問題を挿入
        console.log('計算問題をデータベースに挿入中...');
        for (const question of allQuestions.calculation) {
            await db.insert(questions).values({
                id: question.id,
                type: question.type,
                question: question.question,
                answer: question.answer,
                choices: [],
                difficulty: question.difficulty
            });
        }
        
        // 文章題を挿入
        console.log('文章題をデータベースに挿入中...');
        for (const question of allQuestions.wordProblems) {
            await db.insert(questions).values({
                id: question.id,
                type: question.type,
                question: question.question,
                answer: question.answer,
                choices: [],
                difficulty: question.difficulty
            });
        }
        
        console.log(`✅ データベースに${allQuestions.total}問の算数問題を保存しました`);
        console.log(`   - 計算問題: ${allQuestions.calculation.length}問`);
        console.log(`   - 文章題: ${allQuestions.wordProblems.length}問`);
        
        // 確認のためクエリ実行
        const result = await db.select().from(questions).where(eq(questions.type, 'math'));
        console.log(`データベース内の算数問題数: ${result.length}問`);
        
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
}

// 実行
populateMathQuestions().then(() => {
    console.log('処理が完了しました');
    process.exit(0);
}).catch(error => {
    console.error('処理中にエラーが発生しました:', error);
    process.exit(1);
});