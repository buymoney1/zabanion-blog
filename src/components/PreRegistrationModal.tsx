"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import domtoimage from "dom-to-image-more";
import { toast } from "sonner";
import {
  Check,
  X,
  Loader2,
  Download,
  Copy,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Phone,
  AtSign,
  ShieldCheck,
  Gift,
  Crown,
} from "lucide-react";

// ==================== Types ====================
interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CardData {
  username: string;
  queuePosition?: number;
  priorityScore?: number;
  referralCount?: number;
  cardUrl?: string;
}

interface StepItem {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface InviteCardProps {
  username: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
  isCapturing: boolean;
  inModal?: boolean;
}

// ==================== API Calls ====================
async function checkUsernameAPI(username: string): Promise<{ available: boolean; error?: string }> {
  try {
    const res = await fetch("/api/prereg/check-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    return { available: data.available, error: data.error };
  } catch {
    return { available: false, error: "خطا در ارتباط با سرور" };
  }
}

async function registerAPI(
  username: string,
  phone: string,
  referralCode?: string
): Promise<{ success: boolean; card?: CardData; error?: string }> {
  try {
    const res = await fetch("/api/prereg/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, phone, referralCode }),
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, card: data.card };
    }
    return { success: false, error: data.error };
  } catch {
    return { success: false, error: "خطا در ارتباط با سرور" };
  }
}

// ==================== Decorative Components ====================
function DecorativeCircle({ className = "", size = 40, delay = 0 }: { className?: string; size?: number; delay?: number }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size} height={size} viewBox="0 0 40 40" fill="none"
      className={className}
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, delay, ease: "easeInOut" }}
    >
      <motion.circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.5, delay, ease: "easeInOut" }} />
      <motion.circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: delay + 0.3, ease: "easeInOut" }} />
    </motion.svg>
  );
}

function DecorativeLine({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg xmlns="http://www.w3.org/2000/svg" width="80" height="6" viewBox="0 0 80 6" fill="none" className={className}
      initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: "easeInOut" }}>
      <motion.path d="M0,3 Q20,6 40,3 Q60,0 80,3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1, delay, ease: "easeInOut" }} />
    </motion.svg>
  );
}

