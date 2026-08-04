"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  url: string;
  title: string;
}

export function ShareInline({ url, title }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <CopyBtn url={url} />
      <ShareBtn
        url={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        color="bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20"
        icon={<TelegramIcon />}
      />
      <ShareBtn
        url={`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`}
        color="bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
        icon={<WhatsappIcon />}
      />
      <ShareBtn
        url={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        color="bg-gray-100 text-gray-500 hover:bg-gray-200"
        icon={<TwitterIcon />}
      />
    </div>
  );
}

function CopyBtn({ url }: { url: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(url);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
      className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-amber-50 hover:text-amber-500 transition-colors"
      title="کپی لینک"
    >
      {done ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function ShareBtn({ url, color, icon }: { url: string; color: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={() => window.open(url, "_blank", "noopener")}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${color}`}
    >
      {icon}
    </button>
  );
}

// Icons
function TelegramIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.41-.88.03-.24.37-.49 1.02-.74 3.98-1.73 6.63-2.87 7.97-3.43 3.79-1.58 4.58-1.85 5.09-1.86.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}