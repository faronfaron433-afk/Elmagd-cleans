import React from 'react';
import { 
  Sparkles, 
  Shield, 
  User, 
  Printer, 
  Bell, 
  Download, 
  CheckCircle2, 
  Smartphone 
} from 'lucide-react';
import { UserRole } from '../types/catalog';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  role: UserRole;
  onOpenPinModal: () => void;
  onSwitchToWorker: () => void;
  onOpenPrintModal: () => void;
  onOpenNotificationsModal: () => void;
  onOpenInstallModal: () => void;
  unreadNotifCount: number;
  totalProductsCount: number;
  totalVariantsCount: number;
  storeName: string;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  onOpenPinModal,
  onSwitchToWorker,
  onOpenPrintModal,
  onOpenNotificationsModal,
  onOpenInstallModal,
  unreadNotifCount,
  totalProductsCount,
  totalVariantsCount,
  storeName,
}) => {
  const { isInstalled, isInstallable } = usePWAInstall();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Notice Bar if Manager is active */}
      {role === 'manager' && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[11px] font-bold">
              وضع تحكم المدير
            </span>
            <span>أنت في وضع المدير: يمكنك إضافة وتعديل الأصناف وتغيير الأسعار وبث التنبيهات.</span>
          </div>
          <button
            onClick={onSwitchToWorker}
            className="hover:underline font-bold text-slate-950 flex items-center gap-1 cursor-pointer"
          >
            <span>شاشة عرض أسعار العاملين</span>
            <span>←</span>
          </button>
        </div>
      )}

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark & Official Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-teal-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 leading-none">
                {storeName || 'منظفات المجد'}
              </h1>
              <span className="hidden md:inline-flex items-center text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded-md">
                الموقع والتطبيق الرسمي
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 mt-0.5">
              <span>بوابة الأسعار والمخزون</span>
              <span className="mx-1">·</span>
              <span>{totalProductsCount} صنف</span>
              <span className="hidden sm:inline">
                <span className="mx-1">·</span>
                <span>{totalVariantsCount} مقاس</span>
              </span>
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation & Quick Tools */}
        <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-slate-600">
          <button
            onClick={onOpenPrintModal}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="whitespace-nowrap text-xs">طباعة لائحة الأسعار للرفوف</span>
          </button>
        </div>

        {/* Zone 3: Actions (Notifications, Install, Role switch) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Notifications Bell Button */}
          <button
            onClick={onOpenNotificationsModal}
            className="relative p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-slate-200/80"
            title="مركز التنبيهات بكل جديد"
          >
            <Bell className={`w-5 h-5 ${unreadNotifCount > 0 ? 'text-teal-600 animate-pulse' : 'text-slate-600'}`} />
            <span className="hidden sm:inline text-xs font-bold text-slate-700">التنبيهات</span>
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:static sm:mr-0 min-w-[20px] h-5 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center px-1">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Install App Button */}
          {!isInstalled ? (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              title="تثبيت تطبيق منظفات المجد على جهازك"
            >
              <Download className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline whitespace-nowrap">تثبيت التطبيق</span>
              <span className="sm:hidden text-[11px]">تنزيل</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>التطبيق مثبت</span>
            </div>
          )}

          {/* Print button on mobile */}
          <button
            onClick={onOpenPrintModal}
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-200/60"
            title="طباعة لائحة الأسعار"
          >
            <Printer className="w-4 h-4 text-slate-600" />
          </button>

          {/* Manager / Worker Switch */}
          {role === 'worker' ? (
            <button
              onClick={onOpenPinModal}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Shield className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline whitespace-nowrap">دخول المدير</span>
              <span className="sm:hidden text-xs">المدير</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-xl">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>المدير</span>
              </span>
              <button
                onClick={onSwitchToWorker}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium rounded-xl transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span className="whitespace-nowrap">العاملين</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
