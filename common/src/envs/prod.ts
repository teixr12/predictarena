export type EnvConfig = {
  domain: string
  firebaseConfig: FirebaseConfig
  amplitudeApiKey: string
  supabaseInstanceId: string
  supabaseAnonKey: string
  twitchBotEndpoint: string
  apiEndpoint: string
  googleAnalyticsId: string

  // IDs for v2 cloud functions -- find these by deploying a cloud function and
  // examining the URL, https://[name]-[cloudRunId]-[cloudRunRegion].a.run.app
  cloudRunId: string
  cloudRunRegion: string

  // Access controls
  adminIds: string[]
  visibility: 'PRIVATE' | 'PUBLIC'

  // Branding
  moneyMoniker: string // e.g. 'Ṁ'
  spiceMoniker: string // e.g. 'S'
  bettor: string // e.g. 'predictor'
  nounBet: string // e.g. 'prediction'
  verbPastBet: string // e.g. 'predicted'
  faviconPath: string // Should be a file in /public
  newQuestionPlaceholders: string[]
  expoConfig: {
    iosClientId?: string
    iosClientId2?: string
    expoClientId?: string
    androidClientId?: string
    androidClientId2?: string
  }
}

type FirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  region?: string
  storageBucket: string
  privateBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

export const PROD_CONFIG: EnvConfig = {
  domain: 'predictarena.com',
  amplitudeApiKey: '', // TODO: Add PREDICTA Arena Amplitude key
  supabaseInstanceId: 'jipzwutdrjkleppaqlio',
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppcHp3dXRkcmprbGVwcGFxbGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzI2ODUsImV4cCI6MjA4OTg0ODY4NX0.9DNPgBepn_kP4QOVlpoJ_a6zvqHyUCAx5rIsG3OgsDI',
  googleAnalyticsId: '', // TODO: Add PREDICTA Arena GA ID
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
  twitchBotEndpoint: '', // Not used in PREDICTA Arena
  apiEndpoint: 'predictarena-api.onrender.com',
  cloudRunId: '', // Not used — API is on Render
  cloudRunRegion: '', // Not used — API is on Render

  adminIds: [
    // Add your Firebase UID here after first sign-in
    // Get it from: Supabase dashboard → users table → your row → id column
  ],
  visibility: 'PUBLIC',

  moneyMoniker: 'C',
  spiceMoniker: 'P',
  bettor: 'predictor',
  verbPastBet: 'predicted',
  nounBet: 'prediction',
  faviconPath: '/favicon.ico',
  newQuestionPlaceholders: [
    'Will Bitcoin exceed $150K by end of 2026?',
    'Will the Fed cut rates at the next meeting?',
    'Will SpaceX land humans on Mars by 2030?',
    'Will AI pass the bar exam with 90%+ by 2027?',
  ],
  expoConfig: {},
}
