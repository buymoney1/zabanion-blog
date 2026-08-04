import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSEOMetadata } from "@/lib/ai";
import { generateResearchedArticle } from "@/lib/ai-content-generator";

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
    const { keywords, topic } = await req.json();

    if (!keywords?.length) {
      return NextResponse.json({ error: "حداقل یک کلیدواژه وارد کنید" }, { status: 400 });
    }

    console.log("\n🔥 RESEARCH GENERATION STARTED 🔥\n");

    const { title, content, metaDescription, researchData } = await generateResearchedArticle(keywords, topic);

    const seoData = await generateSEOMetadata(title, content, keywords);

    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;

    const baseSlug = seoData.slug || title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
    const slug = await uniqueSlug(baseSlug || `article-${Date.now().toString(36)}`);

    const article = await prisma.seoArticle.create({
      data: {
        title: seoData.metaTitle || title,
        slug, content,
        excerpt: seoData.excerpt || metaDescription || "",
        metaTitle: seoData.metaTitle || title.slice(0, 60),
        metaDescription: seoData.metaDescription || metaDescription || "",
        ogTitle: seoData.metaTitle || title,
        ogDescription: seoData.metaDescription || "",
        keywords, tags: seoData.tags || keywords.slice(0, 5),
        category: seoData.category || keywords[0] || "عمومی",
        wordCount, readingTime: seoData.readingTime || Math.ceil(wordCount / 200) || 5,
        authorId: session.user.id, isPublished: false,
      },
    });

    console.log(`✅ Created: ${article.slug} | ${wordCount} words | ${researchData.sourcesScraped} sources\n`);

    return NextResponse.json({ article, researchData });
  } catch (error: any) {
    console.error("❌ Failed:", error);
    return NextResponse.json({ error: error.message || "خطا" }, { status: 500 });
  }
}