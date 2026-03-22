import { useState } from 'react'
import { useUser } from 'web/hooks/use-user'
import { ForesightPDFButton } from './foresight-pdf'
import { Button } from 'web/components/buttons/button'
import { Col } from 'web/components/layout/col'
import { Row } from 'web/components/layout/row'
import { formatMoney } from 'common/util/format'
import { api } from 'web/lib/api/api'

export type ForesightData = {
  accuracy: number // 0-100
  kalshiReadiness: number // 0-100
  totalResolved: number
  totalProfit: number
  bettingStreak: number
  topPredictions: Array<{
    question: string
    profit: number
    outcome: string
    date: string
  }>
  calibration: {
    bucket: string
    predicted: number
    actual: number
  }[]
}

function computeKalshiReadiness(data: {
  accuracy: number
  totalResolved: number
  streak: number
  calibrationScore: number
}): number {
  const accuracyScore = Math.min(data.accuracy, 100) * 0.4
  const volumeScore = Math.min(data.totalResolved / 50, 1) * 100 * 0.2
  const streakScore = Math.min(data.streak / 30, 1) * 100 * 0.2
  const calibScore = data.calibrationScore * 0.2
  return Math.round(accuracyScore + volumeScore + streakScore + calibScore)
}

function ReadinessGauge({ score }: { score: number }) {
  const color =
    score >= 75
      ? 'text-emerald-400'
      : score >= 50
      ? 'text-yellow-400'
      : 'text-red-400'
  const label =
    score >= 75
      ? 'Ready for Real Markets'
      : score >= 50
      ? 'Getting There'
      : 'Keep Practicing'

  return (
    <Col className="items-center gap-2">
      <div className={`text-5xl font-bold ${color}`}>{score}</div>
      <div className="text-ink-500 text-sm">Kalshi Readiness Rating</div>
      <div className={`text-sm font-medium ${color}`}>{label}</div>
    </Col>
  )
}

