import clsx from 'clsx'

import { firebaseLogin } from 'web/lib/firebase/users'
import { Button } from './button'
import { PlayMoneyDisclaimer } from '../play-money-disclaimer'
import { Col } from '../layout/col'
import { Row } from 'web/components/layout/row'
import { useTranslations } from 'next-intl'

export const SidebarSignUpButton = (props: { className?: string }) => {
  const { className } = props
  const t = useTranslations('auth')

  return (
    <Col className={clsx('mt-4', className)}>
      <Button
        color="gradient"
        size="xl"
        onClick={firebaseLogin}
        className="w-full"
      >
        {t('signUp')}
      </Button>
      <PlayMoneyDisclaimer />
    </Col>
  )
}

export const SignUpButton = (props: { className?: string }) => {
  const { className } = props
  const t = useTranslations('auth')

  return (
    <Button
      color="gradient"
      size="md"
      onClick={firebaseLogin}
      className={className}
    >
      {t('signUp')}
    </Button>
  )
}

export const GoogleSignInButton = (props: { onClick: () => any }) => {
  const t = useTranslations('auth')

  return (
    <Button
      onClick={props.onClick}
      color={'gradient-pink'}
      size={'lg'}
      className=" whitespace-nowrap  shadow-sm outline-2 "
    >
      <Row className={'items-center gap-2 p-2'}>
        <img
          src="/google.svg"
          alt=""
          width={24}
          height={24}
          className="rounded-full bg-white"
        />
        <span>{t('signInWithGoogle')}</span>
      </Row>
    </Button>
  )
}
