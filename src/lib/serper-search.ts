// src/lib/serper-search.ts

// ==================== Types ====================
export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  date?: string;
  content?: string;
}

export interface ResearchData {
  query: string;
  sourcesFound: number;
  sourcesScraped: number;
  competitorAnalysis: string;
  competitorContents: string[];
  topResults: SearchResult[];
  relatedSearches: string[];
  peopleAlsoAsk: { question: string; answer: string }[];
}

// ==================== Serper Search ====================
export async function searchGoogle(
  query: string,
  options?: { num?: number; page?: number; gl?: string; hl?: string }
) {
  const apiKey = process.env.SERPER_API_KEY;
  // استفاده از آدرس Worker شما در صورت وجود، در غیر این صورت آدرس اصلی
  const baseUrl = process.env.SERPER_PROXY_URL || "https://google.serper.dev";

  if (!apiKey || apiKey.length < 10) {
    console.warn("⚠️ SERPER_API_KEY not set. Using fallback.");
    return fallbackSearch(query);
  }

  console.log(`🔍 Serper (via Proxy): "${query}"`);

  try {
    const res = await fetch(`${baseUrl}/search`, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: options?.num || 10,
        page: options?.page || 1,
        gl: options?.gl || "ir",
        hl: options?.hl || "fa",
        autocorrect: true,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`⚠️ Serper Proxy Error: HTTP ${res.status}`);
      return fallbackSearch(query);
    }

    const data = await res.json();

    const organic: SearchResult[] = (data.organic || []).map(
      (r: any, i: number) => ({
        title: r.title || "",
        link: r.link || "",
        snippet: r.snippet || "",
        position: r.position || i + 1,
        date: r.date,
      })
    );

    const related = (data.relatedSearches || []).map((r: any) => r.query);
    const paa = (data.peopleAlsoAsk || []).map((r: any) => ({
      question: r.question || "",
      answer: r.snippet || r.answer || "",
    }));

    console.log(
      `   ✅ ${organic.length} organic, ${paa.length} PAA, ${related.length} related`
    );
    return { organic, relatedSearches: related, peopleAlsoAsk: paa };
  } catch (error: any) {
    console.error("Serper error:", error.message);
    return fallbackSearch(query);
  }
}

// ==================== Fallback ====================
async function fallbackSearch(query: string) {
  console.log("📋 Fallback scrape...");
  try {
    const res = await fetch(
      `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}&hl=fa&gl=IR&num=10`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html",
          "Accept-Language": "fa-IR,fa;q=0.9",
        },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return { organic: [], relatedSearches: [], peopleAlsoAsk: [] };

    const html = await res.text();
    const urls = [...(html.match(/href="(https?:\/\/[^"]+)"/g) || [])]
      .map((m) => m.replace(/href="|"/g, ""))
      .filter((u) => u.startsWith("http") && !u.includes("google.com"))
      .slice(0, 10);
    const titles = [...(html.match(/<h3[^>]*>(.*?)<\/h3>/g) || [])]
      .map((t) => t.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean)
      .slice(0, 10);
    const snippets = [
      ...(html.match(/<div[^>]*class="[^"]*BNeawe[^"]*"[^>]*>(.*?)<\/div>/g) ||
        []),
    ]
      .map((s) =>
        s
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter((s) => s.length > 30)
      .slice(0, 10);

    const organic: SearchResult[] = [];
    for (let i = 0; i < Math.min(urls.length, titles.length, 5); i++) {
      organic.push({
        title: titles[i] || "بدون عنوان",
        link: urls[i],
        snippet: snippets[i] || "",
        position: i + 1,
      });
    }

    console.log(`   ✅ Fallback: ${organic.length} results`);
    return { organic, relatedSearches: [], peopleAlsoAsk: [] };
  } catch {
    return { organic: [], relatedSearches: [], peopleAlsoAsk: [] };
  }
}

// ==================== Scrape Content ====================
export async function scrapeContent(url: string): Promise<string> {
  console.log(`📄 Scraping: ${url.slice(0, 70)}...`);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "fa-IR,fa;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return "";

    const html = await res.text();
    let clean = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    const parts: string[] = [];

    // Headings
    [...(clean.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/gi) || [])].forEach((h) => {
      const t = h.replace(/<[^>]+>/g, "").trim();
      if (t) parts.push(t);
    });

    // Strong/Bold
    [...(clean.match(/<strong[^>]*>(.*?)<\/strong>/gi) || [])].forEach((s) => {
      const t = s.replace(/<[^>]+>/g, "").trim();
      if (t.length > 4 && t.length < 100) parts.unshift(`[BOLD] ${t}`);
    });

    // Links
    [...(clean.match(/<a[^>]*>(.*?)<\/a>/gi) || [])].forEach((a) => {
      const t = a.replace(/<[^>]+>/g, "").trim();
      if (t.length > 5 && t.length < 80 && !t.includes("http"))
        parts.unshift(`[LINK] ${t}`);
    });

    // Paragraphs
    [...(clean.match(/<p[^>]*>(.*?)<\/p>/gi) || [])].forEach((p) => {
      const t = p
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (t.length > 30) parts.push(t);
    });

    // List items
    [...(clean.match(/<li[^>]*>(.*?)<\/li>/gi) || [])].forEach((li) => {
      const t = li.replace(/<[^>]+>/g, "").trim();
      if (t.length > 10) parts.push(`• ${t}`);
    });

    // Title spans
    [
      ...(clean.match(
        /<span[^>]*class="[^"]*(?:title|name|heading)[^"]*"[^>]*>(.*?)<\/span>/gi
      ) || []),
    ].forEach((s) => {
      const t = s.replace(/<[^>]+>/g, "").trim();
      if (t.length > 4 && t.length < 100) parts.unshift(`[TITLE] ${t}`);
    });

    const result = parts.join("\n").slice(0, 12000);
    console.log(`   ✅ ${parts.length} parts, ${result.length} chars`);
    return result;
  } catch (error: any) {
    console.error(`   ❌ Scrape error: ${error.message}`);
    return "";
  }
}

