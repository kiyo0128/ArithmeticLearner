// 国語問題生成スクリプト - 小学1年生レベル（学習指導要領準拠）
// 様々なタイプの問題200問を生成

const fs = require('fs');

// 小学1年生国語問題を生成
function generateJapaneseQuestions() {
    const questions = [];
    let questionNumber = 1;
    
    // 1. ひらがな読み問題（30問）
    const hiraganaReadings = [
        ['あさ', 'あした', 'あす', 'あせ', 'あめ'],
        ['いぬ', 'いえ', 'いす', 'いと', 'いし'],
        ['うみ', 'うし', 'うた', 'うま', 'うで'],
        ['えき', 'えん', 'えび', 'えだ', 'えほん'],
        ['おに', 'おと', 'おか', 'おはな', 'おやま'],
        ['かお', 'かみ', 'かさ', 'かぜ', 'かめ'],
        ['きつね', 'きのこ', 'きって', 'きもの', 'きいろ'],
        ['くも', 'くつ', 'くち', 'くび', 'くるま'],
        ['けむり', 'けしき', 'けいと', 'けんか', 'けんこう'],
        ['こえ', 'こころ', 'こども', 'こおり', 'こばと']
    ];
    
    hiraganaReadings.forEach((words, index) => {
        words.forEach(word => {
            if (questionNumber <= 30) {
                const wrongChoices = generateWrongChoices(word);
                questions.push({
                    id: `jp_hiragana_${questionNumber}`,
                    type: 'language',
                    question: `「${word}」の読み方はどれですか？`,
                    answer: word,
                    choices: [word, ...wrongChoices],
                    explanation: `「${word}」はひらがなで「${word}」と読みます`,
                    difficulty: 1
                });
                questionNumber++;
            }
        });
    });
    
    // 2. カタカナ変換問題（30問）
    const katakanaConversions = [
        ['いぬ', 'イヌ'], ['ねこ', 'ネコ'], ['うさぎ', 'ウサギ'], ['とり', 'トリ'], ['さかな', 'サカナ'],
        ['らいおん', 'ライオン'], ['ぞう', 'ゾウ'], ['きりん', 'キリン'], ['ぶた', 'ブタ'], ['うし', 'ウシ'],
        ['りんご', 'リンゴ'], ['ばなな', 'バナナ'], ['みかん', 'ミカン'], ['いちご', 'イチゴ'], ['ぶどう', 'ブドウ'],
        ['ぱん', 'パン'], ['けーき', 'ケーキ'], ['あいす', 'アイス'], ['じゅーす', 'ジュース'], ['みるく', 'ミルク'],
        ['ぼーる', 'ボール'], ['らじお', 'ラジオ'], ['てれび', 'テレビ'], ['でんわ', 'デンワ'], ['かめら', 'カメラ'],
        ['たくしー', 'タクシー'], ['ばす', 'バス'], ['でんしゃ', 'デンシャ'], ['ひこうき', 'ヒコウキ'], ['しっぷ', 'シップ']
    ];
    
    katakanaConversions.forEach(([hiragana, katakana]) => {
        if (questionNumber <= 60) {
            const wrongChoices = generateWrongKatakanaChoices(katakana);
            questions.push({
                id: `jp_katakana_${questionNumber}`,
                type: 'language',
                question: `「${hiragana}」をカタカナで書くとどれですか？`,
                answer: katakana,
                choices: [katakana, ...wrongChoices],
                explanation: `「${hiragana}」はカタカナで「${katakana}」と書きます`,
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    // 3. 文字数問題（20問）
    const wordCounts = [
        ['ねこ', 2], ['いぬ', 2], ['うさぎ', 3], ['らいおん', 4], ['ぞう', 2],
        ['りんご', 3], ['ばなな', 3], ['いちご', 3], ['ぶどう', 3], ['みかん', 3],
        ['はな', 2], ['き', 1], ['やま', 2], ['うみ', 2], ['かわ', 2],
        ['そら', 2], ['つき', 2], ['ほし', 2], ['ひ', 1], ['ゆき', 2]
    ];
    
    wordCounts.forEach(([word, count]) => {
        if (questionNumber <= 80) {
            const wrongChoices = generateCountChoices(count);
            questions.push({
                id: `jp_count_${questionNumber}`,
                type: 'language',
                question: `「${word}」は何文字ですか？`,
                answer: count.toString(),
                choices: [count.toString(), ...wrongChoices],
                explanation: `「${word}」は${count}文字です`,
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    // 4. 反対語問題（20問）
    const opposites = [
        ['おおきい', 'ちいさい'], ['たかい', 'ひくい'], ['ながい', 'みじかい'], ['おもい', 'かるい'],
        ['あつい', 'つめたい'], ['はやい', 'おそい'], ['あかるい', 'くらい'], ['つよい', 'よわい'],
        ['あたらしい', 'ふるい'], ['きれい', 'きたない'], ['しずか', 'うるさい'], ['やすい', 'たかい'],
        ['ひろい', 'せまい'], ['かたい', 'やわらかい'], ['あまい', 'からい'], ['まえ', 'うしろ'],
        ['うえ', 'した'], ['みぎ', 'ひだり'], ['はじめ', 'おわり'], ['あさ', 'よる']
    ];
    
    opposites.forEach(([word, opposite]) => {
        if (questionNumber <= 100) {
            const wrongChoices = generateOppositeChoices(opposite);
            questions.push({
                id: `jp_opposite_${questionNumber}`,
                type: 'language',
                question: `「${word}」の反対の意味の言葉はどれですか？`,
                answer: opposite,
                choices: [opposite, ...wrongChoices],
                explanation: `「${word}」の反対は「${opposite}」です`,
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    // 5. 同じ音の言葉問題（20問）
    const sameSound = [
        ['かき', ['がき', 'かぎ', 'かし', 'かけ']],
        ['はし', ['ばし', 'はじ', 'はぜ', 'はそ']],
        ['ねこ', ['べこ', 'ねご', 'ねろ', 'ねの']],
        ['そら', ['とら', 'そば', 'そが', 'そま']],
        ['いけ', ['うけ', 'いげ', 'いね', 'いで']],
        ['みず', ['にず', 'みじ', 'みぞ', 'みづ']],
        ['はな', ['ばな', 'はま', 'はが', 'はだ']],
        ['やま', ['ばま', 'やば', 'やが', 'やだ']],
        ['とり', ['どり', 'とぎ', 'とび', 'とじ']],
        ['かぜ', ['がぜ', 'かべ', 'かで', 'かめ']],
        ['ゆき', ['つき', 'ゆぎ', 'ゆび', 'ゆじ']],
        ['みち', ['にち', 'みぢ', 'みし', 'みび']],
        ['くも', ['ぐも', 'くぼ', 'くご', 'くど']],
        ['ひと', ['びと', 'ひど', 'ひご', 'ひぞ']],
        ['もり', ['ぼり', 'もぎ', 'もび', 'もじ']],
        ['きつね', ['ぎつね', 'きづね', 'きすね', 'きつめ']],
        ['うみ', ['うび', 'うぎ', 'うじ', 'うに']],
        ['つき', ['づき', 'つぎ', 'つび', 'つじ']],
        ['かみ', ['がみ', 'かび', 'かぎ', 'かじ']],
        ['ほし', ['ぼし', 'ほじ', 'ほぎ', 'ほび']]
    ];
    
    sameSound.forEach(([word, choices]) => {
        if (questionNumber <= 120) {
            questions.push({
                id: `jp_sound_${questionNumber}`,
                type: 'language',
                question: `「${word}」と同じ音で始まる言葉はどれですか？`,
                answer: choices[0],
                choices: [choices[0], ...choices.slice(1)],
                explanation: `「${word}」と「${choices[0]}」は同じ音で始まります`,
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    // 6. 擬音語・擬態語問題（20問）
    const onomatopoeia = [
        ['いぬの鳴き声', 'わんわん', ['にゃんにゃん', 'もーもー', 'ぴーぴー', 'こけこっこー']],
        ['ねこの鳴き声', 'にゃんにゃん', ['わんわん', 'もーもー', 'ぴーぴー', 'こけこっこー']],
        ['うしの鳴き声', 'もーもー', ['わんわん', 'にゃんにゃん', 'ぴーぴー', 'こけこっこー']],
        ['とりの鳴き声', 'ぴーぴー', ['わんわん', 'にゃんにゃん', 'もーもー', 'こけこっこー']],
        ['にわとりの鳴き声', 'こけこっこー', ['わんわん', 'にゃんにゃん', 'もーもー', 'ぴーぴー']],
        ['雨の音', 'ぱらぱら', ['どんどん', 'ぺらぺら', 'がらがら', 'ころころ']],
        ['太鼓の音', 'どんどん', ['ぱらぱら', 'ぺらぺら', 'がらがら', 'ころころ']],
        ['紙の音', 'ぺらぺら', ['ぱらぱら', 'どんどん', 'がらがら', 'ころころ']],
        ['石の音', 'がらがら', ['ぱらぱら', 'どんどん', 'ぺらぺら', 'ころころ']],
        ['玉の音', 'ころころ', ['ぱらぱら', 'どんどん', 'ぺらぺら', 'がらがら']],
        ['きらきら光る', 'きらきら', ['ぴかぴか', 'ぶるぶる', 'ぐるぐる', 'ふわふわ']],
        ['ぴかぴか光る', 'ぴかぴか', ['きらきら', 'ぶるぶる', 'ぐるぐる', 'ふわふわ']],
        ['寒くて震える', 'ぶるぶる', ['きらきら', 'ぴかぴか', 'ぐるぐる', 'ふわふわ']],
        ['回転する', 'ぐるぐる', ['きらきら', 'ぴかぴか', 'ぶるぶる', 'ふわふわ']],
        ['やわらかい', 'ふわふわ', ['きらきら', 'ぴかぴか', 'ぶるぶる', 'ぐるぐる']],
        ['歩く音', 'とことこ', ['ぺたぺた', 'ぱたぱた', 'てくてく', 'ごとごと']],
        ['足音', 'ぺたぺた', ['とことこ', 'ぱたぱた', 'てくてく', 'ごとごと']],
        ['羽音', 'ぱたぱた', ['とことこ', 'ぺたぺた', 'てくてく', 'ごとごと']],
        ['散歩する', 'てくてく', ['とことこ', 'ぺたぺた', 'ぱたぱた', 'ごとごと']],
        ['電車の音', 'ごとごと', ['とことこ', 'ぺたぺた', 'ぱたぱた', 'てくてく']]
    ];
    
    onomatopoeia.forEach(([description, answer, choices]) => {
        if (questionNumber <= 140) {
            questions.push({
                id: `jp_onomatopoeia_${questionNumber}`,
                type: 'language',
                question: `${description}を表す言葉はどれですか？`,
                answer: answer,
                choices: [answer, ...choices],
                explanation: `${description}は「${answer}」と表現します`,
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    // 7. 季節の言葉問題（20問）
    const seasons = [
        ['春', 'はる', ['あき', 'なつ', 'ふゆ', 'ゆき']],
        ['夏', 'なつ', ['はる', 'あき', 'ふゆ', 'ゆき']],
        ['秋', 'あき', ['はる', 'なつ', 'ふゆ', 'ゆき']],
        ['冬', 'ふゆ', ['はる', 'なつ', 'あき', 'ゆき']],
        ['桜', 'さくら', ['もみじ', 'ゆき', 'うみ', 'やま']],
        ['雪', 'ゆき', ['はな', 'みず', 'ひ', 'つき']],
        ['花', 'はな', ['き', 'くさ', 'いし', 'つち']],
        ['葉', 'は', ['え', 'み', 'ね', 'き']],
        ['風', 'かぜ', ['あめ', 'ひ', 'くも', 'そら']],
        ['雨', 'あめ', ['かぜ', 'ひ', 'くも', 'そら']],
        ['太陽', 'たいよう', ['つき', 'ほし', 'そら', 'くも']],
        ['月', 'つき', ['ひ', 'ほし', 'そら', 'くも']],
        ['星', 'ほし', ['つき', 'ひ', 'そら', 'くも']],
        ['空', 'そら', ['うみ', 'やま', 'かわ', 'もり']],
        ['海', 'うみ', ['そら', 'やま', 'かわ', 'もり']],
        ['山', 'やま', ['うみ', 'そら', 'かわ', 'もり']],
        ['川', 'かわ', ['うみ', 'やま', 'そら', 'もり']],
        ['森', 'もり', ['うみ', 'やま', 'かわ', 'そら']],
        ['虫', 'むし', ['とり', 'さかな', 'はな', 'き']],
        ['鳥', 'とり', ['むし', 'さかな', 'はな', 'き']]
    ];
    
    seasons.forEach(([kanji, hiragana, choices]) => {
        if (questionNumber <= 160) {
            questions.push({
                id: `jp_season_${questionNumber}`,
                type: 'language',
                question: `「${kanji}」の読み方はどれですか？`,
                answer: hiragana,
                choices: [hiragana, ...choices],
                explanation: `「${kanji}」は「${hiragana}」と読みます`,
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    // 8. 単語の分類問題（20問）
    const categories = [
        ['動物', 'いぬ', ['りんご', 'ほん', 'くつ', 'はな']],
        ['動物', 'ねこ', ['みかん', 'えんぴつ', 'ぼうし', 'き']],
        ['食べ物', 'りんご', ['いぬ', 'ほん', 'くつ', 'はな']],
        ['食べ物', 'ばなな', ['ねこ', 'えんぴつ', 'ぼうし', 'き']],
        ['乗り物', 'でんしゃ', ['いぬ', 'りんご', 'ほん', 'はな']],
        ['乗り物', 'ひこうき', ['ねこ', 'みかん', 'えんぴつ', 'き']],
        ['身体', 'あたま', ['いぬ', 'りんご', 'ほん', 'はな']],
        ['身体', 'て', ['ねこ', 'みかん', 'えんぴつ', 'き']],
        ['色', 'あか', ['いぬ', 'りんご', 'ほん', 'はな']],
        ['色', 'あお', ['ねこ', 'みかん', 'えんぴつ', 'き']],
        ['家族', 'おかあさん', ['いぬ', 'りんご', 'ほん', 'はな']],
        ['家族', 'おとうさん', ['ねこ', 'みかん', 'えんぴつ', 'き']],
        ['学校', 'せんせい', ['いぬ', 'りんご', 'ほん', 'はな']],
        ['学校', 'きょうしつ', ['ねこ', 'みかん', 'えんぴつ', 'き']],
        ['遊び', 'ぼーる', ['いぬ', 'りんご', 'ほん', 'はな']],
        ['遊び', 'おもちゃ', ['ねこ', 'みかん', 'えんぴつ', 'き']],
        ['天気', 'はれ', ['いぬ', 'りんご', 'ほん', 'はな']],
        ['天気', 'あめ', ['ねこ', 'みかん', 'えんぴつ', 'き']],
        ['植物', 'はな', ['いぬ', 'りんご', 'ほん', 'くつ']],
        ['植物', 'き', ['ねこ', 'みかん', 'えんぴつ', 'ぼうし']]
    ];
    
    categories.forEach(([category, answer, choices]) => {
        if (questionNumber <= 180) {
            questions.push({
                id: `jp_category_${questionNumber}`,
                type: 'language',
                question: `${category}の仲間はどれですか？`,
                answer: answer,
                choices: [answer, ...choices],
                explanation: `「${answer}」は${category}の仲間です`,
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    // 9. 助詞問題（20問）
    const particles = [
        ['わたし（　）がっこうへいきます', 'は', ['が', 'を', 'に', 'で']],
        ['ほん（　）よみます', 'を', ['は', 'が', 'に', 'で']],
        ['がっこう（　）べんきょうします', 'で', ['は', 'が', 'を', 'に']],
        ['おともだち（　）あそびます', 'と', ['は', 'が', 'を', 'に']],
        ['おうち（　）かえります', 'に', ['は', 'が', 'を', 'で']],
        ['ねこ（　）かわいいです', 'が', ['は', 'を', 'に', 'で']],
        ['えんぴつ（　）かきます', 'で', ['は', 'が', 'を', 'に']],
        ['りんご（　）たべます', 'を', ['は', 'が', 'に', 'で']],
        ['あした（　）えんそくです', 'は', ['が', 'を', 'に', 'で']],
        ['こうえん（　）いきます', 'に', ['は', 'が', 'を', 'で']],
        ['いぬ（　）はしります', 'が', ['は', 'を', 'に', 'で']],
        ['みず（　）のみます', 'を', ['は', 'が', 'に', 'で']],
        ['きょうしつ（　）います', 'に', ['は', 'が', 'を', 'で']],
        ['ぼーる（　）あそびます', 'で', ['は', 'が', 'を', 'に']],
        ['おかあさん（　）りょうりします', 'が', ['は', 'を', 'に', 'で']],
        ['てがみ（　）かきます', 'を', ['は', 'が', 'に', 'で']],
        ['がっこう（　）たのしいです', 'は', ['が', 'を', 'に', 'で']],
        ['ともだち（　）はなします', 'と', ['は', 'が', 'を', 'に']],
        ['ひるごはん（　）たべます', 'を', ['は', 'が', 'に', 'で']],
        ['よる（　）ねます', 'に', ['は', 'が', 'を', 'で']]
    ];
    
    particles.forEach(([sentence, answer, choices]) => {
        if (questionNumber <= 200) {
            questions.push({
                id: `jp_particle_${questionNumber}`,
                type: 'language',
                question: `${sentence}の（　）に入る言葉はどれですか？`,
                answer: answer,
                choices: [answer, ...choices],
                explanation: `この文では「${answer}」が正しい助詞です`,
                difficulty: 1
            });
            questionNumber++;
        }
    });
    
    return questions.slice(0, 200);
}

// 間違い選択肢生成関数
function generateWrongChoices(correctWord) {
    const allWords = ['あさ', 'いぬ', 'うみ', 'えき', 'おに', 'かお', 'きつね', 'くも', 'けむり', 'こえ'];
    const filtered = allWords.filter(word => word !== correctWord);
    return shuffleArray(filtered).slice(0, 4);
}

function generateWrongKatakanaChoices(correctKatakana) {
    const chars = correctKatakana.split('');
    const wrongChoices = [];
    
    for (let i = 0; i < 4; i++) {
        let wrongChoice = '';
        for (let j = 0; j < chars.length; j++) {
            if (Math.random() < 0.3) {
                // 文字を少し変更
                const similarChars = getSimilarKatakana(chars[j]);
                wrongChoice += similarChars[Math.floor(Math.random() * similarChars.length)];
            } else {
                wrongChoice += chars[j];
            }
        }
        if (wrongChoice !== correctKatakana) {
            wrongChoices.push(wrongChoice);
        }
    }
    
    return wrongChoices;
}

function getSimilarKatakana(char) {
    const similar = {
        'イ': ['ニ', 'リ', 'ル', 'レ'],
        'ウ': ['ワ', 'ヲ', 'ユ', 'ヨ'],
        'ネ': ['ヌ', 'ノ', 'メ', 'ヘ'],
        'コ': ['ロ', 'ゴ', 'ポ', 'モ'],
        'ト': ['ド', 'ナ', 'ハ', 'バ'],
        'ン': ['ソ', 'ツ', 'シ', 'ス']
    };
    return similar[char] || ['ア', 'カ', 'サ', 'タ'];
}

function generateCountChoices(correctCount) {
    const choices = [];
    for (let i = 1; i <= 5; i++) {
        if (i !== correctCount) {
            choices.push(i.toString());
        }
    }
    return choices.slice(0, 4);
}

function generateOppositeChoices(correctOpposite) {
    const oppositeWords = ['ちいさい', 'ひくい', 'みじかい', 'かるい', 'つめたい', 'おそい', 'くらい', 'よわい'];
    const filtered = oppositeWords.filter(word => word !== correctOpposite);
    return shuffleArray(filtered).slice(0, 4);
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 実行
const japaneseQuestions = generateJapaneseQuestions();

console.log(`生成された国語問題数: ${japaneseQuestions.length}問`);
console.log(`問題タイプ:`);
console.log(`- ひらがな読み: 30問`);
console.log(`- カタカナ変換: 30問`);
console.log(`- 文字数: 20問`);
console.log(`- 反対語: 20問`);
console.log(`- 同じ音: 20問`);
console.log(`- 擬音語・擬態語: 20問`);
console.log(`- 季節の言葉: 20問`);
console.log(`- 単語の分類: 20問`);
console.log(`- 助詞: 20問`);

// JSONファイルに保存
fs.writeFileSync('japanese-questions.json', JSON.stringify(japaneseQuestions, null, 2), 'utf-8');
console.log('japanese-questions.json に保存しました');

module.exports = { generateJapaneseQuestions };