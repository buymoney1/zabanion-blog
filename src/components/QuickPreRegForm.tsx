"use client";

import { useState } from "react";
import { 
  Trophy, 
  Check, 
  Copy, 
  Download, 
  Loader2, 
  User, 
  Lock, 
  X, 
  Share2, 
  CheckCircle2 
} from "lucide-react";

export default function QuickPreRegForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  // === منطق چک کردن یوزرنیم ===
  const checkUsername = async () => {
    if (!username.trim()) return;
    setUsernameStatus("checking");
    try {
      const res = await fetch("/api/prereg/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (data.available) {
        setUsernameStatus("available");
      } else {
        setUsernameStatus("taken");
      }
    } catch {
      setUsernameStatus("available"); // Fallback for UI demo
    }
  };

  // === منطق ارسال نهایی ===
  const submit = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/prereg/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          phone: phone.trim(),
          referralCode: new URLSearchParams(window.location.search).get("ref") || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) { 
        setCard(data.card); 
        setDone(true); 
      }
      else alert(data.error || "خطا");
    } catch { 
      alert("خطا"); 
    } finally { 
      setLoading(false); 
    }
  };

  // === کپی لینک ===
  const copyReferralLink = () => {
    if (card) {
      const link = `https://zabanion.ir/?ref=${card.username}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // === صفحه موفقیت (بعد از ثبت‌نام) ===
  if (done && card) {
    return (
      <div className="w-full max-w-[900px] mx-auto bg-[#FDFCF4] rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row" dir="rtl">
        
        {/* چپ: پس‌زمینه برندینگ */}
        <div className="w-full md:w-[40%] bg-[#1A362D] relative flex flex-col justify-between p-8 min-h-[300px] md:min-h-[500px]">
           <div className="absolute inset-0 opacity-70 bg-gradient-to-b from-[#1A362D]/90 via-[#1A362D]/50 to-[#1A362D]/90 z-10" />
          <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1470&auto=format&fit=crop" alt="Friends" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-20 mt-auto">
            <span className="inline-block bg-[#F2A900]/20 text-[#F2A900] text-xs font-bold px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
              کارت عضویت
            </span>
            <h2 className="text-white text-3xl font-black leading-tight">ثبت‌نام شما <br/>با موفقیت انجام شد!</h2>
          </div>
        </div>

        {/* راست: کارت و دکمه‌ها */}
        <div className="w-full md:w-[60%] p-8 md:p-10 bg-[#FDFCF4] flex flex-col items-center justify-center">
          <div className="bg-[#1A362D] rounded-[24px] w-full max-w-[300px] aspect-[4/5] p-6 flex flex-col justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#F2A900] flex items-center justify-center text-[#1A362D] font-bold">پ</div>
              <span className="font-bold text-white text-lg">پلاسینگ</span>
            </div>
            
            <div className="mt-auto mb-6">
              <span className="text-[10px] text-white/60 block mb-1">نام کاربری اختصاصی</span>
              <div className="text-[#F2A900] text-2xl font-bold font-mono text-left" dir="ltr">@{card.username}</div>
            </div>
            
            <div className="border-t border-white/20 pt-4 flex justify-between">
              <div className="text-[10px] text-white/50">zabanion.ir</div>
            </div>
          </div>

          <div className="w-full mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button 
                className="flex-1 py-3.5 bg-[#1A362D] hover:bg-[#0d281f] text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-md"
              >
                <Download className="w-4 h-4" /> ذخیره کارت
              </button>
              <button className="w-14 h-14 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 w-full bg-white rounded-2xl p-2 pr-4 border border-gray-200 shadow-sm">
              <div className="flex-1 text-[11px] text-gray-500 truncate text-left font-mono" dir="ltr">
                zabanion.ir/?ref={card.username}
              </div>
              <button
                onClick={copyReferralLink}
                className="py-2.5 px-4 bg-[#F2A900] hover:bg-[#d49a00] text-[#1A362D] rounded-xl font-bold flex items-center gap-2 text-xs transition-colors"
              >
                {copied ? <><CheckCircle2 className="w-4 h-4" /> کپی شد</> : <><Copy className="w-4 h-4" /> کپی لینک</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === صفحه اصلی فرم (پیش از ثبت‌نام) ===
  return (
    <div className="w-full max-w-[900px] mx-auto bg-[#FDFCF4] rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row" dir="rtl">
      
      {/* === بخش چپ: تصویر و برندینگ === */}
      <div className="w-full md:w-[40%] bg-[#1A362D] relative flex flex-col justify-between p-8 min-h-[400px] md:min-h-[600px]">
        {/* عکس پس‌زمینه */}
        <div className="absolute inset-0 opacity-70 bg-gradient-to-b from-[#1A362D]/90 via-[#1A362D]/50 to-[#1A362D]/90 z-10" />
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1470&auto=format&fit=crop" alt="Team" className="w-full h-full object-cover" />
        </div>

        {/* محتوای چپ */}
        <div className="relative z-20 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-[#F2A900] flex items-center justify-center text-[#1A362D] font-black text-lg">پ</div>
            <span className="text-white font-bold text-sm tracking-wide">پلاسینگ</span>
          </div>

          <div className="mt-8 md:mt-0">
            <span className="inline-block bg-[#F2A900]/20 text-[#F2A900] text-xs font-bold px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
              پیش از انتشار
            </span>
            <h1 className="text-white text-3xl md:text-4xl font-black leading-tight mb-4">
              نامت را قبل از همه <br />
              انتخاب کن
            </h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              در قدم اول، با ثبت نام خود در پلاسینگ، هویت خود را ثبت کن.
            </p>
          </div>

          <div className="flex items-center gap-2 text-white/50 text-[10px] mt-8 border-t border-white/10 pt-4">
            <div className="bg-white/10 p-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-[#F2A900]" /></div>
            <span>اطلاعات امن و محرمانه</span>
          </div>
        </div>
      </div>

      {/* === بخش راست: فرم ثبت‌نام (رنگ کرم) === */}
      <div className="w-full md:w-[60%] p-8 md:p-10 bg-[#FDFCF4] flex flex-col relative">
        
        {/* === استپ‌ر === */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === 1 ? "bg-[#F2A900] text-white shadow-md" : "bg-white border border-gray-200 text-gray-400"}`}>
              1
            </div>
            <span className={`text-xs font-medium ${step === 1 ? "text-[#1A362D]" : "text-gray-400"}`}>
              نام کاربری
            </span>
          </div>

          <div className="h-[1px] flex-1 bg-gray-200 mx-4 relative">
            <div className={`absolute top-0 right-0 h-full bg-[#1A362D] transition-all duration-500 ease-out ${step === 2 ? "w-full" : "w-0"}`} />
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all border ${step === 2 ? "bg-[#1A362D] text-white border-[#1A362D]" : "bg-white border-gray-200 text-gray-400"}`}>
              2
            </div>
            <span className={`text-xs font-medium ${step === 2 ? "text-[#1A362D]" : "text-gray-400"}`}>
              راه ارتباطی
            </span>
          </div>
        </div>

        {/* === باکس وسط (کرم روشن) === */}
        <div className="bg-[#F8F9F4] border border-[#ECEFE6] rounded-2xl p-6 mb-6 relative text-center">
          <div className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-sm border border-gray-100">
            <User className="w-4 h-4 text-[#1A362D]" />
          </div>
          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-[10px] font-bold text-[#1A362D] shadow-sm border border-gray-100">
            هویت تو در پلاسینگ
          </div>
          
          <div className="mt-6">
            <h3 className="text-[#1A362D] text-xl md:text-2xl font-bold mb-2">
              دوست داری با چه نامی دیده شوی؟
            </h3>
            <p className="text-[#1A362D]/50 text-xs font-medium">
              یک نام کوتاه و به‌یادماندنی با حروف انگلیسی انتخاب کن
            </p>
          </div>
        </div>

        {/* === ورودی‌ها === */}
        <div className="space-y-5 mb-6 flex-1">
          {step === 1 ? (
            <div className="relative">
              <div className="flex items-center border border-gray-200 rounded-full bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#1A362D]/10 focus-within:border-[#1A362D] transition-all">
                <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-100 bg-gray-50/50">
                  <User className="w-4 h-4 text-[#1A362D]" />
                  <span className="text-[10px] font-bold text-[#1A362D] whitespace-nowrap">
                    نام کاربری
                  </span>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ""));
                    setUsernameStatus("idle"); // Reset status on change
                  }}
                  placeholder="نام کاربری خود را وارد کنید"
                  className="flex-1 px-4 py-3 outline-none bg-transparent text-right text-sm placeholder:text-gray-300 w-full"
                  dir="rtl"
                />
              </div>
              <div className="flex items-center justify-end gap-2 mt-2 px-2 h-5">
                {usernameStatus === "checking" && <Loader2 className="w-4 h-4 text-[#1A362D] animate-spin" />}
                {usernameStatus === "available" && <Check className="w-4 h-4 text-emerald-500" />}
                {usernameStatus === "taken" && <X className="w-4 h-4 text-red-500" />}
                <span className="text-[10px] text-gray-400">
                  {usernameStatus === "idle" && "۳-۲۴ کاراکتر، حروف انگلیسی، عدد یا زیرخط"}
                  {usernameStatus === "available" && <span className="text-emerald-600 font-bold">✓ آزاد است</span>}
                  {usernameStatus === "taken" && <span className="text-red-500 font-bold">✗ تکراری است</span>}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center border border-gray-200 rounded-full bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#1A362D]/10 focus-within:border-[#1A362D] transition-all">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="flex-1 px-4 py-3 outline-none bg-transparent text-right text-sm placeholder:text-gray-300 w-full"
                  dir="rtl"
                />
                <div className="flex items-center gap-2 px-4 py-3 border-l border-gray-100 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-[#1A362D] whitespace-nowrap">
                    راه ارتباطی
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end px-2 mt-2 h-5">
                <span className="text-[10px] text-gray-400">فقط شماره ایران (۱۱ رقم)</span>
              </div>
            </div>
          )}
        </div>

        {/* === دکمه اصلی (سبز تیره) === */}
        <button
          onClick={() => {
            if (step === 1) {
              if (!username.trim()) return;
              checkUsername();
            } else if (step === 2) {
              submit();
            }
          }}
          disabled={
            (step === 1 && (!username.trim() || usernameStatus === "checking")) ||
            (step === 2 && (loading || phone.length !== 11))
          }
          className="w-full py-4 bg-[#285C4B] hover:bg-[#1e4639] text-white rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#285C4B]/20 text-sm"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> در حال پردازش...</>
          ) : step === 1 ? (
            <><Lock className="w-4 h-4" /> بررسی و ادامه</>
          ) : (
            <><Trophy className="w-4 h-4" /> تکمیل ثبت‌نام و دریافت کارت</>
          )}
        </button>

      </div>
    </div>
  );
}