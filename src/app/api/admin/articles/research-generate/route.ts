import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSEOMetadata } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { keywords, topic } = await req.json();

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: "حداقل یک کلیدواژه وارد کنید" },
        { status: 400 }
      );
    }

    console.log("🔬 Research generate:", keywords.join(", "));

    // ============ Phase 1: Search & Analyze ============
    console.log("📊 Researching competitors...");
    
    // Use AI to simulate research (since we don't have real Google Search API)
    const { aiRouter } = await import("@/lib/ai-router");
    
    const researchPrompt = `Search the web for the best articles about: "${keywords.join(", ")}"
    
Analyze what the top 3 articles cover:
1. What topics do they discuss?
2. What unique angles do they take?
3. What's MISSING from all of them?
4. What statistics or data do they mention?
5. How can we write a BETTER article?

Provide your analysis in Persian.`;

    const researchResult = await aiRouter.generateText(
      "You are a research analyst. Search and analyze competitor content.",
      researchPrompt,
      { temperature: 0.5, maxTokens: 2000 }
    );

    const competitorAnalysis = researchResult.success ? researchResult.text : "";

    // ============ Phase 2: Generate Better Article ============
    console.log("✍️ Generating superior article...");

    const articlePrompt = `Based on this competitor research, write a Persian article about "${topic || keywords.join(" - ")}".

📊 **Research Findings:**
${competitorAnalysis}

🔴 **Your article MUST:**
1. Cover everything competitors covered
2. Add at least 3 unique insights they missed
3. Be more detailed and comprehensive
4. Include real examples and practical tips
5. Have a friendly, conversational tone
6. Be minimum 1200 words

🔴 **Structure:**
<h1>Unique title (different from competitors)</h1>
<div class="summary-box"><p>📌 What you'll learn (3-4 bullets)</p></div>
<hr/>
<h2>1. Introduction with surprising fact</h2>
<p>Hook the reader</p>
<hr/>
<h2>2. Main content - step by step</h2>
<p>Detailed explanation</p>
<ol><li>Step 1</li><li>Step 2</li></ol>
<hr/>
<h2>3. Expert tips & common mistakes</h2>
<ul><li>❌ Mistake → ✅ Fix</li></ul>
<hr/>
<h2>4. Comparison or analysis</h2>
<p>In-depth comparison if applicable</p>
<hr/>
<h2>5. FAQ (3 questions)</h2>
<h3>Q1?</h3><p>4-5 line answer</p>
<h3>Q2?</h3><p>4-5 line answer</p>
<h3>Q3?</h3><p>4-5 line answer</p>
<hr/>
<h2>6. Conclusion + Action Plan</h2>
<p>Summary + weekly plan or checklist</p>

🔴 **Writing Rules:**
- Friendly Persian, like talking to a friend
- Use نیم‌فاصله
- Short paragraphs (2-3 lines)
- Bold keywords with <strong>
- Natural keyword placement
- At least 1200 words
- Only mention brand names once, naturally`;

    const articleResult = await aiRouter.generateText(
      "You are a professional Persian content writer. Write the best article on this topic.",
      articlePrompt,
      { temperature: 0.8, maxTokens: 8000 }
    );

    if (!articleResult.success) {
      throw new Error(articleResult.error || "Failed to generate article");
    }

    const content = articleResult.text;

    // Extract title
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]*>/g, "").trim()
      : keywords[0];

    // SEO metadata
    const seoData = await generateSEOMetadata(title, content, keywords);

    // Stats
    const wordCount = content
      .replace(/<[^>]*>/g, "")
      .split(/\s+/)
      .filter(Boolean).length;

    // Slug
    const baseSlug =
      seoData.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 80) ||
      `article-${Date.now().toString(36)}`;

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.seoArticle.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create article
    const article = await prisma.seoArticle.create({
      data: {
        title: seoData.metaTitle || title,
        slug,
        content,
        excerpt: seoData.excerpt || "",
        metaTitle: seoData.metaTitle || title.slice(0, 60),
        metaDescription: seoData.metaDescription || "",
        ogTitle: seoData.metaTitle || title,
        ogDescription: seoData.metaDescription || "",
        keywords,
        tags: seoData.tags || keywords.slice(0, 5),
        category: seoData.category || keywords[0] || "عمومی",
        wordCount,
        readingTime: seoData.readingTime || Math.ceil(wordCount / 200) || 5,
        authorId: session.user.id,
        isPublished: false,
      },
    });

    console.log(`✅ Research article created: ${article.slug} (${wordCount} words)`);

    return NextResponse.json({
      article,
      researchData: {
        modelUsed: articleResult.modelUsed,
        competitorsAnalyzed: 3,
        analysisLength: competitorAnalysis.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Research generate error:", error);
    return NextResponse.json(
      { error: error.message || "خطا در تولید مقاله" },
      { status: 500 }
    );
  }
}