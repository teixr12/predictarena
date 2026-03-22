import { createSupabaseDirectClient } from 'shared/supabase/init'
import { promptClaude, models } from 'shared/helpers/claude'
import { parseAIResponseAsJson } from 'shared/helpers/gemini'
import { log } from 'shared/utils'
import { createMarketHelper } from 'api/create-market'
import { MANIFOLD_USER_USERNAME } from 'common/user'
import { DAY_MS } from 'common/util/time'

const SYSTEM_PROMPT = `You are a prediction market designer for PREDICTA Arena, a play-money forecasting training platform.
Your job is to generate engaging, well-calibrated binary (YES/NO) prediction questions that will help users practice forecasting skills.

GUIDELINES:
- Questions should be about real-world events in politics, economics, technology, sports, or science
- Questions must have clear, verifiable resolution criteria with specific sources
- Aim for questions where the probability is roughly 20-80% (not too obvious)
- Questions should resolve within 1-6 months from today
- Avoid duplicate topics from the same category
- Focus on Kalshi-style questions that mirror real money prediction markets
- Include a mix of short-term (1 month) and medium-term (3-6 month) questions`

type MarketSpec = {
  question: string
  description: string
  closeDate: string // ISO date string, e.g. "2026-06-01"
  initialProb: number // 1-99
  category: string
}

async function generateMarketSpecs(): Promise<MarketSpec[]> {
  const today = new Date().toISOString().split('T')[0]
  const sixMonthsOut = new Date(Date.now() + 6 * 30 * DAY_MS)
    .toISOString()
    .split('T')[0]

  const prompt = `Today is ${today}. Generate exactly 5 binary prediction market questions for PREDICTA Arena.

Return a JSON array with exactly 5 objects. Each object must have:
- "question": The market title as a yes/no question (max 120 chars)
- "description": Resolution criteria (2-4 sentences) with a source URL
- "closeDate": ISO date string when the market closes (between 30-180 days from today, before ${sixMonthsOut})
- "initialProb": Starting probability as integer 1-99 (avoid 50, aim for calibrated estimate)
- "category": One of: Politics, Economics, Technology, Science, Sports, World Events

Example format:
[
  {
    "question": "Will the Federal Reserve cut interest rates in Q2 2026?",
    "description": "Resolves YES if the Federal Reserve announces at least one rate cut at the May or June 2026 FOMC meeting. Source: https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
    "closeDate": "2026-07-01",
    "initialProb": 45,
    "category": "Economics"
  }
]

Return only the JSON array, no other text.`

  const response = await promptClaude(prompt, {
    system: SYSTEM_PROMPT,
    model: models.haiku,
  })

  return parseAIResponseAsJson<MarketSpec[]>(response)
}

export async function generateDailyMarkets() {
  if (!process.env.ANTHROPIC_API_KEY) {
    log.error(
      'ANTHROPIC_API_KEY not set — skipping daily market generation. Set it in backend/.env to enable.'
    )
    return
  }

  const pg = createSupabaseDirectClient()

  // Find the PREDICTA Arena system user
  const systemUser = await pg.oneOrNone<{ id: string }>(
    `SELECT id FROM users WHERE username = $1 LIMIT 1`,
    [MANIFOLD_USER_USERNAME]
  )

  if (!systemUser) {
    log.error(
      `System user '${MANIFOLD_USER_USERNAME}' not found — cannot generate daily markets`
    )
    return
  }

  log(`Generating daily AI markets as user ${systemUser.id}`)

  let specs: MarketSpec[]
  try {
    specs = await generateMarketSpecs()
  } catch (e) {
    log.error(`Failed to generate market specs from AI: ${e}`)
    return
  }

  if (!Array.isArray(specs) || specs.length === 0) {
    log.error('AI returned invalid or empty market specs')
    return
  }

  log(`AI generated ${specs.length} market specs`)

  let created = 0
  let failed = 0

  for (const spec of specs) {
    try {
      const closeTime = new Date(spec.closeDate).getTime()
      if (isNaN(closeTime) || closeTime <= Date.now()) {
        log(`Skipping market with invalid close date: ${spec.closeDate}`)
        failed++
        continue
      }

      const initialProb = Math.min(99, Math.max(1, Math.round(spec.initialProb)))

      await createMarketHelper(
        {
          question: spec.question,
          outcomeType: 'BINARY',
          description: undefined,
          descriptionMarkdown: `${spec.description}\n\n*AI-generated market — category: ${spec.category}*`,
          closeTime,
          initialProb,
          visibility: 'public',
          liquidityTier: 100,
        },
        { uid: systemUser.id, creds: null as any }
      )

      log(`Created AI market: "${spec.question}"`)
      created++
    } catch (e) {
      log.error(`Failed to create market "${spec.question}": ${e}`)
      failed++
    }
  }

  log(
    `Daily AI market generation complete: ${created} created, ${failed} failed`
  )
}
