'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const [notification, setNotification] = useState<string | null>(null);
  
  const handleUploadComplete = (message: string) => {
    setNotification(message);
    
    // 3秒後に通知を非表示
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  return (
    <main className="min-h-screen flex flex-col p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">PDF RAGチャットシステム</h1>
        <p className="text-gray-600">
          PDFファイルをアップロードして、内容について質問できます。
        </p>
      </header>
      
      {notification && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {notification}
        </div>
      )}
      
      <FileUpload onUploadComplete={handleUploadComplete} />
      
      <div className="flex-1 border rounded-lg shadow-sm overflow-hidden">
        <ChatInterface />
      </div>
    </main>
  );
}
