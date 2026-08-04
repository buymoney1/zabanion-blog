import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [registrations, total] = await Promise.all([
      prisma.preRegistration.findMany({
        where,
        orderBy: [{ priorityScore: "desc" }, { queuePosition: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.preRegistration.count({ where }),
    ]);

    const stats = await prisma.preRegistration.aggregate({
      _count: true,
      _sum: { referralCount: true },
    });

    return NextResponse.json({
      registrations,
      stats: {
        total: stats._count,
        totalReferrals: stats._sum.referralCount || 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}