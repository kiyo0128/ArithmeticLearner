import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Firebase Admin SDKの初期化
let firebaseApp;
if (getApps().length === 0) {
  // サービスアカウントキーファイルのパス
  const serviceAccountPath = path.join(__dirname, '../arithmetic-learner-firebase-adminsdk-fbsvc-eba1e3e3d6.json');
  
  try {
    firebaseApp = initializeApp({
      credential: cert(serviceAccountPath),
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw new Error('Firebase initialization failed');
  }
} else {
  firebaseApp = getApps()[0];
}

// Firestoreインスタンスの作成
export const db = getFirestore(firebaseApp);
export const firebase = firebaseApp;

// Firestoreのコレクション名定義
export const COLLECTIONS = {
  USERS: 'users',
  QUESTIONS: 'questions',
  ANSWERS: 'answers',
  REWARDS: 'rewards',
} as const;

// Firestoreの設定
export const initializeFirestore = () => {
  // Firestoreの設定（必要に応じて）
  db.settings({
    ignoreUndefinedProperties: true,
  });
  
  console.log('✅ Firebase Firestore initialized successfully');
  return db;
};

export default db; 