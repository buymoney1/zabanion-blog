// src/app/api/prereg/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username, phone, referralCode } = await req.json();

    // Validation
    if (!username || !phone) {
      return NextResponse.json(
        { error: "نام کاربری و شماره تماس الزامی است" },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanPhone = phone.trim().replace(/\s/g, "");

    // Basic validation
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "نام کاربری باید حداقل ۳ کاراکتر باشد" },
        { status: 400 }
      );
    }

    if (!/^09\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "شماره تماس معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)" },
        { status: 400 }
      );
    }

    // Check duplicates
    const existing = await prisma.preRegistration.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { phone: cleanPhone }],
      },
    });

    if (existing) {
      if (existing.username === cleanUsername) {
        return NextResponse.json(
          { error: "این نام کاربری قبلاً ثبت شده است" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "این شماره تماس قبلاً ثبت شده است" },
        { status: 400 }
      );
    }

    // Calculate queue position
    const totalRegistrations = await prisma.preRegistration.count();
    let queuePosition = totalRegistrations + 1;
    let priorityScore = 0;

    // Handle referral
    if (referralCode) {
      const cleanReferral = referralCode.toLowerCase().trim();
      const referrer = await prisma.preRegistration.findUnique({
        where: { username: cleanReferral },
      });

      if (referrer) {
        priorityScore += 10;

        // Update referrer
        await prisma.preRegistration.update({
          where: { username: cleanReferral },
          data: {
            referralCount: { increment: 1 },
            priorityScore: { increment: 5 },
          },
        });

        // Boost position
        queuePosition = Math.max(1, queuePosition - 5);
      }
    }

    // Create registration
    const registration = await prisma.preRegistration.create({
      data: {
        username: cleanUsername,
        phone: cleanPhone,
        referralCode: referralCode?.toLowerCase().trim() || null,
        queuePosition,
        priorityScore,
        status: "pending",
      },
    });

    // Card URL
    const cardUrl = `/api/prereg/card/${registration.id}`;

    await prisma.preRegistration.update({
      where: { id: registration.id },
      data: { cardUrl, cardGenerated: true },
    });

    return NextResponse.json({
      success: true,
      message: "ثبت‌نام با موفقیت انجام شد",
      card: {
        username: registration.username,
        queuePosition: registration.queuePosition,
        priorityScore: registration.priorityScore,
        referralCount: registration.referralCount,
        cardUrl,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "خطا در ثبت‌نام. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}