'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ChatInterface from '@/components/ChatInterface';
import styles from './page.module.css';

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
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>PDF RAGチャットシステム</h1>
        <p className={styles.description}>
          PDFファイルをアップロードして、内容について質問できます。
        </p>
      </header>
      
      {notification && (
        <div className={styles.notification}>
          {notification}
        </div>
      )}
      
      <FileUpload onUploadComplete={handleUploadComplete} />
      
      <div className={styles.chatContainer}>
        <ChatInterface />
      </div>
    </main>
  );
}
