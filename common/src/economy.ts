import { OutcomeType } from 'common/contract'
import {
  answerCostTiers,
  getTierIndexFromLiquidity,
  getTierIndexFromLiquidityAndAnswers,
  liquidityTiers,
} from './tier'

export const DEFAULT_CASH_ANTE = 50
export const MINIMUM_BOUNTY = 1000

export const getAnte = (
  outcomeType: OutcomeType,
  numAnswers: number | undefined,
  liquidityTier: number // this could be 100, 1000, 10000, 100000 (aka tiers)
) => {
  if (outcomeType === 'POLL') {
    return 10
  }

  if (
    outcomeType === 'MULTIPLE_CHOICE' ||
    outcomeType === 'MULTI_NUMERIC' ||
    outcomeType === 'DATE'
  ) {
    const tierIndex = getTierIndexFromLiquidity(liquidityTier)
    return numAnswers
      ? Math.max(numAnswers * answerCostTiers[tierIndex], liquidityTier)
      : liquidityTiers[tierIndex]
  }

  return liquidityTier
}

/* Sweeps bonuses (disabled for PREDICTA Arena) */
export const KYC_VERIFICATION_BONUS_CASH = 0
export const BETTING_STREAK_SWEEPS_BONUS_AMOUNT = 0
export const BETTING_STREAK_SWEEPS_BONUS_MAX = 0

/* Credits bonuses */
export const STARTING_BALANCE = 500
// for sus users, i.e. multiple sign ups for same person
export const SUS_STARTING_BALANCE = 10
export const PHONE_VERIFICATION_BONUS = 500

export const REFERRAL_AMOUNT = 500

const uniqueBettorBonusAmounts = [3, 10, 15, 20]
export const getUniqueBettorBonusAmount = (
  liquidity: number,
  numAnswers: number
) => {
  return uniqueBettorBonusAmounts[
    getTierIndexFromLiquidityAndAnswers(liquidity, numAnswers)
  ]
}

/* Disabled bonuses */
export const NEXT_DAY_BONUS = 100 // Paid on day following signup
export const MARKET_VISIT_BONUS = 100 // Paid on first distinct 5 market visits
export const MARKET_VISIT_BONUS_TOTAL = 500
export const UNIQUE_BETTOR_LIQUIDITY = 20
export const SMALL_UNIQUE_BETTOR_LIQUIDITY = 5
export const MAX_TRADERS_FOR_BIG_BONUS = 50
export const MAX_TRADERS_FOR_BONUS = 10000

export const SUBSIDY_FEE = 0

export const BETTING_STREAK_BONUS_AMOUNT = 50
export const BETTING_STREAK_BONUS_MAX = 50

export const MANACHAN_TWEET_COST = 0 // Disabled for PREDICTA Arena
export const PUSH_NOTIFICATION_BONUS = 500
export const BURN_MANA_USER_ID = 'SlYWAUtOzGPIYyQfXfvmHPt8eu22'

const PaymentAmounts = [
  {
    mana: 500,
    priceInDollars: 4.99,
    bonusInDollars: 0,
    devStripeId: 'price_1TE8vTF2z6lW0LUvf2hVrjMJ',
    prodStripeId: 'price_1TE8vTF2z6lW0LUvf2hVrjMJ',
  },
  {
    mana: 1_200,
    priceInDollars: 9.99,
    bonusInDollars: 0,
    devStripeId: 'price_1TE8x0F2z6lW0LUvoes9qLUz',
    prodStripeId: 'price_1TE8x0F2z6lW0LUvoes9qLUz',
  },
  {
    mana: 3_000,
    priceInDollars: 24.99,
    bonusInDollars: 0,
    devStripeId: 'price_1TE90MF2z6lW0LUvgvaNNZCg',
    prodStripeId: 'price_1TE90MF2z6lW0LUvgvaNNZCg',
  },
]
export type PaymentAmount = (typeof PaymentAmounts)[number] & {
  sku?: string
}

export const WEB_PRICES = PaymentAmounts

export type WebPriceInDollars =
  (typeof PaymentAmounts)[number]['priceInDollars']
export const IOS_PRICES = PaymentAmounts
export const OLD_IOS_PRICES = [
  {
    mana: 1_000,
    priceInDollars: 14.99,
    bonusInDollars: 0,
    sku: 'mana_1000',
  },
  {
    mana: 2_500,
    priceInDollars: 35.99,
    bonusInDollars: 0,
    sku: 'mana_2500',
  },
  {
    mana: 10_000,
    priceInDollars: 142.99,
    bonusInDollars: 0,
    sku: 'mana_10000',
  },
] as PaymentAmount[]
export const MANI_IOS_PRICES = [
  {
    mana: 1000,
    priceInDollars: 9.99,
    bonusInDollars: 0,
    sku: 'S10',
  },
  {
    mana: 2500,
    priceInDollars: 24.99,
    bonusInDollars: 0,
    sku: 'S25',
  },
  {
    mana: 10000,
    priceInDollars: 99.99,
    bonusInDollars: 0,
    sku: 'S100',
  },
] as PaymentAmount[]

// Arena Plus subscription Stripe Price IDs ($9.99/mo recurring)
export const DEV_PRO_SUBSCRIPTION_STRIPE_PRICE_ID =
  'price_1TE90aF2z6lW0LUv72ePYY5T'
export const PROD_PRO_SUBSCRIPTION_STRIPE_PRICE_ID =
  'price_1TE90aF2z6lW0LUv72ePYY5T'
// Arena Premium subscription Stripe Price IDs ($19.99/mo recurring)
export const DEV_PREMIUM_SUBSCRIPTION_STRIPE_PRICE_ID =
  'price_1TE90bF2z6lW0LUvfLThafND'
export const PROD_PREMIUM_SUBSCRIPTION_STRIPE_PRICE_ID =
  'price_1TE90bF2z6lW0LUvfLThafND'

export const SWEEPIES_CASHOUT_FEE = 5
export const MIN_CASHOUT_AMOUNT = 25

export const SWEEPS_MIN_BET = 1
export const MANA_MIN_BET = 1
export const PROFIT_FEE_FRACTION = 0.1
export const BOOST_COST_MANA = 10000
export const DEV_BOOST_STRIPE_PRICE_ID = 'price_1QuI5BGdoFKoCJW7lMjCIuKW'
export const PROD_BOOST_STRIPE_PRICE_ID = 'price_1QuItEGdoFKoCJW7t9qtiGoD'
export const FREE_MARKET_USER_ID = 'rQPOELuW5zaapaNPnBYQBMoonk92' // Tumbles
