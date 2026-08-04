// src/lib/ai-content-generator.ts

import { aiRouter } from "./ai-router";
import { researchTopic, ResearchData } from "./serper-search";

// ==================== Types ====================
interface ExtractedData {
  names: string[];
  prices: string[];
  addresses: string[];
  phones: string[];
  statistics: string[];
  features: string[];
  quotes: string[];
}

// ==================== Main ====================
export async function generateResearchedArticle(
  keywords: string[],
  topic?: string
): Promise<{
  title: string;
  content: string;
  metaDescription: string;
  researchData: {
    sourcesFound: number;
    sourcesScraped: number;
    modelUsed: string;
    relatedSearches: string[];
    extractedData: ExtractedData;
  };
}> {
  const articleTopic = topic || keywords.join(" - ");
  console.log(`\n🚀 GENERATING: ${articleTopic}\n`);

  const research = await doResearch(keywords);
  const extractedData = extractWithRegex(research.competitorContents.join("\n"));
  const { title, content, metaDescription } = await doGenerate(articleTopic, keywords, research, extractedData);

  console.log(`✅ "${title}" | ${research.sourcesScraped} src | ${countDataPoints(extractedData)} pts\n`);

  return {
    title, content, metaDescription,
    researchData: {
      sourcesFound: research.sourcesFound,
      sourcesScraped: research.sourcesScraped,
      modelUsed: "AI Router",
      relatedSearches: research.relatedSearches,
      extractedData,
    },
  };
}

// ==================== Research ====================
async function doResearch(keywords: string[]): Promise<ResearchData> {
  try {
    return await researchTopic(keywords, { num: 10 });
  } catch (error: any) {
    console.error("Research failed:", error.message);
    return {
      query: keywords.join(" "), sourcesFound: 0, sourcesScraped: 0,
      competitorAnalysis: "", competitorContents: [], topResults: [],
      relatedSearches: [], peopleAlsoAsk: [],
    };
  }
}

// ==================== Data Extraction ====================
function emptyData(): ExtractedData {
  return { names: [], prices: [], addresses: [], phones: [], statistics: [], features: [], quotes: [] };
}

function countDataPoints(d: ExtractedData): number {
  return d.names.length + d.prices.length + d.addresses.length + d.phones.length +
    d.statistics.length + d.features.length + d.quotes.length;
}

function unique(arr: string[]): string[] {
  return [...new Set(arr.filter(Boolean))];
}

