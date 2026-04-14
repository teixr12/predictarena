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
import { useTranslations } from 'next-intl'

export default function AboutPage() {
  const t = useTranslations('about')
  return (
    <Page trackPageView={'about page'} className="!col-span-7">
      <SEO
        title={t('seoTitle')}
        description={t('seoDescription')}
        url="/about"
      />

      <Col className="mx-auto w-full max-w-3xl gap-8 p-4">
        {/* Header */}
        <Row className="items-center gap-3">
          <LogoIcon className="text-primary-400 h-8 w-8 sm:hidden" />
          <Title className="mb-0">{t('pageTitle')}</Title>
        </Row>

        {/* Mission */}
        <Col className="gap-3">
          <p className="text-ink-700 text-lg leading-relaxed">
            {t('intro1')}
          </p>
          <p className="text-ink-600 text-lg leading-relaxed">
            {t('intro2part1')}{' '}
            <Link href="/foresight-portfolio" className="text-primary-400 hover:underline">
              {t('intro2foresightPortfolio')}
            </Link>{' '}
            {t('intro2part2')}{' '}
            <strong>{t('intro2Kalshi')}</strong> {t('intro2and')} <strong>{t('intro2Polymarket')}</strong>.
          </p>
        </Col>

        {/* Mission items */}
        <div>
          <h2 className="text-ink-600 mb-4 text-xl font-semibold">{t('missionTitle')}</h2>
          <Col className="gap-3">
            <MissionItem
              icon={<ChartBarIcon className="h-5 w-5" />}
              text={t('mission1')}
            />
            <MissionItem
              icon={<AcademicCapIcon className="h-5 w-5" />}
              text={t('mission2')}
            />
            <MissionItem
              icon={<ShieldCheckIcon className="h-5 w-5" />}
              text={t('mission3')}
            />
            <MissionItem
              icon={<LightBulbIcon className="h-5 w-5" />}
              text={t('mission4')}
            />
          </Col>
        </div>

        {/* Built on open source */}
        <div className="bg-canvas-50 border-ink-200 rounded-xl border p-5">
          <h2 className="text-ink-700 mb-2 text-lg font-semibold">{t('openSourceTitle')}</h2>
          <p className="text-ink-500 text-sm leading-relaxed">
            {t('openSourceText1')}{' '}
            <a
              href="https://github.com/teixr12/predictarena"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:underline"
            >
              {t('openSourceLink')}
            </a>
            {t('openSourceText2')}
          </p>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-ink-600 mb-3 text-xl font-semibold">
            {t('contactTitle')}
          </h2>
          <p className="text-ink-600 text-lg">
            {t('contactText1')}{' '}
            <a
              href="mailto:support@predictarena.com"
              className="text-primary-400 hover:underline"
            >
              support@predictarena.com
            </a>
            {t('contactText2')}
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
