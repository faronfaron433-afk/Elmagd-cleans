import React, { useState } from 'react';
import { X, Printer, Check, Sparkles, Filter } from 'lucide-react';
import { Category, ProductItem, StoreSettings } from '../types/catalog';

interface PrintPriceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  products: ProductItem[];
  settings: StoreSettings;
  currency: string;
}

export const PrintPriceListModal: React.FC<PrintPriceListModalProps> = ({
  isOpen,
  onClose,
  categories,
  products,
  settings,
  currency,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) =>
    selectedCatId === 'all' ? true : c.id === selectedCatId
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-right">
        {/* Header - Not printed */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-base">معاينة وطباعة لائحة الأسعار الرسمية</h3>
              <p className="text-xs text-slate-400">مناسبة للتعليق على جدران المحل أو المكاتب</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الآن (Ctrl + P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar - Not printed */}
        <div className="print:hidden p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">تصفية الطباعة:</span>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
            >
              <option value="all">جميع الأقسام</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showInStockOnly}
              onChange={(e) => setShowInStockOnly(e.target.checked)}
              className="rounded text-teal-600"
            />
            <span>المتوفر بالمحل فقط</span>
          </label>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 print:p-0 print:m-0 print:space-y-4">
          {/* Shop Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{settings.storeName}</h1>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">{settings.tagline}</p>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                {settings.phone && <span>هاتف: {settings.phone}</span>}
                {settings.address && <span>العنوان: {settings.address}</span>}
              </div>
            </div>

            <div className="text-left text-xs font-mono text-slate-500">
              <span className="block font-bold text-slate-800">قائمة الأسعار المعتمدة</span>
              <span>تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</span>
            </div>
          </div>

          {/* Categories & Products Table */}
          {filteredCategories.map((cat) => {
            let catProducts = products.filter((p) => p.categoryId === cat.id);
            if (showInStockOnly) {
              catProducts = catProducts.filter((p) => p.variants.some((v) => v.inStock));
            }
            if (catProducts.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-2 break-inside-avoid">
                <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-bold print:bg-slate-800">
                  <span>{cat.name}</span>
                  <span className="font-normal text-[11px] text-slate-300">
                    {catProducts.length} أصناف
                  </span>
                </div>

                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <th className="py-2 px-3 w-1/3">الصنف والماركة</th>
                        <th className="py-2 px-3">المقاس / العبوة</th>
                        <th className="py-2 px-3 text-left">سعر البيع ({currency})</th>
                        <th className="py-2 px-3 text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {catProducts.map((p) => (
                        <React.Fragment key={p.id}>
                          {p.variants.map((v, idx) => (
                            <tr key={v.id} className={idx === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                              {idx === 0 ? (
                                <td
                                  rowSpan={p.variants.length}
                                  className="py-2 px-3 font-bold text-slate-900 border-l border-slate-200 align-top"
                                >
                                  <div>{p.name}</div>
                                  <div className="text-[10px] text-slate-500 font-normal">
                                    {p.brand}
                                  </div>
                                </td>
                              ) : null}

                              <td className="py-1.5 px-3 font-medium text-slate-800">
                                {v.name}
                              </td>

                              <td className="py-1.5 px-3 text-left font-black text-slate-900 tabular-nums">
                                {v.price} {currency}
                              </td>

                              <td className="py-1.5 px-3 text-center text-[10px]">
                                {v.inStock ? (
                                  <span className="text-emerald-700 font-semibold">متوفر</span>
                                ) : (
                                  <span className="text-rose-600">غير متوفر</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Footer of the sheet */}
          <div className="pt-4 border-t border-slate-300 text-center text-[11px] text-slate-500">
            <span>جميع الأسعار قابلة للتحديث وفقاً لتغيرات السوق وأسعار المصانع الرسمية · منظفات المجد</span>
          </div>
        </div>
      </div>
    </div>
  );
};
