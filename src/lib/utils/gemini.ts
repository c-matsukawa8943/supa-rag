import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// 温度を低く設定したモデルを使用
export const getModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
};

// エンベディングモデル
export const getEmbeddingModel = () => {
  return genAI.getGenerativeModel({ model: 'embedding-001' });
};