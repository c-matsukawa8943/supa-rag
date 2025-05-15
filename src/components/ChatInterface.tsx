'use client' // Next.jsでクライアントサイドレンダリングを使用することを宣言

import { useState, FormEvent, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // マークダウンをHTMLに変換するライブラリ
import { generateChatResponseAction } from '@/app/_actions'; // サーバーアクション

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

export default function ChatInterface() {
  // =========== 状態（State）管理 ===========
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  /**
   * 副作用フック（useEffect）- メッセージが追加されたら自動スクロール
   * 
   * messagesが変わるたびに実行され、最新のメッセージが見えるように
   * 画面を自動的に下にスクロールする
   */
  useEffect(() => {
    // メッセージが追加されたら、そのメッセージが見えるようにスクロール
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // messagesが変わるたびに実行
  
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
    
    // 新しいユーザーメッセージを作成し、メッセージ履歴に追加
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]); // 前のメッセージリストに新しいメッセージを追加
    setInput(''); // 入力欄をクリア
    
    try {
      // ローディング状態を開始
      setLoading(true);
      
      // サーバーアクションを呼び出してAI応答を取得
      const result = await generateChatResponseAction(userMessage.content);
      
      // エラーレスポンスの処理
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      // AIアシスタントの回答をメッセージリストに追加
      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // 回答の根拠となったソース情報を設定（表示用）
      if (result.sources && Array.isArray(result.sources)) {
        setSources(result.sources);
      }
      
    } catch (error) {
      // エラーが発生した場合の処理
      console.error('エラーが発生しました:', error);
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      // 処理完了後、ローディング状態を解除
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
      
    } catch (error) {
      // エラー処理
      console.error('再試行中にエラーが発生しました:', error);
      setError(error instanceof Error ? error.message : '再試行中にエラーが発生しました');
    } finally {
      // ローディング状態を解除
      setLoading(false);
    }
  };
  
  // UIコンポーネントの返却（レンダリング）
  return (
    <div className="flex flex-col h-full">
      {/* ========== メッセージ表示エリア ========== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* メッセージがない場合は案内を表示、ある場合はメッセージ一覧を表示 */}
        {messages.length === 0 ? (
          // 初期状態（メッセージなし）のガイダンス
          <div className="text-center text-gray-500 my-8">
            <p>PDFファイルをアップロードして、質問を入力してください。</p>
          </div>
        ) : (
          // メッセージ一覧を表示（配列をマッピングして各メッセージをレンダリング）
          messages.map((message, index) => (
            <div
              key={index} // Reactのリスト表示に必要な一意のキー
              className={`${
                // 条件付きスタイル：ユーザーは右側・青、AIは左側・グレー
                message.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
              } p-3 rounded-lg max-w-3/4 break-words`}
            >
              {/* 
                ReactMarkdownコンポーネント：
                マークダウン形式のテキストをHTMLに変換して表示
                リンク、リスト、強調などのフォーマットが適用される
              */}
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ))
        )}
        {/* 
          自動スクロールのための参照要素：
          新しいメッセージが追加されると、このdivまでスクロールする
        */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* ========== エラーメッセージ表示エリア ========== */}
      {/* errorがnullでない場合のみ表示される（条件付きレンダリング） */}
      {error && (
        <div className="border-t p-4 bg-red-50">
          <p className="text-red-600 mb-2">{error}</p>
          {/* 再試行ボタン：クリックするとhandleRetry関数が実行される */}
          <button
            onClick={handleRetry}
            className="bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 text-sm"
            disabled={loading} // 処理中は押せないようにする
          >
            再試行する
          </button>
        </div>
      )}
      
      {/* ========== 参照ソース（根拠）表示エリアはここで非表示にしました ========== */}
      
      {/* ========== メッセージ入力フォーム ========== */}
      {/* フォーム送信時にhandleSubmit関数が実行される */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex">
          {/* テキスト入力欄 */}
          <input
            type="text"
            value={input} // 入力値はinputステートと連動
            onChange={(e) => setInput(e.target.value)} // 入力があるたびにsetInputで値を更新
            placeholder="質問を入力してください..."
            className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading} // 処理中は入力できないように無効化
          />
          {/* 送信ボタン */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:opacity-50"
            disabled={loading || !input.trim()} // 処理中または入力が空の場合は無効化
          >
            {loading ? '処理中...' : '送信'} {/* 処理中は表示テキストを変更 */}
          </button>
        </div>
      </form>
    </div>
  );
} 