// 生成された算数問題をデータベースに保存するスクリプト
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

async function populateMathQuestions() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('データベースに接続中...');
        
        // 生成された問題を読み込み
        const questionsData = JSON.parse(fs.readFileSync('math-questions.json', 'utf-8'));
        
        // 既存の算数問題を削除
        await pool.query(`DELETE FROM questions WHERE type = 'math'`);
        console.log('既存の算数問題を削除しました');
        
        // 計算問題を挿入
        console.log('計算問題をデータベースに挿入中...');
        for (const question of questionsData.calculation) {
            await pool.query(
                `INSERT INTO questions (id, type, question, answer, choices, difficulty, created_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [
                    question.id,
                    question.type,
                    question.question,
                    question.answer,
                    JSON.stringify([]), // 計算問題は選択肢なし
                    question.difficulty
                ]
            );
        }
        
        // 文章題を挿入
        console.log('文章題をデータベースに挿入中...');
        for (const question of questionsData.wordProblems) {
            await pool.query(
                `INSERT INTO questions (id, type, question, answer, choices, difficulty, created_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [
                    question.id,
                    question.type,
                    question.question,
                    question.answer,
                    JSON.stringify([]), // 文章題も選択肢なし（テンキー入力）
                    question.difficulty
                ]
            );
        }
        
        console.log(`✅ データベースに${questionsData.total}問の算数問題を保存しました`);
        console.log(`   - 計算問題: ${questionsData.calculation.length}問`);
        console.log(`   - 文章題: ${questionsData.wordProblems.length}問`);
        
        // 確認のためクエリ実行
        const result = await pool.query(`SELECT COUNT(*) FROM questions WHERE type = 'math'`);
        console.log(`データベース内の算数問題数: ${result.rows[0].count}問`);
        
    } catch (error) {
        console.error('エラーが発生しました:', error);
    } finally {
        await pool.end();
        console.log('データベース接続を終了しました');
    }
}

// 実行
populateMathQuestions();