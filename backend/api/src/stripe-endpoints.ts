import * as admin from 'firebase-admin'
import Stripe from 'stripe'
import { Request, Response } from 'express'

import {
  BOOST_CONTRACT_SUBSIDY_MANA,
  BOOST_PAYMENT_TYPE,
  BOOST_PURCHASE_EVENT_NAMES,
  contractBoostAddsSubsidy,
} from 'common/boost'
import { getPrivateUser, getUser, isProd, log } from 'shared/utils'
import { sendThankYouEmail } from 'shared/emails'
import { trackPublicEvent } from 'shared/analytics'
import { APIError } from 'common/api/utils'
import { addHouseSubsidy } from 'shared/helpers/add-house-subsidy'
import { runTxnInBetQueue } from 'shared/txn/run-txn'
import { createSupabaseDirectClient } from 'shared/supabase/init'
import { updateUser } from 'shared/supabase/users'
import {
  WEB_PRICES,
  DEV_PRO_SUBSCRIPTION_STRIPE_PRICE_ID,
  PROD_PRO_SUBSCRIPTION_STRIPE_PRICE_ID,
  DEV_PREMIUM_SUBSCRIPTION_STRIPE_PRICE_ID,
  PROD_PREMIUM_SUBSCRIPTION_STRIPE_PRICE_ID,
} from 'common/economy'
import { getContract } from 'shared/utils'
import { boostContractImmediately } from 'shared/supabase/contracts'
import { getPost } from 'shared/supabase/posts'
import { boostPostImmediately } from './purchase-boost'

export type StripeSession = Stripe.Event.Data.Object & {
  id: string
  metadata: {
    userId: string
    priceInDollars?: string
    boostId?: string
    contractId?: string
    postId?: string
    subscriptionTier?: string
    entitlementId?: string
  }
}

export type StripeTransaction = {
  userId: string
  manticDollarQuantity: number
  manaDepositAmount?: number
  priceInDollars?: number
  sessionId: string
  session: StripeSession
  timestamp: number
}

const initStripe = () => {
  const apiKey = process.env.STRIPE_APIKEY as string
  return new Stripe(apiKey, { apiVersion: '2020-08-27', typescript: true })
}

export const createcheckoutsession = async (req: Request, res: Response) => {
  const userId = req.query.userId?.toString()

  const priceInDollars = req.query.priceInDollars?.toString()

  if (!userId) {
    res.status(400).send('Invalid user ID')
    return
  }
  if (!priceInDollars) {
    res.status(400).send('Must specify manifold price in dollars')
    return
  }
  const price = WEB_PRICES.find(
    (p) => p.priceInDollars === Number.parseInt(priceInDollars)
  )
  if (!price || !price.devStripeId || !price.prodStripeId) {
    res.status(400).send('Invalid price in dollars')
    return
  }
  const priceId = isProd() ? price.prodStripeId : price.devStripeId

  const referrer =
    req.query.referer || req.headers.referer || 'https://predictarena.com'

  const stripe = initStripe()
  const session = await stripe.checkout.sessions.create({
    metadata: {
      userId,
      priceInDollars: price.priceInDollars,
    },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    allow_promotion_codes: true,
    success_url: `${referrer}?purchaseSuccess=true`,
    cancel_url: `${referrer}?purchaseSuccess=false`,
  })

  res.redirect(303, session.url || '')
}

export const stripewebhook = async (req: Request, res: Response) => {
  const stripe = initStripe()
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'] as string,
      process.env.STRIPE_WEBHOOKSECRET as string
    )
  } catch (e: any) {
    log(`Webhook Error: ${e.message}`)
    res.status(400).send(`Webhook Error: ${e.message}`)
    return
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as StripeSession
    if (
      session.metadata.boostId &&
      (session.metadata.contractId || session.metadata.postId)
    ) {
      await handleBoostPayment(session)
    } else if (session.metadata.subscriptionTier) {
      await handleSubscriptionCheckout(session)
    } else {
      await issueMoneys(session)
    }
  } else if (
    event.type === 'customer.subscription.deleted' ||
    event.type === 'customer.subscription.updated'
  ) {
    const subscription = event.data.object as Stripe.Subscription
    await handleSubscriptionChange(subscription, event.type)
  }

  res.status(200).send('success')
}

