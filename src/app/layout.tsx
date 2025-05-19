/**
 * アプリケーションのルートレイアウト
 * 
 * このファイルはNext.jsアプリケーションの基本レイアウト構造を定義します。
 * すべてのページで共有される要素（ヘッダー、フッターなど）をここに配置できます。
 * また、メタデータの設定もここで行います。
 */
import type { Metadata } from "next";
import "./globals.css";

// アプリケーションのメタデータ設定
export const metadata: Metadata = {
  title: "SMASHMATE-ANALYSIS", // ブラウザのタブに表示されるタイトル
  description: "スマッシュブラザーズの分析サイト", // 検索エンジン用の説明文
};

/**
 * ルートレイアウトコンポーネント
 * このコンポーネントはすべてのページをラップします
 * 
 * @param children - ページコンテンツ（各ページコンポーネント）
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0, overflow: 'auto', height: 'auto', width: '100%' }}>
      <body style={{ margin: 0, padding: 0, overflow: 'auto', height: 'auto', width: '100%', background: 'none' }}>
        {children} {/* 各ページの内容がここに挿入される */}
      </body>
    </html>
  );
}
