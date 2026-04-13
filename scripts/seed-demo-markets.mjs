/**
 * PREDICTA Arena — Demo Market Seeder
 * ====================================
 * Populates the platform with 20 realistic prediction markets across 5 categories.
 * Run this once after deploying to give the platform a live feel for first visitors.
 *
 * HOW TO RUN:
 *   FIREBASE_TOKEN=<token> node scripts/seed-demo-markets.mjs
 *
 * HOW TO GET YOUR FIREBASE TOKEN:
 *   1. Log in to predictarena.vercel.app in Chrome
 *   2. Open DevTools → Application → IndexedDB → firebaseLocalStorageDb → firebaseLocalStorage
 *   3. Find your entry and expand the value → copy the field named "stsTokenManager.accessToken"
 *      (or open the Console and run: await firebase.auth().currentUser.getIdToken())
 *
 * The script will print success/failure for each market and a final summary.
 */

const API_BASE = process.env.API_BASE ?? 'https://predictarena-api.onrender.com/v0'
const FIREBASE_TOKEN = process.env.FIREBASE_TOKEN

if (!FIREBASE_TOKEN) {
  console.error('ERROR: FIREBASE_TOKEN env var is required.')
  console.error('Usage: FIREBASE_TOKEN=<token> node scripts/seed-demo-markets.mjs')
  process.exit(1)
}

// Jan 1 2027 00:00:00 UTC in milliseconds
const CLOSE_2027 = new Date('2027-01-01T00:00:00Z').getTime()

