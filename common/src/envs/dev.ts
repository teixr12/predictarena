import { EnvConfig, PROD_CONFIG } from './prod'

export const DEV_CONFIG: EnvConfig = {
  ...PROD_CONFIG,
  domain: 'dev.predictarena.com',
  googleAnalyticsId: '',
  firebaseConfig: {
    apiKey: 'AIzaSyBoq3rzUa8Ekyo3ZaTnlycQYPRCA26VpOw', // TODO: Replace with PREDICTA Arena dev Firebase
    authDomain: 'dev-mantic-markets.firebaseapp.com', // TODO: Replace
    projectId: 'dev-mantic-markets', // TODO: Replace
    region: 'us-central1',
    storageBucket: 'dev-mantic-markets.appspot.com', // TODO: Replace
    privateBucket: 'dev-mantic-markets-private', // TODO: Replace
    messagingSenderId: '134303100058', // TODO: Replace
    appId: '1:134303100058:web:27f9ea8b83347251f80323', // TODO: Replace
    measurementId: 'G-YJC9E37P37', // TODO: Replace
  },
  cloudRunId: 'w3txbmd3ba', // TODO: Replace
  cloudRunRegion: 'uc',
  amplitudeApiKey: '',
  supabaseInstanceId: 'mfodonznyfxllcezufgr', // TODO: Replace
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mb2RvbnpueWZ4bGxjZXp1ZmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njc5ODgxNjcsImV4cCI6MTk4MzU2NDE2N30.RK8CA3G2_yccgiIFoxzweEuJ2XU5SoB7x7wBzMKitvo', // TODO: Replace
  twitchBotEndpoint: '',
  apiEndpoint: 'api.dev.predictarena.com',
  expoConfig: {},
  adminIds: [
    // TODO: Add dev admin IDs
  ],
}
