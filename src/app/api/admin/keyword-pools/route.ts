import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pools = await prisma.keywordPool.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ pools });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, keywords, category } = await req.json();

  if (!name || !keywords || !Array.isArray(keywords) || keywords.length < 2) {
    return NextResponse.json(
      { error: "نام گروه و حداقل ۲ کلیدواژه الزامی است" },
      { status: 400 }
    );
  }

  const pool = await prisma.keywordPool.create({
    data: { name, keywords, category },
  });

  return NextResponse.json({ pool });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.keywordPool.delete({ where: { id } });
  return NextResponse.json({ success: true });
}