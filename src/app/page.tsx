"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ChevronLeft,
  Brain,
  Film,
  Compass,
  Bot,
  Subtitles,
  Mic,
  PenTool,
  Play,
  Download,
  Crown,
  Rocket,
  Globe2,
  Zap,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";

// ==================== لینک اصلی ====================
const MAIN_URL = "https://zabanion.ir/dashboard";
const ARTICLES_URL = "/blog";

// === کامپوننت خط دایره‌ای تزئینی ===
function DecorativeCircle({ className = "", size = 40, delay = 0 }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay, ease: "easeInOut" }}
    >
      <motion.circle
        cx="20" cy="20" r="18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 3"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay, ease: "easeInOut" }}
      />
      <motion.circle
        cx="20" cy="20" r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: delay + 0.3, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

// === خط منحنی تزئینی ===
function DecorativeLine({ className = "", delay = 0 }) {
  return (
    <motion.svg
      width="80" height="6" viewBox="0 0 80 6" fill="none"
      className={className}
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: "easeInOut" }}
    >
      <motion.path
        d="M0,3 Q20,6 40,3 Q60,0 80,3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

// === خط عمودی نازک ===
function ThinDivider({ className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="w-px h-3 bg-[#e6b741]/30" />
      <div className="w-1 h-1 rounded-full bg-[#e6b741]/50" />
      <div className="w-px h-3 bg-[#e6b741]/30" />
    </div>
  );
}

