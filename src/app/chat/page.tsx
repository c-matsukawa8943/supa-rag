'use client';

import Link from 'next/link';
import ChatInterface from '@/components/ChatInterface';
import styles from '../page.module.css';

export default function ChatPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>PDFチャット</h1>
        <p className={styles.description}>
          アップロードしたPDFの内容について質問します。
        </p>
        <nav className={styles.navigation}>
          <Link href="/" className={styles.navLink}>ホーム</Link>
          <Link href="/upload" className={styles.navLink}>アップロード</Link>
        </nav>
      </header>
      
      <div className={styles.chatContainer}>
        <ChatInterface />
      </div>
      
      <div className={styles.actionContainer}>
        <p>PDFファイルをまだアップロードしていない場合は、先にアップロードしてください。</p>
        <Link href="/upload" className={styles.actionButton}>
          アップロードページに移動
        </Link>
      </div>
    </main>
  );
} 