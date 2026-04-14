'use client'
import React from 'react'
import { SparklesIcon, TrendingUpIcon, ChartBarIcon } from '@heroicons/react/outline'
import { LogoIcon } from 'web/components/icons/logo-icon'
import { SignUpButton } from 'web/components/buttons/sign-up-button'
import { Col } from 'web/components/layout/col'
import { Row } from 'web/components/layout/row'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

function ValuePropCard(props: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  const { icon, title, description } = props
  return (
    <Col className="border-primary-500/20 bg-canvas-50/50 hover:border-primary-500/40 rounded-2xl border p-6 backdrop-blur-sm transition-colors">
      <div className="text-primary-400 mb-4">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </Col>
  )
}

function StatBadge(props: { value: string; label: string }) {
  return (
    <Col className="items-center gap-1">
      <span className="text-primary-400 text-2xl font-bold">{props.value}</span>
      <span className="text-gray-500 text-xs uppercase tracking-wider">
        {props.label}
      </span>
    </Col>
  )
}

export function LandingPage() {
  const t = useTranslations('landing')
  return (
    <div className="min-h-screen bg-[rgb(13_13_13)] blueprint-grid">
      {/* Nav */}
      <Row className="mx-auto max-w-6xl items-center justify-between px-6 py-4">
        <Row className="items-center gap-2">
          <LogoIcon className="text-primary-400 h-8 w-8" />
          <span className="text-xl font-bold text-white">{t('brandName')}</span>
        </Row>
        <Row className="items-center gap-4">
          <Link
            href="/about"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            {t('navAbout')}
          </Link>
          <Link
            href="/kalshi-prep"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            {t('navKalshiPrep')}
          </Link>
          <Link
            href="/login"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            {t('navSignIn')}
          </Link>
          <SignUpButton className="rounded-lg px-4 py-2 text-sm font-semibold" />
        </Row>
      </Row>

      {/* Hero */}
      <Col className="mx-auto max-w-5xl items-center px-6 pb-24 pt-20 text-center">
        {/* Badge */}
        <Row className="border-primary-500/30 bg-primary-500/10 text-primary-300 mb-6 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
          <SparklesIcon className="h-4 w-4" />
          {t('badge')}
        </Row>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
          {t('headline1')}{' '}
          <span className="text-primary-400">{t('headline2')}</span>
        </h1>

        {/* Subheadline */}
        <p className="text-gray-400 mb-10 max-w-2xl text-xl leading-relaxed">
          {t('subheadline')}
        </p>

        {/* CTA buttons */}
        <Row className="gap-4">
          <SignUpButton className="px-8 py-3 text-base" />
          <Link
            href="/browse"
            className="border-ink-600 text-ink-300 hover:border-ink-400 hover:text-white rounded-lg border px-6 py-3 text-sm font-medium transition-colors"
          >
            {t('browseMarkets')}
          </Link>
        </Row>

        {/* Stats bar */}
        <Row className="border-ink-800 mt-16 w-full max-w-lg justify-around rounded-2xl border px-8 py-6">
          <StatBadge value="500" label={t('statStartingCredits')} />
          <div className="border-ink-700 border-l" />
          <StatBadge value="50" label={t('statDailyBonus')} />
          <div className="border-ink-700 border-l" />
          <StatBadge value="0" label={t('statRealMoney')} />
        </Row>
      </Col>

      {/* Value Props */}
      <div className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">
          {t('whyTitle')}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ValuePropCard
            icon={<ChartBarIcon className="h-8 w-8" />}
            title={t('prop1Title')}
            description={t('prop1Desc')}
          />
          <ValuePropCard
            icon={<TrendingUpIcon className="h-8 w-8" />}
            title={t('prop2Title')}
            description={t('prop2Desc')}
          />
          <ValuePropCard
            icon={<SparklesIcon className="h-8 w-8" />}
            title={t('prop3Title')}
            description={t('prop3Desc')}
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="border-ink-800 border-t py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            {t('howItWorksTitle')}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: t('step1Title'),
                desc: t('step1Desc'),
              },
              {
                step: '02',
                title: t('step2Title'),
                desc: t('step2Desc'),
              },
              {
                step: '03',
                title: t('step3Title'),
                desc: t('step3Desc'),
              },
            ].map((item) => (
              <Col key={item.step} className="gap-3">
                <span className="text-primary-500 font-mono text-3xl font-bold">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </Col>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Bottom */}
      <Col className="border-ink-800 items-center border-t px-6 py-24 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white">
          {t('ctaTitle')}
        </h2>
        <p className="text-gray-400 mb-8 max-w-md">
          {t('ctaSubtitle')}
        </p>
        <SignUpButton className="px-10 py-3 text-base" />
      </Col>

      {/* Footer */}
      <footer className="border-ink-800 border-t px-6 py-8">
        <Row className="mx-auto max-w-6xl items-center justify-between">
          <Row className="items-center gap-2">
            <LogoIcon className="text-primary-500 h-5 w-5" />
            <span className="text-gray-500 text-sm">{t('footerCopyright')}</span>
          </Row>
          <Row className="text-gray-500 gap-6 text-sm">
            <Link href="/about" className="hover:text-white transition-colors">
              {t('footerAbout')}
            </Link>
            <Link
              href="/kalshi-prep"
              className="hover:text-white transition-colors"
            >
              {t('footerKalshiPrep')}
            </Link>
            <Link
              href="/leaderboards"
              className="hover:text-white transition-colors"
            >
              {t('footerLeaderboards')}
            </Link>
            <a
              href="mailto:support@predictarena.com"
              className="hover:text-white transition-colors"
            >
              {t('footerContact')}
            </a>
          </Row>
        </Row>
      </footer>
    </div>
  )
}
