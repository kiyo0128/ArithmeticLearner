// 600問（算数400問+国語200問）をデータベースに保存するスクリプト

// 算数問題400問生成
function generateMathQuestions() {
    const questions = [];
    let questionNumber = 1;
    
    // 足し算問題 (1桁+1桁 = 10以下) - 100問
    for (let a = 1; a <= 9; a++) {
        for (let b = 1; b <= 9; b++) {
            if (a + b <= 10 && questionNumber <= 100) {
                questions.push({
                    id: `math_calc_${questionNumber}`,
                    type: 'math',
                    question: `${a} + ${b} = ?`,
                    answer: (a + b).toString(),
                    difficulty: 1
                });
                questionNumber++;
            }
        }
    }
    
    // 引き算問題 (結果0以上) - 100問
    for (let a = 1; a <= 10; a++) {
        for (let b = 1; b <= a; b++) {
            if (questionNumber <= 200) {
                questions.push({
                    id: `math_sub_${questionNumber}`,
                    type: 'math',
                    question: `${a} - ${b} = ?`,
                    answer: (a - b).toString(),
                    difficulty: 1
                });
                questionNumber++;
            }
        }
    }
    
    // 文章題 - 200問
    const wordProblems = [
        { template: 'あめが{a}こあります。{b}こたべました。のこりはなんこですか？', operation: 'subtract' },
        { template: 'りんごが{a}こあります。{b}こもらいました。ぜんぶでなんこですか？', operation: 'add' },
        { template: 'ねこが{a}ひきいます。{b}ひききました。ぜんぶでなんひきですか？', operation: 'add' },
        { template: 'ほんが{a}さつあります。{b}さつよみました。のこりはなんさつですか？', operation: 'subtract' },
        { template: 'えんぴつが{a}ぽんあります。{b}ぽんつかいました。のこりはなんぽんですか？', operation: 'subtract' },
        { template: 'はなが{a}ほんあります。{b}ほんもらいました。ぜんぶでなんほんですか？', operation: 'add' },
        { template: 'とりが{a}わいます。{b}わとんできました。ぜんぶでなんわですか？', operation: 'add' },
        { template: 'ぼーるが{a}こあります。{b}こつかいました。のこりはなんこですか？', operation: 'subtract' },
        { template: 'かーどが{a}まいあります。{b}まいもらいました。ぜんぶでなんまいですか？', operation: 'add' },
        { template: 'おもちゃが{a}こあります。{b}こしまいました。のこりはなんこですか？', operation: 'subtract' }
    ];
    
    for (let i = 0; i < 200 && questionNumber <= 400; i++) {
        const template = wordProblems[i % wordProblems.length];
        const a = Math.floor(Math.random() * 9) + 2;
        const b = template.operation === 'subtract' ? Math.floor(Math.random() * (a - 1)) + 1 : Math.floor(Math.random() * 8) + 1;
        const answer = template.operation === 'subtract' ? a - b : a + b;
        
        const question = template.template.replace('{a}', a).replace('{b}', b);
        
        questions.push({
            id: `math_word_${questionNumber}`,
            type: 'math',
            question: question,
            answer: answer.toString(),
            difficulty: 1
        });
        questionNumber++;
    }
    
    return questions;
}