// Markets to create — ordered by category
const MARKETS = [
  // ── Politics ──────────────────────────────────────────────────────────────
  {
    question: 'Will Lula complete his full term as Brazilian president (until 2027)?',
    outcomeType: 'BINARY',
    initialProb: 75,
    closeTime: CLOSE_2027,
    descriptionMarkdown: 'Resolves YES if Luiz Inácio Lula da Silva serves as Brazilian president until the end of his current term in January 2027 without resigning, being impeached, or otherwise leaving office early.',
    groupIds: [], // will be filled after group creation
    _category: 'politics',
    liquidityTier: 100,
  },
  {
    question: 'Will Brazil successfully host the 2027 FIFA Club World Cup?',
    outcomeType: 'BINARY',
    initialProb: 88,
    closeTime: CLOSE_2027,
    descriptionMarkdown: 'Resolves YES if Brazil hosts the expanded 32-team FIFA Club World Cup in 2027 as currently scheduled, without the event being moved to another country.',
    groupIds: [],
    _category: 'politics',
    liquidityTier: 100,
  },
  {
    question: 'Will the Brazilian real (BRL) strengthen against USD by end of 2026?',
    outcomeType: 'BINARY',
    initialProb: 35,
    closeTime: new Date('2026-12-31T23:59:59Z').getTime(),
    descriptionMarkdown: 'Resolves YES if 1 USD buys fewer BRL on Dec 31 2026 than it did on Jan 1 2026 (i.e. BRL appreciates vs USD over the year).',
    groupIds: [],
    _category: 'politics',
    liquidityTier: 100,
  },
  {
    question: 'Will a new Brazilian political party win more than 10% of seats in the 2026 federal elections?',
    outcomeType: 'BINARY',
    initialProb: 42,
    closeTime: new Date('2026-10-31T23:59:59Z').getTime(),
    descriptionMarkdown: 'Resolves YES if any party that did not hold seats in the 2022 elections wins more than 10% of Chamber of Deputies seats in the October 2026 elections.',
    groupIds: [],
    _category: 'politics',
    liquidityTier: 100,
  },

  // ── Technology ────────────────────────────────────────────────────────────
  {
    question: 'Will Brazil reach 100 million+ smartphone users by end of 2026?',
    outcomeType: 'BINARY',
    initialProb: 82,
    closeTime: CLOSE_2027,
    descriptionMarkdown: 'Resolves YES if a credible market research report (GSMA, Statista, or similar) confirms Brazil has 100M+ active smartphone users by December 2026.',
    groupIds: [],
    _category: 'technology',
    liquidityTier: 100,
  },
  {
    question: 'Will a Brazilian tech startup reach unicorn status ($1B+ valuation) in 2026?',
    outcomeType: 'BINARY',
    initialProb: 40,
    closeTime: CLOSE_2027,
    descriptionMarkdown: 'Resolves YES if any Brazilian-founded startup achieves a $1 billion+ valuation through a funding round, IPO, or acquisition during 2026.',
    groupIds: [],
    _category: 'technology',
    liquidityTier: 100,
  },
  {
    question: 'Will OpenAI release GPT-5 before July 2026?',
    outcomeType: 'BINARY',
    initialProb: 55,
    closeTime: new Date('2026-07-01T00:00:00Z').getTime(),
    descriptionMarkdown: 'Resolves YES if OpenAI officially releases a model named GPT-5 (or equivalent major next-generation model) publicly before July 1 2026.',
    groupIds: [],
    _category: 'technology',
    liquidityTier: 100,
  },
  {
    question: 'Will PIX process more than 100 billion transactions in 2026?',
    outcomeType: 'BINARY',
    initialProb: 65,
    closeTime: CLOSE_2027,
    descriptionMarkdown: 'Resolves YES if Brazil\'s Banco Central confirms that PIX (the instant payments system) processed 100 billion or more transactions during the 2026 calendar year.',
    groupIds: [],
    _category: 'technology',
    liquidityTier: 100,
  },

  // ── Sports ────────────────────────────────────────────────────────────────
  {
    question: 'Will Brazil qualify for the 2026 FIFA World Cup?',
    outcomeType: 'BINARY',
    initialProb: 94,
    closeTime: new Date('2026-03-31T23:59:59Z').getTime(),
    descriptionMarkdown: 'Resolves YES if the Brazilian national football team qualifies for the 2026 FIFA World Cup (hosted in USA, Canada, Mexico) through CONMEBOL qualification.',
    groupIds: [],
    _category: 'sports',
    liquidityTier: 100,
  },
  {
    question: 'Will Vinicius Jr win the 2026 Ballon d\'Or?',
    outcomeType: 'BINARY',
    initialProb: 52,
    closeTime: new Date('2026-11-30T23:59:59Z').getTime(),
    descriptionMarkdown: 'Resolves YES if Vinicius Jr (Real Madrid / Brazil) wins the 2026 Ballon d\'Or award ceremony.',
    groupIds: [],
    _category: 'sports',
    liquidityTier: 100,
  },
  {
    question: 'Will Flamengo win the 2026 Brasileirão?',
    outcomeType: 'BINARY',
    initialProb: 28,
    closeTime: new Date('2026-12-15T23:59:59Z').getTime(),
    descriptionMarkdown: 'Resolves YES if Clube de Regatas do Flamengo wins the Campeonato Brasileiro Série A 2026.',
    groupIds: [],
    _category: 'sports',
    liquidityTier: 100,
  },
  {
    question: 'Will a Brazilian athlete win a gold medal at the 2028 Los Angeles Olympics?',
    outcomeType: 'BINARY',
    initialProb: 88,
    closeTime: new Date('2028-08-15T23:59:59Z').getTime(),
    descriptionMarkdown: 'Resolves YES if any athlete representing Brazil wins a gold medal at the 2028 Summer Olympics in Los Angeles.',
    groupIds: [],
    _category: 'sports',
    liquidityTier: 100,
  },

  // ── Economics ────────────────────────────────────────────────────────────
  {
    question: 'Will Brazil\'s GDP grow by more than 2% in 2026?',
    outcomeType: 'BINARY',
    initialProb: 62,
    closeTime: new Date('2027-03-31T23:59:59Z').getTime(),
    descriptionMarkdown: 'Resolves YES if Brazil\'s official GDP growth rate for 2026 (as reported by IBGE) exceeds 2.0% in real terms.',
    groupIds: [],
    _category: 'economics',
    liquidityTier: 100,
  },
  {
    question: 'Will inflation (IPCA) in Brazil stay below 5% for all of 2026?',
    outcomeType: 'BINARY',
    initialProb: 55,
    closeTime: CLOSE_2027,
    descriptionMarkdown: 'Resolves YES if Brazil\'s IPCA (consumer price index) 12-month rate stays below 5.0% for every single month of the 2026 calendar year.',
    groupIds: [],
    _category: 'economics',
    liquidityTier: 100,
  },
  {
    question: 'Will Nubank remain the most valuable Brazilian fintech company in 2026?',
    outcomeType: 'BINARY',
    initialProb: 78,
    closeTime: CLOSE_2027,
    descriptionMarkdown: 'Resolves YES if Nubank\'s market capitalization remains higher than any other Brazilian-founded fintech company for the entirety of 2026.',
    groupIds: [],
    _category: 'economics',
    liquidityTier: 100,
  },
  {
    question: 'Will the Brazilian government balance the primary fiscal budget in 2026?',
    outcomeType: 'BINARY',
    initialProb: 38,
    closeTime: new Date('2027-03-31T23:59:59Z').getTime(),
    descriptionMarkdown: 'Resolves YES if Brazil\'s federal government reports a primary fiscal surplus or zero deficit for the 2026 fiscal year, as reported by the Ministry of Finance.',
    groupIds: [],
    _category: 'economics',
    liquidityTier: 100,
  },

  // ── World Events ──────────────────────────────────────────────────────────
  {
    question: 'Will US-China trade tensions escalate significantly in 2026?',
    outcomeType: 'BINARY',
    initialProb: 58,
    closeTime: CLOSE_2027,
    descriptionMarkdown: 'Resolves YES if the US imposes new tariffs of 25%+ on Chinese goods, or China imposes equivalent retaliatory measures, creating a major escalation beyond 2025 levels.',
    groupIds: [],
    _category: 'world',
    liquidityTier: 100,
  },
  {
    question: 'Will the EU AI Act\'s core obligations come into full effect by end of 2026?',
    outcomeType: 'BINARY',
    initialProb: 72,
    closeTime: CLOSE_2027,
    descriptionMarkdown: 'Resolves YES if the EU AI Act\'s main obligations for high-risk AI systems are legally in force across all EU member states by December 31 2026.',
    groupIds: [],
    _category: 'world',
    liquidityTier: 100,
  },
  {
    question: 'Will Bitcoin reach $150,000 USD by end of 2026?',
    outcomeType: 'BINARY',
    initialProb: 45,
    closeTime: CLOSE_2027,
    descriptionMarkdown: 'Resolves YES if Bitcoin\'s spot price trades at or above $150,000 USD on any major exchange (Coinbase, Binance, Kraken) for at least 1 hour before December 31 2026.',
    groupIds: [],
    _category: 'world',
    liquidityTier: 100,
  },
  {
    question: 'Will a ceasefire agreement hold in Ukraine for more than 90 days in 2026?',
    outcomeType: 'BINARY',
    initialProb: 48,
    closeTime: CLOSE_2027,
    descriptionMarkdown: 'Resolves YES if a formal ceasefire agreement between Russia and Ukraine is reached and holds (no major violations) for at least 90 consecutive days during 2026.',
    groupIds: [],
    _category: 'world',
    liquidityTier: 100,
  },
]

