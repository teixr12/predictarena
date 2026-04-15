import clsx from 'clsx'
import Link from 'next/link'
import { Contract, contractPath } from 'common/contract'
import { getDisplayProbability } from 'common/calculate'
import { formatPercentShort } from 'common/util/format'
import { useAPIGetter } from 'web/hooks/use-api-getter'
import { useTrendingTopics } from 'web/components/search/query-topics'
import { Col } from 'web/components/layout/col'
import { Row } from 'web/components/layout/row'
import { removeEmojis } from 'common/util/string'

function PanelSkeleton() {
  return (
    <Col className="gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-ink-300 mb-1 h-4 w-full rounded" />
          <div className="bg-ink-300 h-4 w-1/3 rounded" />
        </div>
      ))}
    </Col>
  )
}

function TrendingMarketRow(props: { contract: Contract }) {
  const { contract } = props
  const path = contractPath(contract)
  const isBinary = contract.outcomeType === 'BINARY'
  const prob = isBinary ? getDisplayProbability(contract) : null
  const probFormatted = prob != null ? formatPercentShort(prob) : null
  const probChange =
    'probChanges' in contract ? contract.probChanges?.day : undefined

  return (
    <Link
      href={path}
      className={clsx(
        'border-canvas-100 hover:bg-canvas-100/50 group',
        'block rounded-lg border px-3 py-2.5 transition-colors'
      )}
    >
      <Row className="items-start justify-between gap-2">
        <span className="text-ink-900 line-clamp-2 text-sm leading-snug group-hover:text-white">
          {contract.question}
        </span>
        {probFormatted && (
          <Col className="shrink-0 items-end">
            <span className="text-primary-500 text-sm font-bold font-mono tabular-nums">
              {probFormatted}
            </span>
            {probChange != null && probChange !== 0 && (
              <span
                className={clsx(
                  'text-xs',
                  probChange > 0 ? 'text-teal-500' : 'text-scarlet-500'
                )}
              >
                {probChange > 0 ? '+' : ''}
                {Math.round(probChange)}%
              </span>
            )}
          </Col>
        )}
      </Row>
    </Link>
  )
}

export function TrendingMarketsPanel() {
  const { data: markets } = useAPIGetter(
    'search-markets-full',
    {
      sort: 'freshness-score',
      filter: 'open',
      limit: 8,
      token: 'MANA',
    }
  )

  const trendingTopics = useTrendingTopics(10, 'right-panel-trending')

  return (
    <Col className="gap-6 pb-8">
      {/* Trending Markets Section */}
      <Col className="gap-2">
        <Row className="items-center gap-2 px-1">
          <span className="text-lg">🔥</span>
          <h3 className="text-ink-900 text-sm font-bold uppercase tracking-wider">
            Trending
          </h3>
        </Row>
        {!markets ? (
          <PanelSkeleton />
        ) : (
          <Col className="gap-1.5">
            {markets.map((contract) => (
              <TrendingMarketRow key={contract.id} contract={contract} />
            ))}
          </Col>
        )}
      </Col>

      {/* Hot Topics Section */}
      {trendingTopics && trendingTopics.length > 0 && (
        <Col className="gap-2">
          <Row className="items-center gap-2 px-1">
            <span className="text-lg">🏆</span>
            <h3 className="text-ink-900 text-sm font-bold uppercase tracking-wider">
              Hot Topics
            </h3>
          </Row>
          <div className="flex flex-wrap gap-1.5">
            {trendingTopics.slice(0, 12).map((topic) => (
              <Link
                key={topic.id}
                href={`/browse?tf=${topic.slug}`}
                className={clsx(
                  'bg-canvas-50 border-canvas-100 hover:border-primary-400/40 hover:text-primary-400',
                  'text-ink-600 rounded-full border px-3 py-1 text-xs font-medium transition-colors'
                )}
              >
                {removeEmojis(topic.name)}
              </Link>
            ))}
          </div>
        </Col>
      )}
    </Col>
  )
}
