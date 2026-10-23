import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Shield, 
  User, 
  Search, 
  Tag, 
  Layers, 
  TrendingUp, 
  Printer, 
  Phone, 
  MapPin, 
  Store,
  RefreshCw,
  Globe
} from 'lucide-react';
import { catalogService } from './services/catalogService';
import { 
  CatalogData, 
  UserRole, 
  ProductItem, 
  SizeVariant, 
  Category 
} from './types/catalog';
import { Header } from './components/Header';
import { WorkerPriceView } from './components/WorkerPriceView';
import { ManagerDashboard } from './components/ManagerDashboard';
import { PinLoginModal } from './components/PinLoginModal';
import { QuickPriceModal } from './components/QuickPriceModal';
import { BulkPriceModal } from './components/BulkPriceModal';
import { EditProductModal } from './components/EditProductModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { PrintPriceListModal } from './components/PrintPriceListModal';
import { PriceAlertToast, PriceAlert } from './components/PriceAlertToast';
import { NotificationsModal } from './components/NotificationsModal';
import { AppInstallModal } from './components/AppInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { notificationService } from './services/notificationService';
import heroImage from './assets/images/hero_detergents_store_1792792442662.jpg';

export default function App() {
  const [catalog, setCatalog] = useState<CatalogData>(catalogService.getCatalog());
  const [role, setRole] = useState<UserRole>('worker'); // Workers view by default
  const [activeAlert, setActiveAlert] = useState<PriceAlert | null>(null);

  // Modals state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(
    notificationService.getUnreadCount()
  );

  // Quick Price modal
  const [quickPriceProduct, setQuickPriceProduct] = useState<ProductItem | null>(null);
  const [quickPriceVariant, setQuickPriceVariant] = useState<SizeVariant | null>(null);

  // Real-time synchronization
  useEffect(() => {
    const unsubscribeCatalog = catalogService.subscribe((updated) => {
      setCatalog(updated);
    });

    const unsubscribeAlert = catalogService.subscribePriceAlert((alert) => {
      setActiveAlert({
        id: 'alert_' + Date.now(),
        ...alert,
      });
    });

    const unsubscribeNotifications = notificationService.subscribe((list) => {
      setUnreadNotifCount(list.filter((n) => !n.read).length);
    });

    return () => {
      unsubscribeCatalog();
      unsubscribeAlert();
      unsubscribeNotifications();
    };
  }, []);

  // Manager Authentication
  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setRole('manager');
  };

  // Manager Actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsEditProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: ProductItem) => {
    setEditingProduct(prod);
    setIsEditProductModalOpen(true);
  };

  const handleSaveProduct = async (productData: any) => {
    if (productData.id) {
      return await catalogService.updateProduct(productData);
    } else {
      await catalogService.addProduct(productData);
      return true;
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    return await catalogService.deleteProduct(productId);
  };

  const handleOpenQuickPrice = (product: ProductItem, variant: SizeVariant) => {
    setQuickPriceProduct(product);
    setQuickPriceVariant(variant);
  };

  const handleSavePrice = async (
    productId: string,
    variantId: string,
    newPrice: number,
    costPrice?: number,
    notes?: string
  ) => {
    return await catalogService.updateVariantPrice(productId, variantId, newPrice, costPrice, notes);
  };

  const handleOpenAddCategory = (categoryToEdit?: Category | null) => {
    setEditingCategory(categoryToEdit || null);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (name: string, iconName: string, description?: string) => {
    if (editingCategory) {
      return await catalogService.updateCategory({
        ...editingCategory,
        name,
        iconName,
        description,
      });
    } else {
      return await catalogService.addCategory(name, iconName, description);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    return await catalogService.deleteCategory(categoryId);
  };

  const handleBulkPriceAdjustment = async (options: any) => {
    return await catalogService.applyBulkPriceAdjustment(options);
  };

  const handleUpdateSettings = async (settingsData: any) => {
    await catalogService.updateStoreSettings(settingsData);
  };

  const handleAdjustStock = async (productId: string, variantId: string, delta: number) => {
    return await catalogService.adjustVariantStock(productId, variantId, delta);
  };

  const handleUpdateStock = async (productId: string, variantId: string, qty: number, threshold?: number) => {
    return await catalogService.updateVariantStock(productId, variantId, qty, threshold);
  };

  const handleResetData = async () => {
    await catalogService.resetToDefaultData();
  };

  const totalVariantsCount = catalog.products.reduce((acc, p) => acc + p.variants.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Cairo',sans-serif]">
      {/* Top Header */}
      <Header
        role={role}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        onSwitchToWorker={() => setRole('worker')}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenNotificationsModal={() => setIsNotificationsModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        unreadNotifCount={unreadNotifCount}
        totalProductsCount={catalog.products.length}
        totalVariantsCount={totalVariantsCount}
        storeName={catalog.settings.storeName}
      />

      {/* Website Hero Showcase Strip (Store branding) */}
      <div className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-20">
          <img
            src={heroImage}
            alt="منظفات المجد"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/85 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-800/60 mb-2">
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>الموقع والتطبيق الرسمي لمحل منظفات المجد · بوابة الأسعار والمخزون</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {catalog.settings.storeName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {catalog.settings.tagline || 'دليل الأصناف والمقاسات والأسعار المحدثة لحظياً لخدمة الزبائن والمحل'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300">
            {/* Download app fast action */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-3.5 py-2 rounded-xl shadow-md font-bold transition-all cursor-pointer"
            >
              <span>📲</span>
              <span>تثبيت التطبيق على جهازك</span>
            </button>

            {/* Notification center quick trigger */}
            <button
              onClick={() => setIsNotificationsModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 px-3.5 py-2 rounded-xl border border-slate-700 font-bold transition-colors cursor-pointer"
            >
              <span>🔔</span>
              <span>التنبيهات بكل جديد</span>
              {unreadNotifCount > 0 && (
                <span className="bg-rose-500 text-white text-[11px] font-black px-1.5 py-0.5 rounded-full">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {catalog.settings.phone && (
              <a
                href={`tel:${catalog.settings.phone}`}
                className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 hover:border-teal-500 transition-colors cursor-pointer"
                title="الاتصال بالمحل"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-mono">{catalog.settings.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {role === 'worker' ? (
          <WorkerPriceView
            categories={catalog.categories}
            products={catalog.products}
            currency={catalog.settings.currency}
          />
        ) : (
          <ManagerDashboard
            categories={catalog.categories}
            products={catalog.products}
            priceLogs={catalog.priceLogs}
            settings={catalog.settings}
            currency={catalog.settings.currency}
            onOpenAddProduct={handleOpenAddProduct}
            onOpenEditProduct={handleOpenEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onOpenQuickPrice={handleOpenQuickPrice}
            onOpenBulkPrice={() => setIsBulkPriceModalOpen(true)}
            onOpenAddCategory={handleOpenAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateVariantPrice={handleSavePrice}
            onAdjustStock={handleAdjustStock}
            onUpdateStock={handleUpdateStock}
            onUpdateSettings={handleUpdateSettings}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Official Website Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: About */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                  م
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-none">
                    {catalog.settings.storeName}
                  </h3>
                  <span className="text-[11px] text-teal-700 font-semibold">الموقع الرسمي لبوابة الأسعار والمخزون</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                الموقع الرسمي المعتمد لمحل منظفات المجد. يوفر استعلاماً دقيقاً ولحظياً عن أسعار كافة أنواع مساحيق الغسيل الأوتوماتيك والعادي، الصابون السائل، معطرات الملابس والأرضيات، والكلور والمعقمات، مع متابعة فورية لحركة المخزون.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>تحديث فوري لأسعار السوق الرسمية</span>
                <span>·</span>
                <span>بدون وسطاء أو طلبات خارجية</span>
              </div>
            </div>

            {/* Col 2: Fast Navigation */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                روابط الموقع
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => setRole('worker')}
                    className="text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
                  >
                    عرض أسعار وبضائع المحل
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
                  >
                    معاينة وطباعة لائحة الأسعار للرفوف
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (role === 'manager') {
                        setRole('worker');
                      } else {
                        setIsPinModalOpen(true);
                      }
                    }}
                    className="text-slate-600 hover:text-teal-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{role === 'manager' ? 'الرجوع لشاشة العاملين' : 'بوابة تحكم المدير'}</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact & Store Location */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                بيانات المحل
              </h4>
              <div className="space-y-2 text-xs text-slate-500">
                {catalog.settings.address && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{catalog.settings.address}</span>
                  </div>
                )}
                {catalog.settings.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <a href={`tel:${catalog.settings.phone}`} className="font-mono hover:text-teal-700">
                      {catalog.settings.phone}
                    </a>
                  </div>
                )}
                <div className="text-[11px] text-slate-400 pt-1">
                  العملة المعتمدة بالمحل: <span className="font-bold text-slate-700">{catalog.settings.currency}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              <span>جميع الحقوق محفوظة © {new Date().getFullYear()} {catalog.settings.storeName} · الموقع الرسمي</span>
            </div>
            <div className="flex items-center gap-3">
              <span>نظام إدارة واستعلام الأسعار الداخلي</span>
              <span>·</span>
              <span className="text-emerald-600 font-semibold">● متصل بالخادم المحلي</span>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <PinLoginModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        currentPin={catalog.settings.managerPin}
      />

      <QuickPriceModal
        isOpen={!!quickPriceProduct && !!quickPriceVariant}
        onClose={() => {
          setQuickPriceProduct(null);
          setQuickPriceVariant(null);
        }}
        product={quickPriceProduct}
        variant={quickPriceVariant}
        currency={catalog.settings.currency}
        onSavePrice={handleSavePrice}
      />

      <BulkPriceModal
        isOpen={isBulkPriceModalOpen}
        onClose={() => setIsBulkPriceModalOpen(false)}
        categories={catalog.categories}
        products={catalog.products}
        currency={catalog.settings.currency}
        onApplyBulk={handleBulkPriceAdjustment}
      />

      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => setIsEditProductModalOpen(false)}
        product={editingProduct}
        categories={catalog.categories}
        currency={catalog.settings.currency}
        onSaveProduct={handleSaveProduct}
        onOpenAddCategory={() => {
          setIsEditProductModalOpen(false);
          handleOpenAddCategory();
        }}
      />

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={editingCategory}
        onSaveCategory={handleSaveCategory}
      />

      <PrintPriceListModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        categories={catalog.categories}
        products={catalog.products}
        settings={catalog.settings}
        currency={catalog.settings.currency}
      />

      <PriceAlertToast
        alert={activeAlert}
        onDismiss={() => setActiveAlert(null)}
        currency={catalog.settings.currency}
      />

      {/* Real-time Notifications Center */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        role={role}
      />

      {/* PWA App Install Modal */}
      <AppInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Offline Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
}
