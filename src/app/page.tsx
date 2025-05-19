'use client';
// Linkは、Next.jsのリンクコンポーネント
import Link from 'next/link';
import Image from 'next/image';
// stylesは、CSSモジュール
import styles from './page.module.css';
import ChatInterface from '@/components/ChatInterface';
// useEffectフックを追加
import { useEffect, useRef } from 'react';

// YouTubeのための型定義
interface YouTubePlayer {
  playVideo: () => void;
  mute: () => void;
  destroy: () => void;
  setSize: (width: number, height: number) => void;
  setPlaybackQuality: (quality: string) => void;
  setVolume: (volume: number) => void;
}

interface YouTubeEvent {
  target: YouTubePlayer;
  data: number;
}

// キャラクターデータ型定義
interface CharacterData {
  id: number;
  name: string;
  imagePath: string;
}

// Homeコンポーネントは、ホームページのコンポーネント
export default function Home() {
  // YouTube Player APIを読み込むためのref
  const playerRef = useRef<YouTubePlayer | null>(null);
  
  // キャラクターデータ配列
  const characters: CharacterData[] = [
    { id: 1, name: 'マリオ', imagePath: '/scraped-images/01.マリオ.png' },
    { id: 2, name: 'ドンキーコング', imagePath: '/scraped-images/02.ドンキーコング.png' },
    { id: 3, name: 'リンク', imagePath: '/scraped-images/03.リンク.png' },
    { id: 4, name: 'サムス/ダークサムス', imagePath: '/scraped-images/04.サムス_05.ダークサムス.png' },
    { id: 6, name: 'ヨッシー', imagePath: '/scraped-images/06.ヨッシー.png' },
    { id: 7, name: 'カービィ', imagePath: '/scraped-images/07.カービィ.png' },
    { id: 8, name: 'フォックス', imagePath: '/scraped-images/08.フォックス.png' },
    { id: 9, name: 'ピカチュウ', imagePath: '/scraped-images/09.ピカチュウ.png' },
    { id: 10, name: 'ルイージ', imagePath: '/scraped-images/10.ルイージ.png' },
    { id: 11, name: 'ネス', imagePath: '/scraped-images/11.ネス.png' },
    { id: 12, name: 'キャプテン・ファルコン', imagePath: '/scraped-images/12.キャプテン・ファルコン.png' },
    { id: 13, name: 'プリン', imagePath: '/scraped-images/13.プリン.png' },
    { id: 14, name: 'ピーチ/デイジー', imagePath: '/scraped-images/14.ピーチ_15.デイジー.png' },
    { id: 16, name: 'クッパ', imagePath: '/scraped-images/16.クッパ.png' },
    { id: 17, name: 'アイスクライマー', imagePath: '/scraped-images/17.アイスクライマー.png' },
    { id: 18, name: 'シーク', imagePath: '/scraped-images/18.シーク.png' },
    { id: 19, name: 'ゼルダ', imagePath: '/scraped-images/19.ゼルダ.png' },
    { id: 20, name: 'ドクターマリオ', imagePath: '/scraped-images/20.ドクターマリオ.png' },
    { id: 21, name: 'ピチュー', imagePath: '/scraped-images/21.ピチュー.png' },
    { id: 22, name: 'ファルコ', imagePath: '/scraped-images/22.ファルコ.png' },
    { id: 23, name: 'マルス', imagePath: '/scraped-images/23.マルス.png' },
    { id: 24, name: 'ルキナ', imagePath: '/scraped-images/24.ルキナ.png' },
    { id: 25, name: 'こどもリンク', imagePath: '/scraped-images/25.こどもリンク.png' },
    { id: 26, name: 'ガノンドルフ', imagePath: '/scraped-images/26.ガノンドルフ.png' },
    { id: 27, name: 'ミュウツー', imagePath: '/scraped-images/27.ミュウツー.png' },
    { id: 28, name: 'ロイ', imagePath: '/scraped-images/28.ロイ.png' },
    { id: 29, name: 'クロム', imagePath: '/scraped-images/29.クロム.png' },
    { id: 30, name: 'Mr.ゲーム&ウォッチ', imagePath: '/scraped-images/30.Mr.ゲーム&ウォッチ.png' },
    { id: 31, name: 'メタナイト', imagePath: '/scraped-images/31.メタナイト.png' },
    { id: 32, name: 'ピット/ブラックピット', imagePath: '/scraped-images/32.ピット_33.ブラックピット.png' },
    { id: 34, name: 'ゼロスーツサムス', imagePath: '/scraped-images/34.ゼロスーツサムス.png' },
    { id: 35, name: 'ワリオ', imagePath: '/scraped-images/35.ワリオ.png' },
    { id: 36, name: 'スネーク', imagePath: '/scraped-images/36.スネーク.png' },
    { id: 37, name: 'アイク', imagePath: '/scraped-images/37.アイク.png' },
    { id: 38, name: 'ポケモントレーナー', imagePath: '/scraped-images/38.ポケモントレーナー.png' },
    { id: 39, name: 'ディディーコング', imagePath: '/scraped-images/39.ディディーコング.png' },
    { id: 40, name: 'リュカ', imagePath: '/scraped-images/40.リュカ.png' },
    { id: 41, name: 'ソニック', imagePath: '/scraped-images/41.ソニック.png' },
    { id: 42, name: 'デデデ', imagePath: '/scraped-images/42.デデデ.png' },
    { id: 43, name: 'ピクミン＆オリマー', imagePath: '/scraped-images/43.ピクミン＆オリマー.png' },
    { id: 44, name: 'ルカリオ', imagePath: '/scraped-images/44.ルカリオ.png' },
    { id: 45, name: 'ロボット', imagePath: '/scraped-images/45.ロボット.png' },
    { id: 46, name: 'トゥーンリンク', imagePath: '/scraped-images/46.トゥーンリンク.png' },
    { id: 47, name: 'ウルフ', imagePath: '/scraped-images/47.ウルフ.png' },
    { id: 48, name: 'むらびと', imagePath: '/scraped-images/48.むらびと.png' },
    { id: 49, name: 'ロックマン', imagePath: '/scraped-images/49.ロックマン.png' },
    { id: 50, name: 'Wii Fit トレーナー', imagePath: '/scraped-images/50.Wii Fit トレーナー.png' },
    { id: 51, name: 'ロゼッタ＆チコ', imagePath: '/scraped-images/51.ロゼッタ＆チコ.png' },
    { id: 52, name: 'リトルマック', imagePath: '/scraped-images/52.リトルマック.png' },
    { id: 53, name: 'ゲッコウガ', imagePath: '/scraped-images/53.ゲッコウガ.png' },
    { id: 54, name: '格闘Mii', imagePath: '/scraped-images/54.格闘Mii.png' },
    { id: 55, name: '剣術Mii', imagePath: '/scraped-images/55.剣術Mii.png' },
    { id: 56, name: '射撃Mii', imagePath: '/scraped-images/56.射撃Mii.png' },
    { id: 57, name: 'パルテナ', imagePath: '/scraped-images/57.パルテナ.png' },
    { id: 58, name: 'パックマン', imagePath: '/scraped-images/58.パックマン.png' },
    { id: 59, name: 'ルフレ', imagePath: '/scraped-images/59.ルフレ.png' },
    { id: 60, name: 'シュルク', imagePath: '/scraped-images/60.シュルク.png' },
    { id: 61, name: 'クッパJr.', imagePath: '/scraped-images/61.クッパJr..png' },
    { id: 62, name: 'ダックハント', imagePath: '/scraped-images/62.ダックハント.png' },
    { id: 63, name: 'リュウ', imagePath: '/scraped-images/63.リュウ.png' },
    { id: 64, name: 'ケン', imagePath: '/scraped-images/64.ケン.png' },
    { id: 65, name: 'クラウド', imagePath: '/scraped-images/65.クラウド.png' },
    { id: 66, name: 'カムイ', imagePath: '/scraped-images/66.カムイ.png' },
    { id: 67, name: 'ベヨネッタ', imagePath: '/scraped-images/67.ベヨネッタ.png' },
    { id: 68, name: 'インクリング', imagePath: '/scraped-images/68.インクリング.png' },
    { id: 69, name: 'リドリー', imagePath: '/scraped-images/69.リドリー.png' },
    { id: 70, name: 'シモン/リヒター', imagePath: '/scraped-images/70.シモン_71.リヒター.png' },
    { id: 72, name: 'キングクルール', imagePath: '/scraped-images/72.キングクルール.png' },
    { id: 73, name: 'しずえ', imagePath: '/scraped-images/73.しずえ.png' },
    { id: 74, name: 'ガオガエン', imagePath: '/scraped-images/74.ガオガエン.png' },
    { id: 75, name: 'パックンフラワー', imagePath: '/scraped-images/75.パックンフラワー.png' },
    { id: 76, name: 'ジョーカー', imagePath: '/scraped-images/76.ジョーカー.png' },
    { id: 77, name: '勇者', imagePath: '/scraped-images/77.勇者.png' },
    { id: 78, name: 'バンジョー＆カズーイ', imagePath: '/scraped-images/78.バンジョー＆カズーイ.png' },
    { id: 79, name: 'テリー', imagePath: '/scraped-images/79.テリー.png' },
    { id: 80, name: 'ベレトス', imagePath: '/scraped-images/80.ベレトス.png' },
    { id: 81, name: 'ミェンミェン', imagePath: '/scraped-images/81.ミェンミェン.png' },
    { id: 82, name: 'スティーブ', imagePath: '/scraped-images/82.スティーブ.png' },
    { id: 83, name: 'セフィロス', imagePath: '/scraped-images/83.セフィロス.png' },
    { id: 84, name: 'ホムヒカ', imagePath: '/scraped-images/84.ホムヒカ.png' },
    { id: 85, name: 'カズヤ', imagePath: '/scraped-images/85.カズヤ.png' },
    { id: 86, name: 'ソラ', imagePath: '/scraped-images/86.ソラ.png' },
  ];

  useEffect(() => {
    // YouTube動画ID
    const YOUTUBE_VIDEO_ID = '8sCRnkx2DmE';
    
    // YouTube APIをロードする関数
    const loadYouTubeAPI = () => {
      return new Promise<void>((resolve) => {
        // すでにAPIがロードされているか確認
        if (window.YT && window.YT.Player) {
          resolve();
          return;
        }
        
        // すでにスクリプトが存在するか確認
        const existingScript = document.getElementById('youtube-api');
        if (existingScript) {
          // APIがロード中なので、onYouTubeIframeAPIReadyが呼ばれるのを待つ
          window.onYouTubeIframeAPIReady = () => {
            resolve();
          };
          return;
        }
        
        // スクリプトを読み込む
        const tag = document.createElement('script');
        tag.id = 'youtube-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        
        // APIロード完了時に解決するPromise
        window.onYouTubeIframeAPIReady = () => {
          resolve();
        };
        
        // スクリプトを追加
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      });
    };
    
    // YouTube動画プレーヤーを初期化する関数
    const initializeYouTubePlayer = async () => {
      console.log('YouTube動画プレーヤーの初期化を開始します');
      // まずAPIをロード
      try {
        await loadYouTubeAPI();
        console.log('YouTube APIのロードに成功しました');
      } catch (error) {
        console.error('YouTube APIのロードに失敗しました:', error);
        return;
      }
      
      // プレーヤー用のコンテナを確認または作成
      let container = document.getElementById('youtube-background');
      if (!container) {
        console.log('コンテナが見つからないため、新しく作成します');
        container = document.createElement('div');
        container.id = 'youtube-background';
        
        const backgroundContainer = document.querySelector('.youtube-background-container');
        if (!backgroundContainer) {
          console.error('YouTubeバックグラウンドコンテナが見つかりません');
          return;
        }
        
        backgroundContainer.appendChild(container);
        console.log('YouTube背景コンテナにプレーヤー用DIVを追加しました');
      } else {
        console.log('既存のYouTubeコンテナを使用します');
      }
      
      // 以前のプレーヤーをクリーンアップ
      if (playerRef.current) {
        console.log('以前のプレーヤーをクリーンアップします');
        playerRef.current.destroy();
      }
      
      // 新しいプレーヤーを作成
      try {
        console.log('新しいYouTubeプレーヤーを作成しています...');
        
        playerRef.current = new window.YT.Player('youtube-background', {
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 1,          // 自動再生
            controls: 0,          // コントロールを非表示
            disablekb: 1,         // キーボード操作を無効化
            enablejsapi: 1,       // JavaScript APIを有効化
            iv_load_policy: 3,    // アノテーションを非表示
            loop: 1,              // ループ再生
            rel: 0,               // 関連動画を非表示
            fs: 0,                // フルスクリーンボタンを無効化
            modestbranding: 1,    // YouTubeロゴを最小限に
            playsinline: 1,       // iOSでインライン再生
            showinfo: 0,          // 動画情報を非表示
            mute: 1,              // ミュート解除（音を出す）
            playlist: YOUTUBE_VIDEO_ID, // ループ用のプレイリスト
            origin: window.location.origin, // オリジン設定
            start: 0,             // 開始時間（秒）
            title: 0,             // タイトルを非表示
            cc_load_policy: 0,    // 字幕を無効
            color: 'white'        // 進行バーの色
          },
          events: {
            'onReady': (event: YouTubeEvent) => {
              console.log('YouTubeプレーヤーの準備ができました');
              // 動画を再生、ミュート解除
              event.target.playVideo();
              
              // 音量を設定（0〜100）- 適度な音量に設定
              event.target.setVolume(30);
              
              // 高画質に設定
              event.target.setPlaybackQuality('hd1080');
              
              // サイズを調整
              updatePlayerSize();
            },
            'onStateChange': (event: YouTubeEvent) => {
              // 動画の状態が変わったときにログを出力
              console.log('YouTubeプレーヤーの状態が変更されました:', event.data);
              
              // 動画が終了したらリスタート
              if (event.data === window.YT.PlayerState.ENDED) {
                console.log('動画が終了したのでリスタートします');
                event.target.playVideo();
              }
              
              // 動画が再生されたことをログ
              if (event.data === window.YT.PlayerState.PLAYING) {
                console.log('YouTube動画が再生中です');
              }
            },
            'onError': (event: any) => {
              console.error('YouTubeプレーヤーエラー:', event.data);
            }
          }
        }) as YouTubePlayer;
        
        console.log('YouTubeプレーヤーの作成に成功しました');
      } catch (error) {
        console.error('YouTubeプレーヤーの初期化に失敗しました:', error);
      }
    };
    
    // プレーヤーサイズを更新する関数
    const updatePlayerSize = () => {
      if (!playerRef.current) {
        console.log('プレーヤーが初期化されていないため、サイズ調整をスキップします');
        return;
      }
      
      try {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const aspectRatio = 16 / 9;
        
        // ウィンドウのアスペクト比と動画のアスペクト比を比較
        let width, height;
        
        if (windowWidth / windowHeight > aspectRatio) {
          // ウィンドウが動画より横長の場合
          width = windowWidth;
          height = width / aspectRatio;
        } else {
          // ウィンドウが動画より縦長の場合
          height = windowHeight;
          width = height * aspectRatio;
        }
        
        // サイズを少し大きくして、画面の外にはみ出るようにする（余白を防ぐため）
        width = width * 1.2;
        height = height * 1.2;
        
        // プレーヤーのサイズを設定
        playerRef.current.setSize(Math.ceil(width), Math.ceil(height));
        console.log(`プレーヤーのサイズを ${width}x${height} に調整しました`);
      } catch (error) {
        console.error('プレーヤーのサイズ調整中にエラーが発生しました:', error);
      }
    };
    
    // 初期化を実行
    initializeYouTubePlayer();
    
    // ウィンドウリサイズイベントリスナーを追加
    window.addEventListener('resize', updatePlayerSize);
    
    // クリーンアップ関数
    return () => {
      window.removeEventListener('resize', updatePlayerSize);
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);
  
  // ホームページのコンポーネントを返す
  return (
    <div className="smash-container" style={{ width: '100%', maxWidth: '100%' }}>
      {/* YouTube動画背景 */}
      <div className="youtube-background-container" style={{ pointerEvents: 'none' }}>
        <div id="youtube-background" style={{ pointerEvents: 'none' }}></div>
        <div className="video-overlay" style={{ pointerEvents: 'none' }}></div>
      </div>
      
      {/* ヘッダー（バナーとナビを統合） */}
      <header className="smash-header" style={{ width: '100%' }}>
        {/* メインナビゲーション */}
        <nav className="smash-nav">
          <div className="smash-nav-icons">
            <Link href="#" className="smash-nav-item">
              <Image src="/scraped-images/icon-fighters.svg" alt="ファイター" width={40} height={40} className="smash-nav-icon" />
              <span>ファイター</span>
            </Link>
            <Link href="#" className="smash-nav-item">
              <Image src="/scraped-images/icon-modes.svg" alt="あそびかた" width={40} height={40} className="smash-nav-icon" />
              <span>あそびかた</span>
            </Link>
            <Link href="#" className="smash-nav-item">
              <Image src="/scraped-images/icon-stages.svg" alt="ステージ" width={40} height={40} className="smash-nav-icon" />
              <span>ステージ</span>
            </Link>
            <Link href="#" className="smash-nav-item">
              <Image src="/scraped-images/icon-items.svg" alt="アイテム" width={40} height={40} className="smash-nav-icon" />
              <span>アイテム</span>
            </Link>
            <Link href="#" className="smash-nav-item">
              <Image src="/scraped-images/icon-sound.svg" alt="サウンド" width={40} height={40} className="smash-nav-icon" />
              <span>サウンド</span>
            </Link>
            <Link href="#" className="smash-nav-item">
              <Image src="/scraped-images/icon-spirits.svg" alt="スピリッツ" width={40} height={40} className="smash-nav-icon" />
              <span>スピリッツ</span>
            </Link>
          </div>
        </nav>
        {/* メインバナー */}
        <div className="smash-banner" style={{ width: '100%' }}>
          <Image 
            src="/scraped-images/smash-logo.png" 
            alt="スマッシュメイト・アナリシス" 
            width={700}
            height={350}
            className="smash-logo"
            priority
          />
        </div>
      </header>
      
      {/* キャラクターセクション */}
      <section className="smash-section">
        <div className="smash-section-inner">
          <h2 className="smash-category-title">ファイター</h2>
          <p className="text-center" style={{ margin: '1rem 0 2rem', fontWeight: 500 }}>
            歴代スマブラシリーズに登場した全てのファイターを徹底分析！<br />
            総勢86体のキャラクターたちの性能やテクニックを詳しく解説します。
          </p>
          
          <div className="smash-character-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.8rem',
            margin: '2rem auto',
            background: 'transparent'
          }}>
            {characters.map((character) => (
              <Link href="#" key={character.id} 
                className="smash-character-item"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '0.8rem',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  background: 'transparent'
                }}
              >
                <div className="smash-character-wrapper" style={{
                  position: 'relative',
                  width: '110px',
                  height: '110px',
                  margin: '0 auto',
                  clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
                  background: 'linear-gradient(135deg, rgba(71,100,230,0.6) 0%, rgba(100,150,255,0.4) 100%)',
                  boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
                  transform: 'rotate(0deg) scale(1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid rgba(120,180,255,0.5)'
                }}>
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0) 70%)',
                    zIndex: 1
                  }}></div>
                  <Image 
                    src={character.imagePath}
                    alt={character.name}
                    width={105}
                    height={105}
                    className="smash-character-image"
                    style={{
                      objectFit: 'cover',
                      transform: 'scale(1.2)',
                      transition: 'transform 0.3s ease',
                      filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.4))',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.8) 100%)',
                    zIndex: 2,
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  }}></div>
                </div>
                <div className="smash-character-name" style={{
                  textAlign: 'center',
                  marginTop: '0.6rem',
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: '0.9rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)'
                }}>{character.name}</div>
              </Link>
            ))}
          </div>
          
          <style jsx global>{`
            /* 黒い背景の強制削除 */
            .smash-character-item,
            .smash-character-item a,
            .smash-character-item > div,
            .smash-character-grid > a {
              background: transparent !important;
              background-color: transparent !important;
              box-shadow: none !important;
            }
            
            /* 六角形コンテナのみスタイルを許可 - パフォーマンス最適化版 */
            .smash-character-wrapper {
              background: linear-gradient(135deg, rgba(71,100,230,0.6) 0%, rgba(100,150,255,0.4) 100%) !important;
              box-shadow: 0 8px 15px rgba(0,0,0,0.3) !important;
              border: 1px solid rgba(120,180,255,0.5) !important;
              will-change: transform, box-shadow;
            }
            
            .smash-character-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-bottom: 0.8rem;
              text-decoration: none;
              transition: transform 0.3s ease;
              /* フィルターを削除してパフォーマンス向上 */
            }
            
            .smash-character-item:hover .smash-character-wrapper {
              transform: rotate(30deg) scale(1.1);
              box-shadow: 0 12px 20px rgba(0,0,0,0.4), 
                          0 0 15px rgba(100,150,255,0.5) !important;
            }
            
            .smash-character-item:hover .smash-character-image {
              transform: scale(1.3) rotate(-30deg);
              filter: drop-shadow(0 8px 10px rgba(0,0,0,0.5));
            }
            
            .smash-character-item:hover .smash-character-wrapper > div:last-child {
              opacity: 1;
            }
            
            .smash-character-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
              gap: 0.8rem;
              margin-top: 2rem;
              background: transparent !important;
            }
            
            /* より良いパフォーマンスのためのスタイル */
            .smash-character-image, .smash-character-wrapper {
              backface-visibility: hidden;
              -webkit-backface-visibility: hidden;
            }

            @media (max-width: 768px) {
              .smash-character-grid {
                grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
                gap: 0.6rem;
              }
              
              .smash-character-wrapper {
                width: 85px !important;
                height: 85px !important;
              }
              
              .smash-character-image {
                width: 80px !important;
                height: 80px !important;
              }
            }
          `}</style>
        </div>
      </section>
      
      {/* スマブラアドバイザー - AIチャットセクション */}
      <section className="smash-section smash-advisor-section">
        <div className="smash-section-inner">
          <h2 className="smash-category-title">スマブラアドバイザー</h2>
          <p className="text-center" style={{ margin: '1rem 0 2rem', fontWeight: 500 }}>
            あなたのスマブラに関する質問に答えます！<br />
            ファイター選びから対戦テクニック、コンボ入力まで何でも聞いてください。
          </p>
          
          {/* ChatInterfaceコンポーネントがすべてのUI要素を内包 */}
          <ChatInterface />
        </div>
      </section>
      
      {/* あそびかたセクション */}
      <section className="smash-section">
        <div className="smash-section-inner">
          <h2 className="smash-category-title">あそびかた</h2>
          <p className="text-center" style={{ margin: '1rem 0 2rem', fontWeight: 500 }}>
            試合の流れからテクニックまで徹底解説！<br />
            初心者から上級者まで役立つ情報が満載です。
          </p>
          
          <div className="card-grid">
            <div className="card">
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.3rem', fontWeight: 700 }}>基本テクニック</h3>
              <p>必須のテクニックを動画付きで解説。ジャンプ・攻撃・回避などの基本動作をマスターしましょう。</p>
            </div>
            <div className="card">
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.3rem', fontWeight: 700 }}>対戦・勝ち方分析</h3>
              <p>様々な状況での立ち回りやキャラクター相性を分析。有利な状況を作る戦術を学びましょう。</p>
            </div>
            <div className="card">
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.3rem', fontWeight: 700 }}>上級者向けコンボ</h3>
              <p>キャラクター別の高度なコンボ技やフレームデータを解説。トッププレイヤーの技術を学びましょう。</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* ステージセクション */}
      <section className="smash-section">
        <div className="smash-section-inner">
          <h2 className="smash-category-title">ステージ</h2>
          <p className="text-center" style={{ margin: '1rem 0 2rem', fontWeight: 500 }}>
            各ステージの特徴と攻略法を解説！<br />
            ステージごとの有利キャラや立ち回りのコツを紹介します。
          </p>
          
          <div className="card-grid">
            <div className="card" style={{ borderLeft: '3px solid rgb(var(--accent-color))' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.3rem', fontWeight: 700, color: 'rgb(var(--accent-color))' }}>終点</h3>
              <p>最も公平なステージ。平坦で障害物がなく、純粋な対戦技術を試すのに最適です。</p>
            </div>
            <div className="card" style={{ borderLeft: '3px solid rgb(var(--accent-color))' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.3rem', fontWeight: 700, color: 'rgb(var(--accent-color))' }}>戦場</h3>
              <p>上部に3つの足場があり、立体的な立ち回りが求められる、バランスの取れたステージです。</p>
            </div>
            <div className="card" style={{ borderLeft: '3px solid rgb(var(--accent-color))' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.3rem', fontWeight: 700, color: 'rgb(var(--accent-color))' }}>ポケモンスタジアム</h3>
              <p>様々な地形に変化する特徴的なステージ。状況に応じた臨機応変な対応が必要です。</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* アイテムセクション */}
      <section className="smash-section">
        <div className="smash-section-inner">
          <h2 className="smash-category-title">アイテム</h2>
          <p className="text-center" style={{ margin: '1rem 0 2rem', fontWeight: 500 }}>
            全アイテムの効果と使い方を徹底解説！<br />
            試合を有利に進めるアイテム活用術を学びましょう。
          </p>
          
          <div className="card-grid">
            <div className="card" style={{ borderLeft: '3px solid rgb(var(--secondary-color))' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.3rem', fontWeight: 700, color: 'rgb(var(--secondary-color))' }}>スマッシュボール</h3>
              <p>最強の必殺技「最後の切りふだ」を発動できる特別なアイテム。破壊することで強力な攻撃が可能になります。</p>
            </div>
            <div className="card" style={{ borderLeft: '3px solid rgb(var(--secondary-color))' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.3rem', fontWeight: 700, color: 'rgb(var(--secondary-color))' }}>モンスターボール</h3>
              <p>投げるとポケモンが出現し、相手を攻撃。どのポケモンが出るかはランダムで、効果も様々です。</p>
            </div>
            <div className="card" style={{ borderLeft: '3px solid rgb(var(--secondary-color))' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.3rem', fontWeight: 700, color: 'rgb(var(--secondary-color))' }}>ハンマー</h3>
              <p>取得すると一定時間、強力な攻撃が可能になります。当たると相手は大きく吹き飛ばされます。</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* サウンドセクション */}
      <section className="smash-section">
        <div className="smash-section-inner">
          <h2 className="smash-category-title">サウンド</h2>
          <p className="text-center" style={{ margin: '1rem 0 2rem', fontWeight: 500 }}>
            スマブラの名曲をチェック！<br />
            シリーズを彩る800曲以上の楽曲をダウンロードも可能です。
          </p>
          
          <div className="sound-container" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '2rem',
            width: '100%' 
          }}>
            {/* プレイヤー部分 */}
            <div className="sound-player" style={{ 
              background: 'linear-gradient(135deg, rgba(25,25,112,0.8) 0%, rgba(65,105,225,0.6) 100%)',
              borderRadius: '12px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden',
              width: '100%'
            }}>
              <div className="player-visual" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.2,
                backgroundImage: 'url(/scraped-images/sound-visual.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 0
              }}></div>
              
              <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <div className="now-playing" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div className="album-art" style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                  }}>
                    <Image 
                      src="/scraped-images/album-main-theme.jpg" 
                      alt="大乱闘スマッシュブラザーズ メインテーマ" 
                      width={120} 
                      height={120}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  
                  <div className="track-info" style={{ flex: 1 }}>
                    <div style={{ 
                      color: 'white', 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      大乱闘スマッシュブラザーズ メインテーマ
                    </div>
                    <div style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      fontSize: '1rem',
                      marginBottom: '1rem' 
                    }}>
                      大乱闘スマッシュブラザーズ ULTIMATE
                    </div>
                    <div className="progress-bar" style={{
                      height: '6px',
                      width: '100%',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: '45%',
                        backgroundColor: '#4fd1c5',
                        boxShadow: '0 0 10px rgba(79, 209, 197, 0.8)'
                      }}></div>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.8rem',
                      marginTop: '0.5rem'
                    }}>
                      <span>1:28</span>
                      <span>3:12</span>
                    </div>
                  </div>
                </div>
                
                <div className="player-controls" style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  {['rewind', 'play', 'forward', 'shuffle', 'repeat'].map((control, index) => (
                    <button 
                      key={index}
                      style={{
                        width: index === 1 ? '60px' : '40px',
                        height: index === 1 ? '60px' : '40px',
                        borderRadius: '50%',
                        backgroundColor: index === 1 ? '#4764e6' : 'rgba(255,255,255,0.2)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: index === 1 ? '0 0 15px rgba(71, 100, 230, 0.7)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {control === 'play' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      ) : control === 'rewind' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="19 20 9 12 19 4 19 20"></polygon>
                          <line x1="5" y1="19" x2="5" y2="5"></line>
                        </svg>
                      ) : control === 'forward' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 4 15 12 5 20 5 4"></polygon>
                          <line x1="19" y1="5" x2="19" y2="19"></line>
                        </svg>
                      ) : control === 'shuffle' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="16 3 21 3 21 8"></polyline>
                          <line x1="4" y1="20" x2="21" y2="3"></line>
                          <polyline points="21 16 21 21 16 21"></polyline>
                          <line x1="15" y1="15" x2="21" y2="21"></line>
                          <line x1="4" y1="4" x2="9" y2="9"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="17 1 21 5 17 9"></polyline>
                          <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                          <polyline points="7 23 3 19 7 15"></polyline>
                          <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 人気楽曲リスト */}
            <div className="popular-tracks" style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
              width: '100%'
            }}>
              <h3 style={{ 
                fontSize: '1.3rem', 
                color: '#ffcc00', 
                marginBottom: '1.5rem',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>人気楽曲TOP 5</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { title: '大乱闘スマッシュブラザーズ メインテーマ', game: 'ULTIMATE', duration: '3:12', plays: '1,245,678' },
                  { title: 'ライフライトVer.2', game: 'ULTIMATE', duration: '2:55', plays: '987,421' },
                  { title: 'マリオ アスレチック', game: 'スーパーマリオ', duration: '2:37', plays: '856,432' },
                  { title: 'ゼルダの伝説メインテーマ', game: 'ゼルダの伝説', duration: '3:42', plays: '792,541' },
                  { title: 'ファイアーエムブレム テーマ', game: 'ファイアーエムブレム', duration: '3:02', plays: '703,128' }
                ].map((track, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    padding: '1rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}>
                    <div style={{
                      width: '30px',
                      textAlign: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: index === 0 ? '#ffcc00' : 'white',
                      marginRight: '1rem'
                    }}>{index + 1}</div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: '0.3rem'
                      }}>{track.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                        {track.game}
                      </div>
                    </div>
                    
                    <div style={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      fontSize: '0.8rem',
                      marginRight: '1rem'
                    }}>
                      {track.duration}
                    </div>
                    
                    <div style={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                      </svg>
                      {track.plays}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button style={{
                  backgroundColor: 'rgba(71, 100, 230, 0.2)',
                  color: '#4764e6',
                  border: '1px solid #4764e6',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(71, 100, 230, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(71, 100, 230, 0.2)';
                }}>
                  すべての楽曲を見る
                </button>
              </div>
            </div>
            
            {/* カテゴリ分け */}
            <div className="music-categories" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginTop: '1rem',
              width: '100%'
            }}>
              {[
                { title: 'マリオシリーズ', tracks: 155, image: '/scraped-images/category-mario.jpg' },
                { title: 'ゼルダシリーズ', tracks: 83, image: '/scraped-images/category-zelda.jpg' },
                { title: 'ポケモンシリーズ', tracks: 96, image: '/scraped-images/category-pokemon.jpg' },
                { title: 'ファイアーエムブレム', tracks: 72, image: '/scraped-images/category-fire-emblem.jpg' }
              ].map((category, index) => (
                <div key={index} style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                }}>
                  <div style={{
                    height: '150px', 
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                      padding: '2rem 1.5rem 1rem'
                    }}>
                      <h4 style={{ 
                        color: 'white', 
                        margin: 0,
                        fontSize: '1.2rem', 
                        fontWeight: 'bold' 
                      }}>{category.title}</h4>
                      <p style={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        margin: '0.3rem 0 0', 
                        fontSize: '0.9rem' 
                      }}>{category.tracks}曲</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* 最新情報セクション */}
      <section className="smash-section">
        <div className="smash-section-inner">
          <h2 className="smash-category-title">最新情報</h2>
          <p className="text-center" style={{ margin: '1rem 0 2rem', fontWeight: 500 }}>
            スマブラの最新ニュースやイベント情報をチェックしよう！<br />
            大会情報、アップデート、開発者からのメッセージなどを随時更新中です。
          </p>
          
          {/* ニュースセクション */}
          <div className="news-container" style={{ marginBottom: '3rem', width: '100%' }}>
            {/* メインニュース */}
            <div className="main-news-card" style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              marginBottom: '2rem',
              position: 'relative',
              width: '100%'
            }}>
              <div style={{ position: 'relative', height: '400px' }}>
                <Image
                  src="/scraped-images/news-tournament.jpg"
                  alt="第5回スマッシュメイト全国大会"
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                  padding: '6rem 2rem 2rem'
                }}>
                  <div style={{
                    color: '#ffcc00',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem'
                  }}>大会情報</div>
                  <h3 style={{ 
                    color: 'white', 
                    fontSize: '2rem', 
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>第5回スマッシュメイト全国大会開催決定！</h3>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '1rem',
                    marginBottom: '1.5rem',
                    maxWidth: '700px' 
                  }}>
                    日本最大のスマブラ大会「スマッシュメイト全国大会」が今年も開催決定！
                    東京・大阪・名古屋・福岡の予選を勝ち抜いた猛者たちが集結し、日本一の座を争います。
                    今年は特別ゲストとして海外プロプレイヤーも参戦予定！
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button style={{
                      backgroundColor: '#4764e6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#3a56d4';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#4764e6';
                    }}>
                      <span>詳細を見る</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>2024年7月15日</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ニュースグリッド */}
            <div className="news-grid" style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
              width: '100%'
            }}>
              {[
                {
                  title: 'バランス調整アップデート Ver.13.0.2 配信開始',
                  category: 'アップデート情報',
                  date: '2024年6月20日',
                  image: '/scraped-images/news-update.jpg',
                  excerpt: '一部ファイターの性能調整および不具合修正のアップデートが配信開始。詳細はパッチノートをご確認ください。'
                },
                {
                  title: '開発者インタビュー：桜井政博氏が語る次世代スマブラの展望',
                  category: 'インタビュー',
                  date: '2024年6月12日',
                  image: '/scraped-images/news-interview.jpg',
                  excerpt: 'シリーズディレクターの桜井政博氏が次世代機向けの展望について語る特別インタビューを公開しました。'
                },
                {
                  title: 'オンライン大会「スマッシュチャレンジカップ」エントリー開始',
                  category: '大会情報',
                  date: '2024年6月5日',
                  image: '/scraped-images/news-online.jpg',
                  excerpt: '誰でも参加できるオンライン大会「スマッシュチャレンジカップ」のエントリーを開始しました。初心者から上級者まで歓迎！'
                }
              ].map((news, index) => (
                <div key={index} style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(20, 20, 30, 0.5)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                }}>
                  <div style={{ height: '160px', position: 'relative' }}>
                    <Image
                      src={news.image}
                      alt={news.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{
                      color: '#ffcc00',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      marginBottom: '0.5rem'
                    }}>{news.category}</div>
                    <h4 style={{ 
                      color: 'white', 
                      fontSize: '1.2rem', 
                      fontWeight: 'bold',
                      marginBottom: '0.8rem' 
                    }}>{news.title}</h4>
                    <p style={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '0.9rem',
                      marginBottom: '1rem',
                      lineHeight: '1.5'
                    }}>{news.excerpt}</p>
                    <div style={{ 
                      color: 'rgba(255,255,255,0.5)', 
                      fontSize: '0.8rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{news.date}</span>
                      <span style={{ 
                        color: '#4764e6', 
                        fontWeight: 'bold', 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        続きを読む
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 公式SNSリンク */}
          <div className="social-links" style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            marginTop: '2rem',
            width: '100%'
          }}>
            <h3 style={{ 
              fontSize: '1.3rem', 
              color: 'white', 
              marginBottom: '1rem' 
            }}>公式SNSをフォローして最新情報をチェック！</h3>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1.5rem',
              marginTop: '1.5rem',
              flexWrap: 'wrap'
            }}>
              {[
                { name: 'Twitter', color: '#1DA1F2', icon: 'twitter' },
                { name: 'YouTube', color: '#FF0000', icon: 'youtube' },
                { name: 'Discord', color: '#5865F2', icon: 'discord' },
                { name: 'Instagram', color: '#E1306C', icon: 'instagram' }
              ].map((social, index) => (
                <a 
                  href="#" 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    borderLeft: `3px solid ${social.color}`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ 
                    width: '30px', 
                    height: '30px', 
                    borderRadius: '50%', 
                    backgroundColor: social.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {social.icon === 'twitter' ? (
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                      ) : social.icon === 'youtube' ? (
                        <>
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                        </>
                      ) : social.icon === 'discord' ? (
                        <path d="M5.5 8.5 L9.5 8.5 L9.5 15.5 L7.5 17.5 L5.5 15.5 Z M18.5 8.5 L14.5 8.5 L14.5 15.5 L16.5 17.5 L18.5 15.5 Z M5.5 11.5 L5.5 11.5 L18.5 11.5 M9.5 8 C 9.5 8 10.5 5 12 5 C 13.5 5 14.5 8 14.5 8"></path>
                      ) : (
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      )}
                    </svg>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>{social.name}</span>
                </a>
              ))}
            </div>
            <p style={{ 
              color: 'rgba(255,255,255,0.6)', 
              fontSize: '0.9rem',
              marginTop: '1.5rem' 
            }}>
              公式SNSでは大会情報やゲームプレイのヒント、開発裏話など、<br />
              スマブラに関する様々な情報を随時発信中！
            </p>
          </div>
        </div>
      </section>
      
      {/* フッター */}
      <footer className="smash-footer">
        <div className="content-centered" style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '2rem', 
            margin: '1rem 0',
            flexWrap: 'wrap',
            textAlign: 'center'
          }}>
            <Link href="#" style={{ 
              textTransform: 'uppercase', 
              fontFamily: 'var(--title-font)', 
              fontWeight: 700,
              padding: '0.5rem 1rem',
              transition: 'var(--transition)',
              color: 'white'
            }}>トップ</Link>
            <Link href="#" style={{ 
              textTransform: 'uppercase', 
              fontFamily: 'var(--title-font)', 
              fontWeight: 700,
              padding: '0.5rem 1rem',
              transition: 'var(--transition)',
              color: 'white'
            }}>お問い合わせ</Link>
            <Link href="#" style={{ 
              textTransform: 'uppercase', 
              fontFamily: 'var(--title-font)', 
              fontWeight: 700,
              padding: '0.5rem 1rem',
              transition: 'var(--transition)',
              color: 'white'
            }}>PHEASANT</Link>
          </div>
          <p className="text-center" style={{ 
            fontSize: '0.8rem', 
            color: 'rgba(255, 255, 255, 0.7)', 
            marginTop: '1rem',
            fontFamily: 'var(--body-font)',
            letterSpacing: '0.05em',
            textAlign: 'center',
            width: '100%'
          }}>© 2024 SMASHMATE-ANALYSIS by pheasant</p>
        </div>
      </footer>
    </div>
  );
}

// YouTubeのための型拡張
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars: Record<string, any>;
          events: Record<string, (event: any) => void>;
        }
      ) => YouTubePlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}
