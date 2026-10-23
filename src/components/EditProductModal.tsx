import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Package, 
  Check, 
  Sparkles, 
  Barcode, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import { Category, ProductItem, SizeVariant } from '../types/catalog';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null; // null = Add new product
  categories: Category[];
  currency: string;
  onSaveProduct: (productData: any) => Promise<boolean>;
  onOpenAddCategory: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  currency,
  onSaveProduct,
  onOpenAddCategory,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [variants, setVariants] = useState<SizeVariant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setBrand(product.brand);
      setCategoryId(product.categoryId);
      setDescription(product.description || '');
      setIsPopular(!!product.isPopular);
      setVariants(JSON.parse(JSON.stringify(product.variants)));
    } else {
      // New product defaults
      setName('');
      setBrand('');
      setCategoryId(categories[0]?.id || '');
      setDescription('');
      setIsPopular(false);
      setVariants([
        {
          id: 'v_' + Date.now() + '_1',
          name: '1 كجم أوتوماتيك',
          price: 85,
          costPrice: 70,
          inStock: true,
          stockQuantity: 25,
          lowStockThreshold: 5,
          barcode: '',
        },
        {
          id: 'v_' + Date.now() + '_2',
          name: '3 كجم أوتوماتيك',
          price: 230,
          costPrice: 195,
          inStock: true,
          stockQuantity: 18,
          lowStockThreshold: 5,
          barcode: '',
        },
      ]);
    }
    setError(null);
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleAddVariant = (presetName = '') => {
    const newV: SizeVariant = {
      id: 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      name: presetName || 'مقاس جديد',
      price: 50,
      inStock: true,
      stockQuantity: 20,
      lowStockThreshold: 5,
      barcode: '',
    };
    setVariants((prev) => [...prev, newV]);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) {
      setError('يجب أن يحتوي كل منتج على مقاس أو عبوة واحدة على الأقل');
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVariantChange = (id: string, field: keyof SizeVariant, val: any) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return { ...v, [field]: val };
        }
        return v;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم الصنف');
      return;
    }
    if (!categoryId) {
      setError('يرجى اختيار القسم التابع له الصنف');
      return;
    }
    if (variants.length === 0) {
      setError('يرجى إضافة مقاس أو عبوة واحدة على الأقل');
      return;
    }

    // Check for empty variant names
    if (variants.some((v) => !v.name.trim())) {
      setError('يرجى ملء أسماء جميع المقاسات');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...(product ? { id: product.id } : {}),
        name: name.trim(),
        brand: brand.trim() || 'عام',
        categoryId,
        description: description.trim() || undefined,
        isPopular,
        variants: variants.map((v) => {
          const qty = Math.max(0, Number(v.stockQuantity) || 0);
          return {
            ...v,
            price: Math.max(0, Number(v.price) || 0),
            costPrice: v.costPrice ? Math.max(0, Number(v.costPrice)) : undefined,
            stockQuantity: qty,
            lowStockThreshold: Math.max(1, Number(v.lowStockThreshold) || 5),
            inStock: qty > 0,
          };
        }),
      };

      await onSaveProduct(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-right">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">
              {product ? `تعديل صنف: ${product.name}` : 'إضافة صنف جديد لمحل المنظفات'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Product Name & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم الصنف بالكامل *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="مثال: إريال أوتوماتيك لافندر، فيري ليمون، فلاش حمامات..."
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الماركة / الشركة المصنعة
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="مثال: إريال، برسيل، فيري، ديتول، كلوركس، المجد..."
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-teal-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 2: Category & Popular Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  القسم التابع له *
                </label>
                <button
                  type="button"
                  onClick={onOpenAddCategory}
                  className="text-[11px] font-bold text-teal-600 hover:underline cursor-pointer"
                >
                  + قسم جديد
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-teal-500 focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  تمييز الصنف كـ "الأكثر طلباً" في شاشة العرض
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              وصف إضافي أو طريقة الاستخدام (اختياري)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: مسحوق عالي الرغوة، مركز، مناسب للغسالات النصف والأوتوماتيك..."
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* DYNAMIC SIZES & VARIANTS SECTION */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>المقاسات والأحجام والأسعار لهذا الصنف</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  أضف كل مقاسات هذا المنتج (مثلاً: 1 كجم، 3 كجم، 8 كجم شيكارة، أو جركل 4 لتر)
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddVariant()}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ مقاس جديد</span>
              </button>
            </div>

            {/* Quick Presets for Sizes */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500">
              <span className="shrink-0 font-medium">مقاسات شائعة سريعة:</span>
              {[
                '1 كجم',
                '2.5 كجم',
                '3 كجم',
                '4 كجم',
                '8 كجم شيكارة',
                '500 مل',
                '1 لتر',
                'جركل 4 لتر',
                'قطعة',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddVariant(preset)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md shrink-0 cursor-pointer transition-colors"
                >
                  +{preset}
                </button>
              ))}
            </div>

            {/* Variants List Table / Cards */}
            <div className="space-y-2">
              {variants.map((v, index) => (
                <div
                  key={v.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    {/* Size Name */}
                    <div className="col-span-12 sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        اسم المقاس أو العبوة *
                      </label>
                      <input
                        type="text"
                        required
                        value={v.name}
                        onChange={(e) => handleVariantChange(v.id, 'name', e.target.value)}
                        placeholder="مثال: 3 كجم أوتوماتيك، 1 لتر"
                        className="w-full py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:border-teal-500"
                      />
                    </div>

                    {/* Selling Price */}
                    <div className="col-span-6 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        سعر البيع ({currency}) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={v.price}
                        onChange={(e) =>
                          handleVariantChange(v.id, 'price', parseFloat(e.target.value) || 0)
                        }
                        className="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 tabular-nums focus:outline-hidden focus:border-teal-500"
                      />
                    </div>

                    {/* Cost Price */}
                    <div className="col-span-6 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        سعر التكلفة ({currency})
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={v.costPrice || ''}
                        onChange={(e) =>
                          handleVariantChange(
                            v.id,
                            'costPrice',
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                        placeholder="اختياري"
                        className="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 tabular-nums focus:outline-hidden"
                      />
                    </div>

                    {/* Stock Quantity */}
                    <div className="col-span-6 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-teal-700 mb-0.5">
                        الكمية بالمخزن (قطعة)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={v.stockQuantity !== undefined ? v.stockQuantity : ''}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value, 10);
                          const safeQty = isNaN(qty) ? 0 : Math.max(0, qty);
                          handleVariantChange(v.id, 'stockQuantity', safeQty);
                          handleVariantChange(v.id, 'inStock', safeQty > 0);
                        }}
                        className="w-full py-1.5 px-2 bg-white border border-teal-300 rounded-lg text-xs font-black text-teal-900 tabular-nums focus:outline-hidden focus:border-teal-600"
                      />
                    </div>

                    {/* Low Stock Alert Threshold */}
                    <div className="col-span-6 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-amber-700 mb-0.5" title="حد التنبيه عند اقتراب النفاذ">
                        حد التنبيه (نواقص)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={v.lowStockThreshold || 5}
                        onChange={(e) =>
                          handleVariantChange(
                            v.id,
                            'lowStockThreshold',
                            Math.max(1, parseInt(e.target.value, 10) || 5)
                          )
                        }
                        className="w-full py-1.5 px-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-900 tabular-nums focus:outline-hidden"
                      />
                    </div>

                    {/* Delete button */}
                    <div className="col-span-12 sm:col-span-1 flex items-center justify-end pt-1 sm:pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        title="حذف هذا المقاس"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Optional Barcode in Sub-row */}
                  <div className="flex items-center gap-2 pt-1">
                    <Barcode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={v.barcode || ''}
                      onChange={(e) => handleVariantChange(v.id, 'barcode', e.target.value)}
                      placeholder="باركود أو كود مختصر للصنف (اختياري للبحث السريع)..."
                      className="w-full max-w-xs py-1 px-2 text-[11px] font-mono bg-white border border-slate-200 rounded-md text-slate-700 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>{isSaving ? 'جارِ حفظ الصنف...' : 'حفظ الصنف والمقاسات'}</span>
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