// === دکمه اصلی CTA ===
function PrimaryCTA({
  label = "شروع یادگیری",
  className = "",
  size = "lg",
}: {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses =
    size === "lg"
      ? "px-8 py-4 text-base"
      : size === "md"
      ? "px-4 py-2 text-[11px] sm:text-xs"
      : "px-3 py-2 text-[10px] sm:text-xs";

  return (
    <a
      href={MAIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 bg-[#e6b741] hover:bg-[#d4a635] text-[#0F1F18] rounded-full font-bold transition-all shadow-[0_8px_30px_rgba(230,183,65,0.25)] hover:shadow-[0_10px_35px_rgba(230,183,65,0.35)] hover:-translate-y-0.5 active:translate-y-0 ${sizeClasses} ${className}`}
    >
      <Sparkles className="w-4 h-4 hidden sm:inline" />
      <span>{label}</span>
      <ArrowUpRight className="w-4 h-4 hidden sm:inline group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </a>
  );
}

// === دکمه مقالات (ثانویه) ===
function ArticlesButton({
  label = "مقالات",
  className = "",
  size = "md",
}: {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses =
    size === "lg"
      ? "px-8 py-4 text-base"
      : size === "md"
      ? "px-4 py-2 text-[11px] sm:text-xs"
      : "px-3 py-2 text-[10px] sm:text-xs";

  return (
    <Link
      href={ARTICLES_URL}
      className={`group inline-flex items-center gap-2 bg-transparent hover:bg-[#1A362D]/10 text-[#1A362D] rounded-full font-bold transition-all border border-[#1A362D]/20 hover:border-[#1A362D]/40 ${sizeClasses} ${className}`}
    >
      <BookOpen className="w-4 h-4 hidden sm:inline" />
      <span>{label}</span>
    </Link>
  );
}

export default function HomePage() {
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  // ======= محتوای بخش‌ها =======
  const leitnerFeatures = [
    { title: "جعبه لایتنر هوشمند", desc: "مرور خودکار واژه‌ها در بازه‌های طلایی با الگوریتم forgetting curve", line: true },
    { title: "افزودن واژه با یک کلیک", desc: "هر واژه‌ای را در حین تماشا، خواندن یا گوش دادن به لایتنر اضافه کن", line: true },
    { title: "دسته‌بندی هوشمند", desc: "واژه‌ها بر اساس سطح، موضوع و فیلم/سریال دسته‌بندی می‌شوند", line: false },
  ];

  const mediaFeatures = [
    { title: "فیلم و سریال", desc: "هزاران ساعت محتوای جذاب با زیرنویس دو زبانه هم‌زمان", icon: Film },
    { title: "انیمیشن و پادکست", desc: "از پیکسار تا پادکست‌های محبوب، همه با زیرنویس تعاملی", icon: Play },
    { title: "زیرنویس هوشمند", desc: "روی هر کلمه بزنی، معنی، تلفظ و مثال می‌بینی", icon: Subtitles },
  ];

  const aiFeatures = [
    { title: "تصحیح رایتینگ", desc: "متن‌هایت را بنویس، هوش مصنوعی غلط‌ها را می‌گیرد و نمره می‌دهد", icon: PenTool },
    { title: "تمرین اسپیکینگ", desc: "صحبت کن، تلفظ و fluency ات را تحلیل کن و فیدبک دقیق بگیر", icon: Mic },
    { title: "مربی شخصی AI", desc: "برنامه یادگیری‌ات بر اساس نقاط ضعف و قوتت شخصی‌سازی می‌شود", icon: Bot },
  ];

  const exploreFeatures = [
    { title: "ریلز آموزشی", desc: "ویدیوهای کوتاه و جذاب برای یادگیری در لحظه‌های آزاد", line: true },
    { title: "غوطه‌وری در زبان", desc: "با محتوای بی‌پایان، زبان را مثل بچه‌ها یاد بگیر؛ بدون کتاب و کلاس", line: true },
    { title: "خط یادگیری", desc: "ببین چقدر از مسیرت را رفته‌ای و چقدر مانده تا مقصد", line: false },
  ];

  const heroHighlights = [
    { icon: Brain, label: "لایتنر هوشمند" },
    { icon: Film, label: "فیلم و سریال" },
    { icon: Bot, label: "مربی AI" },
    { icon: Globe2, label: "غوطه‌وری" },
  ];

  return (
    <div className="min-h-screen bg-[#0F1F18] font-[vazirmatn, sans-serif] flex flex-col relative overflow-x-hidden text-right selection:bg-[#e6b741] selection:text-[#0F1F18]">

      {/* بک‌گراند‌های تزئینی */}
      <div className="fixed top-0 right-0 w-[70%] h-[70%] bg-[#e6b741]/2 rounded-full blur-[180px] pointer-events-none -translate-y-1/4 translate-x-1/4" />
      <div className="fixed bottom-0 left-0 w-[60%] h-[60%] bg-[#2D6A4F]/3 rounded-full blur-[150px] pointer-events-none translate-y-1/4 -translate-x-1/4" />
      <div className="fixed top-1/2 left-1/2 w-[40%] h-[40%] bg-[#e6b741]/1 rounded-full blur-[200px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-[20%] left-[5%] w-px h-32 bg-[#e6b741]" />
        <div className="absolute top-[40%] right-[8%] w-px h-24 bg-[#e6b741]" />
        <div className="absolute bottom-[30%] left-[15%] w-16 h-px bg-[#e6b741]" />
      </div>

      {/* === هدر === */}
      <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-4 py-3 sm:py-4 md:py-5">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto bg-[#D2D8CD]/90 backdrop-blur-xl shadow-lg shadow-black/10 rounded-full px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between border border-white/10"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
              <Image src="/logo.png" alt="زبانیون" fill className="object-contain" unoptimized />
            </div>
            <div className="h-4 sm:h-5 w-px bg-[#1A362D]/10 flex-shrink-0" />
            <span className="text-[#1A362D]/50 text-[10px] sm:text-[11px] font-medium inline-block whitespace-nowrap tracking-wider">
              زبانیون، لذت یادگیری زبان
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ArticlesButton label="مقالات" size="md" />
            <PrimaryCTA label="ورود به زبانیون" size="md" />
          </div>
        </motion.div>
      </header>

      {/* === بخش Hero === */}
      <section className="min-h-screen pt-20 sm:pt-28 pb-8 sm:pb-12 px-4 flex flex-col items-center justify-center gap-8 sm:gap-10 max-w-5xl mx-auto w-full relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center w-full"
        >
          {/* بج بالای تایتل */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-[#e6b741]/5 rounded-full px-4 py-1.5 mb-5 border border-[#e6b741]/15"
          >
            <Rocket className="w-3.5 h-3.5 text-[#e6b741]" />
            <span className="text-[#e6b741] text-[10px] font-bold tracking-wider">حالا رسماً شروع شد</span>
          </motion.div>

          <h1 className="text-white font-black leading-tight tracking-tight mb-3 sm:mb-6">
            <span className="block text-[1.8rem] sm:text-[3rem] md:text-[3.8rem] lg:text-[4.6rem]">
              دنیای جدید
            </span>
            <span className="block text-[1.8rem] sm:text-[3rem] md:text-[3.8rem] lg:text-[4.6rem]">
              <span className="text-[#e6b741] relative inline-block">
                یادگیری زبان
                <DecorativeLine className="absolute -bottom-1 sm:-bottom-2 lg:-bottom-3 right-0 text-[#e6b741] w-12 sm:w-16 lg:w-20 hidden sm:block" delay={0.8} />
              </span>
              {" "}از اینجا شروع می‌شود
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-white/50 text-xs sm:text-sm md:text-lg leading-relaxed max-w-xs sm:max-w-sm md:max-w-lg font-medium mb-2 px-2"
          >
            زبانیون آماده است. کافیست وارد شوی و مسیر یادگیری‌ات را شروع کنی
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white/30 text-[10px] sm:text-xs leading-relaxed max-w-xs sm:max-w-sm md:max-w-md font-medium mb-7 px-2"
          >
            لایتنر هوشمند، فیلم و سریال با زیرنویس، مربی AI و غوطه‌وری کامل — همه در یک اپ
          </motion.p>

          {/* دکمه اصلی */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <PrimaryCTA label="شروع یادگیری در زبانیون" size="lg" />
          </motion.div>

          <ThinDivider className="my-8" />

          {/* هایلایت‌های Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl"
          >
            {heroHighlights.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 bg-white/[0.03] backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/[0.06]"
              >
                <item.icon className="w-5 h-5 text-[#e6b741]/70" />
                <span className="text-white/50 text-[10px] sm:text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* === بخش ۱: لایتنر و واژه‌آموزی === */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-14">
          <DecorativeCircle size={48} className="text-[#e6b741]/40 mx-auto mb-5" delay={0.1} />
          <h2 className="text-white text-3xl md:text-4xl font-black mb-3">واژه‌ها را قورت بده</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
            با سیستم لایتنر هوشمند، هر واژه‌ای که می‌بینی برای همیشه در ذهنت حک می‌شود
          </p>
          <DecorativeLine className="mx-auto mt-5 text-[#e6b741]/30" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leitnerFeatures.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -4 }}
              className="bg-white/[0.03] backdrop-blur-sm rounded-[36px] p-7 border border-white/[0.06] hover:bg-white/[0.06] transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#e6b741]/3 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-[#e6b741]/5 transition-all" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-[#e6b741]/60" />
                  <div className="w-6 h-px bg-[#e6b741]/20" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-white/35 text-sm leading-relaxed">{item.desc}</p>
                {item.line && (
                  <div className="mt-4 w-12 h-px bg-[#e6b741]/15 group-hover:w-20 transition-all duration-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-4 relative z-10">
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 h-px bg-white/[0.04]" />
          <DecorativeCircle size={20} className="text-[#e6b741]/20" />
          <div className="flex-1 h-px bg-white/[0.04]" />
        </div>
      </div>

      {/* === بخش ۲: فیلم، سریال، انیمیشن، پادکست === */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-14">
          <DecorativeCircle size={48} className="text-[#e6b741]/40 mx-auto mb-5" delay={0.1} />
          <h2 className="text-white text-3xl md:text-4xl font-black mb-3">یادگیری با طعم سرگرمی</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
            فیلم ببین، سریال دنبال کن، پادکست گوش بده و ناخودآگاه زبان یاد بگیر
          </p>
          <DecorativeLine className="mx-auto mt-5 text-[#e6b741]/30" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mediaFeatures.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -4 }}
              className="bg-white/[0.03] backdrop-blur-sm rounded-[36px] p-7 border border-white/[0.06] hover:bg-white/[0.06] transition-all group relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#2D6A4F]/3 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl group-hover:bg-[#2D6A4F]/5 transition-all" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <item.icon className="w-6 h-6 text-[#e6b741]/60" />
                  <div className="w-6 h-px bg-[#e6b741]/20" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-white/35 text-sm leading-relaxed">{item.desc}</p>
                <div className="mt-4 w-12 h-px bg-[#e6b741]/15 group-hover:w-20 transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-4 relative z-10">
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 h-px bg-white/[0.04]" />
          <DecorativeCircle size={20} className="text-[#e6b741]/20" />
          <div className="flex-1 h-px bg-white/[0.04]" />
        </div>
      </div>

      {/* === بخش ۳: هوش مصنوعی === */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-14">
          <DecorativeCircle size={48} className="text-[#e6b741]/40 mx-auto mb-5" delay={0.1} />
          <div className="inline-flex items-center gap-2 bg-[#e6b741]/5 rounded-full px-4 py-1.5 mb-4 border border-[#e6b741]/10">
            <Bot className="w-3.5 h-3.5 text-[#e6b741]" />
            <span className="text-[#e6b741] text-[10px] font-bold tracking-wider">AI-POWERED</span>
          </div>
          <h2 className="text-white text-3xl md:text-4xl font-black mb-3">مربی هوش مصنوعی کنار توست</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
            بنویس، صحبت کن، اشتباه کن و از هوش مصنوعی فیدبک دقیق بگیر
          </p>
          <DecorativeLine className="mx-auto mt-5 text-[#e6b741]/30" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiFeatures.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -4 }}
              className="bg-white/[0.03] backdrop-blur-sm rounded-[36px] p-7 border border-white/[0.06] hover:bg-white/[0.06] transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#e6b741]/2 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <item.icon className="w-6 h-6 text-[#e6b741]/60" />
                  <div className="w-6 h-px bg-[#e6b741]/20" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-white/35 text-sm leading-relaxed">{item.desc}</p>
                <div className="mt-4 w-12 h-px bg-[#e6b741]/15 group-hover:w-20 transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-4 relative z-10">
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 h-px bg-white/[0.04]" />
          <DecorativeCircle size={20} className="text-[#e6b741]/20" />
          <div className="flex-1 h-px bg-white/[0.04]" />
        </div>
      </div>

      {/* === بخش ۴: اکسپلور و غوطه‌وری === */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-14">
          <DecorativeCircle size={48} className="text-[#e6b741]/40 mx-auto mb-5" delay={0.1} />
          <h2 className="text-white text-3xl md:text-4xl font-black mb-3">کشف کن و غرق شو</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
            با ریلزهای کوتاه و محتوای بی‌پایان، در زبان غوطه‌ور شو و ناخودآگاه یاد بگیر
          </p>
          <DecorativeLine className="mx-auto mt-5 text-[#e6b741]/30" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exploreFeatures.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -4 }}
              className="bg-white/[0.03] backdrop-blur-sm rounded-[36px] p-7 border border-white/[0.06] hover:bg-white/[0.06] transition-all group relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#e6b741]/2 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Compass className="w-6 h-6 text-[#e6b741]/60" />
                  <div className="w-6 h-px bg-[#e6b741]/20" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-white/35 text-sm leading-relaxed">{item.desc}</p>
                {item.line && (
                  <div className="mt-4 w-12 h-px bg-[#e6b741]/15 group-hover:w-20 transition-all duration-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === CTA نهایی === */}
      <section className="py-16 px-4 max-w-3xl mx-auto w-full relative z-10 text-center">
        <DecorativeCircle size={56} className="text-[#e6b741]/30 mx-auto mb-6" delay={0.1} />
        <h2 className="text-white text-2xl md:text-3xl font-black mb-4">
          آماده‌ای دنیای جدید زبان را تجربه کنی؟
        </h2>
        <p className="text-white/40 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
          همین حالا وارد زبانیون شو و اولین قدم را در مسیر یادگیری زبان بردار
        </p>
        <PrimaryCTA label="ورود به زبانیون" size="lg" />
        <p className="text-white/20 text-[10px] mt-4 font-mono" dir="ltr">
          zabanion.ir
        </p>
        <DecorativeLine className="mx-auto mt-8 text-[#e6b741]/20" delay={0.5} />
      </section>

      {/* === فوتر === */}
      <footer className="py-10 px-4 text-center relative z-10 border-t border-white/[0.03]">
        <div className="flex items-center justify-center gap-2 text-white/25 text-xs">
          <div className="w-5 h-5 relative">
            <Image src="/logo.png" alt="لوگو" fill className="object-contain opacity-50" unoptimized />
          </div>
          <span>زبانیون، جایی که یادگیری زبان معنا پیدا می‌کند</span>
        </div>
        <ThinDivider className="my-4 mx-auto" />
        <p className="text-white/15 text-[10px] mb-3">تمام محتوا با زیرنویس دو زبانه • هوش مصنوعی پیشرفته • یادگیری به روش غوطه‌وری</p>
        <a
          href={MAIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[#e6b741]/60 hover:text-[#e6b741] transition-colors text-[11px] font-medium"
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span dir="ltr">zabanion.ir</span>
        </a>
      </footer>
    </div>
  );
}