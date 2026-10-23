import { CatalogData, Category, PriceChangeLog, ProductItem, StoreSettings } from '../types/catalog';
import { initialCatalogData } from '../data/initialCatalog';
import { notificationService } from './notificationService';

const STORAGE_KEY = 'al_majd_detergents_catalog_v1';
const BROADCAST_CHANNEL_NAME = 'al_majd_detergents_sync_channel';

type CatalogListener = (catalog: CatalogData) => void;
type PriceAlertListener = (alert: {
  productName: string;
  variantName: string;
  oldPrice: number;
  newPrice: number;
  timestamp: string;
}) => void;

class CatalogService {
  private catalog: CatalogData;
  private listeners: Set<CatalogListener> = new Set();
  private priceAlertListeners: Set<PriceAlertListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private pollInterval: number | null = null;
  private lastKnownModified: string = '';

  constructor() {
    this.catalog = this.loadInitialFromStorage();
    this.lastKnownModified = this.catalog.lastModified;

    // Set up BroadcastChannel for instant cross-tab / multi-window communication
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'CATALOG_UPDATED') {
            const updatedCatalog = event.data.catalog as CatalogData;
            this.handleRemoteUpdate(updatedCatalog, event.data.alert);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported or blocked:', err);
      }
    }

    // Initialize from server API & start polling
    if (typeof window !== 'undefined') {
      this.fetchFromServer();
      this.startPolling();
    }
  }

  private loadInitialFromStorage(): CatalogData {
    if (typeof window === 'undefined') {
      return initialCatalogData;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.categories)) {
          if (parsed.settings && parsed.settings.managerPin === '1234') {
            parsed.settings.managerPin = '4545';
          }
          // Ensure all variants have valid stockQuantity and lowStockThreshold
          parsed.products.forEach((p: any) => {
            if (Array.isArray(p.variants)) {
              p.variants.forEach((v: any) => {
                if (typeof v.stockQuantity !== 'number') {
                  v.stockQuantity = v.inStock === false ? 0 : 15;
                }
                if (typeof v.lowStockThreshold !== 'number') {
                  v.lowStockThreshold = 5;
                }
                v.inStock = v.stockQuantity > 0;
              });
            }
          });
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading stored catalog:', e);
    }
    return initialCatalogData;
  }

  private async fetchFromServer() {
    try {
      const res = await fetch('/api/catalog');
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && Array.isArray(serverData.products)) {
          this.catalog = serverData;
          this.lastKnownModified = serverData.lastModified;
          this.saveToStorage(serverData, false);
          this.notifyListeners();
          return;
        }
      } else if (res.status === 404) {
        // If server data file doesn't exist yet, seed it with initialCatalogData
        await this.syncToServer(this.catalog);
      }
    } catch (e) {
      console.warn('Could not sync with server API, using local storage fallback:', e);
    }
  }

  private startPolling() {
    if (this.pollInterval) return;
    this.pollInterval = window.setInterval(async () => {
      try {
        const res = await fetch('/api/sync');
        if (res.ok) {
          const syncInfo = await res.json();
          if (syncInfo.lastModified && syncInfo.lastModified !== this.lastKnownModified) {
            // Server has newer updates!
            const catRes = await fetch('/api/catalog');
            if (catRes.ok) {
              const updated = await catRes.json();
              this.lastKnownModified = syncInfo.lastModified;
              this.handleRemoteUpdate(updated);
            }
          }
        }
      } catch {
        // ignore network hiccups
      }
    }, 2500);
  }

  private async syncToServer(data: CatalogData): Promise<boolean> {
    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.lastModified) {
          this.lastKnownModified = result.lastModified;
        }
        return true;
      }
    } catch (e) {
      console.warn('Failed to persist to server API:', e);
    }
    return false;
  }

  private saveToStorage(data: CatalogData, broadcast = true, alertInfo?: any) {
    this.catalog = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Storage full or error:', e);
    }

    if (broadcast && this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'CATALOG_UPDATED',
        catalog: data,
        alert: alertInfo,
      });
    }

    this.notifyListeners();
  }

  private handleRemoteUpdate(updatedCatalog: CatalogData, alertInfo?: any) {
    this.catalog = updatedCatalog;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCatalog));
    } catch {}
    this.notifyListeners();

    if (alertInfo) {
      this.priceAlertListeners.forEach((fn) => fn(alertInfo));

      if (alertInfo.announcement) {
        notificationService.pushNotification(
          'announcement',
          alertInfo.announcement.title,
          alertInfo.announcement.message,
          undefined,
          true
        );
      } else if (alertInfo.productName && alertInfo.newPrice !== undefined && alertInfo.newPrice > 0) {
        notificationService.pushNotification(
          'price_change',
          `تحديث سعر: ${alertInfo.productName}`,
          `تم تعديل سعر (${alertInfo.variantName || 'صنف'}) إلى ${alertInfo.newPrice} ج.م`,
          undefined,
          true
        );
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.catalog));
  }

  public getCatalog(): CatalogData {
    return this.catalog;
  }

  public subscribe(listener: CatalogListener): () => void {
    this.listeners.add(listener);
    listener(this.catalog);
    return () => this.listeners.delete(listener);
  }

  public subscribePriceAlert(listener: PriceAlertListener): () => void {
    this.priceAlertListeners.add(listener);
    return () => this.priceAlertListeners.delete(listener);
  }

  // --- ACTIONS (Manager) ---

  public async updateVariantPrice(
    productId: string,
    variantId: string,
    newPrice: number,
    costPrice?: number,
    notes?: string
  ): Promise<boolean> {
    const product = this.catalog.products.find((p) => p.id === productId);
    if (!product) return false;

    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return false;

    const oldPrice = variant.price;
    const nowIso = new Date().toISOString();

    variant.previousPrice = oldPrice;
    variant.price = Math.max(0, Number(newPrice));
    if (costPrice !== undefined) {
      variant.costPrice = Math.max(0, Number(costPrice));
    }
    variant.lastPriceUpdated = nowIso;
    product.updatedAt = nowIso;

    // Log the price change
    const newLog: PriceChangeLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      oldPrice,
      newPrice: variant.price,
      timestamp: nowIso,
      changedBy: 'manager',
      notes: notes || undefined,
    };

    const updatedCatalog: CatalogData = {
      ...this.catalog,
      products: [...this.catalog.products],
      priceLogs: [newLog, ...(this.catalog.priceLogs || []).slice(0, 99)],
      lastModified: nowIso,
    };

    const alertInfo = {
      productName: product.name,
      variantName: variant.name,
      oldPrice,
      newPrice: variant.price,
      timestamp: nowIso,
    };

    this.saveToStorage(updatedCatalog, true, alertInfo);
    await this.syncToServer(updatedCatalog);

    // Push notification for the price change
    const deltaPrice = variant.price - oldPrice;
    const changeDirection = deltaPrice > 0 ? `زيادة (+${deltaPrice} ج.م)` : `تخفيض (${deltaPrice} ج.م)`;
    notificationService.pushNotification(
      'price_change',
      `تحديث سعر: ${product.name}`,
      `تم تعديل سعر (${variant.name}) إلى ${variant.price} ج.م [${changeDirection}]`,
      {
        productId: product.id,
        productName: product.name,
        variantName: variant.name,
        oldPrice,
        newPrice: variant.price,
      }
    );

    // Fire alert locally as well
    this.priceAlertListeners.forEach((fn) => fn(alertInfo));

    return true;
  }

  public async adjustVariantStock(
    productId: string,
    variantId: string,
    delta: number
  ): Promise<boolean> {
    const product = this.catalog.products.find((p) => p.id === productId);
    if (!product) return false;

    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return false;

    const newQty = Math.max(0, (variant.stockQuantity || 0) + delta);
    variant.stockQuantity = newQty;
    variant.inStock = newQty > 0;
    const nowIso = new Date().toISOString();
    product.updatedAt = nowIso;

    const updatedCatalog: CatalogData = {
      ...this.catalog,
      products: [...this.catalog.products],
      lastModified: nowIso,
    };

    this.saveToStorage(updatedCatalog, true);
    await this.syncToServer(updatedCatalog);

    // Notify if low stock
    const threshold = variant.lowStockThreshold || 5;
    if (newQty <= threshold) {
      notificationService.pushNotification(
        'stock_alert',
        `تنبيه نقص مخزون: ${product.name}`,
        `صنف (${variant.name}) وصل إلى ${newQty} عبوة فقط (الحد الأدنى: ${threshold}). يرجى طلب النواقص للمحل!`,
        {
          productId: product.id,
          productName: product.name,
          variantName: variant.name,
          stockQuantity: newQty,
        }
      );
    }

    return true;
  }

  public async updateVariantStock(
    productId: string,
    variantId: string,
    quantity: number,
    lowStockThreshold?: number
  ): Promise<boolean> {
    const product = this.catalog.products.find((p) => p.id === productId);
    if (!product) return false;

    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return false;

    const newQty = Math.max(0, Number(quantity) || 0);
    variant.stockQuantity = newQty;
    variant.inStock = newQty > 0;
    if (lowStockThreshold !== undefined) {
      variant.lowStockThreshold = Math.max(1, Number(lowStockThreshold));
    }
    const nowIso = new Date().toISOString();
    product.updatedAt = nowIso;

    const updatedCatalog: CatalogData = {
      ...this.catalog,
      products: [...this.catalog.products],
      lastModified: nowIso,
    };

    this.saveToStorage(updatedCatalog, true);
    await this.syncToServer(updatedCatalog);

    // Notify if low stock
    const threshold = variant.lowStockThreshold || 5;
    if (newQty <= threshold) {
      notificationService.pushNotification(
        'stock_alert',
        `تنبيه نقص مخزون: ${product.name}`,
        `صنف (${variant.name}) وصل إلى ${newQty} عبوة فقط (الحد الأدنى: ${threshold}). يرجى تسجيل النواقص!`,
        {
          productId: product.id,
          productName: product.name,
          variantName: variant.name,
          stockQuantity: newQty,
        }
      );
    }

    return true;
  }

  public async addProduct(product: Omit<ProductItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductItem> {
    const nowIso = new Date().toISOString();
    const newProduct: ProductItem = {
      ...product,
      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const updatedCatalog: CatalogData = {
      ...this.catalog,
      products: [newProduct, ...this.catalog.products],
      lastModified: nowIso,
    };

    this.saveToStorage(updatedCatalog, true);
    await this.syncToServer(updatedCatalog);

    notificationService.pushNotification(
      'new_product',
      `صنف جديد متاح بالمحل: ${newProduct.name}`,
      `تمت إضافة صنف منظفات جديد (${newProduct.brand || 'منظفات'}) بعدد ${newProduct.variants.length} مقاسات وعبوات معروضة الآن.`,
      {
        productId: newProduct.id,
        productName: newProduct.name,
      }
    );

    return newProduct;
  }

  public async updateProduct(product: ProductItem): Promise<boolean> {
    const index = this.catalog.products.findIndex((p) => p.id === product.id);
    if (index === -1) return false;

    const nowIso = new Date().toISOString();
    const updatedProducts = [...this.catalog.products];
    updatedProducts[index] = {
      ...product,
      updatedAt: nowIso,
    };

    const updatedCatalog: CatalogData = {
      ...this.catalog,
      products: updatedProducts,
      lastModified: nowIso,
    };

    this.saveToStorage(updatedCatalog, true);
    await this.syncToServer(updatedCatalog);
    return true;
  }

  public async deleteProduct(productId: string): Promise<boolean> {
    const filtered = this.catalog.products.filter((p) => p.id !== productId);
    if (filtered.length === this.catalog.products.length) return false;

    const nowIso = new Date().toISOString();
    const updatedCatalog: CatalogData = {
      ...this.catalog,
      products: filtered,
      lastModified: nowIso,
    };

    this.saveToStorage(updatedCatalog, true);
    await this.syncToServer(updatedCatalog);
    return true;
  }

  public async addCategory(name: string, iconName = 'Package', description?: string): Promise<Category> {
    const nowIso = new Date().toISOString();
    const newCat: Category = {
      id: 'cat_' + Date.now(),
      name,
      iconName,
      description,
      order: this.catalog.categories.length + 1,
    };

    const updatedCatalog: CatalogData = {
      ...this.catalog,
      categories: [...this.catalog.categories, newCat],
      lastModified: nowIso,
    };

    this.saveToStorage(updatedCatalog, true);
    await this.syncToServer(updatedCatalog);
    return newCat;
  }

  public async updateCategory(category: Category): Promise<boolean> {
    const index = this.catalog.categories.findIndex((c) => c.id === category.id);
    if (index === -1) return false;

    const nowIso = new Date().toISOString();
    const updated = [...this.catalog.categories];
    updated[index] = category;

    const updatedCatalog: CatalogData = {
      ...this.catalog,
      categories: updated,
      lastModified: nowIso,
    };

    this.saveToStorage(updatedCatalog, true);
    await this.syncToServer(updatedCatalog);
    return true;
  }

  public async deleteCategory(categoryId: string): Promise<boolean> {
    const filtered = this.catalog.categories.filter((c) => c.id !== categoryId);
    if (filtered.length === this.catalog.categories.length) return false;

    const nowIso = new Date().toISOString();
    const updatedCatalog: CatalogData = {
      ...this.catalog,
      categories: filtered,
      lastModified: nowIso,
    };

    this.saveToStorage(updatedCatalog, true);
    await this.syncToServer(updatedCatalog);
    return true;
  }

  public async applyBulkPriceAdjustment(options: {
    categoryId?: string; // all or specific category
    type: 'percentage' | 'fixed';
    direction: 'increase' | 'decrease';
    value: number; // e.g. 5% or 5 EGP
    roundToNearest?: number; // e.g. round to nearest 1, 5, or 10 EGP
    notes?: string;
  }): Promise<{ updatedCount: number }> {
    const nowIso = new Date().toISOString();
    let count = 0;
    const newLogs: PriceChangeLog[] = [];

    const updatedProducts = this.catalog.products.map((prod) => {
      if (options.categoryId && options.categoryId !== 'all' && prod.categoryId !== options.categoryId) {
        return prod;
      }

      let productChanged = false;
      const updatedVariants = prod.variants.map((v) => {
        const oldPrice = v.price;
        let delta = 0;

        if (options.type === 'percentage') {
          delta = (oldPrice * options.value) / 100;
        } else {
          delta = options.value;
        }

        let calculated = options.direction === 'increase' ? oldPrice + delta : oldPrice - delta;

        if (options.roundToNearest && options.roundToNearest > 0) {
          calculated = Math.round(calculated / options.roundToNearest) * options.roundToNearest;
        } else {
          calculated = Math.round(calculated);
        }

        calculated = Math.max(1, calculated);

        if (calculated !== oldPrice) {
          count++;
          productChanged = true;
          newLogs.push({
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            productId: prod.id,
            productName: prod.name,
            variantId: v.id,
            variantName: v.name,
            oldPrice,
            newPrice: calculated,
            timestamp: nowIso,
            changedBy: 'bulk_tool',
            notes: options.notes || `تعديل جماعي (${options.direction === 'increase' ? '+' : '-'}${options.value}${options.type === 'percentage' ? '%' : ' ج.م'})`,
          });

          return {
            ...v,
            previousPrice: oldPrice,
            price: calculated,
            lastPriceUpdated: nowIso,
          };
        }
        return v;
      });

      return productChanged
        ? { ...prod, variants: updatedVariants, updatedAt: nowIso }
        : prod;
    });

    const updatedCatalog: CatalogData = {
      ...this.catalog,
      products: updatedProducts,
      priceLogs: [...newLogs, ...(this.catalog.priceLogs || [])].slice(0, 100),
      lastModified: nowIso,
    };

    this.saveToStorage(updatedCatalog, true, {
      productName: 'تعديل جماعي للأسعار',
      variantName: `${count} صنف ومقاس`,
      oldPrice: 0,
      newPrice: 0,
      timestamp: nowIso,
    });
    await this.syncToServer(updatedCatalog);

    if (count > 0) {
      notificationService.pushNotification(
        'price_change',
        `تعديل أسعار جماعي (${count} صنف)`,
        `تم تطبيق تعديل الأسعار الجديد على ${count} عبوة بنجاح في المحل.`,
        undefined,
        true
      );
    }

    return { updatedCount: count };
  }

  public async addStoreAnnouncement(title: string, message: string): Promise<void> {
    const nowIso = new Date().toISOString();
    notificationService.pushNotification('announcement', title, message, undefined, true);
    const updatedCatalog: CatalogData = {
      ...this.catalog,
      lastModified: nowIso,
    };
    this.saveToStorage(updatedCatalog, true, {
      announcement: { title, message },
    });
    await this.syncToServer(updatedCatalog);
  }

  public async updateStoreSettings(settings: Partial<StoreSettings>): Promise<void> {
    const nowIso = new Date().toISOString();
    const updatedCatalog: CatalogData = {
      ...this.catalog,
      settings: {
        ...this.catalog.settings,
        ...settings,
        lastModified: nowIso,
      },
      lastModified: nowIso,
    };

    this.saveToStorage(updatedCatalog, true);
    await this.syncToServer(updatedCatalog);
  }

  public async resetToDefaultData(): Promise<void> {
    const nowIso = new Date().toISOString();
    const freshData: CatalogData = {
      ...initialCatalogData,
      lastModified: nowIso,
    };

    this.saveToStorage(freshData, true);
    await this.syncToServer(freshData);
  }

  public async importCatalog(imported: CatalogData): Promise<boolean> {
    if (!imported || !Array.isArray(imported.products) || !Array.isArray(imported.categories)) {
      return false;
    }
    const nowIso = new Date().toISOString();
    const validatedData: CatalogData = {
      ...imported,
      lastModified: nowIso,
    };

    this.saveToStorage(validatedData, true);
    await this.syncToServer(validatedData);
    return true;
  }
}

export const catalogService = new CatalogService();
