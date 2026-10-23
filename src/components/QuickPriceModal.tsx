import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, TrendingUp, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { ProductItem, SizeVariant } from '../types/catalog';

interface QuickPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  variant: SizeVariant | null;
  currency: string;
  onSavePrice: (
    productId: string,
    variantId: string,
    newPrice: number,
    costPrice?: number,
    notes?: string
  ) => Promise<boolean>;
}

export const QuickPriceModal: React.FC<QuickPriceModalProps> = ({
  isOpen,
  onClose,
  product,
  variant,
  currency,
  onSavePrice,
}) => {
  const [newPrice, setNewPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (variant) {
      setNewPrice(variant.price);
      setCostPrice(variant.costPrice);
      setNotes('');
    }
  }, [variant]);

  if (!isOpen || !product || !variant) return null;

  const currentPrice = variant.price;
  const priceDiff = newPrice - currentPrice;

  const handleQuickDelta = (delta: number) => {
    setNewPrice((prev) => Math.max(0, prev + delta));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrice < 0) return;

    setIsSaving(true);
    try {
      await onSavePrice(product.id, variant.id, newPrice, costPrice, notes);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">تعديل سريع للسعر</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Product & Variant Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-semibold text-teal-700">{product.brand}</span>
            <h4 className="text-base font-bold text-slate-900">{product.name}</h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
              <span className="font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                {variant.name}
              </span>
              <span>السعر الحالي المسجل: <strong>{currentPrice} {currency}</strong></span>
            </div>
          </div>

          {/* New Selling Price Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              سعر البيع الجديد للمستهلك ({currency}) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                autoFocus
                required
                value={newPrice || ''}
                onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                className="w-full py-3 px-4 text-2xl font-black text-slate-900 bg-white border-2 border-teal-500 rounded-xl focus:outline-hidden tabular-nums"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400">
                {currency}
              </span>
            </div>

            {/* Price Diff Indicator */}
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-slate-500">فرق السعر:</span>
              <span
                className={`font-bold tabular-nums ${
                  priceDiff > 0
                    ? 'text-amber-600'
                    : priceDiff < 0
                    ? 'text-emerald-600'
                    : 'text-slate-500'
                }`}
              >
                {priceDiff > 0 ? `+${priceDiff}` : priceDiff} {currency}
                {currentPrice > 0 && priceDiff !== 0 && (
                  <span className="mr-1">
                    ({((priceDiff / currentPrice) * 100).toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Quick Adjustment Buttons */}
          <div>
            <span className="block text-[11px] font-medium text-slate-500 mb-2">
              تعديل سريع بمقدار:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '+5', val: 5 },
                { label: '+10', val: 10 },
                { label: '+20', val: 20 },
                { label: '+50', val: 50 },
                { label: '-5', val: -5 },
                { label: '-10', val: -10 },
                { label: '+2.5', val: 2.5 },
                { label: 'إلغاء التغيير', val: currentPrice - newPrice },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickDelta(btn.val)}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer tabular-nums"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cost / Wholesale Price (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              سعر التكلفة / الجملة (اختياري - يظهر للمدير فقط)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={costPrice || ''}
              onChange={(e) => setCostPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="مثلاً: سعر شراء الكرتونة أو القطعة"
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
            {costPrice && newPrice > costPrice && (
              <p className="text-[11px] text-emerald-700 mt-1">
                هامش الربح المتوقع: <strong>{(newPrice - costPrice).toFixed(1)} {currency}</strong> (
                {(((newPrice - costPrice) / costPrice) * 100).toFixed(0)}%)
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظة التعديل (اختياري لسجل الأسعار)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: زيادة سعر الشركة، عرض أسعار جديد..."
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>{isSaving ? 'جارِ الحفظ...' : 'حفظ ونشر السعر فورياً'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
