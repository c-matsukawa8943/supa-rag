'use client'; // クライアントサイドでのレンダリングを指定

/**
 * ゲーム攻略ガイドアップロードページコンポーネント
 * 
 * このコンポーネントはゲームの攻略ガイドやマニュアルをアップロードするためのインターフェースを提供します。
 * ユーザーがPDFファイルをアップロードすると、ベクトルデータベースに保存され、
 * 後でチャットページから質問・検索できるようになります。
 */

import { useState } from 'react';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import styles from '../page.module.css';
import uploadStyles from './upload.module.css';

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
        <h1 className={styles.title}>攻略ガイドをアップロード</h1>
        <p className={styles.description}>
          ゲームの攻略情報やマニュアルをアップロードして、みんなで共有しましょう。
          アップロードした情報はAIが学習し、初心者プレイヤーの質問に答えるために使われます。
        </p>
        {/* ナビゲーションリンク */}
        <nav className={styles.navigation}>
          <Link href="/" className={styles.navLink}>ホーム</Link>
          <Link href="/chat" className={styles.navLink}>AIに質問</Link>
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
        <h3 className={uploadStyles.uploadTitle}>攻略ガイドをアップロード</h3>
        <p className={uploadStyles.uploadDescription}>
          スマッシュブラザーズに関する攻略資料をアップロードすると、AIがその内容を学習し、質問に答えられるようになります。
        </p>
        <FileUpload onUploadComplete={handleUploadComplete} />
        
        <div className={uploadStyles.fileFormatInfo}>
          <h3>アップロードできる資料例:</h3>
          <ul>
            <li>ファイター攻略ガイド</li>
            <li>対戦テクニック解説書</li>
            <li>フレームデータ資料</li>
            <li>大会戦略ガイド</li>
          </ul>
          <p className={uploadStyles.noteText}>※ファイルサイズは10MB以下にしてください</p>
        </div>
      </div>
      
      {/* サポートするファイル形式の説明 */}
      <div className={styles.fileFormatInfo}>
        <h3>サポートするファイル形式</h3>
        <ul>
          <li>PDF: ゲームの公式マニュアルやガイドブック</li>
          <li>TXT: テキスト形式の攻略情報や攻略チャート</li>
          <li>DOCX: ワード形式の攻略ガイド</li>
        </ul>
        <p className={styles.noteText}>※ファイルサイズは10MB以下にしてください</p>
      </div>
      
      {/* アクションエリア - チャットページへの誘導 */}
      <div className={styles.actionContainer}>
        <p>ガイドをアップロードした後、AIに質問してゲームの攻略情報を聞いてみましょう！</p>
        <Link href="/chat" className={styles.actionButton}>
          AIに質問する
        </Link>
      </div>
    </main>
  );
} 