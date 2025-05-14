'use server'

import { revalidatePath } from 'next/cache';
import { parsePdf, splitTextIntoChunks, storeDocument, failedChunks, retryFailedChunks } from '@/lib/utils/pdf-parser';

export async function uploadPdfAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return { error: 'ファイルが提供されていません', status: 400 };
    }
    
    // ファイル形式を検証
    if (!file.name.endsWith('.pdf')) {
      return { error: 'PDFファイルのみサポートしています', status: 400 };
    }
    
    // ファイルサイズを検証（10MB以上の場合は警告）
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      console.warn(`大きなファイル (${fileSizeMB.toFixed(2)}MB) がアップロードされました。処理に時間がかかる可能性があります。`);
    }
    
    console.log(`PDFファイルの処理を開始します: ${file.name} (${fileSizeMB.toFixed(2)}MB)`);
    
    // デバッグ: ファイルの詳細情報
    console.log('ファイル情報:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    // ファイルをArrayBufferに変換
    let bytes;
    try {
      bytes = await file.arrayBuffer();
      console.log(`ArrayBufferの取得成功: ${bytes.byteLength} バイト`);
    } catch (err) {
      console.error('ArrayBufferの取得に失敗:', err);
      return { error: 'ファイルの読み取りに失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'), status: 400 };
    }
    
    if (!bytes || bytes.byteLength === 0) {
      return { error: 'ファイルが空です', status: 400 };
    }
    
    const buffer = Buffer.from(bytes);
    console.log(`Bufferの作成成功: ${buffer.length} バイト`);
    
    // PDFをテキストに変換
    console.log('PDFをテキストに変換しています...');
    let text;
    try {
      text = await parsePdf(buffer);
      console.log('PDFテキスト変換成功');
    } catch (err) {
      console.error('PDFテキスト変換失敗:', err);
      return { 
        error: 'PDFからテキストを抽出できませんでした: ' + (err instanceof Error ? err.message : '不明なエラー'), 
        status: 400 
      };
    }
    
    if (!text || text.trim().length === 0) {
      return { error: 'PDFからテキストを抽出できませんでした: テキストが空です', status: 400 };
    }
    
    console.log(`テキスト抽出完了: ${text.length}文字`);
    
    // テキストをチャンク化
    console.log('テキストをチャンク化しています...');
    const chunks = splitTextIntoChunks(text);
    
    if (!chunks || chunks.length === 0) {
      return { error: 'テキストのチャンク化に失敗しました: チャンクが生成されませんでした', status: 400 };
    }
    
    console.log(`チャンク化完了: ${chunks.length}チャンク (最初のチャンクサイズ: ${chunks[0].content.length}文字)`);
    
    // チャンクの詳細をログに出力（デバッグ用）
    chunks.forEach((chunk, index) => {
      console.log(`チャンク ${index + 1}: ${chunk.content.length}文字, ページ ${chunk.page_num}, サンプル: "${chunk.content.substring(0, 50)}..."`);
    });
    
    // ドキュメントをSupabaseに保存
    console.log('ドキュメントをSupabaseに保存しています...');
    let documentIds;
    try {
      documentIds = await storeDocument(file.name, chunks);
      console.log('Supabaseへの保存成功');
    } catch (err) {
      console.error('Supabaseへの保存失敗:', err);
      return { 
        error: 'ドキュメントの保存に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'), 
        status: 500 
      };
    }
    
    if (!documentIds || documentIds.length === 0) {
      return { error: 'ドキュメントの保存に失敗しました: IDが返されませんでした', status: 500 };
    }
    
    console.log(`保存完了: ${documentIds.length}ドキュメントが保存されました`);
    
    // 失敗したチャンクがある場合、その数を表示
    let failedChunksCount = failedChunks.length;
    let retryResultMessage = '';
    
    if (failedChunksCount > 0) {
      console.log(`失敗したチャンクが${failedChunksCount}個あります。再処理を試みます...`);
      
      try {
        // 失敗したチャンクを再処理
        const retryIds = await retryFailedChunks();
        if (retryIds.length > 0) {
          documentIds = [...documentIds, ...retryIds];
          retryResultMessage = `（${retryIds.length}個のチャンクが再処理されました）`;
          console.log(`再処理成功: ${retryIds.length}個のチャンクが正常に処理されました`);
        } else {
          retryResultMessage = `（失敗したチャンクの再処理は成功しませんでした）`;
          console.log('再処理: 追加のチャンクは処理されませんでした');
        }
      } catch (retryErr) {
        console.error('再処理中にエラーが発生:', retryErr);
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
    // 詳細なエラー情報をログに記録
    if (error instanceof Error) {
      console.error('PDFの処理中にエラーが発生しました:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } else {
      console.error('PDFの処理中に不明なエラーが発生しました:', error);
    }
    
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