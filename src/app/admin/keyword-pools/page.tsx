"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Zap, Play, FileJson, List, Upload, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Pool {
  id: string;
  name: string;
  keywords: string[];
  category: string | null;
}

type TabType = "list" | "batch";

export default function KeywordPoolsPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [keywordsText, setKeywordsText] = useState("");
  const [category, setCategory] = useState("");
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("list");

  // ========== Batch Import States ==========
  const [jsonInput, setJsonInput] = useState("");
  const [parsedPools, setParsedPools] = useState<Pool[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  const loadPools = () => {
    setLoading(true);
    fetch("/api/admin/keyword-pools")
      .then((r) => r.json())
      .then((d) => {
        setPools(d.pools || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPools();
  }, []);

  // ========== Single Create ==========
  const handleCreate = async () => {
    const keywords = keywordsText
      .split("\n")
      .map((k) => k.trim())
      .filter(Boolean);
    if (!name || keywords.length < 2)
      return toast.error("نام گروه و حداقل ۲ کلیدواژه لازم است");

    await fetch("/api/admin/keyword-pools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, keywords, category }),
    });

    setName("");
    setKeywordsText("");
    setCategory("");
    toast.success("گروه ساخته شد");
    loadPools();
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/admin/keyword-pools", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadPools();
  };

  const handleRunNow = async () => {
    setRunning(true);
    const res = await fetch("/api/cron/auto-blog", {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ""}`,
      },
    });
    const data = await res.json();
    data.success
      ? toast.success(`✅ ${data.wordCount} کلمه - ${data.poolName}`)
      : toast.error(data.error || "خطا");
    setRunning(false);
    loadPools();
  };

  // ========== Batch Import Logic ==========

  const handleParseJSON = () => {
    setParseError(null);
    setParsedPools([]);

    if (!jsonInput.trim()) {
      setParseError("لطفاً JSON را وارد کنید");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);

      if (!Array.isArray(parsed)) {
        setParseError("فرمت باید آرایه‌ای از گروه‌ها باشد: [{}, {}, ...]");
        return;
      }

      // Validate structure
      const validPools: Pool[] = [];
      const errors: string[] = [];

      parsed.forEach((item, index) => {
        if (!item.name || typeof item.name !== "string") {
          errors.push(`آیتم ${index + 1}: "name" الزامی است`);
          return;
        }
        if (
          !Array.isArray(item.keywords) ||
          item.keywords.length < 2
        ) {
          errors.push(
            `"${item.name}": حداقل ۲ کلیدواژه الزامی است`
          );
          return;
        }
        validPools.push({
          id: `preview-${index}`,
          name: item.name,
          category: item.category || null,
          keywords: item.keywords.map((k: any) => String(k).trim()).filter(Boolean),
        });
      });

      if (errors.length > 0) {
        setParseError(errors.join("\n"));
        setParsedPools(validPools); // Show what could be parsed
        return;
      }

      setParsedPools(validPools);
      toast.success(`${validPools.length} گروه شناسایی شد`);
    } catch (e: any) {
      setParseError(`خطای JSON: ${e.message}`);
    }
  };

  const handleBatchImport = async () => {
    if (parsedPools.length === 0) return;

    setImporting(true);
    setImportProgress({ current: 0, total: parsedPools.length });

    // Filter out preview-only IDs
    const payload = parsedPools.map(({ name, category, keywords }) => ({
      name,
      category: category || undefined,
      keywords,
    }));

    try {
      const res = await fetch("/api/admin/keyword-pools/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pools: payload }),
      });

      const data = await res.json();

      if (res.ok) {
        setImportProgress({ current: data.count, total: data.count });
        toast.success(`✅ ${data.count} گروه با موفقیت ذخیره شد`);
        setJsonInput("");
        setParsedPools([]);
        setActiveTab("list");
        loadPools();
      } else {
        toast.error(data.error || "خطا در ذخیره‌سازی");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  // ========== Styles ==========
  const tabButtonClass = (tab: TabType) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
      activeTab === tab
        ? "bg-stone-900 text-white shadow-lg"
        : "bg-stone-100 text-stone-500 hover:bg-stone-200"
    }`;

  // ========== Render ==========
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-stone-900">گروه‌های کلیدواژه</h1>
        <button
          onClick={handleRunNow}
          disabled={running}
          className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
        >
          {running ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          اجرای دستی
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("list")}
          className={tabButtonClass("list")}
        >
          <List className="w-4 h-4" />
          لیست گروه‌ها
        </button>
        <button
          onClick={() => setActiveTab("batch")}
          className={tabButtonClass("batch")}
        >
          <Upload className="w-4 h-4" />
          ورود گروهی
        </button>
      </div>

      {/* ========== Tab: List ========== */}
      {activeTab === "list" && (
        <>
          {/* Create Single */}
          <div className="bg-white rounded-xl border p-4 mb-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسم گروه (مثلاً: آموزشگاه‌های آیلتس شیراز)"
                className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-amber-300"
              />
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="دسته‌بندی (مثلاً: آیلتس)"
                className="px-3 py-2 border rounded-lg text-sm outline-none focus:border-amber-300"
              />
            </div>
            <textarea
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              placeholder={`کلیدواژه‌ها (هر خط یکی):\nآموزشگاه آیلتس\nگاما\nشیراز\nقیمت\nآدرس`}
              rows={8}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-amber-300 resize-none font-mono"
              dir="ltr"
            />
            <button
              onClick={handleCreate}
              className="w-full py-2 bg-amber-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> ایجاد گروه کلیدواژه
            </button>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {pools.map((pool) => (
                <div key={pool.id} className="bg-white rounded-xl border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        {pool.name}
                      </h3>
                      <span className="text-[10px] text-stone-400">
                        {pool.keywords.length} کلیدواژه |{" "}
                        {pool.category || "بدون دسته"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(pool.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pool.keywords.map((kw: string) => (
                      <span
                        key={kw}
                        className="text-[11px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {pools.length === 0 && (
                <div className="text-center py-16 text-stone-400">
                  <Zap className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>
                    هیچ گروهی نساختی. یه گروه بساز تا سیستم خودکار مقاله تولید
                    کنه.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ========== Tab: Batch Import ========== */}
      {activeTab === "batch" && (
        <div className="space-y-4">
          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <FileJson className="w-4 h-4" /> فرمت JSON مورد نیاز:
            </p>
            <pre className="text-xs bg-blue-100/50 p-3 rounded-lg mt-2 overflow-x-auto" dir="ltr">
{`[
  {
    "name": "آموزشگاه‌های آیلتس شیراز",
    "category": "آیلتس",
    "keywords": ["آموزشگاه آیلتس", "گاما", "شیراز", "قیمت"]
  },
  {
    "name": "آموزشگاه‌های زبان تهران",
    "category": "زبان",
    "keywords": ["آموزشگاه زبان", "کلاس مکالمه", "تهران"]
  }
]`}
            </pre>
            <p className="text-[11px] mt-2 text-blue-600">
              ✅ name: الزامی | category: اختیاری | keywords: آرایه با حداقل ۲
              کلیدواژه
            </p>
          </div>

          {/* JSON Input */}
          <div className="bg-white rounded-xl border p-4">
            <label className="block text-sm font-bold text-stone-700 mb-2">
              محتوای JSON را اینجا paste کنید:
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setParseError(null);
                setParsedPools([]);
              }}
              rows={15}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-amber-300 resize-none font-mono"
              dir="ltr"
              placeholder='[{ "name": "...", "category": "...", "keywords": ["..."] }]'
            />

            {/* Parse Button */}
            <button
              onClick={handleParseJSON}
              disabled={!jsonInput.trim()}
              className="mt-3 px-4 py-2 bg-stone-700 hover:bg-stone-800 text-white rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all"
            >
              <FileJson className="w-4 h-4" />
              بررسی و نمایش
            </button>
          </div>

          {/* Parse Error */}
          {parseError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700 mb-1">
                    خطا در فرمت JSON:
                  </p>
                  <pre className="text-xs text-red-600 whitespace-pre-wrap">
                    {parseError}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {parsedPools.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  پیش‌نمایش ({parsedPools.length} گروه)
                </h3>
                <button
                  onClick={handleBatchImport}
                  disabled={importing}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      ذخیره همه گروه‌ها
                    </>
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              {importing && importProgress.total > 0 && (
                <div className="bg-white rounded-xl border p-3">
                  <div className="flex items-center justify-between mb-2 text-xs text-stone-500">
                    <span>در حال ذخیره‌سازی...</span>
                    <span>
                      {importProgress.current} / {importProgress.total}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(importProgress.current / importProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Pool Preview Cards */}
              {parsedPools.map((pool, index) => (
                <div
                  key={pool.id}
                  className="bg-white rounded-xl border border-emerald-200 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] text-emerald-500 font-bold">
                        گروه #{index + 1}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900">
                        {pool.name}
                      </h4>
                      {pool.category && (
                        <span className="text-[10px] text-stone-400">
                          دسته: {pool.category}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400">
                      {pool.keywords.length} کلیدواژه
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pool.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!parseError && parsedPools.length === 0 && !jsonInput.trim() && (
            <div className="text-center py-16 text-stone-400">
              <FileJson className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">
                JSON گروه‌های کلیدواژه را paste و بررسی کنید
              </p>
              <p className="text-xs mt-1">
                می‌توانید چندین گروه را یکجا import کنید
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}