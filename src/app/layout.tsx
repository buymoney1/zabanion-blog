import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-vazir",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zabanionapp.ir"), // بسیار مهم برای سئو و آیکون‌ها
  manifest: "/manifest.json",
  title: {
    default: "زبانیون - پلتفرم آموزش زبان انگلیسی با هوش مصنوعی",
    template: "%s | زبانیون",
  },
  description:
    "یادگیری زبان انگلیسی با فیلم، پادکست، فلش‌کارت و مکالمه با هوش مصنوعی. پیش‌ثبت‌نام کنید و یک ماه اشتراک رایگان بگیرید.",
  keywords: [
    "آموزش زبان انگلیسی",
    "هوش مصنوعی",
    "فلش‌کارت",
    "مکالمه انگلیسی",
    "یادگیری زبان",
    "زبانیون",
  ],
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png", // برای نمایش درست در آیفون
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "زبانیون",
    images: [
      {
        url: "/icon.png", // تصویر پیش‌فرض برای اشتراک‌گذاری
        width: 512,
        height: 512,
        alt: "لوگوی زبانیون",
      },
    ],
    title: "زبانیون - پلتفرم آموزش زبان انگلیسی با هوش مصنوعی",
    description:
      "یادگیری زبان انگلیسی با فیلم، پادکست، فلش‌کارت و مکالمه با هوش مصنوعی",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body className="font-sans antialiased bg-[#FDFCF8] text-stone-900">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
