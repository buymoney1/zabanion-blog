import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username, phone, referralCode } = await req.json();

    if (!username || !phone) {
      return NextResponse.json({ error: "نام کاربری و شماره تماس الزامی است" }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanPhone = phone.trim();

    const existing = await prisma.preRegistration.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { phone: cleanPhone }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "این نام کاربری یا شماره تماس قبلاً ثبت شده" },
        { status: 400 }
      );
    }

    const totalRegistrations = await prisma.preRegistration.count();
    let queuePosition = totalRegistrations + 1;
    let priorityScore = 0;

    if (referralCode) {
      priorityScore += 10;
      await prisma.preRegistration.updateMany({
        where: { username: referralCode.toLowerCase() },
        data: {
          referralCount: { increment: 1 },
          priorityScore: { increment: 5 },
        },
      });
      queuePosition = Math.max(1, queuePosition - 5);
    }

    const registration = await prisma.preRegistration.create({
      data: {
        username: cleanUsername,
        phone: cleanPhone,
        referralCode: referralCode?.toLowerCase(),
        queuePosition,
        priorityScore,
        status: "pending",
      },
    });

    const cardUrl = `/api/prereg/card/${registration.id}`;

    await prisma.preRegistration.update({
      where: { id: registration.id },
      data: { cardUrl, cardGenerated: true },
    });

    return NextResponse.json({
      success: true,
      card: {
        username: registration.username,
        queuePosition: registration.queuePosition,
        priorityScore: registration.priorityScore,
        cardUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}