// ── Group ID resolution ────────────────────────────────────────────────────
// The API takes groupIds (UUIDs), not slugs. We'll look them up first, or
// skip group assignment if the groups don't exist yet.

async function fetchGroupId(slug) {
  try {
    const res = await fetch(`${API_BASE}/group/${slug}`, {
      headers: { Authorization: `Bearer ${FIREBASE_TOKEN}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.id ?? null
  } catch {
    return null
  }
}

async function createMarket(market, groupIds) {
  const { _category, ...body } = market
  body.groupIds = groupIds.length > 0 ? groupIds : undefined

  try {
    const res = await fetch(`${API_BASE}/market`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FIREBASE_TOKEN}`,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return { ok: false, question: market.question, error: data?.message ?? res.statusText }
    }

    return { ok: true, question: market.question, id: data.id, url: data.url }
  } catch (err) {
    return { ok: false, question: market.question, error: err.message }
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('PREDICTA Arena — Demo Market Seeder')
  console.log('=====================================')
  console.log(`API: ${API_BASE}`)
  console.log(`Markets to create: ${MARKETS.length}\n`)

  // 1. Resolve group IDs
  const CATEGORY_SLUGS = ['politics', 'technology', 'sports', 'economics', 'world']
  const groupIdMap = {}

  console.log('Resolving topic group IDs...')
  await Promise.all(
    CATEGORY_SLUGS.map(async (slug) => {
      const id = await fetchGroupId(slug)
      groupIdMap[slug] = id
      console.log(`  ${slug}: ${id ?? '(not found — will skip group tag)'}`)
    })
  )
  console.log()

  // 2. Create markets sequentially (avoid hammering the API)
  const results = []
  for (const market of MARKETS) {
    const groupId = groupIdMap[market._category]
    const groupIds = groupId ? [groupId] : []

    process.stdout.write(`Creating: "${market.question.slice(0, 70)}..." `)
    const result = await createMarket(market, groupIds)
    results.push(result)

    if (result.ok) {
      console.log(`✅  (id: ${result.id})`)
    } else {
      console.log(`❌  ERROR: ${result.error}`)
    }

    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 300))
  }

  // 3. Summary
  const successes = results.filter((r) => r.ok)
  const failures = results.filter((r) => !r.ok)

  console.log('\n=====================================')
  console.log(`Done. ${successes.length}/${MARKETS.length} markets created.`)

  if (failures.length > 0) {
    console.log('\nFailed markets:')
    failures.forEach((f) => console.log(`  ❌ ${f.question}\n     → ${f.error}`))
  }

  if (successes.length > 0) {
    console.log(`\nView markets at: https://predictarena.vercel.app/browse`)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
