import { aiRouter } from "./ai-router";

// ==================== Generate Article ====================
export async function generateArticle(
  prompt: string,
  keywords: string[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const keywordList = keywords.join("، ");

  const systemPrompt = `تو یک نویسنده محتوای فارسی و متخصص سئو هستی.
  موضوع: آموزش زبان انگلیسی
  کلمات کلیدی: ${keywordList}
  
  یک مقاله کامل و باکیفیت به زبان فارسی بنویس.
  
  🔴 **فقط تگ‌های HTML زیر رو استفاده کن. از هیچ تگ دیگه‌ای استفاده نکن:**
  
  <h1>عنوان جذاب مقاله</h1>
  
  <h2>عنوان بخش‌های اصلی</h2>
  
  <h3>عنوان زیربخش‌ها یا سوالات FAQ</h3>
  
  <p>پاراگراف‌ها (هر پاراگراف حداکثر ۳-۴ خط)</p>
  
  <ul>
  <li>آیتم لیست نشانه‌دار</li>
  </ul>
  
  <ol>
  <li>آیتم لیست شماره‌دار</li>
  </ol>
  
  <strong>متن بولد</strong>
  
  <em>متن ایتالیک</em>
  
  <br/> (برای فاصله بین بخش‌ها)
  
  <hr/> (برای جداکننده بین بخش‌های بزرگ)
  
  🔴 **ساختار دقیق مقاله:**
  
  1. <h1>عنوان اصلی</h1>
  2. <p>مقدمه (۱۰۰-۱۵۰ کلمه)</p>
  3. <hr/>
  4. <h2>بخش اول</h2>
     <p>پاراگراف</p>
     <br/>
  5. <h2>بخش دوم</h2>
     <p>پاراگراف</p>
     <ul> یا <ol>
     <li>آیتم‌ها</li>
     </ul>
     <br/>
  6. <h2>بخش سوم</h2>
     <p>پاراگراف</p>
     <br/>
  7. <hr/>
  8. <h2>سوالات متداول</h2>
     <h3>سوال ۱؟</h3>
     <p>پاسخ کوتاه و مفید (۲-۳ خط)</p>
     <br/>
     <h3>سوال ۲؟</h3>
     <p>پاسخ کوتاه و مفید (۲-۳ خط)</p>
     <br/>
     <h3>سوال ۳؟</h3>
     <p>پاسخ کوتاه و مفید (۲-۳ خط)</p>
     <br/>
  9. <hr/>
  10. <h2>جمع‌بندی</h2>
      <p>نتیجه‌گیری و دعوت به اقدام</p>
  
  🔴 **قوانین طلایی:**
  
  - بین هر h2 و محتوای قبلی حتماً <br/> بذار
  - بین هر سوال و جواب FAQ حتماً <br/> بذار
  - بین بخش‌های اصلی <hr/> بذار
  - پاراگراف‌ها را کوتاه نگه دار
  - از <strong> برای کلمات کلیدی استفاده کن
  - نیم‌فاصله را رعایت کن
  - محتوا کاملاً آموزشی و کاربردی باشد
  - از اسم برندهای خاص به ندرت و فقط در حد اشاره استفاده کن`;
  const result = await aiRouter.generateText(systemPrompt, prompt, {
    temperature: options?.temperature || 0.8,
    maxTokens: options?.maxTokens || 4096,
  });

  if (!result.success) {
    throw new Error(result.error || "خطا در تولید محتوا");
  }

  console.log(`📝 Generated with: ${result.modelUsed}`);
  return cleanResponse(result.text);
}

// ==================== Generate SEO Metadata ====================
export async function generateSEOMetadata(
  title: string,
  content: string,
  keywords: string[]
): Promise<{
  metaTitle: string;
  metaDescription: string;
  slug: string;
  excerpt: string;
  tags: string[];
  category: string;
  readingTime: number;
}> {
  const systemPrompt = `تو یک متخصص سئو فارسی هستی.
بر اساس عنوان و محتوای مقاله، متادیتای زیر رو تولید کن.
فقط JSON خروجی بده، هیچ توضیح اضافه‌ای ننویس.

{
  "metaTitle": "عنوان سئو (دقیقاً ۵۰-۶۰ کاراکتر، جذاب، شامل کلمه کلیدی)",
  "metaDescription": "توضیحات متا (دقیقاً ۱۲۰-۱۵۵ کاراکتر، ترغیب‌کننده به کلیک، شامل کلمه کلیدی)",
  "slug": "english-only-slug-with-dashes (فقط حروف انگلیسی و خط تیره، مثال: learn-english-tips)",
  "excerpt": "خلاصه جذاب مقاله (۱۳۰-۱۶۰ کاراکتر، ترغیب‌کننده به خواندن)",
  "tags": ["برچسب۱", "برچسب۲", "برچسب۳", "برچسب۴"],
  "category": "یک دسته‌بندی از بین: گرامر، مکالمه، آیلتس، لغات، لیسنینگ، رایتینگ، تلفظ، مبتدیان",
  "readingTime": عدد_دقیقه_مطالعه
}

قوانین slug:
- فقط حروف کوچک انگلیسی a-z
- کلمات با خط تیره جدا بشن
- بدون اعداد، بدون کاراکتر خاص
- حداکثر ۴-۵ کلمه
- مثال درست: "present-perfect-guide"
- مثال غلط: "راهنمای-زمان-حال-کامل"`;

  const userPrompt = `Title: ${title}\nKeywords: ${keywords.join(", ")}\nContent (first 1500 chars): ${content.slice(0, 1500)}`;

  const result = await aiRouter.generateText(systemPrompt, userPrompt, {
    temperature: 0.3,
    maxTokens: 500,
    responseFormat: "json_object",
  });

  // Default values in case AI fails
  const defaults = {
    metaTitle: title.slice(0, 60),
    metaDescription: content.replace(/<[^>]*>/g, "").slice(0, 155),
    slug: generateSlugFromTitle(title),
    excerpt: content.replace(/<[^>]*>/g, "").slice(0, 160),
    tags: keywords.slice(0, 4),
    category: keywords[0] || "عمومی",
    readingTime: Math.ceil(
      content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200
    ) || 5,
  };

  if (!result.success) {
    console.error("SEO generation failed, using defaults");
    return defaults;
  }

  try {
    const parsed = JSON.parse(result.text);

    // Validate and fix each field
    return {
      metaTitle: validateString(parsed.metaTitle, defaults.metaTitle, 60),
      metaDescription: validateString(
        parsed.metaDescription,
        defaults.metaDescription,
        160
      ),
      slug: validateSlug(parsed.slug, defaults.slug),
      excerpt: validateString(parsed.excerpt, defaults.excerpt, 200),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : defaults.tags,
      category: validateString(parsed.category, defaults.category, 30),
      readingTime: typeof parsed.readingTime === "number" && parsed.readingTime > 0
        ? parsed.readingTime
        : defaults.readingTime,
    };
  } catch (error) {
    console.error("Failed to parse SEO JSON, using defaults");
    return defaults;
  }
}

// ==================== Helpers ====================

function cleanResponse(text: string): string {
  let cleaned = text;

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```html?/g, "").replace(/```/g, "");

  // Remove JSON wrapper
  if (cleaned.trim().startsWith("{") && cleaned.includes('"content"')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.content) cleaned = parsed.content;
    } catch {}
  }

  // Fix escaped characters
  cleaned = cleaned
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");

  // Convert markdown bold/italic to HTML
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  cleaned = cleaned.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // If no HTML tags, wrap in paragraphs
  if (!/<[^>]+>/.test(cleaned)) {
    cleaned = cleaned
      .split("\n\n")
      .map((p) => `<p>${p.trim()}</p>`)
      .join("\n");
  }

  return cleaned.trim();
}

function generateSlugFromTitle(title: string): string {
  // Convert Persian to transliterated English (very basic)
  // Remove HTML tags
  const cleanTitle = title.replace(/<[^>]*>/g, "");

  // Try to extract English words first
  const englishMatch = cleanTitle.match(/[a-zA-Z\s-]+/g);
  if (englishMatch) {
    return englishMatch
      .join("-")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  }

  // Fallback: use timestamp + first keyword
  return `article-${Date.now().toString(36)}`;
}

function validateString(value: any, fallback: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }
  return value.trim().slice(0, maxLength);
}

function validateSlug(value: any, fallback: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }

  // Clean slug: only lowercase English letters, numbers, hyphens
  let slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-") // Replace non-English chars with hyphen
    .replace(/-+/g, "-") // Remove multiple hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  // If after cleaning, slug is empty or too short, use fallback
  if (slug.length < 3 || slug === "-") {
    return fallback;
  }

  return slug.slice(0, 80);
}