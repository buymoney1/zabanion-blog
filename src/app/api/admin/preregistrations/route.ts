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
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "priorityScore";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const status = searchParams.get("status") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { referralCode: { contains: search, mode: "insensitive" } },
      ];
    }

    // Status filter
    if (status && status !== "all") {
      where.status = status;
    }

    // Date filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day for inclusive end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateTime;
      }
    }

    // Build order by
    let orderBy: any = [];
    const direction = sortOrder === "asc" ? "asc" : "desc";

    switch (sortBy) {
      case "priorityScore":
        orderBy = [{ priorityScore: direction }, { queuePosition: "asc" }];
        break;
      case "referralCount":
        orderBy = [{ referralCount: direction }, { createdAt: "desc" }];
        break;
      case "createdAt":
        orderBy = [{ createdAt: direction }];
        break;
      default:
        orderBy = [{ priorityScore: "desc" }, { queuePosition: "asc" }];
    }

    // Fetch data
    const [registrations, total] = await Promise.all([
      prisma.preRegistration.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.preRegistration.count({ where }),
    ]);

    // Calculate stats (considering date filters for todayNew)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [totalStats, todayStats, topReferrer] = await Promise.all([
      // Total stats (without date filter to always show overall counts)
      prisma.preRegistration.aggregate({
        _count: true,
        _sum: { referralCount: true },
      }),
      // Today's new registrations
      prisma.preRegistration.count({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      // Top referrer
      prisma.preRegistration.findFirst({
        where: {
          referralCount: { gt: 0 },
        },
        orderBy: {
          referralCount: "desc",
        },
        select: {
          username: true,
          referralCount: true,
        },
      }),
    ]);

    return NextResponse.json({
      registrations,
      stats: {
        total: totalStats._count,
        totalReferrals: totalStats._sum.referralCount || 0,
        todayNew: todayStats,
        topReferrer: topReferrer
          ? {
              username: topReferrer.username,
              count: topReferrer.referralCount,
            }
          : null,
      },
      totalPages: Math.ceil(total / limit),
      page,
      total,
    });
  } catch (error: any) {
    console.error("Admin preregistrations error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}