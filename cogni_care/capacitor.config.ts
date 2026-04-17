import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cognicare.app',
  appName: 'CogniCare',
  webDir: 'out',
  server: {
    url: 'http://localhost:3001',
    androidScheme: 'http',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound"],
    },
    LocalNotifications: {
      smallIcon: "ic_notif_push",
      iconColor: "#0a2e4d",
    },
  },
};

export default config;
