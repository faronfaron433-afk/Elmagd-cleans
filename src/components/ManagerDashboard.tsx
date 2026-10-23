import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  History, 
  Layers, 
  Settings, 
  Tag, 
  Check, 
  X, 
  Package, 
  Sparkles, 
  DollarSign, 
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  FolderPlus,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Percent,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  AlertTriangle,
  Boxes,
  Minus,
  PackageX,
  ArrowRight
} from 'lucide-react';
import { Category, ProductItem, SizeVariant, PriceChangeLog, StoreSettings } from '../types/catalog';

interface ManagerDashboardProps {
  categories: Category[];
  products: ProductItem[];
  priceLogs: PriceChangeLog[];
  settings: StoreSettings;
  currency: string;
  onOpenAddProduct: () => void;
  onOpenEditProduct: (product: ProductItem) => void;
  onDeleteProduct: (productId: string) => Promise<boolean>;
  onOpenQuickPrice: (product: ProductItem, variant: SizeVariant) => void;
  onOpenBulkPrice: () => void;
  onOpenAddCategory: (categoryToEdit?: Category | null) => void;
  onDeleteCategory: (categoryId: string) => Promise<boolean>;
  onUpdateVariantPrice: (
    productId: string,
    variantId: string,
    newPrice: number,
    costPrice?: number,
    notes?: string
  ) => Promise<boolean>;
  onAdjustStock: (productId: string, variantId: string, delta: number) => Promise<boolean>;
  onUpdateStock: (productId: string, variantId: string, quantity: number, threshold?: number) => Promise<boolean>;
  onUpdateSettings: (settings: Partial<StoreSettings>) => Promise<void>;
  onResetData: () => Promise<void>;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  categories,
  products,
  priceLogs,
  settings,
  currency,
  onOpenAddProduct,
  onOpenEditProduct,
  onDeleteProduct,
  onOpenQuickPrice,
  onOpenBulkPrice,
  onOpenAddCategory,
  onDeleteCategory,
  onUpdateVariantPrice,
  onAdjustStock,
  onUpdateStock,
  onUpdateSettings,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'low_stock' | 'logs' | 'categories' | 'settings'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Inline Price & Stock Editing State
  const [inlineEditingVariantId, setInlineEditingVariantId] = useState<string | null>(null);
  const [inlinePriceInput, setInlinePriceInput] = useState<string>('');

  const [inlineEditingStockVariantId, setInlineEditingStockVariantId] = useState<string | null>(null);
  const [inlineStockInput, setInlineStockInput] = useState<string>('');

