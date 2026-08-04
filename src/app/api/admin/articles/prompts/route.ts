import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prompts = await prisma.articlePrompt.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { articles: true } } },
    });

    return NextResponse.json({ prompts });
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
    const { name, description, prompt, category } = await req.json();

    if (!name || !prompt) {
      return NextResponse.json({ error: "نام و پرامپت الزامی است" }, { status: 400 });
    }

    const newPrompt = await prisma.articlePrompt.create({
      data: { name, description, prompt, category },
    });

    return NextResponse.json({ prompt: newPrompt });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}