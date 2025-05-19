'use client';
// Linkは、Next.jsのリンクコンポーネント
import Link from 'next/link';
import Image from 'next/image';
// stylesは、CSSモジュール
import styles from './page.module.css';
// Homeコンポーネントは、ホームページのコンポーネント
export default function Home() {
  // ホームページのコンポーネントを返す
  return (
    <>
      <header className={styles.headerTop}>
        <div className={styles.headerContent}>
          <Image 
            src="/scraped-images/logo.png" 
            alt="Game8 Logo" 
            width={80} 
            height={40} 
            className={styles.logo}
          />
          <h1 className={styles.headerTitle}>スマッシュRAG</h1>
          <div className={styles.searchBar}>
            <input type="text" placeholder="攻略情報を探してみよう" className={styles.searchInput} />
            <button className={styles.searchButton}>検索</button>
          </div>
          <div className={styles.userOptions}>
            <button className={styles.loginButton}>ログイン</button>
          </div>
        </div>
        
      </header>
      <div className={styles.container}>
        {/* メインバナー画像 */}
        <div className={styles.mainBanner}>
          <Image 
            src="/scraped-images/Main.jpg" 
            alt="スマブラSPキャラクター集合" 
            width={1200} 
            height={240} 
            className={styles.bannerImage}
            priority
          />
          <div className={styles.contentsMenu}>
            <h2 className={styles.menuTitle}>目次</h2>
            <ul className={styles.menuList}>
              <li><a href="#character">キャラクター情報</a></li>
              <li><a href="#adventure">「灯火の星」攻略情報</a></li>
              <li><a href="#technique">上達テクニック情報</a></li>
              <li><a href="#database">データベース</a></li>
              <li><a href="#bbs">掲示板</a></li>
            </ul>
          </div>
        </div>

        

        <section id="character" className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Image 
              src="/scraped-images/personel.png" 
              alt="キャラクターアイコン" 
              width={24} 
              height={24} 
              className={styles.sectionIcon}
            />
            スマブラSPのキャラクター情報
          </h2>
          
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>
              <Image 
                src="/scraped-images/personel.png" 
                alt="キャラクターアイコン" 
                width={20} 
                height={20} 
                className={styles.subsectionIcon}
              />
              全キャラクター一覧
            </h3>
            <div className={styles.characterGrid}>
              {[...Array(86)].map((_, i) => {
                const num = i + 1;
                const paddedNum = num.toString().padStart(2, '0');
                let characterName = '';
                
                // キャラクター名を設定
                switch(num) {
                  case 1: characterName = 'マリオ'; break;
                  case 2: characterName = 'ドンキーコング'; break;
                  case 3: characterName = 'リンク'; break;
                  case 4: characterName = 'サムス'; break;
                  case 5: characterName = 'ダークサムス'; break;
                  case 6: characterName = 'ヨッシー'; break;
                  case 7: characterName = 'カービィ'; break;
                  case 8: characterName = 'フォックス'; break;
                  case 9: characterName = 'ピカチュウ'; break;
                  case 10: characterName = 'ルイージ'; break;
                  case 11: characterName = 'ネス'; break;
                  case 12: characterName = 'キャプテン・ファルコン'; break;
                  case 13: characterName = 'プリン'; break;
                  case 14: characterName = 'ピーチ'; break;
                  case 15: characterName = 'デイジー'; break;
                  case 16: characterName = 'クッパ'; break;
                  case 17: characterName = 'アイスクライマー'; break;
                  case 18: characterName = 'シーク'; break;
                  case 19: characterName = 'ゼルダ'; break;
                  case 20: characterName = 'ドクターマリオ'; break;
                  case 21: characterName = 'ピチュー'; break;
                  case 22: characterName = 'ファルコ'; break;
                  case 23: characterName = 'マルス'; break;
                  case 24: characterName = 'ルキナ'; break;
                  case 25: characterName = 'こどもリンク'; break;
                  case 26: characterName = 'ガノンドルフ'; break;
                  case 27: characterName = 'ミュウツー'; break;
                  case 28: characterName = 'ロイ'; break;
                  case 29: characterName = 'クロム'; break;
                  case 30: characterName = 'Mr.ゲーム&ウォッチ'; break;
                  case 31: characterName = 'メタナイト'; break;
                  case 32: characterName = 'ピット'; break;
                  case 33: characterName = 'ブラックピット'; break;
                  case 34: characterName = 'ゼロスーツサムス'; break;
                  case 35: characterName = 'ワリオ'; break;
                  case 36: characterName = 'スネーク'; break;
                  case 37: characterName = 'アイク'; break;
                  case 38: characterName = 'ポケモントレーナー'; break;
                  case 39: characterName = 'ディディーコング'; break;
                  case 40: characterName = 'リュカ'; break;
                  case 41: characterName = 'ソニック'; break;
                  case 42: characterName = 'デデデ'; break;
                  case 43: characterName = 'ピクミン＆オリマー'; break;
                  case 44: characterName = 'ルカリオ'; break;
                  case 45: characterName = 'ロボット'; break;
                  case 46: characterName = 'トゥーンリンク'; break;
                  case 47: characterName = 'ウルフ'; break;
                  case 48: characterName = 'むらびと'; break;
                  case 49: characterName = 'ロックマン'; break;
                  case 50: characterName = 'Wii Fit トレーナー'; break;
                  case 51: characterName = 'ロゼッタ＆チコ'; break;
                  case 52: characterName = 'リトルマック'; break;
                  case 53: characterName = 'ゲッコウガ'; break;
                  case 54: characterName = '格闘Mii'; break;
                  case 55: characterName = '剣術Mii'; break;
                  case 56: characterName = '射撃Mii'; break;
                  case 57: characterName = 'パルテナ'; break;
                  case 58: characterName = 'パックマン'; break;
                  case 59: characterName = 'ルフレ'; break;
                  case 60: characterName = 'シュルク'; break;
                  case 61: characterName = 'クッパJr.'; break;
                  case 62: characterName = 'ダックハント'; break;
                  case 63: characterName = 'リュウ'; break;
                  case 64: characterName = 'ケン'; break;
                  case 65: characterName = 'クラウド'; break;
                  case 66: characterName = 'カムイ'; break;
                  case 67: characterName = 'ベヨネッタ'; break;
                  case 68: characterName = 'インクリング'; break;
                  case 69: characterName = 'リドリー'; break;
                  case 70: characterName = 'シモン'; break;
                  case 71: characterName = 'リヒター'; break;
                  case 72: characterName = 'キングクルール'; break;
                  case 73: characterName = 'しずえ'; break;
                  case 74: characterName = 'ガオガエン'; break;
                  case 75: characterName = 'パックンフラワー'; break;
                  case 76: characterName = 'ジョーカー'; break;
                  case 77: characterName = '勇者'; break;
                  case 78: characterName = 'バンジョー＆カズーイ'; break;
                  case 79: characterName = 'テリー'; break;
                  case 80: characterName = 'ベレトス'; break;
                  case 81: characterName = 'ミェンミェン'; break;
                  case 82: characterName = 'スティーブ'; break;
                  case 83: characterName = 'セフィロス'; break;
                  case 84: characterName = 'ホムラ＆ヒカリ'; break;
                  case 85: characterName = 'カズヤ'; break;
                  case 86: characterName = 'ソラ'; break;
                  default: characterName = `キャラ${num}`;
                }
                
                // 特定のキャラクターの組み合わせは特別な画像名を使用
                let imagePath = '';
                if (num === 4 || num === 5) {
                  imagePath = '/scraped-images/04.サムス_05.ダークサムス.png';
                } else if (num === 14 || num === 15) {
                  imagePath = '/scraped-images/14.ピーチ_15.デイジー.png';
                } else if (num === 32 || num === 33) {
                  imagePath = '/scraped-images/32.ピット_33.ブラックピット.png';
                } else if (num === 70 || num === 71) {
                  imagePath = '/scraped-images/70.シモン_71.リヒター.png';
                } else if (num === 84) {
                  imagePath = '/scraped-images/84.ホムヒカ.png';
                } else {
                  imagePath = `/scraped-images/${paddedNum}.${characterName}.png`;
                }
                
                return (
                  <div key={num} className={styles.characterIconItem}>
                    <div className={styles.characterIconWrapper}>
                      <Image 
                        src={imagePath}
                        alt={characterName} 
                        width={40} 
                        height={40} 
                        className={styles.characterIconImage}
                      />
                    </div>
                    <span className={styles.characterIconName}>{characterName}</span>
                  </div>
                );
              })}
            </div>
            <Link href="/chat" className={styles.moreLink}>キャラクター詳細はこちら</Link>
          </div>
          
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>
              <Image 
                src="/scraped-images/tier1.png" 
                alt="ランキングアイコン" 
                width={20} 
                height={20} 
                className={styles.subsectionIcon}
              />
              最強キャラランク
            </h3>
            <div className={styles.characterRank}>
              <div className={styles.rankHeader}>
                <p className={styles.rankTitle}>▼現在の最強キャラはこの4体</p>
                <Image 
                  src="/scraped-images/ranking.png" 
                  alt="ランキング" 
                  width={28} 
                  height={28} 
                  className={styles.rankingIcon}
                />
              </div>
              <div className={styles.rankCharacters}>
                <div className={styles.characterCard}>
                  <div className={styles.characterImg}>ホムラ＆ヒカリ</div>
                  <p className={styles.characterName}>ホムラ＆ヒカリ</p>
                </div>
                <div className={styles.characterCard}>
                  <div className={styles.characterImg}>ジョーカー</div>
                  <p className={styles.characterName}>ジョーカー</p>
                </div>
                <div className={styles.characterCard}>
                  <div className={styles.characterImg}>シュルク</div>
                  <p className={styles.characterName}>シュルク</p>
                </div>
                <div className={styles.characterCard}>
                  <div className={styles.characterImg}>ピカチュウ</div>
                  <p className={styles.characterName}>ピカチュウ</p>
                </div>
              </div>
              <Link href="/chat" className={styles.moreLink}>キャラランク 最新版はこちらで確認</Link>
            </div>
          </div>
          
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>
              <Image 
                src="/scraped-images/chart.png" 
                alt="データアイコン" 
                width={20} 
                height={20} 
                className={styles.subsectionIcon}
              />
              全キャラのコンボや立ち回り｜データ集
            </h3>
            <div className={styles.gridLinks}>
              <Link href="/chat" className={styles.gridLink}>キャラ一覧｜立ち回りやコンボをチェック</Link>
              <Link href="/chat" className={styles.gridLink}>重さ比較</Link>
              <Link href="/chat" className={styles.gridLink}>移動速度比較</Link>
              <Link href="/chat" className={styles.gridLink}>急降下速度比較</Link>
              <Link href="/chat" className={styles.gridLink}>落下速度比較</Link>
              <Link href="/chat" className={styles.gridLink}>カラーバリエーション一覧</Link>
              <Link href="/chat" className={styles.gridLink}>新キャラ一覧</Link>
            </div>
          </div>
          
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>
              <Image 
                src="/scraped-images/trophy.png" 
                alt="トロフィーアイコン" 
                width={20} 
                height={20} 
                className={styles.subsectionIcon}
              />
              キャラ解放のやり方
            </h3>
            <div className={styles.gridLinks}>
              <Link href="/chat" className={styles.gridLink}>キャラの解放・出し方</Link>
              <Link href="/chat" className={styles.gridLink}>挑戦者の間の解放条件</Link>
            </div>
          </div>
          
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>
              <Image 
                src="/scraped-images/rate.png" 
                alt="評価アイコン" 
                width={20} 
                height={20} 
                className={styles.subsectionIcon}
              />
              キャラ調整情報
            </h3>
            <div className={styles.gridLinks}>
              <Link href="/chat" className={styles.gridLink}>Ver13.01のキャラ調整</Link>
              <Link href="/chat" className={styles.gridLink}>Ver13.0のキャラ調整</Link>
              <Link href="/chat" className={styles.gridLink}>Ver12.0のキャラ調整</Link>
              <Link href="/chat" className={styles.gridLink}>Ver11.0のキャラ調整</Link>
              <Link href="/chat" className={styles.gridLink}>Ver10.0のキャラ調整</Link>
              <Link href="/chat" className={styles.gridLink}>Ver9.0のキャラ調整</Link>
            </div>
          </div>
        </section>

        <section id="adventure" className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Image 
              src="/scraped-images/puzzle.png" 
              alt="パズルアイコン" 
              width={24} 
              height={24} 
              className={styles.sectionIcon}
            />
            スマブラSPの「灯火の星」攻略情報
          </h2>
          
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>灯火の星（アドベンチャー）の攻略情報</h3>
            <div className={styles.gridLinks}>
              <Link href="/chat" className={styles.gridLink}>灯火の星の攻略情報まとめ</Link>
              <Link href="/chat" className={styles.gridLink}>マップと出現キャラ一覧</Link>
              <Link href="/chat" className={styles.gridLink}>灯火の星のボス攻略</Link>
              <Link href="/chat" className={styles.gridLink}>ガリオン初戦の攻略</Link>
              <Link href="/chat" className={styles.gridLink}>最終決戦の攻略</Link>
              <Link href="/chat" className={styles.gridLink}>ドラキュラの攻略</Link>
            </div>
          </div>
        </section>

        <section id="technique" className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Image 
              src="/scraped-images/graph.png" 
              alt="グラフアイコン" 
              width={24} 
              height={24} 
              className={styles.sectionIcon}
            />
            上達テクニック情報
          </h2>
          
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>
              <Image 
                src="/scraped-images/quiz.png" 
                alt="クイズアイコン" 
                width={20} 
                height={20} 
                className={styles.subsectionIcon}
              />
              初心者向けのテクニック解説
            </h3>
            <div className={styles.gridLinks}>
              <Link href="/chat" className={styles.gridLink}>初心者が上手くなる方法</Link>
              <Link href="/chat" className={styles.gridLink}>初心者におすすめの強キャラ</Link>
              <Link href="/chat" className={styles.gridLink}>挑戦者のコツとおすすめキャラ</Link>
              <Link href="/chat" className={styles.gridLink}>急降下のやり方</Link>
              <Link href="/chat" className={styles.gridLink}>ジャスガのやり方</Link>
              <Link href="/chat" className={styles.gridLink}>小ジャンプのやり方</Link>
            </div>
          </div>
        </section>

        <section className={styles.searchSection}>
          <h2 className={styles.sectionTitle}>RAGチャットで質問する</h2>
          <p className={styles.searchDescription}>スマブラに関する質問をAIに聞いてみましょう！</p>
          <div className={styles.buttonContainer}>
            <Link href="/chat" className={styles.chatButton}>AIに質問する</Link>
            <Link href="/upload" className={styles.uploadButton}>攻略ガイドをアップロード</Link>
          </div>
        </section>

        <section id="database" className={styles.section}>
          <h2 className={styles.sectionTitle}>データベース</h2>
          <div className={styles.gridLinks}>
            <Link href="/chat" className={styles.gridLink}>アイテム一覧</Link>
            <Link href="/chat" className={styles.gridLink}>ポケモン一覧</Link>
            <Link href="/chat" className={styles.gridLink}>ステージ一覧</Link>
            <Link href="/chat" className={styles.gridLink}>スピリット一覧</Link>
            <Link href="/chat" className={styles.gridLink}>アシストフィギュア一覧</Link>
          </div>
        </section>

        <section id="bbs" className={styles.section}>
          <h2 className={styles.sectionTitle}>掲示板</h2>
          <div className={styles.bbsLinks}>
            <Link href="/chat" className={styles.bbsLink}>雑談掲示板</Link>
            <Link href="/chat" className={styles.bbsLink}>質問掲示板</Link>
            <Link href="/chat" className={styles.bbsLink}>攻略情報掲示板</Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialLink}>
              <Image 
                src="/scraped-images/twitter.png" 
                alt="Twitter" 
                width={32} 
                height={32} 
              />
            </a>
            <a href="#" className={styles.socialLink}>
              <Image 
                src="/scraped-images/Youtube.png" 
                alt="YouTube" 
                width={32} 
                height={32} 
              />
            </a>
          </div>
          <p>© 2024 スマブラSP攻略Wiki</p>
          <p className={styles.copyright}>
            本サイトに掲載されているデータ、画像等の無断使用・無断転載は固くお断りしております。
          </p>
        </footer>
      </div>
    </>
  );
}
