import { EnvConfig, PROD_CONFIG } from './prod'

export const DEV_CONFIG: EnvConfig = {
  ...PROD_CONFIG,
  domain: 'dev.predictarena.com',
  googleAnalyticsId: '',
  firebaseConfig: {
    apiKey: 'AIzaSyAphygIg142JmBInknbAvkKFdIIQ7UYsMM',
    authDomain: 'predicta-arena-dev.firebaseapp.com',
    projectId: 'predicta-arena-dev',
    region: 'us-central1',
    storageBucket: 'predicta-arena-dev.firebasestorage.app',
    privateBucket: 'predicta-arena-dev-private',
    messagingSenderId: '158987780292',
    appId: '1:158987780292:web:ebf3c50a8265d57aa64991',
    measurementId: '',
  },
  cloudRunId: 'predicta-arena-dev',
  cloudRunRegion: 'us-central1',
  amplitudeApiKey: '',
  supabaseInstanceId: 'jipzwutdrjkleppaqlio',
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppcHp3dXRkcmprbGVwcGFxbGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzI2ODUsImV4cCI6MjA4OTg0ODY4NX0.9DNPgBepn_kP4QOVlpoJ_a6zvqHyUCAx5rIsG3OgsDI',
  twitchBotEndpoint: '',
  apiEndpoint: 'predictarena-api.onrender.com',
  expoConfig: {},
  adminIds: [],
}
