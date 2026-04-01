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
  supabaseInstanceId: 'pxidrgkatumlvfqaxcll', // TODO: Replace with PREDICTA Arena Supabase instance
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4aWRyZ2thdHVtbHZmcWF4Y2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njg5OTUzOTgsImV4cCI6MTk4NDU3MTM5OH0.d_yYtASLzAoIIGdXUBIgRAGLBnNow7JG2SoaNMQ8ySg', // TODO: Replace with PREDICTA Arena Supabase anon key
  googleAnalyticsId: '', // TODO: Add PREDICTA Arena GA ID
  firebaseConfig: {
    apiKey: 'AIzaSyDp3J57vLeAZCzxLD-vcPaGIkAmBoGOSYw', // TODO: Replace with PREDICTA Arena Firebase config
    authDomain: 'mantic-markets.firebaseapp.com', // TODO: Replace
    projectId: 'mantic-markets', // TODO: Replace with predicta-arena
    region: 'us-central1',
    storageBucket: 'mantic-markets.appspot.com', // TODO: Replace
    privateBucket: 'mantic-markets-private', // TODO: Replace
    messagingSenderId: '128925704902', // TODO: Replace
    appId: '1:128925704902:web:f61f86944d8ffa2a642dc7', // TODO: Replace
    measurementId: 'G-SSFK1Q138D', // TODO: Replace
  },
  twitchBotEndpoint: '', // Removed - not used in PREDICTA Arena
  apiEndpoint: 'predictarena-api.onrender.com',
  cloudRunId: 'nggbo3neva', // TODO: Replace after deploying cloud functions
  cloudRunRegion: 'uc',

  adminIds: [
    // TODO: Add PREDICTA Arena admin user IDs after first sign-up
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
