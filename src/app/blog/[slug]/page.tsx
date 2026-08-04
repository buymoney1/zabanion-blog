// src/app/blog/[slug]/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Eye,
  ArrowRight,
  ChevronLeft,
  Hash,
  Share2,
  BookOpen,
} from "lucide-react";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { BackToTop } from "@/components/blog/BackToTop";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareInline } from "@/components/blog/ShareInline";

// ==================== Types ====================
interface Props {
  params: Promise<{ slug: string }>;
}

interface RelatedArticle {
  title: string;
  slug: string;
  excerpt: string | null;
  readingTime: number | null;
  coverImage: string | null;
  publishedAt: Date | null;
}

// ==================== Decorative Elements ====================
function DecorativeCircle({
  className = "",
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 3"
        className="opacity-40"
      />
      <circle
        cx="20"
        cy="20"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-60"
      />
    </svg>
  );
}

// ==================== Helper: Persian Date ====================
function formatPersianDate(date: Date): string {
  return new Date(date).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ==================== Metadata ====================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.seoArticle.findUnique({
    where: { slug, isPublished: true },
    select: {
      title: true,
      metaTitle: true,
      metaDescription: true,
      excerpt: true,
      ogTitle: true,
      ogDescription: true,
      coverImage: true,
      publishedAt: true,
      slug: true,
    },
  });

  if (!article) {
    return { title: "مقاله یافت نشد | زبانیون" };
  }

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || "",
    openGraph: {
      title: article.ogTitle || article.title,
      description: article.ogDescription || article.metaDescription || "",
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      images: article.coverImage ? [article.coverImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.ogTitle || article.title,
      description: article.ogDescription || article.metaDescription || "",
    },
    alternates: {
      canonical: `https://zabanionapp.ir/blog/${article.slug}`,
    },
  };
}

