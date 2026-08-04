import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateArticle, generateSEOMetadata } from "@/lib/ai";

// Helper: generate unique slug
async function uniqueSlug(base: string): Promise<string> {
  let slug = base || `article-${Date.now().toString(36)}`;
  let counter = 1;
  while (await prisma.seoArticle.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { promptId, keywords, customPrompt } = await req.json();

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: "حداقل یک کلیدواژه وارد کنید" }, { status: 400 });
    }

    let promptText = customPrompt;
    if (promptId) {
      const prompt = await prisma.articlePrompt.findUnique({ where: { id: promptId } });
      if (prompt) promptText = prompt.prompt;
    }
    if (!promptText) {
      promptText = `یک مقاله جامع و کاربردی درباره "${keywords.join("، ")}" بنویس.`;
    }

    // Generate
    console.log("🚀 Generating:", keywords.join(", "));
    const htmlContent = await generateArticle(promptText, keywords);

    // Extract title
    const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title = h1Match ? h1Match[1].replace(/<[^>]*>/g, "").trim() : keywords[0];

    // Clean
    const cleanContent = htmlContent.replace(/<meta[^>]*>/gi, "").trim();

    // SEO metadata
    console.log("🔍 SEO metadata...");
    const seoData = await generateSEOMetadata(title, cleanContent, keywords);

    // Stats
    const wordCount = cleanContent.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;

    // Slug
    const baseSlug = seoData.slug
      ? seoData.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
      : title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
    const slug = await uniqueSlug(baseSlug || `article-${Date.now().toString(36)}`);

    // Create (⭐ ALWAYS draft)
    const article = await prisma.seoArticle.create({
      data: {
        title: seoData.metaTitle || title,
        slug,
        content: cleanContent,
        excerpt: seoData.excerpt || cleanContent.replace(/<[^>]*>/g, "").slice(0, 160),
        metaTitle: seoData.metaTitle || title.slice(0, 60),
        metaDescription: seoData.metaDescription || cleanContent.replace(/<[^>]*>/g, "").slice(0, 155),
        ogTitle: seoData.metaTitle || title,
        ogDescription: seoData.metaDescription || "",
        keywords,
        tags: seoData.tags?.length ? seoData.tags : keywords.slice(0, 4),
        category: seoData.category || keywords[0] || "عمومی",
        wordCount,
        readingTime: seoData.readingTime || Math.ceil(wordCount / 200) || 5,
        promptId: promptId || null,
        authorId: session.user.id,
        isPublished: false, // ⭐ ALWAYS DRAFT
      },
    });

    console.log("✅ Created draft:", article.slug);
    return NextResponse.json({ article });
  } catch (error: any) {
    console.error("❌ Generate error:", error);
    return NextResponse.json({ error: error.message || "خطا در تولید مقاله" }, { status: 500 });
  }
}