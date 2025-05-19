import { scrapeImages } from '../lib/utils/scraper';

// コマンドライン引数を解析
const args = process.argv.slice(2);
let url = '';
let selector = 'img';
let limit = Infinity;
let outputDir = './public/scraped-images';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--url' || arg === '-u') {
    url = args[++i];
  } else if (arg === '--selector' || arg === '-s') {
    selector = args[++i];
  } else if (arg === '--limit' || arg === '-l') {
    limit = parseInt(args[++i], 10);
  } else if (arg === '--output' || arg === '-o') {
    outputDir = args[++i];
  } else if (!url) {
    // 最初の無名引数はURLとして扱う
    url = arg;
  }
}

// URLが指定されていない場合はヘルプを表示
if (!url) {
  console.log(`
使用方法: npx ts-node src/scripts/scrape-images.ts [URL] [オプション]

オプション:
  --url, -u       スクレイピングするウェブサイトのURL（必須）
  --selector, -s  画像を選択するCSSセレクタ（デフォルト: 'img'）
  --limit, -l     ダウンロードする画像の最大数（デフォルト: 無制限）
  --output, -o    画像を保存するディレクトリ（デフォルト: './public/scraped-images'）

例:
  npx ts-node src/scripts/scrape-images.ts https://example.com
  npx ts-node src/scripts/scrape-images.ts --url https://example.com --selector ".content img" --limit 10
  `);
  process.exit(1);
}

// スクレイピングを実行
scrapeImages({ url, selector, limit, outputDir })
  .then(savedPaths => {
    console.log(`保存された画像のパス:`);
    savedPaths.forEach(path => console.log(`- ${path}`));
    process.exit(0);
  })
  .catch(error => {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }); 