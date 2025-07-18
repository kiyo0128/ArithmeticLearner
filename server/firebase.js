"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFirestore = exports.COLLECTIONS = exports.firebase = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const path = __importStar(require("path"));
// Firebase Admin SDKの初期化
let firebaseApp;
if ((0, app_1.getApps)().length === 0) {
    // サービスアカウントキーファイルのパス
    const serviceAccountPath = path.join(__dirname, '../arithmetic-learner-firebase-adminsdk-fbsvc-eba1e3e3d6.json');
    try {
        firebaseApp = (0, app_1.initializeApp)({
            credential: (0, app_1.cert)(serviceAccountPath),
        });
        console.log('✅ Firebase Admin SDK initialized successfully');
    }
    catch (error) {
        console.error('❌ Firebase initialization error:', error);
        throw new Error('Firebase initialization failed');
    }
}
else {
    firebaseApp = (0, app_1.getApps)()[0];
}
// Firestoreインスタンスの作成
exports.db = (0, firestore_1.getFirestore)(firebaseApp);
exports.firebase = firebaseApp;
// Firestoreのコレクション名定義
exports.COLLECTIONS = {
    USERS: 'users',
    QUESTIONS: 'questions',
    ANSWERS: 'answers',
    REWARDS: 'rewards',
};
// Firestoreの設定
const initializeFirestore = () => {
    // Firestoreの設定（必要に応じて）
    exports.db.settings({
        ignoreUndefinedProperties: true,
    });
    console.log('✅ Firebase Firestore initialized successfully');
    return exports.db;
};
exports.initializeFirestore = initializeFirestore;
exports.default = exports.db;
