import { escapeRegExp } from 'lodash'
import { DEV_CONFIG } from './dev'
import { EnvConfig, PROD_CONFIG } from './prod'

const requestedEnv = process.env.NEXT_PUBLIC_FIREBASE_ENV ?? 'PROD'
const isVercelProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
export const ENV = (isVercelProd ? 'PROD' : requestedEnv) as 'PROD' | 'DEV'

export const CONFIGS: { [env: string]: EnvConfig } = {
  PROD: PROD_CONFIG,
  DEV: DEV_CONFIG,
}

export const TWOMBA_CASHOUT_ENABLED = false
export const SWEEP_PRODUCTION_ENABLED = false
export const SPICE_PRODUCTION_ENABLED = false
export const SPICE_TO_MANA_CONVERSION_RATE = 1
export const CASH_TO_MANA_CONVERSION_RATE = 100
export const MIN_CASH_DONATION = 25
export const MIN_SPICE_DONATION = 25000
export const CASH_TO_CHARITY_DOLLARS = 1
export const NY_FL_CASHOUT_LIMIT = 5000
export const DOLLAR_PURCHASE_LIMIT = 5000

export const SPICE_NAME = 'Bonus Credit'
export const SWEEPIES_NAME = 'credits'
export const SPICE_MARKET_TOOLTIP = `Bonus market! Earn extra credits on resolution`
export const SWEEPIES_MARKET_TOOLTIP = `Practice market! Sharpen your prediction skills.`
export const CASH_SUFFIX = '--cash'

export const TRADE_TERM = 'predict'
export const TRADED_TERM = 'predicted'
export const TRADING_TERM = 'predicting'
export const TRADER_TERM = 'predictor'

export const ENV_CONFIG = CONFIGS[ENV] ?? PROD_CONFIG

export function isAdminId(id: string) {
  return ENV_CONFIG.adminIds.includes(id)
}

export function isModId(id: string) {
  return MOD_IDS.includes(id)
}
export function isSweepstakesModId(id: string) {
  return SWEEPSTAKES_MOD_IDS.includes(id)
}
export const DOMAIN = ENV_CONFIG.domain
export const FIREBASE_CONFIG = ENV_CONFIG.firebaseConfig
export const PROJECT_ID = ENV_CONFIG.firebaseConfig.projectId
export const IS_PRIVATE_PREDICTA = ENV_CONFIG.visibility === 'PRIVATE'

export const AUTH_COOKIE_NAME = `FBUSER_${PROJECT_ID.toUpperCase().replace(
  /-/g,
  '_'
)}`

// PREDICTA Arena domain or any subdomains thereof
export const CORS_ORIGIN_MANIFOLD = new RegExp(
  '^https?://(?:[a-zA-Z0-9\\-]+\\.)*' + escapeRegExp(ENV_CONFIG.domain) + '$'
)

export const CORS_ORIGIN_CHARITY = new RegExp(
  '^https?://(?:[a-zA-Z0-9\\-]+\\.)*' + escapeRegExp('manifund.org') + '$'
)

// Vercel deployments, used for testing.
export const CORS_ORIGIN_VERCEL = new RegExp(
  '^https?://[a-zA-Z0-9\\-]+' + escapeRegExp('predicta-arena.vercel.app') + '$'
)
// Any localhost server on any port
export const CORS_ORIGIN_LOCALHOST = /^http:\/\/localhost:\d+$/

// TODO: These should maybe be part of the env config?
export const BOT_USERNAMES: string[] = ['PredictaBot']

// TODO: Add PREDICTA Arena moderator user IDs
export const MOD_IDS: string[] = ['Q1p1thjviqU9Fd5yzT0mlgR2Jr53']

// TODO: Add PREDICTA Arena sweepstakes moderator IDs
export const SWEEPSTAKES_MOD_IDS: string[] = ['Q1p1thjviqU9Fd5yzT0mlgR2Jr53']

// TODO: Add PREDICTA Arena MVP users
export const MVP: string[] = []

// TODO: Add PREDICTA Arena verified usernames
export const VERIFIED_USERNAMES: string[] = []

export const BANNED_TRADING_USER_IDS: string[] = []

export const PARTNER_USER_IDS: string[] = []

// TODO: Add PREDICTA Arena new user helper IDs
export const NEW_USER_HERLPER_IDS: string[] = []

export const OPTED_OUT_OF_LEAGUES: string[] = []

export const HIDE_FROM_LEADERBOARD_USER_IDS: string[] = []

export const INSTITUTIONAL_PARTNER_USER_IDS: string[] = []

export const BEING_DEAD_HEADS: string[] = []

export const HOUSE_BOT_USERNAME = 'acc'

export function supabaseUserConsolePath(userId: string) {
  const tableId = ENV === 'DEV' ? 19247 : 25916
  return `https://supabase.com/dashboard/project/${ENV_CONFIG.supabaseInstanceId}/editor/${tableId}/?filter=id%3Aeq%3A${userId}`
}

export function supabasePrivateUserConsolePath(userId: string) {
  const tableId = ENV === 'DEV' ? 2189688 : 153495548
  return `https://supabase.com/dashboard/project/${ENV_CONFIG.supabaseInstanceId}/editor/${tableId}/?filter=id%3Aeq%3A${userId}`
}

