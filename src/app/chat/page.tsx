'use client'; // クライアントサイドでのレンダリングを指定

/**
 * ゲームヘルパーAIチャットページコンポーネント
 * 
 * このコンポーネントはゲーム攻略に関する質問応答インターフェースを提供します。
 * ユーザーはゲームに関する質問を入力し、AIがアップロードされた攻略ガイドや
 * 一般的なゲーム知識に基づいて回答します。
 */

import Link from 'next/link';
import ChatInterface from '@/components/ChatInterface';
import styles from '../page.module.css';

export default function ChatPage() {
  return (
    <main className={styles.main}>
      {/* ページヘッダー */}
      <header className={styles.header}>
        <h1 className={styles.title}>ゲームヘルパーAI</h1>
        <p className={styles.description}>
          ゲームについての質問や悩みをAIに相談しましょう。
          初心者向けのアドバイスからゲーム攻略のコツまで幅広く対応します。
        </p>
        {/* ナビゲーションリンク */}
        <nav className={styles.navigation}>
          <Link href="/" className={styles.navLink}>ホーム</Link>
          <Link href="/upload" className={styles.navLink}>ガイドをアップロード</Link>
        </nav>
      </header>
      
      {/* 質問例セクション */}
      <div className={styles.exampleQuestions}>
        <h3>おすすめの質問例</h3>
        <div className={styles.questionChips}>
          <button className={styles.questionChip}>効率的なレベル上げの方法は？</button>
          <button className={styles.questionChip}>初心者におすすめのキャラクターは？</button>
          <button className={styles.questionChip}>このゲームの隠しエリアの見つけ方</button>
          <button className={styles.questionChip}>PvPで勝つためのコツ</button>
        </div>
      </div>
      
      {/* チャットインターフェースコンポーネント */}
      <div className={styles.chatContainer}>
        <ChatInterface />
      </div>
      
      {/* アクションエリア - ガイドアップロードへの誘導 */}
      <div className={styles.actionContainer}>
        <p>あなたの持っているゲーム攻略情報をアップロードして、AIの回答品質向上に貢献しませんか？</p>
        <Link href="/upload" className={styles.actionButton}>
          攻略ガイドを共有する
        </Link>
      </div>
    </main>
  );
} 