const issueMoneys = async (session: StripeSession) => {
  const { id: sessionId } = session
  const { userId, priceInDollars } = session.metadata
  if (priceInDollars === undefined) {
    log('skipping session', sessionId, '; no mana amount')
    return
  }
  const price = Number.parseInt(priceInDollars)
  const deposit = WEB_PRICES.find(
    (p) => p.priceInDollars === Number.parseInt(priceInDollars)
  )?.mana
  if (!deposit) {
    throw new APIError(500, 'Invalid deposit amount')
  }
  log('priceInDollars', priceInDollars, 'deposit', deposit)

  // TODO kill firestore collection when we get off stripe. too lazy to do it now
  const id = await firestore.runTransaction(async (trans) => {
    const query = await trans.get(
      firestore
        .collection('stripe-transactions')
        .where('sessionId', '==', sessionId)
    )
    if (!query.empty) {
      log('session', sessionId, 'already processed')
      return false
    }
    const stripeDoc = firestore.collection('stripe-transactions').doc()
    trans.set(stripeDoc, {
      userId,
      manticDollarQuantity: deposit,
      priceInDollars,
      manaDepoitAmount: deposit,
      sessionId,
      session,
      timestamp: Date.now(),
    })

    return stripeDoc.id
  })
  if (!id) return

  const pg = createSupabaseDirectClient()

  const manaPurchaseTxn = {
    fromId: 'EXTERNAL',
    fromType: 'BANK',
    toId: userId,
    toType: 'USER',
    amount: deposit,
    token: 'M$',
    category: 'MANA_PURCHASE',
    data: { stripeTransactionId: id, type: 'stripe', paidInCents: price },
    description: `Deposit for mana purchase`,
  } as const

  let success = false
  try {
    await pg.tx(async (tx) => {
      await runTxnInBetQueue(tx, manaPurchaseTxn)
      await updateUser(tx, userId, {
        purchasedMana: true,
      })
    })
    success = true
  } catch (e) {
    log.error(
      'Must reconcile stripe-transactions with purchase txns. User may not have received mana!'
    )
    if (e instanceof APIError) {
      log.error('APIError in runTxn: ' + e.message)
    }
    log.error('Unknown error in runTxnFromBank' + e)
  }

  if (success) {
    log('user', userId, 'paid M$', deposit)
    const user = await getUser(userId)
    if (!user) {
      throw new APIError(500, 'User not found')
    }

    const privateUser = await getPrivateUser(userId)
    if (!privateUser) throw new APIError(500, 'Private user not found')

    await sendThankYouEmail(user, privateUser)
    log('stripe revenue', price)

    await trackPublicEvent(
      userId,
      'M$ purchase',
      { amount: deposit, sessionId, priceInDollars },
      { revenue: price }
    )
  }
}

// Grants a supporter entitlement when a subscription checkout completes
const handleSubscriptionCheckout = async (session: StripeSession) => {
  const { userId, entitlementId } = session.metadata
  if (!userId || !entitlementId) {
    log.error('Missing userId or entitlementId in subscription checkout metadata')
    return
  }

  log(`Granting subscription entitlement ${entitlementId} to user ${userId}`)
  const pg = createSupabaseDirectClient()

  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
  const expiresTime = new Date(Date.now() + THIRTY_DAYS_MS)

  // Remove any existing supporter entitlements and grant the new one
  // Also tag the subscription with userId so future webhook events can find the user
  const subscriptionId = (session as any).subscription
  if (subscriptionId) {
    try {
      const stripe = initStripe()
      await stripe.subscriptions.update(subscriptionId, {
        metadata: { userId },
      })
    } catch (e) {
      log(`Warning: could not tag subscription ${subscriptionId} with userId: ${e}`)
    }
  }

  await pg.tx(async (tx) => {
    await tx.none(
      `DELETE FROM user_entitlements
       WHERE user_id = $1
       AND entitlement_id IN ('supporter-basic', 'supporter-plus', 'supporter-premium')`,
      [userId]
    )
    await tx.none(
      `INSERT INTO user_entitlements (user_id, entitlement_id, expires_time, enabled, auto_renew, stripe_managed)
       VALUES ($1, $2, $3, true, true, true)
       ON CONFLICT (user_id, entitlement_id) DO UPDATE SET
         expires_time = EXCLUDED.expires_time,
         enabled = true,
         auto_renew = true,
         stripe_managed = true`,
      [userId, entitlementId, expiresTime]
    )
  })

  log(`Successfully granted ${entitlementId} to user ${userId} until ${expiresTime.toISOString()}`)

  // Track the subscription purchase event
  await trackPublicEvent(userId, 'subscription purchase', {
    entitlementId,
    sessionId: session.id,
  })
}

