import { db } from './server/db';
import { questions } from './shared/schema';
import { eq } from 'drizzle-orm';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    const mathQuestions = await db.select().from(questions).where(eq(questions.type, 'math'));
    console.log('Math questions count:', mathQuestions.length);
    
    const langQuestions = await db.select().from(questions).where(eq(questions.type, 'language'));
    console.log('Language questions count:', langQuestions.length);
    
    if (mathQuestions.length > 0) {
      console.log('Sample math question:', mathQuestions[0]);
    }
    
    if (langQuestions.length > 0) {
      console.log('Sample language question:', langQuestions[0]);
    }
    
    console.log('Total questions:', mathQuestions.length + langQuestions.length);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testDatabase();