import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username || username.length < 3) {
      return NextResponse.json({ error: "نام کاربری باید حداقل ۳ کاراکتر باشد" }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim();

    const existingPreReg = await prisma.preRegistration.findUnique({
      where: { username: cleanUsername },
    });

    const existingUser = await prisma.user.findFirst({
      where: { name: cleanUsername },
    });

    const available = !existingPreReg && !existingUser;

    return NextResponse.json({ available });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}