const handleBoostPayment = async (session: StripeSession) => {
  const { boostId, contractId, postId, userId } = session.metadata
  if (!boostId || (!contractId && !postId) || !userId) {
    log.error('Invalid boost payment metadata', session.metadata)
    throw new APIError(400, 'Invalid boost payment metadata')
  }

  const pg = createSupabaseDirectClient()

  const { boost, wasJustFunded } = await pg.tx(async (tx) => {
    const updatedBoost = await tx.oneOrNone(
      `update contract_boosts 
         set funded = true 
         where id = $1 and user_id = $2 and (
           (contract_id = $3 and post_id is null) or 
           (post_id = $4 and contract_id is null)
         )
         and not funded
         returning *`,
      [boostId, userId, contractId ?? null, postId ?? null]
    )
    if (updatedBoost) return { boost: updatedBoost, wasJustFunded: true }

    const existingBoost = await tx.oneOrNone(
      `select *
       from contract_boosts
       where id = $1 and user_id = $2 and (
         (contract_id = $3 and post_id is null) or
         (post_id = $4 and contract_id is null)
       )`,
      [boostId, userId, contractId ?? null, postId ?? null]
    )
    if (!existingBoost) {
      throw new APIError(404, 'Boost not found')
    }
    return { boost: existingBoost, wasJustFunded: false }
  })

  if (!wasJustFunded) return

  let contract
  if (contractId) {
    contract = await getContract(pg, contractId)
    if (!contract) throw new APIError(404, 'Contract not found')
    if (contractBoostAddsSubsidy(contract)) {
      await addHouseSubsidy(contractId, BOOST_CONTRACT_SUBSIDY_MANA)
    }
  }

  if (new Date(boost.start_time) <= new Date()) {
    if (contract) {
      await boostContractImmediately(pg, contract)
    }
    if (postId) {
      const post = await getPost(pg, postId)
      if (!post) throw new APIError(404, 'Post not found')
      await boostPostImmediately(pg, post)
    }
  }

  await trackPublicEvent(
    userId,
    BOOST_PURCHASE_EVENT_NAMES[contractId ? 'contract' : 'post'],
    {
      contractId,
      postId,
      boostId,
      paymentMethod: BOOST_PAYMENT_TYPE.CASH,
    }
  )
}

const handleSubscriptionChange = async (
  subscription: Stripe.Subscription,
  eventType: string
) => {
  const userId = subscription.metadata?.userId
  if (!userId) {
    log(`No userId in subscription metadata for ${subscription.id} — cannot process ${eventType}`)
    return
  }

  const pg = createSupabaseDirectClient()

  if (eventType === 'customer.subscription.deleted') {
    // Subscription cancelled — disable all supporter entitlements for this user
    await pg.none(
      `UPDATE user_entitlements
       SET enabled = false, auto_renew = false
       WHERE user_id = $1
       AND entitlement_id IN ('supporter-basic', 'supporter-plus', 'supporter-premium')
       AND stripe_managed = true`,
      [userId]
    )
    log(`Disabled Stripe-managed entitlements for user ${userId} (subscription cancelled)`)
  } else if (eventType === 'customer.subscription.updated') {
    // Subscription updated (e.g. plan change) — extend expiry if still active
    if (subscription.status === 'active') {
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
      await pg.none(
        `UPDATE user_entitlements
         SET expires_time = $1, enabled = true
         WHERE user_id = $2
         AND stripe_managed = true
         AND entitlement_id IN ('supporter-basic', 'supporter-plus', 'supporter-premium')`,
        [currentPeriodEnd, userId]
      )
      log(`Extended entitlement expiry for user ${userId} to ${currentPeriodEnd.toISOString()}`)
    }
  }
}

const firestore = admin.firestore()

// Subscription tier config for Stripe subscription checkout
const SUBSCRIPTION_TIERS: Record<
  'pro' | 'premium',
  { devPriceId: string; prodPriceId: string; entitlementId: string }
> = {
  pro: {
    devPriceId: DEV_PRO_SUBSCRIPTION_STRIPE_PRICE_ID,
    prodPriceId: PROD_PRO_SUBSCRIPTION_STRIPE_PRICE_ID,
    entitlementId: 'supporter-plus',
  },
  premium: {
    devPriceId: DEV_PREMIUM_SUBSCRIPTION_STRIPE_PRICE_ID,
    prodPriceId: PROD_PREMIUM_SUBSCRIPTION_STRIPE_PRICE_ID,
    entitlementId: 'supporter-premium',
  },
}

// Creates a Stripe Checkout session for a recurring subscription (Pro or Premium tier)
export const createsubscriptioncheckoutsession = async (
  req: Request,
  res: Response
) => {
  const userId = req.query.userId?.toString()
  const tier = req.query.tier?.toString() as 'pro' | 'premium' | undefined

  if (!userId) {
    res.status(400).send('Invalid user ID')
    return
  }
  if (!tier || !SUBSCRIPTION_TIERS[tier]) {
    res.status(400).send('Must specify a valid tier (pro or premium)')
    return
  }

  const tierConfig = SUBSCRIPTION_TIERS[tier]
  const priceId = isProd() ? tierConfig.prodPriceId : tierConfig.devPriceId

  if (priceId.startsWith('TODO_')) {
    res
      .status(503)
      .send('Subscriptions not yet configured. Please check back soon.')
    return
  }

  const referrer =
    req.query.referer || req.headers.referer || 'https://predictarena.com'

  const stripe = initStripe()
  const session = await stripe.checkout.sessions.create({
    metadata: {
      userId,
      subscriptionTier: tier,
      entitlementId: tierConfig.entitlementId,
    },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: `${referrer}?subscriptionSuccess=true&tier=${tier}`,
    cancel_url: `${referrer}?subscriptionSuccess=false`,
  })

  res.redirect(303, session.url || '')
}
