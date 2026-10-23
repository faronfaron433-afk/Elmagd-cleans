export interface SizeVariant {
  id: string;
  name: string; // e.g. "1 كجم أوتوماتيك", "جركل 4 لتر", "500 مل"
  price: number; // Selling price in EGP / ج.م
  costPrice?: number; // Optional wholesale / cost price for manager only
  barcode?: string; // Optional barcode / code
  inStock: boolean; // Availability
  stockQuantity: number; // Current stock count in units/pieces (المخزون المتوفر)
  lowStockThreshold?: number; // Low stock alert threshold (حد التنبيه عند اقتراب النفاذ - الافتراضي 5)
  lastPriceUpdated?: string; // ISO date of last price change
  previousPrice?: number; // Previous price before update
}

export interface ProductItem {
  id: string;
  categoryId: string;
  name: string; // e.g. "إريال أوتوماتيك - Ariel"
  brand: string; // e.g. "إريال"
  description?: string;
  isPopular?: boolean;
  variants: SizeVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string; // e.g. "مساحيق غسيل"
  iconName: string; // Lucide icon key
  description?: string;
  order: number;
}

export interface PriceChangeLog {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  oldPrice: number;
  newPrice: number;
  timestamp: string;
  changedBy: 'manager' | 'bulk_tool';
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  address: string;
  currency: string;
  managerPin: string;
  lastModified: string;
}

export type NotificationType = 'price_change' | 'new_product' | 'stock_alert' | 'announcement';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  details?: {
    productId?: string;
    productName?: string;
    variantName?: string;
    oldPrice?: number;
    newPrice?: number;
    stockQuantity?: number;
  };
}

export interface CatalogData {
  categories: Category[];
  products: ProductItem[];
  priceLogs: PriceChangeLog[];
  notifications?: AppNotification[];
  settings: StoreSettings;
  version: number;
  lastModified: string;
}

export type UserRole = 'worker' | 'manager';