// ==================== InviteCard ====================
function InviteCard({ username, cardRef, isCapturing, inModal = false }: InviteCardProps) {
  return (
    <div
      ref={cardRef}
      className={`relative ${inModal ? "w-full h-full" : "w-full aspect-[4/5] max-w-[280px]"} bg-[#0F1F18] rounded-3xl shadow-2xl flex flex-col justify-center overflow-hidden p-6 border border-white/5`}
    >
      <div className={`absolute top-0 right-0 w-[70%] h-[50%] bg-[#e6b741]/8 rounded-full -translate-y-1/3 translate-x-1/4 ${isCapturing ? "" : "blur-[80px]"}`} />
      <div className={`absolute bottom-0 left-0 w-[60%] h-[50%] bg-[#2D6A4F]/8 rounded-full translate-y-1/3 -translate-x-1/4 ${isCapturing ? "" : "blur-[80px]"}`} />
      <div className={`absolute top-1/2 left-1/2 w-[50%] h-[40%] bg-[#e6b741]/3 rounded-full -translate-x-1/2 -translate-y-1/2 ${isCapturing ? "" : "blur-[100px]"}`} />

      <div className="absolute top-7 right-7 opacity-[0.06]">
        {/* ADDED XMLNS */}
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 40 40" fill="none">
          <path d="M20,0 L24,16 L40,20 L24,24 L20,40 L16,24 L0,20 L16,16 Z" fill="#e6b741" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative w-16 h-16 mb-4 mx-auto">
          <div className={`absolute inset-0 bg-[#e6b741]/10 rounded-full ${isCapturing ? "" : "blur-xl"}`} />
          <div className={`relative z-10 w-full h-full rounded-2xl border border-white/10 p-2 flex items-center justify-center ${isCapturing ? "bg-[#16261f]" : "bg-white/5 backdrop-blur-sm"}`}>
            {/* CHANGED FROM NEXT/IMAGE TO IMG */}
            <img 
              src="/logo.png" 
              alt="زبانیون" 
              style={{ width: "30px", height: "30px", objectFit: "contain" }} 
              crossOrigin="anonymous" 
            />
          </div>
        </div>

        <h3 className="text-base font-black text-white mb-1 leading-tight">اولین سنگ بنای</h3>
        <h3 className="text-base font-black text-[#e6b741] mb-3 leading-tight">داستان زبان‌آموزی‌ات</h3>

        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-px bg-[#e6b741]/20" />
          <div className="w-1 h-1 rounded-full bg-[#e6b741]/40" />
          <div className="w-6 h-px bg-[#e6b741]/20" />
        </div>

        <div className="relative inline-block mb-4">
          <div className="absolute -inset-3">
             {/* ADDED XMLNS */}
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 180 60" fill="none" className="absolute inset-0">
              <path d="M15,0 L15,12 M15,0 L27,0" stroke="#e6b741" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <path d="M165,0 L165,12 M165,0 L153,0" stroke="#e6b741" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <path d="M15,60 L15,48 M15,60 L27,60" stroke="#e6b741" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <path d="M165,60 L165,48 M165,60 L153,60" stroke="#e6b741" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
          <div className={`relative rounded-xl px-5 py-2.5 border border-[#e6b741]/15 ${isCapturing ? "bg-[#16261f]" : "bg-white/5 backdrop-blur-sm"}`}>
            <span className="text-xl font-black text-[#e6b741] font-mono tracking-wider" dir="ltr">@{username}</span>
          </div>
        </div>

        <p className="text-white/30 text-[10px] leading-relaxed max-w-[240px] mx-auto font-medium">
          از این لحظه، هیچ‌کس دیگری نمی‌تواند
          <span className="text-[#e6b741] font-bold"> @{username} </span>
          باشد
        </p>
      </div>

      <div className="relative z-10 border-t border-white/5 pt-3 flex justify-center mt-auto">
        <div className="text-[10px] text-white/15 font-light tracking-wider">zabanionapp.ir</div>
      </div>
    </div>
  );
}

// ==================== Main Modal ====================
export default function PreRegistrationModal({ isOpen, onClose }: PreRegistrationModalProps) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [referralCode, setReferralCode] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) setReferralCode(ref);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setUsername("");
      setPhone("");
      setUsernameStatus("idle");
      setPhoneError(null);
      setCardData(null);
      setIsCapturing(false);
    }
  }, [isOpen]);

  const requestIdRef = useRef(0);

  const checkUsername = async () => {
    if (!username.trim() || username.trim().length < 3) return;
    
    const currentRequestId = ++requestIdRef.current;
    setUsernameStatus("checking");
    
    try {
      const result = await checkUsernameAPI(username.trim().toLowerCase());
      if (currentRequestId !== requestIdRef.current) return;
      setUsernameStatus(result.available ? "available" : "taken");
      
      if (!result.available) {
        toast.error("این نام کاربری قبلاً انتخاب شده", { description: "لطفاً یک نام کاربری دیگر انتخاب کنید" });
      }
    } catch {
      if (currentRequestId !== requestIdRef.current) return;
      setUsernameStatus("taken");
      toast.error("خطا در بررسی نام کاربری", { description: "لطفاً دوباره تلاش کنید" });
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

  const validatePhone = (val: string): string | null => {
    const cleanPhone = val.replace(/\D/g, "");
    if (cleanPhone.length === 0) return null;
    if (!cleanPhone.startsWith("09")) return "باید با ۰۹ شروع شود";
    if (cleanPhone.length !== 11) return "شماره موبایل باید ۱۱ رقم باشد";
    return null;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) return;
    setPhone(val);
    setPhoneError(validatePhone(val));
  };

  const handleSubmit = async () => {
    if (!username.trim() || !phone.trim() || phoneError) return;
    
    setLoading(true);
    try {
      const result = await registerAPI(username.trim().toLowerCase(), phone.trim(), referralCode);

      if (result.success && result.card) {
        setCardData(result.card);
        toast.success("🎉 به خانواده زبانیون خوش اومدی!", { description: "نام کاربری تو برای همیشه ثبت شد" });
        if (referralCode) {
          toast.success(`🎁 با دعوت @${referralCode}، اولویت شما افزایش یافت!`);
        }
      } else {
        toast.error(result.error || "خطا در ثبت‌نام");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (cardData) {
      const link = `https://zabanionapp.ir/?ref=${cardData.username}`;
      navigator.clipboard.writeText(link).then(() => {
        setCopied(true);
        toast.success("لینک دعوت کپی شد!");
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => toast.error("خطا در کپی کردن لینک"));
    }
  };

  const handleShare = async () => {
    if (!cardData) return;
    const link = `https://zabanionapp.ir/?ref=${cardData.username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "زبانیون",
          text: `به خانواده زبانیون پیوستم! نام کاربری من: @${cardData.username}`,
          url: link,
        });
        toast.success("با موفقیت به اشتراک گذاشته شد!");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  // دانلود رفع‌مشکل شده با dom-to-image
  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    setIsCapturing(true);

    // تاخیر بیشتر برای اطمینان کامل از رندر مجدد بدون افکت‌های blur
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const node = cardRef.current;
      const scale = 3;
      
      // استفاده از offsetWidth/Height پایه برای جلوگیری از مشکلات transform
      const width = node.offsetWidth;
      const height = node.offsetHeight;

      const dataUrl = await domtoimage.toPng(node, {
        quality: 1.0,
        width: width * scale,
        height: height * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${width}px`,
          height: `${height}px`,
          margin: "0",
        },
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `Zabanion_${cardData?.username}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("کارت با موفقیت دانلود شد!");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("خطا در دانلود. لطفاً اسکرین‌شات بگیرید.");
    } finally {
      setIsCapturing(false);
      setDownloading(false);
    }
  };

  const steps: StepItem[] = [
    { id: 1, title: "نام کاربری", icon: AtSign },
    { id: 2, title: "تأیید هویت", icon: Phone },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0F1F18]/95 backdrop-blur-xl flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0d1f18] shadow-2xl w-full max-w-4xl rounded-3xl overflow-hidden relative flex flex-col md:flex-row-reverse max-h-[90vh] md:max-h-[580px]"
            dir="rtl"
          >
            <button onClick={onClose}
              className="absolute top-3 left-3 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all z-30">
              <X className="w-4 h-4" />
            </button>

            {!cardData ? (
              <>
                <div className="flex-1 flex flex-col overflow-y-auto bg-[#FAFAFA]">
                  <div className="bg-white px-5 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 text-center relative overflow-hidden flex-shrink-0 border-b border-gray-100">
                    <div className="relative z-10">
                      <motion.div animate={{ y: [-1.5, 1.5, -1.5] }} transition={{ duration: 3, repeat: Infinity }}
                        className="mb-2 inline-block">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#e6b741]/10 to-[#e6b741]/5 rounded-2xl flex items-center justify-center mx-auto border border-[#e6b741]/10">
                          <DecorativeCircle size={28} className="text-[#e6b741]/50" delay={0.3} />
                        </div>
                      </motion.div>
                      <h2 className="text-lg sm:text-xl font-black text-[#0F1F18] mb-0.5">جای تو از قبل رزرو شده</h2>
                      <p className="text-stone-400 text-[10px] sm:text-[11px]">قبل از همه، نامی که همیشه می‌خواستی رو مال خودت کن</p>
                      {referralCode && (
                        <div className="mt-2 inline-block bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-[10px] text-amber-700 font-medium">
                          🎁 دعوت شده توسط @{referralCode}
                        </div>
                      )}
                    </div>
                    <div className="relative z-10 mt-3 flex items-center justify-center gap-0">
                      {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                          <motion.div
                            animate={{ backgroundColor: step >= s.id ? (step > s.id ? "#10b981" : "#e6b741") : "#f3f4f6", scale: step === s.id ? 1.05 : 1 }}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm transition-all ${step >= s.id ? "text-[#0F1F18]" : "text-gray-400"}`}>
                            {step > s.id ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                          </motion.div>
                          {i < 1 && (
                            <div className="w-8 sm:w-10 h-0.5 mx-0.5 rounded-full bg-gray-100">
                              <motion.div animate={{ width: step > s.id ? "100%" : "0%" }}
                                className="h-full bg-gradient-to-r from-[#e6b741] to-emerald-400 rounded-full" transition={{ duration: 0.5 }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5">
                    {step === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
                        <div className="relative">
                          <input
                            type="text" value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                            placeholder="ali" dir="ltr" autoFocus
                            className="w-full pl-10 pr-3 py-3 rounded-2xl bg-white border-2 border-gray-100 outline-none text-left text-sm font-medium focus:border-[#e6b741] focus:ring-4 focus:ring-[#e6b741]/10 shadow-sm"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            {usernameStatus === "checking" && <Loader2 className="w-4 h-4 text-[#e6b741] animate-spin" />}
                            {usernameStatus === "available" && <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5 text-emerald-500" /></div>}
                            {usernameStatus === "taken" && <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center"><X className="w-3.5 h-3.5 text-red-400" /></div>}
                          </div>
                        </div>
                        <button onClick={() => usernameStatus === "available" && setStep(2)}
                          disabled={usernameStatus !== "available"}
                          className="w-full py-3 bg-[#0F1F18] hover:bg-[#1A362D] text-white rounded-2xl font-bold disabled:opacity-30 flex items-center justify-center gap-1.5 text-sm">
                          ادامه <ArrowLeft className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                        <div className="bg-gradient-to-r from-[#e6b741]/5 to-[#e6b741]/10 rounded-2xl p-3 border border-[#e6b741]/20 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-[#e6b741]" />
                            <span className="font-bold text-[#0F1F18] font-mono" dir="ltr">@{username}</span>
                            <Check className="w-4 h-4 text-emerald-500" />
                          </div>
                          <button onClick={() => setStep(1)} className="text-[10px] px-2.5 py-1 rounded-xl bg-white text-gray-500 font-bold hover:text-[#e6b741]">ویرایش</button>
                        </div>
                        <input
                          type="tel" value={phone} onChange={handlePhoneChange}
                          placeholder="09xxxxxxxxx" maxLength={11} dir="ltr" autoFocus
                          className={`w-full pl-10 pr-3 py-3 rounded-2xl bg-white border-2 outline-none text-left text-sm font-medium shadow-sm ${phoneError ? "border-red-200" : phone.length === 11 ? "border-emerald-200" : "border-gray-100 focus:border-[#e6b741]"}`}
                        />
                        {phoneError && <p className="text-[10px] text-red-400">{phoneError}</p>}
                        {phone.length === 11 && !phoneError && <p className="text-[10px] text-emerald-500">✅ شماره معتبر</p>}
                        <div className="flex gap-2">
                          <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-100 rounded-2xl font-bold text-sm">بازگشت</button>
                          <button onClick={handleSubmit} disabled={loading || !!phoneError || phone.length !== 11}
                            className="flex-[2] py-3 bg-gradient-to-r from-[#e6b741] to-amber-500 rounded-2xl font-bold disabled:opacity-40 flex items-center justify-center gap-1.5 text-sm">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ثبت...</> : <><Gift className="w-4 h-4" /> دریافت کارت دعوت</>}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="px-4 py-2 bg-white border-t border-gray-100 text-center text-[10px] text-gray-400">
                    <ShieldCheck className="w-3 h-3 inline text-emerald-400 ml-1" />
                    اطلاعات تو پیش ما محفوظ و امن می‌مونه
                  </div>
                </div>

                <div className="hidden md:flex md:w-[42%] bg-[#0F1F18] p-8 items-center justify-center relative overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 w-[70%] h-[70%] bg-[#e6b741]/5 rounded-full -translate-y-1/4 translate-x-1/4 blur-[120px]" />
                  <div className="relative z-10 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-5">
                      <div className="absolute inset-0 bg-[#e6b741]/10 rounded-full blur-xl" />
                      <div className="relative w-full h-full bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                        {/* CHANGED FROM NEXT/IMAGE TO IMG */}
                        <img src="/logo.png" alt="زبانیون" style={{ width: 38, height: 38, objectFit: "contain" }} crossOrigin="anonymous" />
                      </div>
                    </div>
                    <DecorativeCircle size={42} className="text-[#e6b741]/30 mx-auto mb-4" delay={0.2} />
                    <h2 className="text-white text-xl font-black leading-tight mb-3">این مسیر<br />از تو شروع می‌شود.</h2>
                    <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                      با پیش‌ثبت‌نام در زبانیون، جزو اولین نفراتی باش که وارد دنیای جدید یادگیری زبان می‌شوند.
                    </p>
                    <DecorativeLine className="mx-auto mt-5 text-[#e6b741]/20" delay={0.4} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col md:flex-row-reverse w-full h-full">
                <div className="md:hidden flex flex-col h-full w-full">
                  <div className="flex-1 bg-[#0F1F18] p-4 flex items-center justify-center">
                    <div className="w-full max-w-[280px] aspect-[4/5]">
                      <InviteCard username={cardData.username} cardRef={cardRef} isCapturing={isCapturing} inModal />
                    </div>
                  </div>
                  <div className="flex-shrink-0 bg-[#FAFAFA] px-4 py-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button onClick={downloadCard} disabled={downloading}
                        className="flex-1 py-2.5 bg-gradient-to-r from-[#e6b741] to-[#d4a02e] text-[#0F1F18] rounded-2xl font-bold flex items-center justify-center gap-1.5 text-xs">
                        {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        {downloading ? "ذخیره..." : "ذخیره"}
                      </button>
                      <button onClick={handleShare}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-1.5 text-xs">
                        <Share2 className="w-3.5 h-3.5" /> اشتراک
                      </button>
                      <button onClick={copyReferralLink}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-1.5 text-xs">
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "کپی شد" : "کپی"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex md:flex-row-reverse w-full h-full">
                  <div className="flex-1 p-6 flex flex-col justify-center bg-[#FAFAFA]">
                    <div className="text-center mb-5">
                      <h3 className="text-lg font-black text-[#0F1F18] mb-1.5">به خانواده زبانیون خوش اومدی!</h3>
                      <p className="text-stone-400 text-[11px]">
                        نام کاربری تو برای همیشه ثبت شد
                        {referralCode && <span className="text-amber-600 block mt-1">🎁 با دعوت @{referralCode} اولویتت بالاتره!</span>}
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex gap-2">
                        <button onClick={downloadCard} disabled={downloading}
                          className="flex-[3] py-3 bg-gradient-to-r from-[#e6b741] to-[#d4a02e] text-[#0F1F18] rounded-2xl font-bold flex items-center justify-center gap-2 text-sm">
                          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          {downloading ? "ذخیره..." : "ذخیره کارت"}
                        </button>
                        <button onClick={handleShare}
                          className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-1.5 text-sm">
                          <Share2 className="w-4 h-4" /> اشتراک
                        </button>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5 pr-3 border">
                        <code className="flex-1 text-[10px] text-gray-400 truncate text-left" dir="ltr">
                          zabanionapp.ir/?ref={cardData.username}
                        </code>
                        <button onClick={copyReferralLink}
                          className="py-2 px-3.5 bg-[#e6b741] text-[#0F1F18] rounded-xl font-bold flex items-center justify-center gap-1 text-[11px]">
                          {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? "کپی شد" : "کپی"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-[42%] bg-[#0F1F18] p-6 flex items-center justify-center">
                    <div className="w-full h-full max-w-[280px]">
                      <InviteCard username={cardData.username} cardRef={cardRef} isCapturing={isCapturing} inModal />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
