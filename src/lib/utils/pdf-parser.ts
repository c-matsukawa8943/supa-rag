import pdfParse from 'pdf-parse';
import { getModel, getEmbeddingModel } from './gemini';
import { supabase } from './supabase';
import fs from 'fs';
import debugModule from 'debug';

// デバッグ用のロガーを設定
const debug = debugModule('app:pdf-parser');
debug.enabled = true;

// PDFをテキストに変換
export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    debug('PDFパース開始: バッファサイズ=%d バイト', buffer.length);
    
    // バッファが有効かチェック
    if (!buffer || buffer.length === 0) {
      throw new Error('無効なPDFバッファです');
    }
    
    // pdf-parseにオプションを追加
    const options = {
      // PDF内の画像を無視（テキストのみ抽出）
      max: 0
    };
    
    debug('pdf-parse呼び出し開始...');
    const data = await pdfParse(buffer, options);
    debug('pdf-parse呼び出し成功: ページ数=%d, テキスト長=%d', data.numpages, data.text.length);
    
    // NULL文字や制御文字を取り除く
    const cleanedText = data.text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    debug('テキストクリーニング完了: 元の長さ=%d, クリーニング後=%d', data.text.length, cleanedText.length);
    
    // 空のテキストをチェック
    if (!cleanedText || cleanedText.trim().length === 0) {
      debug('警告: PDFから抽出されたテキストが空です');
      console.warn('PDFから抽出されたテキストが空です');
    }
    
    return cleanedText;
  } catch (error) {
    // エラーの詳細情報をログに記録
    if (error instanceof Error) {
      debug('PDFパースエラー: %s', error.message);
      console.error('PDFの解析中にエラーが発生しました:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } else {
      debug('不明なPDFパースエラー: %o', error);
      console.error('PDFの解析中に予期しないエラーが発生しました:', error);
    }
    throw new Error('PDFの解析に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
  }
}

// テキストを分割してチャンク化
export function splitTextIntoChunks(text: string, chunkSize: number = 800): { content: string, page_num: number }[] {
  debug('テキストチャンク化開始: テキスト長=%d, チャンクサイズ=%d', text.length, chunkSize);
  const chunks: { content: string, page_num: number }[] = [];
  
  // テキストが無効な場合は空の配列を返す
  if (!text || text.trim().length === 0) {
    debug('警告: チャンク化するテキストが空です');
    console.warn('チャンク化するテキストが空です');
    return [];
  }
  
  // 段落や意味のある区切りでテキストを分割
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  debug('段落分割結果: %d個の段落', paragraphs.length);
  
  if (paragraphs.length === 0) {
    // 段落分割がうまくいかない場合は、改行で分割を試みる
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    debug('行分割結果: %d行', lines.length);
    
    if (lines.length === 0) {
      debug('警告: テキストを段落や行に分割できませんでした');
      // 最後の手段として、単純に文字数でチャンク化
      if (text.length > 0) {
        chunks.push({
          content: text.trim(),
          page_num: 1
        });
      }
      return chunks;
    }
    
    // 行ごとにチャンク化
    let currentChunk = '';
    let currentChunkIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (currentChunk.length + line.length + 1 > chunkSize && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          page_num: currentChunkIndex + 1
        });
        debug('チャンク追加（行ベース）: インデックス=%d, サイズ=%d', currentChunkIndex, currentChunk.length);
        currentChunkIndex++;
        currentChunk = line;
      } else {
        if (currentChunk.length > 0) {
          currentChunk += '\n' + line;
        } else {
          currentChunk = line;
        }
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        page_num: currentChunkIndex + 1
      });
      debug('最終チャンク追加（行ベース）: インデックス=%d, サイズ=%d', currentChunkIndex, currentChunk.length);
    }
    
    return chunks;
  }
  
  // 段落ベースのチャンク化
  let currentChunk = '';
  let currentChunkIndex = 0;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim().replace(/\s+/g, ' ');
    
    // 段落が大きすぎる場合は強制的に分割するロジックを追加
    if (paragraph.length > chunkSize) {
      // 段落を強制的に分割
      for (let j = 0; j < paragraph.length; j += chunkSize) {
        const subParagraph = paragraph.substring(j, j + chunkSize);
        if (subParagraph.trim().length > 0) {
          chunks.push({
            content: subParagraph.trim(),
            page_num: currentChunkIndex + 1
          });
          currentChunkIndex++;
        }
      }
    } else {
      // 現在のチャンクに段落を追加した場合のサイズを計算
      const potentialChunkSize = currentChunk.length + paragraph.length + (currentChunk.length > 0 ? 2 : 0); // +2 for '\n\n'
      
      // サイズ制限を超える場合は新しいチャンクを作成
      if (currentChunk.length > 0 && potentialChunkSize > chunkSize) {
        chunks.push({
          content: currentChunk.trim(),
          page_num: currentChunkIndex + 1
        });
        debug('チャンク追加（段落ベース）: インデックス=%d, サイズ=%d', currentChunkIndex, currentChunk.length);
        currentChunkIndex++;
        currentChunk = paragraph;
      } else {
        // 現在のチャンクに段落を追加
        if (currentChunk.length > 0) {
          currentChunk += '\n\n' + paragraph;
        } else {
          currentChunk = paragraph;
        }
      }
    }
  }
  
  // 最後のチャンクを追加
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      page_num: currentChunkIndex + 1
    });
    debug('最終チャンク追加（段落ベース）: インデックス=%d, サイズ=%d', currentChunkIndex, currentChunk.length);
  }
  
  debug('チャンク化完了: %d チャンク生成', chunks.length);
  
  // ログに最初のチャンクの内容を表示（デバッグ用）
  if (chunks.length > 0) {
    debug('最初のチャンクのサンプル: "%s..."', chunks[0].content.substring(0, 100));
  }
  
  return chunks;
}

