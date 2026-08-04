import * as cheerio from 'cheerio';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

// ۱. جستجو در داک‌داک‌گو و استخراج لینک اصلی
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $('.result').each((i, el) => {
      if (results.length >= 5) return false; 
      
      const title = $(el).find('.result__title').text().trim();
      let link = $(el).find('.result__url').attr('href')?.trim() || '';
      const snippet = $(el).find('.result__snippet').text().trim();

      // استخراج لینک اصلی از پارامتر uddg
      const uddgMatch = link.match(/[?&]uddg=([^&]+)/);
      if (uddgMatch) {
        link = decodeURIComponent(uddgMatch[1]);
      } else if (!link.startsWith('http')) {
         link = `https://${link}`;
      }

      if (title && link) {
        results.push({ title, link, snippet });
      }
    });
    return results;
  } catch (error) {
    console.error("DDG Search error:", error);
    return [];
  }
}

// ۲. جستجو در گوگل (احتمال بلاک شدن بالا است اما به عنوان شانس دوم اجرا می‌شود)
async function searchGoogle(query: string): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`;
    const response = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];

    $('div.g').each((i, el) => {
      if (results.length >= 5) return false;
      
      const title = $(el).find('h3').first().text().trim();
      let link = $(el).find('a').first().attr('href')?.trim() || '';
      const snippet = $(el).find('div[data-sncf="1"]').text().trim() || $(el).find('.VwiC3b').text().trim();

      // حذف مسیرهای اضافه گوگل از لینک (مثلاً /url?q=)
      if (link.startsWith('/url?q=')) {
        link = decodeURIComponent(link.split('/url?q=')[1].split('&')[0]);
      }

      if (title && link.startsWith('http') && !link.includes('google.com')) {
        results.push({ title, link, snippet });
      }
    });
    return results;
  } catch (error) {
    console.error("Google Search error:", error);
    return [];
  }
}

// ۳. تابع اصلی: ترکیب نتایج و حذف تکراری‌ها
export async function searchCombined(query: string): Promise<SearchResult[]> {
  console.log(`🔍 Searching across Google and DuckDuckGo for: "${query}"`);

  // اجرای همزمان هر دو جستجو
  const [googleRes, ddgRes] = await Promise.allSettled([
    searchGoogle(query),
    searchDuckDuckGo(query)
  ]);

  const googleData = googleRes.status === 'fulfilled' ? googleRes.value : [];
  const ddgData = ddgRes.status === 'fulfilled' ? ddgRes.value : [];

  // ترکیب همه نتایج
  const allResults = [...googleData, ...ddgData];

  // حذف لینک‌های تکراری با استفاده از Map
  const uniqueResultsMap = new Map<string, SearchResult>();
  allResults.forEach(item => {
    // برای دقت بیشتر، پروتکل‌های آخر و / اضافی رو نادیده می‌گیریم تا تکراری‌ها بهتر حذف شوند
    const cleanLink = item.link.replace(/\/$/, '').toLowerCase();
    if (!uniqueResultsMap.has(cleanLink)) {
      uniqueResultsMap.set(cleanLink, item);
    }
  });

  return Array.from(uniqueResultsMap.values()).slice(0, 10); // برگرداندن ۱۰ نتیجه برتر نهایی
}

// ۴. تابع استخراج محتوای هر لینک (Scraper)
export async function scrapePageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36" 
      },
      signal: AbortSignal.timeout(10000), // حداکثر ۱۰ ثانیه انتظار
    });

    if (!response.ok) return "";

    const html = await response.text();
    const $ = cheerio.load(html);

    // حذف بخش‌های نامربوط سایت برای استخراج متن خالص
    $('script, style, nav, footer, header, aside, noscript, iframe').remove();

    let content = '';
    // استخراج تیترها، پاراگراف‌ها و لیست‌ها
    $('h1, h2, h3, p, li').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 20) { // حذف متن‌های خیلی کوتاه
        content += text + '\n\n';
      }
    });

    // برگرداندن ۳۰۰۰ کاراکتر اول برای جلوگیری از سنگین شدن دیتای خروجی
    return content.substring(0, 3000).trim();
  } catch (error) {
    console.error(`Scrape error for ${url}:`, error);
    return "";
  }
}
