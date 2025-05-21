'use server'

import { supabase } from '@/lib/utils/supabase';
import { getEmbedding } from '@/lib/utils/pdf-parser';
import { getModel } from '@/lib/utils/gemini';

// リトライ処理を行う汎用関数
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,  // リトライ回数を増やす
  initialDelay: number = 5000  // 初期遅延を増やす
): Promise<T> {
  let lastError: any = null;
  let delay = initialDelay;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      console.error(`API呼び出しエラー (試行 ${attempt + 1}/${maxRetries}):`, err);
      
      // 429エラー（レート制限）の場合のみリトライ
      // エラーオブジェクトの構造を詳細に検査
      const is429Error = 
        (err.status === 429) || 
        (err.statusCode === 429) ||
        (err.response?.status === 429) ||
        (err.message && err.message.includes('429')) ||
        (err.message && err.message.includes('Too Many Requests'));
      
      if (is429Error) {
        // リトライする前に待機
        // エクスポネンシャルバックオフを適用（徐々に待ち時間を長くする）
        console.log(`API制限に達しました。${delay / 1000}秒後にリトライします... (${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // 次回の待機時間を延長（最大30秒まで）
        delay = Math.min(delay * 1.5, 30000);
        continue;
      }
      
      // 429以外のエラーは即時失敗
      throw err;
    }
  }
  
  // すべてのリトライが失敗した場合
  console.error('最大リトライ回数に達しました:', lastError);
  throw lastError || new Error('リトライが最大回数に達しました');
}

function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

export async function generateChatResponseAction(question: string) {
  try {
    if (!question) {
      return { error: '質問が提供されていません', status: 400 };
    }
    
    // 質問のベクトル化
    const embedding = await getEmbedding(question);

    // ベクトル生成後に正規化するコード
    const normalizedEmbedding = normalizeVector(embedding);

    // Supabaseでベクトル検索を実行
    const { data: similarDocuments, error } = await supabase
      .rpc('match_documents', {
        query_embedding: normalizedEmbedding, 
        match_threshold: 0.8,    // 一致閾値を上げて、より高品質の結果だけを取得
        match_count: 3          // より多くのコンテキストを収集
      });

    // 類似度スコアを確認するデバッグコードを追加
    console.log('類似度スコア:', similarDocuments.map((doc: any) => 
      `${doc.file_name} (p.${doc.page_num}): ${doc.similarity.toFixed(4)}`
    ));
    
    if (error) {
      console.error('ベクトル検索中にエラーが発生しました:', error);
      return { error: 'ベクトル検索中にエラーが発生しました', status: 500 };
    }
    
    // コンテキストを構築
    let context = '';
    if (similarDocuments && similarDocuments.length > 0) {
      context = similarDocuments
        .map((doc: any) => `${doc.content}\n\n出典: ${doc.file_name} (ページ: ${doc.page_num})`)
        .join('\n\n');
    } else {
      context = '関連情報が見つかりませんでした。';
    }
    console.log(context);
    console.log(question);
    // Gemini APIで回答を生成（リトライロジック付き）
    const model = getModel();
    const prompt = `以下の情報に基づいて質問に正確に回答してください。

情報:
${context}

質問: ${question}

指示:
1. 回答は必ず上記の情報のみに基づいて行ってください。
2. 可能な限り元のドキュメントの表現や言い回しを維持してください。
3. 情報に書かれていない場合は「提供された情報には、その内容は含まれていません」と回答してください。
4. 簡潔かつ正確に回答してください。
5. 関連する情報があれば、その情報を参考に回答してください。

回答:`;
    
    // デバッグ用にAPI呼び出し前の情報を出力
    console.log('Gemini API呼び出し開始...');
    
    let result;
    try {
      result = await withRetry(async () => {
        console.log('API呼び出し試行中...');
        return await model.generateContent(prompt);
      });
      console.log('API呼び出し成功');
    } catch (apiError) {
      console.error('すべてのリトライが失敗しました:', apiError);
      return { 
        error: 'APIの制限に達しました。しばらく時間をおいてから再度お試しください。', 
        status: 429 
      };
    }
    
    const response = result.response;
    const answer = response.text();
    
    return {
      success: true,
      answer,
      sources: similarDocuments || []
    };
    
  } catch (error) {
    console.error('回答の生成中にエラーが発生しました:', error);
    return { 
      error: '回答の生成中にエラーが発生しました。しばらくしてから再度お試しください。', 
      status: typeof error === 'object' && error !== null && 'status' in error ? 
        (error.status as number) : 500 
    };
  }
} 