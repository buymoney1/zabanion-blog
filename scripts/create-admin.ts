// scripts/create-admin.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ⚙️ اینجا تنظیم کن:
const ADMIN = {
  email: "addmembershop@gmail.com",
  password: "13788731maB@@",
  name: "مدیر زبانیون",
};

async function createAdmin() {
  console.log("\n🚀 در حال ساخت ادمین...\n");

  try {
    const existing = await prisma.user.findUnique({
      where: { email: ADMIN.email },
    });

    if (existing) {
      console.log(`⚠️ کاربر با ایمیل ${ADMIN.email} از قبل وجود دارد`);

      if (existing.role !== "admin" || !existing.password) {
        const hashedPassword = await bcrypt.hash(ADMIN.password, 12);
        await prisma.user.update({
          where: { email: ADMIN.email },
          data: {
            role: "admin",
            password: hashedPassword,
            name: ADMIN.name,
          },
        });
        console.log("✅ کاربر به ادمین ارتقا یافت و رمز عبور بروز شد");
      } else {
        console.log("✅ کاربر از قبل ادمین است");
      }
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN.password, 12);

      await prisma.user.create({
        data: {
          email: ADMIN.email,
          password: hashedPassword,
          name: ADMIN.name,
          role: "admin",
          emailVerified: new Date(),
        },
      });

      console.log("✅ ادمین با موفقیت ساخته شد!");
    }

    console.log(`\n📧 ایمیل: ${ADMIN.email}`);
    console.log(`🔑 رمز: ${ADMIN.password}`);
    console.log(`👤 نام: ${ADMIN.name}`);
    console.log(`\n🚀 آدرس ورود: http://localhost:3000/login\n`);
  } catch (error: any) {
    console.error("\n❌ خطا:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();