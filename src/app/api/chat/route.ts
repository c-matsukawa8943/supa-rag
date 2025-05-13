import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/utils/supabase';
import { getEmbedding } from '@/lib/utils/pdf-parser';
import { getModel } from '@/lib/utils/gemini';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    
    if (!question) {
      return NextResponse.json(
        { error: '質問が提供されていません' },
        { status: 400 }
      );
    }
    
    // 質問のベクトル化
    const embedding = await getEmbedding(question);
    
    // Supabaseでベクトル検索を実行
    const { data: similarDocuments, error } = await supabase
      .rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5
      });
    
    if (error) {
      console.error('ベクトル検索中にエラーが発生しました:', error);
      return NextResponse.json(
        { error: 'ベクトル検索中にエラーが発生しました' },
        { status: 500 }
      );
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
    
    // Gemini APIで回答を生成
    const model = getModel();
    const prompt = `以下の情報に基づいて質問に回答してください。回答が情報に含まれていない場合は、「その情報は提供されたドキュメントには含まれていません」と回答してください。

情報:
${context}

質問: ${question}

回答:`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const answer = response.text();
    
    return NextResponse.json({
      answer,
      sources: similarDocuments || []
    });
    
  } catch (error) {
    console.error('回答の生成中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '回答の生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 