'use client'

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadPdfAction } from '@/app/_actions';

type FileUploadProps = {
  onUploadComplete: (message: string) => void;
};

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    // ファイル形式の検証
    if (!file.name.endsWith('.pdf')) {
      setError('PDFファイルのみアップロードできます');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await uploadPdfAction(formData);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      onUploadComplete(result.message);
      
    } catch (error) {
      console.error('アップロード中にエラーが発生しました:', error);
      setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading
  });
  
  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg cursor-pointer text-center 
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} 
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p>アップロード中...</p>
        ) : isDragActive ? (
          <p>ここにファイルをドロップ...</p>
        ) : (
          <div>
            <p>PDFファイルをここにドラッグ&ドロップ</p>
            <p className="text-sm mt-2">または</p>
            <button
              type="button"
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={uploading}
            >
              ファイルを選択
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-red-500">{error}</p>
      )}
    </div>
  );
} 