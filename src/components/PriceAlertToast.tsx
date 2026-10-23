import React, { useEffect, useState } from 'react';
import { Bell, X, TrendingUp, TrendingDown } from 'lucide-react';

export interface PriceAlert {
  id: string;
  productName: string;
  variantName: string;
  oldPrice: number;
  newPrice: number;
  timestamp: string;
}

interface PriceAlertToastProps {
  alert: PriceAlert | null;
  onDismiss: () => void;
  currency: string;
}

export const PriceAlertToast: React.FC<PriceAlertToastProps> = ({
  alert,
  onDismiss,
  currency,
}) => {
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [alert, onDismiss]);

  if (!alert) return null;

  const diff = alert.newPrice - alert.oldPrice;

  return (
    <div className="fixed bottom-5 left-5 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-teal-400 p-4 animate-in slide-in-from-bottom-5 duration-300 text-right">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
              تنبيه فوري: تم تعديل السعر بواسطة المدير
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">{alert.productName}</h4>
            <div className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <span className="font-semibold text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded">
                {alert.variantName}
              </span>
              {alert.oldPrice > 0 ? (
                <span>
                  من <del className="text-slate-400">{alert.oldPrice}</del> إلى{' '}
                  <strong className="text-teal-300 text-sm">{alert.newPrice} {currency}</strong>
                </span>
              ) : (
                <span>
                  السعر الجديد: <strong className="text-teal-300 text-sm">{alert.newPrice} {currency}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
