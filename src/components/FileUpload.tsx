'use client'
// useCallbackを使うことで、関数を再生成しないようにする
import { useState, useCallback } from 'react';
// useDropzoneを使うことで、ドラッグ&ドロップの機能を実装する
import { useDropzone } from 'react-dropzone';
// uploadPdfで定義したアクションを実行する
import { uploadPdfAction, retryFailedChunksAction } from '@/app/_actions';
// FileUploadPropsは、FileUploadコンポーネントのpropsの型を定義する
type FileUploadProps = {
  // onUploadCompleteは、アップロードが完了したときに呼び出される関数
  onUploadComplete: (message: string) => void;
};
// FileUploadコンポーネントは、FileUploadPropsを受け取る
export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  // useStateを使うことで、uploading, error, hasFailedChunks, retryingの状態を管理する
  // useStateは、Reactのフックで、状態を管理するための関数
  // uploadingは、アップロード中かどうかを管理する
  const [uploading, setUploading] = useState(false);
  // errorは、エラーが発生したときに表示するメッセージを管理する
  const [error, setError] = useState<string | null>(null);
  // hasFailedChunksは、失敗したチャンクがあるかどうかを管理する
  const [hasFailedChunks, setHasFailedChunks] = useState(false);
  // retryingは、再処理中かどうかを管理する
  const [retrying, setRetrying] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    try {
      setUploading(true);
      setError(null);
      setHasFailedChunks(false);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await uploadPdfAction(formData);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      // 失敗したチャンクの有無を確認
      if (result.failedChunks && result.failedChunks > 0) {
        setHasFailedChunks(true);
      }
      
      onUploadComplete(result.message);
      
    } catch (error) {
      console.error('アップロード中にエラーが発生しました:', error);
      setError(error instanceof Error ? error.message : '不明なエラーが発生しました');
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const handleRetry = async () => {
    try {
      setRetrying(true);
      setError(null);
      
      const result = await retryFailedChunksAction();
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      // 再処理が完了したら失敗フラグをリセット
      setHasFailedChunks(false);
      onUploadComplete(result.message);
      
    } catch (error) {
      console.error('再処理中にエラーが発生しました:', error);
      setError(error instanceof Error ? error.message : '再処理中に不明なエラーが発生しました');
    } finally {
      setRetrying(false);
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading || retrying
  });
  
  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg cursor-pointer text-center 
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} 
          ${uploading || retrying ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              disabled={uploading || retrying}
            >
              ファイルを選択
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-red-500">{error}</p>
      )}
      
      {hasFailedChunks && (
        <div className="mt-4">
          <p className="text-amber-600 mb-2">一部のチャンク（ページ）の処理に失敗しました。</p>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
          >
            {retrying ? '再処理中...' : '失敗したチャンクを再処理'}
          </button>
        </div>
      )}
    </div>
  );
} 