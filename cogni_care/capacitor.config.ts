import type { CapacitorConfig } from '@capacitor/cli';

const isDevelopment = process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'com.cognicare.app',
  appName: 'CogniCare',
  webDir: 'out',
  server: isDevelopment && process.env.INTERNAL_DEV_IP ? {
    url: `http://${process.env.INTERNAL_DEV_IP}:3000`,
    cleartext: true
  } : undefined
};

export default config;
