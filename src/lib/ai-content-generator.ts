// src/lib/ai-content-generator.ts

import { aiRouter } from "./ai-router";
import { researchTopic, ResearchData } from "./serper-search";

// ==================== Types ====================
interface ExtractedData {
  entities: string[];
  numbersAndStats: string[];
  moneyValues: string[];
  quotes: string[];
  contactInfo: string[];
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
  const extractedData = extractGenericData(research.competitorContents.join("\n"));
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

// ==================== Generic Data Extraction ====================
function emptyData(): ExtractedData {
  return { entities: [], numbersAndStats: [], moneyValues: [], quotes: [], contactInfo: [] };
}

function countDataPoints(d: ExtractedData): number {
  return d.entities.length + d.numbersAndStats.length + d.moneyValues.length + d.quotes.length + d.contactInfo.length;
}

function unique(arr: string[]): string[] {
  return [...new Set(arr.filter(Boolean))];
}

function extractGenericData(content: string): ExtractedData {
  if (!content || content.length < 50) {
    console.log("   ⏩ No content");
    return emptyData();
  }

  console.log("📋 Extracting Generic Data...");

  // استخراج موجودیت‌های مهم (نام برندها، شرکت‌ها، محصولات، پلتفرم‌ها و...)
  const entities = unique([
    ...content.matchAll(/(?:شرکت|برند|پلتفرم|محصول|نرم‌افزار|سایت|موسسه|سازمان|فناوری|مدل)\s+([آ-یa-zA-Z\s]{3,40})/gi)
  ].map(m => m[1].trim())).slice(0, 15);

  // استخراج آمار، درصدها و اعداد مهم
  const numbersAndStats = unique([
    ...content.matchAll(/(\d+[\d,./]*\s*(?:%|درصد|نفر|سال|ماه|روز|ساعت|کیلو|متر|برابر|میلیون|میلیارد))/gi)
  ].map(m => m[0].trim())).slice(0, 15);

  // استخراج مبالغ و قیمت‌ها (در صورت وجود)
  const moneyValues = unique([
    ...content.matchAll(/(\d+[\d,\/]*\s*(?:تومان|ریال|دلار|یورو|پوند|Toman|USD))/gi)
  ].map(m => m[0].trim())).slice(0, 10);

  // استخراج نقل قول‌ها و جملات برجسته
  const quotes = unique([
    ...content.matchAll(/["«]([^"«»]{15,150})["»]/g)
  ].map(m => m[1].trim())).slice(0, 10);

  // استخراج اطلاعات تماس (ایمیل، تلفن)
  const contactInfo = unique([
    ...content.matchAll(/(?:[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})|(?:09\d{9})|(?:\b\d{3,4}-\d{4,8}\b)/g)
  ].map(m => m[0].trim())).slice(0, 5);

  const result = { entities, numbersAndStats, moneyValues, quotes, contactInfo };
  console.log(`   ✅ ${countDataPoints(result)} data points extracted.`);
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

  let dataBlock = "";
  if (dp > 0) {
    const formatList = (label: string, items: string[]) => items.length ? `**${label}:**\n${items.map((item, i) => `${i + 1}. ${item}`).join("\n")}\n\n` : "";
    dataBlock = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 داده‌های واقعی استخراج‌شده (${dp} مورد)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
این داده‌ها از بررسی رقبا به دست آمده‌اند تا محتوای تو دقیق و مستند باشد:

${formatList("موجودیت‌های مرتبط (برندها، محصولات، و ...)", extractedData.entities)}
${formatList("آمار و ارقام کلیدی", extractedData.numbersAndStats)}
${formatList("مبالغ و هزینه‌ها", extractedData.moneyValues)}
${formatList("نقل قول‌ها و عبارات مهم", extractedData.quotes)}

⚠️ **تکلیف اجباری:** 
- در طول مقاله، از این آمار و نام‌ها به عنوان فکت‌های مستند استفاده کن تا اعتبار مقاله (E-E-A-T) بالا برود.
- از اطلاعات ساختگی یا نام‌های فرضی مثل "شرکت الف" یا "سایت فلان" پرهیز کن.
`;
  }

  const researchBlock = hasResearch ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 تحقیقات سئو و بررسی رقبا
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
متن منابع برتر رقبا:
${sourcesText.slice(0, 25000)}

**شکاف‌های محتوایی رقبا:** ${research.competitorAnalysis}
**سوالات واقعی کاربران در گوگل:** ${research.peopleAlsoAsk.map(p => p.question).join(" | ") || "ندارد"}
**جستجوهای مرتبط:** ${research.relatedSearches.join("، ") || "ندارد"}
` : "";

  return `تو یک نویسنده ارشد فارسی‌زبان و استراتژیست سئو (SEO) هستی.

🎯 **ماموریت:** نوشتن یک مقاله جامع، مرجع و رتبه یک گوگل درباره موضوع: "${articleTopic}"
کلمات کلیدی اصلی: ${keywords.join("، ")}

${researchBlock}

${dataBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 قوانین طلایی و استانداردهای محتوایی
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

۱. **جامعیت و ارزش افزوده:**
صرفاً حرف‌های رقبا را تکرار نکن. اطلاعات را ترکیب کن، ساختار بهتری به آن‌ها بده و شکاف‌های محتوایی را با زاویه دید جدید و توضیحات عمیق‌تر پر کن. به جای کلی‌گویی، مثال بزن و چرایی/چگونگی را توضیح بده.

۲. **لحن و نگارش:**
لحن باید حرفه‌ای، روان، قابل اعتماد و در عین حال صمیمی باشد. پاراگراف‌ها را کوتاه نگه دار (حداکثر ۳-۴ خط). از نیم‌فاصله‌های استاندارد فارسی استفاده کن. از عبارات پرکننده و حشو (مثل "همانطور که می‌دانید"، "شایان ذکر است") خودداری کن.

۳. **ساختار حرفه‌ای HTML:**
فقط و فقط کد HTML خالص تولید کن (بدون تگ‌های markdown مثل \`\`\`html).
- <h1 class="text-3xl font-bold mb-6"> برای عنوان اصلی مقاله (فقط یک بار).
- <h2 class="text-2xl font-semibold mt-8 mb-4"> برای بخش‌های اصلی.
- <h3> برای زیرتیترها و سوالات متداول.
- <p class="mb-4 leading-relaxed"> برای متن‌ها.
- از <ul>, <ol>, <li> برای لیست‌ها استفاده کن تا خوانایی بالا برود.
- از <strong> برای برجسته کردن مفاهیم کلیدی و از <blockquote> برای نقل قول‌ها استفاده کن.
- از باکس‌های محتوایی استفاده کن: 
  <div class="summary-box bg-gray-100 p-4 rounded-lg mb-6"> برای خلاصه مقاله
  <div class="tip-box bg-amber-50 border-r-4 border-amber-500 p-4 my-4"> برای نکات طلایی
  <div class="warning-box bg-red-50 border-r-4 border-red-500 p-4 my-4"> برای هشدارها

۴. **سوالات متداول (FAQ):**
در انتهای مقاله، حتماً یک بخش FAQ شامل سوالات واقعی کاربران (بر اساس داده‌های بالا) با پاسخ‌های دقیق و کاربردی (حداقل ۴ خط برای هر پاسخ) اضافه کن.

۵. **نتیجه‌گیری و دعوت به اقدام (CTA):**
مقاله را با یک جمع‌بندی ساختاریافته، گام‌های عملی بعدی برای خواننده و یک سوال تعاملی برای ترغیب به کامنت‌گذاری به پایان برسان.

۶. **طول مقاله:**
حداقل ${hasResearch ? "۱۸۰۰" : "۱۲۰۰"} کلمه بنویس. کیفیت فدای کمیت نشود، اما تمام زوایای موضوع باید پوشش داده شود.

🚀 اکنون مقاله نهایی را به صورت HTML استایل‌دهی شده تولید کن.
`;
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
