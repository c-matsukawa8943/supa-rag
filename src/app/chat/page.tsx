'use client'; // クライアントサイドでのレンダリングを指定

/**
 * PDFチャットページコンポーネント
 * 
 * このコンポーネントはアップロードされたPDFドキュメントに基づいて
 * AI支援の質問応答インターフェースを提供します。
 * ユーザーはPDFの内容に関する質問を入力し、AIが関連情報を抽出して回答します。
 */

import Link from 'next/link';
import ChatInterface from '@/components/ChatInterface';
import styles from '../page.module.css';

export default function ChatPage() {
  return (
    <main className={styles.main}>
      {/* ページヘッダー */}
      <header className={styles.header}>
        <h1 className={styles.title}>PDFチャット</h1>
        <p className={styles.description}>
          アップロードしたPDFの内容について質問します。
        </p>
        {/* ナビゲーションリンク */}
        <nav className={styles.navigation}>
          <Link href="/" className={styles.navLink}>ホーム</Link>
          <Link href="/upload" className={styles.navLink}>アップロード</Link>
        </nav>
      </header>
      
      {/* チャットインターフェースコンポーネント */}
      <div className={styles.chatContainer}>
        <ChatInterface />
      </div>
      
      {/* アクションエリア - PDFアップロードへの誘導 */}
      <div className={styles.actionContainer}>
        <p>PDFファイルをまだアップロードしていない場合は、先にアップロードしてください。</p>
        <Link href="/upload" className={styles.actionButton}>
          アップロードページに移動
        </Link>
      </div>
    </main>
  );
} 