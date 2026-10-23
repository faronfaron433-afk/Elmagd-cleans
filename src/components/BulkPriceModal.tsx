import React, { useState, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Percent, DollarSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Category, ProductItem } from '../types/catalog';

interface BulkPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  products: ProductItem[];
  currency: string;
  onApplyBulk: (options: {
    categoryId?: string;
    type: 'percentage' | 'fixed';
    direction: 'increase' | 'decrease';
    value: number;
    roundToNearest?: number;
    notes?: string;
  }) => Promise<{ updatedCount: number }>;
}

export const BulkPriceModal: React.FC<BulkPriceModalProps> = ({
  isOpen,
  onClose,
  categories,
  products,
  currency,
  onApplyBulk,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [direction, setDirection] = useState<'increase' | 'decrease'>('increase');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(5);
  const [roundToNearest, setRoundToNearest] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [isApplying, setIsApplying] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // Calculate affected count
  const affectedVariantsCount = useMemo(() => {
    return products.reduce((acc, p) => {
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return acc;
      }
      return acc + p.variants.length;
    }, 0);
  }, [products, selectedCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value <= 0) return;

    setIsApplying(true);
    try {
      const res = await onApplyBulk({
        categoryId: selectedCategory,
        type,
        direction,
        value,
        roundToNearest,
        notes: notes || undefined,
      });
      setResultMessage(`تم تحديث أسعار ${res.updatedCount} مقاس بنجاح!`);
      setTimeout(() => {
        setResultMessage(null);
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">تعديل جماعي للأسعار (زيادة / تخفيض)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {resultMessage ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900">{resultMessage}</h4>
              <p className="text-xs text-slate-500">تم نشر الأسعار الجديدة فورياً لجميع العاملين</p>
            </div>
          ) : (
            <>
              {/* Target Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  القسم المستهدف بالتعديل:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-teal-500"
                >
                  <option value="all">جميع أقسام المحل ({products.length} صنف)</option>
                  {categories.map((c) => {
                    const count = products.filter((p) => p.categoryId === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({count} صنف)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Direction & Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                {/* Direction */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نوع العملية:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDirection('increase')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        direction === 'increase'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>زيادة أسعار</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection('decrease')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        direction === 'decrease'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>تخفيض / عروض</span>
                    </button>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    طريقة الحساب:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setType('percentage')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        type === 'percentage'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>نسبة مئوية (%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('fixed')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        type === 'fixed'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>مبلغ ثابت ({currency})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Value Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  مقدار {direction === 'increase' ? 'الزيادة' : 'التخفيض'}:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    required
                    value={value || ''}
                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                    className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-hidden focus:border-teal-500 tabular-nums"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    {type === 'percentage' ? '%' : currency}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[3, 5, 10, 15, 20].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setValue(v)}
                      className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-semibold cursor-pointer tabular-nums"
                    >
                      {v}{type === 'percentage' ? '%' : ` ${currency}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rounding option */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  تقريب الأسعار الجديدة إلى:
                </label>
                <select
                  value={roundToNearest}
                  onChange={(e) => setRoundToNearest(parseInt(e.target.value, 10))}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value={1}>أقرب 1 جنيه صحيح (بدون قروش)</option>
                  <option value={5}>أقرب 5 جنيه (مثلا 25، 30، 35...)</option>
                  <option value={10}>أقرب 10 جنيه</option>
                  <option value={0}>بدون تقريب (قد تتضمن كسور)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  سبب التعديل (يُحفظ في سجل الأسعار):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثلاً: زيادة أسعار المصانع الرسمية"
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              {/* Summary Callout */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>تنبيه هام:</span>
                </div>
                <p>
                  سيتم تطبيق {direction === 'increase' ? 'زيادة' : 'تخفيض'} بنسبة{' '}
                  <strong>{value}{type === 'percentage' ? '%' : ` ${currency}`}</strong> على{' '}
                  <strong>{affectedVariantsCount} مقاس وعبوة</strong>.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isApplying || value <= 0}
                  className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isApplying ? 'جارِ تطبيق التعديل...' : 'تطبيق التعديل على جميع الأصناف'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
