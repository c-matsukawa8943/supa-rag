import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const getModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-pro' });
}; 