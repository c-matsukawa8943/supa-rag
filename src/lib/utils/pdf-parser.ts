import pdfParse from 'pdf-parse';
import { getEmbeddingModel } from './gemini';
import { supabase } from './supabase';
import debugModule from 'debug';

// デバッグ用のロガーを設定
// ターミナルに出力するログの名前を設定
const debug = debugModule('app:pdf-parser');
// デバッグモードを有効にする
debug.enabled = true;

// ファイル検証関数を追加（新規）
export function validatePdfFile(file: File): { isValid: boolean; error?: string; status?: number; fileSizeMB?: number } {
  if (!file) {
    debug('エラー: ファイルが提供されていません');
    return { isValid: false, error: 'ファイルが提供されていません', status: 400 };
  }
  
  // ファイル形式を検証
  if (!file.name.endsWith('.pdf')) {
    debug('エラー: 非PDFファイルがアップロードされました: %s', file.type);
    return { isValid: false, error: 'PDFファイルのみサポートしています', status: 400 };
  }
  
  // ファイルサイズを計算
  const fileSizeMB = file.size / (1024 * 1024);
  
  // ファイルサイズを検証（10MB以上の場合は警告）
  if (fileSizeMB > 10) {
    debug('警告: 大きなファイル (%.2fMB) がアップロードされました', fileSizeMB);
  }
  
  debug('ファイル検証成功: %s (%.2fMB)', file.name, fileSizeMB);
  return { isValid: true, fileSizeMB };
}

// PDFをテキストに変換
export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    debug('PDFパース開始: バッファサイズ=%d バイト', buffer.length);
    
    // バッファが有効かチェック
    if (!buffer || buffer.length === 0) {
      // throwは、エラーを発生させる関数
      // new Errorは、エラーを作成する関数
      throw new Error('無効なPDFバッファです');
    }
    
    // pdf-parseにオプションを追加
    const options = {
      // PDF内の画像を無視（テキストのみ抽出）
      max: 0,
      // テストファイルの参照を回避
      disableCombinedImage: true
    };
    
    debug('pdf-parse呼び出し開始...');
    // dataにpdfParseの結果を格納
    // pdfParseは、pdf-parseの関数で、バッファとオプションを渡すと、テキストを返す
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
    // instanceofは、オブジェクトが特定の型かどうかを確認する演算子
    if (error instanceof Error) {
      debug('PDFパースエラー: %s', error.message);
      console.error('PDFの解析中にエラーが発生しました:', {
        // エラーのメッセージ
        message: error.message,
        // エラーのスタックトレース
        stack: error.stack,
        // エラーの名前
        name: error.name
      });
    } else {
      debug('不明なPDFパースエラー: %o', error);
      console.error('PDFの解析中に予期しないエラーが発生しました:', error);
    }
    throw new Error('参照ファイルの解析に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
  }
}

