'use client';

import { useState } from 'react';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import styles from '../page.module.css';

export default function UploadPage() {
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
        <h1 className={styles.title}>PDFアップロード</h1>
        <p className={styles.description}>
          PDFファイルをアップロードして、ベクトルデータベースに保存します。
        </p>
        <nav className={styles.navigation}>
          <Link href="/" className={styles.navLink}>ホーム</Link>
          <Link href="/chat" className={styles.navLink}>チャット</Link>
        </nav>
      </header>
      
      {notification && (
        <div className={styles.notification}>
          {notification}
        </div>
      )}
      
      <div className={styles.uploadContainer}>
        <FileUpload onUploadComplete={handleUploadComplete} />
      </div>
      
      <div className={styles.actionContainer}>
        <p>PDFファイルをアップロードした後、チャットページで質問できます。</p>
        <Link href="/chat" className={styles.actionButton}>
          チャットページに移動
        </Link>
      </div>
    </main>
  );
} 