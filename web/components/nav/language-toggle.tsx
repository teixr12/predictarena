import { useLocaleContext } from 'web/lib/locale-context'

export function LanguageToggle() {
  const { locale, setLocale } = useLocaleContext()

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setLocale('en')}
        className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
          locale === 'en'
            ? 'bg-primary-500/20 text-primary-300'
            : 'text-ink-500 hover:text-ink-900'
        }`}
        title="English"
        aria-pressed={locale === 'en'}
      >
        <span role="img" aria-label="English">🇺🇸</span>
        <span>EN</span>
      </button>
      <button
        onClick={() => setLocale('pt-BR')}
        className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
          locale === 'pt-BR'
            ? 'bg-primary-500/20 text-primary-300'
            : 'text-ink-500 hover:text-ink-900'
        }`}
        title="Português (BR)"
        aria-pressed={locale === 'pt-BR'}
      >
        <span role="img" aria-label="Português">🇧🇷</span>
        <span>PT</span>
      </button>
    </div>
  )
}
