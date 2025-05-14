'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>PDF RAGチャットシステム</h1>
        <p className={styles.description}>
          PDFファイルをアップロードして、内容について質問できます。
        </p>
      </header>
      
      <div className={styles.navigationContainer}>
        <div className={styles.navigationCard}>
          <h2>PDFのアップロード</h2>
          <p>PDFファイルをアップロードして、ベクトルデータベースに保存します。</p>
          <Link href="/upload" className={styles.navigationButton}>
            アップロードページへ
          </Link>
        </div>
        
        <div className={styles.navigationCard}>
          <h2>チャットインターフェース</h2>
          <p>アップロードしたPDFの内容について質問します。</p>
          <Link href="/chat" className={styles.navigationButton}>
            チャットページへ
          </Link>
        </div>
      </div>
    </main>
  );
}
