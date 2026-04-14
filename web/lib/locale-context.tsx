import { createContext, useContext } from 'react'
import { Locale } from 'web/hooks/use-locale'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
})

export function useLocaleContext() {
  return useContext(LocaleContext)
}
