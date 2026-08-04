import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateArticle, generateSEOMetadata } from "@/lib/ai";

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobLog = await prisma.cronJobLog.create({
      data: {
        jobName: "generate-articles",
        status: "running",
        startedAt: new Date(),
      },
    });

    try {
      // Get all active prompts
      const prompts = await prisma.articlePrompt.findMany({
        where: { isActive: true },
      });

      if (prompts.length === 0) {
        await prisma.cronJobLog.update({
          where: { id: jobLog.id },
          data: {
            status: "success",
            details: "No active prompts found",
            completedAt: new Date(),
          },
        });
        return NextResponse.json({ message: "No prompts" });
      }

      const results = [];

      for (const prompt of prompts) {
        try {
          const keywords = prompt.category
            ? [prompt.category, "آموزش زبان انگلیسی", "یادگیری زبان"]
            : ["آموزش زبان انگلیسی", "یادگیری زبان", "گرامر انگلیسی"];

          const content = await generateArticle(prompt.prompt, keywords);

          const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
          const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : prompt.category || "مقاله جدید";
          const cleanContent = content.replace(/<meta[^>]*>/gi, '');

          const seoData = await generateSEOMetadata(title, cleanContent, keywords);

          const article = await prisma.seoArticle.create({
            data: {
              title: seoData.metaTitle || title,
              slug: seoData.slug || `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
              content: cleanContent,
              excerpt: seoData.excerpt,
              metaTitle: seoData.metaTitle || title,
              metaDescription: seoData.metaDescription,
              keywords,
              tags: seoData.tags || [],
              category: prompt.category || keywords[0],
              wordCount: cleanContent.replace(/<[^>]*>/g, '').split(/\s+/).length,
              readingTime: seoData.readingTime || 5,
              promptId: prompt.id,
              isPublished: true,
              publishedAt: new Date(),
            },
          });

          results.push({ prompt: prompt.name, articleId: article.id, title: article.title });
        } catch (err: any) {
          results.push({ prompt: prompt.name, error: err.message });
        }

        // Wait between articles
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      await prisma.cronJobLog.update({
        where: { id: jobLog.id },
        data: {
          status: "success",
          details: JSON.stringify(results),
          completedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, results });
    } catch (error: any) {
      await prisma.cronJobLog.update({
        where: { id: jobLog.id },
        data: {
          status: "failed",
          error: error.message,
          completedAt: new Date(),
        },
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}