// テキストをベクトル化
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    debug('テキストベクトル化開始: テキスト長=%d', text.length);
    
    // テキストが無効な場合はエラー
    if (!text || text.trim().length === 0) {
      throw new Error('ベクトル化するテキストが空です');
    }
    
    const model = getEmbeddingModel();
    debug('Geminiエンベディングモデル呼び出し開始...');
    const result = await model.embedContent(text) as unknown as { embedding: { values: number[] } };
    
    if (!result.embedding || !result.embedding.values) {
      debug('エンベディング処理失敗: 無効な応答形式');
      throw new Error('ベクトル化に失敗しました: 無効な応答形式');
    }
    
    debug('ベクトル化成功: ベクトル次元数=%d', result.embedding.values.length);
    // 元の768次元のベクトルをそのまま返す（Supabase側が768次元に対応したため）
    return result.embedding.values;
  } catch (error) {
    debug('ベクトル化エラー: %o', error);
    console.error('テキストのベクトル化中にエラーが発生しました:', error);
    throw new Error('テキストのベクトル化に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
  }
}

// PDFドキュメントをSupabaseに保存
export async function storeDocument(fileName: string, chunks: { content: string, page_num: number }[]): Promise<string[]> {
  debug('ドキュメント保存開始: ファイル名=%s, チャンク数=%d', fileName, chunks.length);
  const documentIds: string[] = [];
  
  // チャンクが空の場合は空の配列を返す
  if (!chunks || chunks.length === 0) {
    debug('警告: 保存するチャンクがありません');
    console.warn('保存するチャンクがありません');
    return documentIds;
  }
  
  // すべてのチャンクのサイズをログに出力（デバッグ用）
  chunks.forEach((chunk, index) => {
    debug('チャンク %d: ページ=%d, サイズ=%d文字, 先頭部分="%s..."', 
      index + 1, chunk.page_num, chunk.content.length, 
      chunk.content.substring(0, 30).replace(/\n/g, ' '));
  });
  
  for (const chunk of chunks) {
    try {
      debug('チャンク処理中: ページ=%d, 内容長=%d', chunk.page_num, chunk.content.length);
      
      // テキスト内容をサニタイズ
      const safeContent = chunk.content.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      
      if (!safeContent || safeContent.trim().length === 0) {
        debug('スキップ: ページ %d のコンテンツが空です', chunk.page_num);
        console.warn(`ページ ${chunk.page_num} のコンテンツが空のためスキップします`);
        continue;
      }
      
      debug('ベクトル化処理開始: ページ=%d', chunk.page_num);
      const embedding = await getEmbedding(safeContent);
      
      if (!embedding || embedding.length === 0) {
        debug('エラー: ページ %d のエンベディングが空です', chunk.page_num);
        console.error(`ページ ${chunk.page_num} のエンベディングが空のためスキップします`);
        continue;
      }
      
      debug('Supabaseへの保存開始: ページ=%d', chunk.page_num);
      const result = await supabase
        .from('documents')
        .insert({
          file_name: fileName,
          page_num: chunk.page_num,
          content: safeContent,
          embedding
        })
        .select('id') as unknown as { data: any[]; error: any };
      
      if (result.error) {
        debug('Supabaseエラー: %o', result.error);
        console.error('Supabaseへの保存中にエラーが発生しました:', result.error);
        throw result.error;
      }
      
      if (result.data && result.data[0]) {
        documentIds.push(result.data[0].id);
        debug('Supabaseに保存成功: ID=%s, ページ=%d', result.data[0].id, chunk.page_num);
      } else {
        debug('警告: Supabaseからの応答にIDが含まれていません: %o', result);
        console.warn('Supabaseからの応答にIDが含まれていません:', result);
      }
      
    } catch (error) {
      debug('チャンク保存エラー: ページ=%d, エラー=%o', chunk.page_num, error);
      console.error(`ドキュメントの保存中にエラーが発生しました (ページ ${chunk.page_num}):`, error);
      
      // エラーの詳細情報をログに記録
      if (error instanceof Error) {
        console.error('エラー詳細:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
    }
  }
  
  debug('ドキュメント保存完了: %d個のIDが生成されました', documentIds.length);
  return documentIds;
}