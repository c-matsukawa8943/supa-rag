import { useState, FormEvent, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Source = {
  file_name: string;
  page_num: number;
  content: string;
  similarity: number;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // メッセージ追加時のスクロール処理
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // メッセージ送信処理
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;
    
    // ユーザーのメッセージを追加
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage.content }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '回答の取得中にエラーが発生しました');
      }
      
      // アシスタントの回答を追加
      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // 回答のソース情報を設定
      if (result.sources && Array.isArray(result.sources)) {
        setSources(result.sources);
      }
      
    } catch (error) {
      console.error('エラーが発生しました:', error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'エラーが発生しました。しばらくしてからもう一度お試しください。' 
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* メッセージ表示エリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            <p>PDFファイルをアップロードして、質問を入力してください。</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
              } p-3 rounded-lg max-w-3/4 break-words`}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* ソース情報エリア */}
      {sources.length > 0 && (
        <div className="border-t p-4">
          <h3 className="font-medium mb-2">参照ソース:</h3>
          <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
            {sources.map((source, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <p>
                  <strong>ファイル:</strong> {source.file_name}（ページ: {source.page_num}）
                </p>
                <p>
                  <strong>一致度:</strong> {Math.round(source.similarity * 100)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="質問を入力してください..."
            className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            {loading ? '処理中...' : '送信'}
          </button>
        </div>
      </form>
    </div>
  );
} 