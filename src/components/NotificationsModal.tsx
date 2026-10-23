import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Volume2, 
  VolumeX, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  AlertTriangle, 
  Megaphone, 
  Send, 
  Play, 
  ShieldAlert, 
  CheckCheck,
  Smartphone
} from 'lucide-react';
import { AppNotification, NotificationType, UserRole } from '../types/catalog';
import { notificationService } from '../services/notificationService';
import { catalogService } from '../services/catalogService';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  role,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(
    notificationService.getNotifications()
  );
  const [filterType, setFilterType] = useState<string>('all');
  const [isSoundOn, setIsSoundOn] = useState<boolean>(notificationService.isSoundEnabled());
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.getPermissionStatus()
  );

  // Manager Announcement inputs
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  useEffect(() => {
    const unsub = notificationService.subscribe((list) => {
      setNotifications(list);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const nextVal = !isSoundOn;
    setIsSoundOn(nextVal);
    notificationService.setSoundEnabled(nextVal);
  };

  const handleRequestPermission = async () => {
    const result = await notificationService.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      notificationService.sendBrowserNotification(
        'تم تفعيل الإشعارات بنجاح!',
        'ستصلك تنبيهات فورية بكل جديد في أسعار ومخزون منظفات المجد.'
      );
    }
  };

  const handleTestAlert = () => {
    notificationService.pushNotification(
      'price_change',
      'تنبيه تجريبي: مسحوق تايد 2.5 كجم',
      'هذا تنبيه تجريبي يوضح كيف تظهر إشعارات الأسعار والمخزون في التطبيق!',
      {
        productName: 'مسحوق تايد أوتوماتيك',
        variantName: '2.5 كجم',
        oldPrice: 160,
        newPrice: 175,
      },
      true
    );
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMsg.trim()) return;

    setIsSendingAnnouncement(true);
    await catalogService.addStoreAnnouncement(announcementTitle.trim(), announcementMsg.trim());
    setIsSendingAnnouncement(false);
    setAnnouncementTitle('');
    setAnnouncementMsg('');
    setAnnouncementSuccess(true);
    setTimeout(() => setAnnouncementSuccess(false), 3000);
  };

  const filteredList = notifications.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);

      if (diffMin < 1) return 'الآن';
      if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;

      return date.toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (item: AppNotification) => {
    switch (item.type) {
      case 'price_change':
        if (item.details?.oldPrice !== undefined && item.details?.newPrice !== undefined) {
          return item.details.newPrice > item.details.oldPrice ? (
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          );
        }
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        );
      case 'new_product':
        return (
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        );
      case 'stock_alert':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'announcement':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/30 text-teal-400 border border-teal-500/30 flex items-center justify-center relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">مركز التنبيهات والإشعارات</h3>
              <p className="text-xs text-slate-400">
                متابعة فورية لجميع تغيرات الأسعار والأصناف ونواقص المخزون
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isSoundOn 
                  ? 'bg-teal-900/60 text-teal-300 border border-teal-700/60 hover:bg-teal-800' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              title={isSoundOn ? 'صوت التنبيهات مفعّل' : 'صوت التنبيهات صامت'}
            >
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Toolbar (Browser Push, Sound, Test) */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-100 font-semibold px-2.5 py-1 rounded-lg">
                <Check className="w-3.5 h-3.5" />
                <span>إشعارات الجهاز مفعّلة</span>
              </span>
            ) : permission === 'denied' ? (
              <span className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-100 font-semibold px-2.5 py-1 rounded-lg">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>الإشعارات محظورة بالمتصفح</span>
              </span>
            ) : (
              <button
                onClick={handleRequestPermission}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>تفعيل إشعارات الهاتف / المتصفح</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestAlert}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 font-medium rounded-lg transition cursor-pointer"
              title="تجربة صوت وشكل الإشعار"
            >
              <Play className="w-3.5 h-3.5 text-teal-600" />
              <span>تجربة إشعار</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={() => notificationService.markAllAsRead()}
                className="flex items-center gap-1 px-2.5 py-1 text-teal-700 hover:bg-teal-50 font-bold rounded-lg transition cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={() => notificationService.clearAll()}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                title="مسح سجل الإشعارات"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Manager Broadcast Announcement Bar (Only if manager) */}
        {role === 'manager' && (
          <div className="bg-amber-50/70 border-b border-amber-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <span>إرسال إعلان / تنبيه رسمي من المدير للعمال والزبائن</span>
              </span>
              {announcementSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>تم بث الإشعار بنجاح!</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-2">
              <input
                type="text"
                placeholder="عنوان التنبيه (مثال: وصول شحنة صابون جديدة / عرض خاص)"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-white border border-amber-300 rounded-xl focus:outline-teal-600"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="نص الإشعار والتفاصيل..."
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  className="flex-1 text-xs font-medium px-3 py-2 bg-white border border-amber-300 rounded-xl focus:outline-teal-600"
                />
                <button
                  type="submit"
                  disabled={isSendingAnnouncement || !announcementTitle || !announcementMsg}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>بث الإشعار</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('price_change')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              filterType === 'price_change'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الأسعار ({notifications.filter((n) => n.type === 'price_change').length})
          </button>
          <button
            onClick={() => setFilterType('new_product')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              filterType === 'new_product'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            أصناف جديدة ({notifications.filter((n) => n.type === 'new_product').length})
          </button>
          <button
            onClick={() => setFilterType('stock_alert')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              filterType === 'stock_alert'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            نواقص المخزون ({notifications.filter((n) => n.type === 'stock_alert').length})
          </button>
          <button
            onClick={() => setFilterType('announcement')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              filterType === 'announcement'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            إعلانات المحل ({notifications.filter((n) => n.type === 'announcement').length})
          </button>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Bell className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">لا توجد تنبيهات حالياً</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                أي تحديث جديد في أسعار المنظفات أو إضافة أصناف أو نقص في المخزون سيظهر هنا فوراً.
              </p>
            </div>
          ) : (
            filteredList.map((notif) => (
              <div
                key={notif.id}
                onClick={() => notificationService.markAsRead(notif.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  notif.read
                    ? 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
                    : 'bg-teal-50/60 border-teal-200/90 text-slate-900 shadow-xs'
                }`}
              >
                {getNotificationIcon(notif)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs sm:text-sm font-bold leading-tight">
                      {notif.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Price delta badges if available */}
                  {notif.details && notif.details.oldPrice !== undefined && notif.details.newPrice !== undefined && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="text-slate-400 line-through">
                        {notif.details.oldPrice} ج.م
                      </span>
                      <span className="font-extrabold text-teal-700">
                        {notif.details.newPrice} ج.م
                      </span>
                      {notif.details.newPrice > notif.details.oldPrice ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          +{notif.details.newPrice - notif.details.oldPrice} ج.م
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {notif.details.newPrice - notif.details.oldPrice} ج.م
                        </span>
                      )}
                    </div>
                  )}

                  {!notif.read && (
                    <span className="inline-block mt-2 text-[10px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                      جديد
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>نظام التنبيهات المباشر يعمل تلقائياً مع تحديثات الأسعار</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
