import { useTranslations } from 'next-intl'
import { useLocaleContext } from 'web/lib/locale-context'

export function LanguageToggle() {
  const t = useTranslations('language')
  const { locale, setLocale } = useLocaleContext()

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'pt-BR' : 'en')}
      className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors"
      title={t('toggle')}
    >
      {locale === 'en' ? '🇧🇷 PT' : '🇺🇸 EN'}
    </button>
  )
}