function extractWithRegex(content: string): ExtractedData {
  if (!content || content.length < 50) {
    console.log("   ⏩ No content");
    return emptyData();
  }

  console.log("📋 Extracting...");

  // Names
  const names = unique([
    ...content.matchAll(/(?:آموزشگاه|موسسه|خانه|آکادمی|مرکز|مدرسه|کانون)\s+(?:زبان\s+)?(?:آیلتس\s+)?([آ-یa-zA-Z\s]{2,40})/gi)
  ].map(m => m[0].trim()).filter(n => n.length > 6 && n.length < 60)).slice(0, 20);

  // Prices
  const prices = unique([
    ...content.matchAll(/(\d+[\d,\/]*\s*(?:میلیون|هزار|تومان|ت|TM))\s*(?:تومان)?/gi)
  ].map(m => m[0].trim())).slice(0, 10);

  // Addresses
  const addresses = unique([
    ...content.matchAll(/(?:آدرس|واقع در|محله|منطقه|خیابان|بلوار|میدان|شعبه|نبش|کوچه)\s*:?\s*([آ-یa-zA-Z0-9\s،,\-]{5,80})/gi)
  ].map(m => (m[1] || m[0]).trim()).filter(a => a.length > 8)).slice(0, 10);

  // Phones
  const phones = unique([
    ...content.matchAll(/(?:۰۹|09)\s*-?\s*\d{2}\s*-?\s*\d{3}\s*-?\s*\d{2}\s*-?\s*\d{2}/g)
  ].map(m => m[0].replace(/\s/g, ''))).slice(0, 5);

  // Statistics
  const statistics = unique([
    ...content.matchAll(/(\d+[\d,.]*\s*(?:%|نفر|سال|ماه|هفته|روز|ساعت|جلسه|ترم|سطح|شعبه|مدرک|نمره|کلمه))/gi)
  ].map(m => m[0].trim())).slice(0, 15);

  // Features
  const features = unique([
    ...content.matchAll(/(?:دوره|کلاس|پکیج|آزمون|ماک|تضمینی|فشرده|خصوصی|آنلاین|حضوری|نیمه\s*خصوصی|استاد|منبع|کتاب)\s*:?\s*([آ-یa-zA-Z0-9\s،,\-]{3,60})/gi)
  ].map(m => m[0].trim()).filter(f => f.length > 6)).slice(0, 20);

  // Quotes
  const quotes = unique([
    ...content.matchAll(/["«]([^"«»]{15,200})["»]/g)
  ].map(m => m[1].trim()).filter(q => q.length > 10 && q.length < 200)).slice(0, 5);

  const result = { names, prices, addresses, phones, statistics, features, quotes };
  const total = countDataPoints(result);
  console.log(`   ✅ ${total} pts | ${names.length} names | ${prices.length} prices | ${features.length} features`);
  return result;
}

// ==================== Generate ====================
async function doGenerate(
  articleTopic: string,
  keywords: string[],
  research: ResearchData,
  extractedData: ExtractedData
): Promise<{ title: string; content: string; metaDescription: string }> {
  const hasResearch = research.sourcesScraped > 0;
  const sourcesText = research.competitorContents
    .map((c, i) => `--- منبع ${i + 1} ---\n${c.slice(0, 5000)}`)
    .join("\n\n");

  const prompt = buildPrompt(articleTopic, keywords, hasResearch, sourcesText, research, extractedData);

  console.log("✍️ Writing article...\n");

  const result = await aiRouter.generateText(prompt, `Write about: ${articleTopic}`, {
    temperature: 0.85, maxTokens: 12000,
  });

  if (!result.success) throw new Error(result.error || "Generation failed");

  const wordCount = result.text.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  console.log(`   Words: ${wordCount}`);

  return {
    title: extractTitle(result.text) || keywords[0],
    content: result.text,
    metaDescription: extractMeta(result.text),
  };
}

function buildPrompt(
  articleTopic: string,
  keywords: string[],
  hasResearch: boolean,
  sourcesText: string,
  research: ResearchData,
  extractedData: ExtractedData
): string {
  const dp = countDataPoints(extractedData);

  // Build data block with clear formatting
  let dataBlock = "";
  if (dp > 0) {
    const formatList = (label: string, items: string[]) => {
      if (!items.length) return "";
      return `**${label}:**\n${items.map((item, i) => `${i + 1}. ${item}`).join("\n")}\n\n`;
    };

    dataBlock = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 داده‌های واقعی استخراج‌شده (${dp} مورد)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${formatList("اسامی آموزشگاه‌ها و موسسات", extractedData.names)}
${formatList("قیمت‌ها و هزینه‌ها", extractedData.prices)}
${formatList("آدرس‌ها و محله‌ها", extractedData.addresses)}
${formatList("شماره تماس‌ها", extractedData.phones)}
${formatList("آمار و ارقام", extractedData.statistics)}
${formatList("ویژگی‌ها و خدمات", extractedData.features)}
${formatList("نقل قول‌ها", extractedData.quotes)}

⚠️ **تکلیف اجباری:**
- هر اسم واقعی باید حداقل یک بار در مقاله ذکر شود
- هر قیمت باید با زمینه و توضیح بیاید
- از اسم‌های ساختگی مثل "آموزشگاه الف" استفاده نکن
- این داده‌ها برگ برنده تو مقابل رقباست`;
  }

  const researchBlock = hasResearch ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 تحقیقات رقبا (${research.sourcesScraped} منبع)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${sourcesText.slice(0, 25000)}

**شکاف‌های محتوایی:** ${research.competitorAnalysis}

**سوالات واقعی گوگل:** ${research.peopleAlsoAsk.map(p => p.question).join(" | ") || "ندارد"}

**جستجوهای مرتبط:** ${research.relatedSearches.join("، ") || "ندارد"}
` : "";

  return `تو یک نویسنده فارسی‌زبان حرفه‌ای و متخصص سئو با ۱۵ سال تجربه در حوزه آموزش زبان هستی.

🎯 **ماموریت:** نوشتن بهترین و کامل‌ترین مقاله فارسی درباره "${articleTopic}"

${researchBlock}

${dataBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 قوانین طلایی نویسندگی
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

۱. **داده‌محور باش، نه شعارمحور.**
هر ادعایی که می‌کنی را با یک داده واقعی پشتیبانی کن.
اسم واقعی بیاور، قیمت واقعی بگو، آدرس واقعی بده.
هر ۲۰۰ کلمه = حداقل ۱ داده مشخص از لیست بالا.
داده‌های استخراج‌شده برگ برنده تو هستند - از همه استفاده کن.

۲. **صمیمی، روان، خودمانی بنویس.**
انگار داری با یک دوست باهوش حرف می‌زنی.
پاراگراف‌های کوتاه (۲-۴ خط). نیم‌فاصله کامل.
از "شما"، "تصور کنید"، "بیایید صادقانه نگاه کنیم" استفاده کن.

۳. **حشو و کلی‌گویی ممنوع.**
"همانطور که می‌دانید"، "لازم به ذکر است"، "شایان ذکر است" = مرگ محتوا.
هر جمله باید یک نکته جدید و مفید داشته باشد.
اگر جمله‌ای را می‌شود حذف کرد بدون اینکه چیزی از دست برود، حذفش کن.

۴. **ساختار منطقی و خوانا.**
از <h1> برای عنوان اصلی (فقط یکبار).
از <h2> برای بخش‌های اصلی.
از <h3> برای زیربخش‌ها و سوالات FAQ.
از <p> برای پاراگراف‌ها.
از <ul>/<ol> برای لیست‌ها.
از <strong> برای تأکید روی کلمات کلیدی.
از <em> برای نکات ظریف.
از <br/> و <hr/> برای جداسازی بخش‌ها.
از <table> فقط وقتی واقعاً به مقایسه کمک می‌کند.
از <div class="summary-box"> برای خلاصه ابتدای مقاله.
از <div class="warning-box"> برای هشدارهای مهم.
از <div class="tip-box"> برای نکات طلایی.

۵. **عمق بده، نه عرض.**
۵-۷ نکته را عمیقاً پوشش بده، نه ۲۰ نکته سطحی.
برای هر نکته بگو: چی هست؟ چرا مهمه؟ چطور انجامش بدم؟ مثال بزن.
بعد از هر آمار بگو "این یعنی..." تا خواننده معنی آن را بفهمد.

۶. **زاویه دید منحصربه‌فرد.**
حداقل یک بخش کامل را به چیزی اختصاص بده که هیچ رقیبی نگفته.
شکاف‌های تحلیل‌شده را پر کن.
سوالات بی‌پاسخ را جواب بده.

۷. **FAQ واقعی و مفید.**
از <h3> برای سوالات و <p> برای پاسخ‌ها استفاده کن.
پاسخ‌ها حداقل ۴-۵ خط و واقعاً مفید باشند، نه یک خطی.
به سوالاتی جواب بده که واقعاً در گوگل جستجو می‌شوند.

۸. **جمع‌بندی عملیاتی.**
پایان مقاله یک برنامه اقدام مشخص بده.
به خواننده بگو دقیقاً قدم بعدی چیست.
با یک سوال درگیرکننده تمام کن تا کامنت بگذارد.

۹. **طول مقاله:** ${hasResearch ? "حداقل ۱۸۰۰ کلمه (با این حجم داده، کمتر از این یعنی کمکاری)" : "حداقل ۱۲۰۰ کلمه"}.

۱۰. **فقط HTML خالص برگردان.** بدون markdown، بدون json، بدون توضیح اضافه.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 برو. بهترین مقاله‌ای که تا حالا نوشتی را بنویس.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// ==================== Helpers ====================
function extractTitle(html: string): string | null {
  const m = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() : null;
}

function extractMeta(html: string): string {
  const m = html.match(/<p[^>]*>(.*?)<\/p>/i);
  return m ? m[1].replace(/<[^>]+>/g, "").trim().slice(0, 160) : "";
}