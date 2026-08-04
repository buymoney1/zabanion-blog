import { prisma } from "@/lib/prisma";
import { generateResearchedArticle } from "./ai-content-generator";
import { generateSEOMetadata } from "./ai";

interface AutoBlogResult {
  success: boolean;
  article?: any;
  error?: string;
  poolName: string;
  keywords: string[];
  wordCount: number;
  passedValidation: boolean;
  validationErrors: string[];
}

function validateArticle(content: string, title: string): { passed: boolean; errors: string[] } {
  const errors: string[] = [];
  const plainText = content.replace(/<[^>]*>/g, "").trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  if (wordCount < 500) {
    errors.push(`کلمات: ${wordCount} (حداقل ۵۰۰)`);
  }
  if (!title || title.length < 10) {
    errors.push("عنوان کوتاه است");
  }
  const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
  if (h2Count < 2) {
    errors.push(`Heading: ${h2Count} (حداقل ۲)`);
  }
  const pCount = (content.match(/<p[^>]*>/gi) || []).length;
  if (pCount < 3) {
    errors.push(`پاراگراف: ${pCount} (حداقل ۳)`);
  }
  if (/آموزشگاه الف|آموزشگاه ب|آموزشگاه ج/i.test(content)) {
    errors.push("اسم ساختگی دارد");
  }

  return { passed: errors.length === 0, errors };
}

/**
 * Check if an article with EXACTLY this set of keywords already exists
 * The article must contain ALL of these keywords and NO extra ones
 */
async function isExactMatchExists(keywords: string[]): Promise<boolean> {
  const sortedKeywords = [...keywords].sort();
  const keywordCount = sortedKeywords.length;

  // Find articles that have ALL these keywords
  const articles = await prisma.seoArticle.findMany({
    where: {
      keywords: { hasEvery: sortedKeywords }, // ⭐ مقاله‌ای که همه این کلمات رو داره
    },
    select: { id: true, keywords: true },
  });

  // Check if any article has EXACTLY this set (no more, no less)
  for (const article of articles) {
    const articleKeywords = [...article.keywords].sort();
    
    // تعداد کلمات باید دقیقاً برابر باشه
    if (articleKeywords.length !== keywordCount) continue;
    
    // تک‌تک کلمات باید match باشن
    const isExact = articleKeywords.every((kw, i) => kw === sortedKeywords[i]);
    
    if (isExact) {
      console.log(`  ⏩ exact match found: article ${article.id}`);
      return true;
    }
  }

  return false;
}

export async function autoGenerateAndPublish(): Promise<AutoBlogResult> {
  console.log("\n🤖 AUTO BLOGGER\n");

  try {
    // Step 1: Get all active pools
    const allPools = await prisma.keywordPool.findMany({
      where: { isActive: true },
    });

    if (allPools.length === 0) {
      return {
        success: false,
        error: "هیچ استخر کلیدواژه فعالی نیست",
        poolName: "",
        keywords: [],
        wordCount: 0,
        passedValidation: false,
        validationErrors: ["No pools"],
      };
    }

    // Step 2: Shuffle pools so we don't always start from same one
    const shuffled = [...allPools].sort(() => Math.random() - 0.5);

    // Step 3: Find first pool that doesn't have an exact article yet
    let selectedPool: typeof allPools[0] | null = null;

    console.log(`🔍 Scanning ${shuffled.length} pools for new topics...\n`);

    for (const pool of shuffled) {
      const sortedKeywords = [...pool.keywords].sort();
      
      console.log(`  📦 "${pool.name}" (${sortedKeywords.length} keywords)`);
      
      const alreadyExists = await isExactMatchExists(sortedKeywords);

      if (alreadyExists) {
        console.log(`  ⏭️ SKIP: Article already exists for this exact keyword set\n`);
        continue; // برو سراغ گروه بعدی
      }

      console.log(`  ✅ FRESH: No article exists for this exact set\n`);
      selectedPool = pool;
      break; // این گروه رو انتخاب کن
    }

    if (!selectedPool) {
      return {
        success: false,
        error: "همه گروه‌ها مقاله دارند - مقاله جدیدی برای تولید نیست",
        poolName: "",
        keywords: [],
        wordCount: 0,
        passedValidation: false,
        validationErrors: ["All pools covered"],
      };
    }

    const pool = selectedPool;
    const keywords = [...pool.keywords].sort(); // ⭐ Sorted for consistency
    const topic = pool.name;

    console.log(`📦 Selected: "${pool.name}"`);
    console.log(`🎯 Keywords (${keywords.length}): ${keywords.join(" | ")}\n`);

    // Step 4: Generate with ALL keywords from this pool
    console.log("✍️ Generating article...");
    const { title, content, metaDescription } = await generateResearchedArticle(
      keywords,
      topic
    );

    // Step 5: Validate
    console.log("🔍 Validating...");
    const validation = validateArticle(content, title);
    const wordCount = content
      .replace(/<[^>]*>/g, "")
      .split(/\s+/)
      .filter(Boolean).length;

    if (!validation.passed) {
      console.log("❌ Validation failed:", validation.errors);

      await prisma.cronJobLog.create({
        data: {
          jobName: "auto-blogger",
          status: "skipped",
          details: JSON.stringify({
            pool: pool.name,
            keywords,
            errors: validation.errors,
            wordCount,
          }),
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });

      return {
        success: false,
        error: "مقاله استانداردهای کیفی را ندارد",
        poolName: pool.name,
        keywords,
        wordCount,
        passedValidation: false,
        validationErrors: validation.errors,
      };
    }

    // Step 6: Generate SEO metadata
    console.log("🎯 Generating SEO metadata...");
    const seoData = await generateSEOMetadata(title, content, keywords);

    // Step 7: Generate unique slug
    const baseSlug =
      seoData.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 80);

    let slug = baseSlug || `article-${Date.now().toString(36)}`;
    let counter = 1;
    while (await prisma.seoArticle.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Step 8: PUBLISH
    console.log("📤 Publishing article...");
    const article = await prisma.seoArticle.create({
      data: {
        title: seoData.metaTitle || title,
        slug,
        content,
        excerpt: seoData.excerpt || metaDescription || "",
        metaTitle: seoData.metaTitle || title.slice(0, 60),
        metaDescription: seoData.metaDescription || metaDescription || "",
        ogTitle: seoData.metaTitle || title,
        ogDescription: seoData.metaDescription || "",
        keywords,
        tags: seoData.tags || keywords.slice(0, 5),
        category: seoData.category || pool.category || keywords[0] || "عمومی",
        wordCount,
        readingTime: seoData.readingTime || Math.ceil(wordCount / 200) || 5,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    // Step 9: Log success
    await prisma.cronJobLog.create({
      data: {
        jobName: "auto-blogger",
        status: "success",
        details: JSON.stringify({
          articleId: article.id,
          slug: article.slug,
          pool: pool.name,
          keywords,
          wordCount,
        }),
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    console.log(`\n✅ Published: ${article.slug} (${wordCount} words)`);
    console.log(`📦 Pool: "${pool.name}" is now covered\n`);

    return {
      success: true,
      article,
      poolName: pool.name,
      keywords,
      wordCount,
      passedValidation: true,
      validationErrors: [],
    };
  } catch (error: any) {
    console.error("❌ Fatal error:", error.message);

    await prisma.cronJobLog.create({
      data: {
        jobName: "auto-blogger",
        status: "failed",
        error: error.message,
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    return {
      success: false,
      error: error.message,
      poolName: "",
      keywords: [],
      wordCount: 0,
      passedValidation: false,
      validationErrors: [error.message],
    };
  }
}