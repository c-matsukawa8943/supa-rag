declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(options: { model: string }): GenerativeModel;
  }

  export interface GenerativeModel {
    generateContent(prompt: string): Promise<GenerateContentResponse>;
    embedContent(text: string): Promise<EmbedContentResponse>;
  }

  export interface GenerateContentResponse {
    response: {
      text(): string;
    };
  }

  export interface EmbedContentResponse {
    embedding: {
      values: number[];
    };
  }
} 