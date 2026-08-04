import { JSDOM } from "jsdom";

// ==================== Types ====================
interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  content?: string;
}

// ==================== Google Search via GapGPT ====================
// GapGPT از Gemini استفاده می‌کنه که Google Search Grounding داره
export async function searchGoogle(query: string): Promise<SearchResult[]> {
  console.log(`🔍 Searching: ${query}`);

  try {
    // GapGPT با مدل‌های Gemini می‌تونه مستقیم جستجو کنه
    const { aiRouter } = await import("./ai-router");

    const systemPrompt = `You are a search assistant. Search the web for: "${query}"
Return results as JSON array with: title, link, snippet.
Return ONLY valid JSON. No other text.`;

    const result = await aiRouter.generateText(systemPrompt, query, {
      temperature: 0.1,
      maxTokens: 2000,
      responseFormat: "json_object",
    });

    if (!result.success) {
      console.error("Search failed:", result.error);
      return [];
    }

    try {
      const data = JSON.parse(result.text);
      if (Array.isArray(data)) return data.slice(0, 10);
      if (data.results) return data.results.slice(0, 10);
      return [];
    } catch {
      console.error("Failed to parse search results");
      return [];
    }
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

// ==================== Scrape Content ====================
export async function scrapeContent(url: string): Promise<string> {
  console.log(`📄 Scraping: ${url}`);

  try {
    // Try with fetch first (faster)
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const html = await response.text();
      const dom = new JSDOM(html);
      const doc = dom.window.document;

      // Remove scripts, styles, nav, footer
      doc.querySelectorAll("script, style, nav, footer, header, aside, .sidebar, .ads").forEach((el) => el.remove());

      // Get main content
      const article = doc.querySelector("article, main, .content, .post, #content");
      if (article) {
        return article.textContent?.trim()?.slice(0, 5000) || "";
      }

      // Fallback: get all paragraphs
      const paragraphs = doc.querySelectorAll("p, h1, h2, h3, li");
      return Array.from(paragraphs)
        .map((p) => p.textContent?.trim())
        .filter(Boolean)
        .join("\n")
        .slice(0, 5000);
    }
  } catch (error) {
    console.error(`Scrape error for ${url}:`, error);
  }

  return "";
}

// ==================== Full Research Pipeline ====================
export async function researchTopic(keywords: string[]): Promise<{
  topResults: SearchResult[];
  competitorContent: string[];
  analysis: string;
}> {
  const mainQuery = keywords.slice(0, 3).join(" ");
  console.log(`\n📚 Researching: ${mainQuery}\n`);

  // Step 1: Search
  const results = await searchGoogle(mainQuery);
  console.log(`Found ${results.length} results`);

  // Step 2: Scrape top 3 results
  const topUrls = results.slice(0, 3).map((r) => r.link);
  const contents = await Promise.all(topUrls.map((url) => scrapeContent(url)));
  const validContents = contents.filter((c) => c.length > 500);
  console.log(`Scraped ${validContents.length} articles`);

  // Step 3: Analyze competitor content
  const analysis = await analyzeCompetitors(validContents, keywords);
  console.log("✅ Analysis complete\n");

  return {
    topResults: results,
    competitorContent: validContents,
    analysis,
  };
}

// ==================== AI Analysis ====================
async function analyzeCompetitors(contents: string[], keywords: string[]): Promise<string> {
  if (contents.length === 0) return "";

  const { aiRouter } = await import("./ai-router");

  const prompt = `Analyze these ${contents.length} competitor articles about "${keywords.join(", ")}":

${contents.map((c, i) => `=== Article ${i + 1} ===\n${c.slice(0, 3000)}\n`).join("\n\n")}

Provide a detailed analysis in Persian (Farsi) covering:
1. Common structure and topics covered
2. Unique angles each article takes
3. What's MISSING from all of them (gaps)
4. Statistics, examples, or data points mentioned
5. What would make a BETTER article than all of these
6. Suggested title ideas (3-5 options)

Write in conversational Persian.`;

  const result = await aiRouter.generateText(prompt, "Analyze and find gaps", {
    temperature: 0.5,
    maxTokens: 2000,
  });

  return result.success ? result.text : "";
}