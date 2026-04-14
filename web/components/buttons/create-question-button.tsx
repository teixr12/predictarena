import { ColorType, SizeType, buttonClass } from './button'
import clsx from 'clsx'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export const CreateQuestionButton = (props: {
  className?: string
  color?: ColorType
  size?: SizeType
}) => {
  const { className, color, size } = props
  const t = useTranslations('create')
  return (
    <Link
      href="/create"
      className={clsx(
        buttonClass(size ?? 'xl', color ?? 'indigo-outline'),
        'whitespace-nowrap',
        className
      )}
    >
      <span>{t('pageTitle')}</span>
    </Link>
  )
}
