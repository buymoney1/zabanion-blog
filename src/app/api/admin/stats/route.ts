import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalArticles,
      publishedArticles,
      totalViews,
      totalPreregistrations,
      todayPreregistrations,
    ] = await Promise.all([
      prisma.seoArticle.count(),
      prisma.seoArticle.count({ where: { isPublished: true } }),
      prisma.seoArticleView.count(),
      prisma.preRegistration.count(),
      prisma.preRegistration.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalArticles,
      publishedArticles,
      totalViews,
      totalPreregistrations,
      todayPreregistrations,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}