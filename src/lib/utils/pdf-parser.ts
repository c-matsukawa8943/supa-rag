import pdfParse from 'pdf-parse';
import { getModel } from './gemini';
import { supabase } from './supabase';

// PDFをテキストに変換
export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDFの解析中にエラーが発生しました:', error);
    throw new Error('PDFの解析に失敗しました');
  }
}

// テキストを分割してチャンク化
export function splitTextIntoChunks(text: string, pageSize: number = 1000): { content: string, page_num: number }[] {
  const chunks: { content: string, page_num: number }[] = [];
  const words = text.split(/\s+/);
  
  let currentChunk: string[] = [];
  let chunkIndex = 0;
  
  words.forEach((word) => {
    currentChunk.push(word);
    
    if (currentChunk.length >= pageSize) {
      chunks.push({
        content: currentChunk.join(' '),
        page_num: chunkIndex + 1
      });
      currentChunk = [];
      chunkIndex++;
    }
  });
  
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join(' '),
      page_num: chunkIndex + 1
    });
  }
  
  return chunks;
}

// テキストをベクトル化
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const model = getModel();
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('テキストのベクトル化中にエラーが発生しました:', error);
    throw new Error('テキストのベクトル化に失敗しました');
  }
}

// PDFドキュメントをSupabaseに保存
export async function storeDocument(fileName: string, chunks: { content: string, page_num: number }[]): Promise<string[]> {
  const documentIds: string[] = [];
  
  for (const chunk of chunks) {
    try {
      const embedding = await getEmbedding(chunk.content);
      
      const { data, error } = await supabase
        .from('documents')
        .insert({
          file_name: fileName,
          page_num: chunk.page_num,
          content: chunk.content,
          embedding
        })
        .select('id');
      
      if (error) throw error;
      if (data && data[0]) documentIds.push(data[0].id);
      
    } catch (error) {
      console.error('ドキュメントの保存中にエラーが発生しました:', error);
    }
  }
  
  return documentIds;
} 