// ==================== Analyze ====================
async function analyzeCompetitors(
  contents: string[],
  results: SearchResult[],
  keywords: string[],
  paa: { question: string; answer: string }[]
): Promise<string> {
  if (!contents.length) return "";

  const { aiRouter } = await import("./ai-router");

  const prompt = `Analyze these ${
    contents.length
  } articles about "${keywords.join(", ")}":
  
  ${contents
    .map(
      (c, i) =>
        `=== Article ${i + 1}: "${
          results[i]?.title || "Unknown"
        }" ===\n${c.slice(0, 2500)}\n`
    )
    .join("\n\n")}
  
  ${
    paa.length
      ? `📋 PAA:\n${paa
          .map((p) => `Q: ${p.question}\nA: ${p.answer}`)
          .join("\n\n")}`
      : ""
  }
  
  In Persian: 1.Topics 2.Real data (names/prices/addresses) 3.Gaps 4.Structure 5.3 unique angles 6.Outline`;

  const result = await aiRouter.generateText(
    "You are a research analyst.",
    prompt,
    { temperature: 0.4, maxTokens: 2500 }
  );
  return result.success ? result.text : "";
}

// ==================== Main Pipeline ====================
export async function researchTopic(
  keywords: string[],
  options?: { num?: number; scrapeAll?: boolean }
): Promise<ResearchData> {
  const query = keywords.slice(0, 5).join(" ");
  console.log(`\n📚 RESEARCH: "${query}"\n`);

  const { organic, relatedSearches, peopleAlsoAsk } = await searchGoogle(
    query,
    { num: options?.num || 10 }
  );
  const results: SearchResult[] = organic;

  const contents: string[] = [];
  const toScrape = options?.scrapeAll ? results : results.slice(0, 7);

  console.log(`   Scraping ${toScrape.length} articles...`);
  for (const r of toScrape) {
    const c = await scrapeContent(r.link);
    if (c.length > 500) {
      r.content = c;
      contents.push(c);
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  console.log(`   Scraped: ${contents.length}/${toScrape.length}`);

  let analysis = "";
  if (contents.length > 0) {
    console.log("   Analyzing...");
    analysis = await analyzeCompetitors(
      contents,
      results.filter((r) => r.content),
      keywords,
      peopleAlsoAsk
    );
    console.log("   ✅ Analysis done");
  }

  console.log(`✅ Research: ${contents.length} sources\n`);
  return {
    query,
    sourcesFound: results.length,
    sourcesScraped: contents.length,
    competitorAnalysis: analysis,
    competitorContents: contents,
    topResults: results.filter((r) => r.content),
    relatedSearches,
    peopleAlsoAsk,
  };
}
