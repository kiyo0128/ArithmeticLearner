
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { users, questions, answers, rewards, sessions } from './shared/schema';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

async function migrate() {
  try {
    console.log('Creating tables...');
    
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        total_score INTEGER DEFAULT 0,
        math_score INTEGER DEFAULT 0,
        language_score INTEGER DEFAULT 0,
        current_rank VARCHAR DEFAULT 'bronze',
        rewards JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create questions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR PRIMARY KEY,
        type VARCHAR NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        choices JSONB,
        difficulty INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create answers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS answers (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        question_id VARCHAR NOT NULL,
        user_answer TEXT NOT NULL,
        is_correct BOOLEAN NOT NULL,
        answered_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create rewards table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS rewards (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        description TEXT NOT NULL,
        required_score INTEGER NOT NULL,
        rank VARCHAR NOT NULL,
        icon VARCHAR
      )
    `);
    
    // Create sessions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    
    // Insert default rewards
    await db.execute(`
      INSERT INTO rewards (id, name, description, required_score, rank, icon)
      VALUES 
        ('1', '初心者バッジ', '最初の問題に正解！', 1, 'bronze', '🎯'),
        ('2', '算数マスター', '算数問題を10問正解！', 10, 'bronze', '🔢'),
        ('3', '国語エキスパート', '国語問題を15問正解！', 15, 'silver', '📚'),
        ('4', '継続は力なり', '連続して25問正解！', 25, 'silver', '💪'),
        ('5', '知識の泉', '総合スコア100達成！', 100, 'gold', '⭐'),
        ('6', '学習王', '総合スコア300達成！', 300, 'platinum', '👑'),
        ('7', '完璧主義者', '総合スコア500達成！', 500, 'diamond', '💎')
      ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
