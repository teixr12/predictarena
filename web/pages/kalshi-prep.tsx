import { useState } from 'react'
import { Col } from 'web/components/layout/col'
import { Row } from 'web/components/layout/row'
import { Page } from 'web/components/layout/page'
import { SEO } from 'web/components/SEO'
import { Title } from 'web/components/widgets/title'

const TUTORIAL_MODULES = [
  {
    title: 'How Binary Markets Work',
    description:
      'Learn the basics of yes/no prediction markets. Understand how prices reflect probabilities and how to read market odds.',
    icon: '📊',
  },
  {
    title: 'Understanding AMMs',
    description:
      'Automated Market Makers power prediction markets. Learn how liquidity pools work and why prices move when you trade.',
    icon: '⚙️',
  },
  {
    title: 'Limit Orders & Strategy',
    description:
      'Go beyond market orders. Learn to place limit orders, manage risk, and develop a systematic prediction strategy.',
    icon: '🎯',
  },
  {
    title: 'Reading the Odds',
    description:
      'Translate between probability, implied odds, and market prices. Essential for comparing PREDICTA Arena to Kalshi and Polymarket.',
    icon: '📈',
  },
  {
    title: 'Kalshi-Specific Concepts',
    description:
      'CFTC-regulated event contracts, settlement rules, position limits, and how Kalshi differs from play-money markets.',
    icon: '🏛️',
  },
  {
    title: 'Polymarket & XP International',
    description:
      'Crypto-native prediction markets, USDC settlement, and how Polymarket/XP International operate globally.',
    icon: '🌐',
  },
]

export default function KalshiPrepPage() {
  return (
    <Page trackPageView="kalshi prep">
      <SEO
        title="Kalshi Prep"
        description="Train for real prediction markets. Learn the skills you need to trade on Kalshi, Polymarket, and XP International."
        url="/kalshi-prep"
      />
      <Col className="mx-auto max-w-3xl gap-6 px-4 py-6">
        <Col className="gap-2">
          <Title>Kalshi Prep</Title>
          <p className="text-ink-500 text-lg">
            Master prediction markets here, then take your skills to real
            platforms. PREDICTA Arena is your training ground.
          </p>
        </Col>

        {/* Bridge Comparison */}
        <div className="bg-canvas-50 rounded-xl border border-emerald-500/20 p-6">
          <h2 className="mb-4 text-xl font-semibold text-emerald-400">
            Your Bridge to Real Markets
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <ComparisonCard
              platform="PREDICTA Arena"
              type="Practice"
              features={[
                'Play-money credits',
                'Risk-free learning',
                'Foresight Portfolio',
              ]}
              highlight
            />
            <ComparisonCard
              platform="Kalshi"
              type="US Regulated"
              features={[
                'CFTC-regulated',
                'USD settlement',
                'Event contracts',
              ]}
            />
            <ComparisonCard
              platform="Polymarket"
              type="Global Crypto"
              features={[
                'USDC settlement',
                'Global access',
                'High liquidity',
              ]}
            />
          </div>
        </div>

        {/* Tutorial Modules */}
        <Col className="gap-4">
          <h2 className="text-xl font-semibold">Learning Modules</h2>
          {TUTORIAL_MODULES.map((module, i) => (
            <ModuleCard key={i} index={i} module={module} />
          ))}
        </Col>

        {/* Pro Badge Unlock */}
        <div className="bg-canvas-50 border-primary-500/30 rounded-xl border p-6 text-center">
          <div className="mb-2 text-4xl">🏆</div>
          <h3 className="mb-1 text-lg font-bold text-emerald-400">
            Pro Forecaster Badge
          </h3>
          <p className="text-ink-500 text-sm">
            Complete all modules + 25 resolved markets + 60% accuracy to
            unlock the Pro Forecaster badge on your profile.
          </p>
        </div>
      </Col>
    </Page>
  )
}

