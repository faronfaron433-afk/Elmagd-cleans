import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center justify-between gap-3 bg-slate-900/95 text-white border border-amber-500/50 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-300">وضع عدم الاتصال (بدون إنترنت)</p>
          <p className="text-[11px] text-slate-300">
            أنت تستخدم النسخة المحفوظة على جهازك. جميع الأسعار والمخزون متاحة للاستعلام.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800 shrink-0">
        <ShieldCheck className="w-3 h-3" />
        <span>مخزن محلياً</span>
      </div>
    </div>
  );
};