  // Settings tab form state
  const [storeNameInput, setStoreNameInput] = useState(settings.storeName);
  const [storeTaglineInput, setStoreTaglineInput] = useState(settings.tagline);
  const [phoneInput, setPhoneInput] = useState(settings.phone);
  const [addressInput, setAddressInput] = useState(settings.address || '');
  const [pinInput, setPinInput] = useState(settings.managerPin || '4545');
  const [showSettingsPin, setShowSettingsPin] = useState(false);
  const [currencyInput, setCurrencyInput] = useState(settings.currency);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    setStoreNameInput(settings.storeName);
    setStoreTaglineInput(settings.tagline);
    setPhoneInput(settings.phone);
    setAddressInput(settings.address || '');
    setPinInput(settings.managerPin || '4545');
    setCurrencyInput(settings.currency);
  }, [settings]);

  // Compute Low Stock Items (نواقص المخزون الحرج)
  const lowStockList = useMemo(() => {
    const list: { product: ProductItem; variant: SizeVariant }[] = [];
    products.forEach((p) => {
      p.variants.forEach((v) => {
        const threshold = v.lowStockThreshold || 5;
        const qty = v.stockQuantity !== undefined ? v.stockQuantity : (v.inStock ? 15 : 0);
        if (qty <= threshold) {
          list.push({ product: p, variant: v });
        }
      });
    });
    return list;
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((prod) => {
      if (selectedCategory !== 'all' && prod.categoryId !== selectedCategory) return false;
      if (!q) return true;

      const inName = prod.name.toLowerCase().includes(q);
      const inBrand = prod.brand.toLowerCase().includes(q);
      const inVariants = prod.variants.some((v) => v.name.toLowerCase().includes(q) || (v.barcode && v.barcode.includes(q)));
      return inName || inBrand || inVariants;
    });
  }, [products, searchQuery, selectedCategory]);

  // Total Variants Count
  const totalVariantsCount = useMemo(() => {
    return products.reduce((acc, p) => acc + p.variants.length, 0);
  }, [products]);

  // Handle Inline Price Save
  const handleInlineSave = async (product: ProductItem, variant: SizeVariant) => {
    const val = parseFloat(inlinePriceInput);
    if (!isNaN(val) && val >= 0) {
      await onUpdateVariantPrice(product.id, variant.id, val, variant.costPrice, 'تعديل سريع من الجدول');
    }
    setInlineEditingVariantId(null);
  };

  // Handle Inline Stock Save
  const handleInlineStockSave = async (product: ProductItem, variant: SizeVariant) => {
    const val = parseInt(inlineStockInput, 10);
    if (!isNaN(val) && val >= 0) {
      await onUpdateStock(product.id, variant.id, val, variant.lowStockThreshold);
    }
    setInlineEditingStockVariantId(null);
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      storeName: storeNameInput.trim() || 'منظفات المجد',
      tagline: storeTaglineInput.trim(),
      phone: phoneInput.trim(),
      address: addressInput.trim(),
      managerPin: pinInput.trim() || '4545',
      currency: currencyInput.trim() || 'ج.م',
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Manager Action Bar & KPI Summary */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة تحكم المدير والإدارة المركزية</span>
            </div>
            <h2 className="text-xl font-black text-white">
              إدارة أصناف ومقاسات وأسعار منظفات المجد
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              جميع التعديلات على الأسعار أو إضافة الأصناف يتم نشرها تلقائياً على شاشات العاملين فور الحفظ.
            </p>
          </div>

          {/* Manager Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddProduct}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة صنف ومقاسات</span>
            </button>

            <button
              onClick={onOpenBulkPrice}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>تعديل جماعي للأسعار (+ / - %)</span>
            </button>

            <button
              onClick={() => onOpenAddCategory()}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-teal-400" />
              <span>+ قسم جديد</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>العنوان والهاتف والـ PIN</span>
            </button>
          </div>
        </div>

        {/* Quick Numbers Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5 mt-5 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">إجمالي الأصناف:</span>
            <span className="text-lg font-black text-white tabular-nums">{products.length} صنف</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">المقاسات والعبوات:</span>
            <span className="text-lg font-black text-teal-400 tabular-nums">{totalVariantsCount} مقاس</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">أقسام المحل:</span>
            <span className="text-lg font-black text-white tabular-nums">{categories.length} أقسام</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">سجلات تغيير السعر:</span>
            <span className="text-lg font-black text-amber-400 tabular-nums">{priceLogs.length} تعديل</span>
          </div>
          <div 
            onClick={() => setActiveTab('low_stock')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
              lowStockList.length > 0 
                ? 'bg-amber-950/80 border-amber-600/70 text-amber-200 hover:bg-amber-900' 
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
            }`}
          >
            <span className="text-slate-400 block text-[11px]">نواقص المخزون:</span>
            <span className="text-lg font-black text-amber-400 tabular-nums">
              {lowStockList.length} مقاس بحاجة للتوريد
            </span>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockList.length > 0 && activeTab !== 'low_stock' && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
            <span>
              <strong>تنبيه اقتراب نفاذ المخزون:</strong> يوجد <strong>{lowStockList.length}</strong> صنف ومقاس قارب على النفاذ أو نفد تماماً في المحل!
            </span>
          </div>
          <button
            onClick={() => setActiveTab('low_stock')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 shrink-0"
          >
            <span>معاينة وتوريد النواقص</span>
            <span>←</span>
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl max-w-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'products'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-teal-600" />
          <span>الأصناف والأسعار ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('low_stock')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'low_stock'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : lowStockList.length > 0
              ? 'bg-amber-100 text-amber-900 font-extrabold hover:bg-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>نواقص المخزون ({lowStockList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'logs'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4 text-amber-600" />
          <span>سجل تغيير الأسعار ({priceLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'categories'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>الأقسام ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'settings'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-700" />
          <span>الإعدادات والـ PIN</span>
        </button>
      </div>

      {/* TAB 1: PRODUCTS & VARIANTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الماركة، المقاس، أو الباركود..."
                className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-teal-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
              >
                <option value="all">جميع الأقسام ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={onOpenAddProduct}
                className="px-3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>صنف جديد</span>
              </button>
            </div>
          </div>

          {/* Product Items List with Detailed Variants Accordion / Table */}
          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                لا توجد نتائج مطابقة لبحثك
              </div>
            ) : (
              filteredProducts.map((product) => {
                const category = categories.find((c) => c.id === product.categoryId);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                  >
                    {/* Product Master Header */}
                    <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                          <span>{category?.name || 'قسم'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-teal-700 font-semibold">{product.brand}</span>
                          {product.isPopular && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                              الأكثر طلباً
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-black text-slate-900 mt-0.5">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{product.description}</p>
                        )}
                      </div>

                      {/* Product Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onOpenEditProduct(product)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>تعديل الصنف والمقاسات</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف صنف "${product.name}" بجميع مقاساته؟`)) {
                              onDeleteProduct(product.id);
                            }
                          }}
                          title="حذف الصنف"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Sizes / Variants Sub-Table */}
                    <div className="p-3 overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="text-slate-400 font-semibold border-b border-slate-100">
                            <th className="pb-2 pr-2">المقاس / العبوة</th>
                            <th className="pb-2">سعر البيع ({currency})</th>
                            <th className="pb-2">سعر التكلفة</th>
                            <th className="pb-2">الربح المتوقع</th>
                            <th className="pb-2">المخزون المتوفر (الكمية)</th>
                            <th className="pb-2">الباركود</th>
                            <th className="pb-2 text-left pl-2">إجراء سريع</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {product.variants.map((v) => {
                            const isEditingInline = inlineEditingVariantId === v.id;
                            const isEditingStock = inlineEditingStockVariantId === v.id;
                            const profit = v.costPrice ? v.price - v.costPrice : null;
                            const qty = v.stockQuantity !== undefined ? v.stockQuantity : (v.inStock ? 15 : 0);
                            const threshold = v.lowStockThreshold || 5;
                            const isLowStock = qty <= threshold;
                            const isOutOfStock = qty === 0;

                            return (
                              <tr key={v.id} className={`hover:bg-slate-50/80 transition-colors ${isOutOfStock ? 'bg-rose-50/30' : isLowStock ? 'bg-amber-50/30' : ''}`}>
                                {/* Variant Name */}
                                <td className="py-2.5 pr-2 font-bold text-slate-800">
                                  {v.name}
                                </td>

                                {/* Selling Price (with Inline Edit) */}
                                <td className="py-2.5">
                                  {isEditingInline ? (
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        autoFocus
                                        value={inlinePriceInput}
                                        onChange={(e) => setInlinePriceInput(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleInlineSave(product, v);
                                          if (e.key === 'Escape') setInlineEditingVariantId(null);
                                        }}
                                        className="w-20 py-1 px-1.5 border border-teal-500 rounded text-xs font-bold text-slate-900 bg-white"
                                      />
                                      <button
                                        onClick={() => handleInlineSave(product, v)}
                                        className="p-1 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer"
                                        title="حفظ السعر"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setInlineEditingVariantId(null)}
                                        className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 cursor-pointer"
                                        title="إلغاء"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm font-black text-slate-900 tabular-nums">
                                        {v.price} {currency}
                                      </span>
                                      <button
                                        onClick={() => {
                                          setInlineEditingVariantId(v.id);
                                          setInlinePriceInput(v.price.toString());
                                        }}
                                        title="تعديل سريع بالسعر"
                                        className="text-slate-400 hover:text-teal-600 p-0.5 rounded cursor-pointer"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </td>

                                {/* Cost Price */}
                                <td className="py-2.5 text-slate-600 tabular-nums">
                                  {v.costPrice ? `${v.costPrice} ${currency}` : '-'}
                                </td>

                                {/* Profit Margin */}
                                <td className="py-2.5 tabular-nums">
                                  {profit !== null ? (
                                    <span
                                      className={`font-semibold ${
                                        profit > 0
                                          ? 'text-emerald-700'
                                          : profit < 0
                                          ? 'text-rose-600'
                                          : 'text-slate-500'
                                      }`}
                                    >
                                      +{profit} {currency} ({(((profit) / (v.costPrice || 1)) * 100).toFixed(0)}%)
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>

                                {/* Interactive Stock Quantity with Stepper and Alert */}
                                <td className="py-2.5">
                                  {isEditingStock ? (
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min="0"
                                        autoFocus
                                        value={inlineStockInput}
                                        onChange={(e) => setInlineStockInput(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleInlineStockSave(product, v);
                                          if (e.key === 'Escape') setInlineEditingStockVariantId(null);
                                        }}
                                        className="w-16 py-1 px-1.5 border border-teal-500 rounded text-xs font-bold text-slate-900 bg-white"
                                      />
                                      <button
                                        onClick={() => handleInlineStockSave(product, v)}
                                        className="p-1 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer"
                                        title="حفظ الكمية"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setInlineEditingStockVariantId(null)}
                                        className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 cursor-pointer"
                                        title="إلغاء"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      {/* Stepper Controls: Minus & Plus */}
                                      <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                                        <button
                                          onClick={() => onAdjustStock(product.id, v.id, -1)}
                                          disabled={qty <= 0}
                                          className="p-1 text-slate-600 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                                          title="إنقاص الكمية (-1)"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        
                                        <button
                                          onClick={() => {
                                            setInlineEditingStockVariantId(v.id);
                                            setInlineStockInput(qty.toString());
                                          }}
                                          className="px-2 py-0.5 text-xs font-black text-slate-900 hover:bg-white transition-colors tabular-nums cursor-pointer"
                                          title="انقر لتعديل الكمية المحددة"
                                        >
                                          {qty}
                                        </button>

                                        <button
                                          onClick={() => onAdjustStock(product.id, v.id, 1)}
                                          className="p-1 text-slate-600 hover:bg-slate-200 cursor-pointer"
                                          title="زيادة الكمية (+1)"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>

                                      {/* Stock Status Badge */}
                                      {isOutOfStock ? (
                                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                          <PackageX className="w-3 h-3 text-rose-600" />
                                          <span>نفد (0)</span>
                                        </span>
                                      ) : isLowStock ? (
                                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse">
                                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                                          <span>قارب على النفاذ</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                          متوفر
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* Barcode */}
                                <td className="py-2.5 font-mono text-[11px] text-slate-500">
                                  {v.barcode || '-'}
                                </td>

                                {/* Quick Action */}
                                <td className="py-2.5 text-left pl-2">
                                  <button
                                    onClick={() => onOpenQuickPrice(product, v)}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                                  >
                                    تعديل السعر ⚡
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB: LOW STOCK & INVENTORY ALERTS (نواقص المخزون الحرج) */}
      {activeTab === 'low_stock' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-600" />
                <span>نواقص المحل وتنبيهات المخزون الحرج</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                قائمة الأصناف والمقاسات التي قاربت على النفاذ أو نفدت بالكامل لتسهيل طلبها من الموزعين والمصانع
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1.5 rounded-lg tabular-nums">
                {lowStockList.length} صنف ومقاس بحاجة للتوريد
              </span>
            </div>
          </div>

          {lowStockList.length === 0 ? (
            <div className="p-12 text-center bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm text-emerald-950">المخزون مكتمل وبحالة ممتازة!</h4>
              <p className="text-xs text-emerald-700">
                جميع أصناف ومقاسات منظفات المجد متوفرة بكميات كافية أعلى من حد الأمان، ولا توجد أي نواقص حالياً.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="py-3 px-3">الصنف والماركة</th>
                      <th className="py-3 px-3">المقاس / العبوة</th>
                      <th className="py-3 px-3 text-center">الكمية الحالية</th>
                      <th className="py-3 px-3 text-center">حد الأمان</th>
                      <th className="py-3 px-3">سعر التكلفة</th>
                      <th className="py-3 px-3">سعر البيع</th>
                      <th className="py-3 px-3 text-left">توريد سريع للمخزن</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lowStockList.map(({ product, variant }) => {
                      const qty = variant.stockQuantity !== undefined ? variant.stockQuantity : (variant.inStock ? 15 : 0);
                      const isZero = qty === 0;

                      return (
                        <tr key={`${product.id}_${variant.id}`} className={isZero ? 'bg-rose-50/40 hover:bg-rose-50' : 'bg-amber-50/40 hover:bg-amber-50'}>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            <div>{product.name}</div>
                            <div className="text-[10px] text-teal-700 font-semibold">{product.brand}</div>
                          </td>

                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {variant.name}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {isZero ? (
                              <span className="font-black text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full text-[11px]">
                                نفد تماماً (0)
                              </span>
                            ) : (
                              <span className="font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full text-[11px] tabular-nums">
                                متبقي {qty} فقط
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center text-slate-500 tabular-nums">
                            {variant.lowStockThreshold || 5} قطع
                          </td>

                          <td className="py-3 px-3 text-slate-600 tabular-nums">
                            {variant.costPrice ? `${variant.costPrice} ${currency}` : '-'}
                          </td>

                          <td className="py-3 px-3 font-black text-slate-900 tabular-nums">
                            {variant.price} {currency}
                          </td>

                          <td className="py-3 px-3 text-left">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-[10px] text-slate-500 ml-1">إضافة وارد:</span>
                              {[
                                { label: '+5', delta: 5 },
                                { label: '+10', delta: 10 },
                                { label: '+25', delta: 25 },
                              ].map((btn) => (
                                <button
                                  key={btn.label}
                                  onClick={() => onAdjustStock(product.id, variant.id, btn.delta)}
                                  className="px-2 py-1 bg-white hover:bg-teal-50 hover:text-teal-800 hover:border-teal-400 border border-slate-300 rounded text-[11px] font-bold text-slate-700 transition-colors cursor-pointer tabular-nums"
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRICE CHANGE AUDIT LOG */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                <span>سجل تغييرات وتعديلات الأسعار</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                سجل زمني لجميع الأسعار التي قام المدير بتعديلها مع التاريخ وفرق السعر
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg tabular-nums">
              إجمالي {priceLogs.length} سجل
            </div>
          </div>

          {priceLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              لم يتم تسجيل أي تعديل للأسعار بعد
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold pb-2">
                    <th className="pb-2.5">الوقت والتاريخ</th>
                    <th className="pb-2.5">الصنف</th>
                    <th className="pb-2.5">المقاس / العبوة</th>
                    <th className="pb-2.5">السعر السابق</th>
                    <th className="pb-2.5">السعر الجديد</th>
                    <th className="pb-2.5">الفرق</th>
                    <th className="pb-2.5">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priceLogs.map((log) => {
                    const diff = log.newPrice - log.oldPrice;
                    const dateFormatted = new Date(log.timestamp).toLocaleString('ar-EG', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    });

                    return (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-mono text-[11px] text-slate-500">
                          {dateFormatted}
                        </td>
                        <td className="py-2.5 font-bold text-slate-900">{log.productName}</td>
                        <td className="py-2.5 font-medium text-slate-700">{log.variantName}</td>
                        <td className="py-2.5 text-slate-500 tabular-nums">
                          {log.oldPrice} {currency}
                        </td>
                        <td className="py-2.5 font-black text-slate-900 tabular-nums">
                          {log.newPrice} {currency}
                        </td>
                        <td className="py-2.5 tabular-nums font-bold">
                          {diff > 0 ? (
                            <span className="text-amber-600">+{diff} {currency}</span>
                          ) : diff < 0 ? (
                            <span className="text-emerald-600">{diff} {currency}</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-500 text-[11px]">{log.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>إدارة أقسام وتصنيفات المحل</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                الأقسام الرئيسية لتصنيف المساحيق والمنظفات والمعطرات
              </p>
            </div>
            <button
              onClick={() => onOpenAddCategory()}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قسم جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;

              return (
                <div
                  key={cat.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{cat.name}</h4>
                    <span className="text-[11px] text-slate-500">{count} أصناف تابعة</span>
                    {cat.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenAddCategory(cat)}
                      className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="تعديل"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف قسم "${cat.name}"؟`)) {
                            onDeleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: STORE SETTINGS & PIN MANAGEMENT */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-700" />
              <span>إعدادات المحل ورمز المرور السري (PIN)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تغيير اسم المحل، بيانات التواصل، رمز دخول المدير، وعملة الأسعار
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تم حفظ الإعدادات بنجاح!</span>
            </div>
          )}

          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المحل:
                </label>
                <input
                  type="text"
                  required
                  value={storeNameInput}
                  onChange={(e) => setStoreNameInput(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رمز مرور المدير السري (PIN) *
                </label>
                <div className="relative">
                  <input
                    type={showSettingsPin ? 'text' : 'password'}
                    required
                    maxLength={8}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full py-2 pr-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 tracking-wider font-mono focus:outline-hidden focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSettingsPin(!showSettingsPin)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showSettingsPin ? 'إخفاء الرمز' : 'إظهار الرمز'}
                  >
                    {showSettingsPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  الرمز السري للدخول إلى لوحة المدير (يمنع العاملين من تعديل الأسعار)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>رقم هاتف المدير / المحل:</span>
                </label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="مثال: 01012345678"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 font-mono focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>عنوان المحل:</span>
                </label>
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="مثال: شارع المحطة - بجوار المسجد الكبير"
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  شعار المحل أو الوصف:
                </label>
                <input
                  type="text"
                  value={storeTaglineInput}
                  onChange={(e) => setStoreTaglineInput(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رمز العملة:
                </label>
                <input
                  type="text"
                  value={currencyInput}
                  onChange={(e) => setCurrencyInput(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                حفظ بيانات المحل والرمز السري
              </button>
            </div>
          </form>

          {/* Reset To Sample Data */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800">إعادة تعيين البيانات الافتراضية</h4>
              <p className="text-[11px] text-slate-400">
                استرجاع قائمة الأصناف والمقاسات الافتراضية الأصلية لمحل منظفات المجد
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من استرجاع البيانات الافتراضية؟ سيتم مسح أي أصناف مخصصة أضفتها!')) {
                  onResetData();
                }
              }}
              className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              استرجاع الافتراضي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
