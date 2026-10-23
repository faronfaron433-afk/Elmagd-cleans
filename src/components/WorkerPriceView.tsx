import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Barcode, 
  Sparkles, 
  X, 
  Eye, 
  PackageCheck, 
  Droplets, 
  ShieldCheck, 
  Wind, 
  Layers, 
  Smile, 
  LayoutGrid, 
  List, 
  Tag,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Category, ProductItem, SizeVariant } from '../types/catalog';

interface WorkerPriceViewProps {
  categories: Category[];
  products: ProductItem[];
  currency: string;
}

export const WorkerPriceView: React.FC<WorkerPriceViewProps> = ({
  categories,
  products,
  currency,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Category Icon resolver
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Droplets': return <Droplets className="w-4 h-4" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />;
      case 'Wind': return <Wind className="w-4 h-4" />;
      case 'Layers': return <Layers className="w-4 h-4" />;
      case 'Smile': return <Smile className="w-4 h-4" />;
      default: return <PackageCheck className="w-4 h-4" />;
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return products.filter((prod) => {
      if (selectedCategory !== 'all' && prod.categoryId !== selectedCategory) {
        return false;
      }

      if (onlyInStock && !prod.variants.some((v) => v.inStock)) {
        return false;
      }

      if (!q) return true;

      const inName = prod.name.toLowerCase().includes(q);
      const inBrand = prod.brand.toLowerCase().includes(q);
      const inDesc = prod.description?.toLowerCase().includes(q) || false;
      const inVariants = prod.variants.some(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          (v.barcode && v.barcode.toLowerCase().includes(q))
      );

      return inName || inBrand || inDesc || inVariants;
    });
  }, [products, searchQuery, selectedCategory, onlyInStock]);

  const isRecentlyUpdated = (lastUpdated?: string) => {
    if (!lastUpdated) return false;
    const diffHours = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);
    return diffHours <= 6;
  };

  const totalVisibleVariants = useMemo(() => {
    return filteredProducts.reduce((acc, p) => acc + p.variants.length, 0);
  }, [filteredProducts]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن سعر أي صنف (إريال، فيري، فلاش، ديتول، أو اكتب 4 كجم أو باركود)..."
              className="w-full pr-11 pl-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters & View Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle: Cards vs Table */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض البطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">بطاقات</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض الجدول السريع"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">جدول سريع</span>
              </button>
            </div>

            {/* In stock filter */}
            <button
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                onlyInStock
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>المتوفر فقط</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none border-t border-slate-100 mt-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع الأصناف ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {getCategoryIcon(cat.iconName)}
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${isSelected ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Purpose Banner */}
      <div className="bg-teal-50/90 border border-teal-200 rounded-xl p-3 flex items-center justify-between text-xs text-teal-900">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>دليل أسعار منظفات المجد للعاملين:</strong> استعلم عن سعر أي حجم أو عبوة بدقة. عندما يعدّل المدير أي سعر، يتحدث هنا فورياً.
          </span>
        </div>
        <div className="font-semibold text-slate-500 tabular-nums shrink-0">
          عرض {filteredProducts.length} صنف ({totalVisibleVariants} مقاس)
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">لم يتم العثور على أي صنف</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            تأكد من كتابة اسم الصنف أو المقاس بشكل صحيح، أو قم بإلغاء الفلاتر.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyInStock(false);
            }}
            className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
          >
            إعادة تعيين البحث
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const category = categories.find((c) => c.id === product.categoryId);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all flex flex-col overflow-hidden"
              >
                {/* Product Master Header */}
                <div className="p-4 pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                        <span>{category?.name || 'قسم'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-teal-700 font-semibold">{product.brand}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                        {product.name}
                      </h3>
                    </div>
                    {product.isPopular && (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
                        الأكثر طلباً
                      </span>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Size Variants with Big Clear Prices */}
                <div className="p-3 bg-slate-50/60 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    {product.variants.map((variant) => {
                      const updatedRecently = isRecentlyUpdated(variant.lastPriceUpdated);
                      const qty = variant.stockQuantity !== undefined ? variant.stockQuantity : (variant.inStock ? 15 : 0);
                      const threshold = variant.lowStockThreshold || 5;
                      const isZero = qty === 0;
                      const isLow = qty <= threshold;

                      return (
                        <div
                          key={variant.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            updatedRecently
                              ? 'bg-amber-50/90 border-amber-300'
                              : isZero
                              ? 'bg-rose-50/30 border-rose-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          {/* Variant Name & Details */}
                          <div className="min-w-0 pr-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900">
                                {variant.name}
                              </span>
                              {isZero ? (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                  نفد بالمحل
                                </span>
                              ) : isLow ? (
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.2 rounded tabular-nums">
                                  متبقي {qty} فقط
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded tabular-nums">
                                  متوفر ({qty})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              {variant.barcode && (
                                <span className="font-mono">كود: {variant.barcode}</span>
                              )}
                              {updatedRecently && variant.previousPrice && (
                                <span className="text-amber-700 font-semibold">
                                  تم تحديثه (كان {variant.previousPrice} {currency})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Large Price Display */}
                          <div className="text-left shrink-0">
                            <span className="text-lg font-black text-slate-900 tabular-nums">
                              {variant.price}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 mr-1">
                              {currency}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 px-1">
                    <span>{product.variants.length} مقاسات</span>
                    <span>سعر البيع الرسمي</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* FAST TABLE / LIST VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="py-3 px-4">الصنف والماركة</th>
                  <th className="py-3 px-3">القسم</th>
                  <th className="py-3 px-3">المقاس / العبوة</th>
                  <th className="py-3 px-4 text-left">سعر البيع ({currency})</th>
                  <th className="py-3 px-3 text-center">الحالة</th>
                  <th className="py-3 px-3">الباركود</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const category = categories.find((c) => c.id === p.categoryId);

                  return (
                    <React.Fragment key={p.id}>
                      {p.variants.map((v, idx) => {
                        const updatedRecently = isRecentlyUpdated(v.lastPriceUpdated);

                        return (
                          <tr
                            key={v.id}
                            className={`hover:bg-slate-50/90 transition-colors ${
                              updatedRecently ? 'bg-amber-50/60' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                            }`}
                          >
                            {/* Product Name (Rowspan for all variants) */}
                            {idx === 0 ? (
                              <td
                                rowSpan={p.variants.length}
                                className="py-3 px-4 font-bold text-slate-900 border-l border-slate-200 align-top"
                              >
                                <div className="text-sm">{p.name}</div>
                                <div className="text-[11px] text-teal-700 font-semibold mt-0.5">
                                  {p.brand}
                                </div>
                              </td>
                            ) : null}

                            {/* Category Name */}
                            {idx === 0 ? (
                              <td
                                rowSpan={p.variants.length}
                                className="py-3 px-3 text-slate-600 border-l border-slate-200 align-top"
                              >
                                {category?.name || '-'}
                              </td>
                            ) : null}

                            {/* Size Name */}
                            <td className="py-2.5 px-3 font-bold text-slate-800">
                              {v.name}
                            </td>

                            {/* Price */}
                            <td className="py-2.5 px-4 text-left font-black text-base text-slate-900 tabular-nums">
                              {v.price} {currency}
                            </td>

                            {/* Stock */}
                            <td className="py-2.5 px-3 text-center">
                              {(() => {
                                const qty = v.stockQuantity !== undefined ? v.stockQuantity : (v.inStock ? 15 : 0);
                                const threshold = v.lowStockThreshold || 5;
                                if (qty === 0) {
                                  return (
                                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                      نفد بالمحل
                                    </span>
                                  );
                                }
                                if (qty <= threshold) {
                                  return (
                                    <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full tabular-nums">
                                      متبقي {qty} فقط
                                    </span>
                                  );
                                }
                                return (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full tabular-nums">
                                    متوفر ({qty})
                                  </span>
                                );
                              })()}
                            </td>

                            {/* Barcode */}
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                              {v.barcode || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
