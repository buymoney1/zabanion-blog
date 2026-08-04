import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const registration = await prisma.preRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Generate a simple SVG card
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="600" height="340" rx="20" fill="url(#bg)"/>
        <text x="40" y="60" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.7)">ZABANION</text>
        <text x="40" y="140" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">@${registration.username}</text>
        <text x="40" y="190" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.9)">پیش‌ثبت‌نام کننده زبانیون</text>
        <line x1="40" y1="220" x2="560" y2="220" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <text x="40" y="260" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.9)">🎁 یک ماه اشتراک پریمیوم رایگان</text>
        <text x="40" y="300" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.6)">موقعیت در صف: #${registration.queuePosition}</text>
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="zabanion-card-${registration.username}.svg"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}