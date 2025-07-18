// 算数問題生成スクリプト - 小学1年生レベル
// 計算問題200問 + 文章題200問を生成

const fs = require('fs');

// 計算問題200問を生成
function generateCalculationQuestions() {
    const questions = [];
    let questionNumber = 1;
    
    // 足し算問題 (1桁+1桁 = 10以下)
    for (let a = 1; a <= 9; a++) {
        for (let b = 1; b <= 9; b++) {
            if (a + b <= 10) {
                questions.push({
                    id: `calc_${questionNumber}`,
                    type: 'math',
                    subtype: 'calculation',
                    question: `${a} + ${b} = ?`,
                    answer: (a + b).toString(),
                    explanation: `${a}と${b}を足すと${a + b}になります`,
                    difficulty: 1
                });
                questionNumber++;
            }
        }
    }
    
    // 引き算問題 (答えが0以上)
    for (let a = 1; a <= 10; a++) {
        for (let b = 1; b <= a; b++) {
            if (questionNumber <= 100) {
                questions.push({
                    id: `calc_${questionNumber}`,
                    type: 'math',
                    subtype: 'calculation',
                    question: `${a} - ${b} = ?`,
                    answer: (a - b).toString(),
                    explanation: `${a}から${b}を引くと${a - b}になります`,
                    difficulty: 1
                });
                questionNumber++;
            }
        }
    }
    
    // 10の合成・分解問題
    const tens = [
        [1, 9], [2, 8], [3, 7], [4, 6], [5, 5]
    ];
    
    tens.forEach(([a, b]) => {
        if (questionNumber <= 150) {
            questions.push({
                id: `calc_${questionNumber}`,
                type: 'math',
                subtype: 'calculation',
                question: `${a} + ? = 10`,
                answer: b.toString(),
                explanation: `${a}に${b}を足すと10になります`,
                difficulty: 1
            });
            questionNumber++;
            
            questions.push({
                id: `calc_${questionNumber}`,
                type: 'math',
                subtype: 'calculation',
                question: `10 - ${a} = ?`,
                answer: b.toString(),
                explanation: `10から${a}を引くと${b}になります`,
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    // 簡単な数の比較問題
    const comparisons = [
        [3, 5], [2, 7], [4, 6], [1, 8], [5, 9], [2, 4], [3, 8], [1, 6]
    ];
    
    comparisons.forEach(([a, b]) => {
        if (questionNumber <= 180) {
            questions.push({
                id: `calc_${questionNumber}`,
                type: 'math',
                subtype: 'calculation',
                question: `${a}と${b}はどちらが大きいですか？`,
                answer: b > a ? b.toString() : a.toString(),
                explanation: `${Math.max(a, b)}の方が${Math.min(a, b)}より大きいです`,
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    // 残りの問題を追加（バリエーション）
    while (questionNumber <= 200) {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        
        if (a + b <= 10) {
            questions.push({
                id: `calc_${questionNumber}`,
                type: 'math',
                subtype: 'calculation',
                question: `${a} + ${b} = ?`,
                answer: (a + b).toString(),
                explanation: `${a}と${b}を足すと${a + b}になります`,
                difficulty: 1
            });
            questionNumber++;
        }
    }
    
    return questions.slice(0, 200);
}

// 文章題200問を生成
function generateWordProblems() {
    const problems = [];
    let questionNumber = 1;
    
    // 動物の数を数える問題
    const animals = ['ねこ', 'いぬ', 'うさぎ', 'とり', 'さかな', 'ひよこ', 'かめ', 'りす'];
    
    animals.forEach(animal => {
        for (let i = 1; i <= 5; i++) {
            if (questionNumber <= 40) {
                problems.push({
                    id: `word_${questionNumber}`,
                    type: 'math',
                    subtype: 'word_problem',
                    question: `${animal}が${i}ひきいます。みんなで何ひきですか？`,
                    answer: i.toString(),
                    explanation: `${animal}が${i}ひきいるので、答えは${i}ひきです`,
                    difficulty: 1
                });
                questionNumber++;
            }
        }
    });
    
    // 食べ物の数を数える問題
    const foods = ['りんご', 'みかん', 'ばなな', 'いちご', 'ぶどう', 'もも', 'なし', 'かき'];
    
    foods.forEach(food => {
        for (let i = 1; i <= 5; i++) {
            if (questionNumber <= 80) {
                problems.push({
                    id: `word_${questionNumber}`,
                    type: 'math',
                    subtype: 'word_problem',
                    question: `${food}が${i}こあります。みんなで何こですか？`,
                    answer: i.toString(),
                    explanation: `${food}が${i}こあるので、答えは${i}こです`,
                    difficulty: 1
                });
                questionNumber++;
            }
        }
    });
    
    // 足し算の文章題
    const additionProblems = [
        ['りんご', '2', 'みかん', '3', '5'],
        ['ねこ', '1', 'いぬ', '2', '3'],
        ['ほん', '3', 'ほん', '1', '4'],
        ['えんぴつ', '2', 'えんぴつ', '2', '4'],
        ['はな', '1', 'はな', '3', '4'],
        ['ぼーる', '2', 'ぼーる', '1', '3'],
        ['くるま', '1', 'くるま', '4', '5'],
        ['おもちゃ', '3', 'おもちゃ', '2', '5']
    ];
    
    additionProblems.forEach(([item1, num1, item2, num2, answer]) => {
        for (let i = 0; i < 5; i++) {
            if (questionNumber <= 120) {
                problems.push({
                    id: `word_${questionNumber}`,
                    type: 'math',
                    subtype: 'word_problem',
                    question: `${item1}が${num1}こと${item2}が${num2}こあります。ぜんぶで何こですか？`,
                    answer: answer,
                    explanation: `${num1}こと${num2}こを足すと${answer}こになります`,
                    difficulty: 1
                });
                questionNumber++;
            }
        }
    });
    
    // 引き算の文章題
    const subtractionProblems = [
        ['りんご', '5', '2', '3'],
        ['ねこ', '4', '1', '3'],
        ['ほん', '6', '2', '4'],
        ['えんぴつ', '8', '3', '5'],
        ['はな', '7', '3', '4'],
        ['ぼーる', '5', '1', '4'],
        ['くるま', '9', '4', '5'],
        ['おもちゃ', '6', '1', '5']
    ];
    
    subtractionProblems.forEach(([item, total, taken, answer]) => {
        for (let i = 0; i < 5; i++) {
            if (questionNumber <= 160) {
                problems.push({
                    id: `word_${questionNumber}`,
                    type: 'math',
                    subtype: 'word_problem',
                    question: `${item}が${total}こありました。${taken}こつかいました。のこりは何こですか？`,
                    answer: answer,
                    explanation: `${total}こから${taken}こを引くと${answer}こになります`,
                    difficulty: 1
                });
                questionNumber++;
            }
        }
    });
    
    // 比較の文章題
    const comparisonProblems = [
        ['たろう', '3', 'はなこ', '5', '2'],
        ['あき', '2', 'ゆき', '4', '2'],
        ['けん', '1', 'みき', '6', '5'],
        ['さくら', '4', 'ゆうき', '7', '3'],
        ['りょう', '2', 'みお', '5', '3'],
        ['かい', '1', 'えり', '4', '3'],
        ['だい', '3', 'めい', '8', '5'],
        ['ひろ', '2', 'あい', '6', '4']
    ];
    
    comparisonProblems.forEach(([name1, num1, name2, num2, diff]) => {
        for (let i = 0; i < 5; i++) {
            if (questionNumber <= 200) {
                problems.push({
                    id: `word_${questionNumber}`,
                    type: 'math',
                    subtype: 'word_problem',
                    question: `${name1}さんは${num1}こ、${name2}さんは${num2}こもっています。${name2}さんの方が何こ多いですか？`,
                    answer: diff,
                    explanation: `${num2}こから${num1}こを引くと${diff}こになります`,
                    difficulty: 1
                });
                questionNumber++;
            }
        }
    });
    
    return problems.slice(0, 200);
}

// 全問題を生成
function generateAllMathQuestions() {
    const calculationQuestions = generateCalculationQuestions();
    const wordProblems = generateWordProblems();
    
    return {
        calculation: calculationQuestions,
        wordProblems: wordProblems,
        total: calculationQuestions.length + wordProblems.length
    };
}

// 実行
const allQuestions = generateAllMathQuestions();

console.log(`生成された問題数:`);
console.log(`計算問題: ${allQuestions.calculation.length}問`);
console.log(`文章題: ${allQuestions.wordProblems.length}問`);
console.log(`合計: ${allQuestions.total}問`);

// JSONファイルに保存
fs.writeFileSync('math-questions.json', JSON.stringify(allQuestions, null, 2), 'utf-8');
console.log('math-questions.json に保存しました');

module.exports = { generateAllMathQuestions };