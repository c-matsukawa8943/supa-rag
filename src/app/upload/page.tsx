'use client'; // クライアントサイドでのレンダリングを指定

/**
 * PDFアップロードページコンポーネント
 * 
 * このコンポーネントはPDFファイルをアップロードするためのインターフェースを提供します。
 * ユーザーがPDFファイルをアップロードすると、ベクトルデータベースに保存され、
 * 後でチャットページから質問・検索できるようになります。
 */

import { useState } from 'react';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import styles from '../page.module.css';

export default function UploadPage() {
  // アップロード完了後の通知メッセージを管理するstate
  const [notification, setNotification] = useState<string | null>(null);
  
  /**
   * アップロード完了時のコールバック関数
   * 通知メッセージを表示し、3秒後に非表示にします
   * 
   * @param message - 表示する通知メッセージ
   */
  const handleUploadComplete = (message: string) => {
    setNotification(message);
    
    // 3秒後に通知を非表示
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  return (
    <main className={styles.main}>
      {/* ページヘッダー */}
      <header className={styles.header}>
        <h1 className={styles.title}>PDFアップロード</h1>
        <p className={styles.description}>
          PDFファイルをアップロードして、ベクトルデータベースに保存します。
        </p>
        {/* ナビゲーションリンク */}
        <nav className={styles.navigation}>
          <Link href="/" className={styles.navLink}>ホーム</Link>
          <Link href="/chat" className={styles.navLink}>チャット</Link>
        </nav>
      </header>
      
      {/* 通知メッセージ（条件付きレンダリング） */}
      {notification && (
        <div className={styles.notification}>
          {notification}
        </div>
      )}
      
      {/* ファイルアップロードコンポーネント */}
      <div className={styles.uploadContainer}>
        <FileUpload onUploadComplete={handleUploadComplete} />
      </div>
      
      {/* アクションエリア - チャットページへの誘導 */}
      <div className={styles.actionContainer}>
        <p>PDFファイルをアップロードした後、チャットページで質問できます。</p>
        <Link href="/chat" className={styles.actionButton}>
          チャットページに移動
        </Link>
      </div>
    </main>
  );
} 