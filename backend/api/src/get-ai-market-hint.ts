import { APIError, type APIHandler } from './helpers/endpoint'
import { createSupabaseDirectClient } from 'shared/supabase/init'
import { getContract } from 'shared/utils'
import { getActiveSupporterEntitlements } from 'shared/supabase/entitlements'
import { isSupporter } from 'common/supporter-config'
import OpenAI from 'openai'

// ── AI Provider ───────────────────────────────────────────────────────
// Uses OpenRouter free tier (DeepSeek-R1 or Qwen3) — zero marginal cost.
// Falls back to Anthropic if ANTHROPIC_API_KEY is set instead.
const FREE_REASONING_MODEL = 'deepseek/deepseek-r1:free'
const FREE_FAST_MODEL = 'qwen/qwen3-32b:free'

// Mana cost per hint for credits-based (non-Stripe) supporters
const AI_HINT_COST_MANA = 50

// Daily rate limits per 24-hour window
const DAILY_LIMIT_PLUS = 50
const DAILY_LIMIT_PREMIUM = 250

function buildOpenRouterClient(): OpenAI | null {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return null
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://predictarena.com',
      'X-Title': 'PREDICTA Arena',
    },
  })
}

async function callAI(prompt: string, system: string): Promise<string> {
  const orClient = buildOpenRouterClient()
  if (orClient) {
    // Try best free reasoning model first, fall back to fast model
    for (const model of [FREE_REASONING_MODEL, FREE_FAST_MODEL]) {
      try {
        const response = await orClient.chat.completions.create({
          model,
          max_tokens: 512,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
        })
        const text = response.choices[0]?.message?.content
        if (text) return text
      } catch {
        continue
      }
    }
  }

  // Fall back to Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    const { promptClaude, models } = await import('shared/helpers/claude')
    return promptClaude(prompt, { model: models.haiku, system })
  }

  throw new APIError(
    503,
    'AI features require OPENROUTER_API_KEY (free at openrouter.ai) or ANTHROPIC_API_KEY in backend/.env'
  )
}

// ── Rate limit + credit deduction ────────────────────────────────────
async function checkAndDeductUsage(
  pg: ReturnType<typeof createSupabaseDirectClient>,
  userId: string,
  isPremium: boolean
): Promise<void> {
  const limit = isPremium ? DAILY_LIMIT_PREMIUM : DAILY_LIMIT_PLUS

  const usedRows = await pg.manyOrNone<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM txns
     WHERE from_id = $1 AND category = 'AI_HINT_USAGE'
       AND created_time >= NOW() - INTERVAL '24 hours'`,
    [userId]
  )
  const used = parseInt(usedRows[0]?.count ?? '0', 10)
  if (used >= limit) {
    throw new APIError(
      429,
      `AI hint limit reached (${used}/${limit} today). ` +
        (isPremium
          ? 'Resets in 24 hours.'
          : 'Upgrade to Arena Premium for higher limits.')
    )
  }

  // Check if Stripe subscriber (hint included in plan — no mana charge)
  const stripeRows = await pg.manyOrNone<{ stripe_managed: boolean }>(
    `SELECT stripe_managed FROM user_entitlements
     WHERE user_id = $1 AND stripe_managed = true
       AND (expires_time IS NULL OR expires_time > NOW())
     LIMIT 1`,
    [userId]
  )
  const isStripePaying = !!stripeRows[0]?.stripe_managed

  if (!isStripePaying) {
    // Credits user: deduct mana atomically — prevents overspend
    const updated = await pg.manyOrNone<{ balance: number }>(
      `UPDATE users SET balance = balance - $1
       WHERE id = $2 AND balance >= $1
       RETURNING balance`,
      [AI_HINT_COST_MANA, userId]
    )
    if (!updated[0]) {
      throw new APIError(
        402,
        `Insufficient credits. AI hints cost ${AI_HINT_COST_MANA} mana. ` +
          `Buy credits at /shop or subscribe at /supporter for unlimited access.`
      )
    }
  }

  // Record usage (amount=0 for Stripe users, AI_HINT_COST_MANA for credits)
  await pg.none(
    `INSERT INTO txns
       (id, from_id, from_type, to_id, to_type, amount, token, category, created_time)
     VALUES
       (gen_random_uuid(), $1, 'USER', 'HOUSE', 'BANK',
        $2, 'M$', 'AI_HINT_USAGE', NOW())`,
    [userId, isStripePaying ? 0 : AI_HINT_COST_MANA]
  )
}

// ── Main handler ──────────────────────────────────────────────────────
export const getAiMarketHint: APIHandler<'get-ai-market-hint'> = async (
  { contractId },
  auth
) => {
  const hasAnyKey =
    !!process.env.OPENROUTER_API_KEY || !!process.env.ANTHROPIC_API_KEY
  if (!hasAnyKey) {
    throw new APIError(
      503,
      'AI features require OPENROUTER_API_KEY (free at openrouter.ai) in backend/.env'
    )
  }

  const pg = createSupabaseDirectClient()

  // Gate: any active supporter tier required
  const entitlements = await getActiveSupporterEntitlements(pg, auth.uid)
  if (!isSupporter(entitlements)) {
    throw new APIError(
      403,
      'AI market hints require an Arena membership. Upgrade at /supporter'
    )
  }

  const isPremium = entitlements.some((e) =>
    (e.entitlement_id ?? '').toLowerCase().includes('premium')
  )

  const contract = await getContract(pg, contractId)
  if (!contract) {
    throw new APIError(404, `Market ${contractId} not found`)
  }

  // Rate limit check + credit deduction (or Stripe pass-through)
  await checkAndDeductUsage(pg, auth.uid, isPremium)

  const closeDate = contract.closeTime
    ? new Date(contract.closeTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'unknown'

  const currentProb = Math.round((contract.probability ?? 0.5) * 100)

  const prompt = `Analyze this prediction market question and provide a concise forecasting hint.

Market: "${contract.question}"
Current market probability: ${currentProb}%
Closes: ${closeDate}
${contract.description ? `Description: ${typeof contract.description === 'string' ? contract.description : JSON.stringify(contract.description)}` : ''}

Provide a 2-4 sentence analysis covering:
1. The key factors that will determine the outcome
2. Whether the current ${currentProb}% probability seems reasonable and why
3. What information a forecaster should look for to refine their estimate

Be specific, analytical, and concise. Do not tell users how to bet — just provide analytical context.`

  const hint = await callAI(
    prompt,
    'You are a professional forecasting analyst on PREDICTA Arena, a prediction market training platform. Provide concise, evidence-based analysis to help users develop forecasting skills. Keep responses under 150 words.'
  )

  return {
    hint: hint.trim(),
    contractId,
  }
}
