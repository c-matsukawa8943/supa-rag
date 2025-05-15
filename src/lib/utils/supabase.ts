import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabaseのURLを取得（設定がない場合は空文字列）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// 環境変数から匿名認証キーを取得（設定がない場合は空文字列）
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabaseクライアントインスタンスを作成して他のファイルからインポートできるようにエクスポート
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 