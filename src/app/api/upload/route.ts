import { NextRequest, NextResponse } from 'next/server';
import { parsePdf, splitTextIntoChunks, storeDocument } from '@/lib/utils/pdf-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが提供されていません' },
        { status: 400 }
      );
    }
    
    // ファイル形式を検証
    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'PDFファイルのみサポートしています' },
        { status: 400 }
      );
    }
    
    // ファイルをArrayBufferに変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // PDFをテキストに変換
    const text = await parsePdf(buffer);
    
    // テキストをチャンク化
    const chunks = splitTextIntoChunks(text);
    
    // ドキュメントをSupabaseに保存
    const documentIds = await storeDocument(file.name, chunks);
    
    return NextResponse.json({
      success: true,
      message: `${documentIds.length}ページのPDFが正常に処理されました`,
      documentIds
    });
    
  } catch (error) {
    console.error('PDFの処理中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: 'PDFの処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 