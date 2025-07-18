# Firebase設定手順

## 1. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを作成」をクリック
3. プロジェクト名を入力（例：`arithmetic-learner`）
4. Firestoreデータベースを作成

## 2. Firestoreデータベースの設定

1. Firebase Console > Firestore Database
2. 「データベースを作成」をクリック
3. セキュリティルールの設定：
   - 開発用：`テストモード`を選択
   - 本番用：下記のルールを設定

### セキュリティルール（本番用）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Questions collection - 読み取り専用
    match /questions/{questionId} {
      allow read: if true;
      allow write: if false; // 管理者のみ書き込み可能
    }
    
    // Answers collection
    match /answers/{answerId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Rewards collection - 読み取り専用
    match /rewards/{rewardId} {
      allow read: if true;
      allow write: if false; // 管理者のみ書き込み可能
    }
  }
}
```

## 3. サービスアカウントキーの取得

1. Firebase Console > プロジェクトの設定（歯車マーク）
2. 「サービスアカウント」タブをクリック
3. 「新しい秘密鍵を生成」をクリック
4. JSONファイルをダウンロード

## 4. 環境変数の設定

`.env`ファイルを作成して以下の内容を設定：

```bash
# Firebase設定
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "your-client-email@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-client-email%40your-project-id.iam.gserviceaccount.com"
}'

# 旧PostgreSQL設定（バックアップ用）
DATABASE_URL=your-neon-database-url

# Gemini AI設定
GEMINI_API_KEY=your-gemini-api-key
```

## 5. データ移行の実行

PostgreSQLからFirestoreへデータを移行：

```bash
# TypeScriptファイルをコンパイル
npx tsc migrate-to-firebase.ts

# 移行スクリプトを実行
node migrate-to-firebase.js
```

## 6. アプリケーションの起動

```bash
# サーバーを起動
npm start
```

## 7. 移行確認

1. Firebase Console > Firestore Database
2. 以下のコレクションが作成されていることを確認：
   - `users` - ユーザー情報
   - `questions` - 算数・国語問題（500問）
   - `answers` - 回答履歴
   - `rewards` - 報酬システム

## トラブルシューティング

### 認証エラー

```
Error: Firebase service account key parsing error
```

- `FIREBASE_SERVICE_ACCOUNT_KEY`のJSONフォーマットが正しいか確認
- エスケープ文字が正しく設定されているか確認

### データベース接続エラー

```
Error: The default Firebase app does not exist.
```

- `FIREBASE_PROJECT_ID`が設定されているか確認
- Firebase プロジェクトがアクティブかチェック

### 権限エラー

```
Error: 7 PERMISSION_DENIED: Missing or insufficient permissions.
```

- Firestoreセキュリティルールを確認
- サービスアカウントの権限を確認

## 参考リンク

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started) 