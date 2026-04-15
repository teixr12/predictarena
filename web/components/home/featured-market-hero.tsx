import clsx from 'clsx'
import Link from 'next/link'
import { Contract, BinaryContract, contractPath } from 'common/contract'
import { getDisplayProbability } from 'common/calculate'
import { formatPercentShort } from 'common/util/format'
import { useAPIGetter } from 'web/hooks/use-api-getter'
import { useLiveContract } from 'web/hooks/use-contract'
import { useUser } from 'web/hooks/use-user'
import { Col } from 'web/components/layout/col'
import { Row } from 'web/components/layout/row'
import { BetButton } from 'web/components/bet/feed-bet-button'
import { FeedBinaryChart } from 'web/components/feed/feed-chart'
import { TopicTag } from 'web/components/topics/topic-tag'

function HeroSkeleton() {
  return (
    <div className="bg-canvas-50 border-canvas-100 animate-pulse rounded-2xl border p-6">
      <div className="bg-ink-300 mb-4 h-4 w-20 rounded-full" />
      <div className="bg-ink-300 mb-2 h-8 w-3/4 rounded" />
      <div className="bg-ink-300 mb-6 h-8 w-1/2 rounded" />
      <div className="bg-ink-300 mb-4 h-32 w-full rounded-lg" />
      <div className="flex gap-3">
        <div className="bg-ink-300 h-10 w-32 rounded-lg" />
        <div className="bg-ink-300 h-10 w-32 rounded-lg" />
      </div>
    </div>
  )
}

export function FeaturedMarketHero() {
  const user = useUser()
  const { data: markets } = useAPIGetter(
    'search-markets-full',
    {
      sort: 'score',
      filter: 'open',
      limit: 3,
      contractType: 'BINARY',
      token: 'MANA',
    }
  )

  // Pick the top market
  const topContract = markets?.[0]

  if (markets && markets.length === 0) return null
  if (!topContract) return <HeroSkeleton />

  return <HeroCard contract={topContract} user={user} />
}

function HeroCard(props: { contract: Contract; user: any }) {
  const { user } = props
  const contract = useLiveContract(props.contract)
  const path = contractPath(contract)
  const isBinary =
    contract.outcomeType === 'BINARY' && contract.mechanism === 'cpmm-1'
  // Safe cast: we only fetch BINARY contracts
  const prob = isBinary
    ? getDisplayProbability(contract as BinaryContract)
    : undefined
  const probFormatted = prob != null ? formatPercentShort(prob) : null
  const probChange =
    'probChanges' in contract ? contract.probChanges?.day : undefined

  const { data: groups } = useAPIGetter('market/:contractId/groups', {
    contractId: contract.id,
  })
  const firstTopic = groups?.[0]

  return (
    <Col className="mb-4">
      <Link href={path} className="group">
        <Col
          className={clsx(
            'bg-canvas-50 border-canvas-100 hover:border-primary-400/40',
            'rounded-2xl border p-5 transition-colors',
            'hover:ring-1 ring-primary-400/30'
          )}
        >
          {/* Topic tag */}
          {firstTopic && (
            <Row className="mb-3">
              <TopicTag
                topic={firstTopic}
                location="feed card"
                className="text-xs"
              />
            </Row>
          )}

          {/* Question + Probability */}
          <Row className="w-full items-start justify-between gap-4">
            <h2 className="text-ink-1000 text-xl font-bold leading-snug sm:text-2xl">
              {contract.question}
            </h2>
            <Col className="shrink-0 items-end">
              {probFormatted && (
                <span className="text-primary-500 text-4xl font-bold font-mono tabular-nums">
                  {probFormatted}
                </span>
              )}
              {probChange != null && probChange !== 0 && (
                <span
                  className={clsx(
                    'text-xs font-medium',
                    probChange > 0 ? 'text-teal-500' : 'text-scarlet-500'
                  )}
                >
                  {probChange > 0 ? '+' : ''}
                  {Math.round(probChange)}% today
                </span>
              )}
            </Col>
          </Row>

          {/* Chart */}
          {isBinary && (
            <div className="mt-4 h-32 w-full">
              <FeedBinaryChart
                contract={contract as BinaryContract}
                className="h-full"
              />
            </div>
          )}

          {/* Bottom row: bet buttons + stats */}
          <Row className="mt-4 items-center justify-between">
            {isBinary && (
              <div onClick={(e) => e.preventDefault()}>
                <BetButton
                  contract={contract as BinaryContract}
                  user={user}
                  className="flex gap-2"
                />
              </div>
            )}
            <Row className="text-ink-500 gap-4 text-sm">
              {contract.uniqueBettorCount != null && (
                <span>{contract.uniqueBettorCount} traders</span>
              )}
            </Row>
          </Row>
        </Col>
      </Link>
    </Col>
  )
}
