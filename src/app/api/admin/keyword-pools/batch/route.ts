// app/api/admin/keyword-pools/batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const pools: { name: string; category?: string; keywords: string[] }[] =
      body.pools;

    if (!Array.isArray(pools) || pools.length === 0) {
      return NextResponse.json(
        { error: "آرایه‌ای از گروه‌ها الزامی است" },
        { status: 400 }
      );
    }

    // Validate each pool
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      if (!pool.name || typeof pool.name !== "string") {
        return NextResponse.json(
          { error: `گروه شماره ${i + 1}: نام گروه الزامی است` },
          { status: 400 }
        );
      }
      if (!Array.isArray(pool.keywords) || pool.keywords.length < 2) {
        return NextResponse.json(
          { error: `گروه "${pool.name}": حداقل ۲ کلیدواژه الزامی است` },
          { status: 400 }
        );
      }
    }

    // ✅ Use createMany instead of $transaction
    // For MongoDB, Prisma sends individual create operations internally
    const result = await prisma.keywordPool.createMany({
      data: pools.map((pool) => ({
        name: pool.name,
        category: pool.category || null,
        keywords: pool.keywords.map((k) => k.trim()).filter(Boolean),
      })),
    });

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error: any) {
    console.error("Batch import error:", error);
    return NextResponse.json(
      { error: error.message || "خطا در ذخیره‌سازی گروهی" },
      { status: 500 }
    );
  }
}