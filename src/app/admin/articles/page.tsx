"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, Loader2, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  viewCount: number;
  keywords: string[];
  createdAt: string;
  _count: { views: number };
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>("createdAt"); // createdAt, views
  const [sortOrder, setSortOrder] = useState<string>("desc"); // asc, desc

  const loadArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page: String(page), 
        search, 
        limit: "20",
        sortBy,
        sortOrder
      });
      const res = await fetch(`/api/admin/articles?${params}`);
      const data = await res.json();
      setArticles(data.articles);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadArticles(); 
  }, [page, search, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این مقاله اطمینان دارید؟")) return;
    try {
      await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      loadArticles();
    } catch (err) {
      alert("خطا در حذف");
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // اگر روی همان فیلد کلیک شد، جهت را تغییر بده
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // اگر فیلد جدید انتخاب شد، پیش‌فرض descending
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1); // برگشت به صفحه اول
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3" />;
    return sortOrder === "asc" ? 
      <ArrowUp className="w-3 h-3" /> : 
      <ArrowDown className="w-3 h-3" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-stone-900">مقالات</h1>
        <Link href="/admin/articles/new"
          className="px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 flex items-center gap-2">
          <Plus className="w-4 h-4" /> مقاله جدید
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 mb-4 p-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="جستجوی مقاله..."
            className="w-full h-10 pr-9 pl-4 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-300" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b">
                <th className="p-3 text-right text-xs font-bold text-stone-400">عنوان</th>
                <th className="p-3 text-right text-xs font-bold text-stone-400">وضعیت</th>
                <th className="p-3 text-right text-xs font-bold text-stone-400">
                  <button 
                    onClick={() => handleSort("views")}
                    className="flex items-center gap-1 hover:text-amber-600 transition-colors"
                  >
                    بازدید
                    {getSortIcon("views")}
                  </button>
                </th>
                <th className="p-3 text-right text-xs font-bold text-stone-400">
                  <button 
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-1 hover:text-amber-600 transition-colors"
                  >
                    تاریخ
                    {getSortIcon("createdAt")}
                  </button>
                </th>
                <th className="p-3 text-right text-xs font-bold text-stone-400">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-stone-50/50">
                  <td className="p-3">
                    <p className="text-sm font-medium text-stone-900 truncate max-w-xs">{article.title}</p>
                    <div className="flex gap-1 mt-1">
                      {article.keywords?.slice(0, 3).map((kw) => (
                        <span key={kw} className="text-[9px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-500">{kw}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${article.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-500"}`}>
                      {article.isPublished ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-stone-400" />
                      <span className="text-sm font-medium text-stone-700">
                        {article._count?.views?.toLocaleString("fa-IR") || 0}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-stone-400">
                    {new Date(article.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Link href={`/admin/articles/${article.id}/edit`}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-amber-50">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(article.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {articles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-stone-400 text-sm">مقاله‌ای یافت نشد</p>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t">
              <span className="text-xs text-stone-400">
                {pagination.total.toLocaleString("fa-IR")} مقاله - صفحه {page.toLocaleString("fa-IR")} از {pagination.totalPages.toLocaleString("fa-IR")}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium ${page === i + 1 ? "bg-amber-500 text-white" : "border text-stone-500"}`}>
                    {(i + 1).toLocaleString("fa-IR")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}