// テキストを分割してチャンク化
export function splitTextIntoChunks(text: string, chunkSize: number = 200): { content: string, page_num: number }[] {
  debug('テキストチャンク化開始: テキスト長=%d, ページ分割数=%d', text.length, chunkSize);
  // 分割したテキストを格納する配列、contentはテキスト、page_numはページ番号、分割代入し空の配列を作成
  const chunks: { content: string, page_num: number }[] = [];
  
  // テキストが無効な場合は空の配列を返す
  if (!text || text.trim().length === 0) {
    debug('警告: チャンク化するテキストが空です');
    console.warn('チャンク化するテキストが空です');
    return [];
  }
  
  // 段落や意味のある区切りでテキストを分割
  // splitは、文字列を分割する関数
  // \n\s*\nは、改行と空白を区切りとして使用
  // filterは、配列をフィルタリングする関数
  // pは、段落を表す変数
  // p.trim().length > 0は、段落が空でない場合にtrueを返す
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

// ベクトル化のリトライ処理を行う汎用関数
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  initialDelay: number = 5000
): Promise<T> {
  let lastError: any = null;
  let delay = initialDelay;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      debug(`API呼び出しエラー (試行 ${attempt + 1}/${maxRetries}):`, err);
      
      // 503エラーや429エラー（レート制限）の場合はリトライ
      const isRetryableError = 
        (err.status === 429) || 
        (err.status === 503) ||
        (err.statusCode === 429) || 
        (err.statusCode === 503) ||
        (err.response?.status === 429) || 
        (err.response?.status === 503) ||
        (err.message && (err.message.includes('429') || err.message.includes('503') || err.message.includes('Service Unavailable') || err.message.includes('Too Many Requests')));
      
      if (isRetryableError) {
        // リトライする前に待機（エクスポネンシャルバックオフ）
        debug(`API制限または一時的なエラーが発生。${delay / 1000}秒後にリトライします... (${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // 次回の待機時間を延長（最大60秒まで）
        delay = Math.min(delay * 1.5, 60000);
        continue;
      }
      
      // リトライ対象外のエラーは即時失敗
      throw err;
    }
  }
  
  // すべてのリトライが失敗した場合
  debug('最大リトライ回数に達しました:', lastError);
  throw lastError || new Error('リトライが最大回数に達しました');
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
    
    // リトライロジックを追加
    const result = await withRetry(async () => {
      return await model.embedContent(text) as unknown as { embedding: { values: number[] } };
    });
    
    if (!result.embedding || !result.embedding.values) {
      debug('エンベディング処理失敗: 無効な応答形式');
      throw new Error('ベクトル化に失敗しました: 無効な応答形式');
    }
    
    debug('ベクトル化成功: ベクトル次元数=%d', result.embedding.values.length);
    // 元の768次元のベクトルをそのまま返す（Supabase側が768次元に対応したため）
    // console.log(result);
    return result.embedding.values;
    
  } catch (error) {
    debug('ベクトル化エラー: %o', error);
    console.error('テキストのベクトル化中にエラーが発生しました:', error);
    throw new Error('テキストのベクトル化に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
  }
  
}

// 失敗したチャンクをグローバルに保持
// 他ファイルからも失敗したチャンクがあるかを参照し、使える様にするため
export const failedChunks: { fileName: string; chunk: { content: string; page_num: number } }[] = [];

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
      // chunk内の改行を空文字にする
      chunk.content.substring(0, 30).replace(/\n/g, ' '));
  });
  
  // 処理に失敗したチャンクを一時的に保存
  const localFailedChunks: { content: string; page_num: number }[] = [];
  
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
        // 失敗したチャンクを保存
        localFailedChunks.push({...chunk});
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
        // 失敗したチャンクを保存
        localFailedChunks.push({...chunk});
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
      
      // 失敗したチャンクを保存
      localFailedChunks.push({...chunk});
      
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
  
  // 失敗したチャンクをグローバル配列に追加
  if (localFailedChunks.length > 0) {
    debug('失敗したチャンク: %d個', localFailedChunks.length);
    localFailedChunks.forEach(chunk => {
      failedChunks.push({ fileName, chunk });
    });
  }
  
  debug('ドキュメント保存完了: %d個のIDが生成されました', documentIds.length);
  return documentIds;
}

// 失敗したチャンクを再処理する
export async function retryFailedChunks(): Promise<string[]> {
  debug('失敗したチャンクの再処理開始: %d個のチャンク', failedChunks.length);
  const successIds: string[] = [];
  
  if (failedChunks.length === 0) {
    debug('再処理するチャンクがありません');
    return successIds;
  }
  
  // チャンクをファイル名でグループ化
  const chunksByFileName: Record<string, { content: string, page_num: number }[]> = {};
  
  failedChunks.forEach(({fileName, chunk}) => {
    if (!chunksByFileName[fileName]) {
      chunksByFileName[fileName] = [];
    }
    chunksByFileName[fileName].push(chunk);
  });
  
  // ファイルごとに処理
  for (const [fileName, chunks] of Object.entries(chunksByFileName)) {
    debug('再処理中: ファイル=%s, チャンク数=%d', fileName, chunks.length);
    try {
      const ids = await storeDocument(fileName, chunks);
      successIds.push(...ids);
    } catch (error) {
      debug('再処理中にエラーが発生: ファイル=%s, エラー=%o', fileName, error);
      console.error(`ファイル ${fileName} の再処理中にエラーが発生しました:`, error);
    }
  }
  
  // 再処理に成功したチャンクを配列から削除
  failedChunks.length = 0;
  
  debug('失敗したチャンクの再処理完了: %d個のIDが生成されました', successIds.length);
  return successIds;
}