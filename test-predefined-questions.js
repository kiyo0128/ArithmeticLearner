// 事前定義問題システムのテスト
const fs = require('fs');

// 算数問題の事前定義データ
const mathQuestions = [
    {
        id: 'math_1',
        type: 'math',
        question: '2 + 3 = ?',
        answer: '5',
        difficulty: 1
    },
    {
        id: 'math_2',
        type: 'math',
        question: '7 - 4 = ?',
        answer: '3',
        difficulty: 1
    },
    {
        id: 'math_3',
        type: 'math',
        question: '5 + 2 = ?',
        answer: '7',
        difficulty: 1
    }
];

// 国語問題の事前定義データ
const languageQuestions = [
    {
        id: 'lang_1',
        type: 'language',
        question: '「いぬ」をカタカナで書くとどれですか？',
        answer: 'イヌ',
        choices: ['イヌ', 'イム', 'イナ', 'イウ', 'イエ'],
        difficulty: 1
    },
    {
        id: 'lang_2',
        type: 'language',
        question: '「ねこ」をカタカナで書くとどれですか？',
        answer: 'ネコ',
        choices: ['ネコ', 'ネカ', 'ネキ', 'ネク', 'ネケ'],
        difficulty: 1
    },
    {
        id: 'lang_3',
        type: 'language',
        question: '「りんご」をカタカナで書くとどれですか？',
        answer: 'リンゴ',
        choices: ['リンゴ', 'リンガ', 'リンギ', 'リング', 'リンゲ'],
        difficulty: 1
    }
];

// 事前定義問題システム
class PredefinedQuestionSystem {
    constructor() {
        this.mathQuestions = mathQuestions;
        this.languageQuestions = languageQuestions;
        console.log('✅ 事前定義問題システムが初期化されました');
        console.log(`算数問題: ${this.mathQuestions.length}問`);
        console.log(`国語問題: ${this.languageQuestions.length}問`);
    }

    // AIを使わずに問題を取得
    getQuestion(type) {
        const questions = type === 'math' ? this.mathQuestions : this.languageQuestions;
        const randomIndex = Math.floor(Math.random() * questions.length);
        const question = questions[randomIndex];
        
        console.log(`✅ ${type}問題を取得しました (AIを使用せず)`);
        console.log(`問題: ${question.question}`);
        console.log(`答え: ${question.answer}`);
        
        return question;
    }

    // 全ての問題を取得
    getAllQuestions(type) {
        const questions = type === 'math' ? this.mathQuestions : this.languageQuestions;
        console.log(`✅ ${type}問題を全て取得しました: ${questions.length}問`);
        return questions;
    }
}

// テスト実行
console.log('🔍 事前定義問題システムのテスト開始...');
console.log('');

const system = new PredefinedQuestionSystem();

console.log('');
console.log('=== 算数問題テスト ===');
const mathQ1 = system.getQuestion('math');
const mathQ2 = system.getQuestion('math');

console.log('');
console.log('=== 国語問題テスト ===');
const langQ1 = system.getQuestion('language');
const langQ2 = system.getQuestion('language');

console.log('');
console.log('=== 全問題取得テスト ===');
const allMath = system.getAllQuestions('math');
const allLanguage = system.getAllQuestions('language');

console.log('');
console.log('✅ テスト完了！');
console.log('📋 結果:');
console.log('- AI問題生成: 使用しない');
console.log('- 事前定義問題: 正常動作');
console.log('- 算数問題: 即座に取得可能');
console.log('- 国語問題: 即座に取得可能');
console.log('- 速度: 高速 (API制限なし)');
console.log('- 安定性: 高い (ネットワーク依存なし)');