"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import domtoimage from "dom-to-image-more";
import Image from "next/image";
import { toast } from "sonner";
import {
  Sparkles,
  Check,
  X,
  Loader2,
  AtSign,
  Phone,
  ShieldCheck,
  Gift,
  ChevronLeft,
  Crown,
  Brain,
  Film,
  Compass,
  Bot,
  Subtitles,
  Mic,
  PenTool,
  Play,
  Download,
  Copy,
  CheckCircle2,
  Share2,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import PreRegistrationModal from "@/components/PreRegistrationModal";

// ==================== API Calls ====================
async function checkUsernameAPI(username: string) {
  const res = await fetch("/api/prereg/check-username", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  return res.json();
}

async function registerAPI(username: string, phone: string, referralCode?: string) {
  const res = await fetch("/api/prereg/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, phone, referralCode }),
  });
  return res.json();
}

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

// === کامپوننت کارت دعوت ===
function InviteCard({
  username,
  cardRef,
  isCapturing,
}: {
  username: string;
  cardRef: React.MutableRefObject<HTMLDivElement | null>;
  isCapturing: boolean;
}) {
  return (
<div
  ref={cardRef}
  className="relative w-full aspect-[2/3] max-w-[240px] bg-[#0F1F18] rounded-3xl shadow-2xl flex flex-col justify-center overflow-hidden p-5 border border-white/5 mx-auto"
>
  {/* پس‌زمینه‌های بلوری */}
  <div className="absolute top-0 right-0 w-[70%] h-[50%] bg-[#e6b741]/8 rounded-full -translate-y-1/3 translate-x-1/4 blur-[80px]" />
  <div className="absolute bottom-0 left-0 w-[60%] h-[50%] bg-[#2D6A4F]/8 rounded-full translate-y-1/3 -translate-x-1/4 blur-[80px]" />
  <div className="absolute top-1/2 left-1/2 w-[50%] h-[40%] bg-[#e6b741]/3 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[100px]" />

  {/* المان‌های تزئینی بالایی */}
  <div className="absolute top-6 right-6 opacity-[0.06]">
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
      <path d="M20,0 L24,16 L40,20 L24,24 L20,40 L16,24 L0,20 L16,16 Z" fill="#e6b741" />
    </svg>
  </div>

  <div className="absolute bottom-8 left-6 opacity-[0.05]">
    <svg width="36" height="36" viewBox="0 0 50 50" fill="none">
      <circle cx="25" cy="25" r="20" stroke="#e6b741" strokeWidth="0.5" />
      <circle cx="25" cy="25" r="14" stroke="#e6b741" strokeWidth="0.5" />
      <circle cx="25" cy="25" r="8" stroke="#e6b741" strokeWidth="0.5" />
      <circle cx="25" cy="25" r="2" fill="#e6b741" />
    </svg>
  </div>

  <svg className="absolute top-9 left-8 opacity-[0.04]" width="40" height="40" viewBox="0 0 60 60" fill="none">
    <line x1="0" y1="30" x2="60" y2="30" stroke="#e6b741" strokeWidth="0.3" />
    <line x1="30" y1="0" x2="30" y2="60" stroke="#e6b741" strokeWidth="0.3" />
    <line x1="10" y1="10" x2="50" y2="50" stroke="#e6b741" strokeWidth="0.2" />
    <line x1="50" y1="10" x2="10" y2="50" stroke="#e6b741" strokeWidth="0.2" />
  </svg>

  {/* نشان ویژه زبانیون (جایگزین خطوط صاف) */}
  <div className="absolute top-[15%] right-[10%] opacity-[0.07]">
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      {/* کتاب باز شده */}
      <path d="M12 14L24 8L36 14" stroke="#e6b741" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 14V32" stroke="#e6b741" strokeWidth="0.4" strokeLinecap="round"/>
      <path d="M36 14V32" stroke="#e6b741" strokeWidth="0.4" strokeLinecap="round"/>
      {/* بال‌های باز */}
      <path d="M24 8C24 8 20 4 16 6" stroke="#e6b741" strokeWidth="0.6" strokeLinecap="round"/>
      <path d="M24 8C24 8 28 4 32 6" stroke="#e6b741" strokeWidth="0.6" strokeLinecap="round"/>
      {/* نقطه مرکزی - سنگ بنا */}
      <circle cx="24" cy="8" r="1.8" fill="#e6b741" opacity="0.5"/>
      <circle cx="24" cy="8" r="4" stroke="#e6b741" strokeWidth="0.2" opacity="0.4"/>
    </svg>
  </div>

  <div className="absolute bottom-[18%] left-[10%] opacity-[0.06]">
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
      {/* اشاره‌گر و مسیر یادگیری */}
      <path d="M8 32L20 20L32 32" stroke="#e6b741" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20L20 8" stroke="#e6b741" strokeWidth="0.6" strokeLinecap="round"/>
      <path d="M20 8L16 12" stroke="#e6b741" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 8L24 12" stroke="#e6b741" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="20" cy="20" r="2" fill="#e6b741" opacity="0.3"/>
      <circle cx="20" cy="20" r="6" stroke="#e6b741" strokeWidth="0.2" opacity="0.2"/>
    </svg>
  </div>

  {/* محتوای اصلی */}
  <div className="relative z-10 flex flex-col items-center text-center">
    {/* لوگو */}
    <div className="relative w-14 h-14 mb-3 mx-auto">
      <div className="absolute inset-0 bg-[#e6b741]/10 rounded-full blur-xl" />
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="44" stroke="#e6b741" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3" />
        <circle cx="50" cy="50" r="38" stroke="#e6b741" strokeWidth="0.3" strokeDasharray="2 6" opacity="0.15" />
      </svg>
      <div
        className={`relative z-10 w-full h-full rounded-2xl border border-white/10 p-1.5 flex items-center justify-center ${
          isCapturing ? "bg-white/8" : "bg-white/5 backdrop-blur-sm"
        }`}
      >
        <Image src="/logo.png" alt="زبانیون" width={26} height={26} className="object-contain" unoptimized />
      </div>
    </div>

    {/* عنوان */}
    <h3 className="text-sm font-black text-white mb-1 leading-tight">اولین سنگ بنای</h3>
    <h3 className="text-sm font-black text-[#e6b741] mb-2 leading-tight">داستان زبان‌آموزی‌ات</h3>

    {/* جداکننده */}
    <div className="flex items-center justify-center gap-2 mb-2">
      <div className="w-5 h-px bg-[#e6b741]/20" />
      <div className="w-1 h-1 rounded-full bg-[#e6b741]/40" />
      <div className="w-5 h-px bg-[#e6b741]/20" />
    </div>

    {/* زیرعنوان */}
    <p className="text-white/25 text-[9px] mb-3 leading-relaxed max-w-[180px] mx-auto">
      هویت دیجیتال تو در دنیای زبانیون
    </p>

    {/* نام کاربری با کادر تزئینی */}
    <div className="relative inline-block mb-3">
      <div className="absolute -inset-2">
        <svg width="100%" height="100%" viewBox="0 0 160 50" fill="none" className="absolute inset-0">
          <path d="M12,0 L12,10 M12,0 L22,0" stroke="#e6b741" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <path d="M148,0 L148,10 M148,0 L138,0" stroke="#e6b741" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <path d="M12,50 L12,40 M12,50 L22,50" stroke="#e6b741" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <path d="M148,50 L148,40 M148,50 L138,50" stroke="#e6b741" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>
      <div
        className={`relative rounded-xl px-3 py-1.5 border border-[#e6b741]/15 ${
          isCapturing ? "bg-white/8" : "bg-white/5 backdrop-blur-sm"
        }`}
      >
        <span className="text-base font-black text-[#e6b741] font-mono tracking-wider" dir="ltr">
          @{username}
        </span>
        <div className="absolute bottom-1 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#e6b741]/30 to-transparent" />
      </div>
    </div>

    {/* متن انحصاری - منتقل شده به اینجا */}
    <p className="text-white/30 text-[7px] leading-relaxed max-w-[200px] mx-auto font-medium">
      از این لحظه، هیچ‌کس دیگری نمی‌تواند
      <span className="text-[#e6b741] font-bold"> @{username} </span>
      باشد
    </p>
  </div>

  {/* فوتر */}
  <div className="relative z-10 border-t border-white/5 pt-2.5 flex justify-center mt-3">
    <div className="text-[9px] text-white/15 font-light tracking-wider">zabanionapp.ir</div>
  </div>
</div>
  );
}

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<string | undefined>();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState("");

  const [downloading, setDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const featuresRef = useRef(null);
  const formSectionRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  // ⭐ Get referral from URL & handle hash scroll
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) setReferralCode(ref);

      if (window.location.hash === "#PreRegistration") {
        // هدایت نرم به فرم
        setTimeout(() => {
          formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 200);
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, []);

  // ⭐ Scroll to form function for header button
  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ⭐ Real API username check
  const checkUsername = async () => {
    if (!username.trim() || username.trim().length < 3) return;
    setUsernameStatus("checking");
    try {
      const data = await checkUsernameAPI(username.trim().toLowerCase());
      setUsernameStatus(data.available ? "available" : "taken");
      if (!data.available) {
        toast.error("این نام کاربری قبلاً انتخاب شده");
      }
    } catch (error) {
      setUsernameStatus("taken");
      toast.error("خطا در بررسی نام کاربری");
    }
  };

  useEffect(() => {
    if (username.trim().length >= 3) {
      const timer = setTimeout(checkUsername, 600);
      return () => clearTimeout(timer);
    } else {
      setUsernameStatus("idle");
    }
  }, [username]);

  const validatePhone = (val: string) => {
    const cleanPhone = val.replace(/\D/g, '');
    if (cleanPhone.length === 0) return null;
    if (!cleanPhone.startsWith('09')) return "باید با ۰۹ شروع شود";
    if (cleanPhone.length !== 11) return "شماره موبایل باید ۱۱ رقم باشد";
    return null;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) return;
    setPhone(val);
    setPhoneError(validatePhone(val));
  };

  // ⭐ Real API register with referral
  const handleSubmit = async () => {
    if (!username.trim() || !phone.trim() || phoneError) return;
    setLoading(true);
    try {
      const data = await registerAPI(
        username.trim().toLowerCase(),
        phone.trim(),
        referralCode
      );

      if (data.success) {
        setRegisteredUsername(username.trim().toLowerCase());
        setShowSuccess(true);
        toast.success(data.message || "🎉 ثبت‌نام با موفقیت انجام شد!");

        if (referralCode) {
          toast.success(`🎁 با دعوت @${referralCode}، اولویت شما در صف افزایش یافت!`);
        }
      } else {
        toast.error(data.error || "خطا در ثبت‌نام");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setUsername("");
    setPhone("");
    setUsernameStatus("idle");
    setPhoneError(null);
    setShowSuccess(false);
    setRegisteredUsername("");
    setIsCapturing(false);
  };

  // ====== تابع دانلود با dom-to-image-more ======
  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    setIsCapturing(true);

    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const dataUrl = await domtoimage.toPng(cardRef.current, {
        quality: 1.0,
        width: cardRef.current.offsetWidth * 3,
        height: cardRef.current.offsetHeight * 3,
        style: {
          transform: "scale(3)",
          transformOrigin: "top left",
          width: cardRef.current.offsetWidth + "px",
          height: cardRef.current.offsetHeight + "px",
        },
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `Zabanion_${registeredUsername}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("کارت با موفقیت دانلود شد!");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("خطا در دانلود. لطفاً اسکرین‌شات بگیرید.");
    } finally {
      setIsCapturing(false);
      setDownloading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `https://zabanionapp.ir/?ref=${registeredUsername}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("لینک دعوت کپی شد!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const link = `https://zabanionapp.ir/?ref=${registeredUsername}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "زبانیون",
          text: `به خانواده زبانیون پیوستم! نام کاربری من: @${registeredUsername}`,
          url: link,
        });
      } catch { }
    } else {
      copyReferralLink();
    }
  };

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

          <button
            onClick={scrollToForm}
            className="group flex items-center gap-1 bg-[#e6b741] hover:bg-[#d4a635] text-[#0F1F18] px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-[0_4px_20px_rgba(230,183,65,0.25)] hover:shadow-[0_6px_25px_rgba(230,183,65,0.35)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="inline">پیش‌ثبت‌نام</span>
          </button>
        </motion.div>
      </header>

      {/* === بخش Hero بهینه‌شده برای موبایل === */}
      <section className="min-h-screen pt-20 sm:pt-28 pb-8 sm:pb-12 px-4 flex flex-col lg:flex-row-reverse items-center justify-center gap-4 sm:gap-8 lg:gap-20 max-w-7xl mx-auto w-full relative z-10">
        
        {/* متن Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-5 sm:mt-1 flex-1 flex flex-col items-center lg:items-start text-center lg:text-right w-full lg:w-1/2"
        >
          {/* تایتل جمع‌وجور در موبایل */}
          <h1 className="text-white font-black leading-tight tracking-tight mb-3 sm:mb-6 lg:mb-8">
            <span className="block text-[1.6rem] sm:text-[3rem] md:text-[3.8rem] lg:text-[5rem] xl:text-[5.6rem]">
              نامی که لایقش هستی،
            </span>
            <span className="block text-[1.6rem] sm:text-[3rem] md:text-[3.8rem] lg:text-[5rem] xl:text-[5.6rem]">
              <span className="text-[#e6b741] relative inline-block">
                پیش از همه
                <DecorativeLine className="absolute -bottom-1 sm:-bottom-2 lg:-bottom-3 right-0 text-[#e6b741] w-12 sm:w-16 lg:w-20 hidden sm:block" delay={0.8} />
              </span>
              {" "}مال توست
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-white/50 text-xs sm:text-sm md:text-lg leading-relaxed max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg font-medium mb-1 sm:mb-3 px-2 sm:px-0"
          >
            جایی در صف اول بایست. نام کاربری‌ات را همین الان ثبت کن
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white/30 text-[10px] sm:text-xs leading-relaxed max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg font-medium px-2 sm:px-0"
          >
            هر نام، یک داستان است. داستان تو از کجا شروع می‌شود؟
          </motion.p>

          {referralCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 text-amber-400 text-sm font-medium mt-3"
            >
              دعوت شده توسط @{referralCode} - اولویت شما بالاتر است!
            </motion.div>
          )}

          <ThinDivider className="my-3 sm:my-6" />
        </motion.div>

        {/* فرم - با ref برای اسکرول هدفمند */}
        <motion.div
  ref={formSectionRef}
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.4 }}
  className="flex-1 w-full lg:w-[45%] flex justify-center lg:justify-start scroll-mt-24 sm:scroll-mt-28"