const MODULE_CONTENT: Record<number, string[]> = {
  0: [
    'A binary prediction market asks a yes/no question: "Will X happen by date Y?" The market price — displayed as a percentage — represents the crowd\'s collective probability estimate. If a market sits at 65%, participants collectively believe there is a 65% chance the event happens.',
    'You buy YES shares if you think the probability is higher than the current price, and NO shares if you think it\'s lower. When the event resolves, YES shareholders get paid if the outcome is YES, and NO shareholders get paid if it\'s NO. Your profit is the difference between your entry price and the resolution price.',
    'Unlike traditional betting, you can exit a position before resolution. If you buy YES at 40% and the market moves to 70%, you can sell your shares for a profit without waiting for the event to resolve. This makes prediction markets more like trading than betting.',
    'On PREDICTA Arena, all markets use play-money credits. Each credit is worth the same whether you\'re betting at 10% or 90%. The key skill is identifying when the market price is wrong relative to your research.',
  ],
  1: [
    'PREDICTA Arena uses an Automated Market Maker (AMM) — specifically a Constant Product Market Maker (CPMM) — to set prices automatically without needing a counterparty. There is always liquidity to trade against, unlike traditional order books where you might wait for a match.',
    'The AMM holds a pool of YES and NO shares. When you buy YES, the ratio of YES to NO in the pool shifts, making YES shares more expensive and NO shares cheaper. This is why large trades move the price more than small ones — you\'re buying from an increasingly depleted side of the pool.',
    'The "slippage" you see on large trades is this price impact. On Kalshi and Polymarket, you\'ll encounter similar dynamics. Practice on PREDICTA Arena to develop intuition for how much a trade of a given size will move the market, and whether that price impact is worth it.',
    'One practical implication: splitting a large position into several smaller trades over time often gets you a better average price. Watch how the market price moves as you trade on PREDICTA Arena to build this intuition before you use real money.',
  ],
  2: [
    'A limit order lets you specify the exact price you\'re willing to pay. Instead of buying at whatever the current market price is, you place an order saying "I\'ll buy YES shares at 45% or better." If the market moves to 45%, your order fills automatically. This is essential for avoiding unfavorable slippage on larger positions.',
    'A core strategy on calibrated markets is to find your "edge" — the gap between your probability estimate and the market price. If you estimate a 70% chance and the market shows 55%, your edge is 15 percentage points. You want to size your bets proportionally to your edge using a formula like the Kelly Criterion: bet (edge / odds) of your bankroll.',
    'The Kelly Criterion for a binary market at price p where you think the true probability is q: bet fraction = (q - p) / (1 - p) of your total bankroll on YES. Half-Kelly (divide the result by 2) is safer and recommended for beginners. Never bet more than you\'d be comfortable losing entirely.',
    'Track your calibration over time — if you say things are 70% likely, do they happen about 70% of the time? PREDICTA Arena\'s calibration chart (on your profile) shows this. Well-calibrated traders are the ones who survive long-term on Kalshi.',
  ],
  3: [
    'A prediction market at 73% means participants believe there is a 73% chance the event happens. To compare this to traditional odds: 73% probability = 1.37x decimal odds = -270 American odds = roughly 4/11 fractional odds. Being able to translate between these systems is essential when you graduate to Kalshi.',
    'Implied probability from American odds: for negative odds like -270, the implied probability is 270 / (270 + 100) = 73%. For positive odds like +140, it\'s 100 / (140 + 100) = 42%. Kalshi displays contracts as percentages directly (like PREDICTA Arena), making this translation less necessary — but you\'ll encounter American odds when comparing to sportsbooks or media coverage.',
    'A key skill is identifying "mispriced" markets — where the crowd\'s probability estimate is wrong. Good sources of edge: you have domain expertise the crowd lacks, you have more recent information, or you can identify systematic biases (markets often overweight recent dramatic events and underweight base rates).',
    'Base rate thinking is powerful: before doing detailed research, ask "how often does this type of event happen historically?" If 80% of incumbents win re-election but the market shows an incumbent at 55%, you have a strong prior reason to bet YES — and then update based on the specific circumstances.',
  ],
  4: [
    'Kalshi is regulated by the CFTC (Commodity Futures Trading Commission) as a designated contract market. This means it operates under federal law, has strict position limits, and offers real legal recourse. To trade on Kalshi you must be a US resident and pass a KYC (Know Your Customer) identity verification.',
    'Kalshi contracts are called "event contracts" and settle to $1 (YES) or $0 (NO) at resolution. Unlike PREDICTA Arena where credits are play money, Kalshi uses real USD. The mechanics are identical — the psychological difference of real money is significant and is one reason practicing with play money first is valuable.',
    'Position limits on Kalshi vary by market. Some high-volume markets allow tens of thousands of dollars in positions; niche markets may limit you to a few hundred. This is different from PREDICTA Arena where there are no hard limits. Be aware that on Kalshi, you may not be able to scale into a position as large as you\'d like.',
    'Market resolution on Kalshi is handled by their resolution team using publicly available sources. Each contract specifies its resolution source in advance (e.g., "Resolves YES if the BLS reports CPI above 3% in the August 2025 release"). Always read the resolution criteria carefully — there are edge cases and contracts can resolve unexpectedly if the criteria are written ambiguously.',
  ],
  5: [
    'Polymarket is a decentralized prediction market running on the Polygon blockchain. Settlements use USDC (a USD-pegged stablecoin). Unlike Kalshi, Polymarket is not available to US residents (officially) due to regulatory reasons. Internationally it has significant liquidity and volume.',
    'XP International (formerly known as several names in the space) and similar platforms operate globally where CFTC regulations don\'t apply. These platforms often have higher liquidity on certain event categories (especially crypto and international politics) than Kalshi. The trade-off is counterparty and platform risk — they are not regulated in the same way.',
    'One major difference: Polymarket uses an order book, not just an AMM. This means you\'ll see bids and asks and can place limit orders at specific prices. Liquidity is concentrated at round numbers (e.g., 50%, 25%, 75%). Learning to read an order book is an important skill, even if PREDICTA Arena and Kalshi primarily use AMM pricing.',
    'For US-based traders, Kalshi is currently the primary legal venue for real-money prediction market trading. The skills you build on PREDICTA Arena — probability estimation, position sizing, calibration tracking, reading resolution criteria — transfer directly to Kalshi. Master them here first.',
  ],
}

