import { PushNotifications, ActionPerformed, Token } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { API_BASE_URL } from '@/constants/auth';
import { parseChatNotificationPayload, buildChatRoute } from '@/features/care-circle/utils/chatUtils';
import { ChatNotificationData } from '@/features/care-circle/types/chatTypes';
import { CHAT_ENDPOINTS } from '@/features/care-circle/constants/chatConstants';

let isInitialized = false;

export const PushNotificationService = {
  async initialize(userId: string, onNavigate?: (path: string) => void) {
    if (isInitialized) {
      console.log('[PushNotificationService] Already initialized, skipping...');
      return;
    }

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
      await LocalNotifications.createChannel(channel as any); // Capacitor types here are slightly incompatible with their own plugin sometimes, keeping as any is standard practice for this specific cast if it fails, but let's try removing it first. Actually, Capacitor channel type is specific.
      await PushNotifications.createChannel(channel as any);
    }

    // Register with FCM
    await PushNotifications.register();

    // Listen for registration successful
    PushNotifications.addListener('registration', async (token) => {
      console.log('[PushNotificationService] Registration successful, token:', token.value);
      
      try {
        const response = await fetch(`${API_BASE_URL}${CHAT_ENDPOINTS.PUSH_TOKEN}`, {
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
      console.log('[PushNotificationService] Notification received:', notification);
      
      const appState = await App.getState();
      
      // ONLY trigger a manual system popup if the app is ACTIVE (foreground).
      // If it's background/inactive, the OS handles the FCM popup automatically.
      if (appState.isActive) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: notification.title || 'New Notification',
              body: notification.body || '',
              id: Math.floor(Math.random() * 1000000),
              extra: notification.data,
              channelId: 'default',
              smallIcon: 'ic_notif_push',
            }
          ]
        });
      }
    });


    // Handle taps on Push Notifications (Background/Closed state)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('[PushNotificationService] Push Action:', action);
      const data = action.notification.data as ChatNotificationData;
      const chatParams = parseChatNotificationPayload(data);
      
      if (onNavigate) {
        if (chatParams) {
          const route = buildChatRoute(chatParams);
          onNavigate(route);
        } else if (data.logId || data.note_id) {
          const logId = data.logId || data.note_id;
          onNavigate(`/logs?logId=${logId}`);
        } else {
          onNavigate('/logs');
        }
      }
    });

    // Handle taps on Local Notifications (Foreground popup taps)
    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      console.log('[PushNotificationService] Local Action:', action);
      const data = action.notification.extra as ChatNotificationData;
      const chatParams = parseChatNotificationPayload(data);

      if (onNavigate) {
        if (chatParams) {
          const route = buildChatRoute(chatParams);
          onNavigate(route);
        } else if (data.logId || data.note_id) {
          const logId = data.logId || data.note_id;
          onNavigate(`/logs?logId=${logId}`);
        } else {
          onNavigate('/logs');
        }
      }
    });
    isInitialized = true;
  },

  async removeListeners() {
    if (Capacitor.getPlatform() !== 'web') {
      await PushNotifications.removeAllListeners();
      await LocalNotifications.removeAllListeners();
    }
    isInitialized = false;
  }
};


