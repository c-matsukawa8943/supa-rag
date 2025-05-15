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
  title: "Supa-rag", // ブラウザのタブに表示されるタイトル
  description: "Supa-rag", // 検索エンジン用の説明文
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
    <html lang="en">
      <body>
        {children} {/* 各ページの内容がここに挿入される */}
      </body>
    </html>
  );
}