function ModuleCard(props: {
  index: number
  module: { title: string; description: string; icon: string }
}) {
  const { index, module } = props
  const [open, setOpen] = useState(false)
  const content = MODULE_CONTENT[index]

  return (
    <div className="bg-canvas-50 border-ink-200 rounded-xl border transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="hover:border-primary-500 flex w-full items-start gap-4 rounded-xl p-5 text-left transition-colors"
      >
        <span className="text-3xl">{module.icon}</span>
        <Col className="flex-1 gap-1">
          <h3 className="text-lg font-semibold">
            Module {index + 1}: {module.title}
          </h3>
          <p className="text-ink-500 text-sm">{module.description}</p>
        </Col>
        <span className="text-ink-400 mt-1 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && content && (
        <Col className="border-ink-200 gap-3 border-t px-5 pb-5 pt-4">
          {content.map((paragraph, i) => (
            <p key={i} className="text-ink-700 text-sm leading-relaxed">
              {paragraph}
            </p>
          ))}
        </Col>
      )}
    </div>
  )
}

function ComparisonCard(props: {
  platform: string
  type: string
  features: string[]
  highlight?: boolean
}) {
  return (
    <Col
      className={`rounded-lg p-4 ${
        props.highlight
          ? 'border-2 border-emerald-500 bg-emerald-500/10'
          : 'bg-canvas-100'
      }`}
    >
      <span className="text-lg font-bold">{props.platform}</span>
      <span className="text-ink-500 mb-2 text-xs">{props.type}</span>
      <ul className="space-y-1">
        {props.features.map((f, i) => (
          <li key={i} className="text-ink-600 text-sm">
            &bull; {f}
          </li>
        ))}
      </ul>
    </Col>
  )
}
