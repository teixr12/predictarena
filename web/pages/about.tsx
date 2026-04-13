import {
  ChartBarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
} from '@heroicons/react/outline'
import { Col } from 'web/components/layout/col'
import { Row } from 'web/components/layout/row'
import { Page } from 'web/components/layout/page'
import { SEO } from 'web/components/SEO'
import { Title } from 'web/components/widgets/title'
import { LogoIcon } from 'web/components/icons/logo-icon'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <Page trackPageView={'about page'} className="!col-span-7">
      <SEO
        title="About PREDICTA Arena"
        description="PREDICTA Arena is a play-money prediction market training platform. Practice forecasting risk-free, build your track record, and bridge to real-money platforms like Kalshi and Polymarket."
        url="/about"
      />

      <Col className="mx-auto w-full max-w-3xl gap-8 p-4">
        {/* Header */}
        <Row className="items-center gap-3">
          <LogoIcon className="text-primary-400 h-8 w-8 sm:hidden" />
          <Title className="mb-0">About PREDICTA Arena</Title>
        </Row>

        {/* Mission */}
        <Col className="gap-3">
          <p className="text-ink-700 text-lg leading-relaxed">
            PREDICTA Arena is a <strong>play-money prediction market
            training platform</strong>. We give you 500 free credits to trade
            on real-world events — politics, economics, technology, sports —
            with zero financial risk.
          </p>
          <p className="text-ink-600 text-lg leading-relaxed">
            Once you've built a track record, your{' '}
            <Link href="/foresight-portfolio" className="text-primary-400 hover:underline">
              Foresight Portfolio
            </Link>{' '}
            shows your Kalshi Readiness Rating, accuracy, and top predictions —
            proof of skill you can take to real-money platforms like{' '}
            <strong>Kalshi</strong> and <strong>Polymarket</strong>.
          </p>
        </Col>

        {/* Mission items */}
        <div>
          <h2 className="text-ink-600 mb-4 text-xl font-semibold">Our mission</h2>
          <Col className="gap-3">
            <MissionItem
              icon={<ChartBarIcon className="h-5 w-5" />}
              text="Make forecasting skills accessible — practice the same mechanics used by professional traders, risk-free."
            />
            <MissionItem
              icon={<AcademicCapIcon className="h-5 w-5" />}
              text="Bridge the gap between curiosity and real-money prediction markets with structured training and credentialing."
            />
            <MissionItem
              icon={<ShieldCheckIcon className="h-5 w-5" />}
              text="Build calibrated forecasters who understand probability, not just gut-feeling bettors."
            />
            <MissionItem
              icon={<LightBulbIcon className="h-5 w-5" />}
              text="Help people make better decisions by improving their model of how the future unfolds."
            />
          </Col>
        </div>

        {/* Built on open source */}
        <div className="bg-canvas-50 border-ink-200 rounded-xl border p-5">
          <h2 className="text-ink-700 mb-2 text-lg font-semibold">Built on open source</h2>
          <p className="text-ink-500 text-sm leading-relaxed">
            PREDICTA Arena is built on top of{' '}
            <a
              href="https://github.com/teixr12/predictarena"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:underline"
            >
              Manifold Markets (open source)
            </a>
            , an open-source prediction market platform. We are grateful to the
            Manifold team for building the infrastructure that makes PREDICTA
            Arena possible.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-ink-600 mb-3 text-xl font-semibold">
            Questions or feedback?
          </h2>
          <p className="text-ink-600 text-lg">
            Email us at{' '}
            <a
              href="mailto:support@predictarena.com"
              className="text-primary-400 hover:underline"
            >
              support@predictarena.com
            </a>
            . We read every message.
          </p>
        </div>
      </Col>
    </Page>
  )
}

function MissionItem(props: { icon: React.ReactNode; text: string }) {
  const { icon, text } = props
  return (
    <Row className="items-start gap-3">
      <div className="text-primary-600 mt-0.5 flex-shrink-0">{icon}</div>
      <span className="text-ink-800 text-lg">{text}</span>
    </Row>
  )
}
