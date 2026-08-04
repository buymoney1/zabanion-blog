import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const article = await prisma.seoArticle.findUnique({
      where: { id },
      include: {
        prompt: true,
        author: { select: { name: true, email: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const wordCount = body.content
      ? body.content.replace(/<[^>]*>/g, "").split(/\s+/).length
      : undefined;

    // 🔴 اگه slug تغییر کرده، چک کن یکتا باشه
    if (body.slug) {
      const existing = await prisma.seoArticle.findFirst({
        where: {
          slug: body.slug,
          id: { not: id }, // exclude current article
        },
      });
      
      if (existing) {
        // Add timestamp to make unique
        body.slug = `${body.slug}-${Date.now()}`;
      }
    }

    const article = await prisma.seoArticle.update({
      where: { id },
      data: {
        ...body,
        wordCount: wordCount || body.wordCount,
        readingTime:
          body.readingTime ||
          (wordCount ? Math.ceil(wordCount / 200) : undefined),
        publishedAt:
          body.isPublished && !body.publishedAt ? new Date() : body.publishedAt,
      },
    });

    return NextResponse.json({ article });
  } catch (error: any) {
    console.error("Update article error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.seoArticle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}