import { prisma } from "@/lib/prisma";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zabanion.ir";

  const articles = await prisma.seoArticle.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${articles
    .map((article: { slug: string; updatedAt: Date | null; publishedAt: Date | null }) => {
      const lastmod = (article.updatedAt || article.publishedAt || new Date()).toISOString();
      return `
  <url>
    <loc>${siteUrl}/blog/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}