const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAIIntegration() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    // Test math question generation
    const mathModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const mathResult = await mathModel.generateContent(`小学1年生向けの算数問題を1つ生成してください。足し算で答えが10以下。JSON形式で{"question": "問題文", "answer": "答え", "explanation": "解説"}`);
    const mathText = mathResult.response.text();
    const mathJson = mathText.match(/\{[\s\S]*\}/);
    if (mathJson) {
      const mathData = JSON.parse(mathJson[0]);
      console.log('✓ Math Question Generated:');
      console.log('  Question:', mathData.question);
      console.log('  Answer:', mathData.answer);
      console.log('  Explanation:', mathData.explanation);
    }
    
    // Test language question generation
    const langModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const langResult = await langModel.generateContent(`小学1年生向けの国語問題を1つ生成してください。ひらがな・カタカナのみ。JSON形式で{"question": "問題文", "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4", "選択肢5"], "correctAnswer": "正解", "explanation": "解説"}`);
    const langText = langResult.response.text();
    const langJson = langText.match(/\{[\s\S]*\}/);
    if (langJson) {
      const langData = JSON.parse(langJson[0]);
      console.log('✓ Language Question Generated:');
      console.log('  Question:', langData.question);
      console.log('  Choices:', langData.choices);
      console.log('  Correct Answer:', langData.correctAnswer);
      console.log('  Explanation:', langData.explanation);
    }
    
    console.log('✓ AI Integration Test Successful');
    
  } catch (error) {
    console.error('✗ AI Integration Test Failed:', error.message);
  }
}

testAIIntegration();