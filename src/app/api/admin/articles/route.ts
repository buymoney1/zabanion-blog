import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Helper: make slug unique
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await prisma.seoArticle.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { keywords: { hasSome: [search] } },
      ];
    }
    if (status === "published") where.isPublished = true;
    if (status === "draft") where.isPublished = false;

    const [articles, total] = await Promise.all([
      prisma.seoArticle.findMany({
        where,
        include: {
          prompt: { select: { name: true } },
          author: { select: { name: true, email: true } },
          _count: { select: { views: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.seoArticle.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title, slug, content, excerpt, coverImage,
      keywords, tags, category, metaTitle, metaDescription,
      ogTitle, ogDescription, promptId, isPublished
    } = body;

    if (!title) {
      return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });
    }

    // Generate base slug from title
    let baseSlug = slug;
    if (!baseSlug) {
      baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
    
    if (!baseSlug) {
      baseSlug = `article-${Date.now()}`;
    }

    // 🔴 Make slug unique
    const uniqueSlug = await generateUniqueSlug(baseSlug);

    const wordCount = content
      ? content.replace(/<[^>]*>/g, "").split(/\s+/).length
      : 0;
    const readingTime = Math.ceil(wordCount / 200) || 5;

    const article = await prisma.seoArticle.create({
      data: {
        title,
        slug: uniqueSlug, // ⭐ Use unique slug
        content,
        excerpt,
        coverImage,
        keywords: keywords || [],
        tags: tags || [],
        category,
        metaTitle: metaTitle || title,
        metaDescription,
        ogTitle: ogTitle || title,
        ogDescription,
        wordCount,
        readingTime,
        promptId: promptId || null,
        authorId: session.user.id,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ article });
  } catch (error: any) {
    console.error("Create article error:", error);
    return NextResponse.json(
      { error: error.message || "خطا در ایجاد مقاله" },
      { status: 500 }
    );
  }
}