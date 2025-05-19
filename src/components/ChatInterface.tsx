'use client' // Next.jsでクライアントサイドレンダリングを使用することを宣言

import { useState, FormEvent, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // マークダウンをHTMLに変換するライブラリ
import { generateChatResponseAction } from '@/app/_actions'; // サーバーアクション
import Image from 'next/image';

/**
 * メッセージの型定義
 * 
 * role: メッセージの送信者（'user'=ユーザー、'assistant'=AI）
 * content: メッセージの内容（テキスト）
 */
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * similarity: ユーザー質問との類似度（0〜1の値、1が最も類似）
 */
type Source = {
  file_name: string;
  page_num: number;
  content: string;
  similarity: number;
};

// 質問サンプル
const SAMPLE_QUESTIONS = [
  "初心者におすすめの強力なキャラクターは？",
  "空中戦のコツを教えて",
  "シールドの効果的な使い方は？",
  "マリオの基本コンボは？",
  "ガノンドロフの弱点と対策",
  "復帰の安全なやり方",
  "VIPに行くにはどうしたらいい？"
];

export default function ChatInterface() {
  // =========== 状態（State）管理 ===========
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  /**
   * チャットコンテナを最下部にスクロールする関数
   * ページ全体ではなくチャットコンテナのみをスクロール
   */
  const scrollChatToBottom = (smooth = true) => {
    if (!chatContainerRef.current) return;
    
    // チャットコンテナ内のスクロール位置を最下部に設定
    const container = chatContainerRef.current;
    
    // 即時スクロール（非スムーズ）
    container.scrollTop = container.scrollHeight;
    
    // スムーズスクロールをさらに追加（二重の保証）
    setTimeout(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }, 50);
  };
  
  /**
   * 副作用フック（useEffect）- メッセージが追加されたら自動スクロール
   * 
   * messagesが変わるたびに実行され、最新のメッセージを表示する
   */
  useEffect(() => {
    // メッセージがない場合は何もしない
    if (!messages.length) return;
    
    // 最新のメッセージを確認
    const latestMessage = messages[messages.length - 1];
    
    // AIからの応答メッセージが追加された場合、確実にスクロール
    if (latestMessage.role === 'assistant') {
      // レンダリング完了を待ってからスクロール
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    } else {
      // ユーザーのメッセージの場合は、近い位置にいる場合のみスクロール
      const chatContainer = chatContainerRef.current;
      if (!chatContainer) return;
      
      // 下部付近にいる場合のみスクロール（150pxに緩和）
      const isNearBottom = 
        chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 150;
      
      if (isNearBottom) {
        scrollChatToBottom();
      }
    }
  }, [messages]); // messagesが変わるたびに実行
  
  /**
   * 手動でメッセージ最下部にスクロールする関数
   */
  const scrollToBottom = (smooth = true) => {
    scrollChatToBottom(smooth);
  };

  /**
   * フォーム送信処理関数
   * ユーザーがメッセージを送信したときの処理を行う
   * 
   * @param e フォーム送信イベント
   */
  const handleSubmit = async (e: FormEvent) => {
    // フォームのデフォルト送信動作（ページのリロード）を防止
    e.preventDefault();
    
    // 空のメッセージや処理中の場合は何もしない
    if (!input.trim() || loading) return;
    
    // 前回のエラーをクリア
    setError(null);
    
    // 入力内容を一時保存
    const userInput = input.trim();
    
    // 新しいユーザーメッセージを作成し、メッセージ履歴に追加
    const userMessage: Message = { role: 'user', content: userInput };
    setMessages((prev) => [...prev, userMessage]); // 前のメッセージリストに新しいメッセージを追加
    setInput(''); // 入力欄をクリア
    
    // ユーザーのメッセージ送信後に強制的に最下部へスクロール
    scrollToBottom();
    
    try {
      // ローディング状態を開始
      setLoading(true);
      
      // サーバーアクションを呼び出してAI応答を取得
      const result = await generateChatResponseAction(userMessage.content);
      
      // エラーレスポンスの処理
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      // 少し遅延させて自然な会話感を演出（オプション）
      setTimeout(() => {
        // AIアシスタントの回答をメッセージリストに追加
        const assistantMessage: Message = { role: 'assistant', content: result.answer };
        setMessages((prev) => [...prev, assistantMessage]);
        
        // 回答の根拠となったソース情報を設定（表示用）
        if (result.sources && Array.isArray(result.sources)) {
          setSources(result.sources);
        }
        
        // ローディング状態を解除
        setLoading(false);
        
        // AI応答表示後、確実にスクロールを実行（少し遅延を加える）
        setTimeout(() => {
          // 強制的にチャット最下部にスクロール
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
      }, 500); // 0.5秒の遅延
      
    } catch (error) {
      // エラーが発生した場合の処理
      console.error('エラーが発生しました:', error);
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
      setLoading(false);
    }
  };
  
  /**
   * 再試行処理関数
   * エラー発生時に最後の質問を再度送信する
   */
  const handleRetry = async () => {
    // 処理中の場合は何もしない
    if (loading) return;
    
    // 最後のユーザーメッセージを検索
    // 配列を逆順にして最初に見つかったユーザーメッセージを取得
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return; // ユーザーメッセージがなければ何もしない
    
    // エラー表示をクリア
    setError(null);
    
    try {
      // ローディング状態を開始
      setLoading(true);
      
      // 最後のユーザーメッセージを再送信
      const result = await generateChatResponseAction(lastUserMessage.content);
      
      // エラーレスポンスの処理
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      // 新しいアシスタントメッセージを作成
      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      
      // メッセージリストを更新：
      // 最後のアシスタントメッセージがあれば置き換え、なければ新規追加
      setMessages((prev) => {
        const lastIndex = prev.findIndex(m => m.role === 'assistant');
        if (lastIndex >= 0) {
          // 既存のアシスタントメッセージを新しい回答で置き換え
          const newMessages = [...prev];
          newMessages[lastIndex] = assistantMessage;
          return newMessages;
        }
        // アシスタントメッセージがなければ追加
        return [...prev, assistantMessage];
      });
      
      // 回答の根拠となったソース情報を更新
      if (result.sources && Array.isArray(result.sources)) {
        setSources(result.sources);
      }

      // 処理完了後のスクロール
      scrollToBottom();
      
    } catch (error) {
      // エラー処理
      console.error('再試行中にエラーが発生しました:', error);
      setError(error instanceof Error ? error.message : '再試行中にエラーが発生しました');
    } finally {
      // ローディング状態を解除
      setLoading(false);
    }
  };

  /**
   * サンプル質問を送信する
   * @param question サンプル質問の文字列
   */
  const handleSampleQuestion = (question: string, e: React.MouseEvent) => {
    // イベントのデフォルト動作と伝播を停止
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    // 質問を入力欄に設定するだけ（自動送信や自動スクロールは行わない）
    setInput(question);
    
    // 入力欄にフォーカスを当てる
    const inputElement = document.querySelector('.chat-input') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };
  
  // スタイルJSXを追加
  const markdownStyles = `
    .markdown-content ul, 
    .markdown-content ol {
      padding-left: 1.5rem;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      width: 100%;
      box-sizing: border-box;
    }
    
    .markdown-content li {
      margin-bottom: 0.25rem;
      padding-right: 0.5rem;
      margin-left: 0.5rem;
      width: auto;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    
    .markdown-content p {
      margin: 0.5rem 0;
      width: 100%;
      line-height: 1.5;
    }
    
    .message-container {
      width: auto;
      max-width: 85%;
    }
    
    .markdown-content a {
      color: #63b3ed;
      text-decoration: underline;
    }
    
    .markdown-content strong, 
    .markdown-content b {
      font-weight: 600;
      color: #ffcc00;
    }
    
    .markdown-content em,
    .markdown-content i {
      font-style: italic;
      color: #a0aec0;
    }
    
    .markdown-content code {
      background-color: rgba(0, 0, 0, 0.3);
      padding: 0.1em 0.4em;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9em;
    }
  `;
  
  // UIコンポーネントの返却（レンダリング）
  return (
    <div className="smash-advisor-container" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, rgba(25,25,112,0.8) 0%, rgba(65,105,225,0.6) 100%)',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      height: '100%',
      width: '100%'
    }}>
      <style jsx global>{markdownStyles}</style>
      {/* キャラクター能力セクション */}
      <div className="smash-advisor-intro" style={{ 
        display: 'flex', 
        flexDirection: 'row',
        gap: '2rem',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div className="smash-advisor-icon" style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          padding: '1.5rem',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          animation: 'pulse 2s infinite ease-in-out'
        }}>
          <Image 
            src="/scraped-images/icon-fighters.svg" 
            alt="アドバイザー" 
            width={80} 
            height={80}
            className="advisor-icon-image"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.7))' }}
          />
        </div>
        <div className="smash-advisor-text" style={{
          flex: '1',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          padding: '1.5rem',
          color: 'white'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1rem',
            color: '#ffcc00',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>できること</h3>
          <ul className="advisor-features" style={{
            listStyleType: 'none',
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem'
          }}>
            <li style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              <span style={{ color: '#4fd1c5', fontWeight: 'bold' }}>✓</span>
              初心者におすすめのファイター選び
            </li>
            <li style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              <span style={{ color: '#4fd1c5', fontWeight: 'bold' }}>✓</span>
              対戦時の立ち回りアドバイス
            </li>
            <li style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              <span style={{ color: '#4fd1c5', fontWeight: 'bold' }}>✓</span>
              相性の良いキャラクター組み合わせ
            </li>
            <li style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              <span style={{ color: '#4fd1c5', fontWeight: 'bold' }}>✓</span>
              基本テクニックの練習方法
            </li>
            <li style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              <span style={{ color: '#4fd1c5', fontWeight: 'bold' }}>✓</span>
              ステージごとの攻略ポイント
            </li>
          </ul>
        </div>
      </div>
      
      {/* よくある質問セクション */}
      <div className="quick-questions" style={{
        marginBottom: '2rem',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        padding: '1rem',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}>
        <h4 style={{ 
          fontSize: '1.2rem', 
          color: '#ffcc00',
          marginBottom: '1rem',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>よくある質問</h4>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.75rem',
          justifyContent: 'center',
          minWidth: 'min-content'
        }}>
          {SAMPLE_QUESTIONS.map((question, index) => (
            <button 
              key={index}
              onClick={(e) => handleSampleQuestion(question, e)}
              style={{
                background: 'linear-gradient(135deg, #6b8cff 0%, #4764e6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
      
      {/* チャットインターフェース */}
      <div className="smash-advisor-chat" style={{
        width: '100%',
        height: '500px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* チャットヘッダー */}
        <div className="smash-chat-header" style={{
          background: 'linear-gradient(90deg, #2c5282 0%, #3182ce 100%)',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: '#38b2ac',
              boxShadow: '0 0 5px #4fd1c5'
            }}></div>
            <h4 style={{ color: 'white', margin: 0, fontSize: '1rem' }}>
              スマブラアドバイザー
            </h4>
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            color: 'rgba(255,255,255,0.7)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px'
          }}>
            オンライン
          </div>
        </div>
        
        {/* メッセージ表示エリア */}
        <div 
          className="smash-chat-messages" 
          ref={chatContainerRef}
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: 'rgba(15, 15, 25, 0.4)',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: 'rgba(255,255,255,0.5)',
              margin: 'auto 0',
              padding: '2rem'
            }}>
              <p>スマブラに関する質問を入力してください！</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                または、上の「よくある質問」からお選びください。
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className="message-container"
                style={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: message.role === 'user' 
                    ? 'rgba(77, 100, 230, 0.8)' 
                    : 'rgba(40, 40, 45, 0.8)',
                  padding: '1rem 1.25rem',
                  borderRadius: message.role === 'user' 
                    ? '12px 12px 0 12px' 
                    : '12px 12px 12px 0',
                  maxWidth: '85%',
                  color: 'white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  width: 'fit-content',
                  lineHeight: '1.5',
                  fontSize: '0.95rem',
                  letterSpacing: '0.01em'
                }}
              >
                <div className="markdown-content" style={{ width: '100%' }}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* エラーメッセージ表示 */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderTop: '1px solid rgba(220, 38, 38, 0.3)',
            color: '#f87171'
          }}>
            <p style={{ margin: '0 0 0.5rem' }}>{error}</p>
            <button
              onClick={handleRetry}
              style={{
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                color: '#f87171',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              再試行
            </button>
          </div>
        )}
        
        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(15, 15, 30, 0.85)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="質問を入力してください..."
            className="chat-input"
            style={{
              flex: 1,
              padding: '0.85rem 1.2rem',
              borderRadius: '10px',
              border: '1px solid rgba(100, 150, 255, 0.3)',
              background: 'rgba(0,0,0,0.3)',
              color: 'white',
              fontSize: '0.95rem',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              backgroundColor: '#4764e6',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '0.85rem 1.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading || !input.trim() ? 0.6 : 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {loading ? '送信中...' : '送信'}
          </button>
        </form>
      </div>
    </div>
  );
} 