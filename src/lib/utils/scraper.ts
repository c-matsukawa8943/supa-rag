import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as url from 'url';

interface ScraperOptions {
  url: string;
  selector?: string;
  limit?: number;
  outputDir?: string;
}

/**
 * 指定されたURLから画像をスクレイピングして保存する
 */
export async function scrapeImages({
  url: targetUrl,
  selector = 'img',
  limit = Infinity,
  outputDir = './public/scraped-images'
}: ScraperOptions): Promise<string[]> {
  try {
    // ディレクトリが存在しない場合は作成
    await fs.ensureDir(outputDir);
    
    console.log(`🔍 ${targetUrl} からスクレイピングを開始します...`);
    
    // ウェブページを取得
    const { data } = await axios.get(targetUrl);
    const $ = cheerio.load(data);
    
    // 画像URLの配列を作成
    const imageUrls: string[] = [];
    const imageElements: Array<{url: string, element: any}> = [];
    
    $(selector).each((_, element) => {
      const src = $(element).attr('src');
      if (src && imageUrls.length < limit) {
        // 相対URLを絶対URLに変換
        const absoluteUrl = new URL(src, targetUrl).toString();
        imageUrls.push(absoluteUrl);
        imageElements.push({url: absoluteUrl, element});
      }
    });
    
    console.log(`🖼️ ${imageUrls.length}個の画像が見つかりました`);
    
    // 画像をダウンロードして保存
    const savedPaths: string[] = [];
    for (let i = 0; i < imageElements.length; i++) {
      const {url: imageUrl, element} = imageElements[i];
      
      try {
        // ファイル名を取得、または生成
        const urlObj = new URL(imageUrl);
        const fullFileName = path.basename(urlObj.pathname);
        const extension = path.extname(fullFileName);
        
        // imgタグから元のファイル名を取得
        let fileName = fullFileName;
        const srcValue = $(element).attr('src') || '';
        const srcBaseName = path.basename(srcValue);
        
        // 元のファイル名から拡張子の前の部分を取得
        if (srcBaseName) {
          const nameWithoutExt = srcBaseName.replace(/\.[^.]+$/, '');
          if (nameWithoutExt) {
            fileName = nameWithoutExt + extension;
          }
        }
        
        const filePath = path.join(outputDir, fileName || `image-${i + 1}${extension}`);
        
        // 画像をダウンロード
        const response = await axios({
          url: imageUrl,
          method: 'GET',
          responseType: 'arraybuffer'
        });
        
        // ファイルに保存
        await fs.writeFile(filePath, response.data);
        savedPaths.push(filePath);
        
        console.log(`✅ 保存完了 (${i + 1}/${imageElements.length}): ${fileName}`);
      } catch (err) {
        console.error(`❌ 画像の保存に失敗しました: ${imageUrl}`, err);
      }
    }
    
    console.log(`🎉 スクレイピング完了: ${savedPaths.length}個の画像を保存しました`);
    return savedPaths;
  } catch (error) {
    console.error('スクレイピング中にエラーが発生しました:', error);
    throw error;
  }
} 