// 国語問題200問生成
function generateLanguageQuestions() {
    const questions = [];
    let questionNumber = 1;
    
    // 1. カタカナ変換問題（50問）
    const katakanaWords = [
        ['いぬ', 'イヌ'], ['ねこ', 'ネコ'], ['うさぎ', 'ウサギ'], ['とり', 'トリ'], ['さかな', 'サカナ'],
        ['らいおん', 'ライオン'], ['ぞう', 'ゾウ'], ['きりん', 'キリン'], ['ぶた', 'ブタ'], ['うし', 'ウシ'],
        ['りんご', 'リンゴ'], ['ばなな', 'バナナ'], ['みかん', 'ミカン'], ['いちご', 'イチゴ'], ['ぶどう', 'ブドウ'],
        ['ぱん', 'パン'], ['けーき', 'ケーキ'], ['あいす', 'アイス'], ['じゅーす', 'ジュース'], ['みるく', 'ミルク'],
        ['ぼーる', 'ボール'], ['らじお', 'ラジオ'], ['てれび', 'テレビ'], ['でんわ', 'デンワ'], ['かめら', 'カメラ'],
        ['たくしー', 'タクシー'], ['ばす', 'バス'], ['でんしゃ', 'デンシャ'], ['ひこうき', 'ヒコウキ'], ['ふね', 'フネ'],
        ['つくえ', 'ツクエ'], ['いす', 'イス'], ['かばん', 'カバン'], ['ぺん', 'ペン'], ['のーと', 'ノート'],
        ['はさみ', 'ハサミ'], ['じょうぎ', 'ジョウギ'], ['けしごむ', 'ケシゴム'], ['くれよん', 'クレヨン'], ['ふで', 'フデ'],
        ['さら', 'サラ'], ['こっぷ', 'コップ'], ['すぷーん', 'スプーン'], ['ふぉーく', 'フォーク'], ['ないふ', 'ナイフ'],
        ['たおる', 'タオル'], ['せっけん', 'セッケン'], ['しゃんぷー', 'シャンプー'], ['はぶらし', 'ハブラシ'], ['くし', 'クシ']
    ];
    
    katakanaWords.forEach(([hiragana, katakana]) => {
        if (questionNumber <= 50) {
            questions.push({
                id: `lang_katakana_${questionNumber}`,
                type: 'language',
                question: `「${hiragana}」をカタカナで書くとどれですか？`,
                answer: katakana,
                choices: [katakana, 'アイウ', 'エオカ', 'キクケ', 'コサシ'],
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    // 2. 文字数問題（30問）
    const countWords = [
        ['ねこ', 2], ['いぬ', 2], ['うさぎ', 3], ['らいおん', 4], ['ぞう', 2],
        ['りんご', 3], ['ばなな', 3], ['いちご', 3], ['ぶどう', 3], ['みかん', 3],
        ['はな', 2], ['き', 1], ['やま', 2], ['うみ', 2], ['かわ', 2],
        ['そら', 2], ['つき', 2], ['ほし', 2], ['ひ', 1], ['ゆき', 2],
        ['みず', 2], ['いし', 2], ['つち', 2], ['かぜ', 2], ['あめ', 2],
        ['くも', 2], ['にじ', 2], ['あさ', 2], ['ひる', 2], ['よる', 2]
    ];
    
    countWords.forEach(([word, count]) => {
        if (questionNumber <= 80) {
            questions.push({
                id: `lang_count_${questionNumber}`,
                type: 'language',
                question: `「${word}」は何文字ですか？`,
                answer: count.toString(),
                choices: ['1', '2', '3', '4', '5'],
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    // 3. 反対語問題（40問）
    const opposites = [
        ['おおきい', 'ちいさい'], ['たかい', 'ひくい'], ['ながい', 'みじかい'], ['おもい', 'かるい'],
        ['あつい', 'つめたい'], ['はやい', 'おそい'], ['あかるい', 'くらい'], ['つよい', 'よわい'],
        ['あたらしい', 'ふるい'], ['きれい', 'きたない'], ['しずか', 'うるさい'], ['やすい', 'たかい'],
        ['ひろい', 'せまい'], ['かたい', 'やわらかい'], ['あまい', 'からい'], ['まえ', 'うしろ'],
        ['うえ', 'した'], ['みぎ', 'ひだり'], ['はじめ', 'おわり'], ['あさ', 'よる'],
        ['なつ', 'ふゆ'], ['あつい', 'さむい'], ['みじかい', 'ながい'], ['うるさい', 'しずか'],
        ['からい', 'あまい'], ['つめたい', 'あつい'], ['くらい', 'あかるい'], ['よわい', 'つよい'],
        ['きたない', 'きれい'], ['ふるい', 'あたらしい'], ['おそい', 'はやい'], ['かるい', 'おもい'],
        ['みじかい', 'ながい'], ['ひくい', 'たかい'], ['ちいさい', 'おおきい'], ['せまい', 'ひろい'],
        ['やわらかい', 'かたい'], ['した', 'うえ'], ['ひだり', 'みぎ'], ['おわり', 'はじめ']
    ];
    
    opposites.forEach(([word, opposite]) => {
        if (questionNumber <= 120) {
            questions.push({
                id: `lang_opposite_${questionNumber}`,
                type: 'language',
                question: `「${word}」の反対の意味の言葉はどれですか？`,
                answer: opposite,
                choices: [opposite, 'あかるい', 'はやい', 'おおきい', 'あたらしい'],
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    // 4. 助詞問題（80問）
    const particles = [
        ['わたし（　）がっこうへいきます', 'は'], ['ほん（　）よみます', 'を'], ['がっこう（　）べんきょうします', 'で'],
        ['おともだち（　）あそびます', 'と'], ['おうち（　）かえります', 'に'], ['ねこ（　）かわいいです', 'が'],
        ['えんぴつ（　）かきます', 'で'], ['りんご（　）たべます', 'を'], ['あした（　）えんそくです', 'は'],
        ['こうえん（　）いきます', 'に'], ['いぬ（　）はしります', 'が'], ['みず（　）のみます', 'を'],
        ['きょうしつ（　）います', 'に'], ['ぼーる（　）あそびます', 'で'], ['おかあさん（　）りょうりします', 'が'],
        ['てがみ（　）かきます', 'を'], ['がっこう（　）たのしいです', 'は'], ['ともだち（　）はなします', 'と'],
        ['ひるごはん（　）たべます', 'を'], ['よる（　）ねます', 'に'], ['あめ（　）ふります', 'が'],
        ['はな（　）きれいです', 'が'], ['でんしゃ（　）のります', 'に'], ['ばす（　）いきます', 'で'],
        ['かばん（　）もちます', 'を'], ['せんせい（　）ききます', 'に'], ['ともだち（　）てがみをかきます', 'に'],
        ['おかあさん（　）プレゼントをもらいます', 'に'], ['やま（　）のぼります', 'に'], ['うみ（　）およぎます', 'で'],
        ['ほん（　）つくえにおきます', 'を'], ['えんぴつ（　）つくえにあります', 'が'], ['ねこ（　）にわにいます', 'が'],
        ['いぬ（　）こうえんではしります', 'が'], ['とり（　）そらをとびます', 'が'], ['さかな（　）うみにいます', 'が'],
        ['はな（　）にわにさきます', 'が'], ['き（　）やまにあります', 'が'], ['つき（　）そらにでます', 'が'],
        ['ほし（　）よるにひかります', 'が'], ['ひ（　）あさにでます', 'が'], ['くも（　）そらにあります', 'が'],
        ['あめ（　）そらからふります', 'が'], ['ゆき（　）ふゆにふります', 'が'], ['はな（　）はるにさきます', 'が'],
        ['みどり（　）なつにきれいです', 'が'], ['もみじ（　）あきにきれいです', 'が'], ['おかあさん（　）やさしいです', 'が'],
        ['おとうさん（　）つよいです', 'が'], ['せんせい（　）しんせつです', 'が'], ['ともだち（　）たのしいです', 'が'],
        ['あか（　）きれいないろです', 'は'], ['みどり（　）すきないろです', 'が'], ['きいろ（　）あかるいいろです', 'は'],
        ['あお（　）うみのいろです', 'は'], ['しろ（　）ゆきのいろです', 'は'], ['くろ（　）よるのいろです', 'は'],
        ['みかん（　）あまいです', 'が'], ['りんご（　）おいしいです', 'が'], ['ばなな（　）きいろいです', 'が'],
        ['いちご（　）あかいです', 'が'], ['ぶどう（　）むらさきです', 'が'], ['やさい（　）からだにいいです', 'は'],
        ['くだもの（　）あまいです', 'が'], ['ぎゅうにゅう（　）のみます', 'を'], ['おちゃ（　）のみます', 'を'],
        ['みず（　）つめたいです', 'が'], ['おゆ（　）あついです', 'が'], ['こおり（　）つめたいです', 'が'],
        ['ひ（　）あついです', 'が'], ['かぜ（　）すずしいです', 'が'], ['ゆき（　）しろいです', 'が'],
        ['あめ（　）つめたいです', 'が'], ['くも（　）しろいです', 'が'], ['にじ（　）きれいです', 'が'],
        ['つき（　）まるいです', 'が'], ['ほし（　）ひかります', 'が'], ['そら（　）あおいです', 'が'],
        ['やま（　）たかいです', 'が'], ['うみ（　）ひろいです', 'が'], ['かわ（　）ながいです', 'が'],
        ['みち（　）ひろいです', 'が'], ['はし（　）ながいです', 'が'], ['き（　）たかいです', 'が']
    ];
    
    particles.forEach(([sentence, answer]) => {
        if (questionNumber <= 200) {
            questions.push({
                id: `lang_particle_${questionNumber}`,
                type: 'language',
                question: `${sentence}の（　）に入る言葉はどれですか？`,
                answer: answer,
                choices: ['は', 'が', 'を', 'に', 'で'],
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    return questions;
}

// 問題を生成
const allMathQuestions = generateMathQuestions();
const allLanguageQuestions = generateLanguageQuestions();

console.log('📚 600問データベース保存システム');
console.log(`算数問題: ${allMathQuestions.length}問`);
console.log(`国語問題: ${allLanguageQuestions.length}問`);
console.log(`合計: ${allMathQuestions.length + allLanguageQuestions.length}問`);

// データベースに保存する関数
async function saveQuestionToDatabase(question) {
    try {
        const response = await fetch('http://localhost:3000/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question)
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`保存エラー (${question.id}):`, error.message);
        return null;
    }
}

// 全問題を保存
async function saveAllQuestions() {
    console.log('\n🔄 データベース保存開始...');
    
    let savedCount = 0;
    let errorCount = 0;
    
    // 算数問題を保存
    console.log('📐 算数問題を保存中...');
    for (let i = 0; i < allMathQuestions.length; i++) {
        const question = allMathQuestions[i];
        const result = await saveQuestionToDatabase(question);
        
        if (result) {
            savedCount++;
            if (savedCount % 50 === 0) {
                console.log(`✅ ${savedCount}問保存完了...`);
            }
        } else {
            errorCount++;
        }
        
        // レート制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // 国語問題を保存
    console.log('📖 国語問題を保存中...');
    for (let i = 0; i < allLanguageQuestions.length; i++) {
        const question = allLanguageQuestions[i];
        const result = await saveQuestionToDatabase(question);
        
        if (result) {
            savedCount++;
            if (savedCount % 50 === 0) {
                console.log(`✅ ${savedCount}問保存完了...`);
            }
        } else {
            errorCount++;
        }
        
        // レート制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log('\n🎉 保存完了！');
    console.log(`✅ 保存成功: ${savedCount}問`);
    console.log(`❌ 保存失敗: ${errorCount}問`);
    console.log(`📊 合計: ${savedCount + errorCount}問`);
}

// Node.js環境で実行
if (typeof window === 'undefined') {
    (async () => {
        const fetch = (await import('node-fetch')).default;
        global.fetch = fetch;
        
        await saveAllQuestions();
    })().catch(console.error);
}