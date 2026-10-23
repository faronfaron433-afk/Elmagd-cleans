import { AppNotification, NotificationType } from '../types/catalog';

type NotificationListener = (notifications: AppNotification[]) => void;
type NewNotificationAlertListener = (notification: AppNotification) => void;

const NOTIFICATION_SOUND_KEY = 'al_majd_sound_enabled';
const NOTIFICATIONS_STORAGE_KEY = 'al_majd_notifications_feed';

class NotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private alertListeners: Set<NewNotificationAlertListener> = new Set();
  private notifications: AppNotification[] = [];
  private soundEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.soundEnabled = this.loadSoundPreference();
    this.notifications = this.loadStoredNotifications();
  }

  private loadSoundPreference(): boolean {
    if (typeof window === 'undefined') return true;
    const pref = localStorage.getItem(NOTIFICATION_SOUND_KEY);
    return pref !== null ? pref === 'true' : true;
  }

  private loadStoredNotifications(): AppNotification[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load notifications from storage:', e);
    }
    // Default initial welcome notifications
    return [
      {
        id: 'notif_welcome_1',
        type: 'announcement',
        title: 'مرحباً بكم في تطبيق منظفات المجد',
        message: 'تم تفعيل نظام التنبيهات المباشر لأسعار ومخزون المنظفات. ستصلك إشعارات فورية بكل جديد!',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: 'notif_welcome_2',
        type: 'announcement',
        title: 'إمكانية تثبيت التطبيق على هاتفك',
        message: 'يمكنك الآن تنزيل التطبيق والعمل به على هاتفك وشاشتك الرئيسية حتى بدون إنترنت.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
    ];
  }

  private saveNotifications() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('Failed to save notifications:', e);
    }
    this.listeners.forEach((fn) => fn(this.notifications));
  }

  // Play pleasant notification sound via Web Audio API synth
  public playNotificationSound() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'suspended') {
        this.audioCtx = new AudioCtxClass();
      }
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Note 1 (High bell chime)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2 (Pleasant harmonic resolution)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now + 0.1); // D6
      gain2.gain.setValueAtTime(0.25, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio synthesis not allowed or supported yet:', e);
    }
  }

  // Browser system push notification
  public async requestPermission(): Promise<NotificationPermission> {
    return this.requestNotificationPermission();
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      return 'denied';
    }
  }

  public getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public sendBrowserNotification(title: string, body: string, id?: string) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/icon.svg',
          tag: id || 'al_majd_' + Date.now(),
        });
      } catch (e) {
        console.warn('Browser notification failed:', e);
      }
    }
  }

  // Add a new notification
  public pushNotification(
    type: NotificationType,
    title: string,
    message: string,
    details?: AppNotification['details'],
    playAudio = true
  ): AppNotification {
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      details,
    };

    this.notifications = [newNotif, ...this.notifications.slice(0, 79)];
    this.saveNotifications();

    if (playAudio) {
      this.playNotificationSound();
    }

    // Trigger browser notification
    this.sendBrowserNotification(title, message, newNotif.id);

    // Notify alert listeners
    this.alertListeners.forEach((fn) => fn(newNotif));

    return newNotif;
  }

  public getNotifications(): AppNotification[] {
    return this.notifications;
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifications();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.saveNotifications();
  }

  public clearAll() {
    this.notifications = [];
    this.saveNotifications();
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATION_SOUND_KEY, String(enabled));
    }
    if (enabled) {
      this.playNotificationSound();
    }
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener(this.notifications);
    return () => this.listeners.delete(listener);
  }

  public subscribeNewAlert(listener: NewNotificationAlertListener): () => void {
    this.alertListeners.add(listener);
    return () => this.alertListeners.delete(listener);
  }
}

export const notificationService = new NotificationService();
