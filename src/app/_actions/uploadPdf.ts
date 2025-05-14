'use server'

import { revalidatePath } from 'next/cache';
import { 
  parsePdf, 
  splitTextIntoChunks, 
  storeDocument, 
  failedChunks, 
  retryFailedChunks, 
  validatePdfFile 
} from '@/lib/utils/pdf-parser';

export async function uploadPdfAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    
    // ファイル検証（pdf-parser.tsの関数を使用）
    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      return { error: validation.error, status: validation.status };
    }
    
    console.log(`PDFファイルの処理を開始します: ${file.name} (${validation.fileSizeMB?.toFixed(2)}MB)`);
    
    // ファイルをArrayBufferに変換
    let bytes;
    try {
      bytes = await file.arrayBuffer();
    } catch (err) {
      console.error('ArrayBufferの取得に失敗:', err);
      return { error: 'ファイルの読み取りに失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'), status: 400 };
    }
    
    if (!bytes || bytes.byteLength === 0) {
      return { error: 'ファイルが空です', status: 400 };
    }
    
    const buffer = Buffer.from(bytes);
    
    // PDFをテキストに変換
    let text;
    try {
      text = await parsePdf(buffer);
    } catch (err) {
      return { 
        error: 'PDFからテキストを抽出できませんでした: ' + (err instanceof Error ? err.message : '不明なエラー'), 
        status: 400 
      };
    }
    
    if (!text || text.trim().length === 0) {
      return { error: 'PDFからテキストを抽出できませんでした: テキストが空です', status: 400 };
    }
    
    // テキストをチャンク化
    const chunks = splitTextIntoChunks(text);
    
    if (!chunks || chunks.length === 0) {
      return { error: 'テキストのチャンク化に失敗しました: チャンクが生成されませんでした', status: 400 };
    }
    
    // ドキュメントをSupabaseに保存
    let documentIds;
    try {
      documentIds = await storeDocument(file.name, chunks);
    } catch (err) {
      return { 
        error: 'ドキュメントの保存に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'), 
        status: 500 
      };
    }
    
    if (!documentIds || documentIds.length === 0) {
      return { error: 'ドキュメントの保存に失敗しました: IDが返されませんでした', status: 500 };
    }
    
    // 失敗したチャンクがある場合、再処理を試みる
    const failedChunksCount = failedChunks.length;
    let retryResultMessage = '';
    
    if (failedChunksCount > 0) {
      try {
        const retryIds = await retryFailedChunks();
        if (retryIds.length > 0) {
          documentIds = [...documentIds, ...retryIds];
          retryResultMessage = `（${retryIds.length}個のチャンクが再処理されました）`;
        } else {
          retryResultMessage = `（失敗したチャンクの再処理は成功しませんでした）`;
        }
      } catch (retryErr) {
        retryResultMessage = `（失敗したチャンクの再処理中にエラーが発生しました）`;
      }
    }
    
    // キャッシュを更新
    revalidatePath('/');
    
    return {
      success: true,
      message: `${documentIds.length}チャンクのPDFが正常に処理されました${retryResultMessage}`,
      documentIds,
      originalChunks: chunks.length,
      processedChunks: documentIds.length,
      failedChunks: failedChunks.length
    };
    
  } catch (error) {
    console.error('PDFの処理中にエラーが発生しました:', error);
    
    const errorMessage = error instanceof Error 
      ? `PDFの処理中にエラーが発生しました: ${error.message}`
      : 'PDFの処理中に不明なエラーが発生しました';
    
    return { error: errorMessage, status: typeof error === 'object' && error !== null && 'status' in error ? 
      (error.status as number) : 500 };
  }
} 

// 失敗したチャンクを再処理するためのアクション
export async function retryFailedChunksAction() {
  try {
    const failedCount = failedChunks.length;
    
    if (failedCount === 0) {
      return { 
        success: true, 
        message: '再処理するチャンクはありません', 
        processedChunks: 0 
      };
    }
    
    console.log(`失敗したチャンク${failedCount}個の再処理を開始します...`);
    const documentIds = await retryFailedChunks();
    console.log(`再処理完了: ${documentIds.length}個のチャンクが処理されました`);
    
    // キャッシュを更新
    revalidatePath('/');
    
    return {
      success: true,
      message: `${documentIds.length}チャンクが正常に再処理されました`,
      processedChunks: documentIds.length
    };
    
  } catch (error) {
    console.error('チャンクの再処理中にエラーが発生しました:', error);
    
    const errorMessage = error instanceof Error 
      ? `チャンクの再処理中にエラーが発生しました: ${error.message}`
      : 'チャンクの再処理中に不明なエラーが発生しました';
    
    return { 
      error: errorMessage, 
      status: typeof error === 'object' && error !== null && 'status' in error ? 
        (error.status as number) : 500 
    };
  }
} 