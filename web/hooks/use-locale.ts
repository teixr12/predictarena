import { useCallback, useEffect, useState } from 'react'

export type Locale = 'en' | 'pt-BR'

const SUPPORTED_LOCALES: Locale[] = ['en', 'pt-BR']
const LOCALE_STORAGE_KEY = 'predicta-locale'
const DEFAULT_LOCALE: Locale = 'en'

function isValidLocale(value: unknown): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  const langs = navigator.languages ?? [navigator.language]
  for (const lang of langs) {
    if (lang === 'pt-BR' || lang.startsWith('pt')) return 'pt-BR'
    if (lang.startsWith('en')) return 'en'
  }
  return DEFAULT_LOCALE
}

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isValidLocale(stored)) return stored
  } catch {
    // localStorage not available
  }
  return detectBrowserLocale()
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setLocaleState(readStoredLocale())
  }, [])

  const setLocale = useCallback((next: Locale) => {
    if (!isValidLocale(next)) return
    setLocaleState(next)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      // localStorage not available
    }
  }, [])

  return { locale, setLocale, supportedLocales: SUPPORTED_LOCALES }
}