export function supabaseConsoleContractPath(contractId: string) {
  const tableId = ENV === 'DEV' ? 19254 : 25924
  return `https://supabase.com/dashboard/project/${ENV_CONFIG.supabaseInstanceId}/editor/${tableId}?filter=id%3Aeq%3A${contractId}`
}

export function supabaseConsoleTxnPath(txnId: string) {
  const tableId = ENV === 'DEV' ? 20014 : 25940
  return `https://supabase.com/dashboard/project/${ENV_CONFIG.supabaseInstanceId}/editor/${tableId}?filter=id%3Aeq%3A${txnId}`
}

export const GOOGLE_PLAY_APP_URL = '' // TODO: Add if mobile app is built
export const APPLE_APP_URL = '' // TODO: Add if mobile app is built

export const TEN_YEARS_SECS = 60 * 60 * 24 * 365 * 10

export const DESTINY_GROUP_SLUG = 'destinygg'
export const PROD_MANIFOLD_LOVE_GROUP_SLUG = 'predictarena-relationships'

export const RATING_GROUP_SLUGS = ['nonpredictive', 'unsubsidized']

export const GROUP_SLUGS_TO_IGNORE_IN_MARKETS_EMAIL = [
  'bugs',
  ...RATING_GROUP_SLUGS,
  DESTINY_GROUP_SLUG,
  PROD_MANIFOLD_LOVE_GROUP_SLUG,
]

// - Hide markets from signed-out landing page
// - Hide from onboarding topic selector
// - De-emphasize markets in the very first feed items generated for new users
export const HIDE_FROM_NEW_USER_SLUGS = [
  'fun',
  'selfresolving',
  'experimental',
  'trading-bots',
  'gambling',
  'free-money',
  'mana',
  'whale-watching',
  'spam',
  'test',
  'no-resolution',
  'eto',
  'friend-stocks',
  'ancient-markets',
  'jokes',
  'planecrash',
  'glowfic',
  'all-stonks',
  'the-market',
  'nonpredictive-profits',
  'personal-goals',
  'personal',
  'rationalussy',
  'nsfw',
  'bugs',
  'new-years-resolutions-2024',
  'metamarkets',
  'metaforecasting',
  'death-markets',
  ...GROUP_SLUGS_TO_IGNORE_IN_MARKETS_EMAIL,
]

export const GROUP_SLUGS_TO_NOT_INTRODUCE_IN_FEED = [
  'rationalussy',
  'nsfw',
  'planecrash',
  'glowfic',
  'no-resolution',
  'the-market',
  'spam',
  'test',
  'eto',
  'friend-stocks',
  'testing',
  'all-stonks',
  PROD_MANIFOLD_LOVE_GROUP_SLUG,
]

export const EXTERNAL_REDIRECTS = ['/umami']

// TODO: Add Discord invite link when community is set up
export const DISCORD_INVITE_LINK = ''
export const DISCORD_BOT_INVITE_LINK = '' // TODO: Create PREDICTA Arena Discord bot

export const YES_GRAPH_COLOR = '#11b981'

export const RESERVED_PATHS = [
  '_next',
  'about',
  'ad',
  'add-funds',
  'ads',
  'activity',
  'analytics',
  'api',
  'browse',
  'calibration',
  'calculator',
  'card',
  'cards',
  'career',
  'careers',
  'charity',
  'checkout',
  'common',
  'comments',
  'complexsystems',
  'contact',
  'contacts',
  'cowp',
  'create',
  'create-post',
  'date-docs',
  'dashboard',
  'discord',
  'discord-bot',
  'dream',
  'embed',
  'facebook',
  'feed',
  'find',
  'github',
  'google',
  'group',
  'groups',
  'help',
  'home',
  'jobs',
  'kalshi-prep',
  'lab',
  'leaderboard',
  'leaderboards',
  'league',
  'leagues',
  'link',
  'linkAccount',
  'links',
  'live',
  'login',
  'lootbox',
  'mana-auction',
  'manachan',
  'manifest',
  'markets',
  'me',
  'messages',
  'mtg',
  'my-calibration',
  'news',
  'notifications',
  'og-test',
  'pakman',
  'payments',
  'portfolio',
  'posts',
  'predictle',
  'press',
  'privacy',
  'profile',
  'public',
  'questions',
  'referral',
  'referrals',
  'redeem',
  'register-on-discord',
  'reports',
  'send',
  'server-sitemap',
  'shop',
  'sign-in',
  'sign-in-waiting',
  'sitemap',
  'slack',
  'stats',
  'styles',
  'supporter',
  'swipe',
  'team',
  'terms',
  'todo',
  'tournament',
  'tournaments',
  'twitch',
  'twitter',
  'umami',
  'user',
  'users',
  'versus',
  'web',
  'websocket-live',
  'welcome',
  'welcomeoffer',
  'wrapped',
  'yc-s23',
]

export const CREDITS_PURCHASE_RATE_CHANGE_DATE = new Date('2024-05-16T18:20:00Z')
export const CREDITS_PURCHASE_RATE_REVERT_DATE = new Date('2024-09-17T17:06:00Z')