export function ForesightPortfolioButton(props: {
  resolvedCount: number
  userId: string
}) {
  const { resolvedCount, userId } = props
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ForesightData | null>(null)
  const [showModal, setShowModal] = useState(false)

  if (resolvedCount < 10) return null

  const generatePortfolio = async () => {
    setLoading(true)
    try {
      // Fetch calibration data
      const calibration = await api('get-user-calibration', { userId })
      // Fetch portfolio metrics
      const metricsResp = await api(
        'get-user-contract-metrics-with-contracts',
        {
          userId,
          limit: 100,
          offset: 0,
        }
      )

      const resolvedMetrics = (metricsResp as any[]).filter(
        (m: any) => m.contract?.resolution
      )

      const winCount = resolvedMetrics.filter(
        (m: any) => m.profit > 0
      ).length
      const accuracy =
        resolvedMetrics.length > 0
          ? Math.round((winCount / resolvedMetrics.length) * 100)
          : 0

      const topPredictions = resolvedMetrics
        .sort((a: any, b: any) => b.profit - a.profit)
        .slice(0, 5)
        .map((m: any) => ({
          question: m.contract?.question || 'Unknown',
          profit: m.profit,
          outcome: m.contract?.resolution || 'N/A',
          date: m.contract?.resolutionTime
            ? new Date(m.contract.resolutionTime).toLocaleDateString()
            : 'N/A',
        }))

      const totalProfit = resolvedMetrics.reduce(
        (sum: number, m: any) => sum + (m.profit || 0),
        0
      )

      const calibrationBuckets = (calibration as any)?.points || []
      const calibScore =
        calibrationBuckets.length > 0
          ? Math.round(
              (1 -
                calibrationBuckets.reduce(
                  (sum: number, b: any) =>
                    sum + Math.abs(b.predicted - b.actual),
                  0
                ) /
                  calibrationBuckets.length) *
                100
            )
          : 50

      const kalshiReadiness = computeKalshiReadiness({
        accuracy,
        totalResolved: resolvedCount,
        streak: 0,
        calibrationScore: calibScore,
      })

      setData({
        accuracy,
        kalshiReadiness,
        totalResolved: resolvedCount,
        totalProfit,
        bettingStreak: 0,
        topPredictions,
        calibration: calibrationBuckets,
      })
      setShowModal(true)
    } catch (e) {
      console.error('Failed to generate portfolio:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={generatePortfolio}
        loading={loading}
        color="green"
        size="lg"
        className="font-semibold"
      >
        Generate Foresight Portfolio
      </Button>

      {showModal && data && (
        <ForesightPortfolioModal
          data={data}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

function ForesightPortfolioModal(props: {
  data: ForesightData
  onClose: () => void
}) {
  const { data, onClose } = props
  const user = useUser()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Col className="bg-canvas-0 border-ink-200 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border p-6">
        {/* Header */}
        <Row className="mb-6 items-center justify-between">
          <Col>
            <h2 className="text-2xl font-bold text-emerald-400">
              Foresight Portfolio
            </h2>
            <p className="text-ink-500 text-sm">
              {user?.name} &middot; Generated{' '}
              {new Date().toLocaleDateString()}
            </p>
          </Col>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-600 text-2xl"
          >
            &times;
          </button>
        </Row>

        {/* Readiness Score */}
        <div className="bg-canvas-50 mb-6 rounded-xl p-6 text-center">
          <ReadinessGauge score={data.kalshiReadiness} />
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <StatCard
            label="Accuracy"
            value={`${data.accuracy}%`}
            color="text-emerald-400"
          />
          <StatCard
            label="Markets Resolved"
            value={String(data.totalResolved)}
            color="text-blue-400"
          />
          <StatCard
            label="Total Profit"
            value={formatMoney(data.totalProfit)}
            color={
              data.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
            }
          />
        </div>

        {/* Top Predictions */}
        <Col className="mb-6">
          <h3 className="mb-3 text-lg font-semibold">Top Predictions</h3>
          {data.topPredictions.map((pred, i) => (
            <Row
              key={i}
              className="border-ink-200 items-center justify-between border-b py-2"
            >
              <Col className="flex-1">
                <span className="text-ink-800 text-sm font-medium">
                  {pred.question.slice(0, 60)}
                  {pred.question.length > 60 ? '...' : ''}
                </span>
                <span className="text-ink-500 text-xs">
                  Resolved {pred.outcome} &middot; {pred.date}
                </span>
              </Col>
              <span
                className={`font-semibold ${
                  pred.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {pred.profit >= 0 ? '+' : ''}
                {formatMoney(pred.profit)}
              </span>
            </Row>
          ))}
        </Col>

        {/* PDF Download */}
        {user && (
          <ForesightPDFButton
            data={{
              username: user.username,
              readinessScore: data.kalshiReadiness,
              readinessLabel:
                data.kalshiReadiness >= 75
                  ? 'Ready for Real Markets'
                  : data.kalshiReadiness >= 50
                  ? 'Getting There'
                  : 'Keep Practicing',
              accuracy: data.accuracy,
              resolvedCount: data.totalResolved,
              totalProfit: data.totalProfit,
              topPredictions: data.topPredictions.map((p) => ({
                question: p.question,
                profit: p.profit,
              })),
              generatedDate: new Date().toLocaleDateString(),
            }}
          />
        )}

        {/* Actions */}
        <Row className="gap-3">
          <Button onClick={onClose} color="gray" className="flex-1">
            Close
          </Button>
        </Row>
      </Col>
    </div>
  )
}

function StatCard(props: {
  label: string
  value: string
  color: string
}) {
  return (
    <Col className="bg-canvas-50 items-center rounded-lg p-3">
      <span className={`text-2xl font-bold ${props.color}`}>
        {props.value}
      </span>
      <span className="text-ink-500 text-xs">{props.label}</span>
    </Col>
  )
}
