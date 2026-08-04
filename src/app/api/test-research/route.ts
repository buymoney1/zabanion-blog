import { NextRequest, NextResponse } from "next/server";
import { searchGoogle, scrapeContent } from "@/lib/serper-search";

// ==================== Type Definitions ====================
interface PeopleAlsoAskItem {
  question: string;
  answer?: string;
}

interface OrganicResult {
  position: number;
  title: string;
  link: string;
  snippet?: string;
  date?: string;
}

interface ScrapedArticle {
  title: string;
  link: string;
  contentLength: number;
  wordCount: number;
  scraped: boolean;
}

// ==================== Helper Functions ====================
function calculateWordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function sliceText(text: string | undefined, maxLength: number): string | undefined {
  return text?.slice(0, maxLength);
}

// ==================== Route Handler ====================
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "بهترین آموزشگاه آیلتس تهران";
  const action = searchParams.get("action") || "search";

  const hasSerper = !!(process.env.SERPER_API_KEY && process.env.SERPER_API_KEY.length > 10);

  try {
    // ===== Action: Search =====
    if (action === "search") {
      const startTime = Date.now();
      const { organic, relatedSearches, peopleAlsoAsk } = await searchGoogle(query, { num: 10 });

      return NextResponse.json({
        success: true,
        method: hasSerper ? "Serper API" : "Fallback Scrape",
        query,
        duration: `${Date.now() - startTime}ms`,
        stats: {
          organicResults: organic.length,
          relatedSearches: relatedSearches.length,
          peopleAlsoAsk: peopleAlsoAsk.length,
        },
        data: {
          organic: organic.map((result: OrganicResult) => ({
            position: result.position,
            title: result.title,
            link: result.link,
            snippet: sliceText(result.snippet, 200),
            date: result.date,
          })),
          relatedSearches,
          peopleAlsoAsk: peopleAlsoAsk.map((item: PeopleAlsoAskItem) => ({
            question: item.question,
            answer: sliceText(item.answer, 200),
          })),
        },
      });
    }

    // ===== Action: Scrape =====
    if (action === "scrape") {
      const url = searchParams.get("url");
      if (!url) {
        return NextResponse.json({ error: "Need ?url=" }, { status: 400 });
      }

      const startTime = Date.now();
      const content = await scrapeContent(url);
      const wordCount = calculateWordCount(content);

      return NextResponse.json({
        success: true,
        url,
        duration: `${Date.now() - startTime}ms`,
        stats: {
          contentLength: content.length,
          wordCount,
          hasContent: content.length > 500,
        },
        contentPreview: content.slice(0, 500),
      });
    }

    // ===== Action: Full =====
    if (action === "full") {
      const startTime = Date.now();
      const { organic, relatedSearches, peopleAlsoAsk } = await searchGoogle(query, { num: 10 });

      const scrapedArticles: ScrapedArticle[] = [];
      
      for (const result of organic.slice(0, 3)) {
        const content = await scrapeContent(result.link);
        const wordCount = calculateWordCount(content);
        
        scrapedArticles.push({
          title: result.title,
          link: result.link,
          contentLength: content.length,
          wordCount,
          scraped: content.length > 500,
        });
        
        // Delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const successfulScrapes = scrapedArticles.filter((article) => article.scraped);
      const totalWordsScraped = scrapedArticles.reduce((sum, article) => sum + article.wordCount, 0);

      return NextResponse.json({
        success: true,
        method: hasSerper ? "Serper API" : "Fallback",
        query,
        duration: `${Date.now() - startTime}ms`,
        summary: {
          totalResults: organic.length,
          scrapedSuccessfully: successfulScrapes.length,
          totalWordsScraped,
        },
        searchResults: {
          organic: organic.map((result: OrganicResult) => ({
            position: result.position,
            title: result.title,
            link: result.link,
            snippet: sliceText(result.snippet, 150),
          })),
          relatedSearches,
          peopleAlsoAsk,
        },
        scrapedArticles,
      });
    }

    // ===== Invalid Action =====
    return NextResponse.json(
      {
        error: "Invalid action",
        validActions: ["search", "scrape", "full"],
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Test research error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}