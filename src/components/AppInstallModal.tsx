import React, { useState } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  WifiOff, 
  Bell, 
  Zap, 
  CheckCircle, 
  Share, 
  PlusSquare, 
  ArrowDownCircle, 
  Sparkles,
  Info,
  Copy,
  ExternalLink,
  FileBox,
  Check
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppInstallModal: React.FC<AppInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android_direct' | 'apk_download' | 'ios'>('android_direct');
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const appLiveUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-hcfhg4ilpy7ukbw6kqhxn2-756088770342.europe-west2.run.app';

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appLiveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(appLiveUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white p-5 sm:p-6 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-lg p-2 flex items-center justify-center shrink-0 border border-teal-200">
              <img 
                src="/pwa-192x192.png" 
                alt="منظفات المجد" 
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-teal-800/60 border border-teal-400/30 text-teal-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3 h-3 text-teal-300" />
                <span>تطبيق أندرويد & PWA</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                تثبيت وتحميل تطبيق منظفات المجد (APK)
              </h3>
              <p className="text-xs text-teal-100 font-medium">
                تثبيت فوري كـ تطبيق أندرويد عادي أو تحميل حزمة APK لجهازك
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-4 pt-2 gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('android_direct')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
              activeTab === 'android_direct'
                ? 'bg-white text-teal-700 border-teal-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-teal-600" />
            <span>تثبيت الأندرويد المباشر (الأسهل والأسرع)</span>
          </button>

          <button
            onClick={() => setActiveTab('apk_download')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
              activeTab === 'apk_download'
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <FileBox className="w-4 h-4 text-emerald-600" />
            <span>تحميل ملف APK مستقل</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`px-3.5 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
              activeTab === 'ios'
                ? 'bg-white text-sky-700 border-sky-600 shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <span>🍏</span>
            <span>أجهزة آيفون (iOS)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Tab 1: Direct Android WebAPK Install */}
          {activeTab === 'android_direct' && (
            <div className="space-y-4">
              <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                  <Smartphone className="w-5 h-5 text-teal-600" />
                  <span>تثبيت تطبيق أندرويد حقيقي بدون تعقيدات (WebAPK)</span>
                </div>
                <p className="text-xs text-teal-800 leading-relaxed">
                  نظام الأندرويد ومتصفح Chrome يقوم بإنشاء ملف تطبيق أندرويد تلقائي (WebAPK) ويضيفه مباشرة إلى <strong>شاشة هاتفك الرئيسية وقائمة التطبيقات</strong> تماماً مثل أي تطبيق يتم تنزيله من متجر Google Play، بدون شريط متصفح وبسرعة فائقة.
                </p>
              </div>

              {/* Install button */}
              {isInstallable ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-black text-sm sm:text-base shadow-lg shadow-teal-600/25 transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5 animate-bounce" />
                  <span>اضغط هنا لتثبيت التطبيق على جهازك الآن</span>
                </button>
              ) : isInstalled ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">التطبيق مثبت على جهازك بالفعل!</h4>
                    <p className="text-xs text-emerald-700">
                      يمكنك تشغيله مباشرة من الشاشة الرئيسية لهاتفك في أي وقت.
                    </p>
                  </div>
                </div>
              ) : (
                /* Chrome Android instructions if prompt isn't directly triggered */
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Info className="w-4 h-4 text-teal-600" />
                    <span>خطوات التثبيت من متصفح الهاتف (أندرويد Chrome):</span>
                  </h4>
                  <ol className="text-xs text-slate-600 space-y-2 mr-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>اضغط على قائمة النقاط الثلاث <strong className="text-slate-900 font-bold">(⋮)</strong> في أعلى يمين المتصفح.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>اختر <strong className="text-slate-900 font-bold">"تثبيت التطبيق"</strong> أو <strong className="text-slate-900 font-bold">"إضافة إلى الشاشة الرئيسية"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>سيظهر التطبيق فوراً كبرنامج مستقل بأيقونة منظفات المجد على هاتفك.</span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Benefits pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-700">فتح مباشر وسريع كأي تطبيق</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-sky-500 shrink-0" />
                  <span className="font-semibold text-slate-700">يعمل بدون نت في المحل</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Download standalone APK package */}
          {activeTab === 'apk_download' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <FileBox className="w-5 h-5 text-emerald-600" />
                  <span>توليد وتنزيل ملف (APK) أندرويد مستقل</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  إذا كنت ترغب في الحصول على ملف بصيغة <strong>.apk</strong> لتثبيته يدوياً أو إرساله عبر WhatsApp للعمال بالمحل، تم تجهيز ملفات الـ Manifest والأيقونات بالكامل لتوليد ملف APK جاهز فوراً.
                </p>
              </div>

              {/* Step 1: Copy Link */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">رابط التطبيق المباشر:</span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 truncate select-all">
                  {appLiveUrl}
                </div>
                <p className="text-[11px] text-slate-500">
                  يمكنك إرسال هذا الرابط للعمال في المحل لفتحه في Chrome والضغط على "تثبيت التطبيق".
                </p>
              </div>

              {/* Step 2: One-click generate via PWABuilder / Bubblewrap */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <span>توليد وتحميل ملف الـ APK أونلاين (PWABuilder):</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  أداة <strong>PWABuilder</strong> من مايكروسوفت تفحص الموقع وتحوله إلى حزمة أندرويد APK جاهزة للتحميل بنقرة واحدة بدون الحاجة لبرمجة أو بيئة تطوير:
                </p>
                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>فتح أداة تنزيل الـ APK المباشر (PWABuilder)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>

              {/* Step 3: Bubblewrap / GitHub Actions / Android Studio Code */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[11px]">
                    3
                  </span>
                  <span>كود ومشاريع بناء الـ APK المرفقة مع التطبيق:</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  تم تضمين جميع الملفات اللازمة لبناء ملف الـ APK محلياً أو سحابياً داخل مجلدات المشروع:
                </p>
                <ul className="text-[11px] text-slate-700 space-y-1.5 list-disc list-inside">
                  <li><strong>.github/workflows/build-apk.yml</strong>: يقوم ببناء الـ APK تلقائياً عبر GitHub Actions.</li>
                  <li><strong>android/</strong>: مشروع Android Studio متكامل بلغة Java و Gradle و WebView.</li>
                  <li><strong>twa-manifest.json</strong>: ملف إعدادات أداة Bubblewrap الرسمية من Google.</li>
                </ul>
                <div className="bg-slate-900 text-slate-100 p-2.5 rounded-xl font-mono text-[11px] flex items-center justify-between mt-1">
                  <code>npx @bubblewrap/cli build</code>
                  <span className="text-[10px] text-teal-400">أمر البناء السريع</span>
                </div>
              </div>

              {/* How to install APK on Android */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
                <span className="font-bold flex items-center gap-1.5">
                  <span>💡</span>
                  <span>ملاحظة عند تثبيت أي ملف APK على الأندرويد:</span>
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  عند تنزيل ملف الـ APK وفتحه على الهاتف، قد يطلب الهاتف تفعيل "تثبيت التطبيقات من مصادر غير معروفة" (Allow Unknown Sources) لمرة واحدة فقط.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: iOS Apple Safari */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  <span>طريقة التثبيت على أجهزة آيفون وآيباد (iOS):</span>
                </div>
                <ol className="text-xs text-sky-800 space-y-2.5 mr-2">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center text-[11px] shrink-0">
                      1
                    </span>
                    <span>
                      افتح الرابط في متصفح سفاري (Safari) واضغط على زر المشاركة{' '}
                      <Share className="inline w-3.5 h-3.5 text-sky-700 mx-1" />.
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center text-[11px] shrink-0">
                      2
                    </span>
                    <span>
                      مرر للأسفل واضغط على{' '}
                      <strong className="text-sky-950 font-bold">"إضافة إلى الصفحة الرئيسية"</strong> (Add to Home Screen).
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center text-[11px] shrink-0">
                      3
                    </span>
                    <span>اضغط على <strong>"إضافة" (Add)</strong> في الزاوية العلوية.</span>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-teal-700 font-medium cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>نسخ رابط المحل</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
