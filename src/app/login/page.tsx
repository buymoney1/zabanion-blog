"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

// ==================== Loading Fallback ====================
function LoginFallback() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-stone-900">ورود ادمین</h1>
          <p className="text-sm text-stone-500 mt-1">پنل مدیریت زبانیون</p>
        </div>
        <div className="space-y-4">
          <div className="w-full h-11 bg-stone-100 rounded-xl animate-pulse" />
          <div className="w-full h-11 bg-stone-100 rounded-xl animate-pulse" />
          <div className="w-full h-11 bg-stone-900 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ==================== Login Form Component ====================
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("ایمیل یا رمز عبور اشتباه است");
      } else {
        const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("خطا در برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-stone-900">ورود ادمین</h1>
          <p className="text-sm text-stone-500 mt-1">پنل مدیریت زبانیون</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1.5 mr-1">
              ایمیل
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@zabanion.ir"
              dir="ltr"
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none text-left text-sm transition-all focus:border-amber-300 focus:ring-4 focus:ring-amber-50 placeholder:text-stone-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1.5 mr-1">
              رمز عبور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none text-left text-sm transition-all focus:border-amber-300 focus:ring-4 focus:ring-amber-50 placeholder:text-stone-300"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center bg-red-50 py-2.5 rounded-xl font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-stone-900/10 hover:shadow-xl hover:shadow-stone-900/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال ورود...
              </>
            ) : (
              "ورود"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] text-stone-400 mt-6">
          فقط کاربران ادمین مجاز به ورود هستند
        </p>
      </div>
    </div>
  );
}

// ==================== Main Page Export ====================
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}