// ==================== Main Page ====================
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  // Fetch article with related data
  const article = await prisma.seoArticle.findUnique({
    where: { slug, isPublished: true },
    include: {
      author: { select: { name: true } },
    },
  });

  if (!article) notFound();

  // Record view (fire & forget)
  try {
    await Promise.all([
      prisma.seoArticleView.create({ data: { articleId: article.id } }),
      prisma.seoArticle.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } },
      }),
    ]);
  } catch {
    // Silently fail if view recording fails
  }

  // Fetch related articles
  const relatedArticles: RelatedArticle[] = await prisma.seoArticle.findMany({
    where: {
      isPublished: true,
      id: { not: article.id },
      OR: [
        { category: article.category || "" },
        { keywords: { hasSome: article.keywords as string[] } },
      ],
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      readingTime: true,
      coverImage: true,
      publishedAt: true,
    },
  });

  // Computed values
  const readingTime =
    article.readingTime || Math.ceil((article.wordCount || 0) / 200) || 5;
  const publishedDate = article.publishedAt
    ? formatPersianDate(article.publishedAt)
    : "";
  const shareUrl = `https://zabanionapp.ir/blog/${article.slug}`;

  // Schema.org structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: article.author?.name || "زبانیون",
    },
    publisher: {
      "@type": "Organization",
      name: "زبانیون",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": shareUrl,
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ReadingProgress />
      <BackToTop />

      <div
        className="min-h-screen bg-[#FBFBF9] selection:bg-[#e6b741]/30 selection:text-[#0F1F18] relative"
        dir="rtl"
      >
        {/* ===== Background Texture ===== */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.01]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, #b45309 1px, transparent 1px),
                            radial-gradient(circle at 80% 70%, #166534 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        {/* ===== Background Blurs ===== */}
        <div className="fixed top-0 right-0 w-[60%] h-[60%] bg-[#e6b741]/[0.02] rounded-full blur-[150px] pointer-events-none -translate-y-1/4 translate-x-1/4" />
        <div className="fixed bottom-0 left-0 w-[50%] h-[50%] bg-[#2D6A4F]/[0.02] rounded-full blur-[130px] pointer-events-none translate-y-1/4 -translate-x-1/4" />

        {/* ==================== Header ==================== */}
        <header className="sticky top-0 z-50 px-4 py-4">
          <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl shadow-lg shadow-black/[0.03] rounded-full px-5 py-3 flex items-center justify-between border border-stone-200/50">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="زبانیون"
                  className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
                />
              </div>
              <div className="h-5 w-px bg-stone-200 flex-shrink-0" />
              <span className="text-stone-400 text-[11px] font-medium inline-block whitespace-nowrap">
                کتابخانه یادگیری زبان
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/blog"
                className="text-xs font-medium text-stone-500 hover:text-[#e6b741] transition-colors hidden sm:flex items-center gap-1"
              >
                همه مقالات
              </Link>
              <Link
                href="/"
                className="group flex items-center gap-1.5 bg-[#e6b741] hover:bg-[#d4a635] text-[#0F1F18] px-4 py-2 rounded-full text-xs font-bold transition-all shadow-[0_4px_15px_rgba(230,183,65,0.2)] hover:shadow-[0_6px_20px_rgba(230,183,65,0.3)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="hidden sm:inline">پیش‌ثبت‌نام</span>
                <span className="sm:hidden">ثبت‌نام</span>
              </Link>
            </div>
          </div>
        </header>

        {/* ==================== Main Layout ==================== */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-8">
            {/* ========== Sidebar - Left (Desktop) ========== */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* Table of Contents */}
                <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm">
                  <h4 className="text-[11px] font-bold text-stone-500 mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#e6b741]" />
                    فهرست مطالب
                  </h4>
                  <TableOfContents content={article.content} />
                </div>

                {/* Share */}
                <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm">
                  <h4 className="text-[11px] font-bold text-stone-500 mb-3 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-[#e6b741]" />
                    اشتراک‌گذاری
                  </h4>
                  <ShareInline url={shareUrl} title={article.title} />
                </div>

                {/* Decorative */}
                <div className="flex justify-center">
                  <DecorativeCircle size={24} className="text-[#e6b741]/30" />
                </div>
              </div>
            </aside>

            {/* ========== Main Content ========== */}
            <article className="flex-1 min-w-0 pt-4 pb-8 max-w-3xl mx-auto lg:mx-0">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-8">
                <Link href="/" className="hover:text-[#e6b741] transition-colors">
                  خانه
                </Link>
                <span className="text-stone-300">/</span>
                <Link href="/blog" className="hover:text-[#e6b741] transition-colors">
                  مقالات
                </Link>
                {article.category && (
                  <>
                    <span className="text-stone-300">/</span>
                    <Link
                      href={`/blog?category=${article.category}`}
                      className="hover:text-[#e6b741] transition-colors"
                    >
                      {article.category}
                    </Link>
                  </>
                )}
                <span className="text-stone-300">/</span>
                <span className="text-stone-500 truncate max-w-[200px]">
                  {article.title}
                </span>
              </nav>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-black text-stone-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Category Badge */}
              {article.category && (
                <div className="flex items-center gap-2 mb-5">
                  <DecorativeCircle size={20} className="text-[#e6b741]/40" />
                  <Link
                    href={`/blog?category=${article.category}`}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#e6b741] bg-amber-50/80 hover:bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200/50 transition-colors"
                  >
                    <Hash className="w-3 h-3" />
                    {article.category}
                  </Link>
                </div>
              )}

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-5 text-[11px] text-stone-400 py-3 border-y border-stone-100 mb-8">
                {article.author?.name && (
                  <span className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-700 shadow-sm">
                      {article.author.name[0]}
                    </div>
                    {article.author.name}
                  </span>
                )}
                {publishedDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-300" />
                    {publishedDate}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-300" />
                  {readingTime} دقیقه مطالعه
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-stone-300" />
                  {article.viewCount.toLocaleString("fa-IR")} بازدید
                </span>
              </div>

              {/* ========== Article Content ========== */}
              <div
                className="article-content prose prose-stone max-w-none prose-headings:font-black prose-headings:text-stone-900 prose-a:text-[#e6b741] prose-a:no-underline hover:prose-a:text-amber-600 prose-img:rounded-2xl prose-img:shadow-md prose-blockquote:border-[#e6b741] prose-blockquote:bg-amber-50/30 prose-blockquote:rounded-l-xl prose-blockquote:py-1 prose-blockquote:px-4 prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Keywords */}
              {article.keywords && article.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8">
                  {(article.keywords as string[]).map((kw: string) => (
                    <span
                      key={kw}
                      className="text-[10px] text-stone-400 bg-white border border-stone-200 px-3 py-1.5 rounded-full hover:border-[#e6b741]/30 hover:text-[#e6b741] transition-colors cursor-default"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              )}

              {/* ========== Mobile Share ========== */}
              <div className="lg:hidden mt-10 pt-6 border-t border-stone-200">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-[#e6b741]" />
                    اشتراک‌گذاری:
                  </span>
                  <ShareInline url={shareUrl} title={article.title} />
                </div>
              </div>

              {/* ========== Mobile Back Link ========== */}
              <div className="lg:hidden mt-6">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-[#e6b741] transition-colors bg-white border border-stone-200 rounded-full px-4 py-2.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  همه مقالات
                </Link>
              </div>

              {/* ========== Related Articles ========== */}
              {relatedArticles.length > 0 && (
                <section className="mt-14 pt-10 border-t border-stone-200">
                  <div className="flex items-center gap-3 mb-6">
                    <DecorativeCircle size={24} className="text-[#e6b741]/30" />
                    <h2 className="text-lg font-black text-stone-900">
                      مطالب مرتبط
                    </h2>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedArticles.map((related: RelatedArticle) => (
                      <Link
                        key={related.slug}
                        href={`/blog/${related.slug}`}
                        className="group bg-white rounded-2xl border border-stone-200/80 hover:border-[#e6b741]/30 hover:shadow-lg hover:shadow-amber-100/20 transition-all hover:-translate-y-1 p-5"
                      >
                        <h3 className="text-sm font-bold text-stone-800 mb-2 group-hover:text-[#e6b741] transition-colors line-clamp-2 leading-relaxed">
                          {related.title}
                        </h3>
                        {related.excerpt && (
                          <p className="text-[11px] text-stone-400 line-clamp-2 mb-4 leading-relaxed">
                            {related.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[10px] pt-3 border-t border-stone-100">
                          <span className="text-stone-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {related.readingTime || 5} دقیقه
                          </span>
                          <span className="text-[#e6b741] flex items-center gap-1 font-bold">
                            مطالعه
                            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </article>
          </div>
        </div>

        {/* ==================== Footer ==================== */}
        <footer className="mt-16 py-8 border-t border-stone-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7">
                <img
                  src="/logo.png"
                  alt="زبانیون"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="text-sm font-bold text-stone-700">زبانیون</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-[11px] text-stone-400">
              <Link href="/blog" className="hover:text-[#e6b741] transition-colors">
                مقالات
              </Link>
              <Link href="/" className="hover:text-[#e6b741] transition-colors">
                ثبت‌نام
              </Link>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}