>
          <div className="w-full max-w-[420px] sm:max-w-[460px]">
            <AnimatePresence mode="wait">
              {!showSuccess ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#FAFAFA] rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 md:p-9 shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden border border-white/10"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#e6b741]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#2D6A4F]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                  <div className="relative z-10">
                    <div className="text-center mb-6 sm:mb-8">
                      <h3 className="text-xl sm:text-2xl font-black text-[#0F1F18] mb-1.5 sm:mb-2 tracking-tight">
                        این نام، فقط برای تو
                      </h3>
                      <p className="text-stone-400 text-[11px] sm:text-xs leading-relaxed max-w-xs mx-auto">
                        قبل از همه، نامی که همیشه می‌خواستی رو مال خودت کن
                      </p>
                    </div>

                    {/* استپ‌ها */}
                    <div className="flex items-center justify-center gap-0 mb-6 sm:mb-8">
                      <div className="flex items-center">
                        <motion.div
                          animate={{
                            backgroundColor: step >= 1 ? (step > 1 ? "#10b981" : "#e6b741") : "#f3f4f6",
                            scale: step === 1 ? 1.05 : 1,
                          }}
                          className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm sm:shadow-md transition-all duration-300 ${
                            step >= 1 ? "text-[#0F1F18] shadow-lg" : "text-gray-400"
                          } ${step === 1 ? "shadow-[#e6b741]/30" : ""}`}
                        >
                          {step > 1 ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </motion.div>
                          ) : (
                            <AtSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                        </motion.div>
                        
                        <div className="w-10 sm:w-12 md:w-14 h-0.5 mx-0.5 sm:mx-1 rounded-full overflow-hidden bg-gray-100">
                          <motion.div
                            animate={{ width: step > 1 ? "100%" : "0%" }}
                            className="h-full bg-gradient-to-r from-[#e6b741] to-emerald-400 rounded-full"
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                        
                        <motion.div
                          animate={{
                            backgroundColor: step >= 2 ? (step > 2 ? "#10b981" : "#e6b741") : "#f3f4f6",
                            scale: step === 2 ? 1.05 : 1,
                          }}
                          className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm sm:shadow-md transition-all duration-300 ${
                            step >= 2 ? "text-[#0F1F18] shadow-lg" : "text-gray-400"
                          } ${step === 2 ? "shadow-[#e6b741]/30" : ""}`}
                        >
                          {step > 2 ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </motion.div>
                          ) : (
                            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                        </motion.div>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {step === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3 sm:space-y-4"
                        >
                          <div className="bg-gradient-to-br from-[#F5F7F5] to-[#EDF1EE] rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[#e6b741]/10">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#e6b741]" />
                              </div>
                              <div>
                                <h4 className="text-[#0F1F18] font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">
                                  امضای دیجیتال تو
                                </h4>
                                <p className="text-gray-400 text-[10px] sm:text-[11px] leading-relaxed">
                                  یک یوزرنیم خاص و ماندگار انتخاب کن 
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#e6b741]/10 to-emerald-400/10 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative">
                              <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                                placeholder="ali"
                                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 md:py-4 rounded-2xl sm:rounded-3xl bg-white border-2 border-gray-100 outline-none text-left text-sm sm:text-base font-medium transition-all placeholder:text-gray-300 placeholder:font-normal focus:border-[#e6b741] focus:bg-white focus:ring-4 focus:ring-[#e6b741]/10 shadow-sm"
                                dir="ltr"
                                autoFocus
                              />
                              <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                                {usernameStatus === "checking" && (
                                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e6b741] animate-spin" />
                                )}
                                {usernameStatus === "available" && (
                                  <motion.div 
                                    initial={{ scale: 0, rotate: -90 }} 
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                  >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                                    </div>
                                  </motion.div>
                                )}
                                {usernameStatus === "taken" && (
                                  <motion.div 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }}
                                    className="w-5 h-5 sm:w-6 sm:h-6 bg-red-100 rounded-full flex items-center justify-center"
                                  >
                                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between px-1.5 sm:px-2">
                            <span className="text-[9px] sm:text-[10px] text-gray-400 flex items-center gap-1">
                              <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${username.length >= 3 ? "bg-emerald-400" : "bg-gray-300"}`} />
                              حداقل ۳ کاراکتر
                            </span>
                            {usernameStatus === "available" && (
                              <motion.span
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[9px] sm:text-[10px] text-emerald-600 font-bold flex items-center gap-1 sm:gap-1.5 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                              >
                                درخشان و آزاد
                                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </motion.span>
                            )}
                            {usernameStatus === "taken" && (
                              <motion.span
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[9px] sm:text-[10px] text-red-400 font-medium"
                              >
                                این نام قبلاً انتخاب شده
                              </motion.span>
                            )}
                          </div>

                          <motion.button
                            onClick={() => usernameStatus === "available" && setStep(2)}
                            disabled={usernameStatus !== "available"}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 sm:py-3.5 md:py-4 bg-[#0F1F18] hover:bg-[#1A362D] text-white rounded-2xl sm:rounded-3xl font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm shadow-lg sm:shadow-xl shadow-[#0F1F18]/20 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-[#0F1F18]/25 hover:-translate-y-0.5 active:translate-y-0"
                          >
                            ادامه
                            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </motion.button>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3 sm:space-y-4"
                        >
                          <motion.div 
                            layout
                            className="bg-gradient-to-r from-[#e6b741]/5 via-[#e6b741]/10 to-[#e6b741]/5 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[#e6b741]/20 relative overflow-hidden"
                          >
                            <div className="absolute top-1/2 right-1/3 w-16 sm:w-20 h-16 sm:h-20 bg-[#e6b741]/20 rounded-full blur-2xl -translate-y-1/2" />
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl sm:rounded-2xl bg-white shadow-sm sm:shadow-md flex items-center justify-center">
                                  <Crown className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-[#e6b741]" />
                                </div>
                                <div>
                                  <span className="text-[9px] sm:text-[10px] text-gray-500 block mb-0.5">نام برگزیده تو</span>
                                  <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="font-bold text-[#0F1F18] font-mono text-sm sm:text-base md:text-lg tracking-wide" dir="ltr">
                                      @{username}
                                    </span>
                                    <motion.span
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.2 }}
                                      className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-100 rounded-full flex items-center justify-center"
                                    >
                                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" />
                                    </motion.span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => setStep(1)}
                                className="text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-white/80 text-gray-500 font-bold hover:bg-white hover:text-[#e6b741] transition-all border border-gray-200/50 backdrop-blur-sm"
                              >
                                ویرایش
                              </button>
                            </div>
                          </motion.div>

                          <div className="text-center pt-1 sm:pt-2">
                            <h4 className="text-[#0F1F18] font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">کارت دعوت رو دریافت کن</h4>
                            <p className="text-gray-400 text-[10px] sm:text-[11px]">
                              شماره‌ات رو وارد کن تا دعوت‌نامه اختصاصی‌ات رو برات بفرستیم
                            </p>
                          </div>

                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#e6b741]/10 to-emerald-400/10 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative">
                              <input
                                type="tel"
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                                maxLength={11}
                                className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 md:py-4 rounded-2xl sm:rounded-3xl bg-white border-2 outline-none text-left text-sm sm:text-base font-medium transition-all placeholder:text-gray-300 placeholder:text-right focus:bg-white focus:ring-4 ${
                                  phoneError
                                    ? "border-red-200 focus:border-red-300 focus:ring-red-50"
                                    : phone.length === 11
                                    ? "border-emerald-200 focus:border-emerald-300 focus:ring-emerald-50"
                                    : "border-gray-100 focus:border-[#e6b741] focus:ring-[#e6b741]/10"
                                } shadow-sm`}
                                dir="ltr"
                                autoFocus
                              />
                              <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                                {phone.length === 11 && !phoneError && (
                                  <motion.div 
                                    initial={{ scale: 0, rotate: -90 }} 
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                  >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </div>

                          {phoneError && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-[9px] sm:text-[10px] text-red-400 px-1.5 sm:px-2 font-medium flex items-center gap-1"
                            >
                              <span className="w-1 h-1 bg-red-400 rounded-full" />
                              {phoneError}
                            </motion.p>
                          )}

                          {phone.length === 11 && !phoneError && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-[9px] sm:text-[10px] text-emerald-500 px-1.5 sm:px-2 font-medium flex items-center gap-1"
                            >
                              <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                              شماره موبایل معتبر است
                            </motion.p>
                          )}

                          <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                            <motion.button
                              onClick={() => setStep(1)}
                              whileTap={{ scale: 0.97 }}
                              className="flex-1 py-3 sm:py-3.5 md:py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl sm:rounded-3xl font-bold transition-all text-xs sm:text-sm"
                            >
                              بازگشت
                            </motion.button>
                            <motion.button
                              onClick={handleSubmit}
                              disabled={loading || !!phoneError || phone.length !== 11}
                              whileTap={{ scale: 0.98 }}
                              className="flex-[2] py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-[#e6b741] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0F1F18] rounded-2xl sm:rounded-3xl font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm shadow-lg sm:shadow-xl shadow-[#e6b741]/20 hover:shadow-xl sm:hover:shadow-2xl hover:shadow-[#e6b741]/30 hover:-translate-y-0.5 active:translate-y-0"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                  در حال ثبت...
                                </>
                              ) : (
                                <>
                                  <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  دریافت کارت دعوت
                                </>
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-4 sm:mt-6 flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-gray-400">
                      <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                      اطلاعات تو پیش ما محفوظ و امن می‌مونه
                    </div>
                  </div>
                </motion.div>
              ) : (
                // ===== Success State =====
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                  className="bg-[#FAFAFA] rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-11 shadow-[0_40px_100px_rgba(0,0,0,0.4)] text-center relative overflow-hidden border border-white/10"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#e6b741]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#2D6A4F]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                  <div className="relative z-10">
                    <div className="text-center mb-3">
                      <h3 className="text-sm font-bold text-[#0F1F18] mb-1">
                        به خانواده زبانیون خوش اومدی!
                      </h3>
                      <p className="text-stone-400 text-[11px] mb-2">
                        نام کاربری‌ات ثبت شد. 
                        <span className="text-stone-500 font-medium"> کارت دعوتت رو ذخیره کن</span>
                      </p>
                      {referralCode && (
                        <p className="text-amber-500/80 text-[11px]">
                          با دعوت @{referralCode} اولویتت بالاتر رفته
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <InviteCard username={registeredUsername} cardRef={cardRef} isCapturing={isCapturing} />
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm">
                      <button
                        onClick={downloadCard}
                        disabled={downloading}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-medium transition-all flex-shrink-0"
                      >
                        {downloading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {downloading ? 'ذخیره...' : 'ذخیره'}
                        </span>
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center justify-center w-9 h-9 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all flex-shrink-0"
                        title="اشتراک گذاری"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <span className="text-[11px] text-gray-300 truncate font-mono" dir="ltr">
                          zabanionapp.ir/?ref={registeredUsername}
                        </span>
                        <button
                          onClick={copyReferralLink}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg text-[11px] transition-all flex-shrink-0"
                        >
                          {copied ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span className="hidden sm:inline">{copied ? 'کپی شد' : 'کپی'}</span>
                        </button>
                      </div>
                      <button
                        onClick={resetForm}
                        className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
                        title="ثبت نام جدید"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
          همین حالا نامت را ثبت کن و جزو اولین کسانی باش که وارد این دنیا می‌شوند
        </p>
        <button
          onClick={scrollToForm}
          className="group inline-flex items-center gap-3 bg-[#e6b741] hover:bg-[#d4a635] text-[#0F1F18] px-8 py-4 rounded-full text-base font-bold transition-all shadow-[0_8px_30px_rgba(230,183,65,0.2)] hover:shadow-[0_10px_35px_rgba(230,183,65,0.3)] hover:-translate-y-1"
        >
          <span>همین الان نامت را ثبت کن</span>
          <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
        </button>
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
        <p className="text-white/15 text-[10px]">تمام محتوا با زیرنویس دو زبانه • هوش مصنوعی پیشرفته • یادگیری به روش غوطه‌وری</p>
      </footer>

      {/* مودال پیش‌ثبت‌نام */}
      <PreRegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}