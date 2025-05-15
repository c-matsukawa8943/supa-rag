/**
 * Google Gemini AI APIクライアント設定
 * 
 * このファイルではGoogle Gemini生成AIモデルへの接続を設定します。
 * テキスト生成用とベクトル埋め込み用の二つのモデルを提供します。
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

// 環境変数からGemini APIキーを取得（設定がない場合は空文字列）
const apiKey = process.env.GEMINI_API_KEY || '';
// Gemini APIクライアントインスタンスを初期化
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * テキスト生成モデルを取得する関数
 * gemini-2.0-flash-liteモデルを使用し、温度パラメータを低く設定して
 * より決定論的な（一貫性のある）出力を得られるようにしています
 */
// 温度を低く設定したモデルを使用
export const getModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
};

/**
 * ベクトル埋め込みモデルを取得する関数
 * PDFテキストをベクトル化するために使用します
 * embedding-001はテキストのセマンティックな意味を捉えた埋め込みベクトルを生成します
 */
// エンベディングモデル
export const getEmbeddingModel = () => {
  return genAI.getGenerativeModel({ model: 'embedding-001' });
};