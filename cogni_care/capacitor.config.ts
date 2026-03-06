import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cognicare.app',
  appName: 'CogniCare',
  webDir: 'out',
  server: {
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
