import { ENV_CONFIG, TRADE_TERM } from 'common/envs/constants'
import { capitalize } from 'lodash'
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl'
import type { AppProps } from 'next/app'
import { Figtree } from 'next/font/google'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect, useState } from 'react'
import { AuthProvider, AuthUser } from 'web/components/auth-context'
import { ErrorBoundary } from 'web/components/error-boundary'
import { NativeMessageProvider } from 'web/components/native-message-provider'
import { Sweepstakes } from 'web/components/sweepstakes-provider'
import { useLocale } from 'web/hooks/use-locale'
import { LocaleContext } from 'web/lib/locale-context'
import { OptimisticEntitlementsProvider } from 'web/hooks/use-optimistic-entitlements'
import { useHasLoaded } from 'web/hooks/use-has-loaded'
import { useIOSBodyFix } from 'web/hooks/use-ios-body-fix'
import { useMobileScrollRestoration } from 'web/hooks/use-mobile-scroll-restoration'
import { useRefreshAllClients } from 'web/hooks/use-refresh-all-clients'
import { ThemeProvider } from 'web/hooks/use-theme'
import { GoogleOneTapSetup } from 'web/lib/firebase/google-onetap-login'
import { getIsNative } from 'web/lib/native/is-native'
import { postMessageToNative } from 'web/lib/native/post-message'
import { DevtoolsDetector, setupDevtoolsDetector } from 'web/lib/util/devtools'
import '../styles/globals.css'
// See https://nextjs.org/docs/basic-features/font-optimization#google-fonts
// and if you add a font, you must add it to tailwind config as well for it to work.

const mainFont = Figtree({
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-main',
  subsets: ['latin'],
})

function firstLine(msg: string) {
  const newlineIndex = msg.indexOf('\n')
  if (newlineIndex === -1) {
    return msg
  }
  return msg.substring(0, newlineIndex)
}

// It can be very hard to see client logs on native, so send them manually
if (getIsNative()) {
  const log = console.log.bind(console)
  console.log = (...args) => {
    postMessageToNative('log', { args })
    log(...args)
  }
  console.error = (...args) => {
    postMessageToNative('log', { args })
    log(...args)
  }
}

function printBuildInfo() {
  // These are undefined if e.g. dev server
  if (process.env.NEXT_PUBLIC_VERCEL_ENV) {
    const env = process.env.NEXT_PUBLIC_VERCEL_ENV
    const msg = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE
    const owner = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER
    const repo = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG
    const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
    const url = `https://github.com/${owner}/${repo}/commit/${sha}`
    console.info(`Build: ${env} / ${firstLine(msg || '???')} / ${url}`)
  }
}

// ian: Required by GambleId
const useDevtoolsDetector = () => {
  const [_, setDetector] = useState<DevtoolsDetector | null>(null)
  const [isDevtoolsOpen, setIsDevtoolsOpen] = useState(false)

  useEffect(() => {
    const ignore =
      window.location.host === 'localhost:3000' ||
      process.env.NEXT_PUBLIC_FIREBASE_ENV === 'DEV'

    if (ignore) {
      return
    }
    const devtoolsDetector = setupDevtoolsDetector()
    setDetector(devtoolsDetector)

    devtoolsDetector.config.onDetectOpen = () => {
      setIsDevtoolsOpen(true)
    }

    // Start detecting right away
    devtoolsDetector.paused = false

    return () => {
      // Pause the detector when component unmounts
      devtoolsDetector.paused = true
    }
  }, [])
  return isDevtoolsOpen
}

// Statically import all message files — no dynamic FS access, no user input in paths
const messagesByLocale = {
  en: () => import('web/messages/en.json'),
  'pt-BR': () => import('web/messages/pt-BR.json'),
} as const

// specially treated props that may be present in the server/static props
type PredictaPageProps = { auth?: AuthUser }

function MyApp({ Component, pageProps }: AppProps<PredictaPageProps>) {
  useEffect(printBuildInfo, [])
  useHasLoaded()
  useRefreshAllClients()
  useIOSBodyFix()
  useMobileScrollRestoration()

  const { locale, setLocale } = useLocale()
  const [messages, setMessages] = useState<AbstractIntlMessages>({})
  useEffect(() => {
    messagesByLocale[locale]().then((mod) => setMessages(mod.default ?? mod))
  }, [locale])

  // ian: Required by GambleId
  const devToolsOpen = false //useDevtoolsDetector()
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      ;(window as any).dataLayer?.push({
        event: 'page_view',
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
        'gtm.start': new Date().getTime(),
      })
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  const title = 'PREDICTA Arena'
  const description = `The safe simulator that trains you for Kalshi & Polymarket. ${capitalize(
    TRADE_TERM
  )} on news, politics, tech, & AI with play money. Build your forecasting skills risk-free.`

  return (
    <>
      <Head>
        <title>{title}</title>

        <meta
          property="og:title"
          name="twitter:title"
          content={title}
          key="title"
        />
        <meta name="description" content={description} key="description1" />
        <meta
          property="og:description"
          name="twitter:description"
          content={description}
          key="description2"
        />
        <meta property="og:url" content="https://predictarena.com" key="url" />
        <meta property="og:site_name" content="PREDICTA Arena" />
        <meta name="twitter:card" content="summary" key="card" />
        <meta name="twitter:site" content="@predictarena" />
        <meta
          name="twitter:image"
          content="https://predictarena.com/logo.png"
          key="image2"
        />
        <meta
          property="og:image"
          content="https://predictarena.com/logo-cover.png"
          key="image1"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover user-scalable=no"
        />
        {/* set safari overscroll/address bar to canvas-0 */}
        <meta
          name="theme-color"
          content="#0a0e14"
          media="(prefers-color-scheme: dark)"
        />
        <meta
          name="theme-color"
          content="#fdfeff"
          media="(prefers-color-scheme: light)"
        />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <style>
        {`html {
          --font-main: ${mainFont.style.fontFamily};
        }`}
      </style>

      {/*
        ian: It would be nice to find a way to let people take screenshots of a crash + console log.
        One idea: just disable them for !user.sweepstakesVerified users.
        */}
      <ErrorBoundary>
        <LocaleContext.Provider value={{ locale, setLocale }}>
          <NextIntlClientProvider
            locale={locale}
            messages={messages}
            onError={() => {}} // suppress missing-key warnings during hydration
          >
            {devToolsOpen ? (
              <div
                className={
                  'flex h-screen flex-col items-center justify-center p-4'
                }
              >
                Developer tools are disabled. Please close them and refresh.
              </div>
            ) : (
              <ThemeProvider>
                <AuthProvider serverUser={pageProps.auth}>
                  <OptimisticEntitlementsProvider>
                    <Sweepstakes>
                      <NativeMessageProvider>
                        <Component {...pageProps} />
                      </NativeMessageProvider>
                    </Sweepstakes>
                  </OptimisticEntitlementsProvider>
                </AuthProvider>
              </ThemeProvider>
            )}
          </NextIntlClientProvider>
        </LocaleContext.Provider>
      </ErrorBoundary>

      <GoogleOneTapSetup />

      {/* Umami analytics */}
      <Script
        src="https://analytics.umami.is/script.js"
        data-website-id="ee5d6afd-5009-405b-a69f-04e3e4e3a685"
      />

      {/* Google Analytics 4 — add G-XXXXXXXXXX to common/src/envs/prod.ts googleAnalyticsId */}
      {ENV_CONFIG.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ENV_CONFIG.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ENV_CONFIG.googleAnalyticsId}');
            `}
          </Script>
        </>
      )}
    </>
  )
}

export default MyApp
