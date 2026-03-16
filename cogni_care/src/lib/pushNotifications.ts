import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { API_BASE_URL } from '@/constants/auth';

export const PushNotificationService = {
  async initialize(userId: string, onNavigate?: (path: string) => void) {
    if (Capacitor.getPlatform() === 'web') {
      console.log('[PushNotificationService] Push notifications not supported on web');
      return;
    }

    // Request permissions for both Push and Local notifications
    let pushPerms = await PushNotifications.checkPermissions();
    if (pushPerms.receive === 'prompt') {
      pushPerms = await PushNotifications.requestPermissions();
    }

    let localPerms = await LocalNotifications.checkPermissions();
    if (localPerms.display === 'prompt') {
      localPerms = await LocalNotifications.requestPermissions();
    }

    if (pushPerms.receive !== 'granted') {
      console.warn('[PushNotificationService] Push notification permission not granted');
      return;
    }

    // Create Android notification channel for foreground/background alerts
    if (Capacitor.getPlatform() === 'android') {
      const channel = {
        id: 'default',
        name: 'Default Channel',
        importance: 5, // Importance level 5 = High (Heads-up)
        description: 'Critical notifications for carer logs',
        sound: 'beep.wav',
        visibility: 1,
        vibration: true,
      };
      // Register channel for BOTH local and push plugins
      await LocalNotifications.createChannel(channel as any);
      await PushNotifications.createChannel(channel as any);
    }

    // Register with FCM
    await PushNotifications.register();

    // Listen for registration successful
    PushNotifications.addListener('registration', async (token) => {
      console.log('[PushNotificationService] Registration successful, token:', token.value);
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/push-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, pushToken: token.value }),
        });

        const data = await response.json();
        if (data.success) {
          console.log('[PushNotificationService] Token saved');
        } else {
          console.error('[PushNotificationService] Failed to save token:', data.error);
        }
      } catch (error) {
        console.error('[PushNotificationService] Network error saving token:', error);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('[PushNotificationService] Registration error:', error);
    });

    // Listen for notification arrival (when app is foreground)
    PushNotifications.addListener('pushNotificationReceived', async (notification) => {
      console.log('[PushNotificationService] Notification received in foreground:', notification);
      
      // Manual trigger of a system popup since Android doesn't show FCM popups in foreground
      await LocalNotifications.schedule({
        notifications: [
          {
            title: notification.title || 'New Notification',
            body: notification.body || '',
            id: Math.floor(Math.random() * 1000000),
            extra: notification.data,
            channelId: 'default',
          }
        ]
      });
    });

    const getTargetId = (data: any) => {
      if (!data) return null;
      let parsedData = data;
      // Some platforms stringify the data object inside the notification data
      if (typeof data === 'string') {
        try { parsedData = JSON.parse(data); } catch (e) { return null; }
      }
      return parsedData.logId || parsedData.note_id || null;
    };

    // Handle taps on Push Notifications (Background/Closed state)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[PushNotificationService] Push Action:', action);
      const targetId = getTargetId(action.notification.data);
      
      if (targetId && onNavigate) {
        onNavigate(`/logs?logId=${targetId}`);
      } else if (onNavigate) {
        onNavigate('/logs');
      }
    });

    // Handle taps on Local Notifications (Foreground popup taps)
    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      console.log('[PushNotificationService] Local Action:', action);
      const targetId = getTargetId(action.notification.extra);

      if (targetId && onNavigate) {
        onNavigate(`/logs?logId=${targetId}`);
      } else if (onNavigate) {
        onNavigate('/logs');
      }
    });
  },

  async removeListeners() {
    if (Capacitor.getPlatform() !== 'web') {
      await PushNotifications.removeAllListeners();
      await LocalNotifications.removeAllListeners();
    }
  }
};


